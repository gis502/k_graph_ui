<template>
  <div>
    <!--    地震列表切换-->
    <!--    <div class="eqlist-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('eqList')">地震列表</el-button>-->
    <!--    </div>-->
    <div class="thd-eqtable" v-if="activeComponent === 'eqList'">
      <eqTable :eqData="tableData"/>
    </div>

    <!--   图层要素-->
    <!--    <div class="layer-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('layerChoose')">图层要素</el-button>-->
    <!--    </div>-->
    <div v-if="activeComponent === 'layerChoose'" class="dropdown"
         :style="{ height: 'auto',  transition: 'height 0.3s ease' }">
      <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
        <el-checkbox
            v-for="item in (isExpanded ? layeritems : layeritems.slice(0, 6))"
            :key="item.id"
            :label="item.name"
            style="margin:0 0;"
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
        <span style="color: white;">{{ isExpanded ? '▲' : '▼' }}</span>
      </div>
    </div>

    <div v-if="activeComponent === 'thematicMapDownload'" class="dropdown"
         :style="{ height: 'auto',  transition: 'height 0.3s ease' }">
      <el-radio-group v-model="selectthematicMap" @change="updatethematicMap" class="grid-container">
        <el-radio
            v-for="item in (isExpanded ? thematicMapitems : thematicMapitems.slice(0, 6))"
            :key="item.id"
            :label="item.name"
            style="margin: 0 0;color:white"
        >
          {{ item.name }}
        </el-radio>
      </el-radio-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
        <span style="color: white;">{{ isExpanded ? '▲' : '▼' }}</span>
      </div>
    </div>
    <div v-if="activeComponent === 'reportDownload'" class="dropdown"
         :style="{ height: 'auto',  transition: 'height 0.3s ease' }">
      <el-radio-group v-model="selectReportItem" @change="updateReportItem" class="grid-container">
        <el-radio
            v-for="item in (isExpanded ? reportItems : reportItems.slice(0, 6))"
            :key="item.id"
            :label="item.name"
            style="margin: 0 0;color:white"
        >
          {{ item.name }}
        </el-radio>
      </el-radio-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
        <span style="color: white;">{{ isExpanded ? '▲' : '▼' }}</span>
      </div>
    </div>


  <!--    行政区划-->
  <!--    <div class="regionjump-button">-->
  <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('Regionjump')">行政区划</el-button>-->
  <!--    </div>-->
  <div class="dropdown" v-if="activeComponent === 'Regionjump'">
    <div class="district-buttons">
      <div class="city-button">
        <el-button @click="addYaanImageryDistrict">雅安市</el-button>
      </div>
      <div class="city-button">
        <el-button @click="backcenter">回到震中</el-button>
      </div>
    </div>
    <!-- 下属区县按钮 -->
    <div class="district-buttons">
      <div v-for="district in districts" :key="district.adcode" class="district-button">
        <el-button @click="handleDistrictClick(district)">{{ district.name }}</el-button>
      </div>
    </div>
  </div>

  <!--报告产出按钮-->
  <!--    <div class="button-container">-->
  <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="takeScreenshot">报告产出</el-button>-->
  <!--    </div>-->
  <!--    <div class="thematic-button">-->
  <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="">专题图下载</el-button>-->
  <!--    </div>-->
  <!--    <div class="back-button">-->
  <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="backToHome">返回首页</el-button>-->
  <!--    </div>-->


  <!--    title-->
  <div class="eqtitle">
      <span
          class="eqtitle-text_eqname">{{ this.eqyear }}年{{ this.eqmonth }}月{{
          this.eqday
        }}日{{ this.centerPoint.earthquakeName }}{{ this.centerPoint.magnitude }}级地震</span>
  </div>
  <!--    title end-->

  <div>
    <el-menu
        class="el-menu-vertical-demo"
        mode="horizontal"
        background-color="#293038"
        text-color="#fff"
        active-text-color="#537BB7FF"
        style="position: absolute;
                  top: 4.3%;z-index: 20;
                  height: 45px;width: 25%;
                  margin: 0;padding: 0;
                  left: 1%;border-radius:3px;text-align: center"
    >
      <el-menu-item index="1" @click="toggleComponent('eqList')" style="width: 90px;">地震列表</el-menu-item>
      <el-menu-item index="2" @click="toggleComponent('layerChoose')" style="width: 90px;">图层要素</el-menu-item>
      <el-menu-item index="3" @click="toggleComponent('Regionjump')" style="width: 90px;">视角跳转</el-menu-item>
<!--      <el-menu-item index="4" @click="takeScreenshot" style="width: 100px;">分析图件产出</el-menu-item>-->
      <el-menu-item index="4" @click="toggleComponent('reportDownload')" style="width: 90px;">分析图件产出</el-menu-item>
      <el-menu-item index="5" @click="toggleComponent('thematicMapDownload')" style="width: 90px;">专题图下载</el-menu-item>
      <el-menu-item index="6">返回首页</el-menu-item>
    </el-menu>
  </div>

  <!--    box包裹地图，截图需要-->
  <div id="box" ref="box">
    <div id="cesiumContainer">
      <!-- TimeLinePanel 弹窗 -->
      <TimeLinePanel
          :visible="timelinePopupVisible"
          :position="timelinePopupPosition"
          :popupData="timelinePopupData"
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
      <img class="play-icon" src="../../assets/icons/TimeLine/后退箭头.png" @click="backward"/>
      <img class="play-icon" src="../../assets/icons/TimeLine/播放.png" v-if="!isTimerRunning"
           @click="toggleTimer"/>
      <img class="pause-icon" src="../../assets/icons/TimeLine/暂停.png" v-if="isTimerRunning"
           @click="toggleTimer"/>
      <img class="play-icon" src="../../assets/icons/TimeLine/前进箭头.png" @click="forward"/>
    </div>

    <div class="time-ruler" @mousedown="startDrag" @mouseenter="isDragging = true" @mouseleave="isDragging = true">
      <div class="time-ruler-line" @click="jumpToTime">
        <div class="time-progress" :style="{ width: `${currentTimePosition}%` }"></div>
        <div class="time-slider" :style="{ left: `${currentTimePosition-0.5}%` }"></div>
        <!--          <div class="time-slider" :style="{ left: `${currentTimePosition}%` }"></div>-->
      </div>
      <!-- speedButton 和 chooseSpeed 放在一起 -->
      <span class="speedButton">{{ speedOption }}</span>
      <div class="chooseSpeed">
        <option v-for="option in speedOptions" :key="option" @click="selectSpeed(option)">
          {{ option }}
        </option>
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
  <!-- 进度条 end-->

  <!--    两侧组件-->
  <!--   应急响应-左上   -->
  <timeLineEmergencyResponse
      :eqid="eqid"
      :currentTime="currentTime"
  />
  <!--   人员伤亡-左中   -->
  <timeLinePersonnelCasualties
      :eqid="eqid"
      :currentTime="currentTime"
  />
  <!--   救援出队-左下   -->
  <timeLineRescueTeam
      :eqid="eqid"
      :currentTime="currentTime"
  />
  <!--  新闻-右上  -->
  <div>
    <news
        :eqid="eqid"
        :currentTime="currentTime"
        @ifShowDialog="ifShowDialog"
        @detailedNews="detailedNews"
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
  <!--      缩略图-->
  <div>
    <mini-map></mini-map>
  </div>

  <timeLineLegend
      :activeComponent="activeComponent"
      @toggleComponent="toggleComponent"
  ></timeLineLegend>
  <!--    两侧组件 end-->


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
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getEqById} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'

