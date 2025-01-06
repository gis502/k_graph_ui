<template>
  <div>
    <div class="thd-eqtable" v-if="activeComponent === 'eqList'">
      <eqTable :eqData="tableData"/>
    </div>
    <!--    title-->
    <div id="title" class="pop-dialog new-pannel fadein-down fadein-left" style="z-index: 100; left: 0px; top: 0px;">
      <div class="pop-dialog__content" style="height: 100%;">
        <div class="logo-title">
          <div class="logo-title-content" style="padding: 0 0 15px 0;">
            <p>{{ this.eqyear }}年{{ this.eqmonth }}月{{ this.eqday }}日{{
                this.centerPoint.earthquakeName
              }}{{ Number(this.centerPoint.magnitude).toFixed(1) }}级地震</p></div>
        </div>

        <div class="logo-left-weather">
          <!-- 以下是实时获取时间的代码 -->
          <div class="logo-time-hour">
            <span class="pop-icon">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                    d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                    fill="none" stroke="#BEE1FF" stroke-width="4"></path>
                <path d="M24.0084 12.0001L24.0072 24.0089L32.4866 32.4883" stroke="#BEE1FF" stroke-width="4"
                      stroke-linecap="round"></path>
              </svg>
            </span>
            <span id="current-time">--:--:--</span>
          </div>
          <div class="logo-time-year" id="current-date">----</div>

        </div>
        <div class="logo-right-time">
        </div>
      </div>
    </div>
    <!--    title end-->
<!--    <div class="button-container">-->
<!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="takeScreenshot">报告产出</el-button>-->
<!--    </div>-->

    <!--    box包裹地图，截图需要-->
    <div id="box" ref="box">
      <div id="cesiumContainer">
        <!-- TimeLinePanel 弹窗 -->
        <commonPanel
            :visible="timelinePopupVisible"
            :position="timelinePopupPosition"
            :popupData="timelinePopupData"
            :ifedit="false"
            @wsSendPoint="wsSendPoint"
            @closePlotPop="closePlotPop"
        />
        <dataSourcePanel
            :visible="dataSourcePopupVisible"
            :position="dataSourcePopupPosition"
            :popupData="dataSourcePopupData"
        />
      </div>
    </div>
    <!-- RouterPanel 弹窗 -->
    <RouterPanel
        :visible="routerPopupVisible"
        :position="routerPopupPosition"
        :popupData="routerPopupData"
    />

    <!-- 进度条-->
    <div class="bottom">
      <!--      播放暂停按钮-->
      <div class="play">
        <img class="play-icon" src="../../../assets/icons/TimeLine/后退箭头.png" @click="backward"/>
        <img class="play-icon" src="../../../assets/icons/TimeLine/播放.png" v-show="!isTimerRunning"
             @click="toggleTimer"/>
        <img class="pause-icon" src="../../../assets/icons/TimeLine/暂停.png" v-show="isTimerRunning"
             @click="toggleTimer"/>
        <img class="play-icon" src="../../../assets/icons/TimeLine/前进箭头.png" @click="forward"/>
      </div>

      <div class="time-ruler" @mousedown="startDrag" @mouseenter="isDragging = true"
           @mouseleave="isDragging = true">
        <div class="time-ruler-line" @click="jumpToTime">
          <div class="time-progress" :style="{ width: `${currentTimePosition}%` }"></div>
          <div class="time-slider" :style="{ left: `${currentTimePosition-0.5}%` }"></div>
          <!--          <div class="time-slider" :style="{ left: `${currentTimePosition}%` }"></div>-->
        </div>
        <!-- speedButton 和 chooseSpeed 放在一起 -->
        <div class="speed-selector" @click="this.showSpeedOptions = !this.showSpeedOptions">
          <span class="speedButton">{{ speedOption }}</span>
          <div class="chooseSpeed" v-if="showSpeedOptions">
            <option
                v-for="option in speedOptions"
                :key="option"
                @click.stop="selectSpeed(option)"
                class="speed-option"
            >
              {{ option }}
            </option>
          </div>
        </div>

      </div>

      <!--      时间点-->
      <div class="current-time-info">
        <span class="timelabel">{{ this.timestampToTime(this.eqstartTime) }}</span>
      </div>

      <div class="end-time-info">
        <div class="timelabel">
          <span>{{ this.timestampToTime(this.currentTime) }}</span>
          <span> / </span>
          <span> {{ this.timestampToTime(this.eqendTime) }}</span>
        </div>
      </div>
    </div>

    <div class="bottom-footer"></div>

    <div>
      <div class="pop_left_background">
        <!--   应急响应-左上   -->
        <timeLineEmergencyResponse
            :eqid="eqid"
            :currentTime="currentTime"
            :eqstartTime="eqstartTime"
            :isfirst="isfirst"
            @addJumpNodes="addJumpNodes"
        />
        <div>

          <!--   人员伤亡-左中   -->
          <timeLinePersonnelCasualties
              :eqid="eqid"
              :currentTime="currentTime"
              @addJumpNodes="addJumpNodes"
          />
        </div>

        <!--   救援出队-左下   -->
        <timeLineRescueTeam
            v-if="eqyear"
            :eqid="eqid"
            :currentTime="currentTime"
            @addJumpNodes="addJumpNodes"
            :eqyear="eqyear"
            :earthquakeName="centerPoint.earthquakeName"
        />
      </div>
      <div class="pop_right_background">
        <!--  新闻-右上  -->
        <div>
          <news
              :eqid="eqid"
              :currentTime="currentTime"
              @ifShowDialog="ifShowDialog"
              @detailedNews="detailedNews"
              @addJumpNodes="addJumpNodes"
          ></news>
        </div>
        <!--      新闻弹框-->
        <div>
          <news-dialog
              :showDetailedNewsDialog="showDetailedNewsDialog"
              :showingNewsContent="showingNewsContent"
              @hideNewsDialog="hideNewsDialog"
          ></news-dialog>
        </div>
        <!--      标绘统计-->
        <div>
          <plotStatistics
              :plots="plots"
              :currentTime="currentTime"
              :zoomLevel="zoomLevel"
              :isTimerRunning="isTimerRunning"
              :viewCenterCoordinate="viewCenterCoordinate"
          ></plotStatistics>
        </div>
        <!--      缩略图-->
        <div>
          <mini-map></mini-map>
        </div>
      </div>
      <!--      图例-->
      <timeLineLegend
          :activeComponent="activeComponent"
          @toggleComponent="toggleComponent"
      ></timeLineLegend>
    </div>

    <!--   行政区划要素图层图例   -->
    <div id="legend"
         style="display: none;position: absolute;
           z-index:20; bottom: 100px;
           right: 450px; color: #FFFFFF;
           background-color: rgba(0, 0, 0, 0.5);
           padding: 10px; border-radius: 5px;text-align: center;">
      <h4 style="margin-bottom: 5px; margin-top: 0; padding:0;justify-content: center">颜色图例</h4>
    </div>

    <!--   断裂带名称div   -->
    <div id="faultInfo"
         style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1; text-align: center;">
    </div>
    <thematicMapPreview
        @ifShowThematicMapDialog="ifShowThematicMapDialog"
        :imgshowURL="imgshowURL"
        :imgurlFromDate="imgurlFromDate"
        :imgName="imgName"
        :ifShowMapPreview="ifShowMapPreview"
    ></thematicMapPreview>

<!--    <div v-if="isTimerRunning || currentTimePosition !== 100" class="timelineRunningTimeLabel">-->
    <div class="timelineRunningTimeLabel">
      {{ this.timestampToTimeChinese(this.currentTime) }}
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getEqById} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import Arrow from "@/cesium/drawArrow/drawPlot.js"
import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import newsDialog from "@/components/TimeLine/newsDialog.vue";
import timeLineEmergencyResponse from "@/components/TimeLine/timeLineEmergencyResponse.vue"
import timeLinePersonnelCasualties from "@/components/TimeLine/timeLinePersonnelCasualties.vue"
import timeLineRescueTeam from "@/components/TimeLine/timeLineRescueTeam.vue"
import timeLineCasualtyStatistic from "@/components/TimeLine/timeLineCasualtyStatistic.vue"

import MiniMap from "@/components/TimeLine/miniMap.vue";
import News from "@/components/TimeLine/news.vue";
import timeLineLegend from "@/components/TimeLine/timeLineLegend.vue";
import fileUrl from "@/assets/json/TimeLine/芦山地震人员伤亡态势专题报告.pdf"
import commonPanel from "@/components/Cesium/CommonPanel";
import eqTable from '@/components/Home/eqtable.vue'
import yaan from '@/assets/geoJson/yaan.json'
import {TianDiTuToken} from "@/cesium/tool/config";
import {getFeaturesLayer} from "@/api/system/emergency.js";
import RouterPanel from "@/components/Cesium/RouterPanel.vue";
import dataSourcePanel from "@/components/Cesium/dataSourcePanel.vue";
import {addFaultZones, addHistoryEqPoints, addOvalCircles} from "../../../cesium/plot/eqThemes.js";
import {MapPicUrl, ReportUrl} from "@/assets/json/thematicMap/PicNameandLocal.js"
import thematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
import {initWebSocket} from "@/cesium/WS.js";
import layeredShowPlot from "@/components/Cesium/layeredShowPlot.vue";
import * as echarts from "echarts";
import html2canvas from "html2canvas";
import plotStatistics from "@/components/TimeLine/plotStatistics.vue";
import axios from "axios";
import timeLineCasualtyStatisticthd from "@/components/TimeLine/timeLineCasualtyStatisticthd.vue";
import arrow from "@/cesium/drawArrow/drawPlot.js";

