<template>
  <div>
    <div id="exportContainer">
      <!-- Cesium 地图容器 -->
      <div id="cesiumContainer" class="situation_cesiumContainer"></div>
      <!--  指南针  -->
      <div class="compassContainer" ref="compassContainer"></div>
      <!-- 图例 -->
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'EarthquakeCasualties'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <p style="color: white; text-align: left; margin: 5px 0; font-size: 15px;">余震次数累计：</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;font-size: 15px">累积受伤人数：</p>
        <div class="legend_item" v-for="(item, index) in getColorsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;">转移安置人数：</p>
        <div class="legend_item" v-for="(item, index) in transferredImgLegendData" :key="index">
          <img :src="item.img" class="block-img" alt="icon" style="height: 20px;margin-right: 7px;margin-left: 5px"/>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'TransportationElectricity'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'BuildingDamageInformation'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.buildingDamageInformationLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'SecondaryDisaster'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>




        <div class="legend_container" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="legend_group" v-for="(legend, legendIndex) in this.secondaryDisasterLegendData" :key="legendIndex">
            <p style="color: white; font-weight: bold; margin: 5px 0;">{{ legend.name }}</p>
            <div class="legend_item" v-for="(item, itemIndex) in legend.data" :key="itemIndex"
                 style="display: flex; align-items: center; margin: 5px 0;">
              <span class="block"
                    :style="{
                      backgroundImage: 'url(' + item.img + ')',
                      backgroundSize: 'cover',
                      height: item.height + 'px',
                      width: item.width + 'px',
                      marginRight: '10px',
                    }">
              </span>
              <span style="color: white;">{{ item.name }}</span>
            </div>
          </div>
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
import {getExcelUploadEarthquake, getGeomById} from "@/api/system/eqlist.js";
import html2canvas from "html2canvas";
import yaan from '@/assets/geoJson/yaan.json'
import cumulativeTransferredImg from '@/assets/images/cumulativeTransferred.png'
import damagedWaterSupply from '@/assets/images/damagedWaterSupply.png'
import guaranteeWaterSupply from '@/assets/images/guaranteeWaterSupply.png'
import earthQuakeCenterImg from '@/assets/icons/TimeLine/震中.png'
import fimg from '@/assets/icons/TimeLine/前进箭头.png'
import gimg from '@/assets/icons/TimeLine/后退箭头.png'
import himg from '@/assets/icons/TimeLine/暂停.png'
import {getTotal as getAftershock} from "@/api/system/statistics";
import {getCasualty} from "@/api/system/casualtystats" ;
import {getTransferInfo} from "@/api/system/relocation";
import {getPowerSupply} from "@/api/system/powerSupply.js";
import {TianDiTuToken} from "@/cesium/tool/config.js";
import dataSourcePanel from "@/components/Cesium/dataSourcePanel.vue";
import {getVillagesName} from "@/api/system/ZhongDuanVillage.js";
import {getHousingSituationList} from "@/api/system/housingSituation.js";
import {getSupplySituationList} from "@/api/system/supplySituation.js";
import {getEnsureWaterSupply} from "@/api/system/supplyWater.js";
import {getSecondaryDisaster} from "@/api/system/mountainFlood.js";
import {getRiskConstructionGeohazards} from "@/api/system/geologicalDisaster.js";
import {getBarrierlakeSituation} from "@/api/system/barrierlakeSituation.js";

