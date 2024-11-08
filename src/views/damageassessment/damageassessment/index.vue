<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <!--  小组件  -->
      <!--    <div class="layers">-->
      <!--      <div class="layer" title="雅安市行政区划" @click="toggleYaanLayer"><img src="../../../assets/images/DamageAssessment/yaanRegion.png"></div>-->
      <!--    </div>-->

      <!-- 左侧表单 -->
      <div class="eqTable" v-show="isLeftShow">

        <div class="eqListContent" v-if="thisTab === '震害事件'">
          <div style="display: flex">
            <!-- 搜索框 -->
            <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq" clearable>
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
            {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}{{ eq.magnitude }}级地震
          </span>
                <br/>
                <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ eq.occurrenceTime }}<br/>
            参考位置：{{ eq.earthquakeName }}<br/>
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
        <div class="thisEq" v-if="thisTab !== '震害事件' && selectedTabData">
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
              <h4>地震名称：{{ selectedTabData.earthquakeName }} {{ selectedTabData.magnitude }}级地震</h4>
              <p>发震时刻：{{ selectedTabData.occurrenceTime }}</p>
              <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
              <p>地震震级：{{ selectedTabData.magnitude }}</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 地震专题</el-divider>

            <div class="eqTheme">
              <div class="button themes region"
                   :class="{ active: eqThemes.show.isshowRegion }"
                   @click="handleToggleYaanLayer"> 行政区划
              </div>
              <div class="button themes history" :class="{ active: eqThemes.show.isshowHistoryEqPoints }"
                   @click="showHistoryEqPoints()"> 历史地震
              </div>
              <div class="button themes faultZone" :class="{ active: eqThemes.show.isshowFaultZone }"
                   @click="showFaultZone()"> 断裂带
              </div>
              <div class="button themes circle" :class="{ active: eqThemes.show.isshowOvalCircle }"
                   @click="showOvalCircle()"> 烈度圈
              </div>
              <div class="button themes personDeath" :class="{ active: eqThemes.show.isshowPersonalCasualty }"
                   @click="showPersonalCasualty()"> 人员伤亡
              </div>
              <div class="button themes buildingDamage" :class="{ active: eqThemes.show.isshowBuildingDamage }"
                   @click="showBuildingDamage()"> 建筑破坏
              </div>
              <div class="button themes economicLoss" :class="{ active: eqThemes.show.isshowEconomicLoss }"
                   @click="showEconomicLoss()"> 经济损失
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
        <img src="../../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
             style="height: 60%;width: 60%;">
      </div>
      <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
        <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
      </div>

      <!-- 底部面板(考虑代码差异性过大，设计成子组件形式) -->
      <div class="panel" v-if="eqPanel.isHistoryEqPanelShow">
        <historyEqPanel
          :historyEqData="panelData.historyEqData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="panel" v-if="eqPanel.isBuildingDamagePanelShow">
        <buildingDamagePanel
          :buildingDamageData="panelData.buildingDamageData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="panel" v-if="eqPanel.isEconomicLossPanelShow">
        <economicLossPanel
          :economicLossData="panelData.economicLossData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="panel" v-if="eqPanel.isPersonalCasualtyPanelShow">
        <personalCasualtyPanel
          :personalCasualtyData="{ PersonalCasualtyNum: PersonalCasualtyNum, yaancasual: yaancasual, yaanitemcasual: yaanitemcasual }"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="button showPanel" v-if="!eqPanel.isHistoryEqPanelShow && isShow"
           @click="unfoldInfo(this.currentTab)">
        展开专题详情
      </div>
    </div>

    <!--  断裂带名称div  -->
    <div id="faultInfo"
         style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1; text-align: center;"></div>

    <!--  选项卡  -->
    <div class="tabs" v-if="shouldShowTabs">
      <div v-for="(tab, index) in tabs" :key="tab" class="tabItem"
           :class="{ active: currentTab === tab }" @click="changeTab(tab)">
        <span>{{ tab }}</span>
        <span class="closeIcon" @click.stop="removeTab(tab, index)">×</span>
      </div>

      <div class="hidden"
           style="float: right;width: 30px;height: 30px;border: #1f2d3d 2px solid;margin: 5px 338px 5px auto;display: flex;align-items: center;justify-content: center;color: #fff;font-size: 50px;cursor: pointer;"
           @click="hidden()"> -
      </div>
    </div>

  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import {getAllEq} from "@/api/system/eqlist";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import HistoryEqPanel from "../../../components/DamageAssessment/historyEqPanel.vue";
