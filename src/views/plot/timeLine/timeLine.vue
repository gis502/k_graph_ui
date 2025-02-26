<template>
  <div>
    <timeLineTitle
        :centerPoint="centerPoint"
    />
    <div id="box" ref="box">
      <div id="cesiumContainer">
      </div>
    </div>
    <!--    centerPoint经过一次数据库查询，eqid是别的页面传值，eqid传得更快-->
    <timeLinePlay
        :viewer="viewer"
        :eqid="eqid"
        :centerPoint="centerPoint"
        :currentTime="currentTimeString"
        @updatePlots="updatePlots"
    />
    <!--   -->
    <div>
      <div class="pop_left_background">
        <timeLineEmergencyResponse
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <!--   人员伤亡-左中   -->
        <timeLinePersonnelCasualties
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <!--        震中信息组件-->
        <timeLineBaseInfo
            :centerPoint="centerPoint"
        />
      </div>
      <timeLineLegend
          :activeComponent="activeComponent"
          @toggleComponent="toggleComponent"
      ></timeLineLegend>
      <div class="pop_right_background">
        <timeLineLifeLine
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <timeLinePlotStatistics
            :plots="plots"
            :currentTime="currentTimeString"
            :zoomLevel="zoomLevel"
            :isTimerRunning="isTimeRunning"
            :viewCenterCoordinate="viewCenterCoordinate"
            :earthquakeName="centerPoint.earthquakeName"
        />
        <timeLineMiniMap
            :viewer="viewer"
            :centerPoint="centerPoint"
        />
      </div>
    </div>
  </div>
</template>
<script>
//组件
import timeLineTitle from "@/components/timeLineComponent/timeLineTitle.vue";
import timeLinePlay from "@/components/timeLineComponent/timeLinePlay.vue";
import timeLineEmergencyResponse from "@/components/timeLineComponent/timeLineEmergencyResponse.vue";
import timeLinePersonnelCasualties from "@/components/timeLineComponent/timeLinePersonnelCasualties.vue";
import timeLineBaseInfo from "@/components/timeLineComponent/timeLineBaseInfo.vue";
import timeLineLegend from "@/components/timeLineComponent/timeLineLegend.vue";
import timeLineLifeLine from "@/components/timeLineComponent/timeLineLifeLine.vue";
import timeLinePlotStatistics from "@/components/timeLineComponent/timeLinePlotStatistics.vue";
import timeLineMiniMap from "@/components/timeLineComponent/timeLineMiniMap.vue";
//cesium
import * as Cesium from 'cesium'
import {initCesium} from "@/cesium/tool/initCesium.js";
import CesiumNavigation from "cesium-navigation-es6";

//前后端
import {getEqListById} from "@/api/system/eqlist.js";
//数据处理方法
import timeTransfer from "@/cesium/tool/timeTransfer.js";
import timeLine from "@/cesium/timeLine.js";
import {Edit} from "@element-plus/icons-vue";