export default {
  components: {
    timeLineCasualtyStatisticthd,
    plotStatistics,
    layeredShowPlot,
    thematicMapPreview,
    RouterPanel,
    dataSourcePanel,
    TimeLinePanel,
    News,
    MiniMap,
    timeLineEmergencyResponse,
    timeLinePersonnelCasualties,
    timeLineRescueTeam,
    timeLineCasualtyStatistic,
    timeLineLegend,
    newsDialog,
    commonPanel,
    eqTable,

  },
  data: function () {
    return {

// -----------弹窗们的状态变量-------------
      selectedEntityHighDiy: null, // 存储弹窗的位置
      routerPopupVisible: false, // RouterPanel弹窗的显示与隐藏
      routerPopupPosition: {x: 0, y: 0}, // RouterPanel弹窗的位置
      routerPopupData: {}, // RouterPanel弹窗的数据

      dataSourcePopupVisible: false, // RouterPanel弹窗的显示与隐藏
      dataSourcePopupPosition: {x: 0, y: 0}, // RouterPanel弹窗的位置
      dataSourcePopupData: {}, // RouterPanel弹窗的数据

      timelinePopupVisible: false, // TimeLinePanel弹窗的显示与隐藏
      timelinePopupPosition: {x: 0, y: 0}, // TimeLinePanel弹窗的位置
      timelinePopupData: {}, // TimeLinePanel弹窗的数据
      //----------------------------------
      eqid: '',
      // viewer: '',
      store: '',
      //地震时间年月日
      eqyear: '',
      eqmonth: '',
      eqday: '',

      // 震中点数据结构
      centerPoint: {
        plotid: 'center',
        earthquakeName: '',
        // position: '',
        // time:'',
        starttime: '',
        endtime: '',
        magnitude: '',
        longitude: '',
        latitude: '',
        height: '',
        depth: '',
        plottype: '震中'
      },

      // 新闻组件
      showingNewsContent: {
        id: '',
        content: '',
        earthquakeId: '',
        image: '',
        publishTime: '',
        sourceName: '',
        sourceLogo: '',
        title: '',
      },
      showDetailedNewsDialog: false,

      //时间轴时间
      // ifShowData: false,
      // timelineTotalDurationMinutes:10380,
      timelineAdvancesNumber: 2076,  //总分钟数（取5的倍数）/5 =总前进次数  默认值2076（符合芦山） 结束时间2022-06-08 22:00:00
      // timelineAdvancesNumber: 10380,  //总分钟数（取5的倍数）/5 =总前进次数  默认值2076（符合芦山） 结束时间2022-06-08 22:00:00
      eqstartTime: '',
      currentTime: '',
      eqendTime: '',
      tmpeqendTime: '',//默认的地震结束时间
      realTime: new Date(),
      //时间轴当前进度条节点位置
      currentTimePosition: 0,
      // currentTimePosition: 100,
      //时间轴当前前进步
      // currentNodeIndex: 2076,
      currentNodeIndex: 0,
      // realtimeinterval: null,
      // intervalId: null,
      eqendtimeinterval: null,
      // 倍速
      currentSpeed: 1,
      showSpeedOptions: false,
      speedOption: '1X',
      speedOptions: ['1X', '2X', '4X'],

      //是否记载到view上，已经存在则不再添加
      plotisshow: {},
      //包括最早出现时间，最晚结束时间的标绘点信息
      plots: [],
      //时间轴暂停播放状态
      isTimerRunning: false,
      //时间轴拖拽
      isDragging: false,
      dragStartX: 0,
      jumpNodes: {},
      smallViewer: null,

      //-------------ws---------------------
      websock: null,
      //-----------------地震列表---------------------
      // eqListShow: false,
      //-地震列表---------------------------------
      total: 0,
      pageSize: 6,
      currentPage: 1,
      tableData: [],
      //-----------------图层---------------------
      // iflayerChoose: false,
      isMarkingLayer: true,
      showlayers: [],
      //-----------------图层---------------------
      LRDLStatus: false, // 路网
      // districtLayer: null,
      //------------------按钮下拉框------
      // visible: false,
      districts: [
        {adcode: 511802, name: "雨城区"},
        {adcode: 511803, name: "名山区"},
        {adcode: 511822, name: "荥经县"},
        {adcode: 511823, name: "汉源县"},
        {adcode: 511824, name: "石棉县"},
        {adcode: 511825, name: "天全县"},
        {adcode: 511826, name: "芦山县"},
        {adcode: 511827, name: "宝兴县"},
      ],
      geojsonData: [],
      labels: [],  // 保存标签实体的引用
      regionLayer111: null,

      activeComponent: null,
      //-----------------图层要素---------------------
      isExpanded: false,
      layeritems: [
        {id: '0', name: '标绘点图层'},
        {id: '1', name: '行政区划要素图层'},
        {id: '2', name: '人口密度要素图层'},
        {id: '3', name: '交通网络要素图层'},
        {id: '4', name: '避难场所要素图层'},
        {id: '5', name: '救援队伍分布要素图层'},
        {id: '6', name: '应急物资存储要素图层'},
        {id: '7', name: '历史地震要素图层'},
        {id: '8', name: '断裂带要素图层'},
      ],
      selectedlayersLocal: ['标绘点图层'],
      isMarkingLayerLocal: false,
      disasterReserves: [],
      emergencyTeam: [],
      emergencyShelters: [],

      //专题图下载
      thematicMapitems: [],
      selectthematicMap: '',
      isshowThematicMapPreview: '',
      imgshowURL: '',
      imgurlFromDate: '',
      imgName: '',
      ifShowMapPreview: false, // 是否预览专题图
      //专题图下载end

      //报告产出
      reportItems: [],
      selectReportItem: '',

      jumpTimes: [],

      zoomLevel: '市', // 初始化缩放层级
      pointsLayer: [], //传到子组件

      stopTimeforAddEntityOneIndex: 3000, //增加标绘点的时候视角跳转时间
      timelinePopupShowCenterStrart: true, //自动弹出的震中信息框标志
      intervalIdcolor: null,
      isfirst: false,  //控制应急响应面板的弹出框的

      viewCenterCoordinate: {
        lon: null,
        lat: null
      },//视角中心坐标

      canOperateTimerLine: false,
      wsaddMakers: [],
      wsdeleteMakers:[]
    };
  },
  created() {
    this.eqid = this.$route.params.eqid
  },
  mounted() {
    this.init()
    this.startRealTimeClock('current-time', 'current-date');//菜单栏左上角实时获取时间
    this.getEqInfo(this.eqid)
    this.getPlotwithStartandEndTime(this.eqid)
    this.entitiesClickPonpHandler()
    this.watchTerrainProviderChanged()
  },
  beforeUnmount() {
    if (window.viewer) {
      this.clearResource(window.viewer)
      window.viewer = null;
    }
    if (window.smallViewer) {
      this.clearResource(window.smallViewer)
      window.smallViewer = null;
    }
  },
  // 图层要素
  methods: {
    //   菜单栏左上角实时获取时间代码
    startRealTimeClock(timeElementId, dateElementId) {
      function updateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const date = now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'long'
        });
        document.getElementById(timeElementId).textContent = time;
        document.getElementById(dateElementId).textContent = date;
      }

      updateTime();
      setInterval(updateTime, 1000);
    },
    // 初始化控件等
    init() {
      this.isfirst = true
      let viewer = initCesium(Cesium)
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
      viewer.camera.changed.addEventListener(() => {
        const positionCartographic = viewer.camera.positionCartographic
        var height = positionCartographic.height;
        this.updateZoomLevel(height)
        var longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
        var latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
        this.viewCenterCoordinate = {
          lon: longitude,
          lat: latitude
        }
      })
      window.viewer = viewer
      Arrow.disable();
      Arrow.init(viewer);

      let options = {}
      // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
      // options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1000, new Cesium.Cartographic)
      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      options.enableCompass = false
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      options.enableZoomControls = false
      // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      options.enableDistanceLegend = true
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      options.enableCompassOuterRing = false
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      //新版必须new  CesiumNavigation ,可以查看作者github
      window.navigation = new CesiumNavigation(viewer, options)
      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'
      // 设置相机高度和视角
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 20000000),//足够高可以看到整个地球
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });


      //经纬度查询
      let that = this
      let canvas = viewer.scene.canvas;
      //具体事件的实现
      let ellipsoid = viewer.scene.globe.ellipsoid;
      let handler = new Cesium.ScreenSpaceEventHandler(canvas);
      handler.setInputAction(function (movement) {
        //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
        let cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          //将笛卡尔三维坐标转为地图坐标（弧度）
          let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
          //将地图坐标（弧度）转为十进制的度数
          let latString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
          let logString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
          // 获取相机的海拔高度作为视角高度/km
          let altiString = (viewer.camera.positionCartographic.height / 1000).toFixed(2);
          that.getPopDesity(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude))
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


      // 创建缩略图视图器实例
      let smallMapContainer = document.getElementById('smallMapContainer');
      let smallViewer = initCesium(Cesium, smallMapContainer)
      window.smallViewer = smallViewer
      smallViewer._cesiumWidget._creditContainer.style.display = 'none'
      let smallOptions = {}
      smallOptions.enableCompass = false
      smallOptions.enableZoomControls = false
      smallOptions.enableDistanceLegend = false
      smallOptions.enableCompassOuterRing = false
      smallOptions.geocoder = false
      smallOptions.homeButton = false
      smallOptions.sceneModePicker = false
      smallOptions.timeline = false
      smallOptions.navigationHelpButton = false
      smallOptions.animation = false
      smallOptions.infoBox = false
      smallOptions.fullscreenButton = false
      smallOptions.showRenderState = false
      smallOptions.selectionIndicator = false
      smallOptions.baseLayerPicker = false
      smallOptions.selectedImageryProviderViewModel = viewer.imageryLayers.selectedImageryProviderViewModel
      smallOptions.selectedTerrainProviderViewModel = viewer.terrainProviderViewModel
      window.navigation = new CesiumNavigation(smallViewer, smallOptions)
      smallMapContainer.getElementsByClassName('cesium-viewer-toolbar')[0].style.display = 'none';

      smallViewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
                TianDiTuToken,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
          })
      );
      smallViewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
                TianDiTuToken,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
          })
      );

      // 隐藏缩略图视图器的版权信息
      smallViewer._cesiumWidget._creditContainer.style.display = 'none';

      // 同步主视图器的相机到缩略图视图器
      function syncCamera() {
        const camera1 = viewer.scene.camera;
        let smallPoint = Cesium.Cartesian3.fromRadians(camera1.positionCartographic.longitude, camera1.positionCartographic.latitude, camera1.positionCartographic.height + 2000)
        const camera2 = smallViewer.scene.camera;
        camera2.setView({
          destination: smallPoint,
          orientation: {
            heading: camera1.heading,
            pitch: camera1.pitch,
            roll: camera1.roll
          }
        });
      }

      // 监听主视图器的相机变化
      viewer.scene.camera.changed.addEventListener(syncCamera);

      // 每帧渲染时同步缩略图视图
      viewer.scene.postRender.addEventListener(function () {
        smallViewer.scene.requestRender(); // 确保缩略图更新
      });
      // 初始同步
      syncCamera();
      this.initWebSocket()
      this.initcesiumPlot()

    },
    initWebSocket() {
      let that = this
      this.websock = initWebSocket(this.eqid)
      this.websock.eqid = this.eqid
      this.websock.onmessage = function (e) {
        console.log("e", e)
        try {
          console.log("从服务器接收到的消息thdtimeline", JSON.parse(e.data))
          let markType = JSON.parse(e.data).type
          let markOperate = JSON.parse(e.data).operate // 标绘的（add、delete）
          if (markOperate === "add") {
            if (this.eqid === JSON.parse(e.data).data.plot.earthquakeId) {
              let markData = JSON.parse(e.data).data
              if (!that.isTimerRunning && that.currentTimePosition >= 100) {
                //标绘点
                that.wsAddMakerFunc(markType, markData)
              }
              //播放或播放暂停
              else {
                that.wsaddMakers.push({markType: markType, markData: markData})
              }
            }
          }
          else if (markOperate === "delete") {
            let id = JSON.parse(e.data).id.toString()
            if (!that.isTimerRunning && that.currentTimePosition >= 100) {
              that.wsDeleteMakerFunc(id,markType)
            }
            else{
              that.wsdeleteMakers.push({id: id, markType: markType})
            }
          }
        } catch (err) {
          console.log(err, 'ws中catch到错误');
        }
      };
    },
    wsAddMakerFunc(type, data) {
      data.plot.longitude = Number(data.plot.geom.coordinates[0])
      data.plot.latitude = Number(data.plot.geom.coordinates[1])
      this.plots.push(data.plot)
      this.plotisshow[data.plot.plotId] = 1
      var jumpnode = Math.ceil((new Date() - new Date(this.eqstartTime.getTime())) / (5 * 60 * 1000))
      this.timelineAdvancesNumber = jumpnode
      this.jumpNodes[jumpnode] = 1
      this.currentNodeIndex = jumpnode
      if (type === "point") {
        cesiumPlot.drawPoints(data.plot, true, 3000);
      } else if (type === "polyline") {
        cesiumPlot.getDrawPolyline([data.plot])
      } else if (type === "polygon") {
        cesiumPlot.getDrawPolygon([data.plot]);
      } else if (type === "arrow") {
        if (data.plot.plotType === "攻击箭头") {
          arrow.showAttackArrow([data.plot])
        } else if (data.plot.plotType === "钳击箭头") {
          arrow.showPincerArrow([data.plot])
        } else if (data.plot.plotType === "直线箭头") {
          arrow.showStraightArrow([data.plot])
        }
      }
    },
    wsDeleteMakerFunc(id,markType){
      this.plotisshow[id] = 0
      if (markType === "point") {
        cesiumPlot.deletePointById(id);
      }
      else if (markType === "polyline") {
        let polyline = window.viewer.entities.getById(id)
        let polylinePosition = polyline.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
        polylinePosition.pointPosition.forEach((item, index) => {
          window.viewer.entities.remove(item)
        })
        window.viewer.entities.remove(polyline)
      }
      else if (markType === "polygon") {
        window.viewer.entities.removeById(id)
      }
      else if (markType === "arrow") {
        Arrow.clearById(id)
      }
    },
    initcesiumPlot() {
      let cesiumStore = useCesiumStore()
      cesiumPlot.init(window.viewer, this.websock, cesiumStore)
    },

    /**
     * 取地震信息+开始结束当前时间初始化
     * @param {string} eqid - 地震ID
     */
    getEqInfo(eqid) {
      getEqById({id: eqid}).then(res => {
        //震中标绘点
        this.centerPoint = res
        // 设置中心点的标识和时间信息
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.occurrenceTime)
        this.centerPoint.endtime = new Date(this.centerPoint.starttime.getTime() + 10 * 24 * 36000 * 1000);
        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        //默认结束时间 方便展示设置成芦山的时间  要改！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
        // this.tmpeqendTime = new Date(this.centerPoint.starttime.getTime() + this.timelineAdvancesNumber * 60 * 1000);
        this.tmpeqendTime = new Date(this.centerPoint.starttime.getTime() + this.timelineAdvancesNumber * 5 * 60 * 1000);
        // 根据当前时间和地震结束时间计算时间线推进数量
        if (this.realTime < this.tmpeqendTime) {
          this.eqendTime = new Date(this.realTime)
          // this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (60 * 1000);
          this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
          // this.currentNodeIndex = this.timelineAdvancesNumber
        } else {
          this.eqendTime = this.tmpeqendTime
        }
        this.currentTime = this.eqstartTime
        for (let i = 0; i < this.timelineAdvancesNumber; i++) {
          this.jumpNodes[i] = 0;
        }

        // 获取地震数据并更新地图和变量
        this.updateMapandVariablebeforInit()

      })
    },
    /*
    * 更新地图中心视角，更新变量：地震起止时间，渲染点
    * */
    updateMapandVariablebeforInit() {
      this.flyToCenter()
      setTimeout(() => {
        this.flashingCenter()
        setTimeout(() => {
          this.toggleTimer() //模拟播放时间轴
        }, 3000);
      }, 3000);
    },
    /**
     * 根据指定的eqid渲染数据
     * 此方法主要负责针对特定的eqid获取并渲染数据，包括初始化渲染和动态更新数据
     * @param {string} eqid - 需要渲染的数据的唯一标识符
     */
    ifUpdateEndTime(eqid) {
      if (this.realTime < this.tmpeqendTime) {
        console.log("还在更新的地震")
        // 当实时时间位置为100%且没有定时器运行时，启动定时器
        if (!this.isTimerRunning && this.currentTimePosition === 100) {
          // 当没有结束时间定时器运行时，启动定时器
          if (!this.eqendtimeinterval) {
            // 设置定时器，每秒执行一次
            this.eqendtimeinterval = setInterval(() => {
              // 如果时间位置不再为100%，停止定时器
              if (this.currentTimePosition !== 100) {
                clearInterval(this.eqendtimeinterval); // 停止定时器
                this.eqendtimeinterval = null; // 清除引用
                return; // 跳出当前循环
              }
              // 更新结束时间和当前时间
              this.eqendTime = new Date()
              this.currentTime = this.eqendTime
            }, 1000);
          }
          let that = this
          //处理websocket的标绘
          if (this.wsaddMakers.length > 0) {
            this.wsaddMakers.forEach((item) => {
              let markType = item.markType
              let markData = item.markData
              that.wsAdd(markType, markData)
            })
            this.wsaddMakers = []
          }
          if(this.wsdeleteMakers.length>0){
            this.wsdeleteMakers.forEach((item) => {
              let id = item.id
              let markType = item.markType
              that.wsDeleteMakerFunc(id,markType)
            })
            this.wsdeleteMakers = []
          }
        }
      } else {
        console.log("过去的地震")
      }
    },

    getPlotwithStartandEndTime(eqid) {
      // 调用接口获取特定设备的绘图信息
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {
        // 显示标记，追加新的点 （增）
        console.log(res, "getPlotwithStartandEndTime")
        // 遍历返回的绘图信息，检查每个点是否已存在，如果不存在则添加
        res.forEach(item => {
          const plotexists = this.plots.some(plot => plot.plotId === item.plotId);
          if (!plotexists) {
            this.plotisshow[item.plotId] = 0;
          }
        })

        // 删除的点删除  （删）
        // 创建一个当前绘图ID的集合
        const currentPlotIds = new Set(res.map(item => item.plotId));
        // 移除不再存在的 plotid
        for (const plotId in this.plotisshow) {
          if (!currentPlotIds.has(plotId)) {
            // 删除 plotisshow 中的项
            delete this.plotisshow[plotId];
            // 从 viewer 中移除对应的点
            viewer.entities.removeById(plotId);
          }
        }

        // 更新数组信息（包括点的起止时间、属性信息） （改）
        // 更新this.plots数组中的数据
        this.plots = res
        // 遍历更新后的绘图信息，确保每个点都有起止时间
        this.plots.forEach(item => {
          if (!item.endTime || new Date(item.endTime) < new Date(this.eqstartTime) || new Date(item.endTime) <= new Date(item.startTime)) {
            // 为没有结束时间的点设置默认结束时间
            item.endTime = new Date(this.eqstartTime.getTime() + 20 * 24 * 36000 * 1000);  //20天 错误时间设置结束时间地震发生20天以后
          }
          // if (!item.startTime || new Date(item.startTime) < new Date(this.eqstartTime)) {
          if (!item.startTime) {
            // 为没有开始时间的点设置默认开始时间
            item.startTime = this.eqstartTime;
          }

          var jumpnode1 = Math.ceil((new Date(item.startTime) - new Date(this.eqstartTime)) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode1] = 1
          // this.firstMakerNodeIndex=jumpnode1<this.firstMakerNodeIndex?jumpnode1:this.firstMakerNodeIndex
          var jumpnode2 = Math.ceil((new Date(item.endTime) - new Date(this.eqstartTime)) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode2] = 1
        })
        // 更新绘图
        let pointArr = this.plots.filter(e => e.drawtype === 'point')
        //人员伤亡详情
        this.pointsLayer = [...pointArr]
        // console.log("获取 pointsLayer", this.pointsLayer)
        // this.plotsDataIsReady=true
      })
    },
    //控制视角跳转的递归函数
    flyPointsForOneIndex(points) {
      if (this.timelinePopupVisible) {
        this.timelinePopupVisible = false
      }
      let timeEachPoint = 0

      points.forEach((point) => {
        timeEachPoint = timeEachPoint + 3000 / this.currentSpeed  //在选定倍速下每个点闪烁的秒数
        let flytime = (timeEachPoint / 1000 - 1) < 2 ? timeEachPoint : 2
        viewer.scene.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
              parseFloat(point.longitude),
              parseFloat(point.latitude),
              20000),
          orientation: {
            heading: 6.283185307179581,
            pitch: -1.5688168484696687,
            roll: 0.0
          },
          duration: flytime // 飞行动画持续时间（秒）
        });

        if (this.isTimerRunning) {
          setTimeout(() => {
          }, timeEachPoint); // 根据速度计算每个点的延迟时间
        } else {
          return;
        }

      });
    },
    updatePlotOnce(type) {

      // 创建一个指向当前上下文的变量，用于在闭包中访问this
      let that = this
      // --------------------------点绘制------------------------------
      // 过滤出绘制类型为点的plots
      let pointArr = this.plots.filter(e => e.drawtype === 'point')
      console.log("点渲染", pointArr)

      let points = [];

      // 遍历点数组，处理每个点的绘制或删除
      pointArr.forEach(item => {
        // 获取当前时间
        const currentDate = new Date(this.currentTime);
        // 获取点的开始和结束时间
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        console.log("time", startDate, currentDate, endDate)

        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          console.log("item.plotId add", item)
          this.plotisshow[item.plotId] = 1;
          // 创建点数据
          let point = {
            earthquakeId: item.earthquakeId,
            plotId: item.plotId,
            startTime: item.startTime,
            endTime: item.endTime,
            plotType: item.plotType,
            drawtype: item.drawtype,
            latitude: item.latitude,
            longitude: item.longitude,
            height: item.elevation,
            icon: item.icon
          };

          points.push(point); // 收集点数据
        }
        // 如果点应该消失
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          // console.log("item.plotId del", item.plotId)
          this.plotisshow[item.plotId] = 0;
          cesiumPlot.deletePointById(item.plotId);
        }
      });
      if (points.length > 0) {
        //如果震中标绘在闪烁，取消闪烁，震中面板不显示
        if (this.timelinePopupShowCenterStrart) {
          this.centerMarkOpacityTo1()
          clearInterval(this.intervalIdcolor)
          this.timelinePopupShowCenterStrart = false;
          this.timelinePopupVisible = false;
        }

        if (type == false) {
          // console.log("false update")
          this.stopTimeforAddEntityOneIndex = 3000
          cesiumPlot.drawPoints(points, false, 3000);
        } else if (type == "3") {
          // console.log("333 update")
          this.stopTimeforAddEntityOneIndex = 3000
          cesiumPlot.drawPoints(points, true, 3000);
        } else {
          this.stopTimeforAddEntityOneIndex = (3000 * points.length) / this.currentSpeed
          cesiumPlot.drawPoints(points, true, this.stopTimeforAddEntityOneIndex);
          this.flyPointsForOneIndex(points, 0)
        }
      }
      //--------------------------线绘制------------------------------
      // 根据当前时间和显示状态过滤并更新线条数据
      let polylineArr = this.plots.filter(e => e.drawtype === 'polyline')
      let filteredPolylineArr = []; // 用于存储符合条件的线条数据
      polylineArr.forEach(item => {
        const currentDate = new Date(this.currentTime);
        // console.log(currentDate)
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 检查线条的显示状态和时间范围
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          filteredPolylineArr.push(item); // 收集符合条件的线条
        }
        // 处理线条消失的逻辑
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0

          // console.log(item.plotId,"end")
          viewer.entities.removeById(item.plotId)
          /*因为封装好渲染线的函数中，将每个点都进行了渲染，清除时也要将每个点清除*/
          for (let i = 0; i < item.geom.coordinates.length; i++) {
            viewer.entities.removeById(item.plotId + 'point' + (i + 1))
          }
        }

      })
      cesiumPlot.getDrawPolyline(filteredPolylineArr)

      //--------------------------面绘制------------------------------
      // 过滤出绘制类型为多边形的数据
      let polygonArr = this.plots.filter(e => e.drawtype === 'polygon')
      // 用于存储符合条件的多边形数据
      let filteredPolygonArr = [];

      // 遍历多边形数据，根据时间判断是否显示
      polygonArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          filteredPolygonArr.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          console.log(item.geom.coordinates, "endPOlygon")
          viewer.entities.removeById(item.plotId)
          /*因为封装好渲染面的函数中，将每个点都进行了渲染，清除时也要将每个点清除*/
          // let coords = item.geom.coordinates[0]
          // for (let i = 0; i < coords.length; i++) {
          //   console.log(i)
          //   viewer.entities.removeById(item.plotId + 'point' + (i + 1))
          //   console.log("wanchan")
          // }
        }
      })

      // 将符合条件的多边形数据按plotId分组
      let polygonMap = {};
      filteredPolygonArr.forEach(item => {
        if (!polygonMap[item.plotId]) {
          polygonMap[item.plotId] = [];
        }
        polygonMap[item.plotId].push(item);
      });

      // 遍历分组后的多边形数据，调用绘制多边形的函数进行渲染
      Object.keys(polygonMap).forEach(plotId => {
        let polygonData = polygonMap[plotId];
        console.log("polygonData", polygonData)
        cesiumPlot.getDrawPolygon(polygonData)
      });

      //--------------------------箭头绘制------------------------------
      let straightArrShow = []
      let straightArr = this.plots.filter(e => e.drawtype === 'straight');
      straightArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          straightArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (straightArrShow.length > 0) {
        Arrow.showStraightArrow(straightArrShow)
      }

      let attackArrShow = []
      let attackArr = this.plots.filter(e => e.drawtype === 'attack');
      attackArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          attackArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (attackArrShow.length > 0) {
        Arrow.showAttackArrow(attackArr)
      }


      let pincerArrShow = []
      let pincerArr = this.plots.filter(e => e.drawtype === 'pincer');
      pincerArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          pincerArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (pincerArrShow.length > 0) {
        Arrow.showPincerArrow(pincerArr)
      }
    },

    // bool参数代表是否需要使用标会点动画，若bool为false，则不需要；若调用updatePlot方法不传参则默认需要
    // 暂停播放切换
    toggleTimer() {
      // 如果计时器未运行，则初始化计时器线
      if (!this.isTimerRunning && (this.currentTimePosition >= 100 || this.currentTimePosition <= 0)) {
        console.log("toggleTimer1")
        this.isTimerRunning = true
        this.initTimerLine();
        let that = this
        setTimeout(() => {
          this.canOperateTimerLine = true
          that.bofang();
        }, 3000);
      } else {
        this.canOperateTimerLine = true
        if (!this.isTimerRunning) {
          this.flyToCenter()
          this.isTimerRunning = true
          this.bofang();
          // console.log("toggleTimer2")
        }
        // 如果计时器正在运行，则停止计时器
        else {
          console.log("toggleTimer3")
          this.stopTimer();
          clearInterval(this.intervalIdcolor)
          this.centerMarkOpacityTo1()
        }
      }


    },
    /**
     * 初始化计时线
     * 启动计时器，每隔一段时间更新当前时间位置
     */
    initTimerLine() {
      this.isfirst = false
      // console.log(this.jumpTimes,"this.jumpTimes")
      if (this.jumpTimes) {
        this.jumpTimes.forEach(item => {
          var jumpnode = Math.ceil((new Date(item) - new Date(this.eqstartTime.getTime())) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode] = 1
        })
      }

      // console.log(this.jumpNodes,this.plots,"this.jumpNodes111")
      console.log(this.plots, "this.plots111")
      // 标记计时器为运行状态
      this.isTimerRunning = true;
      // 初始化
      this.currentTimePosition = 0;
      this.currentTime = this.eqstartTime;
      this.currentNodeIndex = 0;
      // 从 dataSource 中删除点
      this.plots.forEach(item => {
        if (this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          cesiumPlot.deleteMakerById(item.plotId, item.drawtype, item.plotType);
        }
      })
      this.flyToCenter()
      setTimeout(() => {
        this.flashingCenter()
      }, 3000);
    },
    bofang() { //正向播放
      this.isfirst = false
      if (!this.isTimerRunning) { //根据次数跳出
        this.stopTimer();
        return;
      } else {
        let flag = this.updateCurrentTimeOnce();
        console.log(flag, "flag")
        if (flag) {
          if (this.isMarkingLayer) {

            this.updatePlotOnce(true)
            setTimeout(() => {
              this.bofang();
            }, this.stopTimeforAddEntityOneIndex);
          } else {
            this.MarkingLayerRemove()
          }
        }
      }
    },
    updateCurrentTimeOnce() {
      let flag = 1
      let i = this.currentNodeIndex + 1;
      for (; i <= this.timelineAdvancesNumber; i++) {
        if (this.jumpNodes[i] === 1) {
          flag = 1
          break;
        }
      }

      if (i >= this.timelineAdvancesNumber) {
        flag = 0
        this.initEnd()
      }

      if (flag === 1) {
        let tmpTime = new Date(this.eqstartTime.getTime() + i * 5 * 60 * 1000);
        if (tmpTime <= this.eqendTime) {
          this.currentNodeIndex = i //前进timelineAdvancesNumber次，每次5分钟，
          this.currentTimePosition = 100.0 / (this.timelineAdvancesNumber * 1.0) * i;
          this.currentTime = tmpTime
        } else {
          flag = 0
          this.initEnd()
        }
        // 根据是否需要显示标绘层来更新图层
      }
      return flag
    },
    /**
     * 时间轴停止
     * 此方法用于停止当前正在运行的定时器它通过清除间隔标识并重置相关状态来实现
     * 定时器停止后，不会再执行任何操作，确保资源得到正确释放
     */
    stopTimer() {
      this.isfirst = true
      this.isTimerRunning = false;
      this.centerMarkOpacityTo1()
      this.ifUpdateEndTime()
    },
    initEnd() {
      this.currentTimePosition = 100;
      this.currentNodeIndex = Math.ceil(((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000));

      this.currentTime = this.eqendTime
      this.updatePlotOnce(false)
      setTimeout(() => {
        this.stopTimer()
        this.flyToCenter()
      }, 3000);
    },

    /**
     * 前进一步函数，用于模拟时间线前进
     * 该函数通过增加当前节点索引来实现时间线的前进，并更新当前的时间位置和时间
     * 当达到终点时，会重置当前时间位置为100，并停止计时器
     * @param {number} this.currentNodeIndex 当前节点索引，用于指示时间线上的位置
     * @param {number} this.timelineAdvancesNumber 时间线前进的总次数，用于计算节点索引
     * @param {number} this.currentSpeed 当前速度，用于计算时间位置的增加量
     * @param {number} this.currentTimePosition 当前时间位置，表示进度条的当前位置
     * @param {Date} this.currentTime 当前时间，表示当前的时间点
     * @param {boolean} this.isTimerRunning 计时器是否运行中，用于控制时间线的前进
     * @param {string} this.eqendTime 结束时间，表示时间线的终点
     * @param {string} this.eqid 地震ID，用于在渲染时标识地震
     * @param {Date} this.eqstartTime 开始时间，表示时间线的起点
     * @param {function} this.intimexuanran 渲染函数，根据地震ID渲染地震效果
     * @param {function} this.updatePlot 更新图表函数，用于在时间线前进时更新图表
     */
    forward() {
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let flag = this.updateCurrentTimeOnce();
        if (flag) {
          if (this.isMarkingLayer) {
            this.updatePlotOnce("3")
          } else {
            this.MarkingLayerRemove()
          }
        }
      }
    },

    /**
     * 后退函数，用于在时间线上向后移动
     * 该函数通过调整当前节点索引和当前时间位置来实现后退
     * 当前时间位置达到0时，停止计时器
     * 否则，根据当前时间位置和节点索引计算新的时间位置和实际时间
     * 并更新图表显示
     */
    backward() {
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let flag = 0
        let i = this.currentNodeIndex - 1;
        for (; i >= 0; i--) {
          // console.log()
          if (this.jumpNodes[i] === 1) {
            console.log(i,"i")
            flag = 1;
            break;
          }
        }
        //回退到最开始
        if (i <= 0) {
          flag = 0
          this.currentTimePosition = 0;
          this.currentNodeIndex = 0
          this.currentTime = this.eqstartTime

          this.stopTimer();
          this.plots.forEach(item => {
            if (this.plotisshow[item.plotId] === 1) {
              this.plotisshow[item.plotId] = 0
              cesiumPlot.deletePointById(item.plotId);
            }
          })
        }
        //更新到下一跳
        if (flag === 1) {
          let currentTimeTmp=new Date(this.eqstartTime.getTime() + i * 5 * 60 * 1000);
          //最后5分钟，不满5分钟的，再回退一跳
          if(currentTimeTmp>=this.eqendTime){
            this.backward()
          }
          else{
            this.currentNodeIndex = i //前进timelineAdvancesNumber次，每次5分钟，
            this.currentTimePosition = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentNodeIndex;
            this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
            // 根据是否需要显示标绘层来更新图层
            this.updatePlotOnce("3")
          }

        }
      }

    },

    /**
     * 根据用户点击的时间轴位置，跳转到相应的场景
     * @param {MouseEvent} event - 鼠标点击事件
     */
    jumpToTime(event) {
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let currentTimeTmp = this.currentTime
        // 获取时间轴的矩形区域，用于计算点击位置对应的进度
        const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
        // 计算点击位置相对于时间轴左边缘的距离
        const clickedPosition = event.clientX - timeRulerRect.left;
        // 根据点击位置计算当前时间进度的百分比
        this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
        // 更新时间进度条的宽度，以反映当前时间进度
        this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
        // 根据当前时间进度百分比和总步骤数计算当前步骤索引
        this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber) // Assuming 672 is the total number of steps
        // console.log(this.currentTimePosition,this.timelineAdvancesNumber,"jumpToTime")
        // 根据当前步骤索引计算当前时间，假设每个步骤代表5分钟
        this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        // console.log("this.currentTime jumpToTime",this.currentTime)
        if (this.currentTimePosition >= 100) {
          // 当时间进度达到或超过100%时，重置为100%
          this.currentTimePosition = 100;
          // 设置当前时间为结束时间
          this.currentTime = this.eqendTime
          // 停止计时器
          this.stopTimer();
          // 更新计时器运行状态标志为false
          this.isTimerRunning = false
          // 调用 intimexuanran 方法，传入地震ID
          // this.intimexuanran(this.eqid)

        } else {
          if (currentTimeTmp > this.currentTime) {
            this.updatePlotOnce("3")
          } else {
            this.updatePlotOnce("3")
          }
        }
      }
    },

    /**
     * 时间轴的开始拖拽事件处理函数
     * 该函数用于初始化拖拽操作，记录拖拽开始的位置，并设置拖拽过程中的事件监听器
     * 同时，为了防止在拖拽过程中选中内容，设置了禁止选择的CSS样式
     *
     * @param {MouseEvent} event - 鼠标事件对象，包含拖拽开始时的坐标信息
     */
    startDrag(event) {
      if (this.canOperateTimerLine) {

        this.isfirst = false
        this.isDragging = true; // 标记当前开始进入拖拽状态
        this.dragStartX = event.clientX; // 记录拖拽开始时的鼠标 X 坐标
        document.addEventListener('mousemove', this.drag); // 在文档上添加鼠标移动事件监听器，用于处理拖拽过程
        document.addEventListener('mouseup', this.stopDrag(this.currentTime)); // 在文档上添加鼠标抬起事件监听器，用于结束拖拽
        // 添加禁用选择的 CSS 样式
        document.body.style.userSelect = 'none';
        document.body.style.WebkitUserSelect = 'none';
        document.body.style.MozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
      }
    },

    /**
     * 处理鼠标拖动事件
     * @param {MouseEvent} event - 鼠标拖动事件对象
     */
    drag(event) {
      if (this.canOperateTimerLine) {

        // 如果没有拖动，则不执行后续操作
        if (!this.isDragging) return;
        // 获取时间尺的矩形信息
        const timeRulerRect = this.$el.querySelector('.time-ruler').getBoundingClientRect();
        // 计算鼠标点击位置相对于时间尺左边缘的水平距离
        const clickedPosition = Math.max(timeRulerRect.left, Math.min(event.clientX, timeRulerRect.right)) - timeRulerRect.left;
        // 计算新的进度位置百分比
        const newPosition = (clickedPosition / timeRulerRect.width) * 100;
        // 更新当前节点索引，根据时间线的总进度数进行比例转换

        // 更新时间进度条的宽度，以反映新的进度位置

        // 更新当前时间进度位置
        this.currentTimePosition = newPosition;
        // this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
        // this.$el.querySelector('.time-slider').style.left = `${this.currentTimePosition - 0.5}%`;
      }
    },

    /**
     * 停止拖拽操作
     * 当用户释放鼠标按钮时调用此方法，以重置拖拽状态并停止监听鼠标事件
     */
    stopDrag(time) {
      if (this.canOperateTimerLine) {

        this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber);
        // 根据开始时间和当前节点索引计算当前时间
        // 注意：此处将时间增量从15分钟调整为5分钟
        this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        // let timetmp=this.currentTime
        // 重置isDragging状态，表示不再拖拽中
        this.isDragging = false;
        // 移除鼠标移动事件监听器，防止拖拽结束后鼠标移动事件继续触发
        document.removeEventListener('mousemove', this.drag);
        // 移除鼠标释放事件监听器，释放后不再需要此事件处理函数
        document.removeEventListener('mouseup', this.stopDrag);

        // 当currentTimePosition达到或超过100时，进行特殊处理
        if (this.currentTimePosition >= 100) {
          this.currentTimePosition = 100;
          this.currentTime = this.eqendTime;
          this.stopTimer();
          // this.intimexuanran(this.eqid)
        } else {
          if (time > this.currentTime) {
            this.updatePlotOnce("3")
          } else {
            this.updatePlotOnce("3")
          }
        }
        // 恢复默认的选择行为
        document.body.style.userSelect = 'auto';
        document.body.style.WebkitUserSelect = 'auto';
        document.body.style.MozUserSelect = 'auto';
        document.body.style.msUserSelect = 'auto';
      }
    },

    /**
     * 选择时间轴的播放倍速
     *
     * @param {string} speed - 速度的字符串表示，格式为"数字-单位"，如"50-米/秒"
     */
    //视角跳转和倍速有关
    selectSpeed(speed) {
      // 直接赋值速度选项
      this.speedOption = speed
      // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
      this.currentSpeed = parseFloat(speed.split('-')[0])
      this.showSpeedOptions = false
    },

    addJumpNodes(val) {
      val.forEach(item => {
        this.jumpTimes.push(item)
      })
    },
    //飞到震中
    flyToCenter() {
      if (this.selectedEntity && (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible)) {
        window.viewer.screenSpaceEventHandler.setInputAction(movement => {
          this.updatePopupPosition();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }

      // 飞行动画持续时间（秒）
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.geom.coordinates[0]),
            parseFloat(this.centerPoint.geom.coordinates[1]),
            60000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        },
        duration: 3 // 飞行动画持续时间（秒）
      });

    },
    //中心点闪烁
    flashingCenter() {

      //震中点闪烁
      let data = {
        ...this.centerPoint,
        drawtype: "center"
      }
      this.timelinePopupVisible = false;
      if (this.intervalIdcolor) {
        clearInterval(this.intervalIdcolor);
      }
      let centerMark = viewer.entities.getById(this.centerPoint.plotid);
      if (!centerMark) {

        centerMark = viewer.entities.add({
          properties: {
            data
          },
          position: Cesium.Cartesian3.fromDegrees(
              parseFloat(this.centerPoint.geom.coordinates[0]),
              parseFloat(this.centerPoint.geom.coordinates[1]),
              parseFloat(this.centerPoint.height || 0)
          ),
          billboard: {
            image: centerstar,
            width: 40,
            height: 40,
            eyeOffset: new Cesium.Cartesian3(0, 0, 0),
            scale: 0.8,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            depthTest: false,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            color: Cesium.Color.WHITE.withAlpha(1),//颜色
          },
          label: {
            text: this.centerPoint.earthquakeName,
            show: true,
            font: '14px sans-serif',
            fillColor: Cesium.Color.RED,        //字体颜色
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -16),
          },
          id: this.centerPoint.plotid,
          plottype: "震中",
          layer: "标绘点"
        });
      }
      let colorFactor = 1.0;
      this.intervalIdcolor = setInterval(() => {
        colorFactor = colorFactor === 1.0 ? 0.5 : 1.0; // 在颜色之间切换
      }, 500);
      centerMark.billboard.color = new Cesium.CallbackProperty(() => {
        return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
      }, false)

      //缩略图中心点闪烁
      let smallcenterMark = smallViewer.entities.getById(this.centerPoint.plotid);
      if (!smallcenterMark) {
        smallcenterMark = smallViewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
              parseFloat(this.centerPoint.geom.coordinates[0]),
              parseFloat(this.centerPoint.geom.coordinates[1]),
              parseFloat(this.centerPoint.height || 0)
          ),
          billboard: {
            image: centerstar,
            width: 40,
            height: 40,
            eyeOffset: new Cesium.Cartesian3(0, 0, 0),
            scale: 0.8,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            depthTest: false,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            color: Cesium.Color.WHITE.withAlpha(1),
          },
          label: {
            text: this.centerPoint.earthquakeName,
            show: true,
            font: '10px sans-serif',
            fillColor: Cesium.Color.RED,        //字体颜色
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -16),
          },
          id: this.centerPoint.plotid,
          plottype: "震中",
        });
      }
      smallcenterMark.billboard.color = new Cesium.CallbackProperty(() => {
        return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
      }, false)

      //震中面板展开+跟随地图移动
      this.timelinePopupShowCenterStrart = true
      let position = centerMark.position.getValue(Cesium.JulianDate.now());
      let screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
      this.timelinePopupPosition = {
        x: screenPosition.x + 10,
        y: screenPosition.y + 10
      };
      this.timelinePopupVisible = true;
      this.timelinePopupData = data
      this.selectedEntity = centerMark
      this.selectedEntityPosition = {
        x: this.centerPoint.geom.coordinates[0], // 经度
        y: this.centerPoint.geom.coordinates[1],  // 纬度
        z: 0     // 高度
      };
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //取消闪烁，透明度到1
    centerMarkOpacityTo1() {
      let centerMark = window.viewer.entities.getById(this.centerPoint.plotid);
      centerMark.billboard.color = Cesium.Color.WHITE.withAlpha(1)//颜色
      let smallcenterMark = smallViewer.entities.getById(this.centerPoint.plotid);
      smallcenterMark.billboard.color = Cesium.Color.WHITE.withAlpha(1)//颜色
    },
    //---------------------------------------------------------------------------------------------
    //时间轴end-------------

    /*
    * 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
    * */
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)

      let year = DateObj.getFullYear()
      let month = DateObj.getMonth() + 1
      let day = DateObj.getDate()
      let hh = DateObj.getHours()
      let mm = DateObj.getMinutes()
      let ss = DateObj.getSeconds()
      month = month > 9 ? month : '0' + month
      day = day > 9 ? day : '0' + day
      hh = hh > 9 ? hh : '0' + hh
      mm = mm > 9 ? mm : '0' + mm
      ss = ss > 9 ? ss : '0' + ss
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },
    timestampToTimeChinese(timestamp) {
      let DateObj = new Date(timestamp)

      let year = DateObj.getFullYear()
      let month = DateObj.getMonth() + 1
      let day = DateObj.getDate()
      let hh = DateObj.getHours()
      let mm = DateObj.getMinutes()
      let ss = DateObj.getSeconds()
      month = month > 9 ? month : '0' + month
      day = day > 9 ? day : '0' + day
      hh = hh > 9 ? hh : '0' + hh
      mm = mm > 9 ? mm : '0' + mm
      ss = ss > 9 ? ss : '0' + ss
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
    },
    //底图级别
    updateZoomLevel(cameraHeight) {
      console.log("层级", cameraHeight)
      // 根据相机高度设置 zoomLevel
      if (cameraHeight < 50000) {
        this.zoomLevel = '区/县'
      }
      else{
        this.zoomLevel = '市'
      }
          // else if (cameraHeight > 8000) {
          //   this.zoomLevel = '乡/镇'
      // }
      // else {
      //   // this.zoomLevel = '村'
      //   this.zoomLevel = '乡/镇'
      // }
    },
    /**
     * 处理实体点击事件的弹窗显示逻辑
     */
    entitiesClickPonpHandler() {
      let that = this;
      // 在屏幕空间事件处理器中添加左键点击事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 检查点击位置是否拾取到实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        console.log("点击选择的pickedEntity", pickedEntity)
        window.selectedEntity = pickedEntity?.id;

        // 绑定断裂带信息的 div 元素
        const faultInfoDiv = document.getElementById('faultInfo');
        // 如果拾取到实体
        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;
          console.log(entity, "entity")
          // 计算图标的世界坐标
          this.selectedEntityPosition = this.calculatePosition(click.position);
          this.updatePopupPosition(); // 确保位置已更新
          const pickedObject = window.viewer.scene.pick(click.position);

          if (entity._layer === "断裂带") {
            console.log("断裂带")

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

              console.log(faultName)
            }
          }
          // 如果点击的是标绘点
          else if (entity._layer === "标绘点") {
            this.timelinePopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition; // 更新位置
            this.timelinePopupData = {}
            this.timelinePopupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
          }
          //聚合图标
          else if (Object.prototype.toString.call(entity) === '[object Array]') {
            if (entity[0].entityCollection.owner.name === "label") {
              this.dataSourcePopupVisible = false
              this.timelinePopupVisible = false
              this.routerPopupVisible = false;
            } else {
              this.dataSourcePopupData = entity
              this.dataSourcePopupVisible = true
              this.timelinePopupVisible = false
              this.routerPopupVisible = false;

            }
          }
          //救援队伍、避难场所、应急物资
          else if (entity._billboard) {
            this.routerPopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition;
            this.routerPopupData = this.extractDataForRouter(entity);
            this.dataSourcePopupVisible = false
            this.timelinePopupVisible = false;
          }
          //箭头标绘
          else if (entity._polygon) {
            this.timelinePopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition;
            this.timelinePopupData = {}
            this.timelinePopupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
          } else {
            // 如果不是标绘点或路标
            this.routerPopupVisible = false;
            this.timelinePopupVisible = false;
            this.dataSourcePopupVisible = false
          }
        }
        //没有拾取到实体
        else {
          // 没有选中实体时隐藏 faultInfo
          faultInfoDiv.style.display = 'none';
          this.routerPopupVisible = false;
          this.timelinePopupVisible = false;
          this.dataSourcePopupVisible = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 在屏幕空间事件处理器中添加鼠标移动事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      window.viewer.screenSpaceEventHandler.setInputAction((wheelment) => {
        if (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.WHEEL);

    },
    /**
     * 计算点击位置的经纬度和高度
     *
     * @param {Object} clickPosition - 点击位置的屏幕坐标
     * @returns {Object} - 返回一个对象，包含经度(x)、纬度(y)和高度(z)
     */
    calculatePosition(clickPosition) {
      // 根据点击位置获取射线
      let ray = viewer.camera.getPickRay(clickPosition);
      // 用射线在场景中拾取位置
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      // 将拾取的位置转换为地理坐标
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      // 将地理坐标的经纬度转换为度数
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      // 根据地形是否加载来获取高度
      let height = this.isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      // 返回计算得到的经纬度和高度
      return {
        x: longitude, // 经度
        y: latitude,  // 纬度
        z: height     // 高度
      };
    },
    /**
     * 更新故障信息在画布上的位置
     * 此方法用于根据选定的实体位置，更新显示故障信息的div在画布上的位置
     * @param {string} faultName - 故障的名称，将被显示在故障信息div中
     */
    updateFaultInfoPosition(faultName) {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
          // 将选定实体的经纬度坐标转换为窗口坐标系下的位置
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              window.viewer.scene,
              Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            // 获取故障信息的div元素
            const faultInfoDiv = document.getElementById('faultInfo');
            // 更新故障信息div的位置和内容
            faultInfoDiv.style.left = canvasPosition.x + 'px';
            faultInfoDiv.style.top = canvasPosition.y + 'px';
            faultInfoDiv.innerHTML = `${faultName}`; // 更新内容
          }
        }
      });
    },
    /**
     * 更新弹窗位置
     * 该方法用于更新路由和时间线弹窗在地图上的位置
     * 它通过将选中的实体位置转换为屏幕坐标来实现
     */
    updatePopupPosition() {
      // 使用$nextTick确保DOM更新后才执行位置计算
      this.$nextTick(() => {
        // 检查是否有选中的实体位置
        if (this.selectedEntityPosition) {
          // console.log(this.selectedEntityPosition, "this.selectedEntityPosition")
          // 将地理坐标转换为窗口坐标
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              window.viewer.scene,
              Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            this.routerPopupPosition = {
              x: canvasPosition.x + 10,
              y: canvasPosition.y + 10
            };
            this.timelinePopupPosition = {
              x: canvasPosition.x + 10,
              y: canvasPosition.y + 10
            };
            this.dataSourcePopupPosition = {
              x: canvasPosition.x + 10,
              y: canvasPosition.y + 10
            }
          }
        }
      });
    },
    /**
     * 提取实体数据用于时间线
     *
     * 此函数的目的是将给定的实体对象转换为一个包含特定属性的新对象，
     * 这些属性包括实体的ID、实体的类型以及一个中心点坐标这些信息对于在时间线上
     *
     * @param {Object} entity - 需要提取数据的实体对象，通常包含id和plottype属性
     * @returns {Object} 返回一个新对象，包含plotid、plotname和centerPoint属性
     */
    extractDataForTimeline(entity) {
      return {
        plotid: entity.id,
        plotname: entity.plottype,
        centerPoint: this.centerPoint
      };
    },
    /**
     * 提取实体属性用于路由
     *
     * 此函数旨在根据实体的属性名称，动态地从实体对象中提取相应的属性值，
     * 并将其组织成一个新的对象返回这对于构建动态路由或者进行属性比较等操作非常有用
     *
     * @param {Object} entity - 需要提取属性的实体对象，包含properties属性，其中包含可动态提取的属性
     * @returns {Object} 返回一个新对象，该对象的属性和值根据entity.properties.propertyNames动态生成
     */
    extractDataForRouter(entity) {
      let properties = {};
      entity.properties.propertyNames.forEach(name => {
        properties[name] = entity.properties[name].getValue();
      });
      return properties;
    },
    /**
     * 显示新闻详细内容
     * @param {Object} val - 要显示的新闻内容对象
     */
    detailedNews(val) {
      console.log("detailedNews-----", val)
      this.showingNewsContent = val

    },
    /**
     * 控制详细新闻对话框的显示与隐藏
     * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
     */
    ifShowDialog(val) {
      // console.log("ifShowDialog-----",val)
      this.showDetailedNewsDialog = val
    },
    /**
     * 隐藏新闻对话框
     * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
     */
    hideNewsDialog(val) {
      // console.log("showDetailedNewsDialog-----",val)
      this.showDetailedNewsDialog = val
    },
    /**
     * 截图功能
     * 此功能通过创建一个链接元素并模拟点击来触发文件下载
     */
    // takeScreenshot() {
    //   const link = document.createElement('a');
    //   link.href = fileUrl
    //   link.download = '芦山地震人员伤亡态势专题报告.pdf';
    //   link.click();
    // },
    //导出图片：简单来讲就是分别获取一下对应的元素，把对应的元素绘制到合成Canvas上，最后把Canvas转换成图片，实现截图。
    //导出图片：简单来讲就是分别获取一下对应的元素，把对应的元素绘制到合成Canvas上，最后把Canvas转换成图片，实现截图。
    async takeScreenshot() {

      // //  4: 获取 Cesium 场景的 Canvas 图像
      // const cesiumCanvas = window.viewer.scene.canvas;
      // const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片
      //
      // //  8: 创建一个新的合成 Canvas
      // const finalCanvas = this.createFinalCanvas();
      // const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});
      //
      // //  9: 将 Cesium 场景绘制到合成 Canvas 上
      // await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);
      //
      // //  14: 将合成后的 Canvas 转换为图片
      // this.previewImage = finalCanvas.toDataURL('image/png');
      const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
      // const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');

      const finalCanvas = this.createFinalCanvas();
      const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

      finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
      finalContext.drawImage(compassCanvas, 20, finalCanvas.height - compassCanvas.height - 20);

      // finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);

      // 获取要截取的 DOM 元素
      const elementToCapture = document.querySelector('#cesiumContainer');
      console.log(elementToCapture, "elementToCapture")
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
        link.download = `test.png`; // 设置下载文件名
        link.href = finalImage; // 设置图片来源
        link.click(); // 触发下载
      }).catch(error => {
        console.error('Error capturing the screenshot:', error);
      });

    },
    // 创建最终合成的 Canvas
    createFinalCanvas() {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#cesiumContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#cesiumContainer').offsetHeight;
      return finalCanvas;
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
    /**
     * 检查地形是否已加载
     * cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
     * 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
     * 该方法通过检查当前地形提供者的类型来确定地形是否已经加载
     * 如果地形提供者是椭球地形提供者(EllipsoidTerrainProvider)，则视为地形未加载
     * 如果地形提供者已定义且不是椭球地形提供者，则视为地形已加载
     *
     * @returns {Boolean} 返回地形是否已加载的状态
     */
    isTerrainLoaded() {
      // 获取当前的地形提供者
      let terrainProvider = window.viewer.terrainProvider;
      // 检查地形提供者是否是椭球地形提供者
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // 在控制台输出地形未加载的信息
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // console.log("地形已加载")
        return true;
      }
      // console.log("地形未加载")
      return false;
    },
    /**
     * 监听地形提供器变化
     * 当地形提供器发生变化时，此方法将被触发
     * 根据modelName的值设置不同的高度，并尝试查找地形
     * 如果地形已加载，则使用一组预设高度；如果地形未加载，则使用另一组预设高度
     * 目前，高度设置和查找地形的方法被注释掉，需要在适当时候启用或移除
     */
    watchTerrainProviderChanged() {
      let that = this
      window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
        this.popupVisible = false // 地形改变时关闭弹窗
        let tzs = []
        if (that.modelName === 1) {
          tzs[0] = 9
          tzs[1] = -567
        } else {
          tzs[0] = 15
          tzs[1] = -557
        }
        if (that.isTerrainLoaded()) {
          // that.changeHeight(tzs[0])
          // that.tz = tzs[0]
          // that.find()
        } else {
          // that.changeHeight(tzs[1])
          // that.tz = tzs[1]
          // that.find()
        }
      });
    },
    /**
     * 向地图中添加实体对象
     *
     * @param {Object} element - 实体对象，包含实体的各类属性
     * @param {String} icon - 实体的图标URL
     * @param {String} tableName - 实体所在的表名称
     * @param {Number} longitude - 实体的经度
     * @param {Number} latitude - 实体的纬度
     */
    addEntity(element, icon, tableName, longitude, latitude) {
      // 使用Cesium的viewer实例向地图中添加一个实体
      window.viewer.entities.add({
        id: element.uuid, // 实体的唯一标识符，使用元素的UUID
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude), // 实体的地理位置，通过经度和纬度转换为Cartesian3坐标
        billboard: { // 实体的图标配置
          image: icon, // 图标的URL
          width: 40, // 图标宽度
          height: 40, // 图标高度
          eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 图标相对于位置点的偏移量
          color: Cesium.Color.WHITE.withAlpha(1), // 图标的颜色和透明度
          scale: 0.8, // 图标的缩放比例
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 图标高度参考，使图标贴合地面
          depthTest: false, // 禁用深度测试，防止图标被地形遮挡
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 设置禁用深度测试的距离为无穷远，确保图标始终不进行深度测试
        },
        properties: { // 实体的属性信息
          tableName: tableName, // 动态传入的表名称
          ...element, // 将element对象展开，自动填充所有属性
          lon: element.longitude, // 实体的经度
          lat: element.latitude // 实体的纬度
        },
      });
    },
    /**
     * 根据类型删除实体
     *
     * 此函数用于从当前窗口的实体集合中，按指定类型删除所有实体
     * 它通过遍历实体集合，检查每个实体的类型属性，如果匹配给定的类型，则删除该实体
     * 采用倒序遍历以避免删除实体时可能导致的索引变化问题
     *
     * @param {string} type - 要删除的实体类型
     */
    removeEntitiesByType(type) {
      // 获取当前窗口中所有的实体
      let entities = window.viewer.entities.values;
      // 倒序遍历实体数组，以确保删除实体时不会影响遍历
      for (let i = entities.length - 1; i >= 0; i--) {
        // 检查当前实体的类型是否与给定类型匹配
        if (entities[i].properties?.type?.getValue() === type) {
          // 如果匹配，则移除该实体
          window.viewer.entities.remove(entities[i]);
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
    /**
     * 添加雅安地区图层
     * 此函数负责将雅安地区的地理边界数据加载到3D地图中，并为其添加可视化图层
     * 如果图层已存在，则不会重复添加
     */
    addYaanRegion() {
      // 检查是否已存在名为'YaanRegionLayer'的数据源，如果不存在则加载
      if (!window.viewer.dataSources.getByName('YaanRegionLayer')[0]) {
        // 加载GeoJSON格式的雅安地区数据，并设置图层的样式
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
          strokeWidth: 4,
        });

        // 当数据源加载成功后，执行以下操作
        geoPromise.then((dataSource) => {
          // 将数据源添加到地图中
          window.viewer.dataSources.add(dataSource);
          // 给图层取名字,以便删除时找到
          dataSource.name = 'YaanRegionLayer';

          // 定义雅安各区县的颜色和名称
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
          // 为每个区县实体设置颜色
          dataSource.entities.values.forEach((entity, index) => {
            // 根据实体索引依次从颜色数组中取颜色
            const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
            const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
            entity.polygon.material = colorMaterial; // 设置填充颜色
            // console.log("--------", index, "----------------", entity)
          });
          // console.log("dataSource--------------", dataSource.entities.values.length)

          // 生成图例
          const legend = document.getElementById('legend');
          legend.style.display = 'block';
          colors.forEach((colorItem, index) => {
            if (index > 0) {
              const colorBox = document.createElement('div');
              colorBox.style.display = 'flex';
              colorBox.style.alignItems = 'center';
              colorBox.style.marginBottom = '5px';

              // 创建颜色方块
              const colorSquare = document.createElement('div');
              colorSquare.style.width = '20px';
              colorSquare.style.height = '20px';
              colorSquare.style.backgroundColor = colorItem.color.toCssColorString(); // 转换 Cesium 颜色为 CSS 颜色字符串
              colorSquare.style.marginRight = '10px';

              // 创建颜色名称标签
              const colorLabel = document.createElement('span');
              colorLabel.textContent = colorItem.name;

              // 将颜色方块和名称加入到图例中
              colorBox.appendChild(colorSquare);
              colorBox.appendChild(colorLabel);
              legend.appendChild(colorBox);
            }

          });
        }).catch((error) => {
          // 如果加载数据源失败，则输出错误信息
          console.error("加载GeoJSON数据失败:", error);
        });
      }
    },
    /**
     * 添加人口图层
     * 此方法用于在地图中添加一个人口图层，如果该图层已存在，则不进行任何操作
     * 人口图层通过Web Map Service (WMS) 提供，具体配置包括服务URL、图层名称和一些请求参数
     */
    addPopLayer() {
      let baseURL = import.meta.env.VITE_APP_API_URL
      // 检查是否已存在名为'PopLayer'的图层
      let popLayerexists = this.imageryLayersExists('PopLayer')
      if (!popLayerexists) {
        // 如果不存在，则创建并添加新的WMS图层
        let popLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapServiceImageryProvider({
              url: baseURL + '/geoserver/yaan/wms', // WMS服务的URL
              layers: 'yaan:pop', // 需要请求的图层名称
              parameters: {
                service: 'WMS', // 指定服务类型为WMS
                format: 'image/png', // 指定返回的图像格式为PNG
                transparent: true // 启用透明背景
              }
            })
        );
        popLayer.name = "PopLayer"; // 设置图层名称为"PopLayer"
      }
    },
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
                  "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
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
                  "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
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
     * 移除数据源图层
     *
     * 本函数通过指定的图层名称，从当前窗口的 viewer 数据源中移除该图层如果图层存在，则会被成功移除
     * 此操作用于清理或更新地图显示，确保地图界面的准确性和时效性
     *
     * @param {string} layerName - 图层名称，用于标识特定的图层
     */
    removeDataSourcesLayer(layerName) {
      // 通过图层名称获取数据源对象如果存在，则执行移除操作
      const dataSource = window.viewer.dataSources.getByName(layerName)[0];
      if (dataSource) {
        window.viewer.dataSources.remove(dataSource);
      }
    },
    //标绘图层清除-->
    /**
     * 移除标记图层
     * 遍历plots数组，查找并移除每个plot对应的图层实体
     */
    MarkingLayerRemove() {
      // 遍历所有plot
      this.plots.forEach(item => {
        // 获取指定plotId的实体
        const entity = viewer.entities.getById(item.plotId);
        // 如果实体存在，则移除该实体
        if (entity) {
          viewer.entities.removeById(item.plotId);
          // 标记该plotId对应的图层为隐藏状态
          this.plotisshow[item.plotId] = 0
        }
      })
    },
    /**
     * 处理标记图层切换
     * 当切换到本地标记图层时，如果不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
     * 当切换到非本地标记图层时，如果存在名为'drawingLayer'的图层，则从视图中移除该图层
     *
     * @param {boolean} isMarkingLayerLocal - 表示是否为本地标记图层
     */
    handleMarkingLayerChange(isMarkingLayerLocal) {
      if (isMarkingLayerLocal) {
        // 如果视图中不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
        if (!window.viewer.dataSources.getByName('drawingLayer')[0]) {
          let newLayer = new Cesium.CustomDataSource('drawingLayer');
          window.viewer.dataSources.add(newLayer);
          newLayer.show = true;
          this.isMarkingLayerLocal = true;
        }
      } else {
        // 当切换到非本地标记图层时，将isMarkingLayerLocal设置为false
        this.isMarkingLayerLocal = false;
        // 如果视图中存在名为'drawingLayer'的图层，则从视图中移除该图层
        let dataSource = window.viewer.dataSources.getByName('drawingLayer')[0];
        if (dataSource) {
          window.viewer.dataSources.remove(dataSource);
        }
      }
    },
    /**
     * 根据经纬度获取人口密度信息
     *
     * 该函数通过调用WMS服务来获取给定经纬度坐标附近的人口密度信息它发送一个HTTP请求，请求类型为GetFeatureInfo，
     * 并指定了相应的查询图层和查询范围（通过bounding box指定）返回的人口密度信息将以JSON格式进行处理
     *
     * @param {number} longitude - 经度坐标，用于指定查询区域的中心点
     * @param {number} latitude - 纬度坐标，用于指定查询区域的中心点
     */
    getPopDesity(longitude, latitude) {
      let baseURL = import.meta.env.VITE_APP_API_URL
      // WMS服务的URL
      const url = baseURL + "/geoserver/yaan/wms"
      // 查询区域的边界框大小，用于确定查询区域的范围
      const bboxSize = 0.001
      // 构建URL查询参数
      const urlParams = new URLSearchParams({
        service: 'WMS',
        request: 'GetFeatureInfo',
        version: '1.1.1',
        layers: "yaan:pop",
        query_layers: "yaan:pop",
        bbox: `${longitude - bboxSize},${latitude - bboxSize},${longitude + bboxSize},${latitude + bboxSize}`,
        width: 101,
        height: 101,
        info_format: 'application/json',
        x: 50,
        y: 50,
        srs: 'EPSG:4326',
      })
      // 构建完整的请求URL
      const fullUrl = `${url}?${urlParams.toString()}`;
      // 打印调试信息
      // console.log('GetFeatureInfo URL:', fullUrl);
      // 发送HTTP请求，并处理响应
      fetch(fullUrl).then(response => response.json()).then(data => {
        // 处理返回的数据，这里仅打印出人口密度信息
        // console.log(data.features[0].properties)
      }).catch(error => {
        // 错误处理，打印错误信息
        // console.error('There was an error!', error);
      });
    },
    /**
     * 专题图下载
     * 更新主题地图的预览
     * 当选择了一个主题地图后，显示地图的预览图；如果没有选择，则隐藏预览图
     */
    updatethematicMap() {
      if (this.selectthematicMap) {
        this.ifShowMapPreview = true
        const selectedData = MapPicUrl.find(item => item.eqid === this.eqid && item.name === this.selectthematicMap);
        // console.log(selectedData)
        this.imgurlFromDate = selectedData.path
        this.imgName = selectedData.name
        // console.log("11111",this.imgurlFromDate, this.imgName)
        this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
        // console.log(this.imgshowURL)
      } else {
        this.ifShowMapPreview = false
      }

    },
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview = val // 是否预览专题图 = val
      if (!val) {
        this.selectthematicMap = null
      }
    },
    updateReportItem() {
      if (this.selectReportItem) {
        // console.log(this.selectReportItem)
        const selectedData = ReportUrl.find(item => item.eqid === this.eqid && item.name === this.selectReportItem);
        const link = document.createElement('a');
        link.href = selectedData.path;
        link.download = selectedData.name; // 指定下载的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          this.selectReportItem = null;
        }, 1000); // 1000 毫秒后执行
      }
    },
    // 关闭弹窗
    closePlotPop() {
      this.timelinePopupVisible = !this.timelinePopupVisible
    },
    // ws发送数据（只有点的是在这里）
    wsSendPoint(data) {
      this.websock.send(data)
    },
    clearResource(viewer) {
      this.isTimerRunning = false;
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      gl = null
    },
    /**
     * 计算复选框列表的高度
     * 此函数用于动态计算一组复选框堆叠后的总高度，考虑了复选框的高度和它们之间的间距
     *
     * @returns {number} 返回复选框列表的总高度
     */
    getHeight() {
      // 每个复选框的高度
      const checkboxHeight = 50;
      // 复选框之间的间距值
      const margin = 10;
      // 输出用于校验的计算结果，帮助理解复选框数量如何影响高度计算
      // console.log(((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin)
      // 返回复选框列表的总高度，包括所有复选框的高度和它们之间的间距
      return ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin;
    },
    /**
     * 图层要素 切换展开状态
     *
     * 此方法用于切换组件的展开和收起状态当用户点击展开按钮时，会触发此方法它通过取反当前的展开状态来改变组件的展开/收起状态
     *
     * @returns {void} 无返回值
     */
    toggleExpand() {
      // console.log("Toggle expand clicked");
      this.isExpanded = !this.isExpanded;
    },
    /**
     * 设置组件展开的面板互斥,避免堆叠
     * 切换组件的显示状态
     * @param {String} component - 要切换的组件名称
     */
    toggleComponent(component) {
      // 收起图层要素
      this.isExpanded = false;
      // 清除主题地图预览的显示状态
      this.isshowThematicMapPreview = null;
      // 清除选择的主题地图
      this.selectthematicMap = null;

      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;
    },
  }
}
</script>

