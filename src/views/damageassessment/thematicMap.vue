<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <!--  小组件  -->
      <!--    <div class="layers">-->
      <!--      <div class="layer" title="雅安市行政区划" @click="toggleYaanLayer"><img src="../../../assets/images/DamageAssessment/yaanRegion.png"></div>-->
      <!--    </div>-->

      <!-- 右侧表单 -->
      <div class="eqTable">
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
                     :style="{ backgroundColor: eq.magnitude >= 4.0 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
                  {{ eq.magnitude }}
                </div>
              </div>

              <!-- 地震名称与简要信息 -->
              <div class="eqText">
          <span
            class="eqTitle">
            {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}{{eq.magnitude}}级地震
          </span>
                <br/>
                <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ timestampToTime(eq.occurrenceTime, "fullDateTime") }}<br/>
            参考位置：{{ eq.earthquakeName }}<br/>
            震中经纬：{{ eq.longitude }}°E, {{ eq.latitude }}°N<br/>
            震源深度：{{ eq.depth }}千米<br/>
            地震类型：{{ eq.eqType === 'Z' ? '真实地震' : (eq.eqType === 'Y' ? '演练地震' : '测试地震') }}

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
              <h4>地震名称：{{ selectedTabData.earthquakeName }}</h4>
              <p>发震时刻：{{ timestampToTime(selectedTabData.occurrenceTime, "fullDateTime") }}</p>
              <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
              <p>地震震级：{{ selectedTabData.magnitude }}</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
<!--              <p>信息来源：中国地震预警网[试运行]</p>-->
            </div>

            <div style="height: 10px;background-color: #054576"></div>


            <div class="eqTheme">
              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.thematicMap }"
                   @click="handlePanel(`thematicMap`)">专题图
              </div>

              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.report }"
                   @click="handlePanel(`report`); isPreviewShow = false;">灾情报告
              </div>

              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.instrument }"
                   @click="handlePanel(`instrument`);">台网数据
              </div>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <div class="eqTheme" style="margin-top: -15px">
              <a class="button themes" href="http://172.26.86.31:18100" target="_blank">
                产出图件管理
              </a>
            </div>
            <div class="button themes"
                 :class="{ active: isPanelShow.AssistantDecision }"
                 style="height: 45px;margin-top: -15px;margin-bottom: 10px"
                 @click="handlePanel(`AssistantDecision`); isPreviewShow = false;">辅助决策产出
            </div>

            <div style="height: 10px;background-color: #054576"></div>
            <el-divider content-position="left">大屏展示</el-divider>

            <div class="eqVisible">
              <div class="button toVisible" @click="navigateToVisualization(this.selectedTabData)"><img
                src="../../assets/icons/svg/druid.svg" style="height: 25px;width: 25px;">可视化大屏展示
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="eqPanel" v-if="isPanelShow.thematicMap || isPanelShow.report || isPanelShow.instrument||isPanelShow.AssistantDecision">
        <h2>{{ this.outputData.themeName }}</h2>
        <div style="width: 100%;height: calc(100% - 120px);text-align: center;color: #fff;font-size: 16px" v-if="isNoData">
          该地震暂无评估图件产出
        </div>
        <div class="mapItem" v-if="this.outputData.type === `thematicMap`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="map-item"
               @mouseenter="handleOpen(index)" @mouseleave="handleClose()">
            <div class="panelButtons" v-if="showPanelButtonsIndex === index">
              <div class="panelButton download" @click="handleDownloadMap(item.imgUrl)">下载</div>
              <div class="panelButton preview" @click="handleOpenPreview(item.theme, item.imgUrl)">预览</div>
            </div>
            <img :src="item.imgUrl" style="width: 95%; height: 80%;"/>
            <p style="margin: 10px; ">{{ item.theme }}</p>
          </div>
        </div>

        <div class="reportItem" v-if="this.outputData.type === `report`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="report-item" @click="handleDownloadReport(item.docxUrl)">
            <img src="../../assets/images/DamageAssessment/wordIcon.png" style="margin-right: 50px">
            {{ item.theme }}
          </div>
        </div>
        <div class="reportItem" v-if="this.outputData.type === `AssistantDecision`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="report-item" @click="handleJueCeReport(item.docxUrl)">
            <img src="../../assets/images/DamageAssessment/wordIcon.png" style="margin-right: 20px">
            {{ item.theme }}
          </div>
        </div>

        <div class="mapItem" v-if="this.outputData.type === `instrument`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="map-item"
               @mouseenter="handleOpen(index)" @mouseleave="handleClose()">
            <div class="panelButtons" v-if="showPanelButtonsIndex === index">
              <div class="panelButton download" @click="handleDownloadMap(item.imgUrl)">下载</div>
              <div class="panelButton preview" @click="handleOpenPreview(item.theme, item.imgUrl)">预览</div>
            </div>
            <img :src="item.imgUrl" style="width: 95%; height: 80%;"/>
            <p style="margin: 10px; ">{{ item.theme }}</p>
          </div>
        </div>
      </div>

      <div class="thematicMapPreview" v-if="isPreviewShow">
        <h2>{{ this.imgName }}</h2>
        <img :src="this.imgUrl" style="width: 95%; height: 80%;">
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 5px">
          <el-button type="primary" @click="handleDownloadMap()">下载</el-button>
          <el-button plain type="primary" @click="handleClosePreview()" style="margin-left: 200px;">关闭</el-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "../../cesium/tool/initCesium.js";
