<template>
  <div>
    <div id="box" ref="box">
      <div id="cesiumContainer">
      </div>
    </div>
    <div class="start-time-info">
      <span class="timelabel">{{ this.timestampToTime(this.centerPoint.startTime) }}</span>
    </div>
    <div class="current-time-info">
      <span class="timelabel">{{ this.timestampToTime(this.currentTime) }}</span>
    </div>

          <div class="speed-label">
            <span class="timelabel">当前播放速度：</span>
          </div>

          <div class="speed-selector" @click="this.showSpeedOptions = !this.showSpeedOptions">
            <div v-if="showSpeedOptions">
              <option class="timelabel"
                      v-for="option in speedOptions"
                      :key="option"
                      @click.stop="selectSpeed(option)"
              >
                {{ option }}
              </option>
            </div>
            <span class="timelabel">{{ speedOption }}</span>
          </div>


    <div class="end-time-info">
      <span class="timelabel">{{ this.timestampToTime(this.centerPoint.endTime) }}</span>
    </div>
  </div>
</template>
<script>

import * as Cesium from 'cesium'
import {initCesium} from "@/cesium/tool/initCesium.js";
import CesiumNavigation from "cesium-navigation-es6";
import {TianDiTuToken} from "@/cesium/tool/config";
import {getEqById} from "@/api/system/eqlist.js";
import {now} from "@vueuse/core";

export default {
  name: "TimeLine",
  data: function () {
    return {
      eqid: '',
      centerPoint: {
        plotid: 'center',
        earthquakeName: '',
        // position: '',
        // time:'',
        startTime: '',
        endTime: '',
        magnitude: '',
        longitude: '',
        latitude: '',
        height: '',
        depth: '',
        plotType: '震中'
      },
      currentTime: '',

      currentSpeed: 1,
      showSpeedOptions: false,
      speedOption: '1X',
      speedOptions: ['1X', '2X', '4X', '60X','3600X'],
    }
  },
  created() {
    this.eqid = this.$route.params.eqid
    console.log(this.eqid)
  },
  mounted() {
    this.init()

  },
  methods: {
    init() {
      let clock;
      getEqById({id: this.eqid}).then(res => {
        //震中标绘点
        this.centerPoint = res
        // 设置中心点的标识和时间信息
        this.centerPoint.plotid = "center"
        this.centerPoint.startTime = new Date(res.occurrenceTime)
        this.centerPoint.endTime = new Date(this.centerPoint.startTime.getTime() + 10 * 24 * 3600 * 1000);
        if (new Date() < this.centerPoint.endTime) {
          this.currentTime = new Date()
        } else {
          console.log("这是一个历史地震")
          this.currentTime = this.centerPoint.startTime
        }
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
            }
        )

        viewer.animation.viewModel.timeFormatter = this.CesiumTimeFormatter;
        viewer.timeline.makeLabel = this.CesiumDateTimeFormatter;
        viewer.animation.viewModel.dateFormatter = this.CesiumDateFormatter;
        document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
        document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:visible';
        document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:visible';
        document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:visible';

        document.getElementsByClassName('cesium-timeline-main')[0].style = 'width: 80%; left:10%;right:10%; ';
        document.getElementsByClassName('cesium-timeline-bar')[0].style = 'background:rgba(0, 0, 0, 0.1);';


        window.viewer = viewer

        this.updateMapAndVariableBeforeInit()
      })
    },
    /*
* 更新地图中心视角，更新变量：地震起止时间，渲染点
* */
    updateMapAndVariableBeforeInit() {
      console.log(Cesium.JulianDate.toDate(window.viewer.clockViewModel.startTime))
      this.flyToCenter()
    },
    flyToCenter() {
      // 飞行动画持续时间（秒）
      window.viewer.scene.camera.flyTo({
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
        duration: 2 // 飞行动画持续时间（秒）
      });

    },

// cesium时钟时间格式化函数
    CesiumTimeFormatter(datetime) {
      var julianDT = new Cesium.JulianDate();
      Cesium.JulianDate.addHours(datetime, 8, julianDT);
      var gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT);
      let hour = gregorianDT.hour + "";
      let minute = gregorianDT.minute + "";
      let second = gregorianDT.second + "";
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
    },
// cesium时钟日期格式化函数
    CesiumDateFormatter(datetime) {
      var julianDT = new Cesium.JulianDate();
      Cesium.JulianDate.addHours(datetime, 8, julianDT);
      var gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT);
      let month = gregorianDT.month + "";
      let day = gregorianDT.day + "";
      return `${gregorianDT.year}年${month.padStart(2, "0")}月${day.padStart(2, "0")}日`;
    },
// cesium时间轴格式化函数
    CesiumDateTimeFormatter(datetime) {
      var julianDT = new Cesium.JulianDate();
      Cesium.JulianDate.addHours(datetime, 8, julianDT);
      let gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT);
      let year = gregorianDT.year + "";
      let month = gregorianDT.month + "";
      let day = gregorianDT.day + "";
      let hour = gregorianDT.hour + "";
      let minute = gregorianDT.minute + "";
      let seconds = gregorianDT.second + "";
      return `${year}年${month.padStart(2, "0")}月${day.padStart(2, "0")}日 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    },
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

    selectSpeed(speed) {
      // 直接赋值速度选项
      this.speedOption = speed
      // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
      this.currentSpeed = parseFloat(speed.split('-')[0])
      window.viewer.clock.multiplier = this.currentSpeed
      this.showSpeedOptions = false
    },
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

.start-time-info {
  position: absolute;
  bottom: 3%;
  width: 10%;
  left: 6%;
}

.current-time-info {
  position: absolute;
  bottom: 3%;
  width: 10%;
  left: 50%;
}

.end-time-info {
  position: absolute;
  bottom: 3%;
  width: 10%;
  right: 0%;
}

.speed-label {
  position: absolute;
  bottom: 3%;
  left: 60%;
}
.speed-selector {
  position: absolute;
  bottom: 3%;
  width: 10%;
  left: 67%;
}

.timelabel {
  color: #ffffff;
}

/* 更改比例尺位置 */
:deep(.distance-legend) {
  bottom: 1% !important;
  pointer-events: auto;
  position: absolute;
  border-radius: 15px;
  padding-left: 5px;
  padding-right: 5px;
  height: 30px;
  right: 1%;
  width: 125px;
  box-sizing: content-box;
}

:deep(.cesium-animation-rectButton .cesium-animation-buttonMain) {
  stroke: #444;
  stroke-width: 1.2;
  opacity: 0.1;
}

:deep(.cesium-animation-rectButton:hover) .cesium-animation-buttonMain {
  stroke: #aef;
  opacity: 0.1;
}

:deep(.cesium-animation-rectButton:active) .cesium-animation-buttonMain {
  fill: #abd6ff;
}

:deep(.cesium-animation-buttonToggled .cesium-animation-buttonGlow) {
  display: block;
  fill: #227aee;
}

:deep(.cesium-animation-buttonToggled .cesium-animation-buttonMain) {
  stroke: #227aee;
}

:deep(.cesium-animation-buttonToggled:hover .cesium-animation-buttonGlow) {
  fill: #fff;
}

:deep(.cesium-animation-buttonToggled:hover .cesium-animation-buttonMain) {
  stroke: #227aee;
}

:deep(.cesium-animation-rectButton:hover .cesium-animation-buttonGlow) {
  display: block;
  opacity: 0.5;
}
</style>