import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import newsDialog from "@/components/TimeLine/newsDialog.vue";
import timeLineEmergencyResponse from "@/components/TimeLine/timeLineEmergencyResponse.vue"
import timeLinePersonnelCasualties from "@/components/TimeLine/timeLinePersonnelCasualties.vue"
import timeLineRescueTeam from "@/components/TimeLine/timeLineRescueTeam.vue"
import MiniMap from "@/components/TimeLine/miniMap.vue";
import News from "@/components/TimeLine/news.vue";
import timeLineLegend from "@/components/TimeLine/timeLineLegend.vue";

//报告产出
import fileUrl from "@/assets/json/TimeLine/2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf"
import commonPanel from "@/components/Cesium/CommonPanel";
import {getPloy} from "@/api/system/plot"
import eqTable from '@/components/Home/eqtable.vue'
import geojsonmap from '@/assets/geoJson/map.json'
import yaan from '@/assets/geoJson/yaan.json'
import picUrl1 from "@/assets/json/TimeLine/芦山县行政区划图.png";
import {TianDiTuToken} from "@/cesium/tool/config";
import {getFeaturesLayer} from "@/api/system/emergency.js";
import emergencyRescueEquipmentLogo from '@/assets/images/disasterReliefSuppliesLogo.jpg';
import rescueTeamsInfoLogo from '@/assets/images/rescueTeamsInfoLogo.png';
import emergencySheltersLogo from '@/assets/images/emergencySheltersLogo.png';
import RouterPanel from "@/components/Cesium/RouterPanel.vue";
import fault_zone from "@/assets/geoJson/line_fault_zone.json";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import {addFaultZones, addHistoryEqPoints, addOvalCircles} from "../../cesium/plot/eqThemes.js";