<style scoped>
.eqtitle {
  background-color: #0d325f;
  width: 100%;
  height: 33px;
  display: flex;
  align-items: center; /* 垂直居中 */
  font-weight: bold; /* 文字加粗 */
}

.eqtitle-text_eqname {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-left: 30px;
  margin-right: 60%;
}

#box {
  height: calc(100vh - 106px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#cesiumContainer {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.current-time-info {
  position: absolute;
  bottom: 3%;
  width: 30%;
  left: 8%;
}

.end-time-info {
  position: absolute;
  bottom: 3%;
  width: 50%;
  right: 0%;
}

.end-time-info .timelabel span:nth-child(2) {
  margin: 0 5px; /* 分隔符前后的间隔 */
}

.timelabel {
  color: #ffffff;
}

/*·························································*/
.bottom {
  height: 8%;
  width: 50%;
  left: 27%;
  bottom: 5%;
  position: absolute;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.play {
  width: 4%;
  height: 100%;
  margin-left: -2%;
  display: flex;
  align-items: center;
}

.play-icon,
.pause-icon {
  width: 100%;
  margin-right: 4px;
  height: auto;
  cursor: pointer;
}


.time-ruler {
  position: relative;
  width: 69%;
  height: 8px;
  left: -15%;
  background-color: #ddd;
  border-radius: 4px;
  margin: 0 1%;
  cursor: pointer;
  flex-direction: row;
}

.speed-selector {
  position: absolute;
  cursor: pointer;
  display: inline-block;
  right: -12%;
  bottom: -50%;
}

.speedButton {
  padding: 2px 20px;
  background-color: #dddddd; /* 蓝色背景 */
  border-radius: 30px; /* 椭圆框 */
  text-align: center;
  color: #1b6cd0; /* 文字颜色 */

}

.chooseSpeed {
  position: absolute;
  bottom: 100%; /* 向上展开 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  background-color: #dddddd; /* 蓝色背景 */
  padding: 5px 0;
  border-radius: 6px; /* 椭圆框 */
  min-width: 100%; /* 确保下拉菜单宽度至少与按钮一样宽 */
  z-index: 1000; /* 确保下拉菜单在最上层 */
}

.speed-option {
  padding: 2px 20px;
  color: #1b6cd0; /* 文字颜色 */
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.speed-option:hover,
.speed-option:focus {
  background-color: #71a8e3; /* 蓝色背景 */
}

.speed-option.selected {
  background-color: #71a8e3; /* 选中项更深的蓝色 */
}


.time-ruler-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.time-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #196cd2;
  border-radius: 4px;
  /*transition: width 0.1s ease;*/
}

.time-slider {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #196cd2;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  /*transition: left 0.1s ease;*/
}

.button-container {
  position: absolute;
  z-index: 20;
  top: 8.3%;
  left: 2%;
}


:deep(.el-button--primary) {
  border-color: #ffffff; /* 白色边框 */
  background-color: #1a3749;
  color: #ffffff; /* 白色字体 */
}

:deep(.el-button--primary):hover {
  background-color: rgba(255, 255, 255, 0.2); /* 可选：鼠标悬浮时的背景色 */
}

:deep(.el-button--primary):active {
  background-color: rgba(255, 255, 255, 0.4); /* 可选：鼠标按下时的背景色 */
}

.thematic-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 20%;
}

