<template>
  <div>
    <div id="exportContainer">
      <!-- Cesium 地图容器 -->
      <div id="cesiumContainer" class="situation_cesiumContainer"></div>
      <!--  指南针  -->
      <div class="compassContainer" ref="compassContainer"></div>
      <!-- 图例 -->
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'EarthquakeCasualties'">
        <p style="color: white; text-align: left; margin: 5px 0; font-size: 15px;">余震次数累计：</p>
        <div class="legend_item" v-for="(item, index) in getLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;font-size: 15px">累积受伤人数：</p>
        <div class="legend_item" v-for="(item, index) in injuredLegendData" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;">转移安置人数：</p>
        <div class="legend_item" v-for="(item, index) in transferredImgLegendData" :key="index">
          <img :src="item.img" class="block-img" alt="icon" style="height: 20px;margin-right: 7px;margin-left: 5px"/>
          {{ item.name }}
        </div>
      </el-form>
      <!-- ECharts 图表容器 -->
      <div v-for="(location, index) in locations" :key="index" class="echarts-container" ref="echartsContainer"
           :id="'echartsContainer' + index"></div>
    </div>

    <!-- 添加一个按钮用于导出 -->
    <button @click="exportCesiumScene" class="export-button">导出专题图</button>
    <!-- 加载中的提示 -->
    <div v-if="loading" class="loading-container">
      <p>正在导出，请稍候...</p>
    </div>
    <!--    两个列表   -->
    <el-row :gutter="10" class="listContainer">
      <el-col :span="1.5">
        <el-select
            v-model="eqlistName"
            placeholder="请选择地震信息"
            size="large"
            style="width: 370px"
            filterable
            @change="handleEqListChange"
        >
          <el-option
              v-for="item in this.tableNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-select
            v-model="selectedComponentKey"
            placeholder="请选择模块"
            size="large"
            @change="handleComponentChange"
            style="width: 220px"
        >
          <el-option
              v-for="option in this.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-col>
      <!-- 动态组件显示 -->
    </el-row>
    <!-- 预览图片的 div -->
    <div v-if="previewImage" class="preview-container">
      <div class="export-image">
        <div class="export-info">
          <p>{{ exportTitle }}</p>
        </div>
        <div class="main_coantainer">
          <div class="top_container">
            <div class="box"></div>
            <div class="top"></div>
            <div class="box"></div>
          </div>
          <div class="middow">
            <div class="left"></div>
            <div class="main">
              <img :src="previewImage" alt="导出图片">
            </div>
            <div class="right"></div>
          </div>
          <div class="bottom_container">
            <div class="box"></div>
            <div class="bottom"></div>
            <div class="box"></div>
          </div>
        </div>
        <div
            style="font-size:14px ;padding: 0; width: 100%; margin-top: 0; background-color: white; display: flex; justify-content: space-between; align-items: center; text-align: center;">
          <p style="flex: 1; text-align: left; margin-left: 10px;"></p>
          <p style="flex: 1; text-align: center;">制作时间：{{ pictureCreateTime }}</p>
          <p style="flex: 1; text-align: right; margin-right: 10px;">版本：专业版</p>
        </div>

      </div>
      <div class="preview-buttons">
        <button @click="downloadImage" class="download-button">下载</button>
        <button @click="closePreview" class="cancel-button">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';
import * as echarts from 'echarts';
import {initCesium} from '@/cesium/tool/initCesium.js';
import {getExcelUploadEarthquake} from "@/api/system/eqlist.js";
import html2canvas from "html2canvas";
import yaan from '@/assets/geoJson/yaan.json'
import cumulativeTransferredImg from '@/assets/images/cumulativeTransferred.png'
import earthQuakeCenterImg from '@/assets/icons/TimeLine/震中.png'
import {getTotal as getAftershock} from "@/api/system/statistics";
import {getCasualty} from "@/api/system/casualtystats" ;
import {getTransferInfo} from "@/api/system/relocation";
import {TianDiTuToken} from "@/cesium/tool/config.js";

