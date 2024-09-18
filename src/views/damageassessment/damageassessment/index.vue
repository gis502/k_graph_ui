<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <!--  小组件  -->
      <!--    <div class="layers">-->
      <!--      <div class="layer" title="雅安市行政区划" @click="toggleYaanLayer"><img src="../../../assets/images/DamageAssessment/yaanRegion.png"></div>-->
      <!--    </div>-->

      <!-- 左侧表单 -->
      <div class="eqTable" v-show="isLeftShow">

        <div class="eqListContent" v-if="currentTab === '震害事件'">
          <div style="display: flex">
            <!-- 搜索框 -->
            <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq">
            </el-input>
          </div>
          <!-- 地震列表 -->
          <div class="eqList">
            <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="locateEq(eq)">
              <!-- 圆圈震级 -->
              <div style="width: 55px">
                <div class="eqMagnitude"
                     :style="{ backgroundColor: eq.magnitude >= 4.5 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
                  {{ eq.magnitude }}
                </div>
              </div>

              <!-- 地震名称与简要信息 -->
              <div class="eqText">
          <span
              class="eqTitle">
            {{ timestampToTime(eq.time, 'date') }}{{ eq.position }}{{ eq.magnitude }}级地震
          </span>
                <br/>
                <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ eq.time }}<br/>
            参考位置：{{ eq.position }}<br/>
            震中经纬：{{ eq.longitude }}°E, {{ eq.latitude }}°N<br/>
            震源深度：{{ eq.depth }}千米
          </span>
              </div>

              <!-- 详情按钮 -->
              <div class="eqTapToInfo" @click="toTab(eq)">详情</div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
                small
                layout="total, prev, pager, next"
                :total="filteredEqData.length"
                :page-size="pageSize"
                :current-page.sync="currentPage"
                @current-change="handleCurrentChange"
                style="margin: 0 20px"
            />
          </div>
        </div>

        <!--   指定地震   -->
        <div class="thisEq" v-if="currentTab !== '震害事件' && selectedTabData">
          <div class="eqInfo">
            <div style="height: 30px;display: flex;align-items: center">
              <div class="button return" @click="back()">返回</div>
            </div>
            <div style="height: 10px;background-color: #054576"></div>
            <el-divider content-position="left">
              <!--            <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 15px; width: 15px;">-->
              地震信息
            </el-divider>
            <div style="padding: 1px 20px 10px 20px">
              <!-- 显示选项卡内容 -->
              <h4>地震名称：{{ selectedTabData.position }} {{ selectedTabData.magnitude }}级地震</h4>
              <p>发震时刻：{{ selectedTabData.time }}</p>
              <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
              <p>地震震级：{{ selectedTabData.magnitude }}</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.position }}</p>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 地震专题</el-divider>

            <div class="eqTheme">
              <div class="button themes history" :class="{ active: isHistoryEqPointsShow }"
                   @click="showHistoryEqPoints(this.selectedTabData)"> 历史地震
              </div>
              <div class="button themes FaultZone" :class="{ active: isshowFaultZone }"
                   @click="showFaultZone(this.selectedTabData)"> 断裂带
              </div>
              <div class="button themes circle" :class="{ active: isshowOvalCircle }"
                   @click="showOvalCircle(this.selectedTabData)"> 烈度圈
              </div>
              <div class="button themes region" :class="{ active: isshowRegion }"
                   @click="toggleYaanLayer()"> 行政区划
              </div>

            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 大屏展示</el-divider>

            <div class="eqVisible">
              <div class="button toVisible" @click="navigateToVisualization(this.selectedTabData)"><img
                  src="../../../assets/icons/svg/druid.svg" style="height: 25px;width: 25px;">可视化大屏展示
              </div>
            </div>

          </div>
        </div>

      </div>
      <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
           @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
        <img src="../../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding" style="height: 60%;width: 60%;">
      </div>
      <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
        <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
      </div>

      <!-- 底部面板(考虑代码差异性过大，设计成子组件形式) -->
      <div class="panel">
        <historyEqPanel v-if="isHistoryEqPointsShow"
                        :historyEqData="historyEqData"
                        :selectedTabData="selectedTabData"
                        @hidden="hidden"/>
      </div>

      <div class="button showPanel" v-if="!isHistoryEqPointsShow && isShow"
           @click="isHistoryEqPointsShow=true, isShow=false">
        展开专题详情
      </div>
    </div>

    <!--  断裂带名称div  -->
    <div id="faultInfo" style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1; text-align: center;"></div>
  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import {getAllEq} from "@/api/system/eqlist";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import historyEqPanel from "../../../components/DamageAssessment/historyEqPanel.vue";