.back-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  right: 21%;
}

.draw-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 14%;
}

.eqlist-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 2%;
}

.layer-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 8%;
}

.regionjump-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 14%;
}

.layerclear-button {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 20%;
}

.thd-eqtable {
  background-color: #324257;
  width: 30%;
  top: 10%;
  height: 43%;
  z-index: 30;
  left: 1%;
  position: absolute;
}

.dropdown {
  background-color: #333832;
  width: 25%;
  top: 10%;
  height: 23%;
  padding: 15px;
  z-index: 30;
  left: 1%;
  position: absolute;
  overflow-y: auto; /* 启用垂直滚动条 */
}

/*图层要素选项颜色改为白色*/
.el-checkbox {
  color: #FFFFFF;
}

/*行政区划按钮样式*/
.district-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.city-button, .district-button {
  flex: 0 0 20%; /* 每行5个按钮 */
  display: flex;
  justify-content: center;
  margin: 4px; /* 调整按钮之间的间距 */
}

.el-button {
  font-size: 12px; /* 调整按钮字体大小 */
  padding: 6px 12px; /* 调整按钮内边距 */
  width: 100%; /* 使按钮宽度自适应 */
}

/*弹窗样式*/
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
}

/*图层要素选项颜色改为白色*/
.el-checkbox {
  color: #FFFFFF;
}

