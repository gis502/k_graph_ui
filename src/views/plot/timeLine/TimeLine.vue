<template>
  <div>
    <div id="box" ref="box">
      <div id="cesiumContainer">
      </div>
    </div>
<!--    <span>当前时间{{ this.currentTime }}</span>-->
    <!--    centerPoint经过一次数据库查询，eqid是别的页面传值，eqid传得更快-->
    <timeLinePlay
        :viewer="viewer"
        :eqid="eqid"
        :centerPoint="centerPoint"
        :currentTime="currentTime"
        @updatePlots="updatePlots"
    />
<!--   -->
    <div>
      <div class="pop_left_background">
        <timeLineEmergencyResponse
            :eqid="eqid"
            :currentTime="currentTime"
        />
        <!--   人员伤亡-左中   -->
        <timeLinePersonnelCasualties
            :eqid="eqid"
            :currentTime="currentTime"
        />

        <timeLineBaseInfo
            v-if="eqyear"
            :eqid="eqid"
            :currentTime="currentTime"
            :eqyear="eqyear"
            :earthquakeName="centerPoint.earthquakeName"
        />
      </div>
      <timeLineLegend
          :activeComponent="activeComponent"
          @toggleComponent="toggleComponent"
      ></timeLineLegend>

      <div class="pop_right_background">
        <timeLineLifeLine
            :eqid="eqid"
            :currentTime="currentTime"
        />
        <timeLinePlotStatistics
            :plots="plots"
            :currentTime="currentTime"
            :zoomLevel="zoomLevel"
            :isTimerRunning="isTimeRunning"
            :viewCenterCoordinate="viewCenterCoordinate"
            :earthquakeName="centerPoint.earthquakeName"
        />
        <mini-map></mini-map>
      </div>
    </div>
  </div>
</template>
<script>
//组件
import timeLinePlay from "@/components/timeLineComponent/timeLinePlay.vue";
import timeLineEmergencyResponse from "@/components/timeLineComponent/timeLineEmergencyResponse.vue";
import timeLinePersonnelCasualties from "@/components/timeLineComponent/timeLinePersonnelCasualties.vue";
import timeLineBaseInfo from "@/components/timeLineComponent/timeLineBaseInfo.vue";
import timeLineLegend from "@/components/timeLineComponent/timeLineLegend.vue";
import timeLineLifeLine from "@/components/timeLineComponent/timeLineLifeLine.vue";
import timeLinePlotStatistics from "@/components/timeLineComponent/timeLinePlotStatistics.vue";
import MiniMap from "@/components/TimeLine/miniMap.vue";


import {getEqListById} from "@/api/system/eqlist.js";
import * as Cesium from 'cesium'
import {initCesium} from "@/cesium/tool/initCesium.js";
import CesiumNavigation from "cesium-navigation-es6";
import timeTransfer from "@/api/tool/timeTransfer.js";
import centerstar from "@/assets/icons/TimeLine/震中.png";
import timeLine from "@/cesium/timeLine.js";
import {TianDiTuToken} from "@/cesium/tool/config.js";
import Arrow from "@/cesium/drawArrow/drawPlot.js";