import fault_zone from "@/assets/geoJson/line_fault_zone.json";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import yaan from "@/assets/geoJson/yaan.json";
import sichuan from "@/assets/geoJson/sichuan.json";
export default {
  components: {
    TimeLinePanel,
    historyEqPanel,
  },

  data() {
    return {
      websock: null,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      getEqData: [],
      filteredEqData: [],
      pagedEqData: [],

      selectedTabData: null,
      selectedEqPoint: null,
      historyEqData: [],
      historyEqPoints: [],

      title: "",
      isLeftShow: true,
      isFoldShow: true,
      isFoldUnfolding: false,
      isHistoryEqPointsShow: false,
      isShow: false,
      isshowFaultZone:false, //断裂带显示隐藏
      faultzonelines:[], //断裂带线
      isshowOvalCircle:false, //烈度圈显示隐藏
      OvalCirclelayer:[],

      tabs: [],
      currentTab: '震害事件', // 默认选项卡设置为『震害事件』

      listEqPoints: [], // 列表地震点
      area: null,
      // layerVisible: true, // 图层可见性状态
      isshowRegion:true,//行政区划
      RegionLabels:[],
    };
  },
  mounted() {
    this.init();
    this.getEq();
  },

  methods: {
    // 获取地震列表并渲染
    getEq() {
      getAllEq().then((res) => {
        let resData = res.filter((item) => item.magnitude >= 4.5);
        let data = resData.map((item) => ({
          ...item,
          time: this.timestampToTime(item.time, "full"),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));

        this.getEqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
        // console.log("data:", data)
      });
    },

    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
      window.viewer = viewer;
      let options = {};
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.0, 29.98, 500000), // 设置经度、纬度和高度
      });
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
        103.0,
        29.98,
        500000,
        new Cesium.Cartographic()
      );
      options.enableCompass = true;
      options.enableZoomControls = true;
      options.enableDistanceLegend = true;
      options.enableCompassOuterRing = true;
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      window.navigation = new CesiumNavigation(viewer, options);
      document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
        "请输入地名进行搜索";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[0].innerHTML =
        "影像服务";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[1].innerHTML =
        "地形服务";

      this.initMouseEvents();
      this.renderQueryEqPoints();

      //雅安行政区加载
      let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.SKYBLUE.withAlpha(0.1),
        strokeWidth: 4,
      });
      geoPromise.then((dataSource) => {
        // console.log("dataSource",dataSource)
        window.viewer.dataSources.add(dataSource);
        dataSource.name = 'YaanRegionLayer'; // 给图层取名字,以便删除时找到

        const colors = [
          // {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
          {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
          {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
          {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
          {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
          {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
          {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
        ];
        dataSource.entities.values.forEach((entity, index) => {
          // console.log("dataSource entity",entity)
          // 根据实体索引依次从颜色数组中取颜色
          const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
          const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
          entity.polygon.material = colorMaterial; // 设置填充颜色
          // console.log("--------", index, "----------------", entity)
        });
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })

        //雅安行政区加载 end
      })
    },

    toggleYaanLayer() {
      // 切换图层显示与隐藏
      let yaanRegionLayer = window.viewer.dataSources.getByName("YaanRegionLayer")[0];
      if (yaanRegionLayer) {
        this.isshowRegion = !this.isshowRegion;
        yaanRegionLayer.show = this.isshowRegion; // 根据 isshowRegion 的值显示或隐藏图层
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
      }
      if(!this.isshowRegion){ //false
        // this.RegionLabels
        this.RegionLabels.forEach(entity => window.viewer.entities.remove(entity));
        this.RegionLabels=[]
      }
    },

    // 鼠标事件监听
    initMouseEvents() {
      const faultInfoDiv = document.getElementById('faultInfo');

      // 鼠标移动时设置指针样式
      window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = window.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 鼠标点击事件
      window.viewer.screenSpaceEventHandler.setInputAction((click) => {
        const pickedObject = window.viewer.scene.pick(click.position);

        // 与断裂带名称div绑定
        if (Cesium.defined(pickedObject) && pickedObject.id.polyline) {
          // 获取断裂带的 name 属性
          const faultName = pickedObject.id.properties.name._value;

          // 获取点击位置的地理坐标 (Cartesian3)
          const cartesian = viewer.scene.pickPosition(click.position);
          if (!Cesium.defined(cartesian)) {
            return;
          }

          // 将地理坐标 (Cartesian3) 转换为屏幕坐标 (二维)
          const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);

          // 显示 div 并将其定位到点击位置
          faultInfoDiv.innerHTML = `${faultName}`;
          faultInfoDiv.style.display = 'block';
          faultInfoDiv.style.left = screenPosition.x + 'px';
          faultInfoDiv.style.top = screenPosition.y + 'px';

          // 监听地图变化，动态更新 div 的位置
          window.viewer.scene.postRender.addEventListener(() => {
            const updatedScreenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);
            if (updatedScreenPosition) {
              faultInfoDiv.style.left = updatedScreenPosition.x + 'px';
              faultInfoDiv.style.top = updatedScreenPosition.y + 'px';
            }
          });

        }
        // 判断点击的是不是地震点
        else if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        }
        // 如果点击其他位置，隐藏所有地震点的标签，并关闭 faultInfoDiv
        else {
          this.selectedEqPoint.label._show._value = false;
          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
          this.historyEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
          // 隐藏 faultInfoDiv
          faultInfoDiv.style.display = 'none';
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },


    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      this.OvalCirclelayer.forEach(entity => window.viewer.entities.remove(entity));
      this.isshowOvalCircle=false
      // 清空之前的点
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = []; // 重置 listEqPoints

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: this.timestampToTime(eq.time, 'date') + eq.position + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,  // 左侧对齐
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,   // 底部对齐
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: eq.eqid
        });
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);  // 保存实体到 listEqPoints
      });
    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.getEqData.filter((eq) => {
          const dateStr = this.timestampToTime(eq.time, 'date');
          const positionStr = eq.position;
          const magnitudeStr = eq.magnitude;
          return (
            dateStr.includes(this.title) ||
            positionStr.includes(this.title) ||
            magnitudeStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.getEqData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    pickEqPoint(eq) {
      this.listEqPoints.forEach(entity => {
        entity.label._show._value = entity._id === eq.eqid;
        // console.log(entity.label)
      })
    },

    selectEqPoint() {
      // 检查 selectedTabData 是否存在
      if (this.selectedTabData) {
        // 清空 listEqPoints
        this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
        this.listEqPoints = [];

        // 避免选择同一选项卡时重复生成实体导致重叠
        window.viewer.entities.remove(this.selectedEqPoint);

        // 提取 selectedEqPoint
        this.selectedEqPoint = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            Number(this.selectedTabData.longitude),
            Number(this.selectedTabData.latitude)
          ),
          billboard: {
            image: eqMark,
            width: 25,
            height: 25,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: this.timestampToTime(this.selectedTabData.time, 'date') +
              this.selectedTabData.position +
              this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true, // 显示 label
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });

        // 渲染 selectedEqPoint
        // console.log("Selected Eq Point:", this.selectedEqPoint);
      } else {
        console.warn("No selectedTabData available");
      }
    },

    locateEq(eq) {
      this.pickEqPoint(eq);
      this.renderQueryEqPoints();

      // 提取地震的经纬度
      const longitude = parseFloat(eq.longitude);
      const latitude = parseFloat(eq.latitude);

      // 设置相机的飞行动作
      window.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000), // 目标位置
        orientation: {
          heading: Cesium.Math.toRadians(0.0), // 朝向 (0度)
          pitch: Cesium.Math.toRadians(-90.0), // 俯仰角 (-45度)
          roll: Cesium.Math.toRadians(0.0) // 翻滚角 (0度)
        },
      });
    },

    toTab(eq) {
      this.currentTab = `${eq.position} ${eq.magnitude}级地震`;
      if (this.currentTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.getEqData.find(
          eq => `${eq.position} ${eq.magnitude}级地震` === this.currentTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
        }
      }
    },

    back() {
      this.currentTab = '震害事件';
      this.selectedTabData = null;
      this.removeData()
    },

    removeData() {
      this.isHistoryEqPointsShow = false;

      // this.isshowOvalCircle = false;

      this.historyEqPoints.forEach(point => window.viewer.entities.remove(point));
      this.historyEqPoints = [];
      this.historyEqData = [];

      window.viewer.entities.remove(this.area);
      this.area = null;

      this.faultzonelines.forEach(item => {
        const entity = viewer.entities.getById(item.line);
        if (entity._layer === "断裂带") {
          viewer.entities.removeById(item.line)
        }
      })
      this.faultzonelines = [];
      this.isshowFaultZone = false;

      this.OvalCirclelayer.forEach(item => {
        if (item.oval._layername === "烈度圈") {
          // console.log(333)
          console.log(item)
          viewer.entities.remove(item.oval);
          viewer.entities.remove(item.label);
        }
      });
      this.OvalCirclelayer = [];
      this.isshowOvalCircle=false

      // this.OvalCirclelayer.forEach(entity => window.viewer.entities.remove(entity));
      // this.OvalCirclelayer = [];
    },

    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      // console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      viewer.entities.removeAll();
      this.renderQueryEqPoints();
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },

    showHistoryEqPoints(thisEq) {
      this.isHistoryEqPointsShow = !this.isHistoryEqPointsShow; // 切换状态

      if (this.isHistoryEqPointsShow) {

        if (this.area) {
          window.viewer.entities.remove(this.area);
          this.area = null;
        }

        // 添加圆圈
        this.area = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(thisEq.longitude), Number(thisEq.latitude)),
          ellipse: {
            semiMinorAxis: 50000.0,
            semiMajorAxis: 50000.0,
            material: Cesium.Color.YELLOW.withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            fill: true,
            clampToGround: true,
            height: 0,
            extrudedHeight: 0,
            rotation: 0,
          },
        });

        this.historyEqPoints.forEach(point => window.viewer.entities.remove(point));
        this.historyEqPoints = [];
        this.historyEqData = []; // 清空之前的数据

        const center = Cesium.Cartesian3.fromDegrees(Number(thisEq.longitude), Number(thisEq.latitude));

        // 渲染在圆圈内的地震点，并存储原始数据
        this.getEqData.forEach((eq) => {
          if (eq.eqid !== thisEq.eqid) {
            const position = Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude));

            if (this.isPointInEllipse(position, center, 50000.0, 50000.0)) {
              // 根据震级设置不同的图标大小
              const size = parseFloat(eq.magnitude) >= 6.0 ? 20 : 15;

              const point = window.viewer.entities.add({
                position: position,
                billboard: {
                  image: eqMark,
                  width: size,
                  height: size,
                  eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
                },
                label: {
                  show: false,
                  showBackground: true,
                  text: this.timestampToTime(eq.time, 'date') + eq.position + eq.magnitude + '级地震',
                  font: '16px sans-serif',
                  fillColor: Cesium.Color.WHITE,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                },
              });

              this.historyEqPoints.push(point);
              this.historyEqData.push(eq);  // 存储原始数据
            }
          }
        });
      } else {
        if (this.area) {
          window.viewer.entities.remove(this.area);
          this.area = null;
        }

        this.historyEqPoints.forEach(point => window.viewer.entities.remove(point));
        this.historyEqPoints = [];
        this.historyEqData = []; // 清空数据
      }
    },


    // 判断点是否在椭圆内部的方法
    isPointInEllipse(point, center, semiMinorAxis, semiMajorAxis) {
      // 计算点到中心的距离
      const distance = Cesium.Cartesian3.distance(point, center);

      // 半径取最大值
      const radius = Math.max(semiMajorAxis, semiMinorAxis);

      // 判断点是否在圆内
      return distance <= radius;
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}`;
      window.open(path, '_blank');
    },

    hidden(hidden) {
      this.isHistoryEqPointsShow = hidden;
      this.isShow = true;
    },

    // 时间戳转换
    timestampToTime(timestamp, format = "full") {
      let dateObj = new Date(timestamp);
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      let day = dateObj.getDate();
      let hh = dateObj.getHours();
      let mm = dateObj.getMinutes();
      let ss = dateObj.getSeconds();

      // 去掉前导零
      month = month > 9 ? month : month.toString().replace(/^0/, "");
      day = day > 9 ? day : day.toString().replace(/^0/, "");
      hh = hh > 9 ? hh : "0" + hh;
      mm = mm > 9 ? mm : "0" + mm;
      ss = ss > 9 ? ss : "0" + ss;

      if (format === "date") {
        // 返回仅日期格式
        return `${year}年${month}月${day}日`;
      } else {
        // 返回完整的日期时间格式
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
      }
    },

    //断裂带--------------------------------------------------------------------------------------
    //两条断裂带之间的距离
    getLonAndLatDistance(lonAndlat) {
      let [coordinate1, coordinate2] = lonAndlat;
      let [lon1, lat1] = [
        parseFloat(coordinate1[0]),
        parseFloat(coordinate1[1]),
      ];
      let [lon2, lat2] = [
        parseFloat(coordinate2[0]),
        parseFloat(coordinate2[1]),
      ];
      let [radlat1, radlat2] = [
        (lat1 * Math.PI) / 180.0,
        (lat2 * Math.PI) / 180.0,
      ];
      let a = radlat1 - radlat2;
      let b = (lon1 * Math.PI) / 180.0 - (lon2 * Math.PI) / 180.0;
      let s =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radlat1) *
            Math.cos(radlat2) *
            Math.pow(Math.sin(b / 2), 2)
          )
        );
      s = s * 6378.137;
      return Math.round(s * 10000) / 10000;
    },
    //断裂带加载  200千米以内
    showFaultZone() {
      this.isshowFaultZone = !this.isshowFaultZone;
      if (this.isshowFaultZone) {
        // let lines = []
        this.faultzonelines = []
        fault_zone.forEach((item) => {
          for (let i = 0; i < item.lonlat[0].length; i++) {
            if (
              this.getLonAndLatDistance([
                [this.selectedTabData.longitude, this.selectedTabData.latitude],
                item.lonlat[0][i],
              ]) < 200
            ) {
              this.faultzonelines.push(item);
              break;
            }
          }
        })

        // console.log("faultzonelines", this.faultzonelines)

        this.faultzonelines.forEach((item) => {
          let positionsArr = [];
          for (var i = 0; i + 1 < item.lonlat[0].length; i++) {
            positionsArr.push(
              parseFloat(item.lonlat[0][i][0]),
              parseFloat(item.lonlat[0][i][1]),
              0
            );
          }
          // console.log("positionsArr",positionsArr)
          window.viewer.entities.add({
            id: item.line,
            polyline: {
              status: 1,
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(positionsArr),
              width: 5,
              material: Cesium.Color.RED,
              depthFailMaterial: Cesium.Color.YELLOW,
              clampToGround: true,
            },
            properties: {
              name: item.name
            },
            layer: "断裂带"
          })
        })
      } else {
        this.faultzonelines.forEach(item => {
          const entity = viewer.entities.getById(item.line);
          if (entity._layer === "断裂带") {
            viewer.entities.removeById(item.line)
          }
        })
        this.faultzonelines = []
      }
    },
    //烈度圈------------------------------------------------------------------
    showOvalCircle() {
      this.isshowOvalCircle = !this.isshowOvalCircle;

      let colorIntensity = [
        "#990000",
        "#cc0000",
        "#ff0000",
        "#ff6600",
        "#FF9900",
        "#ffcc00",
      ];

      let intensityLabels = [
        "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "X", "XI", "XII"
      ];
      let intensityLabelsChinese = [
        "六", "七", "八", "九", "十", "十一", "十二"
      ];

      if (this.isshowOvalCircle) {
        let angle_num = this.angle(parseFloat(this.selectedTabData.longitude), parseFloat(this.selectedTabData.latitude));
        let angle_num_tmp;
        let [longAndshort, longintenArray] = this.EllipseDraw(this.selectedTabData.magnitude);

        for (let i = longAndshort.length - 1; i >= 0; i--) {
          if (longAndshort[i][1] > longAndshort[i][0]) {
            let temp = longAndshort[i][0];
            longAndshort[i][0] = longAndshort[i][1];
            longAndshort[i][1] = temp;
            angle_num_tmp = angle_num + 90;
          } else {
            angle_num_tmp = angle_num;
          }

          // 计算椭圆边界的内部位置
          const semiMajorAxis = longAndshort[i][0];
          const semiMinorAxis = longAndshort[i][1];
          const radius = Math.max(semiMajorAxis, semiMinorAxis) * 0.8; // 标签距离边界的距离
          const offsetAngle = Cesium.Math.toRadians(angle_num_tmp); // 椭圆的旋转角度

          // 计算标签位置
          const offsetX = radius * Math.cos(offsetAngle);
          const offsetY = radius * Math.sin(offsetAngle);

          // 渲染椭圆
          let ovalEntity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(parseFloat(this.selectedTabData.longitude), parseFloat(this.selectedTabData.latitude), 0),
            ellipse: {
              semiMinorAxis: semiMinorAxis,
              semiMajorAxis: semiMajorAxis,
              material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorIntensity[i]).withAlpha(0.5)),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(colorIntensity[i]),
              outlineWidth: 9,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              fill: true,
              clampToGround: true,
              height: 0,
              extrudedHeight: 0,
              rotation: Cesium.Math.toRadians(angle_num_tmp),
            },
            layername: "烈度圈",
          });

          // 添加显示烈度的标签
          let labelEntity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              parseFloat(this.selectedTabData.longitude) + offsetX / 111320,
              parseFloat(this.selectedTabData.latitude) + offsetY / 110540,
              0
            ),
            label: {
              //最多画到6度
              text: "烈度 : " + intensityLabels[longintenArray[i] - 6]+" (" + intensityLabelsChinese[longintenArray[i] - 6]+ "度)",
              font: '18px Sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              show: true,
              eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
            },
            layername: "烈度圈",
          });

          this.OvalCirclelayer.push({
            oval: ovalEntity,
            label: labelEntity
          });
        }

        // console.log(123)
        // console.log(this.OvalCirclelayer)

      } else {
        this.OvalCirclelayer.forEach(item => {
          if (item.oval._layername === "烈度圈") {
            // console.log(333)
            console.log(item)
            viewer.entities.remove(item.oval);
            viewer.entities.remove(item.label);
          }
        });
        this.OvalCirclelayer = [];
      }
    },

    degree2Radium(deg) { //角度转弧度
      return deg * (Math.PI / 180);
    },
    radium2Degree (rad)  {
      return rad * (180 / Math.PI);
    },
    getPointsForEllipse (lat1, lon1, xaxis, yaxis, rotation) {
      //axis distance in km
      var rEarth = 6371.01; //# Earth's average radius in km
      var rXaxis = (xaxis * 68) / rEarth;
      var rYaxis = (yaxis * 68) / rEarth; //that shall be km distance, just use xaxis/yaxis at line 44, 45 if you want to measure by dms

      var rRotation = this.degree2Radium(rotation);
      var polygonRings = [];
      for (var i = 0; i <= 360; i += 10) {
        var t = this.degree2Radium(i); // # ellipse math ref
        var x = rXaxis * Math.cos(t); // # ellipse math
        var y = rYaxis * Math.sin(t); // # ellipse math
        var rot_x = lon1 + (x * Math.cos(rRotation)) - (y * Math.sin(rRotation)); // # rotate/transpose ellipse
        var rot_y = lat1 + (y * Math.cos(rRotation)) + (x * Math.sin(rRotation)); // # rotate/transpose ellipse
        //console.log([rot_x, rot_y]);
        polygonRings.push([rot_x, rot_y]);
      }
      return polygonRings;
    },
    EllipseDraw (magnitude) {
      let longintenArray = []; //长轴烈度
      let shortintenArray = []; //短轴烈度
      let longAxisArray = []; //长轴数组
      let shortAxisArray = []; //短轴数组
      let longAndshort = []; //最终的长短轴数组，单位：千米
      var numi = 0;
      let R = 0 //震源到目标区域的距离，因为只需要震中的烈度，所以令其为零


      //汪素云-四川盆地
      let longAxis = 4.0293 + 1.3003 * magnitude - 3.6404 * Math.log10(R + 10); //长轴的烈度值
      let shortAxis = 2.3816+ 1.3003 * magnitude - 2.8573 * Math.log10(R + 5); //短轴的烈度值

      // console.log("longAxis,shortAxis",longAxis,shortAxis)
      for (var i = Math.floor(longAxis); i >= 6; i--) {
        // console.log(i)
        if (longAxisArray.length >= 6) {
          break;
        }
        longintenArray.push(i); //长轴烈度

        R =
          // Math.exp(
          //     (2.795+1.600 * magnitude - i) /1.637
          // ) -28.497;
          Math.pow(10,
            ( 4.0293 + 1.3003 * magnitude - i) / 3.6404
          ) - 10;
        // console.log(R)
        longAxisArray.push(R);
      }
      for (var j = Math.floor(shortAxis); j >= 6; j--) {
        //计算烈度衰减圈的每一圈距离
        //限制最多显示的烈度圈数
        if (shortAxisArray.length >= 6) {
          break;
        }
        shortintenArray.push(j); //短轴烈度
        let R1 =
          // Math.exp(
          //     (1.331+1.218 * magnitude - j) /1.381
          // ) -  8.88;
          Math.pow(10,
            (2.3816+ 1.3003 * magnitude  - j) / 2.8573
          ) - 5;
        shortAxisArray.push(R1);
      }
      for (let i = 0; i <= shortAxisArray.length - 1; i++) {
        if (longAxisArray[i] != null && shortAxisArray[i] != null) {
          (function (item, index) {
            var xy = new Array();
            xy[0] = longAxisArray[index]*1000; //将符合条件每个长轴储存起来
            xy[1] = shortAxisArray[index]*1000; //将符合条件每个短轴储存起来
            longAndshort[item] = xy;
          })(numi, i);
          numi++;
        }
      }
      // console.log("shortAxisArray",shortAxisArray);
      // console.log("longAxisArray",longAxisArray);
      // console.log("longAndshort",longAndshort);
      // console.log("longintenArray",longintenArray);
      return [longAndshort, longintenArray];
    },
    angle (lon, lat) {
      var angle_list = [];
      for (var i = 0; i < fault_zone.length; i++) {
        var length_list = [];
        for (var line = 0; line < fault_zone[i].lonlat[0].length; line++) { //////算出每一个断裂带的坐标与当前震中坐标的距离（单位：度数）
          length_list.push(Math.sqrt(Math.pow(lon - parseFloat(fault_zone[i].lonlat[0][line][0]), 2) + Math.pow(lat - parseFloat(fault_zone[i].lonlat[0][line][1]), 2)))
        }
        length_list.sort(function (a, b) {
          return a - b
        });
        angle_list.push([i, length_list[0]])
      }
      angle_list.sort(function (a, b) {
        return a[1] - b[1]
      })
      var angle_ = fault_zone[angle_list[0][0]].angle;
      return angle_;
    },


  }
};
</script>

<style scoped lang="less">
.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

// 左侧地震面板
.eqTable {
  position: absolute;
  right: 0;
  width: 333px;
  height: 100%;
  z-index: 3;
  background-color: #2d3d51;
}

// 选项卡
.tab {
  display: flex;
  width: calc(100% - 30px);
  height: 40px;
  background-color: #2d3d51;
  color: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tabItem {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #0d325f;
  height: 40px;
  padding: 0 10px;
  white-space: nowrap;
}

.tabItem.active {
  background-color: #409eff;
}

.closeIcon {
  margin-left: 10px;
  cursor: pointer;
}

// 开关
.fold {
  position: absolute;
  right: 323px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 50px;
  background-color: #2d3d51;
  -webkit-border-top-left-radius: 10px;
  -webkit-border-bottom-left-radius: 10px;
  cursor: pointer;
  z-index: 4;
  transition: width 0.3s ease; /* 宽度过渡动画 */
}

.unfold {
  position: absolute;
  right: 0;
  width: 30px;
  height: 40px;
  background-color: rgba(48, 65, 86, 0.5);
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

// 搜索框
.query {
  width: calc(100% - 20px);
  margin: 10px;
}

// 地震列表
.eqList {
  position: relative;
  height: 85vh;
  overflow-y: auto;
}

.eqCard {
  display: flex;
  height: 110px;
  border-bottom: #0d325f 2px solid;
  cursor: pointer;
}

.eqCard:hover {
  background-color: #202933;
  transition: all 0.3s;
}

// 圆圈震级
.eqMagnitude {
  display: flex;
  height: 35px;
  width: 35px;
  margin: 10px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
}

// 地震简要文本信息
.eqText {
  padding-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.eqTitle {
  display: inline-block;
  max-width: 260px;
  position: relative;
  transform: translateX(0);
  will-change: transform;
  color: #409eff;
  font-size: 15px;
}

.eqText .eqTitle:hover {
  transform: translateX(-50%);
  transition: transform 5.0s ease;
}

.eqText .eqTitle {
  transition: none;
}

// 详情按钮
.eqTapToInfo {
  position: absolute;
  right: 10px;
  margin-top: 70px;
  width: 60px;
  height: 30px;
  border: #0d325f 1.5px solid;
  border-radius: 5px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.eqTapToInfo:hover {
  border: #2aa4f1 1.5px solid;
  color: #2aa4f1;
  transition: all 0.3s;
}

// 分页容器
.pagination {
  position: absolute;
  bottom: 0;
  width: 327px;
  background-color: #2d3d51;
}

::v-deep .pagination .el-pagination__total {
  color: white;
}

// 指定地震面板
.thisEq {
  height: 100%;
  overflow: auto;
}

.eqInfo {

}

.return {
  width: 40px;
  height: 25px;
  border: #fff 1px solid;
  border-radius: 8px;
  font-size: 12px;
  margin-left: auto; /* 使按钮靠右 */
}

.return:hover {
  border-color: #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.eqTheme {
  height: 150px;
  padding-left: 30px;
  margin: 0 auto;
  clear: both;
}

.themes {
  float: left;
  position: relative;
  margin: 5px 15px 15px 0;
  font-size: 15px;
  height: 34%;
  width: 44%;
  border: #fff 1px solid;
  cursor: pointer;
}

.themes:hover {
  background-color: #409eff;
  border: none;
}

.themes.active {
  background-color: #409eff;
  border: none;
}

// 大屏展示
.eqVisible {
  display: flex;
  height: 80px;
  width: 100%;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.toVisible {
  margin-bottom: 0;
  width: 200px;
  height: 50px;
  border: #fff 1px solid;
  border-radius: 25px;
  font-size: 18px;
}

.toVisible:hover {
  color: #409eff;
  border-color: #409eff;
  transition: all 0.3s;
}

// 底部面板
.panel {
  position: absolute;
  width: 100%;
  height: 250px;
  bottom: 0;
  z-index: 2;
}

.showPanel {
  position: absolute;
  left: 10px;
  bottom: 0;
  width: 120px;
  height: 40px;
  background-color: #2d3d51;
  -webkit-border-top-left-radius: 10px;
  -webkit-border-top-right-radius: 10px;
  z-index: 2;
}

.showPanel:hover {
  color: #2aa4f1;
  transition: all 0.3s;
}


::v-deep .el-divider__text.is-left {
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
}

h4, p {
  color: #fff;
}

p {
  font-size: 14px;
}

// 滚动条样式
::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

// 公共按钮，居中与字体颜色
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

span {
  color: #fff;
}


.layers {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 4;
}

.layer {
  width: 25px;
  height: 25px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

::v-deep .el-scrollbar {
  background-color: #2d3d51;
}

::v-deep .el-table__header-wrapper {
  background-color: #2d3d51;
}

::v-deep .el-table__inner-wrapper::before {
  display: none;
}

</style>