/* 覆盖 el-tooltip 的宽度 */
.el-tooltip__popper {
  min-width: 150px; /* 设置下拉框的最小宽度 */
  max-width: 200px; /* 设置下拉框的最大宽度 */
}

/* 如果要针对特定的菜单项，可以通过更具体的选择器进行控制 */
.el-menu-item[data-index="5"] .el-tooltip__popper {
  width: 100px; /* 专题图下载的下拉框宽度 */
}

.el-menu-item[data-index="6"] .el-tooltip__popper {
  width: 200px; /* 返回首页的下拉框宽度 */
}

:deep(.cesium-baseLayerPicker-dropDown-visible) {
  z-index: 100 !important;
  background-color: #2b323a;
}

:deep(.cesium-baseLayerPicker-dropDown) {
  right: 9px !important;
  width: 398px !important;
  height: 310px !important;
}

:deep(.distance-legend) {
  bottom: 1% !important;
}

:deep(.close-item) {
  margin-right: -5 !important;
}

.logo-title {
  height: 100%;
  background-image: url(@/assets/images/CommandScreen/菜单底图.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.logo-title-content {
  color: #fff;
  height: 100%;
  margin: auto;
  font-size: 27px;
  font-weight: 700;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  text-align: center; /* 多行文本居中 */
  background-image: url(@/assets/images/CommandScreen/菜单标题.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden; /* 隐藏滚动条 */
}

@media screen and (max-width: 1645px) {
  .logo-title-content {
    width: 100% !important;
    padding-top: 29px !important;
    padding-right: 45px !important;
    font-size: 19px !important;
  }
}

@media screen and (max-width: 1835px) {
  .logo-title-content {
    width: 62% !important;
  }
}

.menue-left {
  left: 176px;
}

.logo-menu .logo-menu-active {
  background-image: url(@/assets/images/CommandScreen/橙色按钮.png);
}

.logo-menu-tittle {
  color: #fff;
  width: 141px;
  height: 41px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(@/assets/images/CommandScreen/蓝色按钮.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 1490px) {
  .logo-menu-tittle {
    width: 92px !important;
  }
}

@media screen and (max-width: 1835px) {
  .logo-menu-tittle {
    width: 125px !important;
    font-size: 18px !important;
  }
}

.logo-menu {
  position: absolute;
  top: 13px;
  display: flex;
}

.menue-right {
  right: 50px;
}

.logo-left-weather {
  color: #fff;
  position: absolute;
  top: 5px;
  left: 9px;
}

.logo-left-time {
  position: absolute;
}

.logo-right-time {
  position: absolute;
  top: 18px;
  right: 26px;
}

.logo-time-hour {
  font-size: 19px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0px 2px 6px #123756;
  background: linear-gradient(0deg, #bee1ff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pop-dialog .pop-dialog__content {
  height: 100%;
  overflow: auto;
  background-color: #1d3043;
}

.pop-dialog {
  height: 3.5rem;
}

.pop-icon {
  margin-right: 10px;
  margin-left: 6px;
  vertical-align: middle;
}

.logo-time-year {
  font-size: 14px;
  font-weight: 500;
  color: #cdcdcd;
}

.timelineRunningTimeLabel {
  background-color: #163253;
  border-radius: 20px;
  height: 6%;
  width: 30%;
  top: 8%;
  position: absolute;
  z-index: 50;
  color: #FFFFFF;
  font-size: 23px;
  left: 32%;
  //text-align: center;
  display: flex; /* 使用Flexbox布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}


.pop_left_background {
  top: 13%;
  left: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(90deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(44, 69, 94, 0) 100%);
}

.pop_right_background {
  top: 13%;
  right: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

:deep(.timelineLegend) {
  width: 19vw;
  bottom: 6.8%;
}

:deep(.new-panel) {
  top: 3%;
  left: 104%;
  width: 239%;
}

:deep(.detailedNews) {
  width: 238%;
  height: 69%;
  top: 3%;
  right: 102%;
}

:deep(.news-title:after) {
  top: 21%;
}

:deep(.timelineLegend.open) {
  width: 38%;
}

:deep(.close-items-row) {
  left: 0%;
}

</style>