export default {
  data() {
    return {
      viewer: null, // 保存 Cesium Viewer
      pollingInterval: null, // 保存轮询定时器的引用

      //-------echarts所用到的-----------
      //下面是各个模块的echarts图例数据
      echartsLegendData: [
        {
          name: 'EarthquakeCasualties',
          data: [
            {name: '3.0-3.9级', color: '#2c933e'},
            {name: '4.0-4.9级', color: '#ff6d39'},
            {name: '5.0-5.9级', color: '#53a8ff'},
            {name: '6.0级以上', color: '#ff7c88'},
          ]
        },
        {
          name: 'TransportationElectricity',
          data: []
        },
      ],
      locations: [
        {name: '雨城区', longitude: 103.0, latitude: 29.87},
        {name: '名山区', longitude: 103.22, latitude: 30.15},
        {name: '荥经县', longitude: 102.77, latitude: 29.71},
        {name: '汉源县', longitude: 102.71, latitude: 29.38},
        {name: '石棉县', longitude: 102.29, latitude: 29.27},
        {name: '天全县', longitude: 102.47, latitude: 30.11},
        {name: '芦山县', longitude: 103.029, latitude: 30.41},
        {name: '宝兴县', longitude: 102.75, latitude: 30.52}
      ],
      echartsInstances: [],

      //----------地震选择列表------------
      eqlists: [],
      eqlistName: '',
      eqid: '',
      tableNameOptions: [],
      selectedComponentKey: 'EarthquakeCasualties',
      options: [
        {label: '震情伤亡信息专题图', value: 'EarthquakeCasualties'},
        {label: '交通电力通信信息专题图', value: 'TransportationElectricity'}
      ],

      //---------板块颜色------------
      dataSource: null,//这个别的也能用
      injuredLegendData: [
        {name: '0-50人', color: '#ffb3b3', range: [0, 50]},// 非常浅的红色
        // {name: '10-20人', color: '#ff6666'},// 浅红色
        // {name: '20-50人', color: '#ff4d4d'},// 略深的红色
        {name: '50-200人', color: '#ff3333', range: [51, 200]},// 中等红色
        // {name: '100-500人', color: '#ff1a1a'},// 深红色
        // {name: '500-1000人', color: '#e60000'},// 更深的红色
        {name: '>200人', color: '#b30000', range: [201, Infinity]},// 深红带棕
        // {name: '>2000人', color: '#800000'}, // 非常深的红色
      ],

      //----------转移安置，地图上图标----------
      transferredImgLegendData: [
        {name: '转移安置人数', img: cumulativeTransferredImg}
      ],
      transferLocations: [
        {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
        {name: '名山区', longitude: 103.31, latitude: 30.17},  // 向西南偏移
        {name: '荥经县', longitude: 102.55, latitude: 29.79},  // 向东北偏移
        {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
        {name: '石棉县', longitude: 102.35, latitude: 29.0},  // 向东北偏移
        {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
        {name: '芦山县', longitude: 103.10, latitude: 30.56},  // 向西偏移
        {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
      ],

      //-----------导出图片----------------
      previewImage: null, // 保存预览图片的 URL
      loading: false, // 控制加载状态
      exportTitle: '震情伤亡信息专题图',
      pictureCreateTime: '',
      // 导出图片时经纬度线
      rectangleBounds: [],//按东南西北的顺序存储
      latLonEntities: [], // 用于存储经纬度线实体的数组
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      topStart: null,
      topEnd: null,
      leftStart: null,
      leftEnd: null,
      step: 0.5,
      divBoxCount: 0,
      flexPercentages: [],
      points: [],
      hasGeneratedPoints: false,
    };
  },
  mounted() {
    // 初始化地图
    this.init();
    // 启动轮询获取后端数据
    this.startPolling();
    // 加载雅安边界线
    this.loadYaAnBoundary();
  },
  beforeDestroy() {
    // 在组件销毁时清除轮询
    this.stopPolling();
  },
  methods: {
    // 初始化控件等
    init() {
      this.viewer = initCesium(Cesium);

      this.$nextTick(() => {
        const cesiumContainer = document.getElementById('cesiumContainer');
        if (cesiumContainer) {
          cesiumContainer.setAttribute('id', 'cesiumContainerWithId');
        }
      });

      this.viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权信息
      window.viewer = this.viewer;

      let options = {
        defaultResetView: Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500),
        enableCompass: false,
        enableZoomControls: true,
        enableDistanceLegend: true,
        enableCompassOuterRing: false,
        resetTooltip: "重置视图",
        zoomInTooltip: "放大",
        zoomOutTooltip: "缩小"
      };


      window.navigation = new CesiumNavigation(this.viewer, options);

      // 锁定相机，正对着地面
      this.viewer.scene.preRender.addEventListener(() => {
        var camera = viewer.scene.camera;
        var currentPitch = camera.pitch;

        // 如果 pitch 不是 -Cesium.Math.PI_OVER_TWO，则将其设置为固定值
        if (currentPitch !== -Cesium.Math.PI_OVER_TWO) {
          viewer.scene.camera.setView({
            orientation: {
              heading: camera.heading,  // 保持当前的 heading
              pitch: -Cesium.Math.PI_OVER_TWO,  // 固定 pitch 为垂直朝下
              roll: camera.roll        // 保持当前的 roll
            }
          });
        }
      });

      // 设置视角的最低高度限制
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5000;
      // 设置视角的最高高度限制
      this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 500000;

      // 禁用中键旋转
      this.viewer.scene.screenSpaceCameraController.enableTilt = false;

      // 禁用双击后的视角锁定功能
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },

    // 启动轮询
    startPolling() {
      this.getEarthquake()
      this.pollingInterval = setInterval(() => this.getEarthquake(), 5000000);
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },

    // 地震列表变化
    handleEqListChange(value) {
      // 获取选择的 eqid
      this.eqid = value;

      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        // 清除当前所有转移安置的实体
        this.viewer.entities.removeAll();
        this.getPoints(value)
        //获取震源中心的点数据
        // this.getEarthQuakeCenter(value)
        this.getDistrictColor(value)
        this.getEcharts(value)
      }

      if (this.selectedComponentKey === 'TransportationElectricity') {
        //这里根据this.eqid来获取对应的数据
        console.log('选中了交通的对应eqid：', this.eqid)
      }
    },

    // 切换模块组件
    handleComponentChange(value) {

      //这里是修改exportTitle，导出图片的标题会对应变化
      const selectedOption = this.options.find(option => option.value === this.selectedComponentKey);
      if (selectedOption) {
        this.exportTitle = selectedOption.label; // 设置 exportTitle 为对应的 label
      }

      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        // 清除当前所有转移安置的实体
        this.viewer.entities.removeAll();
        this.getPoints(this.eqid)
        // 由于之前删除了所有实体，所以要添加标签
        this.addDistrictLabels(this.dataSource)
        //获取震源中心的点数据
        // this.getEarthQuakeCenter(this.eqid)
        this.getDistrictColor(this.eqid)
        this.getEcharts(this.eqid)
      } else {
        // 清除当前所有转移安置的实体
        this.viewer.entities.removeAll();
        this.clearMultipleECharts();
      }

      if (this.selectedComponentKey === 'TransportationElectricity') {
        this.addTrafficLayer();
        this.updateDistrictColors(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      } else {
        this.removeImageryLayer('TrafficLayer');
        this.removeImageryLayer('TrafficTxtLayer');
      }
    },

    // 切换组件获取图例数据
    getLegendData() {
      const legend = this.echartsLegendData.find(
          legendItem => legendItem.name === this.selectedComponentKey
      );
      return legend ? legend.data : [];
    },

    //--------------------------------------------------下面是后端获取数据的方法------------------------------------------

    //获取地震列表数据
    getEarthquake() {
      getExcelUploadEarthquake().then(res => {
        this.eqlists = res;
        if (res.data === null) {
          this.$message.error("地震列表无数据");
        } else {
          // 将 eqlists 映射为包含 label 和 value 的选项数据
          this.tableNameOptions = this.eqlists.map(file => {
            const eqid = file.split(' - ')[0]?.trim();  // 提取 eqid
            const details = file.split(' - ')[1]?.trim(); // 提取详细信息
            return {
              label: details,  // 使用提取的部分作为标签
              value: eqid      // 选择值为 ID
            };
          });
          if (this.tableNameOptions.length > 0) {
            if (!this.eqlistName) {
              // 默认选择地震列表中的第一个
              this.eqlistName = this.tableNameOptions[0].label;
              this.handleEqListChange(this.tableNameOptions[0].value)
            } else {
              // this.handleEqListChange(this.eqlistName)
            }
          }
        }
      });
    },

    //获取震源中心
    getEarthQuakeCenter(eqid) {
      // getGeomById(eqid).then(res => {
      //   this.updateEarthQuakeCenter(res[0])
      // })
    },

    //获取echarts展示的数据
    getEcharts(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        getAftershock(eqid).then(res => {
          this.updateMultipleECharts(res)
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {

      }
    },

    //板块颜色
    getDistrictColor(eqid) {
      //获取受灾人数数据
      getCasualty(eqid).then(res => {
        this.updateDistrictColors(this.dataSource, res)
      })
    },

    //获取点数据
    getPoints(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        //获取转移安置人数数据
        getTransferInfo(eqid).then(res => {
          this.updatePoints(res);
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {

      }
    },

    //-----------------------------------------------下面是交通图层的方法-------------------------------------------------

    /**
     * 添加交通图层到地图
     * 该方法首先检查是否已经存在名为'TrafficLayer'的图层，如果不存在，则从天地图服务添加交通图层
     * 同样，如果不存在名为'TrafficTxtLayer'的图层，则添加交通注记图层
     */
    addTrafficLayer() {
      // 获取天地图API令牌
      let token = TianDiTuToken;

      // 检查是否存在'TrafficLayer'图层
      let trafficLayerexists = this.imageryLayersExists('TrafficLayer')
      if (!trafficLayerexists) {
        // 创建并添加交通图层
        let trafficLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              // 天地图交通图层的URL模板
              url:
                  "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                  token,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
            })
        );
        trafficLayer.name = "TrafficLayer"; // 设置名称
      }

      // 检查是否存在'TrafficTxtLayer'图层
      let trafficTxtLayerExists = this.imageryLayersExists('TrafficTxtLayer')
      if (!trafficTxtLayerExists) {
        // 创建并添加交通注记图层
        let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              // 天地图交通注记图层的URL模板
              url:
                  "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                  token,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
              show: false, // 初始状态下不显示注记
            })
        )
        traffictxtLayer.name = "TrafficTxtLayer"
      }
    },

    /**
     * 移除指定名称的影像图层
     *
     * 该方法旨在从当前 viewer 的影像图层列表中移除第一个匹配给定图层名称的图层
     * 主要用于动态管理地图上的影像图层，提高地图的可读性和性能
     * @param {string} layerName - 要移除的影像图层的名称
     *        图层名称是在添加图层时指定的，用于唯一标识每个图层
     */
    removeImageryLayer(layerName) {
      // 获取当前 viewer 的所有影像图层
      const layers = window.viewer.imageryLayers;
      // 遍历所有图层，寻找与给定名称匹配的图层
      for (let i = 0; i < layers.length; i++) {
        // 当找到名称匹配的图层时
        if (layers.get(i).name === layerName) {
          // 移除该图层
          layers.remove(layers.get(i));
          // 完成移除后即返回，结束函数执行
          return;
        }
      }
    },

    /**
     * 检查指定名称的图层是否存在于地图中
     *
     * @param {string} layerName - 需要检查的图层名称
     * @return {boolean} - 如果图层存在，则返回true；否则返回false
     */
    imageryLayersExists(layerName) {
      // 获取地图中所有的图层
      const layers = viewer.imageryLayers;
      // 遍历所有图层，检查是否存在指定名称的图层
      for (let i = 0; i < layers.length; i++) {
        if (layers.get(i).name === layerName) {
          // 如果找到指定名称的图层，返回true
          return true;
        }
      }
      // 如果遍历完所有图层后仍未找到指定名称的图层，返回false
      return false;
    },

    //------------------------------------------下面是清除实体的方法------------------------------------------------------

    // 销毁所有已创建的 ECharts 实例
    clearMultipleECharts() {
      // 停止 Cesium 场景渲染后的 ECharts 更新同步
      if (this.syncEChartsWithCesium) {
        this.viewer.scene.postRender.removeEventListener(this.syncEChartsWithCesium);
        this.isPostRenderAdded = false;
      }

      // 遍历每个 ECharts 实例并销毁它们
      this.echartsInstances.forEach(echart => {
        if (echart) {
          echart.dispose();  // 销毁 ECharts 实例，释放资源
        }
      });

      // 清空 ECharts 实例数组
      this.echartsInstances = [];

      // 清空 ECharts 容器
      const chartContainers = this.$refs.echartsContainer;
      if (chartContainers) {
        chartContainers.forEach(container => {
          container.innerHTML = '';  // 移除容器中的所有 ECharts 元素
        });
      }
    },

    // clearTransferPoints() {
    //   // 遍历 transferData 并移除对应的实体
    //   const transferData = [
    //     {name: '宝兴县', count: 120},
    //     {name: '雨城区', count: 95},
    //     {name: '名山区', count: 110},
    //     {name: '荥经县', count: 85},
    //     {name: '汉源县', count: 75},
    //     {name: '石棉县', count: 130},
    //     {name: '天全县', count: 140},
    //     {name: '芦山县', count: 100},
    //   ];
    //
    //   // 遍历 transferData 并根据 name 查找并移除实体
    //   transferData.forEach(item => {
    //     const entity = this.viewer.entities.getById(item.name); // 获取与 name 对应的实体
    //
    //     if (entity) {
    //       this.viewer.entities.remove(entity); // 移除实体
    //     }
    //   });
    // },
    //
    //
    // resetDistrictColors(dataSource) {
    //   // 检查 dataSource 是否存在并且 entities 属性已定义
    //   if (!dataSource || !dataSource.entities) {
    //     console.warn('dataSource or entities is undefined');
    //     return;
    //   }
    //
    //   // 遍历每个实体，将其颜色恢复为默认状态或清除颜色
    //   dataSource.entities.values.forEach(entity => {
    //     // 检查是否存在 polygon 并且已设置了颜色
    //     if (entity.polygon && entity.polygon.material) {
    //       // 这里将颜色重置为 Cesium 默认颜色或透明色
    //       const defaultColor = Cesium.Color.WHITE.withAlpha(0.0);  // 可以根据需求设置默认颜色
    //       entity.polygon.material = new Cesium.ColorMaterialProperty(defaultColor);  // 恢复颜色
    //     }
    //   });
    // },

    //-----------------------------下面主要是标绘点的方法，创建转移安置点，以及震源中心的方法--------------------------------

    updatePoints(data) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        // 遍历所有的转移位置
        this.transferLocations.forEach(location => {
          // 在 transferDataFromBackend 中查找对应位置的数据
          const transferItem = data.find(item => item.earthquakeAreaName === location.name);

          // 如果找不到对应的转移数据，设定人数为0
          const count = transferItem ? transferItem.cumulativeTransferred : 0;

          // 当人数小于10时，设为10
          const adjustedCount = count < 10 ? 10 : count;
          const scale = Math.log(adjustedCount) / 5;  // 动态计算缩放比例
          const baseFontSize = 12;  // 定义基础字体大小
          const fontSize = Math.max(Math.round(scale * baseFontSize), 10);  // 动态计算字体大小，最小为10
          const imageHeight = 30;  // 假设图标的高度
          const dynamicOffsetY = -(imageHeight * scale / 2) - (fontSize / 2);  // 动态计算Y轴偏移量

          // 添加到 Cesium 实体
          this.viewer.entities.add({
            id: location.name,
            position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
            billboard: {
              image: cumulativeTransferredImg,  // 图标
              scale: scale,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,  // 图标在位置的中心
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  // 水平居中
              eyeOffset: new Cesium.Cartesian3(0, 0, -10000) // 确保标签浮在最上面
            },
            label: {
              text: `${count}`,  // 显示实际人数
              font: `bold ${fontSize}px sans-serif`,  // 动态调整字体大小
              fillColor: Cesium.Color.BLACK,  // 字体颜色
              showBackground: false,  // 不显示背景
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 将文本基线对齐到图标底部
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  // 水平居中
              pixelOffset: new Cesium.Cartesian2(0, dynamicOffsetY),  // 动态调整文本位置
              disableDepthTestDistance: Number.POSITIVE_INFINITY,  // 禁用深度测试，使标签不被遮挡
              eyeOffset: new Cesium.Cartesian3(0, 0, -10000) // 确保标签浮在最上面
            }
          });
        });
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {

      }

    },

    updateEarthQuakeCenter(data) {
      // 添加到 Cesium 实体
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude),
        billboard: {
          image: earthQuakeCenterImg,  // 图标
        }
      });
    },

    //------------------------------------------------------------------------------------------------------------------


    //--------------------------------------------------下面是创建echarts的方法------------------------------------------

    // 创建多个 ECharts 实例，位置为雅安市各区县
    updateMultipleECharts(data) {
      const locations = this.locations; // 获取 locations
      const echartsLegendData = this.echartsLegendData;

      locations.forEach((location, index) => {
        const chartContainer = this.$refs.echartsContainer[index]; // 获取容器

        // 销毁旧的 ECharts 实例，避免重复渲染
        let chartInstance = this.echartsInstances[index];
        if (chartInstance) {
          chartInstance.dispose(); // 销毁旧实例
        }

        // 创建一个新的 ECharts 实例
        chartInstance = echarts.init(chartContainer);
        this.echartsInstances[index] = chartInstance; // 保存实例

        if (this.selectedComponentKey === 'EarthquakeCasualties') {
          const districtInfo = data.find(district => district.affected_area === location.name);
          // 处理地震数据
          if (districtInfo) {
            const values = [
              districtInfo.magnitude_3_3_9,
              districtInfo.magnitude_4_4_9,
              districtInfo.magnitude_5_5_9,
              districtInfo.magnitude_6
            ];

            // 创建颜色映射对象和类别数组
            const colorMapping = {};
            const categories = []; // 新增用于存储类别
            echartsLegendData.forEach(legend => {
              if (legend.name === 'EarthquakeCasualties') {
                legend.data.forEach(item => {
                  colorMapping[item.name] = item.color; // 通过名称映射颜色
                  categories.push(item.name); // 添加类别
                });
              }
            });

            // 过滤有效数据
            const filteredValues = values.filter(value => value > 0); // 过滤掉值为 0 的柱子
            const filteredCategories = categories.filter((_, index) => values[index] > 0); // 过滤掉对应的类别

            // 如果没有有效的数据，清空图表
            if (filteredValues.length === 0) {
              chartInstance.clear(); // 清空图表内容
              return; // 结束当前迭代
            }

            // 更新图表
            this.updateChart(chartInstance, filteredValues, filteredCategories, colorMapping);
          } else {
            // 如果没有数据，清空图表内容
            chartInstance.clear();
          }
        }

        if (this.selectedComponentKey === 'TransportationElectricity') {
          const dataInfo = data.find(district => district.affectedArea === location.name);
          // 处理地震数据
          if (dataInfo) {
            const values = [
              dataInfo.restoredSubstations,
              dataInfo.restoredCircuits,
              dataInfo.restoredPowerUsers,
            ];

            // 创建颜色映射对象和类别数组
            const colorMapping = {};
            const categories = []; // 新增用于存储类别
            echartsLegendData.forEach(legend => {
              if (legend.name === 'TransportationElectricity') {
                legend.data.forEach(item => {
                  colorMapping[item.name] = item.color; // 通过名称映射颜色
                  categories.push(item.name); // 添加类别
                });
              }
            });

            // 过滤有效数据
            const filteredValues = values.filter(value => value > 0); // 过滤掉值为 0 的柱子
            const filteredCategories = categories.filter((_, index) => values[index] > 0); // 过滤掉对应的类别

            // 如果没有有效的数据，清空图表
            if (filteredValues.length === 0) {
              chartInstance.clear(); // 清空图表内容
              return; // 结束当前迭代
            }

            // 更新图表
            this.updateChart(chartInstance, filteredValues, filteredCategories, colorMapping);
          } else {
            // 如果没有数据，清空图表内容
            chartInstance.clear();
          }
        }
      });

      // 添加 Cesium 场景的 postRender 事件，在每次渲染后更新图表位置
      if (!this.isPostRenderAdded) {
        this.viewer.scene.postRender.addEventListener(this.syncEChartsWithCesium);
        this.isPostRenderAdded = true;
      }
    },

    // 更新图表方法
    updateChart(chartInstance, values, categories, colorMapping) {
      let labelText = '余震次数';
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'axis',
          show: true,
          formatter: (params) => {
            // 根据 dataIndex 修改 labelText
            if (this.selectedComponentKey === 'TransportationElectricity') {
              if (params[0].dataIndex === 0) {
                labelText = '已恢复变（发）电站（座）';
              } else if (params[0].dataIndex === 1) {
                labelText = '已恢复线路（条）';
              } else if (params[0].dataIndex === 2) {
                labelText = '已恢复主网供电用户数（户）';
              }
            } else {
              labelText = '余震次数'; // 其他情况仍然是余震次数
            }

            return `<div style="font-size: 14px; background-color: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd; border-radius: 4px; padding: 10px; width: auto;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <strong style="color: #333;">${params[0].name}</strong><br/>
      <div style="color: #555;"><span style="font-weight: bold;">${labelText}:</span> ${params[0].value}</div></div>`;
          },
        },
        xAxis: {
          type: 'category',
          data: categories, // 类别数据
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        yAxis: {
          show: false,
          type: 'value',
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [{
          name: '数据类型',
          type: 'bar',
          data: values, // 数据
          itemStyle: {
            color: (params) => {
              // 使用颜色映射对象
              return colorMapping[params.name] || '#ccc'; // 如果没有对应的值，返回灰色
            },
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}',
            color: '#fff',
            fontSize: 12,
          },
          barCategoryGap: '0%',
          barWidth: '100%',
        }],
      };

      chartInstance.setOption(option); // 设置图表选项
    },


    // 同步 ECharts 图表与 Cesium 地图，以保持图表与地图同步
    syncEChartsWithCesium() {
      const chartContainers = this.$refs.echartsContainer;  // 减少 DOM 查询
      if (!chartContainers) {
        console.warn('ECharts containers are not available');
        return;
      }
      //这里一个很重要的一点，requestAnimationFrame 会让echarts跟随地图动的时候不能完全贴合地图动
      //就是会让用户感觉echarts移动的总是慢一拍
      //如果想要更贴合地图
      //可以改为下面注释的syncEChartsWithCesium代码
      requestAnimationFrame(() => {
        // requestAnimationFrame 使得浏览器能够在下一个重绘前执行 JavaScript 代码，这样可以减少计算和渲染的开销，优化性能。
        const locations = this.locations;  // 使用局部变量减少对象查找

        locations.forEach(({longitude, latitude}, index) => {
          const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
          const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(position);

          if (Cesium.defined(canvasPosition)) {
            const chartContainer = chartContainers[index];
            if (chartContainer) {
              chartContainer.style.left = `${canvasPosition.x - chartContainer.offsetWidth / 2}px`;
              chartContainer.style.top = `${canvasPosition.y - chartContainer.offsetHeight / 2}px`;
            }
          }
        });
      });
    },

    //------------------------------------------------------------------------------------------------------------------


    //-------------------------------下面是地图 区块边界线 和 地域标签 以及 板块颜色 的设置---------------------------------

    // 加载雅安的边界线并设置视角
    loadYaAnBoundary() {
      Cesium.GeoJsonDataSource.load(yaan, {
        stroke: Cesium.Color.RED,  // 边界线颜色
        strokeWidth: 2,            // 边界线宽度
        fill: Cesium.Color.RED.withAlpha(0.1)  // 区域填充颜色（默认）
      }).then(dataSource => {
        // 将 dataSource 存储到组件的实例中，方便其他方法调用
        this.dataSource = dataSource;

        // 将数据源添加到viewer中
        this.viewer.dataSources.add(dataSource);

        // 将视角定位到雅安市的坐标
        this.viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(102.62, 29.895, 360000),
          orientation: {
            heading: 0,
            pitch: -Cesium.Math.PI_OVER_TWO,  // 垂直视角
            roll: 0
          }
        });

        // 为每个区块添加红色边界线
        this.addBoundaryLines(dataSource);

        // 添加各区县的名称标签
        this.addDistrictLabels(dataSource);


      }).catch(error => {
        console.error('加载 GeoJSON 时出错：', error);  // 捕获并显示错误信息
      });
    },

    // 添加边界线的方法
    addBoundaryLines(dataSource) {
      // 为每个区块添加红色边界线
      dataSource.entities.values.forEach(entity => {
        if (entity.polygon) {
          const positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
          entity.polyline = {
            positions: positions,
            width: 1,
            material: Cesium.Color.RED  // 边界线颜色
          };
        }
      });
    },

    // 添加区县标签的方法
    addDistrictLabels(dataSource) {
      // 定义各个区县的坐标（手动调整）
      const districtNames = {
        '雨城区': {lon: 103.04, lat: 29.74},
        '名山区': {lon: 103.19, lat: 30.05},
        '荥经县': {lon: 102.80, lat: 29.57},
        '汉源县': {lon: 102.70, lat: 29.25},
        '石棉县': {lon: 102.29, lat: 29.15},
        '天全县': {lon: 102.50, lat: 29.95},
        '芦山县': {lon: 102.98, lat: 30.25},
        '宝兴县': {lon: 102.75, lat: 30.4}
      };

      // 添加各区县的名称标签
      Object.keys(districtNames).forEach(district => {
        const {lon, lat} = districtNames[district];
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat),
          label: {
            text: district,
            font: '18px Helvetica',
            fillColor: Cesium.Color.WHITE,  // 字体颜色
            outlineWidth: 4,  // 较宽的外边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 填充文字并加上轮廓
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 标签在位置上方显示
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,  // 标签贴地显示
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000) // 确保标签浮在最上面
          }
        });
      });
    },

    // 设置区块颜色的方法
    updateDistrictColors(dataSource, districtData) {
      if (districtData) {
        // 遍历后端传回的区县受灾数据，并更新区块颜色
        dataSource.entities.values.forEach(entity => {
          const districtName = entity.name;
          const districtInfo = districtData.find(d => d.affectedAreaName === districtName);

          // 如果没有找到对应的区县数据，则将 affectedPopulation 设为 0
          const affectedPopulation = districtInfo ? districtInfo.affectedPopulation : 0;

          // 根据受灾人口数量范围匹配相应的颜色
          const legendItem = this.injuredLegendData.find(item =>
              affectedPopulation >= item.range[0] && affectedPopulation <= item.range[1]
          );

          if (legendItem) {
            const color = Cesium.Color.fromCssColorString(legendItem.color).withAlpha(0.8);
            // 更新区块的填充颜色
            entity.polygon.material = new Cesium.ColorMaterialProperty(color);
          }
        });
      } else {
        dataSource.entities.values.forEach(entity => {
          entity.polygon.material = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString('#ffb3b3').withAlpha(0.6));
        })
      }

    },

    //------------------------------------------------------------------------------------------------------------------


    //--------------------------------------------------下面是导出图片用的方法--------------------------------------------

    //导出图片：简单来讲就是分别获取一下对应的元素，把对应的元素绘制到合成Canvas上，最后把Canvas转换成图片，实现截图。
    async exportCesiumScene() {
      // 开始导出时，显示加载动画
      this.loading = true;
      const startTime = performance.now();  // 记录开始时间
      let stepStartTime = startTime;  // 记录每个步骤的开始时间

      //  1: 禁用 Cesium 相机和 ECharts 图表的交互功能，防止用户在导出时误操作
      const cameraController = this.viewer.scene.screenSpaceCameraController;
      cameraController.enableRotate = false;
      cameraController.enableZoom = false;
      cameraController.enableTranslate = false;

      this.$refs.echartsContainer.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) {
          chart.setOption({
            tooltip: {show: false},
            brush: {toolbox: []},
            silent: true  // 禁用交互
          });
        }
      });

      console.log(`Step 1: 禁用交互 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
      stepStartTime = performance.now();  // 记录下一个步骤的开始时间

      //  2: 获取地图当前视野范围的经纬度，并加载经纬度线
      this.getLatLonBounds();  // 获取当前视野经纬度范围
      this.addLatLonLines();   // 添加经纬度线
      await this.waitForEntitiesToRender(this.latLonEntities.length);  // 等待经纬度线渲染完成

      console.log(`Step 2: 加载经纬度线 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
      stepStartTime = performance.now();

      try {
        //  3: 等待 Cesium 渲染完成并请求重新渲染
        await this.waitForCesiumRender();
        this.viewer.scene.requestRender();

        console.log(`Step 3: Cesium 渲染完成 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();

        //  4: 获取 Cesium 场景的 Canvas 图像
        const cesiumCanvas = this.viewer.scene.canvas;
        const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片

        console.log(`Step 4: 获取 Cesium Canvas 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();

        //  5-7: 分别渲染图例、距离标尺和指南针
        const legendCanvas = await this.renderElementToCanvas('.noteContainer', '图例');
        const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
        const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');

        //  8: 创建一个新的合成 Canvas
        const finalCanvas = this.createFinalCanvas();
        const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

        console.log(`Step 8: 创建最终 Canvas 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();

        //  9: 将 Cesium 场景绘制到合成 Canvas 上
        await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);

        console.log(`Step 9: 绘制 Cesium 场景 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();

        //  10-12: 分别绘制图例、距离标尺和指南针到合成 Canvas 上

        // 计算 legendCanvas 的右下角位置，设置 10px 的边距
        const x = finalCanvas.width - legendCanvas.width - 10; // 计算右侧位置
        const y = finalCanvas.height - legendCanvas.height - 10; // 计算底部位置

        // 绘制 legendCanvas 到合成 Canvas 的右下角
        finalContext.drawImage(legendCanvas, x, y);
        finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
        finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);

        console.log(`Step 12: 绘制指南针 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();

        // 13: 渲染并绘制所有 ECharts 图表
        const echartsImages = await this.renderAllECharts();
        echartsImages.forEach((img, index) => {
          const container = this.$refs.echartsContainer[index];
          finalContext.drawImage(img, container.offsetLeft, container.offsetTop);  // 绘制 ECharts 图表
        });

        console.log(`Step 13: 绘制 ECharts 图表 花费时间: ${(performance.now() - stepStartTime).toFixed(2)} 毫秒`);
        stepStartTime = performance.now();


        //  14: 将合成后的 Canvas 转换为图片
        this.previewImage = finalCanvas.toDataURL('image/png');

      } catch (error) {
        console.error('导出场景失败:', error);
      } finally {
        this.setPictureCreateTime()
        //  15: 恢复 Cesium 相机交互，并移除经纬度线
        cameraController.enableRotate = true;
        cameraController.enableZoom = true;
        cameraController.enableTranslate = true;


        this.$refs.echartsContainer.forEach(container => {
          const chart = echarts.getInstanceByDom(container);
          if (chart) {
            chart.setOption({
              tooltip: {show: true},
              brush: {toolbox: []},
              silent: false  // 禁用交互
            });
          }
        });
        this.latLonEntities.forEach(entity => {
          this.viewer.entities.remove(entity);  // 移除经纬度线
        });
        this.latLonEntities = [];

        const endTime = performance.now();  // 记录结束时间
        console.log(`exportCesiumScene 方法总执行时间: ${(endTime - startTime).toFixed(2)} 毫秒`);


        this.getScreenCorners()
        // 分别处理四条边的数据
        const topData = {};
        const sideData = {};
        const bottomData = {};

        // 生成点数据
        this.generatePointsWithPercentage(this.corners.topStart, this.corners.topEnd, topData);
        this.generatePointsWithPercentage(this.corners.leftStart, this.corners.leftEnd, sideData);
        this.generatePointsWithPercentage(this.corners.bottomStart, this.corners.bottomEnd, bottomData);

        // 等待 DOM 渲染完成
        await nextTick();
        // 添加盒子
        const topContainer = document.querySelector('.top');
        const bottomContainer = document.querySelector('.bottom');
        const leftContainer = document.querySelector('.left');
        const rightContainer = document.querySelector('.right');

        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [topContainer].forEach(container => this.addBoxes(container, 'div_t', topData));

        // 为 leftContainer 和 rightContainer 生成盒子（反转顺序，从下往上显示）
        [leftContainer, rightContainer].forEach(container => this.addBoxes(container, 'div_l', sideData, true));

        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [bottomContainer].forEach(container => this.addBoxes(container, 'div_t', bottomData));

        this.loading = false;
      }
    },

    // 将元素渲染为 Canvas
    async renderElementToCanvas(selector, elementName) {
      const element = document.querySelector(selector);
      return await html2canvas(element, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });
    },

    // 创建最终合成的 Canvas
    createFinalCanvas() {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#exportContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#exportContainer').offsetHeight;
      return finalCanvas;
    },

    // 将图像绘制到 Canvas 上
    async drawImageToCanvas(context, imageSrc, x, y) {
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => img.onload = resolve);
      context.drawImage(img, x, y);
    },

    //将当前页面上所有的 ECharts 图表转换为图片，以便在后续的图像合成过程中使用。
    async renderAllECharts() {
      const echartsCanvases = [];

      this.$refs.echartsContainer.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) {
          // 使用 getDataURL 获取图表的图片数据
          const imageDataURL = chart.getDataURL({
            type: 'png',
            pixelRatio: 1,  // 可根据需求调整分辨率
            backgroundColor: 'transparent',
          });

          // 创建一个新的 Image 对象来加载 imageDataURL
          const img = new Image();
          img.src = imageDataURL;

          echartsCanvases.push(
              new Promise((resolve) => {
                img.onload = () => resolve(img);
              })
          );
        }
      });

      // 返回所有 ECharts 图表的图片
      return Promise.all(echartsCanvases);
    },

    // 等待 Cesium 渲染完成
    waitForCesiumRender() {
      return new Promise(resolve => {
        const scene = this.viewer.scene;
        const removeListener = scene.postRender.addEventListener(() => {
          removeListener();
          setTimeout(resolve, 500);  // 增加等待时间确保渲染完成
        });
        scene.requestRender();
      });
    },

    // 设置图片创建时间
    setPictureCreateTime() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份从0开始，需要加1
      const day = date.getDate();

      // 格式化日期为 YYYY年MM月DD日
      this.pictureCreateTime = `${year}年${month}月${day}日`;
    },

    // 下载图片
    // downloadImage() {
    //   // 创建 canvas 元素并获取其上下文
    //   const finalCanvas = document.createElement('canvas');
    //   const ctx = finalCanvas.getContext('2d');
    //
    //   // 获取页面中的两个 div 内容和样式
    //   const exportInfoDiv = document.querySelector('.export-info');
    //   const exportTitle = exportInfoDiv ? exportInfoDiv.textContent.trim() : '';
    //
    //   const additionalInfoDiv = document.querySelector('div[style*="background-color: white"]');
    //   const unitText = additionalInfoDiv ? additionalInfoDiv.querySelector('p:nth-child(1)').textContent : '';
    //   const dateText = additionalInfoDiv ? additionalInfoDiv.querySelector('p:nth-child(2)').textContent : '';
    //   const versionText = additionalInfoDiv ? additionalInfoDiv.querySelector('p:nth-child(3)').textContent : '';
    //   const backgroundColor = additionalInfoDiv ? window.getComputedStyle(additionalInfoDiv).backgroundColor : 'white';
    //
    //   // 获取 img_outbox 和 mainImage 的样式
    //   const imgOutbox = document.querySelector('.img_outbox');
    //
    //   // 获取样式信息
    //   const imgOutboxStyles = imgOutbox ? window.getComputedStyle(imgOutbox) : null;
    //
    //   // 设置 canvas 大小，确保包含图片、标题、边框和文字
    //   const image = new Image();
    //   image.src = this.previewImage; // this.previewImage 是之前合成的图片
    //   image.onload = () => {
    //     // 计算标题、边框和额外信息的高度
    //     const titleHeight = 60; // exportTitle 的高度
    //     const footerHeight = 50; // 底部信息的高度
    //     const borderWidth = imgOutboxStyles ? parseInt(imgOutboxStyles.borderWidth) : 0; // 获取边框宽度
    //     const padding = imgOutboxStyles ? parseInt(imgOutboxStyles.padding) : 0; // 获取 padding
    //
    //     // 根据图片大小和边框设置 canvas 尺寸
    //     finalCanvas.width = image.width + borderWidth * 2 + padding * 4;
    //     finalCanvas.height = image.height + titleHeight + footerHeight + borderWidth * 2 + padding * 2;
    //
    //     // 绘制 exportTitle 背景颜色
    //     ctx.fillStyle = backgroundColor;
    //     ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height); // 填充标题背景区域
    //
    //     // 设置标题文字样式并绘制 exportTitle
    //     ctx.font = '26px Arial';
    //     ctx.fillStyle = 'black';
    //     ctx.textAlign = 'center';
    //     ctx.fillText(exportTitle, finalCanvas.width / 2, 40); // 绘制标题
    //
    //     // 绘制 img_outbox 的边框
    //     if (imgOutboxStyles) {
    //       ctx.strokeStyle = imgOutboxStyles.borderColor || 'black';
    //       ctx.lineWidth = borderWidth;
    //       ctx.strokeRect(padding, titleHeight, finalCanvas.width - padding * 2, image.height + padding * 2); // 绘制外框
    //     }
    //
    //     // 绘制 mainImage 图片内容
    //     ctx.drawImage(image, padding + borderWidth + padding, titleHeight + padding); // 将图片绘制到 canvas 中，应用内边距和边框
    //
    //     // 绘制底部背景
    //     ctx.fillStyle = backgroundColor;
    //     ctx.fillRect(0, image.height + titleHeight + padding * 2 + borderWidth * 2, finalCanvas.width, footerHeight); // 填充底部背景
    //
    //     // 设置文字样式
    //     ctx.font = '16px Arial';
    //     ctx.fillStyle = 'black';
    //     ctx.textAlign = 'center'; // 设置文本居中对齐
    //
    //     // 计算每个文本的水平位置
    //     const unitX = finalCanvas.width * 0.2; // 单位文本居左 20% 位置
    //     const dateX = finalCanvas.width * 0.5; // 时间文本居中
    //     const versionX = finalCanvas.width * 0.8; // 版本文本居右 80% 位置
    //
    //     const textY = image.height + titleHeight + padding * 2 + borderWidth * 2 + 30; // 计算垂直位置
    //
    //     // 绘制单位、时间和版本信息
    //     ctx.fillText(unitText, unitX, textY);   // 绘制单位
    //     ctx.fillText(dateText, dateX, textY);   // 绘制时间
    //     ctx.fillText(versionText, versionX, textY); // 绘制版本
    //
    //     // 将 canvas 转换为图片
    //     const finalImage = finalCanvas.toDataURL('image/png');
    //
    //     // 创建下载链接并触发下载
    //     const link = document.createElement('a');
    //     link.download = '震情伤亡信息专题图.png';
    //     link.href = finalImage;
    //     link.click();
    //
    //     // 清理 previewImage
    //     this.previewImage = null;
    //   };
    // },

    // 下载图片
    downloadImage() {
      // 获取要截取的 DOM 元素
      const elementToCapture = document.querySelector('.export-image');

      // 使用 html2canvas 截图
      html2canvas(elementToCapture, {
        useCORS: true, // 允许跨域请求，确保图片加载
        logging: true, // 打开日志以查看可能的错误
        scale: 2, // 提高图像质量
        backgroundColor: null // 使背景透明
      }).then(canvas => {
        // 将 canvas 转换为图片
        const finalImage = canvas.toDataURL('image/png');

        // 创建下载链接并触发下载
        const link = document.createElement('a');
        link.download = `${this.exportTitle}.png`; // 设置下载文件名
        link.href = finalImage; // 设置图片来源
        link.click(); // 触发下载
      }).catch(error => {
        console.error('Error capturing the screenshot:', error);
      });
    },

    // 关闭预览窗口
    closePreview() {
      this.previewImage = null;
    },

    // 等待所有经纬度线实体完成渲染，并确保 Cesium 渲染循环完成
    waitForEntitiesToRender(entityCount) {
      return new Promise(resolve => {
        const scene = this.viewer.scene;

        // 监听渲染循环是否完成
        const checkEntitiesRendered = () => {
          const isRendered = this.latLonEntities.filter(entity => entity.show).length === entityCount;
          if (isRendered) {
            // 等待 Cesium 完成渲染
            const removePostRender = scene.postRender.addEventListener(() => {
              removePostRender(); // 确保只监听一次
              resolve();          // 确保渲染完成后再 resolve
            });
          } else {
            setTimeout(checkEntitiesRendered, 100); // 每100ms检查一次
          }
        };

        checkEntitiesRendered();
      });
    },

    // 添加经纬度线到 Cesium 场景
    addLatLonLines() {
      const viewer = this.viewer;
      const step = 0.5; // 间隔为 0.5 度
      const alpha = 0.7; // 白色透明度

      // 添加经度或纬度线所用的函数
      const addLines = (start, end, constantCoord, isLongitude) => {
        //start 和 end：表示线段的起始和结束位置。对于经度线，start 和 end 是经度的范围；对于纬度线，是纬度的范围。
        for (let coord = start; coord <= end; coord += step) {
          const positions = [];

          // 根据是否是经度线，调整另一个坐标的范围
          //isLongitude：指示当前绘制的是经度线（true）还是纬度线（false）。
          for (let varCoord = isLongitude ? this.rectangleBounds[1] : this.rectangleBounds[2];
               varCoord <= (isLongitude ? this.rectangleBounds[3] : this.rectangleBounds[0]);
               varCoord += step) {
            if (isLongitude) {
              positions.push(Cesium.Cartesian3.fromDegrees(coord, varCoord)); // 经度线：lon 固定，lat 变化
            } else {
              positions.push(Cesium.Cartesian3.fromDegrees(varCoord, coord)); // 纬度线：lat 固定，lon 变化
            }
          }

          const entity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 1,
              material: Cesium.Color.WHITE.withAlpha(alpha),  // 白色透明度稍高
              clampToGround: true
            }
          });
          this.latLonEntities.push(entity); // 将实体存储到数组中
        }
      };

      // 添加中国区域内的经度线
      addLines(this.rectangleBounds[2], this.rectangleBounds[0], 'longitude', true);

      // 添加中国区域内的纬度线
      addLines(this.rectangleBounds[1], this.rectangleBounds[3], 'latitude', false);
    },

    // 获取地图当前视野范围的最东、最西、最南、最北的经纬度，用于经纬度线的绘制
    getLatLonBounds() {
      const viewer = this.viewer;

      // 通过摄像机视角获取视野范围的边界矩形
      const rectangle = viewer.camera.computeViewRectangle();

      if (rectangle) {
        // 获取最西经度（west）、最东经度（east）、最南纬度（south）、最北纬度（north）
        this.rectangleBounds[0] = Math.ceil(Cesium.Math.toDegrees(rectangle.east));//向上取整，东方
        this.rectangleBounds[1] = Math.floor(Cesium.Math.toDegrees(rectangle.south));//南方
        this.rectangleBounds[2] = Math.floor(Cesium.Math.toDegrees(rectangle.west));//向下取整,西方
        this.rectangleBounds[3] = Math.ceil(Cesium.Math.toDegrees(rectangle.north));//北方
      }
    },

    // 获取屏幕四个角的坐标经纬度
    // getScreenCorners() {
    //   let extent = this.viewer.camera.computeViewRectangle();
    //
    //   // 提取四个角的经纬度
    //   let southwest = Cesium.Rectangle.southwest(extent);
    //   let southeast = Cesium.Rectangle.southeast(extent);
    //   let northeast = Cesium.Rectangle.northeast(extent);
    //   let northwest = Cesium.Rectangle.northwest(extent);
    //   console.log('southwest:', southwest)
    //   console.log('southeast:', southeast)
    //   console.log('northeast:', northeast)
    //   console.log('northwest:', northwest)
    //   this.corners = {
    //     topStart: Cesium.Math.toDegrees(northwest.longitude),
    //     topEnd: Cesium.Math.toDegrees(northeast.longitude),
    //     leftStart: Cesium.Math.toDegrees(southwest.latitude),
    //     leftEnd: Cesium.Math.toDegrees(northwest.latitude),
    //     bottomStart: Cesium.Math.toDegrees(southwest.longitude),
    //     bottomEnd: Cesium.Math.toDegrees(southeast.longitude)
    //   };
    // },

    getScreenCorners() {
      const viewer = this.viewer;
      const scene = viewer.scene;
      const canvas = scene.canvas;

      // 获取四个角的屏幕坐标
      const topLeft = new Cesium.Cartesian2(0, 0);
      const topRight = new Cesium.Cartesian2(canvas.width, 0);
      const bottomLeft = new Cesium.Cartesian2(0, canvas.height);
      const bottomRight = new Cesium.Cartesian2(canvas.width, canvas.height);

      // 将屏幕坐标转换为地球坐标
      const topLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topLeft));
      const topRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topRight));
      const bottomLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomLeft));
      const bottomRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomRight));

      // 获取经纬度
      this.corners = {
        topStart: Cesium.Math.toDegrees(topLeftCartographic.longitude),
        topEnd: Cesium.Math.toDegrees(topRightCartographic.longitude),
        leftStart: Cesium.Math.toDegrees(bottomLeftCartographic.latitude),
        leftEnd: Cesium.Math.toDegrees(topLeftCartographic.latitude),
        bottomStart: Cesium.Math.toDegrees(bottomLeftCartographic.longitude),
        bottomEnd: Cesium.Math.toDegrees(bottomRightCartographic.longitude)
      };

      console.log(this.corners);
    },
    // 生成点和百分比，传入不同的标识符，避免共享同一数据集
    generatePointsWithPercentage(start, end, dataContext) {
      dataContext.points = [];
      dataContext.flexPercentages = [];

      const adjustedStart = Math.ceil(start / this.step) * this.step;
      const adjustedEnd = Math.floor(end / this.step) * this.step;

      for (let current = adjustedStart; current <= adjustedEnd; current += this.step) {
        dataContext.points.push(Number(current.toFixed(2)));
      }

      const basePercentage = (this.step / (end - start)) * 100;
      dataContext.divBoxCount = dataContext.points.length;
      dataContext.flexPercentages = Array(dataContext.divBoxCount).fill(basePercentage);

      this.calculateCustomValues(
          dataContext.points[0],
          dataContext.points[dataContext.points.length - 1],
          start,
          end,
          dataContext
      );
    },

    // 计算自定义值并保存到特定的数据上下文
    calculateCustomValues(firstPoint, lastPoint, start, end, dataContext) {
      const halfStep = this.step / 2;
      const number1 = end - start;

      const diffFirst = firstPoint - start;
      if (diffFirst > halfStep) {
        const percentageFirst = ((firstPoint - start - halfStep) / number1) * 100;
        dataContext.flexPercentages.unshift(percentageFirst);
        dataContext.points.unshift('');
      } else if (diffFirst < halfStep) {
        const percentage1 = (2 * (firstPoint - start) / number1) * 100;
        const percentage2 = ((halfStep - (firstPoint - start)) / number1) * 100;
        dataContext.flexPercentages.unshift(percentage1);
        dataContext.flexPercentages[1] = percentage2;
        dataContext.points.splice(1, 0, '');
      }

      const diffLast = end - lastPoint;
      if (diffLast > halfStep) {
        const percentageLast = ((end - lastPoint - halfStep) / number1) * 100;
        dataContext.flexPercentages.push(percentageLast);
        dataContext.points.push('');
      } else if (diffLast < halfStep) {
        const percentage1 = ((halfStep - (end - lastPoint)) / number1) * 100;
        const percentage2 = (2 * (end - lastPoint) / number1) * 100;
        dataContext.flexPercentages[dataContext.flexPercentages.length - 1] = percentage1;
        dataContext.flexPercentages.push(percentage2);
        dataContext.points.splice(-1, 0, '');
      }

      dataContext.divBoxCount = dataContext.points.length;
    },

    addBoxes(container, prefix, dataContext, reverse = false) {
      if (!container) return;
      let points = dataContext.points;
      let flexPercentages = dataContext.flexPercentages;

      // 如果需要反转顺序
      if (reverse) {
        points = [...points].reverse();
        flexPercentages = [...flexPercentages].reverse();
      }
      Array.from({length: dataContext.divBoxCount}).forEach((_, i) => {
        const box = document.createElement('div');
        box.className = `${prefix}${i}`;
        // 只对有效的数值进行转换
        if (points[i]) {
          box.textContent = this.convertToDMS(points[i], reverse);  // 转换为度分秒格式
        } else {
          box.textContent = '';  // 保留空值
        }
        container.appendChild(box);

        // 设置盒子样式
        const boxStyles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black',
          width: '19.47px',
          height: '19.47px',
          fontSize: '10px',
          flex: flexPercentages[i], // 使用反转后的 flexPercentages
          whiteSpace: 'nowrap', // 防止文字换行
        };

        // 如果 reverse 为 true，才旋转 90 度
        if (reverse) {
          boxStyles.transform = 'rotate(-90deg)';
        }

        // 应用样式
        Object.assign(box.style, boxStyles);
      });
    },

    // 将浮点数转换为度分秒格式
    convertToDMS(point, reverse) {
      const absolute = Math.abs(point);
      const degrees = Math.floor(absolute);  // 整数部分为度
      const minutes = Math.floor((absolute - degrees) * 60);  // 小数部分乘以 60 得到分
      const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);  // 小数部分乘以 60 再得到秒

      let direction;

      if (reverse) {
        // 只考虑南北方向
        direction = point >= 0 ? '北' : '南';
      } else {
        // 只考虑东西方向
        direction = point >= 0 ? '东' : '西';
      }

      return `${degrees}°${minutes}'${seconds}"${direction}`;
    },

    // downloadImage() {
    //   const link = document.createElement('a');
    //   link.download = '震情伤亡-震情灾情统计表.png';
    //   link.href = this.previewImage;
    //   link.click();
    //   this.previewImage = null;
    // },

    //------------------------------------------------------------------------------------------------------------------
  }
};
</script>

<style scoped>
.noteContainer {
  position: absolute;
  padding: 5px;
  border-radius: 5px;
  bottom: 10px; /* 固定在底部 */
  right: 10px; /* 固定在右侧 */
  width: 155px; /* 宽度自适应内容 */
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.export-button {
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 20; /* 确保按钮显示在最前面 */
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  cursor: pointer;
}

.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
}

.listContainer {
  position: absolute;
  top: 20px;
  left: 100px;
}

.export-button:hover {
  background-color: #2980b9;
}

.legend_item {
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 5px;
  color: white;
}

.echarts-container {
  position: absolute;
  width: 90px;
  height: 90px;
  pointer-events: auto; /* 允许鼠标事件 */
  background-color: transparent;
}

.block {
  display: inline-block;
  width: 30%;
  height: 20px;
  margin-right: 7px;
}

.mainImage {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}


.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.compassContainer {
  position: absolute;
  top: 20px; /* 距离顶部的像素 */
  right: 20px; /* 距离右侧的像素 */
  height: 120px;
  width: 160px;
  background: url(@/assets/compass.png) no-repeat center / cover;
  z-index: 20;
  transform-origin: center; /* 设置旋转中心 */
  transition: transform 0.5s; /* 动画效果 */
}

.markCollection span {
  margin: 5px;
  width: 30px;
  height: 30px;
}

.markCollection span:hover {
  cursor: pointer;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  display: none !important;
}

.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  max-width: 100%;
  vertical-align: top;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.download-button,
.cancel-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.download-button:hover,
.cancel-button:hover {
  background-color: #2980b9;
}

/* 确保按钮显示在图片的下方正中央 */
.preview-buttons {
  justify-content: center;
  margin-top: 10px;
}

.export-info {
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
}

.img_outbox {
  border: 3px solid black;
  padding: 20px;
}


.main_coantainer {
  border: 3px solid black;
  background-color: white;
}

.top_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.middow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  width: 19.47px;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

</style>
