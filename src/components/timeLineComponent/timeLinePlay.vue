<template>
  <div>
    <div class="topCurrentTimeLabel">
      {{ this.timestampToTimeChina(this.currentTime) }}
    </div>
    <div class="start-time-info">
      <span class="timelabel">开始时间：{{ this.timestampToTimeChina(this.centerPoint.startTime) }}</span>
    </div>
    <div class="current-time-info">
      <span class="timelabel">{{ this.timestampToTimeChina(this.currentTime) }}</span>
    </div>
    <div class="speed-label">
      <span class="timelabel">当前播放速度：</span>
    </div>
    <div class="jump_realTime" v-if="ifNewEq">
      <img class="play-icon" src="../../assets/icons/TimeLine/时钟.png" @click="jumpRealTime" title="跳转到真实时间"/>
    </div>
    <div class="back_start">
      <img class="play-icon" src="../../assets/icons/TimeLine/回到开始.png" @click="backToStart" title="重新播放"/>
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
      <span class="timelabel">结束时间：{{ this.timestampToTimeChina(this.centerPoint.endTime) }}</span>
    </div>
  </div>
</template>
<script>

import * as Cesium from 'cesium'
import {getPlotwithStartandEndTime} from '@/api/system/plot.js'
import timeTransfer from "@/api/tool/timeTransfer.js";
import timeLine from "@/cesium/timeLine.js";

export default {
  name: "timeLinePlay",
  data: function () {
    return {
      currentSpeed: 1,
      showSpeedOptions: false,
      speedOption: '1X',
      speedOptions: ['1X', '2X', '4X', '60X', '3600X'],
      plots: [],
      ifNewEq:false,
    }
  },
  props: ['centerPoint', 'currentTime', 'eqid', 'viewer'],
  watch: {
    currentTime(newVal) {
    },
    centerPoint(newVal) {
      let realTime = new Date()
      if (realTime >= this.centerPoint.startTime && realTime <= this.centerPoint.endTime) {
          this.ifNewEq=true
      }
      // else
    },
    eqid(newVal) {
      this.getPlotwithStartandEndTime(this.eqid)
    },
    viewer(newVal) {
      this.getPlotwithStartandEndTime(this.eqid)
    }
  },
  mounted() {
    // this.initRealTimeButton()
    // console.log(this.eqid,"eqid mounted")
    this.getPlotwithStartandEndTime(this.eqid)
  },
  methods: {
    // ininRealTimeButton(){
    //   let realTime = new Date()
    //   if (realTime > this.centerPoint.startTime && realTime < this.centerPoint.endTime) {
    //
    //   }
    // },
    getPlotwithStartandEndTime(eqid) {
      // console.log(eqid,"eqid getPlotwithStartandEndTime")
      // 调用接口获取特定设备的绘图信息
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {
        console.log(res, "res")
        let plots = res
        plots.forEach(item => {
          if (!item.endTime || new Date(item.endTime) < new Date(this.centerPoint.startTime) || new Date(item.endTime) <= new Date(item.startTime)) {
            // 为没有结束时间的点设置默认结束时间
            item.endTime = this.centerPoint.endTime  //20天 错误时间设置结束时间地震发生20天以后
          }
          if (!item.startTime) {
            // 为没有开始时间的点设置默认开始时间
            item.startTime = this.centerPoint.startTime;
          }
        })
        this.$emit('updatePlots', plots);
        // 显示标记，追加新的点 （增）
        // 遍历返回的绘图信息，检查每个点是否已存在，如果不存在则添加
        let pointArr = plots.filter(e => e.drawtype === 'point')
        console.log(pointArr, "points")
        // console.log(window.viewer,"windows.viewer")
        // console.log(window.viewer.entities,"windows.viewer.entities")
        pointArr.forEach(item => {
          let iconurl = import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime()
          console.log(item, "item")
          // console.log(item.startTime,item.endTime,"time item")
          // timeLine.addMakerPoint(item.startTime, item.endTime, item.longitude, item.latitude, item.elevation, iconurl, "", item.plotId,item.plotType, "标绘点")
          timeLine.addMakerPoint(item.startTime, item.endTime, item.longitude, item.latitude, item.elevation, iconurl, "", item.plotId, item.plotType, "标绘点")
          // timeLine.addMakerPoint(item.startTime, item.endTime, item.longitude, item.latitude, 0, iconurl, "", item.plotId,item.plotType, "标绘点")
        })
      })
    },

    selectSpeed(speed) {
      // 直接赋值速度选项
      this.speedOption = speed
      // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
      this.currentSpeed = parseFloat(speed.split('-')[0])
      window.viewer.clock.multiplier = this.currentSpeed
      this.showSpeedOptions = false
    },
    pause() {
      window.viewer.clock.shouldAnimate = !window.viewer.clock.shouldAnimate;
    },
    jumpRealTime() {
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2022-06-02T04:23:46Z'));
    },
    backToStart() {
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(this.centerPoint.startTime));
    },

    timestampToTime(time) {
      return timeTransfer.timestampToTime(time)
    },
    timestampToTimeChina(time) {
      return timeTransfer.timestampToTimeChina(time)
    }

  }

}


</script>
<style scoped>


.start-time-info {
  position: absolute;
  bottom: 3%;
  width: 12%;
  left: 15%;
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
  width: 12%;
  right: 15%;
}

.speed-label {
  position: absolute;
  bottom: 3%;
  left: 60%;
}

.jump_realTime {
  position: absolute;
  bottom: 3%;
  left: 39%;
  background-color: #323940;
}

.back_start {
  position: absolute;
  bottom: 3%;
  left: 40.5%;
  background-color: #323940;
}

.speed-selector {
  position: absolute;
  bottom: 3%;
  width: 10%;
  left: 65%;
}

.timelabel {
  color: #ffffff;
  font-size: 12px;
}
.topCurrentTimeLabel {
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
.play-icon{
  width: 21px;
  margin-right: 4px;
  height: auto;
  cursor: pointer;
}
</style>