export default {
  components: {dataSourcePanel},
  data() {
    return {
      viewer: null, // 保存 Cesium Viewer
      pollingInterval: null, // 保存轮询定时器的引用

      //-------echarts所用到的-----------
      echartsInstances: [],
      locations: [
        {name: '雨城区', longitude: 103.0, latitude: 29.87},
        {name: '名山区', longitude: 103.22, latitude: 30.15},
        {name: '荥经县', longitude: 102.77, latitude: 29.71},
        {name: '汉源县', longitude: 102.71, latitude: 29.38},
        {name: '石棉县', longitude: 102.33, latitude: 29.14},
        {name: '天全县', longitude: 102.47, latitude: 30.11},
        {name: '芦山县', longitude: 103.029, latitude: 30.41},
        {name: '宝兴县', longitude: 102.75, latitude: 30.52}
      ],
      //下面是各个模块的echarts图例数据
      //echartsLegendData中data里的
      //name是echarts图例的文字和echarts柱子的xAxis的数据
      //color是图例和echarts柱子的颜色
      //chartType即为图表类型，柱状图还是饼图
      echartsLegendData: [
        {
          name: 'EarthquakeCasualties',
          chartType: 'bar',
          data: [
            {name: '3.0-3.9级', color: '#2c933e'},
            {name: '4.0-4.9级', color: '#53a8ff'},
            {name: '5.0-5.9级', color: '#ff6d39'},
            {name: '6.0级以上', color: '#ff7c88'},
          ]
        },
        {
          name: 'TransportationElectricity',
          chartType: 'pie',
          data: [
            {name: '已恢复主网供电用户数', color: '#2c933e'},
            {name: '应急供电用户数', color: '#53a8ff'},
            {name: '累计主网停电用户数', color: '#ff6d39'},
          ]
        },
        {
          name: 'BuildingDamageInformation',
          chartType: 'pie',
          data: [
            {name: '目前房屋受损数量', color: '#2c933e'},
            {name: '目前房屋禁用数量', color: '#53a8ff'},
            {name: '目前房屋限用数量', color: '#ff6d39'},
            {name: '目前房屋可用数量', color: '#ff7c88'},
          ]
        },
        {
          name: 'SecondaryDisaster',
          chartType: 'bar',
          data: [
            {name: '疏散数量', color: '#2c933e'},
            {name: '正在施工点', color: '#53a8ff'},
            {name: '现有风险点', color: '#ff6d39'},
            {name: '警报数量', color: '#ff7c88'},
          ]
        },
      ],
      //echartsConfigMap中
      //locationKey是后端获取数据方法返回的对应区县名称
      //dataKeys是后端返回数据的名称
      //labels是鼠标悬浮到echarts柱子上label会展示的文字
      echartsConfigMap: {
        EarthquakeCasualties: {
          locationKey: 'affected_area',
          dataKeys: ['magnitude_3_3_9', 'magnitude_4_4_9', 'magnitude_5_5_9', 'magnitude_6'],
          legendName: 'EarthquakeCasualties',
          labels: '余震次数'
        },
        TransportationElectricity: {
          locationKey: 'affectedArea',
          dataKeys: ['restoredPowerUsers', 'emergencyPowerUsers', 'totalBlackoutUsers'],
          legendName: 'TransportationElectricity',
          labels: ['已恢复供电数：', '应急供电数：', '累计停电户数：']
        },
        BuildingDamageInformation: {
          locationKey: 'affectedAreaName',
          dataKeys: ['currentlyDamaged', 'currentlyDisabled', 'currentlyRestricted', 'currentlyAvailable'],
          legendName: 'BuildingDamageInformation',
          labels: ['房屋受损数量：', '房屋禁用数量：', '房屋限用数量：', '房屋可用数量：']
        },
        SecondaryDisaster: {
          locationKey: 'quakeAreaName',
          dataKeys: ['evacuationCount', 'constructionPoints', 'existingRiskPoints', 'alarmCount'],
          legendName: 'SecondaryDisaster',
          labels: ['疏散数量：', '正在施工点数量：', '现有风险点数量：', '警报数量：']
        }
      },

      //----------地震选择列表------------
      eqlists: [],
      eqlistName: '',
      eqid: '',
      tableNameOptions: [],
      selectedComponentKey: 'EarthquakeCasualties',
      options: [
        {label: '震情伤亡信息专题图', value: 'EarthquakeCasualties'},
        {label: '交通电力通信信息专题图', value: 'TransportationElectricity'},
        {label: '建筑物受损信息专题图', value: 'BuildingDamageInformation'},
        {label: '次生灾害信息专题图', value: 'SecondaryDisaster'}
      ],

      //---------板块颜色------------
      dataSource: null,//这个别的也能用
      districtColorsLegendData: [
        {
          name: 'EarthquakeCasualties',
          data: [
            {name: '0-50人', color: '#ffb3b3', range: [0, 50]},// 非常浅的红色
            // {name: '10-20人', color: '#ff6666'},// 浅红色
            // {name: '20-50人', color: '#ff4d4d'},// 略深的红色
            {name: '50-200人', color: '#ff3333', range: [51, 200]},// 中等红色
            // {name: '100-500人', color: '#ff1a1a'},// 深红色
            // {name: '500-1000人', color: '#e60000'},// 更深的红色
            {name: '>200人', color: '#b30000', range: [201, Infinity]},// 深红带棕
            // {name: '>2000人', color: '#800000'}, // 非常深的红色
          ]
        },
      ],
      districtColorsConfigMap: {
        EarthquakeCasualties: {
          locationKey: 'affectedAreaName',
          dataKey: 'affectedPopulation',
          legendName: 'EarthquakeCasualties',
        },
      },

      //-----------导出图片----------------
      previewImage: null, // 保存预览图片的 URL
      loading: false, // 控制加载状态
      exportTitle: '震情伤亡信息专题图',//默认的
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

      //----------转移安置，地图上图标----------
      transferredImgLegendData: [
        {name: '转移安置人数', img: cumulativeTransferredImg}
      ],
      transferLocations: [
        {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
        {name: '名山区', longitude: 103.31, latitude: 30.17},  // 向西南偏移
        {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
        {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
        {name: '石棉县', longitude: 102.35, latitude: 29.35},  // 向东北偏移
        {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
        {name: '芦山县', longitude: 103.10, latitude: 30.56},  // 向西偏移
        {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
      ],

      //---------标绘点所用到的------------
      pointsLegendData: [
        {
          name: 'TransportationElectricity',
          data: [
            {name: '目前道路中断村', img: fimg},
            {name: '目前通信中断村', img: gimg},
            {name: '目前主网供电中断村', img: himg},
          ]
        },
      ],
      pointsConfigMap: {
        TransportationElectricity: {
          //村镇名称
          villagesName: ['roadBlockVillagesName', 'currentInterruptedVillagesName', 'currentlyBlackedOutVillagesName'],
          //区县名称
          districtNames: ['affectedAreasRoad', 'affectedAreasPower', 'earthquakeZoneNames'],
          legendName: 'TransportationElectricity',
        }
      },
      buildingDamageInformationLegendData: [
        {
          img: damagedWaterSupply,
          name: '集中供水工程受损'
        },
        {
          img: guaranteeWaterSupply,
          name: '保障安置点供水'
        },
      ],
      secondaryDisasterLegendData: [
        {
          name: '受威胁群众(户或人)',
          data: [
            {name: '>200人', img: damagedWaterSupply, width: 40, height: 40, range: [201, Infinity]},
            {name: '50-200人', img: damagedWaterSupply, width: 30, height: 30, range: [51, 200]},
            {name: '0-50人', img: damagedWaterSupply, width: 20, height: 20, range: [0, 50]},
          ]
        },
        {
          name: '避险转移(户或人)',
          data: [
            {name: '>200人', img: guaranteeWaterSupply, width: 40, height: 40, range: [201, Infinity]},
            {name: '50-200人', img: guaranteeWaterSupply, width: 30, height: 30, range: [51, 200]},
            {name: '0-50人', img: guaranteeWaterSupply, width: 20, height: 20, range: [0, 50]},
          ]
        },
      ]
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
      this.viewer.entities.removeAll();
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        this.getPoints(value)
        //获取震源中心的点数据
        // this.getEarthQuakeCenter(value)
        this.getDistrictColor(value)
        this.getEcharts(value)
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        this.getEcharts(value)
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        getHousingSituationList(this.eqid).then(res => {
          this.getEcharts(res)
        })
        getSupplySituationList(this.eqid).then(res => {
          const locations = [
            {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
            {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
            {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
            {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
            {name: '石棉县', longitude: 102.45, latitude: 29.3},  // 向东北偏移
            {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
            {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
            {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
          ]
          this.updatePoints(res, locations, damagedWaterSupply)
        })
        getEnsureWaterSupply(this.eqid).then(res => {
          const locations = [
            {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
            {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
            {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
            {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
            {name: '石棉县', longitude: 102.35, latitude: 29.0},  // 向东北偏移
            {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
            {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
            {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
          ]
          this.updatePoints(res, locations, guaranteeWaterSupply)
        })
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        this.getEcharts(value)
        this.addDistrictLabels(this.dataSource)
        this.getPoints(value)
      }

    },

    // 切换模块组件
    handleComponentChange(value) {
      //这里是修改exportTitle，导出图片的标题会对应变化
      const selectedOption = this.options.find(option => option.value === this.selectedComponentKey);
      if (selectedOption) {
        this.exportTitle = selectedOption.label; // 设置 exportTitle 为对应的 label
      }
      // 清除当前所有点标绘实体
      this.viewer.entities.removeAll();
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        this.getPoints(this.eqid)
        //获取震源中心的点数据
        // this.getEarthQuakeCenter(this.eqid)
        this.getDistrictColor(this.eqid)
        this.getEcharts(this.eqid)
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
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        // 这里有点特殊，一个方法获取了两个数据，echarts数据和板块颜色数据，所以就在这里先获取数据，再传过去
        getHousingSituationList(this.eqid).then(res => {
          this.getEcharts(res)
        })
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getPoints(this.eqid)
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      }

    },

    // 切换组件获取Echarts图例数据
    getEchartsLegendData() {
      const legend = this.echartsLegendData.find(
          legendItem => legendItem.name === this.selectedComponentKey
      );
      return legend ? legend.data : [];
    },

    // 切换组件获取板块颜色数据
    getColorsLegendData() {
      const legend = this.districtColorsLegendData.find(
          legendItem => legendItem.name === this.selectedComponentKey
      );
      return legend ? legend.data : [];
    },

    // --------------------------------------------------下面是后端获取数据的方法------------------------------------------

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
      getGeomById(eqid).then(res => {
        this.updateEarthQuakeCenter(res[0])
      })
    },

    //获取echarts展示的数据
    getEcharts(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        getAftershock(eqid).then(res => {
          this.updateMultipleECharts(res)
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        getPowerSupply(eqid).then(res => {
          this.updateMultipleECharts(res);
        })
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        this.updateMultipleECharts(eqid);
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        getRiskConstructionGeohazards(eqid).then(res => {
          this.updateMultipleECharts(res);
        })
      }
    },

    //板块颜色
    getDistrictColor(eqid) {
      //获取受灾人数数据
      getCasualty(eqid).then(res => {
        this.updateDistrictColors(this.dataSource, res)
        this.addDistrictLabels(this.dataSource)
      })
    },

    //获取点数据
    getPoints(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        //获取转移安置人数数据
        getTransferInfo(eqid).then(res => {
          this.updatePoints(res)
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        // getVillagesName(eqid).then(res => {
        //   console.log('返回中断村镇数据：', res)
        //   const config = this.pointsConfigMap[this.selectedComponentKey];
        //   const legend = this.pointsLegendData.find(legend => legend.name === config.legendName);
        //
        //   if (!legend) return;
        //
        //   // 存储原始村镇名称和拼接后的名称
        //   const villageData = config.villagesName.map((villageKey, index) => {
        //     const villageNames = res[villageKey] || [];
        //     const districtNames = res[config.districtNames[index]] || [];
        //
        //     return villageNames.map((villageName, villageIndex) => {
        //       const districtName = districtNames[villageIndex] || '';
        //       const combinedName = `${districtName}${villageName}`; // 拼接名称
        //       return { combinedName, originalName: villageName }; // 保存原始名称
        //     });
        //   });
        //
        //   // 展平 villageData
        //   const flatVillageData = villageData.flat();
        //
        //   // 查询每个村镇的经纬度，并保留原始名称
        //   this.searchLocations(flatVillageData.map(v => v.combinedName))
        //       .then(locations => {
        //         // 处理每个位置，绑定图标和原始村镇名称
        //         const allLocations = locations.map((location, index) => {
        //           const originalVillageName = flatVillageData[index].originalName; // 获取原始村镇名称
        //
        //           return {
        //             name: originalVillageName, // 使用原始名称
        //             longitude: location.longitude,
        //             latitude: location.latitude,
        //             img: legend.data[Math.floor(index / (flatVillageData.length / legend.data.length))].img, // 绑定对应图标
        //           };
        //         });
        //         // 更新标绘
        //         this.updateMultiplePoints(allLocations);
        //       })
        //       .catch(error => {
        //         console.error('地理编码请求处理错误:', error);
        //       });
        // });
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        getSupplySituationList(eqid).then(res => {
          const locations = [
            {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
            {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
            {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
            {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
            {name: '石棉县', longitude: 102.45, latitude: 29.3},  // 向东北偏移
            {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
            {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
            {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
          ]
          this.updatePoints(res, locations)
        })
        getEnsureWaterSupply(eqid).then(res => {
          const locations = [
            {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
            {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
            {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
            {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
            {name: '石棉县', longitude: 102.35, latitude: 29.0},  // 向东北偏移
            {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
            {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
            {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
          ]
          this.updatePoints(res, locations)
        })
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        // 定义 dataMap 用于按 affectedArea 合并数据
        const dataMap = {};
        // 获取第一个数据源并合并
        getSecondaryDisaster(eqid).then(res1 => {
          // 检查 res1 是否为数组，若不是则将其包装为数组
          const data1 = Array.isArray(res1) ? res1 : [res1];
          data1.forEach(item => {
            const {affectedArea, evacuation, threatenedPopulation} = item;
            if (!dataMap[affectedArea]) {
              dataMap[affectedArea] = {affectedArea, evacuation: 0, threatenedPopulation: 0};
            }
            dataMap[affectedArea].evacuation += evacuation;
            dataMap[affectedArea].threatenedPopulation += threatenedPopulation;
          });

          getBarrierlakeSituation(eqid).then(res2 => {
            const data2 = Array.isArray(res2) ? res2 : [res2];
            data2.forEach(item => {
              const {affectedArea, evacuation, threatenedPopulation} = item;
              if (!dataMap[affectedArea]) {
                dataMap[affectedArea] = {affectedArea, evacuation: 0, threatenedPopulation: 0};
              }
              dataMap[affectedArea].evacuation += evacuation;
              dataMap[affectedArea].threatenedPopulation += threatenedPopulation;
            });

            const combinedData = Object.values(dataMap);
            this.updatePoints(combinedData);
          });
        });
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

    async searchLocations(villageList) {
      const positionList = []; // 用于存储所有结果
      const key = '4bf87471d3584b4b83c650b7fcbe67a1'; // 请替换为您的高德API密钥

      for (const village of villageList) {
        const result = await this.fetchLocation(village, key);
        if (result) {
          positionList.push(result);
        } else {
          console.warn(`未找到对应的村镇: ${village}`);
        }
      }

      this.positionList = positionList; // 假设 positionList 是一个用于存储结果的数组
      console.log('所有经纬度:', positionList);
      return positionList; // 返回结果
    },

    async fetchLocation(village, key) {
      const encodedVillage = encodeURIComponent(village);
      const requestString = `https://restapi.amap.com/v3/geocode/geo?address=${encodedVillage}&key=${key}`;

      console.log(`请求 URL: ${requestString}`); // 打印请求的 URL 以便调试

      try {
        const response = await fetch(requestString);
        if (!response.ok) {
          throw new Error(`网络响应错误: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API 返回数据:', data); // 打印 API 返回的数据以便调试

        if (data.geocodes && data.geocodes.length > 0) {
          const geocode = data.geocodes[0];
          if (geocode && geocode.location) {
            const location = geocode.location.split(',');
            return {
              name: village, // 村镇名称
              longitude: Number(location[0]),
              latitude: Number(location[1]),
            };
          }
        } else {
          console.warn(`未找到村镇: ${village}`);
          return null;
        }
      } catch (error) {
        console.error(`地理编码请求错误:`, error);
        return null; // 返回 null 表示请求失败
      }
    },

    updateMultiplePoints(allLocations) {
      // 遍历所有位置点
      allLocations.forEach(location => {
        if (this.selectedComponentKey === 'TransportationElectricity') {
          this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
            billboard: {
              image: location.img,  // 使用图片路径作为图标
              scale: 1.0,  // 固定缩放大小
              height: 40,
              width: 40,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
            },
            label: {
              text: location.name,  // 显示村落名字
              font: '12px sans-serif',
              fillColor: Cesium.Color.BLACK,
              showBackground: false,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              pixelOffset: new Cesium.Cartesian2(0, -15),  // 调整文字偏移
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
            }
          });
        }
      });
    },
    // 更新点标绘函数
    // updateMultiplePoints(locations) {
    //   locations.forEach(location => {
    //     this.viewer.entities.add({
    //       position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
    //       billboard: {
    //         image: location.img,
    //         scale: 0.8,
    //         verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER
    //       },
    //       label: {
    //         text: location.name,
    //         font: 'bold 12px sans-serif',
    //         fillColor: Cesium.Color.BLACK,
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY
    //       }
    //     });
    //   });
    // },

    updatePoints(data, situations) {
      const addLocationEntity = (location, count, img, height, width) => {
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          billboard: {
            image: img,
            scale: 1.0,  // 固定缩放大小
            height: height,
            width: width,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          label: {
            text: `${count}`,
            font: '14px sans-serif',
            fillColor: Cesium.Color.BLACK,
            showBackground: false,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -15),  // 调整文字偏移
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          }
        });
      };
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        // 遍历所有的转移位置
        this.transferLocations.forEach(location => {
          // 在 transferDataFromBackend 中查找对应位置的数据
          const transferItem = data.find(item => item.earthquakeAreaName === location.name);

          // 如果找不到对应的转移数据，设定人数为0
          const count = transferItem ? transferItem.cumulativeTransferred : 0;

          if (count === 0) {
            return;
          }

          // 当人数小于10时，设为10
          const adjustedCount = count < 10 ? 10 : count;
          const scale = Math.log(adjustedCount) / 5;  // 动态计算缩放比例
          const baseFontSize = 12;  // 定义基础字体大小
          const fontSize = Math.max(Math.round(scale * baseFontSize), 10);  // 动态计算字体大小，最小为10
          const imageHeight = 30;  // 假设图标的高度
          const dynamicOffsetY = -(imageHeight * scale / 2) - (fontSize / 2);  // 动态计算Y轴偏移量

          // 添加到 Cesium 实体
          this.viewer.entities.add({
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
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        // 遍历所有位置点
        situations.forEach(location => {
          const countItem = data.find(item => item.earthquakeAreaName === location.name);
          let count = null;
          let img = null;
          // 检查 countItem 是否存在
          if (countItem) {
            if (countItem.centralizedWaterProjectDamage) {
              count = countItem.centralizedWaterProjectDamage;
              img = damagedWaterSupply;
            } else if (countItem.waterSupplyPoints) {
              count = countItem.waterSupplyPoints;
              img = guaranteeWaterSupply;
            } else {
              return; // 如果两个属性都不存在，则跳过当前项
            }
          } else {
            return;// 如果 countItem 不存在，则跳过当前项
          }
          addLocationEntity(location, count, img, 35, 35)
        });
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        // 遍历所有数据
        data.forEach(dataItem => {
          let evacuationCount = null;
          let threatenedCount = null;

          // 定义函数来根据 count 查找对应的宽度和高度
          const getSizeByCount = (count, type) => {
            const legend = this.secondaryDisasterLegendData.find(legendItem => legendItem.name === type);
            if (legend) {
              const dataItem = legend.data.find(item => count >= item.range[0] && count <= item.range[1]);
              if (dataItem) {
                return {width: dataItem.width, height: dataItem.height, img: dataItem.img};
              }
            }
            return {width: 35, height: 35}; // 默认宽度和高度
          };

          if (dataItem.evacuation) {
            evacuationCount = dataItem.evacuation;
            const locations = [
              {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
              {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
              {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
              {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
              {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
              {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
              {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
              {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
            ]
            let location = locations.find(loc => loc.name === dataItem.affectedArea);
            const {width, height, img} = getSizeByCount(evacuationCount, '避险转移(户或人)');
            addLocationEntity(location, evacuationCount, img, width, height)
          }
          if (dataItem.threatenedPopulation) {
            threatenedCount = dataItem.threatenedPopulation;
            const locations = [
              {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
              {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
              {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
              {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
              {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
              {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
              {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
              {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
            ]
            let location = locations.find(loc => loc.name === dataItem.affectedArea);
            const { width, height, img } = getSizeByCount(threatenedCount, '受威胁群众(户或人)');
            addLocationEntity(location, threatenedCount, img, height, width)
          }
          // 如果 evacuationCount 和 threatenedCount 都为 null，则跳过当前项
          if (evacuationCount === null && threatenedCount === null) {
            return;
          }
        });
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

    //--------------------------------------------------下面是创建echarts的方法------------------------------------------

    updateMultipleECharts(data) {
      const locations = this.locations;
      const config = this.echartsConfigMap[this.selectedComponentKey];

      if (!config) return; // 若没有配置，跳过

      // 将 data 转换为 Map 以提高查找效率
      const districtMap = new Map(data.map(district => [district[config.locationKey], district]));

      // 这里是将echarts的xAxis的数据和颜色对应上，不会出现x轴和颜色不对应的问题
      let colorMapping = {};
      let categories = [];
      let chartType = ''
      const legend = this.echartsLegendData.find(legend => legend.name === config.legendName);
      if (legend) {
        chartType = legend.chartType;
        legend.data.forEach(item => {
          colorMapping[item.name] = item.color;
          categories.push(item.name);
        });
      }

      //循环遍历，生成图表
      locations.forEach((location, index) => {
        const chartContainer = this.$refs.echartsContainer[index];
        let chartInstance = this.echartsInstances[index];

        // 销毁旧的 ECharts 实例，避免重复渲染
        if (chartInstance) chartInstance.dispose();
        chartInstance = echarts.init(chartContainer);
        this.echartsInstances[index] = chartInstance;

        // 检查是否存在对应地区数据，如果不存在，则不在该区域生成图表
        const districtInfo = districtMap.get(location.name);
        if (!districtInfo) {
          chartInstance.clear();
          return;
        }

        // 获取值并进行过滤
        //确保只保留大于 0 的有效值,当有数据为0时，删除对应的echarts里的柱子
        const values = config.dataKeys.map(key => districtInfo[key] || 0);
        const filteredValues = [];
        const filteredCategories = [];
        categories.forEach((category, index) => {
          if (values[index] > 0) {
            filteredValues.push(values[index]);
            filteredCategories.push(category);
          }
        });

        // 如果该区域数据全部为0，清空图表
        if (filteredValues.length === 0) {
          chartInstance.clear();
          return;
        }

        // 更新图表
        this.updateChart(chartInstance, filteredValues, filteredCategories, colorMapping, config.labels, chartType);
      });

      // 添加 Cesium 场景的 postRender 事件
      if (!this.isPostRenderAdded) {
        this.viewer.scene.postRender.addEventListener(this.syncEChartsWithCesium);
        this.isPostRenderAdded = true;
      }
    },

    // 更新图表
    updateChart(chartInstance, values, categories, colorMapping, labelText, chartType = 'bar') {
      const isBarChart = chartType === 'bar';

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const index = params.dataIndex;
            const displayLabelText = Array.isArray(labelText) ? labelText[index] : labelText;
            return `<div style="font-size: 14px; background-color: rgba(255, 255, 255, 0.95);
                    border: 1px solid #ddd; border-radius: 4px; padding: 10px; width: auto;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    <strong style="color: #333;">${params.name}</strong><br/>
                    <div style="color: #555;"><span style="font-weight: bold;">${displayLabelText}:</span> ${params.value}</div></div>`;
          },
        },
        xAxis: isBarChart ? {
          type: 'category',
          data: categories,
          axisLabel: {show: false},
          axisLine: {show: false},
          axisTick: {show: false}
        } : null,
        yAxis: isBarChart ? {
          show: false,
          type: 'value',
          splitLine: {show: false},
          axisLine: {show: false},
          axisTick: {show: false}
        } : null,
        series: [
          {
            name: '数据类型',
            type: isBarChart ? 'bar' : 'pie',
            data: isBarChart
                ? values
                : values.map((value, i) => ({value, name: categories[i]})),
            itemStyle: {
              color: (params) => colorMapping[params.name] || '#ccc',
            },
            label: {
              show: true,
              position: 'inside',
              formatter: '{c}',  // 显示数值
              color: '#fff',
              fontSize: 12,
            },
            barCategoryGap: isBarChart ? '0%' : undefined,
            barWidth: isBarChart ? '100%' : undefined,
            radius: isBarChart ? undefined : '50%', // 设置为全圆饼图，没有空心区域
          },
        ],
      };

      chartInstance.setOption(option);
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

    //-------------------------------下面是地图 区块边界线 和 地域标签 以及 板块颜色 的设置---------------------------------

    // 设置区块颜色的方法
    updateDistrictColors(dataSource, districtData) {
      if (districtData) {
        const config = this.districtColorsConfigMap[this.selectedComponentKey];
        if (!config) return; // 若没有配置，跳过
        const legend = this.districtColorsLegendData.find(legend => legend.name === config.legendName);

        // 遍历后端传回的数据，判断并更新区块颜色
        dataSource.entities.values.forEach(entity => {
          const districtName = entity.name;
          const districtInfo = districtData.find(d => d[config.locationKey] === districtName);

          // 如果没有找到对应的数据，则将 affectedCount 设为 0
          const affectedCount = districtInfo ? districtInfo[config.dataKey] : 0;

          // 根据数量范围匹配相应的颜色
          const legendItem = legend.data.find(item =>
              affectedCount >= item.range[0] && affectedCount <= item.range[1]
          );

          if (legendItem) {
            const color = Cesium.Color.fromCssColorString(legendItem.color).withAlpha(0.8);
            // 更新区块的填充颜色
            entity.polygon.material = new Cesium.ColorMaterialProperty(color);
          }
        });
      } else if (this.selectedComponentKey === 'BuildingDamageInformation' || this.selectedComponentKey === 'SecondaryDisaster') {
        const colors = [
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
          {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
          {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
          {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
          {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
          {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
          {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
        ];
        // 遍历数据源的实体，根据名字设置颜色
        dataSource.entities.values.forEach(entity => {
          const entityName = entity.name;
          const colorEntry = colors.find(color => color.name === entityName);

          if (colorEntry) {
            // 更新区块的填充颜色
            entity.polygon.material = new Cesium.ColorMaterialProperty(colorEntry.color);
          }
        });
      } else {
        // 如果没有数据，设置默认颜色
        const defaultColor = Cesium.Color.fromCssColorString('#ffb3b3').withAlpha(0.6);
        dataSource.entities.values.forEach(entity => {
          entity.polygon.material = new Cesium.ColorMaterialProperty(defaultColor);
        });
      }
    },

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
        '石棉县': {lon: 102.34, lat: 28.99},
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
  width: auto; /* 宽度自适应内容 */
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