import PersonalCasualtyPanel from "../../../components/DamageAssessment/personalCasualtyPanel.vue";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import yaan from "@/assets/geoJson/yaan.json";
import {addFaultZones, addHistoryEqPoints, addOvalCircles, computeOvalCircles} from "../../../cesium/plot/eqThemes.js";
import BuildingDamagePanel from "../../../components/DamageAssessment/buildingDamagePanel.vue";
import {getPersonDes, getBuildingDamage, saveBuildingDamageData, getEconomicLoss, saveEconomicLossData} from "../../../api/system/damageassessment.js";
import EconomicLossPanel from "../../../components/DamageAssessment/economicLossPanel.vue";
import sichuanCounty from "@/assets/geoJson/sichuanCounty.json";

export default {
  components: {
    PersonalCasualtyPanel,
    EconomicLossPanel,
    BuildingDamagePanel,
    TimeLinePanel,
    HistoryEqPanel,
  },

  data() {
    return {
      thisTab: "震害事件",
      websock: null,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      eqData: [],
      filteredEqData: [],
      pagedEqData: [],

      selectedEntityPosition: '',
      selectedTabData: null,
      selectedEqPoint: null,
      historyEqPoints: [],

      title: "",
      isLeftShow: true,
      isFoldShow: true,
      isFoldUnfolding: false,
      isShow: false,

      faultzonelines: [],
      OvalCirclelayer: [],

      // 地震专题
      eqThemes: {
        allEles: [
          'historyEq',
          'faultZone',
          'ovalCircle',
          'economicLoss',
          'buildingDamage',
          'personalCasualty',
        ],
        layers: [
          // 'historyEq',
          'economicLoss',
          'buildingDamage',
          'personalCasualty'
        ],
        show: {
          isshowHistoryEqPoints: false,
          isshowRegion: false,
          isshowFaultZone: false,
          isshowOvalCircle: false,
          isshowPersonalCasualty: false,
          isshowBuildingDamage: false,
          isshowEconomicLoss: false,
        },
      },

      // 面板显隐
      eqPanel: {
        isHistoryEqPanelShow: false,
        isBuildingDamagePanelShow: false,
        isEconomicLossPanelShow: false,
        isPersonalCasualtyPanelShow: false
      },

      // 面板数据
      panelData: {
        historyEqData: [],
        economicLossData: [],
        buildingDamageData: [],
        personalCasualtyData: [],
      },

      PersonalCasualtyNum: 0,
      yaancasual: false,
      yaanitemcasual: [],

      //选项卡
      tabs: [],
      currentTab: "",

      // 列表地震
      listEqPoints: [],

      // 行政区划
      RegionLabels: [],
      sichuanRegionLabels: [],

      // 图层数据
      //经济损失economicLoss

      ecoLegendColor: [
        '(255, 234, 203)',
        '(255, 216, 173)',
        '(255, 198, 143)',
        '(254, 167, 88)',
        '(250, 148, 64)',
        '(245, 135, 38)',
        '(255, 216, 173)',
      ],

      //建筑破坏buildingDamage

      bddLegendColor: [
        '(232, 236, 248)',
        '(188, 197, 228)',
        '(114, 143, 199)',
        '(84, 127, 195)',
        '(55, 109, 185)',
        '(28, 96, 174)',
        '(0, 84, 165)',
      ],

      //人员伤亡personalCasualty

      pcLegendColor: [
        '(255, 255, 255, 0)',
        '(254, 204, 203)',
        '(255, 177, 167)',
        '(254, 151, 134)',
        '(253, 128, 106)',
        '(245, 101, 75)',
        '(240, 78, 53)',
        '(231, 50, 31)',
        '(218, 0, 0)',
      ],

      // 图层专题需要处理的数据
      layerData: {
        ecoData: {},
        bddData: {},
        pcData: {},
      },

      // 映射
      tabMapping: {
        "历史地震": ['isHistoryEqPanelShow', 'isshowHistoryEqPoints', 'historyEq'],
        "建筑破坏": ['isBuildingDamagePanelShow', 'isshowBuildingDamage', 'buildingDamage', 'bddData'],
        "经济损失": ['isEconomicLossPanelShow', 'isshowEconomicLoss', 'economicLoss', 'ecoData'],
        "人员伤亡": ['isPersonalCasualtyPanelShow', 'isshowPersonalCasualty', 'personalCasualty', 'pcData']
      },

    };
  },

  mounted() {
    this.init();
    this.getEq();
    // this.initWebsocket()
  },

  computed: {
    // 选项卡显隐
    shouldShowTabs() {
      return Object.values(this.eqPanel).some(value => value);
    }
  },

  beforeUnmount() {
    console.log("111",window.viewer)
    if (window.viewer){
      let viewer=window.viewer
      let gl=viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl=null
      window.viewer = null;
    }
  },

  methods: {

    // 初始化要做的
    // -----------------------------------------------------------------------------------------------------------------

    // 获取地震列表并渲染
    getEq() {
      getAllEq().then((res) => {
        let resData = res.filter((item) => item.magnitude >= 4.5);
        let data = resData.map((item) => ({
          ...item,
          occurrenceTime: this.timestampToTime(item.occurrenceTime, "full"),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));
        this.eqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
        // console.log("data:", data)
      });
    },

    // 初始化Cesium
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
      this.toggleYaanLayer('colorful')
    },

    // 注册鼠标事件监听
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
        this.selectedEntityPosition = this.calculatePosition(click.position);
        // 与断裂带名称div绑定
        if (Cesium.defined(pickedObject) && pickedObject.id.polyline) {
          // 获取断裂带的 name 属性
          const faultName = pickedObject.id.properties.name._value;

          if (faultName) {
            // 获取点击位置的地理坐标 (Cartesian3)
            const cartesian = viewer.scene.pickPosition(click.position);
            if (!Cesium.defined(cartesian)) {
              return;
            }

            // 更新 faultInfo 的位置和内容
            this.updateFaultInfoPosition(faultName);

            // 显示 faultInfo
            faultInfoDiv.style.display = 'block';

            // 监听地图变化，动态更新 div 的位置
            window.viewer.scene.postRender.addEventListener(() => {
              this.updateFaultInfoPosition(faultName);
            });
          }
        }
        // 判断点击的是不是地震点
        else if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        }
        // 如果点击其他位置，隐藏所有地震点的标签，并关闭 faultInfoDiv
        else {
          if (this.selectedEqPoint) {
            this.selectedEqPoint.label._show._value = false;
          }

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
      this.eqThemes.show.isshowOvalCircle = false

      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = [];

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
            text: this.timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
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
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);
      });
    },

    // 雅安行政区划
    toggleYaanLayer(require) {

      if (require === "colorful") {
        this.removeLayers(['YaanRegionLayer'])
        this.eqThemes.show.isshowRegion = true;
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.1),
          strokeWidth: 4,
        });
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          dataSource.name = 'YaanRegionLayer';

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
          dataSource.entities.values.forEach((entity, index) => {
            const colorIndex = index % colors.length;
            entity.polygon.material = new Cesium.ColorMaterialProperty(colors[colorIndex].color);
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
      }
      else if (require === "none") {
        this.eqThemes.show.isshowRegion = true;
        this.removeLayers(['YaanRegionLayer'])
        this.RegionLabels.forEach(label => {
          window.viewer.entities.remove(label);
        })
        this.RegionLabels = []
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.1),
          strokeWidth: 4,
        });
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          dataSource.name = 'YaanRegionLayer';
          dataSource.entities.values.forEach((entity, index) => {
            entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0);
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.WHITE;
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
      } else if (require === "remove") {
        this.eqThemes.show.isshowRegion = false;
        this.removeLayers(['YaanRegionLayer'])

        this.RegionLabels.forEach(label => {
          window.viewer.entities.remove(label);
        })
        this.RegionLabels = []
      }
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 分页查询区块
    // -----------------------------------------------------------------------------------------------------------------

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
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

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.eqData.filter((eq) => {
          const dateStr = this.timestampToTime(eq.occurrenceTime, 'date');
          const positionStr = eq.earthquakeName;
          const magnitudeStr = eq.magnitude;
          return (
            dateStr.includes(this.title) ||
            positionStr.includes(this.title) ||
            magnitudeStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.eqData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 面板模块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中列表地震后：右侧面板模块

    // 切换到对应面板
    toTab(eq) {
      this.thisTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
      if (this.thisTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.eqData.find(
          eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.thisTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
          computeOvalCircles(this.selectedTabData);
        }
      }
    },

    selectEqPoint() {
      if (this.selectedTabData) {
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
            text: this.timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
              this.selectedTabData.earthquakeName +
              this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });
      }
    },

    // Cesium定位
    locateEq(eq) {
      this.pickEqPoint(eq);
      this.renderQueryEqPoints();

      // 提取地震的经纬度
      const longitude = parseFloat(eq.longitude);
      const latitude = parseFloat(eq.latitude);

      // 设置相机的飞行动作
      window.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: Cesium.Math.toRadians(0.0)
        },
      });
    },

    pickEqPoint(eq) {
      this.listEqPoints.forEach(entity => {
        entity.label._show._value = entity._id === eq.eqid;
      })
    },

    // 选中图层专题后：选项卡模块

    // 添加新选项卡
    addTab(panel) {
      this.tabs.push(panel)
      this.changeTab(panel);
    },

    // 切换选项卡
    changeTab(tabName) {
      // 将中文 tab 映射到相应的数据和图层类型
      const tabMapping = {
        '经济损失': {data: this.layerData.ecoData, type: "economicLoss"},
        '建筑破坏': {data: this.layerData.bddData, type: "buildingDamage"},
        '人员伤亡': {data: this.layerData.pcData, type: "personalCasualty"}
      };

      this.currentTab = tabName;
      // 根据 tabName 加载对应的图层数据和类型
      if (tabMapping[tabName]) {
        this.addThemeLayer(tabMapping[tabName].data, tabMapping[tabName].type);
      }

      const tab = this.transferTab(tabName)[0];
      // 如果 tabs 中包含该 tabName，打开对应面板，否则添加 tab
      if (this.tabs.includes(tabName)) {
        this.eqPanel[tab] = true;
      } else {
        this.addTab(tabName);
      }

      // 关闭其他面板，保留当前 tab 面板
      Object.keys(this.eqPanel).forEach(key => {
        this.eqPanel[key] = (key === tab);
      });
    },

    // 删除选项卡
    removeTab(tabName, index) {
      const [panel, info, layerType, dataKey] = this.transferTab(tabName);

      if (tabName in this.tabMapping) {
        // 通过映射对象清理对应数据
        this.layerData[dataKey] = {};
        this.removeEntitiesByType([layerType]);
        this.removeLayers([layerType]);
      }

      // 多个：删除当前选项卡
      if (this.currentTab === this.tabs[index] && this.tabs.length !== 1) {

        this.eqPanel[panel] = false;
        this.eqThemes.show[info] = false;

        const nextTabIndex = this.tabs[index - 1] ? index - 1 : index + 1;
        this.currentTab = this.tabs[nextTabIndex];
        const [nextPanel, , nextLayer, nextData] = this.transferTab(this.currentTab);

        this.eqPanel[nextPanel] = true;
        this.addThemeLayer(this.layerData[nextData], nextLayer);

      }
      // 多个：删除的不是当前选项卡
      else if (this.tabs.length !== 1 && this.currentTab !== this.tabs[index]) {

        this.eqThemes.show[info] = false;
      }
      // 单个：删除最后的选项卡
      else if (this.tabs.length === 1) {
        this.eqPanel[panel] = false;
        this.eqThemes.show[info] = false;
        this.toggleYaanLayer('colorful');
      }

      // 移除选项卡
      this.tabs.splice(index, 1);
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 功能按钮区块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中地震后返回
    back() {
      this.toggleYaanLayer('remove')
      this.tabs = []
      this.thisTab = '震害事件';
      this.selectedTabData = null;
      this.PersonalCasualtyNum = 0;
      this.yaancasual = false;
      this.yaanitemcasual = []

      const faultInfoDiv = document.getElementById('faultInfo');
      faultInfoDiv.style.display = 'none';

      this.removeEntitiesByType(["historyEq", "faultZone", "ovalCircle"])
      this.renderLayers([])

      const setValues = (obj, value) => {
        Object.keys(obj).forEach(key => {
          obj[key] = value;
        });
      };
      setValues(this.eqThemes.show, false);
      setValues(this.eqPanel, false);
      setValues(this.panelData, []);

      this.toggleYaanLayer('colorful')

      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
          103.0,
          29.98,
          500000
      );
      viewer.camera.flyTo({destination: position,})
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}`;
      window.open(path, '_blank');
    },

    // 专题面板最小化
    hidden() {
      Object.keys(this.eqPanel).forEach(panel => {
        this.eqPanel[panel] = false;
      });
      this.isShow = true;
    },

    // 专题面板展开
    unfoldInfo(currentTab) {
      const tab = this.transferTab(currentTab)[0]
      this.eqPanel[tab] = true;
      this.isShow = false;
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 地震专题与渲染(图层专题需要在 工具函数 addThemeLayer() 中处理)
    // -----------------------------------------------------------------------------------------------------------------

    // 历史地震(半径50km以内)
    showHistoryEqPoints() {
      const tabName = "历史地震"

      if (!this.tabs.includes('历史地震')) {
        this.eqThemes.show.isshowHistoryEqPoints = true; // 切换状态
        this.eqPanel.isHistoryEqPanelShow = true;

        if (this.eqThemes.show.isshowHistoryEqPoints) {
          addHistoryEqPoints(this.selectedTabData, this.eqData);
          const semiMinorAxis = 50000.0;
          const semiMajorAxis = 50000.0;
          const center = Cesium.Cartesian3.fromDegrees(Number(this.selectedTabData.longitude), Number(this.selectedTabData.latitude));
          this.eqData.forEach((eq) => {
            if (eq.eqid !== this.selectedTabData.eqid) {
              const position = Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude));

              const distance = Cesium.Cartesian3.distance(position, center);
              const radius = Math.max(semiMajorAxis, semiMinorAxis);

              if (distance <= radius) {
                this.panelData.historyEqData.push(eq);
              }
            }
          });
          this.addTab(tabName)
        } else {
          this.removeEntitiesByType(["historyEq"]); // 切换为隐藏时，移除历史地震
        }
      } else {
        this.removeEntitiesByType(["historyEq"]); // 切换为隐藏时，移除历史地震
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index)
      }
    },

    // 断裂带(半径200km以内)
    showFaultZone() {
      this.eqThemes.show.isshowFaultZone = !this.eqThemes.show.isshowFaultZone;
      if (this.eqThemes.show.isshowFaultZone) {
        addFaultZones(this.selectedTabData)
      } else {
        this.removeEntitiesByType(["faultZone"])
        const faultInfoDiv = document.getElementById('faultInfo');
        faultInfoDiv.style.display = 'none';
      }
    },

    // 烈度圈
    showOvalCircle() {
      this.eqThemes.show.isshowOvalCircle = !this.eqThemes.show.isshowOvalCircle;
      if (this.eqThemes.show.isshowOvalCircle) {
        addOvalCircles(this.selectedTabData)
      } else {
        this.removeEntitiesByType(["ovalCircle"])
      }
    },

    // 建筑破坏
    showBuildingDamage() {
      const tabName = "建筑破坏";
      const type = "buildingDamage";
      this.eqThemes.show.isshowBuildingDamage = !this.eqThemes.show.isshowBuildingDamage;

      if (this.eqThemes.show.isshowBuildingDamage) {
        this.addTab(tabName);

        getBuildingDamage(this.selectedTabData.eqid).then(res => {

          if (res.length === 0) {

            // 计算估算面积
            const s = parseFloat(this.calculateArea(this.selectedTabData ,type));

            // 获取受影响的区县
            const affectedCounties = this.getAffectedCounties(
              parseFloat(this.selectedTabData.latitude),
              parseFloat(this.selectedTabData.longitude),
              this.calculateRadius(parseFloat(this.selectedTabData.magnitude))
            );

            // 按距离从近到远排序
            affectedCounties.sort((a, b) => a.distance - b.distance);

            // 分配size
            let totalSize = 0;
            const countySizes = affectedCounties.map((county, index) => {
              // 修改为距离越近（index 越小）的区县，分得的 size 越大
              const size = s * Math.pow(1.1, affectedCounties.length - index); // 指数分布，指数 1.1 可以调整
              totalSize += size;
              return { county: county.name, size }; // 不需要在这里保留两位小数
            });

            // 归一化，调整总和为 s
            const sizeAdjustmentFactor = s / totalSize;
            const saveBuildingDamage = countySizes.map(({ county, size }) => {
              // 保留两位小数，并进行调整，确保返回数字类型
              return {eqid : this.selectedTabData.eqid, county, size: parseFloat((size * sizeAdjustmentFactor).toFixed(2)) }; // 转换为数字类型
            });

            res = saveBuildingDamage;
            saveBuildingDamageData(saveBuildingDamage)

          }


          this.panelData.buildingDamageData = res;
          this.layerData.bddData = res.reduce((acc, item) => {
            acc[item.county] = item.size;
            return acc;
          }, {});
          this.addThemeLayer(this.layerData.bddData, type);

          if (this.eqThemes.show.isshowRegion) {
            this.toggleYaanLayer('none');
          }
        });
      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type]);
        this.removeEntitiesByType([type]);
        this.layerData.bddData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer('colorful');
        }
      }
    },

    // 经济损失
    showEconomicLoss() {
      const tabName = "经济损失";
      const type = "economicLoss";
      this.eqThemes.show.isshowEconomicLoss = !this.eqThemes.show.isshowEconomicLoss;

      if (this.eqThemes.show.isshowEconomicLoss) {
        this.addTab(tabName);

        getEconomicLoss(this.selectedTabData.eqid).then(res => {
          if (res.length === 0) {

            // 计算估算面积
            const s = parseFloat(this.calculateArea(this.selectedTabData, type)) * 2.5; // 使用经济损失计算公式

            // 获取受影响的区县
            const affectedCounties = this.getAffectedCounties(
              parseFloat(this.selectedTabData.latitude),
              parseFloat(this.selectedTabData.longitude),
              this.calculateRadius(parseFloat(this.selectedTabData.magnitude))
            );

            // 按距离从近到远排序
            affectedCounties.sort((a, b) => a.distance - b.distance);

            // 分配经济损失
            let totalSize = 0;
            const countyLosses = affectedCounties.map((county, index) => {
              const loss = s * Math.pow(1.1, affectedCounties.length - index); // 距离越近的区县，分得的损失越大
              totalSize += loss;
              return { county: county.name, amount: loss }; // 使用 amount 作为属性名
            });

            // 归一化，调整总和为 s
            const lossAdjustmentFactor = s / totalSize;
            const saveEconomicLoss = countyLosses.map(({ county, amount }) => {
              return { eqid: this.selectedTabData.eqid, county, amount: parseFloat((amount * lossAdjustmentFactor).toFixed(2)) }; // 转换为数字类型
            });

            res = saveEconomicLoss; // 更新 res 为分配后的损失数据

            saveEconomicLossData(saveEconomicLoss)

          }

          this.panelData.economicLossData = res;

          // 将经济损失数据整理为适合的格式
          this.layerData.ecoData = res.reduce((acc, item) => {
            acc[item.county] = item.amount;
            return acc;
          }, {});

          // 添加主题图层并等待其完成
          this.addThemeLayer(this.layerData.ecoData, type);

          if (this.eqThemes.show.isshowRegion) {
            this.toggleYaanLayer('none');
          }
        });
      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type]);
        this.removeEntitiesByType([type]);
        this.layerData.ecoData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer('colorful');
        }
      }
    },

    // 人员伤亡评估
    showPersonalCasualty() {
      const tabName = "人员伤亡";
      const type = "personalCasualty";
      this.eqThemes.show.isshowPersonalCasualty = !this.eqThemes.show.isshowPersonalCasualty;
      if (this.eqThemes.show.isshowPersonalCasualty) {
        this.addTab(tabName);

        getPersonDes(this.selectedTabData.eqid).then(res => {
          this.PersonalCasualtyNum = res.casualAll;
          this.yaancasual = res.yaancasual !== "无";
          this.yaanitemcasual = this.yaancasual ? [
            {id: '0', name: "雨城区", num: res["雨城区"] || 0},
            {id: '1', name: "名山区", num: res["名山区"] || 0},
            {id: '2', name: "荥经县", num: res["荥经县"] || 0},
            {id: '3', name: "汉源县", num: res["汉源县"] || 0},
            {id: '4', name: "石棉县", num: res["石棉县"] || 0},
            {id: '5', name: "天全县", num: res["天全县"] || 0},
            {id: '6', name: "芦山县", num: res["芦山县"] || 0},
            {id: '7', name: "宝兴县", num: res["宝兴县"] || 0},
          ] : [];

          // console.log('预估伤亡总数', this.PersonalCasualtyNum);
          // console.log('地区伤亡情况', this.yaanitemcasual);

          // 将人员伤亡数据整理为适合的格式
          this.layerData.pcData = {
            "雨城区": res["雨城区"] || 0,
            "名山区": res["名山区"] || 0,
            "荥经县": res["荥经县"] || 0,
            "汉源县": res["汉源县"] || 0,
            "石棉县": res["石棉县"] || 0,
            "天全县": res["天全县"] || 0,
            "芦山县": res["芦山县"] || 0,
            "宝兴县": res["宝兴县"] || 0,
          };

          // 添加主题图层并等待其完成
          this.addThemeLayer(this.layerData.pcData, type)
          if (this.eqThemes.show.isshowRegion) {
            this.toggleYaanLayer('none');
          }
        });

      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type])
        this.removeEntitiesByType([type]);
        this.layerData.pcData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer('colorful')
        }
      }
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 工具函数
    // -----------------------------------------------------------------------------------------------------------------

    // 计算估算面积
    calculateArea(selectedTabData, type) {
      const magnitude = parseFloat(selectedTabData.magnitude);
      const r = this.calculateRadius(magnitude); // 计算半径
      const area = Math.PI * Math.pow(r, 2); // 计算圆面积
      if (type === 'buildingDamage') {
        return (area * 0.02).toFixed(2); // 返回面积的2%，保留两位小数
      } else if (type === 'economicLoss') {
        return (area * 80).toFixed(2); // 返回面积的80倍，保留两位小数
      }

    },

    // 计算震级对应的影响半径
    calculateRadius(magnitude) {
      if (magnitude < 4.5) throw new Error("Invalid magnitude");

      const radiusMap = [
        { min: 4.5, max: 5.0, r1: 2, r2: 5 },
        { min: 5.0, max: 5.5, r1: 5, r2: 10 },
        { min: 5.5, max: 6.0, r1: 11, r2: 30 },
        { min: 6.0, max: 6.5, r1: 30, r2: 50 },
        { min: 6.5, max: 7.0, r1: 50, r2: 80 },
        { min: 7.0, max: 8.0, r1: 80, r2: 200 },
        { min: 8.0, max: Infinity, r1: 200, r2: 200 }
      ];

      const range = radiusMap.find(r => magnitude >= r.min && magnitude <= r.max);
      return range ? range.r1 + (magnitude - range.min) * (range.r2 - range.r1) / (range.max - range.min) : 200;
    },

    // 获取受影响的区县
    getAffectedCounties(latitude, longitude, radius) {
      const affectedCounties = [];
      const counties = sichuanCounty.features;

      for (const feature of counties) {
        const countyName = feature.properties.name; // 获取区县名称
        const coordinates = feature.geometry.coordinates;

        // 由于可能是多边形，循环检查每个多边形的坐标
        let isAffected = false;
        let distanceToEpicenter = null; // 初始化距离

        for (const polygon of coordinates) {
          // 对于每个多边形，检查其是否包含震中点
          if (this.isPointInPolygon([longitude, latitude], polygon[0])) {
            isAffected = true;
            break;
          }

          // 如果多边形未包含震中点，则检查多边形的所有顶点是否在影响半径内
          for (const point of polygon[0]) {
            const countyLat = point[1];
            const countyLng = point[0];

            // 计算距离
            const distance = this.calculateDistance(latitude, longitude, countyLat, countyLng);

            // 如果距离小于或等于半径，则该区县在影响范围内
            if (distance <= radius) {
              isAffected = true;
              distanceToEpicenter = distance;
              break;
            }
          }
          // 找到影响的区县后停止检查
          if (isAffected) break;
        }

        if (isAffected) {
          affectedCounties.push({
            name: countyName,
            distance: distanceToEpicenter
          });
        }
      }

      return affectedCounties;
    },

    // 判断点是否在多边形内部的函数
    isPointInPolygon(point, polygon) {
      const [lng, lat] = point; // 震中点
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect = ((yi > lat) !== (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      return inside;
    },


    // 计算两点间距离
    calculateDistance(lat1, lon1, lat2, lon2) {
      // 地球半径，单位：千米
      const R = 6371;
      const dLat = this.degreesToRadians(lat2 - lat1);
      const dLon = this.degreesToRadians(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * Math.sin(dLon / 2) ** 2;
      // 哈弗辛公式
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    // 角度转换为弧度
    degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    },

    // 检查条件并调用相应的 toggleYaanLayer 方法
    handleToggleYaanLayer() {
      const {isshowPersonalCasualty, isshowBuildingDamage, isshowEconomicLoss, isshowRegion} = this.eqThemes.show;
      if (isshowRegion) {
        this.toggleYaanLayer('remove');
      } else if (isshowPersonalCasualty || isshowBuildingDamage || isshowEconomicLoss) {
        this.toggleYaanLayer('none');
      } else {
        this.toggleYaanLayer('colorful');
      }
    },

    // 10.6 渲染图层
    addThemeLayer(layerData, type) {

      this.renderLayers("");

      if (layerData) {
        const entries = Object.entries(layerData);
        const counties = entries.map(([key]) => key);
        const numbers = entries.map(([, value]) => value);
        const layerName = `${type}`;

        // 加载 sichuanCounty.json 数据
        Cesium.GeoJsonDataSource.load(sichuanCounty).then((geoJsonDataSource) => {
          viewer.dataSources.add(geoJsonDataSource);
          geoJsonDataSource.name = layerName;

          const entities = geoJsonDataSource.entities.values;

          entities.forEach((entity) => {
            const countyName = entity.name;

            // 如果县区存在于传入的 layerData 中
            if (counties.includes(countyName)) {
              const index = counties.indexOf(countyName);
              const number = numbers[index];

              let colorIndex, legendColorArray;

              // 根据不同的图层类型计算颜色索引
              if (type === 'economicLoss') {
                colorIndex = this.getColorIndex(number, this.ecoLegendColor, [10000, 50000, 100000, 200000, 500000, 1000000]);
                legendColorArray = this.ecoLegendColor;
              } else if (type === 'buildingDamage') {
                colorIndex = this.getColorIndex(number, this.bddLegendColor, [1, 5, 10, 20, 50, 100]);
                legendColorArray = this.bddLegendColor;
              } else if (type === 'personalCasualty') {
                if (number < 1) {
                  this.setPolygonTransparent(entity);
                  return;
                }
                colorIndex = this.getColorIndex(number, this.pcLegendColor, [1, 5, 10, 20, 50, 100, 250, 500]);
                legendColorArray = this.pcLegendColor;
              }

              // 设置填充颜色和边框
              this.setPolygonColor(entity, legendColorArray[colorIndex]);
              // 添加标签
              this.addRegionLabel(entity, countyName, type);
            } else {
              // 如果县区不在 layerData 中，设置为透明并隐藏边线
              this.setPolygonTransparent(entity);
            }
          });

          this.renderLayers(type);
        });
      }

    },

    // 获取颜色索引
    getColorIndex(number, legendColor, threshold) {
      for (let i = 0; i < threshold.length; i++) {
        if (number < threshold[i]) return i;
      }
      // 超过最大阈值，使用最后一个颜色
      return legendColor.length - 1;
    },

    // 设置填充颜色和边框
    setPolygonColor(entity, colorString) {
      const rgb = this.getRgbFromColorString(colorString);
      entity.polygon.material = Cesium.Color.fromBytes(rgb[0], rgb[1], rgb[2], 200);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.WHITE;
    },

    // 将字符串颜色解析为 RGB 数组
    getRgbFromColorString(colorString) {
      return colorString
        .replace('(', '')
        .replace(')', '')
        .split(',')
        .map((c) => parseInt(c.trim()));
    },

    // 设置为透明
    setPolygonTransparent(entity) {
      entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0);
      entity.polygon.outline = false;
    },

    // 添加标签
    addRegionLabel(entity, countyName, type) {
      const center = entity._properties._center._value;
      if (center && center.length === 2) {
        const position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
        viewer.entities.add(new Cesium.Entity({
          position: position,
          label: new Cesium.LabelGraphics({
            text: countyName,
            scale: 1,
            font: '18px Sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            fillColor: Cesium.Color.fromCssColorString("#ffffff"),
            pixelOffset: new Cesium.Cartesian2(0, 0),
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
          }),
          properties: {type},
        }));
      }
    },

    // 将中文转化成对应要用的属性，[0]为控制对应底部面板展示，[1]为控制对应右侧信息展示，[2]为图层专题名，[3]为专题数据
    // 目前使用映射处理，如果有新增，请先在this.tabMapping处注册
    transferTab(tabName) {
      return this.tabMapping[tabName] || [];
    },

    // 更新 faultInfo 的位置
    updateFaultInfoPosition(faultName) {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            window.viewer.scene,
            Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            const faultInfoDiv = document.getElementById('faultInfo');
            faultInfoDiv.style.left = canvasPosition.x + 'px';
            faultInfoDiv.style.top = canvasPosition.y + 'px';
            faultInfoDiv.innerHTML = `${faultName}`;
          }
        }
      });
    },

    // 计算点击位置的经纬度
    calculatePosition(clickPosition) {
      let ray = viewer.camera.getPickRay(clickPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let height = this.isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      return {
        x: longitude,
        y: latitude,
        z: height
      };
    },

    // 判断地形是否加载完毕
    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        return true;
      }
      return false;
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 公用函数
    // -----------------------------------------------------------------------------------------------------------------

    //根据类型移除实体
    removeEntitiesByType(types) {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].properties?.type && types.includes(entities[i].properties.type.getValue())) {
          window.viewer.entities.remove(entities[i]);
        }
      }
    },

    // 专门用来移除指定图层
    removeLayers(layersToRemove) {
      // layersToRemove 是一个数组
      layersToRemove.forEach(layerName => {
        let layer = window.viewer.dataSources.getByName(layerName)[0];
        if (layer) {
          window.viewer.dataSources.remove(layer);
        }
      });
    },

    // 专门用来渲染指定图层，同时去掉（隐藏/销毁）其他图层
    renderLayers(layerToRender) {
      // layerToRender 是一个变量
      const layersToRemove = this.eqThemes.layers.filter(layer => layer !== layerToRender);
      this.removeLayers(layersToRemove)
      this.removeEntitiesByType(layersToRemove)
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

    // -----------------------------------------------------------------------------------------------------------------

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
  bottom: 0;
  width: 333px;
  height: calc(100% - 50px);
  z-index: 3;
  background-color: #2d3d51;
}

.closeIcon {
  margin-left: 10px;
  cursor: pointer;
}

// 开关
.fold {
  position: absolute;
  top: 50px;
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
  top: 50px;
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
  height: calc(85vh - 60px);
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
  width: 333px;
  background-color: #2d3d51;
  border: 2px solid #FFFFFF; /* 白色边框 */
}

::v-deep .pagination .el-pagination__total {
  color: white;
}

// 指定地震面板
.thisEq {
  height: 100%;
  overflow: auto;
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
  margin: 5px 15px 10px 0;
  font-size: 15px;
  height: 22%;
  width: 28%;
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

// 选项卡
.tabs {
  position: absolute;
  bottom: 250px;
  height: 42px;
  width: 100%;
  background-color: rgba(45, 61, 81, 0.8);
  border-bottom: #000 2px solid;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  z-index: 2;
}

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
  float: left;
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

// 底部面板
.panel {
  position: absolute;
  width: 100%;
  height: 250px;
  bottom: 0;
  z-index: 2;
  background-color: rgba(45, 61, 81, 0.8);
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

.PersonalCasualty {
  position: absolute;
  z-index: 20;
  background-color: #2b323a;
  width: 17%;
  height: 50%;
  top: 7.5%;
  right: 22%;
}

::v-deep .el-divider__text.is-left {
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
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

h4, p {
  color: #fff;
}

p {
  font-size: 14px;
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

:deep(.cesium-baseLayerPicker-dropDown-visible) {
  z-index: 100 !important;
  background-color: #2b323a;
}

:deep(.cesium-baseLayerPicker-dropDown) {
  right: -5px !important;
}

::v-deep .compass {
  position: absolute;
  top: 20px;
  left: 20px;
}

::v-deep .navigation-controls {
  position: absolute;
  top: 120px;
  left: 53px;
}
:deep(.distance-legend) {
  bottom: 7% !important;
}
</style>