//专题图
import {MapPicUrl,ReportUrl} from "@/assets/json/thematicMap/PicNameandLocal.js"
import thematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
export default {
  components: {
    thematicMapPreview,
    RouterPanel,
    TimeLinePanel,
    News,
    MiniMap,
    timeLineEmergencyResponse,
    timeLinePersonnelCasualties,
    timeLineRescueTeam,
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
        time: '',
        content: '',
        img: '',
      },
      showDetailedNewsDialog: false,

      //时间轴时间
      // ifShowData: false,
      // timelineTotalDurationMinutes:10380,
      timelineAdvancesNumber: 2076,  //总分钟数（取5的倍数）/5 =总前进次数  默认值2076（符合芦山） 结束时间2022-06-08 22:00:00
      eqstartTime: '',
      currentTime: '',
      eqendTime: '',
      tmpeqendTime: '',//默认的地震结束时间
      realTime: new Date(),
      //时间轴当前进度条节点位置
      // currentTimePosition: 0,
      currentTimePosition: 100,
      //时间轴当前前进步
      currentNodeIndex: 2076,
      realtimeinterval: null,
      intervalId: null,
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
      thematicMapitems:[],
      selectthematicMap:'',
      isshowThematicMapPreview:'',
      imgshowURL:'',
      imgurlFromDate:'',
      imgName:'',
      ifShowMapPreview: false, // 是否预览专题图
      //专题图下载end

      //报告产出
      reportItems:[],
      selectReportItem:'',

    };
  },
  created() {
    this.eqid = new URLSearchParams(window.location.search).get('eqid')
    this.thematicMapitems = MapPicUrl.filter(item => item.eqid === this.eqid);
    this.reportItems=ReportUrl.filter(item => item.eqid === this.eqid);
    // console.log(this.thematicMapitems);
  },
  mounted() {
    this.init()
    this.getEqInfo(this.eqid)

    this.initPlot(); // 初始化加载应急数据
    // // ---------------------------------------------------
    // // 生成实体点击事件的handler
    this.entitiesClickPonpHandler()
    this.watchTerrainProviderChanged()
    // if(this.eqid === 'be3a5ea48dfda0a2251021845f17960b'){
    //     this.ifShowData = true
    // }
  },
  // 图层要素
  methods: {
    //图层要素
    getHeight() {
      const checkboxHeight = 50; // 每个复选框的高度
      const margin = 10; // margin 值
      // console.log(this.layeritems.length/2 , this.layeritems.length%2)
      console.log(((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin)
      return ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin;
    },

    // 图层要素
    toggleExpand() {
      console.log("Toggle expand clicked");
      this.isExpanded = !this.isExpanded;
    },
    //设置组件展开的面板互斥,避免堆叠
    toggleComponent(component) {
      this.isExpanded=false; //图层要素收起
      this.isshowThematicMapPreview=null
      this.selectthematicMap=null
      this.selectReportItem=null
      // 图层要素
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;
      if (this.activeComponent === 'eqList') {
        this.getEq()
      }
    },
    // 初始化控件等
    init() {
      // console.log(this.eqid)
      let viewer = initCesium(Cesium)
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
      window.viewer = viewer
      // this.viewer=window.viewer
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
          // console.log(latString);
          // console.log(logString);
          // console.log(altiString);
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
      // that.smallViewer = new Cesium.Viewer(smallMapContainer, {
      //   // 隐藏所有控件
      //   geocoder: false,
      //   homeButton: false,
      //   sceneModePicker: false,
      //   timeline: false,
      //   navigationHelpButton: false,
      //   animation: false,
      //   infoBox: false,
      //   fullscreenButton: false,
      //   showRenderState: false,
      //   selectionIndicator: false,
      //   baseLayerPicker: false,
      //   selectedImageryProviderViewModel: viewer.imageryLayers.selectedImageryProviderViewModel,
      //   selectedTerrainProviderViewModel: viewer.terrainProviderViewModel
      // });
      // 隐藏缩略图视图器的版权信息
      smallViewer._cesiumWidget._creditContainer.style.display = 'none';

      // 同步主视图器的相机到缩略图视图器
      function syncCamera() {
        const camera1 = viewer.scene.camera;
        const camera2 = smallViewer.scene.camera;

        camera2.setView({
          destination: camera1.positionWC,
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
    },

    // /取地震信息+开始结束当前时间初始化
    getEqInfo(eqid) {
      getEqById({id: eqid}).then(res => {
        console.log("thd eqid---------------", eqid)
        //震中标绘点
        this.centerPoint = res
        // console.log(res)
        // console.log(res)
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.occurrenceTime)
        // this.centerPoint.endtime=new Date(this.centerPoint.starttime.getTime() + this.timelineAdvancesNumber*5*60*1000+1000);
        //默认结束时间（设置得大一点，防止按时间渲染随时间长度更新消失了）10天
        this.centerPoint.endtime = new Date(this.centerPoint.starttime.getTime() + 10 * 24 * 36000 * 1000);
        // console.log(this.centerPoint.starttime,this.centerPoint.endtime,this.timelineAdvancesNumber)
        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        //默认结束时间 方便展示设置成芦山的时间  要改！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
        this.tmpeqendTime = new Date(this.centerPoint.starttime.getTime() + 2076 * 5 * 60 * 1000);
        // this.realTime = new Date(); //真实时间
        //
        if (this.realTime < this.tmpeqendTime) {
          this.eqendTime = new Date(this.realTime)
          this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
          this.currentNodeIndex = this.timelineAdvancesNumber
        } else {
          this.eqendTime = this.tmpeqendTime
        }
        this.currentTime = this.eqendTime

        this.getEq()
        this.checkIfOvalCircleLayer();
        this.updateMapandVariablebeforInit()

      })

    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
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

    //更新地图中心视角，更新变量：地震起止时间，渲染点
    updateMapandVariablebeforInit() {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.geom.coordinates[0]),
            parseFloat(this.centerPoint.geom.coordinates[1]),
            120000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });
      //加载中心点
      viewer.entities.add({
        // properties: {
        //   type: "震中",
        //   time: this.centerPoint.time,
        //   name: this.centerPoint.position,
        //   lat: this.centerPoint.latitude,
        //   lon: this.centerPoint.longitude,
        //   describe: this.centerPoint.position,
        // },
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
          disableDepthTestDistance: Number.POSITIVE_INFINITY
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


      smallViewer.entities.removeAll();
      smallViewer.entities.add({
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
          disableDepthTestDistance: Number.POSITIVE_INFINITY
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

      this.xuanran(this.eqid)
    },
    //请求控制（当前时间还在地震应急处置时间内，就每分钟发送一共查询请求，如果以及大于结束时间，只请求一次就行）


    // xuanran 方法
    xuanran(eqid) {
      this.getPlotwithStartandEndTime(eqid)  //拿渲染点数据
      this.intimexuanran(eqid)  //定时向数据库请求 每分钟请求一次
    },
    intimexuanran(eqid) {
      //5分钟一次
      if (this.realTime < this.tmpeqendTime) {
        console.log("还在更新的地震")
        if (!this.isTimerRunning && this.currentTimePosition === 100) {
          // console.log("gengxin")
          // 检查是否已经有定时器在运行
          if (!this.realtimeinterval) {

            // console.log("!this.realtimeinterval")
            this.realtimeinterval = setInterval(() => {
              if (this.currentTimePosition !== 100) {
                clearInterval(this.realtimeinterval); // 停止定时器
                this.realtimeinterval = null; // 清除引用
                // this.isTimerRunning = false; // 更新状态
                return; // 跳出当前循环
              }
              //更新开始结束当前时间，时间轴进度条位置，节点数量
              this.getPlotwithStartandEndTime(eqid) //取标绘点，更新标绘点
              this.eqendTime = new Date()
              this.currentTime = this.eqendTime
              this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
              this.currentNodeIndex = this.timelineAdvancesNumber
              // console.log(this.currentNodeIndex, "xuanran this.currentNodeIndex")
              // this.
              // }, 3000000);
            }, 5000);
          }

          //当前时间每秒更新
          if (!this.eqendtimeinterval) {
            // console.log("!this.eqendtimeinterval")
            this.eqendtimeinterval = setInterval(() => {
              if (this.currentTimePosition !== 100) {
                clearInterval(this.eqendtimeinterval); // 停止定时器
                this.eqendtimeinterval = null; // 清除引用
                // this.isTimerRunning = false; // 更新状态
                return; // 跳出当前循环
              }
              this.eqendTime = new Date()
              this.currentTime = this.eqendTime
              // this.
            }, 1000);
          }
        }
      }
      else{
        console.log("过去的地震")
      }

    },

    //取标绘点
    getPlotwithStartandEndTime(eqid) {
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {

        //显示标记，追加新的点 （增）
        console.log(res, "res")
        res.forEach(item => {
          const plotexists = this.plots.some(plot => plot.plotId === item.plotId);
          if (!plotexists) {
            this.plotisshow[item.plotId] = 0;
          }
        })
        //删除的点删除  （删）
        const currentPlotIds = new Set(res.map(item => item.plotId)); //当前请求中返回的有哪些图标
        // 移除不再存在的 plotid
        for (const plotId in this.plotisshow) {
          if (!currentPlotIds.has(plotId)) {
            // 删除 plotisshow 中的项
            delete this.plotisshow[plotId];
            // 从 viewer 中移除对应的点
            viewer.entities.removeById(plotId);
          }
        }


        //更新数组信息（包括点的起止时间、属性信息） （改）
        this.plots = res
        this.plots.forEach(item => {
          if (!item.endTime) {
            // item.endtime = new Date(this.eqendTime.getTime() + 5000);
            item.endTime = new Date(this.eqstartTime.getTime() + 10 * 24 * 36000 * 1000);
          }
          if (!item.startTime) {
            item.startTime = this.eqstartTime;
          }
        })
        // 将 item 添加到 this.plots
        // this.plots.push(item);
        // 检查当前 item 是否已经存在于 this.plots 中
        // const plotexists = this.plots.some(plot => plot.plotid === item.plotid);
        // if(!plotexists){
        //   // 设置 endtime 和 starttime
        //   if (!item.endtime) {
        //     // item.endtime = new Date(this.eqendTime.getTime() + 5000);
        //     item.endtime = new Date(this.eqstartTime.getTime() + 10*24*36000*1000);
        //   }
        //   if (!item.starttime) {
        //     item.starttime = this.eqstartTime;
        //   }
        //   // 将 item 添加到 this.plots
        //   this.plots.push(item);
        //   // 初始化 plotisshow
        //
        // }
        // })
        this.updatePlot()


        //开启时间轴
        // this.initTimerLine();
        //   if(this.ifShowData){
        //       this.initTimerLine();
        //   }else{
        //       this.isTimerRunning = false
        //   }
      })
    },
    //更新标绘点
    updatePlot() {
      // console.log(this.plots)
      let that = this
       //--------------------------点绘制------------------------------
      let pointArr = this.plots.filter(e => e.drawtype === 'point')
      console.log("点渲染", pointArr)

      let points = [];

      pointArr.forEach(item => {
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);

        // 如果点应该显示
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1;

          // 创建点数据
          let point = {
            earthquakeId: item.earthquakeId,
            plotid: item.plotId,
            time: item.creationTime.replace("T", " "),
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
        if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0;
          console.log(item.plotId, "end");

          // 从 dataSource 中删除点
          if (window.pointDataSource) {
            const entityToRemove = window.pointDataSource.entities.getById(item.plotId);
            const ellipseEntityToRemove = window.pointDataSource.entities.getById((item.plotId+'_ellipse'));
            console.log("entityToRemove",entityToRemove)
            if (entityToRemove) {
              window.pointDataSource.entities.remove(entityToRemove); // 移除点
            }
            if(ellipseEntityToRemove){
                window.pointDataSource.entities.remove(ellipseEntityToRemove); // 移除标绘点的动画实体
            }
          }
        }
      });
      // 批量渲染点
      if (points.length > 0) {
        cesiumPlot.drawPoints(points,true);
      }

      //--------------------------线绘制------------------------------
      let polylineArr = this.plots.filter(e => e.drawtype === 'polyline')
      // console.log("polylineArr", polylineArr)

      let filteredPolylineArr = []; // 用于存储符合条件的线条数据

       polylineArr.forEach(item => {
         // console.log("isshow",this.plotisshow)
         // that.drawPolyline(item)
         const currentDate = new Date(this.currentTime);
         console.log(currentDate)
         const startDate = new Date(item.startTime);
         const endDate = new Date(item.endTime);
         // console.log("line",item.plotId,startDate,endDate,currentDate)
         if ( startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
           this.plotisshow[item.plotId] = 1
           filteredPolylineArr.push(item); // 收集符合条件的线条
         }
         //消失
         if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
           this.plotisshow[item.plotId] = 0
           // console.log(item.plotId,"end")
           viewer.entities.removeById(item.plotId)
           /*因为封装好渲染线的函数中，将每个点都进行了渲染，清除时也要将每个点清除*/
           for (let i = 0; i < item.geom.coordinates.length; i++) {
             viewer.entities.removeById(item.plotId + 'point' + (i + 1))
           }
         }

       })
       // console.log("filteredPolylineArr",filteredPolylineArr)
       cesiumPlot.getDrawPolyline(filteredPolylineArr)

       //--------------------------面绘制------------------------------
      let polygonArr = this.plots.filter(e => e.drawtype === 'polygon')
       let filteredPolygonArr = []; // 用于存储符合条件的面数据
      polygonArr.forEach(item => {
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // console.log("line",item.plotId,startDate,endDate,currentDate)
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          filteredPolygonArr.push(item);// 收集符合条件的面
        }
        //消失
        if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          // console.log(item.geom.coordinates,"endPOlygon")
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
       let polygonMap = {};
       filteredPolygonArr.forEach(item => {
         if (!polygonMap[item.plotId]) {
           polygonMap[item.plotId] = [];
         }
         polygonMap[item.plotId].push(item);
       });
       Object.keys(polygonMap).forEach(plotId => {
         let polygonData = polygonMap[plotId];
         // console.log("polygonData",polygonData)
         cesiumPlot.getDrawPolygon(polygonData)
       });
    },

    //时间轴操作-----------------------------------------------
    //暂停播放切换
    toggleTimer() {
      if (!this.isTimerRunning) {
        this.initTimerLine();
      } else {
        this.stopTimer();
      }
    },
    initTimerLine() {
      this.isTimerRunning = true
      //播放一遍完成（停止，如果计算结果超过，设为最大值）
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 0;
        this.currentTime = this.eqstartTime
        this.currentNodeIndex = 0
      }
      this.intervalId = setInterval(() => {
        this.updateCurrentTime();
      }, 100);
    },
    //updateCurrentTime 循环执行
    updateCurrentTime() {
      this.currentNodeIndex = (this.currentNodeIndex + 1 * this.currentSpeed) % this.timelineAdvancesNumber //前进timelineAdvancesNumber次，每次5分钟，
      let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed //进度条每次前进
      this.currentTimePosition += tmp;

      //播放一遍完成（停止，如果计算结果超过，设为最大值）
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.stopTimer();
        this.isTimerRunning = false
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
      }
      //时间轴播放中
      else {
        this.currentTimePosition = this.currentTimePosition % 100
        // console.log("this.currentTime-----------------")
        //倍速为前进多个节点，时间以节点数量计算。每个节点表示五分钟
        this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        //图层控制 是否显示标绘点（时间轴仍然需要往前）
        if (this.isMarkingLayer) {
          this.updatePlot()
        } else {
          this.MarkingLayerRemove()
        }
        // end 图层控制 是否显示标绘点（时间轴仍然需要往前）
      }
      // }
      // else{
      //   this.eqendTime=realTime
      //   this.timelineAdvancesNumber=
      // }
    },

    //时间轴停止
    stopTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isTimerRunning = false

      // console.log("stopTimer")
    },

    // 前进
    forward() {
      this.currentNodeIndex = (this.currentNodeIndex + 1) % this.timelineAdvancesNumber
      let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed //进度条每次前进
      this.currentTimePosition += tmp;
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.isTimerRunning = false
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
      } else {
        this.currentTimePosition = this.currentTimePosition % 100
        // this.currentTime = new Date(this.eqstartTime.getTime()
        //     + this.currentNodeIndex * currentTime.setMinutes(currentTime.getMinutes() + 5); * 60 * 1000);
        let newTime = new Date(this.currentTime);
        this.currentTime = newTime.setMinutes(newTime.getMinutes() + 5);
        this.updatePlot()
      }
      // console.log("========================",this.currentTime)
    },
    // 后退
    backward() {
      this.currentNodeIndex = (this.currentNodeIndex - 1) % this.timelineAdvancesNumber
      let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed //进度条每次后退
      this.currentTimePosition -= tmp;
      if (this.currentTimePosition <= 0) {
        this.currentTimePosition = 0;
        this.currentTime = this.eqstartTime
        this.isTimerRunning = false
      } else {
        this.currentTimePosition = this.currentTimePosition % 100
        // this.currentTime = new Date(this.eqstartTime.getTime()
        //     + this.currentNodeIndex * this.currentSpeed * 5 * 60 * 1000);
        let newTime = new Date(this.currentTime);
        this.currentTime = newTime.setMinutes(newTime.getMinutes() - 5);
        // console.log("this.currentTime--",this.currentTime)
        this.updatePlot()
      }
    },
    //点击跳转时间对应场景
    jumpToTime(event) {
      const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
      const clickedPosition = event.clientX - timeRulerRect.left;
      this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
      this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
      this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber) // Assuming 672 is the total number of steps
      // console.log(this.currentTimePosition,this.timelineAdvancesNumber,"jumpToTime")
      // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 15 * 60 * 1000);
      this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
      // console.log("this.currentTime jumpToTime",this.currentTime)
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.stopTimer();
        this.isTimerRunning = false
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
      } else {
        //点击前运行状态
        this.updatePlot();
      }
    },
    //时间轴拖拽
    startDrag(event) {
      this.isDragging = true;
      this.dragStartX = event.clientX;
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.stopDrag);
      // 添加禁用选择的 CSS 样式
      document.body.style.userSelect = 'none';
      document.body.style.WebkitUserSelect = 'none';
      document.body.style.MozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';

    },
    drag(event) {
      if (!this.isDragging) return;
      const timeRulerRect = this.$el.querySelector('.time-ruler').getBoundingClientRect();
      const clickedPosition = Math.max(timeRulerRect.left, Math.min(event.clientX, timeRulerRect.right)) - timeRulerRect.left;
      const newPosition = (clickedPosition / timeRulerRect.width) * 100;
      this.currentTimePosition = newPosition;
      // this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * 672);
      this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber);
      // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 15 * 60 * 1000);
      this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
      this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.stopDrag);
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.stopTimer();
        // this.isTimerRunning = false
        // this.xuanran(this.eqid)
        this.intimexuanran(this.eqid)
      } else {
        //点击前运行状态
        this.updatePlot();
      }
      // this.updatePlot();
      // 恢复默认的选择行为
      document.body.style.userSelect = 'auto';
      document.body.style.WebkitUserSelect = 'auto';
      document.body.style.MozUserSelect = 'auto';
      document.body.style.msUserSelect = 'auto';
    },
    selectSpeed(speed) {
      // this.currentSpeed = speed
      this.speedOption = speed
      this.currentSpeed = parseFloat(speed.split(-1))
      // console.log("-----------------------",this.currentSpeed)
    },
    //时间轴end-------------