import {
  getEqList, getEqOutPutJueCe, getEqOutPutJueCes,
  getEqOutputMaps,
  getEqOutputReports
} from "../../api/system/damageassessment.js";
import yaan from "../../assets/geoJson/yaan1.json";
import {handleOutputData, timestampToTime} from "../../cesium/plot/eqThemes.js";
import eqMark from "@/assets/images/DamageAssessment/eqMark.png";

export default {
  components: {},

  data() {
    return {
      isTerrainLoading: false,
      viewer: null,
      thisTab: "震害事件",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      eqData: [],
      filteredEqData: [],
      pagedEqData: [],

      eqid: "",
      eqqueueId: "",
      earthquakeFullName: "",

      selectedEntityPosition: '',
      selectedTabData: null,
      selectedEqPoint: null,
      title: "",
      // 地震专题
      isPanelShow: {
        thematicMap: false,
        report: false,
        instrument: false,
        AssistantDecision:false
      },
      isPreviewShow: false,
      // 记录当前显示的 panelButtons 索引，默认为 null
      showPanelButtonsIndex: null,
      // 列表地震
      listEqPoints: [],
      // 行政区划
      RegionLabels: [],

      // 产出数据
      outputData: {},
      imgName: '',
      imgUrl: '',

      isNoData: false,
    };
  },

  mounted() {
    this.init();
    this.getEq();
    this.viewer = new Cesium.Viewer("cesiumContainer");
    this.addEventListeners();
  },

  beforeUnmount() {
    console.log("111", window.viewer)
    if (window.viewer) {
      let viewer = window.viewer
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl = null
      window.viewer = null;
    }
  },

  methods: {
    timestampToTime,

    // 不知道为什么要在上面这里导入，可能是template里面的调用要这么搞？？？

    // 初始化要做的
    // -----------------------------------------------------------------------------------------------------------------
    addEventListeners() {
      // 延迟绑定事件，确保控件已经加载
      this.$nextTick(() => {
        const baseLayerContainer = document.querySelector(
          ".cesium-baseLayerPicker-dropDown"
        );

        if (baseLayerContainer) {
          // 事件代理监听点击事件
          baseLayerContainer.addEventListener("click", (event) => {
            const clickedIcon = event.target.closest(
              ".cesium-baseLayerPicker-itemIcon"
            );
            const clickedLabel = event.target.closest(
              ".cesium-baseLayerPicker-itemLabel"
            );

            if (clickedIcon || clickedLabel) {
              console.log("是否加载了地形图：", this.isTerrainLoaded())
              this.isTerrainLoading = this.isTerrainLoaded()
              this.toggleYaanLayer()
            }
          });
        }
      });
    },

    // 获取地震列表并渲染
    getEq() {
      const eqListDTO = {
        pageNum: 1,
        pageSize: 10,
      }
      getEqList(eqListDTO).then((res) => {
        let resData = res.data.filter((item) => item.magnitude >= 4.0);
        let data = resData.map((item) => ({
          ...item,
          occurrenceTime: timestampToTime(item.occurrenceTime, "full"),
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
      this.toggleYaanLayer();
      this.renderQueryEqPoints();
    },

    // 注册鼠标事件监听
    initMouseEvents() {
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
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
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
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = [];

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
          },
          label: {
            text: timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
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
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);
      });
    },

    // 雅安行政区划
    toggleYaanLayer() {
      let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
        clampToGround: this.isTerrainLoading, //贴地显示
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
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
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        //雅安行政区加载 end
      })

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
          const dateStr = timestampToTime(eq.occurrenceTime, 'date');
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

    // 切换到对应面板
    toTab(eq) {
      // console.log(eq)
      this.isNoData = false
      this.thisTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
      this.eqid = eq.eqid
      this.eqqueueId = eq.eqqueueId
      this.earthquakeFullName = eq.earthquakeFullName

      /**
       *  下面的
       *  "T2024110313362251182600"
       *  需要改成传eq.eqid
       *  并且需要改后端调用的接口
       */

      if (this.thisTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.eqData.find(
          eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.thisTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
          // console.log(this.selectedTabData)
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
            text: timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
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

    handlePanel(type) {
      for (const key in this.isPanelShow) {
        if (this.isPanelShow.hasOwnProperty(key)) {
          if (key !== type && this.isPanelShow[key] === true) {
            this.isPanelShow[key] = false;
          }
        }
      }

      this.isPanelShow[type] = !this.isPanelShow[type];
      //  if (this.isPanelShow.AssistantDecision){
      //   //辅助决策报告
      //   this.isNoData = false
      //   this.outputData.themeData = [
      //     {
      //       docxUrl: "http://59.213.183.7/image" +
      //           "/EqProduct/357a36dd-00b6-4562-90fd-abc66a294f60" +
      //           "/1/本地产品/灾情报告/02月28日10时38分四川省雅安市荥经县荥河镇发生6.8级地震（辅助决策信息一）.docx",
      //       theme: "灾情报告1"
      //     },
      //   ]
      // }
      if (this.isPanelShow.thematicMap || this.isPanelShow.report|| this.isPanelShow.AssistantDecision) {

        getEqOutputMaps(this.eqid, this.eqqueueId).then((res) => {
          console.log("专题图", res.data)
        })

        getEqOutputReports(this.eqid, this.eqqueueId).then((res) => {
          console.log("灾情报告", res.data)
        })

        // getEqOutPutJueCes(this.eqid, this.eqqueueId).then((res)=>{
        //   console.log("决策报告",res.data)
        // })


        console.log("开始进行评估------------------------")

        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, type).then((res) => {

          console.log("评估结果",res)

          this.outputData.themeName = res.themeName;

          this.outputData.themeData = res.themeData;
          this.outputData.type = type;



          this.isNoData = res.themeData.length === 0;
        });
      } else if(this.isPanelShow.instrument) {
        this.isNoData = false
        this.outputData.themeData = [
          {
            imgUrl:"http://10.16.7.69/image/instrument/仪器地震烈度分布图.jpeg",
            theme:"仪器地震烈度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站峰值加速度分布图.jpeg",
            theme:"台站峰值加速度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站峰值速度分布图.jpeg",
            theme:"台站峰值速度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站仪器地震烈度分布图.jpeg",
            theme:"台站仪器地震烈度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/3.0秒加速度反应谱(gal).jpeg",
            theme:"3.0秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/1.0秒加速度反应谱(gal).jpeg",
            theme:"1.0秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/0.3秒加速度反应谱(gal).jpeg",
            theme:"0.3秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/乡镇仪器地震烈度分布.jpeg",
            theme:"乡镇仪器地震烈度分布"
          },
        ]
        this.outputData.type = 'instrument';
        this.outputData.themeName = '2022年06月01日四川雅安市芦山县6.1级地震-台网数据';
      }else{
        console.log("无图片数据")
      }
    },

    handleOpen(index) {
      this.showPanelButtonsIndex = index;
    },

    handleClose() {
      this.showPanelButtonsIndex = null; // 当鼠标移出时隐藏所有的 panelButtons
    },

    handleDownloadMap(imgUrl) {
      this.$notify({
        title: '专题图下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });

      // 如果传入了 imgUrl，则使用传入的 URL，否则使用 this.imgUrl
      const imageUrl = imgUrl || this.imgUrl;

      if (imageUrl) {
        // 使用 fetch 获取图片数据
        fetch(imageUrl)
            .then(response => response.blob()) // 将响应转换为 Blob 对象
            .then(blob => {
              // 创建一个隐藏的 <a> 元素用于下载
              const a = document.createElement('a');
              const url = URL.createObjectURL(blob); // 创建 Blob URL
              a.href = url; // 设置 href 为 Blob URL
              a.download = imageUrl.split('/').pop(); // 使用 URL 的最后一部分作为文件名
              a.style.display = 'none'; // 隐藏 <a> 标签
              document.body.appendChild(a); // 将 <a> 标签添加到页面
              a.click(); // 触发点击事件，开始下载
              document.body.removeChild(a); // 下载后移除 <a> 标签
              URL.revokeObjectURL(url); // 释放 Blob URL
            })
            .catch(error => {
              this.$notify({
                title: '错误',
                message: '图片下载失败，请检查 URL 或网络连接',
                type: 'error',
                duration: 5000
              });
              console.error('下载失败:', error);
            });
      } else {
        this.$notify({
          title: '错误',
          message: '图片 URL 不存在，无法下载',
          type: 'error',
          duration: 5000
        });
      }
    },

    handleOpenPreview(imgName, imgUrl) {
      this.isPreviewShow = true;
      this.imgName = imgName;
      this.imgUrl = imgUrl;
    },

    handleClosePreview() {
      this.isPreviewShow = false;
    },

    handleDownloadReport(docxUrl) {
      this.$notify({
        title: '灾情报告下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });
      const a = document.createElement('a');
      a.href = docxUrl;
      a.download = docxUrl.split('/').pop();
      a.click();
      document.body.removeChild(a);
    },
    handleJueCeReport(docxUrl) {
      this.$notify({
        title: '辅助决策报告下载',
        message: '数据正在解析中...',
        duration: 7000,
        zIndex: 9999
      });

      // 使用 fetch 获取文件数据
      fetch(docxUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // 如果有 Token，携带身份认证
        }
      })
          .then(response => {
            if (!response.ok) {
              throw new Error(`下载失败: ${response.status}`);
            }
            return response.blob(); // 转换为 Blob
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docxUrl.split('/').pop(); // 设置文件名
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // 释放 URL 对象
          })
          .catch(error => {
            this.$notify({
              title: '下载失败',
              message: error.message,
              type: 'error',
              duration: 5000
            });
          });
    },




    // -----------------------------------------------------------------------------------------------------------------
    // 功能按钮区块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中地震后返回
    back() {
      for (const key in this.isPanelShow) {
        if (this.isPanelShow.hasOwnProperty(key)) {
          if (this.isPanelShow[key] === true) {
            this.isPanelShow[key] = false;
          }
        }
      }
      this.isPreviewShow = false;
      this.thisTab = '震害事件';
      this.selectedTabData = null;
      this.outputData = {}

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
      const path = `/thd?eqid=${thisEq.eqid}&eqqueueId=${thisEq.eqqueueId}`;
      window.open(path, '_blank');
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 地震专题与渲染(图层专题需要在 工具函数 addThemeLayer() 中处理)
    // -----------------------------------------------------------------------------------------------------------------


    // -----------------------------------------------------------------------------------------------------------------
    // 工具函数
    // -----------------------------------------------------------------------------------------------------------------

    // 检查条件并调用相应的 toggleYaanLayer 方法

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

    // 时间戳转换已移至eqTheme.js
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
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

// 搜索框
.query {
  width: calc(100% - 40px);
  margin: 10px 10px 10px 30px;
}

// 地震列表
.eqList {
  position: relative;
  height: calc(85vh - 90px);
  overflow-y: auto;
}

.eqCard {
  display: flex;
  height: 125px;
  border-bottom: #0d325f 2px solid;
  cursor: pointer;
}

.eqCard:hover {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
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
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
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
  height: 100px;
  clear: both;
  display: flex;
  justify-content: center;
  align-items: center;
}

.themes {
  width: 45%;
  height: 45%;
  margin: 0 auto;
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

.eqPanel {
  position: absolute;
  top: 50%;
  left: calc(0.5 * (100% - 333px));
  transform: translate(-50%, -50%);
  padding: 0 40px;
  width: 70%;
  height: 70%;
  background-color: #2d3d51;
  z-index: 1;
}

.mapItem {
  width: 100%;
  height: calc(100% - 90px);
  display: flex;
  flex-wrap: wrap; /* 自动换行 */
  overflow-x: auto; /* 显示横向滚动条 */
}

.map-item {
  position: relative;
  width: 25%;
  height: 50%;
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.panelButtons {
  position: absolute;
  bottom: 15%;
  width: 91%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: rgba(43, 61, 81, 0.6);
}

.panelButton {
  margin: 0 auto;
  width: 60px;
  height: 25px;
  border-radius: 8px;
  cursor: pointer;
}

.thematicMapPreview {
  position: absolute;
  width: 75%;
  transform: translateX(-50%);
  left: calc(0.5 * (100% - 333px));
  top: 50px;
  height: calc(100% - 20px);
  text-align: center;
  background-color: #2d3d51;
  border-radius: 10px;
  z-index: 4;
}

.preview {
  background-color: #ebf5ff;
  color: #409eff;
}

.download {
  background-color: #409eff;
  color: #fff;
}

.reportItem {
  width: 100%;
  height: calc(100% - 90px);
  text-align: center;
  overflow-y: auto;
}

.report-item {
  display: flex;
  height: 100px;
  padding: 15px;
  cursor: pointer;
  color: #fff;
  font-size: 18px;
  text-align: center;
}

.report-item:hover {
  background-color: #1f5783 !important;
  color: #409eff !important;
}

.report-item:nth-child(odd) {
  background-color: #313a44; /* 奇数项背景颜色 */
}

.report-item:nth-child(even) {
  background-color: #304156; /* 偶数项背景颜色 */
}

::v-deep .el-divider__text.is-left {
  box-shadow: 0 0 10px #007fde, inset 0 0 15px #06b7ff;
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

h2 {
  text-align: center;
  color: #fff;
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
