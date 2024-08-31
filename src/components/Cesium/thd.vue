<template>
  <div>

    <!--    地震列表切换-->
    <div class="eqlist-button">
      <el-button class="el-button--primary" size="small" @click="toggleComponent('eqList')">地震列表</el-button>
    </div>
    <div class="thd-eqtable" v-if="activeComponent === 'eqList'">
      <eqTable :eqData="tableData"/>
    </div>

    <!--   图层要素-->
    <div class="layer-button">
      <el-button class="el-button--primary" size="small" @click="toggleComponent('layerChoose')">图层要素</el-button>
    </div>
    <div v-if="activeComponent === 'layerChoose'" class="dropdown">
      <MapLayerControl
          :isMarkingLayer="isMarkingLayer"
          @updatePlot="updatePlot"
          @MarkingLayerRemove="MarkingLayerRemove"
          @updateMarkingLayer="handleMarkingLayerChange" />
    </div>

<!--    行政区划-->
    <div class="regionjump-button">
      <el-button class="el-button--primary" size="small" @click="toggleComponent('Regionjump')">行政区划</el-button>
    </div>
    <div class="dropdown" v-if="activeComponent === 'Regionjump'">
      <div class="city-button">-->
        <el-button @click="addYaanImageryDistrict">雅安市</el-button>
      </div>
      <!-- 下属区县按钮 -->
      <div class="district-buttons">
        <div v-for="district in districts" :key="district.adcode" class="district-button">
          <el-button @click="handleDistrictClick(district)">{{ district.name }}</el-button>
        </div>
      </div>
      <div>
        <el-button @click="backcenter">回到震中</el-button>
      </div>
    </div>

    <!--报告产出按钮-->
    <div class="button-container">
      <el-button class="el-button--primary" size="small" @click="takeScreenshot">报告产出</el-button>
    </div>
    <div class="thematic-button">
      <el-button class="el-button--primary" size="small" @click="">专题图下载</el-button>
    </div>


    <!--    title-->
    <div class="eqtitle">
      <span class="eqtitle-text_eqname">{{this.eqyear}}年{{this.eqmonth}}月{{this.eqday}}日{{this.centerPoint.position}}{{this.centerPoint.magnitude}}级地震</span>
    </div>
    <!--    title end-->

    <!--    box包裹地图，截图需要-->
    <div id="box" ref="box">
      <div id="cesiumContainer">
        <TimeLinePanel
            :visible="popupVisible"
            :position="popupPosition"
            :popupData="popupData"
        />
      </div>
    </div>

    <!-- 进度条-->
    <div class="bottom">
      <!--      播放暂停按钮-->
      <div class="play">
        <img class="play-icon" src="../../assets/icons/TimeLine/后退箭头.png" @click="backward" />
        <img class="play-icon" src="../../assets/icons/TimeLine/播放.png" v-if="!isTimerRunning"
             @click="toggleTimer"/>
        <img class="pause-icon" src="../../assets/icons/TimeLine/暂停.png" v-if="isTimerRunning"
             @click="toggleTimer"/>
        <img class="play-icon" src="../../assets/icons/TimeLine/前进箭头.png" @click="forward" />
      </div>

      <div class="time-ruler" @mousedown="startDrag" @mouseenter="isDragging = true" @mouseleave="isDragging = true">
        <div class="time-ruler-line" @click="jumpToTime">
          <div class="time-progress" :style="{ width: `${currentTimePosition}%` }"></div>
          <div class="time-slider" :style="{ left: `${currentTimePosition-0.5}%` }"></div>
        </div>
        <!-- speedButton 和 chooseSpeed 放在一起 -->
        <span class="speedButton">{{speedOption}}</span>
        <div class="chooseSpeed">
          <option v-for="option in speedOptions" :key="option" @click="selectSpeed(option)">
            {{ option }}
          </option>
        </div>
      </div>

      <!--      时间点-->
      <div class="current-time-info">
        <span class="timelabel">{{ this.timestampToTime(this.currentTime) }}</span>
      </div>
      <div class="end-time-info">
        <div class="timelabel">{{ this.timestampToTime(this.eqendTime) }}</div>
      </div>
    </div>
    <!-- 进度条 end-->

    <!--    两侧组件-->
    <timeLineEmergencyResponse
        :currentTime="currentTime"
    />
    <timeLinePersonnelCasualties
        :currentTime="currentTime"
    />
    <timeLineRescueTeam
        :currentTime="currentTime"
    />
    <!--      新闻-->
    <div>
      <news
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
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getEqbyId} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'

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
import MapLayerControl from '@/components/TimeLine/MapLayerControl.vue';
export default {
  components: {
    // NewsDialog,
    TimeLinePanel,
    News,
    MiniMap,
    timeLineEmergencyResponse,
    timeLinePersonnelCasualties,
    timeLineRescueTeam,
    timeLineLegend,
    newsDialog,
    commonPanel,
    // eqListTable,
    eqTable,
    MapLayerControl
  },
  data: function () {
    return {
      //-----------标绘点弹窗-------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件

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
        position: '',
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
      eqstartTime: '',
      currentTime: '',
      eqendTime: '',
      //时间轴当前时间
      currentTimePosition: 0,
      //时间轴当前前进步
      currentNodeIndex: 1,
      intervalId: null,
      // 倍速
      currentSpeed: 1,
      showSpeedOptions: false,
      speedOption: '1X',
      speedOptions: ['1X','2X','4X'],

      //是否记载到view上，已经存在则不再添加
      plotisshow: {},
      //包括最早出现时间，最晚结束时间的标绘点信息
      plots: [],
      //时间轴暂停播放状态
      isTimerRunning: true,
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
      getEqData: [],
      tableData: [],

      //-----------------图层---------------------
      // iflayerChoose: false,
      isMarkingLayer: true,
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
      regionLayer111:null,

      activeComponent:null,



    };
  },
  mounted() {
    this.init()
    this.eqid = new URLSearchParams(window.location.search).get('eqid')
    this.getEqInfo(this.eqid)
    // // ---------------------------------------------------
    // // 生成实体点击事件的handler
    this.entitiesClickPonpHandler()
    this.watchTerrainProviderChanged()

  },
  methods: {
    //设置组件展开的面板互斥,避免堆叠
    toggleComponent(component) {
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


      // 创建缩略图视图器实例
      let that = this
      let smallMapContainer = document.getElementById('smallMapContainer');
      that.smallViewer = new Cesium.Viewer(smallMapContainer, {
        // 隐藏所有控件
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        timeline: false,
        navigationHelpButton: false,
        animation: false,
        infoBox: false,
        fullscreenButton: false,
        showRenderState: false,
        selectionIndicator: false,
        baseLayerPicker: false,
        selectedImageryProviderViewModel: viewer.imageryLayers.selectedImageryProviderViewModel,
        selectedTerrainProviderViewModel: viewer.terrainProviderViewModel
      });
      // 隐藏缩略图视图器的版权信息
      that.smallViewer._cesiumWidget._creditContainer.style.display = 'none';

      // 同步主视图器的相机到缩略图视图器
      function syncCamera() {
        const camera1 = viewer.scene.camera;
        const camera2 = that.smallViewer.scene.camera;

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
        that.smallViewer.scene.requestRender(); // 确保缩略图更新
      });

      // 初始同步
      syncCamera();
    },
    // /取地震信息+开始结束当前时间初始化
    getEqInfo(eqid) {
      getEqbyId({eqid: eqid}).then(res => {
        //震中标绘点
        this.centerPoint = res
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.time)
        this.centerPoint.endtime = new Date(res.time + (7 * 24 * 60 * 60 * 1000 + 1000));

        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        this.eqendTime = new Date(this.eqstartTime.getTime() + ((7 * 24 + 5) * 60 * 60 * 1000));
        this.currentTime = this.eqstartTime

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
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            8000),
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
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            parseFloat(this.centerPoint.height || 0)
        ),
        billboard: {
          image: centerstar,
          width: 40,
          height: 40,
        },
        label: {
          text: this.centerPoint.position,
          show: true,
          font: '14px sans-serif',
          fillColor: Cesium.Color.RED,        //字体颜色
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
        },
        id: this.centerPoint.plotid,
        plottype: "震中",
      });


      let that = this
      that.smallViewer.entities.removeAll();
      that.smallViewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            parseFloat(this.centerPoint.height || 0)
        ),
        billboard: {
          image: centerstar,
          width: 30,
          height: 30,
        },
        label: {
          text: this.centerPoint.position,
          show: true,
          font: '10px sans-serif',
          fillColor: Cesium.Color.RED,        //字体颜色
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
        },
        id: this.centerPoint.plotid,
        plottype: "震中",
      });
      //获取渲染点
      this.getPlotwithStartandEndTime(this.eqid)
    },
    //取标绘点
    getPlotwithStartandEndTime(eqid) {
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {
        this.plots = res
        // console.log(res)
        this.plots.forEach(item => {
          if (!item.endtime) {
            item.endtime = new Date(this.eqendTime.getTime() + 5000);
          }
          if (!item.starttime) {
            item.starttime = this.eqstartTime;
          }
          this.plotisshow[item.plotid] = 0
        })
        //开启时间轴
        this.initTimerLine();
      })
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

    //时间轴操作-----------------------------------------------
    initTimerLine() {
      this.isTimerRunning = true
      // if(this.currentTimePosition >= 100 || this.currentTimePosition==0) {
      //   //归零
      //   viewer.entities.removeAll();
      //   this.currentNodeIndex=0;
      //   this.currentTime=this.eqstartTime;
      //   this.currentTimePosition=0;
      //   this.currentTimePointPosition= this.currentNodeIndex-0.5
      //   //加载中心点
      //   viewer.entities.add({
      //     // properties: {
      //     //   type: "震中",
      //     //   time: this.centerPoint.time,
      //     //   name: this.centerPoint.position,
      //     //   lat: this.centerPoint.latitude,
      //     //   lon: this.centerPoint.longitude,
      //     //   describe: this.centerPoint.position,
      //     // },
      //     position: Cesium.Cartesian3.fromDegrees(
      //         parseFloat(this.centerPoint.longitude),
      //         parseFloat(this.centerPoint.latitude),
      //         parseFloat(this.centerPoint.height || 0)
      //     ),
      //     billboard: {
      //       image: centerstar,
      //       width: 50,
      //       height: 50,
      //     },
      //     label: {
      //       text: this.centerPoint.position,
      //       show: true,
      //       font: '14px sans-serif',
      //       fillColor:Cesium.Color.RED,        //字体颜色
      //       style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      //       outlineWidth: 2,
      //       verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      //       pixelOffset: new Cesium.Cartesian2(0, -16),
      //     },
      //     id:this.centerPoint.plotid,
      //     plottype:"震中",
      //   });
      // }
      // 时间轴开始
      // this.currentTime = new Date(this.eqstartTime.getTime() + 48*60 * 60 * 1000);
      // this.updatePlot()

      this.intervalId = setInterval(() => {
        this.updateCurrentTime();
      }, 100);
    },
    updateCurrentTime() {
      // this.currentNodeIndex = (this.currentNodeIndex + 1) % 672  //共前进672次，每次15分钟
      // let tmp = 100.0 / 672.0  //进度条每次前进

      this.currentNodeIndex = (this.currentNodeIndex + 1) % 2076 //共前进2016次，每次5分钟，
      let tmp = 100.0 / 2076.0 * this.currentSpeed //进度条每次前进
      this.currentTimePosition += tmp;
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.stopTimer();
        // this.initTimerLine();
        this.isTimerRunning = false

      } else {
        this.currentTimePosition = this.currentTimePosition % 100
        // this.currentTime = new Date(this.eqstartTime.getTime() + (7 * 24 * 60 * 60 * 1000));
        // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 15 * 60 * 1000);
        // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        this.currentTime = new Date(this.eqstartTime.getTime()
            + this.currentNodeIndex * this.currentSpeed * 5 * 60 * 1000);
        if (this.isMarkingLayer) {
          // console.log("updatePlot timeline")
          this.updatePlot()
        } else {
          this.MarkingLayerRemove()
        }
      }
    },
    //更新标绘点
    updatePlot() {
      // console.log(this.plots)
      let that = this
      //一个点线面一条数据
      //点
      let pointArr = this.plots.filter(e => e.drawtype === 'point')
      // console.log(pointArr)

      //线
      let polylineArrtmp = this.plots.filter(e => e.drawtype === 'polyline')
      let polylineId = this.distinguishPolylineId(polylineArrtmp)
      let polylineArr = []  // id, 开始时间, 结束时间
      polylineId.forEach(onlyDrawIdItem => {
        let positionsArr = [];
        let polylinetmp = {};

        polylineArrtmp.forEach(polylineElement => {
          if (polylineElement.plotid === onlyDrawIdItem) {
            positionsArr.push(
                parseFloat(polylineElement.longitude),
                parseFloat(polylineElement.latitude),
                parseFloat(polylineElement.height)
            );

            // 检查 polylineArr 中是否已存在该 plotid 的数据
            let existingPolyline = polylineArr.find(p => p.plotid === polylineElement.plotid);
            if (existingPolyline) {
              // 更新已存在的数据
              // existingPolyline.endtime = polylineElement.endtime;
              existingPolyline.positionsArr = positionsArr;
            } else {
              // 创建新的数据对象并添加到 polylineArr
              polylinetmp = {
                plotid: polylineElement.plotid,
                drawtype: "polyline",
                endtime: polylineElement.endtime,
                starttime: polylineElement.starttime,
                plottype: polylineElement.plottype,
                img: polylineElement.img,
                positionsArr: positionsArr,
              };
              polylineArr.push(polylinetmp);
            }
          }
        });
      });
      // console.log("polylineArr",polylineArr)

      // 面
      let polygonArrtmp = this.plots.filter(e => e.drawtype === 'polygon')
      let polygonId = this.distinguishPolylineId(polygonArrtmp)
      let polygonArr = []  // id, 开始时间, 结束时间
      polygonId.forEach(onlyDrawIdItem => {
        let positionsArr = [];
        let polygontmp = {};
        polygonArrtmp.forEach(polygonElement => {
          if (polygonElement.plotid === onlyDrawIdItem) {
            positionsArr.push(
                parseFloat(polygonElement.longitude),
                parseFloat(polygonElement.latitude),
                // parseFloat(polylineElement.height)
            );
            // 检查 polylineArr 中是否已存在该 plotid 的数据
            let existingpolygon = polygonArr.find(p => p.plotid === polygonElement.plotid);
            if (existingpolygon) {
              // 更新已存在的数据
              // existingPolyline.endtime = polylineElement.endtime;
              existingpolygon.positionsArr = positionsArr;
            } else {
              // 创建新的数据对象并添加到 polylineArr
              polygontmp = {
                plotid: polygonElement.plotid,
                drawtype: "polygon",
                endtime: polygonElement.endtime,
                starttime: polygonElement.starttime,
                plottype: polygonElement.plottype,
                img: polygonElement.img,
                positionsArr: positionsArr,
                angle: polygonElement.angle,
              };
              polygonArr.push(polygontmp);
            }
          }
        });
      });
      // console.log("polygonArr",polygonArr)


      //渲染
      pointArr.forEach(item => {
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.starttime);
        const endDate = new Date(item.endtime);
        // console.log(item.plotid,startDate,endDate,currentDate)
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotid] === 0) {
          this.plotisshow[item.plotid] = 1
          // console.log(item.plotid,"add")
          viewer.entities.add({
            // properties: {
            //   id: item.plotid,
            //   // type: item.drawtype,
            //   // // time: item.timestamp,
            //   // // name: item.pointname,
            //   // lat: item.latitude,
            //   // lon: item.longitude,
            //   // describe: item.pointdescribe,
            // },
            position: Cesium.Cartesian3.fromDegrees(
                parseFloat(item.longitude),
                parseFloat(item.latitude),
                parseFloat(item.height || 0)
            ),
            billboard: {
              image: item.img,
              width: 30,
              height: 30,
            },
            // label: {
            //   text: item.pointname,
            //   show: true,
            //   font: '14px sans-serif',
            //   style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            //   outlineWidth: 2,
            //   verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            //   pixelOffset: new Cesium.Cartesian2(0, -16),
            // },
            id: item.plotid,
            plottype: item.plottype,
          });
        }
        //消失
        if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotid] === 1) {
          this.plotisshow[item.plotid] = 0
          // console.log(item.plotid,"end")
          viewer.entities.removeById(item.plotid)
        }
      });
      polylineArr.forEach(item => {
        // that.drawPolyline(item)
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.starttime);
        const endDate = new Date(item.endtime);
        // console.log("line",item.plotid,startDate,endDate,currentDate)


        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotid] === 0) {
          this.plotisshow[item.plotid] = 1
          this.drawPolyline(item)
        }
        //消失
        if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotid] === 1) {
          this.plotisshow[item.plotid] = 0
          // console.log(item.plotid,"end")
          viewer.entities.removeById(item.plotid)
        }

      })
      polygonArr.forEach(item => {
        // console.log(item)
        // that.getDrawPolygon(item);

        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.starttime);
        const endDate = new Date(item.endtime);
        // console.log("line",item.plotid,startDate,endDate,currentDate)


        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotid] === 0) {
          this.plotisshow[item.plotid] = 1
          this.getDrawPolygon(item)
        }
        //消失
        if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotid] === 1) {
          this.plotisshow[item.plotid] = 0
          // console.log(item.plotid,"end")
          viewer.entities.removeById(item.plotid)
        }
      })


    },
    //时间轴停止
    stopTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isTimerRunning = false
      // console.log("stopTimer")
    },
    //暂停播放切换
    toggleTimer() {
      if (this.isTimerRunning) {
        this.stopTimer();
      } else {
        this.initTimerLine();
      }
    },
    // 前进
    forward(){
      this.currentNodeIndex = (this.currentNodeIndex + 1) % 2076
      let tmp = 100.0 / 2076.0 * this.currentSpeed //进度条每次前进
      this.currentTimePosition += tmp;
      if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.isTimerRunning = false
      } else {
        this.currentTimePosition = this.currentTimePosition % 100
        // this.currentTime = new Date(this.eqstartTime.getTime()
        //     + this.currentNodeIndex * currentTime.setMinutes(currentTime.getMinutes() + 5); * 60 * 1000);
        let newTime = new Date(this.currentTime);
        this.currentTime = newTime.setMinutes(newTime.getMinutes() + 5);
        this.updatePlot()
      }
      console.log("========================",this.currentTime)
    },
    // 后退
    backward(){
      this.currentNodeIndex = (this.currentNodeIndex - 1) % 2076
      let tmp = 100.0 / 2076.0 * this.currentSpeed //进度条每次后退
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
        console.log("this.currentTime--",this.currentTime)
        this.updatePlot()
      }
    },
    //点击跳转时间对应场景
    jumpToTime(event) {
      const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
      const clickedPosition = event.clientX - timeRulerRect.left;
      this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
      this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
      // this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * 672); // Assuming 672 is the total number of steps
      this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * 2076); // Assuming 672 is the total number of steps
      // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 15 * 60 * 1000);
      this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
      //点击前运行状态
      this.updatePlot();
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
      this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * 2076);
      // this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 15 * 60 * 1000);
      this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
      this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.stopDrag);
      this.updatePlot();
      // 恢复默认的选择行为
      document.body.style.userSelect = 'auto';
      document.body.style.WebkitUserSelect = 'auto';
      document.body.style.MozUserSelect = 'auto';
      document.body.style.msUserSelect = 'auto';
    },
    selectSpeed(speed){
      // this.currentSpeed = speed
      this.speedOption = speed
      this.currentSpeed = parseFloat(speed.split(-1))
      console.log("-----------------------",this.currentSpeed)
    },
    //时间轴end-------------

    //线面渲染-------------------------------------------------
    drawPolyline(line) {
      let material = this.getMaterial(line.plottype, line.img)
      // 1-6 画线
      window.viewer.entities.add({
        id: line.plotid,
        plottype: line.plottype,
        polyline: {
          status: 1,
          // positions: positionsArr,
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(line.positionsArr),
          width: 5,
          material: material,
          // material: Cesium.Color.YELLOW,
          depthFailMaterial: Cesium.Color.YELLOW,
          clampToGround: true,
        },
        properties: {
          // pointPosition: pointLinePoints,
        }
      })
    },
    distinguishPolylineId(polylineArr) {
      let PolylineIdArr = []
      polylineArr.forEach(element => {
        if (!PolylineIdArr.includes(element.plotid)) {
          PolylineIdArr.push(element.plotid)
        }
      })
      return PolylineIdArr
    },
    // 选择当前线的material
    getMaterial(type, img) {
      if (type === "量算") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
          dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
      }
      if (type === "地裂缝" || type === "可用供水管网" || type === "不可用供水管网") {
        let PICTURELINE = new Cesium.ImageMaterialProperty({
          image: img,
          repeat: new Cesium.Cartesian2(3, 1),
        })
        return PICTURELINE
      }
      if (type === "可通行公路" || type === "限制通行公路" || type === "不可通行公路") {
        let color = null
        if (type === "可通行公路") {
          color = Cesium.Color.fromBytes(158, 202, 181)
        } else if (type === "限制通行公路") {
          color = Cesium.Color.fromBytes(206, 184, 157)
        } else {
          color = Cesium.Color.fromBytes(199, 151, 149)
        }
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
          color: color,
          dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
      }
      if (type === "可通行铁路" || type === "不可通行铁路") {
        let gapColor
        if (type === "可通行铁路") {
          gapColor = Cesium.Color.BLACK
        } else {
          gapColor = Cesium.Color.RED
        }
        let DASHLINE = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.WHITE,
          gapColor: gapColor,
          dashLength: 100
        })
        return DASHLINE
      }
      if (type === "可用输电线路" || type === "不可用输电线路") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
          dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
      }
      if (type === "可用输气管线" || type === "不可用输气管线") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
          dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
      }
    },
    getDrawPolygon(polygon) {
      // console.log("polygon111111111",polygon)
      viewer.entities.add({
        id: polygon.plotid,
        plottype: polygon.plottype,
        polygon: {
          show: true,
          hierarchy: Cesium.Cartesian3.fromDegreesArray(polygon.positionsArr),
          height: 0,
          material: polygon.img,
          stRotation: Cesium.Math.toRadians(parseFloat(polygon.angle)),
          clampToGround: true,
        }
      })
    },

    // 所有entity实体类型点击事件的handler（billboard、polyline、polygon）
    entitiesClickPonpHandler() {
      let that = this
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 1-1 获取点击点的信息（包括）
        let pickedEntity = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedEntity?.id
        // 2-1 判断点击物体是否为点实体（billboard）
        if (window.selectedEntity === undefined) {
          this.popupVisible = false
          this.popupData = {}
        }
        console.log("window.selectedEntity", window.selectedEntity)
        // if (Cesium.defined(pickedEntity) && window.selectedEntity !== undefined && window.selectedEntity._billboard !== undefined) {
        if (Cesium.defined(pickedEntity) && window.selectedEntity !== undefined) {
          // console.log("window.selectedEntity",window.selectedEntity)
          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // 2-5 更新弹窗位置
          // that.selectedEntity = window.selectedEntity


          // that.currentTime=
          // this.popupVisible = true; // 显示弹窗
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          that.popupData = {
            plotid: window.selectedEntity.id,
            plotname: window.selectedEntity.plottype,
            centerPoint: that.centerPoint
          };
          console.log("popupData thd timeline", this.popupData)
          this.updatePopupPosition(); // 更新弹窗的位置
        } else {
          this.popupVisible = false; // 隐藏弹窗
        }
        // 3-1 选中面时触发
        // if (Cesium.defined(pickedEntity) && window.selectedEntity._polygon !== undefined) {
        //   that.showPolygon = true
        //   // that.polygonPosition = window.selectedEntity
        // } else {
        //   this.showPolygon = false
        // }
        // // 4-1选中线时触发
        // if (Cesium.defined(pickedEntity) && window.selectedEntity._polyline !== undefined) {
        //   let status = cesiumPlot.drawPolylineStatus()
        //   if (status === 0) {
        //     that.showPolyline = true
        //     // that.polylinePosition = window.selectedEntity
        //   }
        // } else {
        //   this.showPolyline = false
        // }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //LEFT_DOUBLE_CLICK

      // 必须有这个，拖动地图弹窗位置才会跟着移动
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (that.popupVisible && window.selectedEntity) {
          that.updatePopupPosition(); // 更新弹窗的位置
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, this.selectedEntityHighDiy)
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },

    //截图
    takeScreenshot() {
      // html2canvas(this.$refs.box).then((canvas) => {
      //   // 创建一个临时链接元素
      //   const link = document.createElement('a');
      //   link.download = 'screenshot.png';
      //   link.href = canvas.toDataURL('image/png');
      //   // 将链接添加到 DOM 并单击它以下载图像
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      //   // console.log(this.$el.textContent); // I'm text inside the component.
      // });
      const link = document.createElement('a');
      link.href = fileUrl
      link.download = '2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf';
      link.click();
    },

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
        console.log("that.tableData", that.tableData)
      })
    },

    plotAdj(row) {
      console.log(row)
      window.viewer.entities.removeAll();
      this.eqid = row.eqid
      this.websock.eqid = this.eqid
      this.initPlot(row.eqid)
    },
    // ------------------行政区划--------------------
    addYaanImageryDistrict() {
      this.removethdRegions()
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
        dataSource.name = "geojson_map";
        // 视角跳转到 geojson
        viewer.flyTo(dataSource.entities.values)
      }).catch((error) => {
        console.error("加载GeoJSON数据失败:", error);
      });
      let labelData =  { lon: 103.003398, lat: 29.981831, name: "雅安市" };
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
          window.regionLayer111=dataSource

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
      if(window.regionLayer111){
        window.viewer.dataSources.remove(window.regionLayer111, true); // 强制移除
        window.regionLayer111 = null; // 清空引用
        console.log("图层已移除");
      }
      this.labels.forEach(label => {
        window.viewer.entities.remove(label);
      });
      this.labels = [];  // 清空标签引用数组
    },
    backcenter(){
      this.removethdRegions()
      const position= Cesium.Cartesian3.fromDegrees(
          parseFloat(this.centerPoint.longitude),
          parseFloat(this.centerPoint.latitude),
          8000,
      );
      viewer.camera.flyTo({destination: position,})
    },
    layerChoose() {
      this.iflayerChoose = !this.iflayerChoose;
    },
    //标绘图层清除
    MarkingLayerRemove() {
      this.plots.forEach(item => {
        const entity = viewer.entities.getById(item.plotid);
        if (entity) {
          viewer.entities.removeById(item.plotid);
          this.plotisshow[item.plotid] = 0
        }
      })
    },
    handleMarkingLayerChange(newValue) {
      // console.log("this.isMarkingLayer = newValue",newValue)
      this.isMarkingLayer = newValue; // 更新 isMarkingLayer
    },
  }
}
</script>

<style>
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
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#cesiumContainer {
  height: calc(100vh - 50px) !important;
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
  width: 30%;
  right: 0%;
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
  width: 70%;
  height: 8px;
  left: -14%;
  background-color: #ddd;
  border-radius: 4px;
  margin: 0 1%;
  cursor: pointer;
  flex-direction: row;
}

.speedButton {
  position: relative;
  left: 101%;
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
  width: 98%;
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
  right: 7%;
}
.thematic-button{
  position: absolute;
  z-index: 20;
  top: 6.3%;
  right: 14%;
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
.city-button {
  margin-bottom: 8px;
}

.district-buttons {
  display: flex;
  flex-wrap: wrap;
}

.district-button {
  flex: 0 0 25%; /* 每行4个按钮 */
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

</style>