export default {
  name: "TimeLine",
  components: {
    MiniMap,
    timeLinePlotStatistics,
    timeLineLifeLine,
    timeLineLegend,
    timeLineBaseInfo,
    timeLinePersonnelCasualties,
    timeLineEmergencyResponse,
    timeLinePlay
  },
  data: function () {
    return {
      eqid: '',
      currentTime: '',
      centerPoint: {},
      // centerPoint: {
      //   plotid: 'center',
      //   earthquakeName: '',
      //   startTime: '',
      //   endTime: '',
      //   magnitude: '',
      //   longitude: '',
      //   latitude: '',
      //   height: '',
      //   depth: '',
      //   plotType: '震中'
      // },
      //----组件传值---
      //viewer
      viewer:'',
      //基础信息组件传值-年月日
      eqyear: '',
      eqmonth: '',
      eqday: '',
      //图例组件传值-面板展开装状态
      activeComponent: null,
      //标绘统计组件传值
      isTimeRunning: true,
      plots: [],
      zoomLevel: '市', // 初始化缩放层级
      viewCenterCoordinate: {
        lon: null,
        lat: null
      },//视角中心坐标
      //----组件传值---end---

    }
  },
  created() {
    this.eqid = this.$route.params.eqid
    console.log(this.eqid, "this.eqid created father")
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let clock;
      getEqListById({id: this.eqid}).then(res => {
        console.log(res)
        //震中标绘点
        this.centerPoint = res


        // 设置中心点的标识和时间信息
        this.centerPoint.plotId = res.eqid
        this.centerPoint.startTime = new Date(this.centerPoint.occurrenceTime)
        this.centerPoint.endTime = new Date(this.centerPoint.startTime.getTime() + 10 * 24 * 3600 * 1000);
        this.currentTime = this.centerPoint.startTime
        this.centerPoint.plotType="震中"

        this.eqyear = this.centerPoint.startTime.getFullYear()
        this.eqmonth = this.centerPoint.startTime.getMonth() + 1
        this.eqday = this.centerPoint.startTime.getDate()

        // console.log(this.currentTime,"this.currentTime thd")
        clock = new Cesium.Clock({
          startTime: Cesium.JulianDate.fromDate(this.centerPoint.startTime),
          stopTime: Cesium.JulianDate.fromDate(this.centerPoint.endTime),
          currentTime: Cesium.JulianDate.fromDate(this.currentTime),
          clockRange: Cesium.ClockRange.CLAMPED,
        })
        let viewer = initCesium(Cesium, "cesiumContainer", clock)
        viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
        viewer.camera.changed.addEventListener(() => {
          const positionCartographic = viewer.camera.positionCartographic
          let height = positionCartographic.height;
          // this.updateZoomLevel(height)
          let longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
          let latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
          this.viewCenterCoordinate = {
            lon: longitude,
            lat: latitude
          }
        })


        let options = {}
        // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
        // options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1000, new Cesium.Cartographic)
        // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
        options.enableCompass = true
        // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
        options.enableZoomControls = true
        // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
        options.enableDistanceLegend = true
        // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
        options.enableCompassOuterRing = true
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
          destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 2000),//足够高可以看到整个地球
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          }
        });
        let that = this
        viewer.clock.onTick.addEventListener(function (clock) {
              that.currentTime = clock.currentTime;
              if (viewer.clockViewModel.shouldAnimate) {
                that.isTimeRunning = true
              } else {
                that.isTimeRunning = false
              }
            }
        )

        viewer.animation.viewModel.timeFormatter = timeTransfer.CesiumTimeFormatter;
        viewer.timeline.makeLabel = timeTransfer.CesiumDateTimeFormatter;
        viewer.animation.viewModel.dateFormatter = timeTransfer.CesiumDateFormatter;

        let realTime = new Date()
        if (realTime > this.centerPoint.startTime && realTime < this.centerPoint.endTime) {
          console.log("还在更新的地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:visible';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:visible';
          document.getElementsByClassName('cesium-animation-rectButton')[3].style = 'visibility:visible';
        } else {
          console.log("历史地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:visible';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:visible';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:visible';
        }
        document.getElementsByClassName('cesium-timeline-main')[0].style = 'width: 80%; left:10%;right:10%; ';
        document.getElementsByClassName('cesium-timeline-bar')[0].style = 'background:rgba(0, 0, 0, 0.1);';


        window.viewer = viewer
        this.viewer=viewer

        this.initMiniMap()
        this.updateMapAndVariableBeforeInit()
      })
    },

    initMiniMap() {
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
            url: "http://t0.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                TianDiTuToken,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
          })
      );
      smallViewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
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
      console.log(this.centerPoint,"this.centerPoint")
      timeLine.MiniMapAddMakerPoint(smallViewer, this.centerPoint.longitude, this.centerPoint.latitude, 0, centerstar, this.centerPoint.earthquakeName, this.centerPoint.plotId, this.centerPoint.plotType, "震中")
    },

    updateZoomLevel(cameraHeight) {
      console.log("层级", cameraHeight)
      // 根据相机高度设置 zoomLevel
      if (cameraHeight < 50000) {
        this.zoomLevel = '区/县'
      } else {
        this.zoomLevel = '市'
      }
    },

    updateMapAndVariableBeforeInit() {
      console.log(Cesium.JulianDate.toDate(window.viewer.clockViewModel.startTime))
      timeLine.fly(this.centerPoint.longitude, this.centerPoint.latitude, 60000)
      timeLine.addMakerPoint(this.centerPoint.startTime, this.centerPoint.endTime, this.centerPoint.longitude, this.centerPoint.latitude, 0, centerstar, this.centerPoint.earthquakeName, this.centerPoint.plotId, this.centerPoint.plotType, "震中")
    },
    toggleComponent(component) {
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;
    },
    updatePlots(plots) {
      console.log(this.plots,"plots updatePlots")
      this.plots = plots
    }
  }
}


</script>
<style scoped>
#box {
  height: calc(100vh - 50px);
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
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

:deep(.timelineLegend) {
  width: 19vw;
  bottom: 6.8%;
}

:deep(.timelineLegend.open) {
  width: 38%;
}
</style>