// 所有entity实体类型点击事件的handler
    entitiesClickPonpHandler() {
      let that = this;
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedEntity?.id;

        const faultInfoDiv = document.getElementById('faultInfo');

        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;

          // console.log(99999);
          // console.log(entity._layer);

          // 计算图标的世界坐标
          this.selectedEntityPosition = this.calculatePosition(click.position);
          this.updatePopupPosition(); // 确保位置已更新

          // 如果点击的是断裂带
          if (entity._layer === "断裂带") {
            // 获取断裂带的 name 属性
            const faultName = pickedEntity.id.properties.name._value;

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
          } else {
            faultInfoDiv.style.display = 'none';
          }

          if (entity._layer === "标绘点") {
            this.timelinePopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPopupPosition; // 更新位置
            this.timelinePopupData = this.extractDataForTimeline(entity);
            this.routerPopupVisible = false;
          } else if (entity._billboard) {
            this.routerPopupVisible = true;
            this.routerPopupPosition = this.selectedEntityPopupPosition; // 更新位置
            this.routerPopupData = this.extractDataForRouter(entity);

            // console.log(101010)
            // console.log(this.routerPopupData)

            this.timelinePopupVisible = false;
          } else {
            this.routerPopupVisible = false;
            this.timelinePopupVisible = false;
          }
        } else {
          // 没有选中实体时隐藏 faultInfo
          faultInfoDiv.style.display = 'none';
          this.routerPopupVisible = false;
          this.timelinePopupVisible = false;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (this.timelinePopupVisible || this.routerPopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },


    addHistoryEqPoints() {

      // 先清除historyEq实体
      this.removeEntitiesByType("historyEq")
      addHistoryEqPoints(this.centerPoint, this.tableData)
    },

    //断裂带加载  200千米以内
    addFaultZone() {

      this.removeEntitiesByType("faultZone")
      addFaultZones(this.centerPoint)
    },

    checkIfOvalCircleLayer() {
      let longAxis = 4.0293 + 1.3003 * parseFloat(this.centerPoint.magnitude) - 3.6404 * Math.log10(10); // 计算 longAxis
      // 如果 longAxis >= 6，就向 layeritems 中添加烈度圈要素图层
      if (Math.floor(longAxis) >= 6) {
        this.layeritems.push({id: '9', name: '烈度圈要素图层'});
      }
    },

    addOvalCircle() {

      this.removeEntitiesByType("ovalCircle")
      addOvalCircles(this.centerPoint)
    },

    calculatePosition(clickPosition) {
      let ray = viewer.camera.getPickRay(clickPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let height = this.isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      return {
        x: longitude, // 经度
        y: latitude,  // 纬度
        z: height     // 高度
      };
    },

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
            faultInfoDiv.innerHTML = `${faultName}`; // 更新内容
          }
        }
      });
    },

    updatePopupPosition() {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
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
          }
        }
      });
    },

    extractDataForTimeline(entity) {
      return {
        plotid: entity.id,
        plotname: entity.plottype,
        centerPoint: this.centerPoint
      };
    },

    extractDataForRouter(entity) {
      let properties = {};
      entity.properties.propertyNames.forEach(name => {
        properties[name] = entity.properties[name].getValue();
      });
      return properties;
    },

    detailedNews(val) {
      // console.log("detailedNews-----",val)
      this.showingNewsContent = val

    },
    ifShowDialog(val) {
      // console.log("ifShowDialog-----",val)
      this.showDetailedNewsDialog = val
    },
    hideNewsDialog(val) {
      // console.log("showDetailedNewsDialog-----",val)
      this.showDetailedNewsDialog = val
    },
    //截图
    takeScreenshot() {
      const link = document.createElement('a');
      link.href = fileUrl
      link.download = '2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf';
      link.click();
    },
    backToHome() {},

    // cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
    // 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
        // 则表示已经设置了其他地形提供者
        // console.log("地形已加载")
        return true;
      }
      // console.log("地形未加载")
      return false;
    },
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

    getEq() {
      let that = this
      getAllEq().then(res => {
        that.tableData = res
        // 初始化标绘所需的viewer、ws、pinia
        let cesiumStore = useCesiumStore()
        cesiumPlot.init(window.viewer, this.websock, cesiumStore)
        // console.log("that.tableData", that.tableData)
      })
    },

    plotAdj(row) {
      // console.log(row)
      window.viewer.entities.removeAll();
      this.eqid = row.eqid
      this.websock.eqid = this.eqid
    },
    // ------------------行政区划--------------------
    addYaanImageryDistrict() {
      this.removethdRegions()
      if (!this.selectedlayersLocal.includes("行政区划要素图层")) {
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
          strokeWidth: 4,
        });
        geoPromise.then((dataSource) => {
          // 添加 geojson
          window.regionLayer111 = dataSource;
          window.viewer.dataSources.add(dataSource);
          // 给定义好的 geojson 的 name 赋值（这里的 dataSource 就是定义好的geojson）
          dataSource.name = "thd_yaanregion";
          // 视角跳转到 geojson
          viewer.flyTo(dataSource.entities.values);

        }).catch((error) => {
          console.error("加载GeoJSON数据失败:", error);
        });
      } else {
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.TRANSPARENT,
          fill: Cesium.Color.TRANSPARENT,
          markerColor: Cesium.Color.TRANSPARENT,
          markerSize: 0,
          strokeWidth: 0,
          clampToGround: true,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          depthTest: true,
        });
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          viewer.flyTo(dataSource.entities.values);
        }).catch((error) => {
          console.error("加载GeoJSON数据失败:", error);
        });
      }
      let labelData = {lon: 103.003398, lat: 29.981831, name: "雅安市"};
      let position = Cesium.Cartesian3.fromDegrees(labelData.lon, labelData.lat);
      let labelEntity = viewer.entities.add(new Cesium.Entity({
        position: position,
        label: new Cesium.LabelGraphics({
          text: labelData.name,
          scale: 1,
          font: "bolder 50px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.fromCssColorString("#ffffff"),
          pixelOffset: new Cesium.Cartesian2(0, -60)
        })
      }));
      this.labels.push(labelEntity);  // 保存标签实体的引用
    },

    handleDistrictClick(district) {
      //清除其他实体标签
      this.removethdRegions()
      // this.visible = false;
      // 根据区县代码过滤GeoJSON数据
      let filteredFeatures = yaan.features.filter(feature => {
        return feature.properties.adcode === district.adcode;
      });
      if (filteredFeatures.length > 0) {
        let filteredGeoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };

        let geoPromise = Cesium.GeoJsonDataSource.load(filteredGeoJson, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
          strokeWidth: 4,
        });

        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          window.regionLayer111 = dataSource

          filteredFeatures.forEach((feature) => {
            let center = feature.properties.center;

            if (center && center.length === 2) {
              let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
              let labelEntity = viewer.entities.add(new Cesium.Entity({
                position: position,
                label: new Cesium.LabelGraphics({
                  text: district.name,
                  scale: 1,
                  font: "bolder 50px sans-serif",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                  pixelOffset: new Cesium.Cartesian2(0, -60)
                })
              }));
              this.labels.push(labelEntity);  // 保存标签实体的引用
            } else {
              console.warn('中心点未定义或格式不正确:', feature);
            }
          });
          viewer.flyTo(dataSource.entities.values);
        }).catch((error) => {
          console.error("加载GeoJSON数据失败:", error);
        });
      } else {
        console.error("未找到对应的区县:", adcode);
      }
    },
    removethdRegions() {
      if (window.regionLayer111) {
        window.viewer.dataSources.remove(window.regionLayer111, true); // 强制移除
        window.regionLayer111 = null; // 清空引用
        // console.log("图层已移除");
      }
      const legend = document.getElementById('legend');
      while (legend.firstChild) {
        legend.removeChild(legend.firstChild);
      }
      this.labels.forEach(label => {
        window.viewer.entities.remove(label);
      });
      this.labels = [];  // 清空标签引用数组
    },
    backcenter() {
      this.removethdRegions()
      const position = Cesium.Cartesian3.fromDegrees(
          parseFloat(this.centerPoint.longitude),
          parseFloat(this.centerPoint.latitude),
          120000,
      );
      viewer.camera.flyTo({destination: position,})
    },

    // 图层要素
    initPlot() {
      getFeaturesLayer().then(res => {
        let {disasterReserves, emergencyTeam, emergencyShelters} = res;
        this.disasterReserves = disasterReserves;
        this.emergencyTeam = emergencyTeam;
        this.emergencyShelters = emergencyShelters;
        // this.updateMapLayers(); // 根据当前选中的图层显示或隐藏图层
      });
    },

    updateMapLayers() {
      // this.initPlot()
      // 标绘点图层
      const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
      if (hasDrawingLayer) {
        this.handleMarkingLayerChange(true);
        this.updatePlot();
      } else {
        this.handleMarkingLayerChange(false);
        this.MarkingLayerRemove();
      }

      // 行政区划要素图层
      const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
      if (hasYaanRegionLayer) {
        this.removethdRegions();
        this.addYaanRegion();
      } else {
        this.removethdRegions();
        this.removeDataSourcesLayer('YaanRegionLayer');
      }

      // 人口密度要素图层
      const hasPopLayer = this.selectedlayersLocal.includes('人口密度要素图层');
      if (hasPopLayer) {
        this.addPopLayer();
      } else {
        this.removeImageryLayer('PopLayer');
      }

      // 交通网络要素图层
      const hasTrafficLayer = this.selectedlayersLocal.includes('交通网络要素图层');
      if (hasTrafficLayer) {
        this.addTrafficLayer();
      } else {
        this.removeImageryLayer('TrafficLayer');
        this.removeImageryLayer('TrafficTxtLayer');
      }

      // 应急物资存储要素图层
      const hasReservesLayer = this.selectedlayersLocal.includes('应急物资存储要素图层');
      if (hasReservesLayer) {
        this.processPoints(this.disasterReserves, 'reserves', emergencyRescueEquipmentLogo, '应急物资存储');
      } else {
        this.removeEntitiesByType('reserves');
      }

      // 救援队伍分布要素图层
      const hasEmergencyTeamLayer = this.selectedlayersLocal.includes('救援队伍分布要素图层');
      if (hasEmergencyTeamLayer) {
        this.processPoints(this.emergencyTeam, 'emergencyTeam', rescueTeamsInfoLogo, '救援队伍分布');
      } else {
        this.removeEntitiesByType('emergencyTeam');
      }

      // 避难场所要素图层
      const hasEmergencySheltersLayer = this.selectedlayersLocal.includes('避难场所要素图层');
      if (hasEmergencySheltersLayer) {
        this.processPoints(this.emergencyShelters, 'emergencyShelters', emergencySheltersLogo, '避难场所');
      } else {
        this.removeEntitiesByType('emergencyShelters');
      }

      // 历史地震要素图层
      const hasHistoryEqLayer = this.selectedlayersLocal.includes('历史地震要素图层');
      if (hasHistoryEqLayer) {
        this.addHistoryEqPoints();
      } else {
        this.removeEntitiesByType('historyEq');
      }

      // 断裂带要素图层
      const hasFaultZoneLayer = this.selectedlayersLocal.includes('断裂带要素图层');
      if (hasFaultZoneLayer) {
        this.addFaultZone();
      } else {
        this.removeEntitiesByType('faultZone');
      }

      // 烈度圈要素图层
      const hasOvalCircleLayer = this.selectedlayersLocal.includes('烈度圈要素图层');
      if (hasOvalCircleLayer) {
        this.addOvalCircle();
      } else {
        this.removeEntitiesByType('ovalCircle');
      }

      //视角转化 如果 只有标绘点或者没有选择图层，视角更近（震中），如果有其他要素图层，视角拉高（雅安市）
      if ((this.selectedlayersLocal.length == 1 && hasDrawingLayer) || this.selectedlayersLocal.length == 0) {
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            120000,
        );
        viewer.camera.flyTo({destination: position,})
      } else {
        const position = Cesium.Cartesian3.fromDegrees(
            103.0,
            29.98,
            500000,
        );
        viewer.camera.flyTo({destination: position,})
      }
      //视角跳转 end

    },

    processPoints(pointArr, type, icon, tableName) {
      if (!Array.isArray(pointArr)) {
        console.error(`${tableName} 数据格式不正确`, pointArr);
        return;
      }

      pointArr = pointArr.filter(e => e.longitude !== null);

      pointArr.forEach(element => {
        let existingEntity = window.viewer.entities.getById(element.uuid);
        if (existingEntity) {
          console.warn(`uuid为${element.uuid}的实体已存在。跳过此实体`);
          return;
        }

        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          console.error(`uuid为${element.uuid}的实体的坐标无效或超出范围`, {longitude, latitude});
          return;
        }

        element.type = type;
        this.addEntity(element, icon, tableName, longitude, latitude);
      });
    },

    addEntity(element, icon, tableName, longitude, latitude) {
      window.viewer.entities.add({
        id: element.uuid,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
          image: icon,
          width: 40,
          height: 40,
          eyeOffset: new Cesium.Cartesian3(0, 0, 0),
          color: Cesium.Color.WHITE.withAlpha(1),
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          depthTest: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
          tableName: tableName, // 动态传入的表名称
          ...element, // 将element对象展开，自动填充所有属性
          lon: element.longitude,
          lat: element.latitude
        },
      });
    },

    removeEntitiesByType(type) {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].properties?.type?.getValue() === type) {
          window.viewer.entities.remove(entities[i]);
        }
      }
    },

    imageryLayersExists(layerName) {
      const layers = viewer.imageryLayers;
      for (let i = 0; i < layers.length; i++) {
        if (layers.get(i).name === layerName) {
          return true;
        }
      }
      return false;
    },

    addYaanRegion() {
      if (!window.viewer.dataSources.getByName('YaanRegionLayer')[0]) {
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
          strokeWidth: 4,
        });

        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          dataSource.name = 'YaanRegionLayer'; // 给图层取名字,以便删除时找到

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
          console.error("加载GeoJSON数据失败:", error);
        });
      }
    },

    addPopLayer() {
      let popLayerexists = this.imageryLayersExists('PopLayer')
      if (!popLayerexists) {
        let popLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapServiceImageryProvider({
              url: 'http://10.16.7.69:9080/geoserver/yaan/wms',
              layers: 'yaan:pop',
              parameters: {
                service: 'WMS',
                format: 'image/png',
                transparent: true
              }
            })
        );
        popLayer.name = "PopLayer"; // 设置名称
      }
    },


    addTrafficLayer() {
      let token = TianDiTuToken;
      let trafficLayerexists = this.imageryLayersExists('TrafficLayer')
      if (!trafficLayerexists) {
        let trafficLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
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

      let trafficTxtLayerExists = this.imageryLayersExists('TrafficTxtLayer')
      if (!trafficTxtLayerExists) {
        //影像注记
        let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              url:
                  "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                  token,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
              show: false,
            })
        )
        traffictxtLayer.name = "TrafficTxtLayer"
      }
    },
    removeImageryLayer(layerName) {
      const layers = window.viewer.imageryLayers;
      for (let i = 0; i < layers.length; i++) {
        if (layers.get(i).name === layerName) {
          layers.remove(layers.get(i));
          return;
        }
      }
    },
    removeDataSourcesLayer(layerName) {
      const dataSource = window.viewer.dataSources.getByName(layerName)[0];
      if (dataSource) {
        window.viewer.dataSources.remove(dataSource);
      }
    },
    //标绘图层清除-->
    MarkingLayerRemove() {
      this.plots.forEach(item => {
        const entity = viewer.entities.getById(item.plotId);
        if (entity) {
          viewer.entities.removeById(item.plotId);
          this.plotisshow[item.plotId] = 0
        }
      })
    },
    // 图层开关操作
    handleMarkingLayerChange(isMarkingLayerLocal) {
      if (isMarkingLayerLocal) {
        if (!window.viewer.dataSources.getByName('drawingLayer')[0]) {
          let newLayer = new Cesium.CustomDataSource('drawingLayer');
          window.viewer.dataSources.add(newLayer);
          newLayer.show = true;
          this.isMarkingLayerLocal = true;
        }
      } else {
        this.isMarkingLayerLocal = false;
        let dataSource = window.viewer.dataSources.getByName('drawingLayer')[0];
        if (dataSource) {
          window.viewer.dataSources.remove(dataSource);
        }
      }
    },


    //人口密度灰度查询
    getPopDesity(longitude, latitude) {
      const url = "http://10.16.7.69:9080/geoserver/yaan/wms"
      const bboxSize = 0.001
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
      const fullUrl = `${url}?${urlParams.toString()}`;
      // console.log('GetFeatureInfo URL:', fullUrl);
      fetch(fullUrl).then(response => response.json()).then(data => {
        // console.log(data.features[0].properties)
      }).catch(error => {
        // console.error('There was an error!', error);
      });
    },


    //专题图下载
    updatethematicMap(){
      if(this.selectthematicMap){
        this.ifShowMapPreview=true
        const selectedData = MapPicUrl.find(item => item.eqid === this.eqid && item.name===this.selectthematicMap);
        console.log(selectedData)
        this.imgurlFromDate = selectedData.path
        this.imgName=selectedData.name
        // console.log("11111",this.imgurlFromDate, this.imgName)
        this.imgshowURL=new URL(this.imgurlFromDate, import.meta.url).href
        // console.log(this.imgshowURL)
      }
     else{
        this.ifShowMapPreview=false
      }

    },
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview= val // 是否预览专题图 = val
      if( !val){this.selectthematicMap=null}
    },
    //专题图 end

    //报告产出
    updateReportItem(){
      if(this.selectReportItem){
        console.log(this.selectReportItem)
        const selectedData = ReportUrl.find(item => item.eqid === this.eqid && item.name===this.selectReportItem);
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
    }


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
  height: calc(100vh - 33px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#cesiumContainer {
  height: calc(100vh - 33px);
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
  width: 45%;
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
  margin-left: 1%;
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

#speedSelect {
  left: -103px;
  position: relative;
  padding: 5px;
  font-size: 14px;
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

.speedButton {
  position: relative;
  left: 102%;
  color: white;
  top: -50%;
}

/* 原有的 chooseSpeed 样式 */
.chooseSpeed {
  width: 40px;
  height: 60px;
  position: absolute;
  padding: 0 0px 5px;
  border-radius: 3px;
  top: -65px;
  left: 97%;
  z-index: 30; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
  text-align: center;
  display: none; /* 默认隐藏 */
}

/* 当 mouse hover speedButton 时显示 chooseSpeed */
.speedButton:hover + .chooseSpeed,
.chooseSpeed:hover {
  display: block;
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

.tmp {
  position: absolute;
  top: 0%;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 5px;
  right: 0%;
  z-index: 1;
  background-color: rgba(40, 40, 40, 0.3);
}

.button-container {
  position: absolute;
  z-index: 20;
  top: 6.3%;
  left: 27%;
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


</style>