export default {
  name: "TimeLine",
  components: {
    timeLineTitle,
    timeLineMiniMap,
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

      //----组件传值---
      //时间轴、缩略图
      viewer: '',

      //图例组件传值-面板展开装状态
      activeComponent: null,
      //标绘统计组件传值
      lastCameraPosition: Cesium.Cartesian3.ZERO, // 上一次相机的位置，默认值为 (0, 0, 0)
      lastCameraTime: 0,     // 上一次相机位置的时间戳，默认值为 0
      cameraPosition: null,     // 当前相机的位置
      isCameraStopped: false,   // 标记相机是否停止

      isTimeRunning: true,
      plots: [],
      zoomLevel: '市', // 初始化缩放层级
      viewCenterCoordinate: {
        lon: null,
        lat: null
      },//视角中心坐标
      hasUpdatedPosition:false,
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
  computed: {
    // 在父组件中，将 JulianDate 转换为字符串
    currentTimeString() {
      if (this.currentTime) {
        // 使用 Cesium 的函数将 JulianDate 转换为 ISO 字符串
        return Cesium.JulianDate.toIso8601(this.currentTime);
      }
      return '';
    }
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
        this.centerPoint.plotType = "震中"

        clock = new Cesium.Clock({
          startTime: Cesium.JulianDate.fromDate(this.centerPoint.startTime),
          stopTime: Cesium.JulianDate.fromDate(this.centerPoint.endTime),
          currentTime: Cesium.JulianDate.fromDate(this.currentTime),
          clockRange: Cesium.ClockRange.CLAMPED,
        })
        let viewer = initCesium(Cesium, "cesiumContainer", clock)
        viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息

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
          destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 20000000),//足够高可以看到整个地球
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          }
        });
        viewer.clock.multiplier = 3600
        let that = this
        viewer.clock.onTick.addEventListener(function (clock) {
          that.currentTime = clock.currentTime;
          if (viewer.clockViewModel.shouldAnimate) {
            that.isTimeRunning = true
          } else {
            that.isTimeRunning = false
          }
          //视角中心监测 1秒钟时间不变才更新
          const now = new Date().getTime();
          const currentPosition = viewer.scene.camera.position;
          const hasMoved = !Cesium.Cartesian3.equals(that.lastCameraPosition, currentPosition);

          if (hasMoved) {
            that.lastCameraPosition = Cesium.Cartesian3.clone(currentPosition);
            that.lastCameraTime = now;
            that.hasUpdatedPosition = false; // 重置标志位
          } else {
            if (!that.hasUpdatedPosition) { // 检查是否已经更新过位置
              const elapsedTime = now - that.lastCameraTime;
              if (elapsedTime >= 1000) {
                // console.log("更新视角中心");
                const positionCartographic = viewer.camera.positionCartographic;
                let height = positionCartographic.height;
                that.updateZoomLevel(height);
                let longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
                let latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
                that.viewCenterCoordinate = {
                  lon: longitude,
                  lat: latitude
                };
                that.hasUpdatedPosition = true; // 设置标志位
              }
            }
          }
        });


        viewer.animation.viewModel.timeFormatter = timeTransfer.CesiumTimeFormatter;
        viewer.timeline.makeLabel = timeTransfer.CesiumDateTimeFormatter;
        viewer.animation.viewModel.dateFormatter = timeTransfer.CesiumDateFormatter;

        let realTime = new Date()
        if (realTime > this.centerPoint.startTime && realTime < this.centerPoint.endTime) {
          console.log("还在更新的地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[3].style = 'visibility:hidden';
        } else {
          console.log("历史地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
        }
        document.getElementsByClassName('cesium-timeline-main')[0].style = 'width: 70%; left:15%;right:15%; ';
        document.getElementsByClassName('cesium-timeline-bar')[0].style = 'background:rgba(0, 0, 0, 0.1);';


        window.viewer = viewer
        this.viewer = viewer
        viewer.clock.shouldAnimate = false;
        this.updateMapAndVariableBeforeInit()
      })
    },

    updateZoomLevel(cameraHeight) {
      // console.log("层级", cameraHeight)
      // 根据相机高度设置 zoomLevel
      if (cameraHeight < 50000) {
        this.zoomLevel = '区/县'
      } else {
        this.zoomLevel = '市'
      }
    }
    ,
    updateMapAndVariableBeforeInit() {
      timeLine.fly(this.centerPoint.longitude, this.centerPoint.latitude, 60000, 5).then(() => {
        viewer.clockViewModel.shouldAnimate = true;
      });
      timeLine.addMakerPoint(this.centerPoint, "震中")
    }
    ,
    toggleComponent(component) {
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;
    }
    ,
    updatePlots(plots) {
      console.log(this.plots, "plots updatePlots")
      this.plots = plots
    }
  }
}


</script>
<style scoped>
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

.pop_left_background {
  top: 11%;
  left: 1%;
  height: 77vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(90deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(44, 69, 94, 0) 100%);
}

.pop_right_background {
  top: 11%;
  right: 1%;
  height: 77vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

:deep(.timelineLegend) {
  width: 19vw;
  bottom: 12%;
}

:deep(.timelineLegend.open) {
  width: 33%;
  bottom: 8%;
  height: 82%;
}

:deep(.legend-item) {
  margin-bottom: 7px;
}

:deep(.distance-legend) {
  bottom: 1% !important;
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
</style>
