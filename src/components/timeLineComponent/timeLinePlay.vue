<template>
  <div>
    <div class="topLastRecordTimeLabel">
      {{ this.lastRecordTimeLocal }}
    </div>
    <div class="start-time-info">
      <span class="timelabel">开始时间：{{ this.timestampToTimeChina(this.centerPoint.startTime) }}</span>
    </div>

    <div class="jump_realTime" v-if="ifNewEq">
      <div class="tooltip" :class="{ 'highlight': selectedId === 'jumpRealTime' }"
           @click="selectButton('jumpRealTime'); jumpRealTime()">
        <img class="play-icon" src="../../assets/icons/TimeLine/时钟.png"/>
        <span class="tooltiptext">时间同步</span>
      </div>
    </div>
    <div class="back_start">
      <div class="tooltip" :class="{ 'highlight': selectedId === 'backStart' }"
           @click="selectButton('backStart'); backToStart()">
        <img class="play-icon" src="../../assets/icons/TimeLine/重播.png"/>
        <span class="tooltiptext">回到开始</span>
      </div>
    </div>
    <div class="play_back">
      <div class="tooltip" :class="{ 'highlight': selectedId === 'playBack' }"
           @click="selectButton('playBack'); playBack()">
        <img class="play-icon" src="../../assets/icons/TimeLine/向后播放.png"/>
        <span class="tooltiptext">向后播放</span>
      </div>
    </div>
    <div class="play_end">
      <div class="tooltip" :class="{ 'highlight': selectedId === 'playEnd' }"
           @click="selectButton('playEnd'); playEnd()">
        <img class="play-icon" src="../../assets/icons/TimeLine/停止.png"/>
        <span class="tooltiptext">停止</span>
      </div>
    </div>
    <div class="play_start">
      <div class="tooltip" :class="{ 'highlight': selectedId === 'playStart' }"
           @click="selectButton('playStart'); playStart()">
        <img class="play-icon" src="../../assets/icons/TimeLine/播放.png"/>
        <span class="tooltiptext">播放</span>
      </div>
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
    <div class="current-time-info">
      <span class="timelabel">{{ this.currentTimeLocal }}</span>
    </div>
    <div class="end-time-info">
      <span class="timelabel">结束时间：{{ this.timestampToTimeChina(this.centerPoint.endTime) }}</span>
    </div>
  </div>
</template>
<script>

import * as Cesium from 'cesium'
import {getPlotInfos, getPlotwithStartandEndTime} from '@/api/system/plot.js'
import timeTransfer from "@/cesium/tool/timeTransfer.js";
import timeLine from "@/cesium/timeLine.js";

export default {
  name: "timeLinePlay",
  data: function () {
    return {
      oldCurrentTime: null,
      selectedId: "playStart", // 当前选中的按钮，前进后退，暂停播放
      currentSpeed: 3600,
      showSpeedOptions: false,
      speedOption: '3600X',
      speedOptions: ['1X', '60X', '600X', '3600X', '7200X'],
      plots: [],
      ifNewEq: false, //用于 回到真实时间
      timeRecoard: [],
      plotArrinOneTime: [], // 假设这是你的点数组
      endflag: false, // 控制飞行结束的标志
      flyflag: true,//视角是否跳转？只有依次向前播放时才跳
      currentTimeLocal: this.timestampToTimeChina(new Date()),
      lastRecordTimeLocal: this.timestampToTimeChina(new Date()),
      lastRecordContent: '',
    }
  },
  props: ['centerPoint', 'currentTime', 'eqid', 'viewer', 'stopTimePlay', 'isMarkingLayer'],
  watch: {
    currentTime(newVal, oldVal) {
      if (newVal && oldVal && newVal !== oldVal) {
        //有时候输入的值不是nan,调用函数读取的参数也不是nan，但是取转换成呢哇Date格式，时间是invalid data
        let currentTimeLocaltmp = this.timestampToTimeChina(this.currentTime)
        if (currentTimeLocaltmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
          this.currentTimeLocal = currentTimeLocaltmp
        }
        this.ifstopandflash(newVal, oldVal);
      }
    },
    centerPoint(newVal) {
      let realTime = new Date()
      if (realTime >= this.centerPoint.startTime && realTime <= this.centerPoint.endTime) {
        this.ifNewEq = true
      }
      let lastRecordTimeLocaltmp = this.timestampToTimeChina(this.centerPoint.startTime)
      if (lastRecordTimeLocaltmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
        this.lastRecordTimeLocal = lastRecordTimeLocaltmp
      }
    },
    eqid(newVal) {
      this.getPlotwithStartandEndTime(this.eqid)
    },
    viewer(newVal) {
      this.getPlotwithStartandEndTime(this.eqid)
      window.viewer.timeline.container.onmouseup = (e) => {
        this.findLastRecordTimeAndContent()
        if(this.isMarkingLayer===false){
          console.log("11111 isMarkingLayer_viewer ")
          window.viewer.clockViewModel.shouldAnimate = false;
          this.endflag = true; //设置的flag，避免与自动播放的动效暂停播放冲突
          this.selectButton("playEnd")
        }
        else {
          console.log("2222 isMarkingLayer_viewer")
          this.playEnd()
        }
      }
    },
    stopTimePlay(newVal) {
      console.log("stopTimePlay", newVal)
      if (newVal) {
        this.playEnd(); // 停止时间轴播放
      }
    },
    isMarkingLayer(newVal) {
      console.log(newVal, "isMarkingLayerLocal watch")
      // this.isMarkingLayer=newVal
      if (!newVal) {
        console.log(this.isMarkingLayer, "isMarkingLayerLocal watch")
        window.viewer.clockViewModel.shouldAnimate = false;
        this.endflag = true; //设置的flag，避免与自动播放的动效暂停播放冲突
        this.selectButton("playEnd")
      }
    }
  },
  mounted() {
    this.getPlotwithStartandEndTime(this.eqid)
  },
  methods: {
    getPlotwithStartandEndTime(eqid) {
      // 调用接口获取特定设备的绘图信息
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {
        console.log(res, "getPlotwithStartandEndTime res")
        this.plots = res
        this.plots.forEach(item => {
          if (!item.endTime || new Date(item.endTime) < new Date(this.centerPoint.startTime) || new Date(item.endTime) <= new Date(item.startTime)) {
            // 为没有结束时间的点设置默认结束时间
            item.endTime = this.centerPoint.endTime  //20天 错误时间设置结束时间地震发生20天以后
          }
          if (!item.startTime) {
            // 为没有开始时间的点设置默认开始时间
            item.startTime = this.centerPoint.startTime;
          }
          // this.timeRecoard.push(new Date(item.startTime).getTime())
        })
        //传值给父组件，用于标绘统计
        this.$emit('updatePlots', this.plots);
        //---点---
        let pointArr = this.plots.filter(e => e.drawtype === 'point')
        console.log(pointArr, "pointArr")
        pointArr.forEach(item => {
          timeLine.addMakerPoint(item, "标绘点")
        })

        //---线---
        let polylineArr = this.plots.filter(e => e.drawtype === 'polyline')
        console.log(polylineArr, "polylineArr")
        polylineArr.forEach(item => {
          timeLine.addPolyline(item, "标绘点")
        })

        //---面---
        let polygonArr = this.plots.filter(e => e.drawtype === 'polygon')
        console.log(polygonArr, "polygonArr")
        polygonArr.forEach(item => {
          timeLine.addPolygon(item, "标绘点")
        })


        //---箭头绘制---
        let arrowArr = this.plots.filter(e => e.drawtype === 'straight' || e.drawtype === 'attack' || e.drawtype === 'pincer');
        arrowArr.forEach(item => {
          timeLine.addArrow(item, "标绘点")
        })
      })
    },
    selectButton(id) {
      this.selectedId = id; // 更新选中的按钮ID
    },
    jumpRealTime() {
      window.viewer.clockViewModel.shouldAnimate = true;
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
      this.findLastRecordTimeAndContent()
      if(this.isMarkingLayer===false){
        window.viewer.clockViewModel.shouldAnimate = false;
        this.endflag = true; //设置的flag，避免与自动播放的动效暂停播放冲突
        this.selectButton("playEnd")
      }
      else{
        this.flyflag = false
        this.endflag = false;
        this.$emit('startTimePlay');
        window.viewer.clock.multiplier = 1.0
      }
    },
    backToStart() {
      window.viewer.clockViewModel.shouldAnimate = false;
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(this.centerPoint.startTime));
      window.viewer.clock.multiplier = this.currentSpeed
      this.flyflag = true
      this.endflag = true;
      this.lastRecordTimeLocal = this.timestampToTimeChina(this.centerPoint.startTime)
      this.lastRecordContent = ''
    },
    playBack() {
      if (window.viewer.clock.multiplier > 0) {
        window.viewer.clock.multiplier = this.currentSpeed * (-1.0)
      }
      window.viewer.clockViewModel.shouldAnimate = true;
      this.endflag = false;
      this.$emit('startTimePlay');
      this.flyflag = false
    },
    playEnd() {
      window.viewer.clockViewModel.shouldAnimate = false;
      this.endflag = true; //设置的flag，避免与自动播放的动效暂停播放冲突
      this.selectButton("playEnd")
      console.log(this.isMarkingLayer, "this.isMarkingLayer playEnd")
      timeLine.makerLabelsShowPersonAndResouce(this.plots)
    },
    playStart() {
      if (new Date(this.currentTime) >= new Date()) {
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        window.viewer.clock.multiplier = 1.0
      } else {
        window.viewer.clock.multiplier = this.currentSpeed
      }
      if(this.isMarkingLayer===false){
        window.viewer.clockViewModel.shouldAnimate = false;
        this.endflag = true; //设置的flag，避免与自动播放的动效暂停播放冲突
        this.selectButton("playEnd")
      }
      else{
        window.viewer.clockViewModel.shouldAnimate = true;
        this.endflag = false;
        this.$emit('startTimePlay');
        this.flyflag = true
      }
    },
    selectSpeed(speed) {
      // 直接赋值速度选项
      this.speedOption = speed
      // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
      this.currentSpeed = parseFloat(speed.split('X')[0])
      window.viewer.clock.multiplier = this.currentSpeed
      this.showSpeedOptions = false
    },

    //视角跳转
    ifArriveTime(currentTime, oldCurrentTime, itemTime) {
      const startTime = Cesium.JulianDate.fromDate(new Date(itemTime));
      const timeDiff = Cesium.JulianDate.secondsDifference(currentTime, startTime);
      // 如果当前时间接近某个点的开始时间（允许一定的误差范围）
      if (Math.abs(timeDiff) < 1) { // 误差范围设置为1秒
        return true
      } else {
        if (new Date(currentTime).getTime() >= new Date(itemTime).getTime() && new Date(oldCurrentTime).getTime() <= new Date(itemTime).getTime()) {
          return true
        } else {
          return false
        }
      }
    },

    async flyToPointsSequentially() {
      for (let index = 0; index < this.plotArrinOneTime.length; index++) {
        const item = this.plotArrinOneTime[index];
        let lastRecordTimeLocaltmp = this.timestampToTimeChina(item.startTime)
        if (lastRecordTimeLocaltmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
          this.lastRecordTimeLocal = lastRecordTimeLocaltmp
        }

        //标签
        let entitylabel = null
        let plotId = item.plotId
        let plotType = item.plotType
        if (item.plotType === "失踪人员" || item.plotType === "轻伤人员" || item.plotType === "重伤人员" || item.plotType === "危重伤人员" || item.plotType === "死亡人员" || item.plotType === "已出发队伍" || item.plotType === "正在参与队伍" || item.plotType === "待命队伍") {
          entitylabel = window.labeldataSource.entities.getById(item.plotId + '_label');
          entitylabel.show = true
          this.lastRecordContent = entitylabel.labeltext
        } else {
          getPlotInfos({plotId, plotType}).then(res => {
            let labeltext = timeLine.labeltext(plotType, res)
            timeLine.addPointLabel(item, labeltext)
            entitylabel = window.labeldataSource.entities.getById(item.plotId + '_label');
            this.lastRecordContent = labeltext
          })
        }

        if (this.endflag) {
          console.log(index, this.plotArrinOneTime.length, "终止飞行1111");
          //相同时间有多个点，为了闪烁的效果能看清是哪个点，在判断这一组的时候，把标签隐藏了。这里停止之后，需要把隐藏的人员伤亡、救援出队标签给放出来。
          timeLine.makerLabelsShowPersonAndResouce(this.plots)
          break; // 终止循环
        }
        try {
          // 飞到指定点
          await timeLine.fly(item.longitude, item.latitude, 20000);
          if (this.endflag) {
            console.log(index, this.plotArrinOneTime.length, "终止飞行222");
            timeLine.makerLabelsShowPersonAndResouce(this.plots)
            break; // 终止循环
          }

          // 点闪烁
          await timeLine.blinkMarker(item);
          console.log("blinkMarker else")
          if (item.plotType === "失踪人员" || item.plotType === "轻伤人员" || item.plotType === "重伤人员" || item.plotType === "危重伤人员" || item.plotType === "死亡人员" || item.plotType === "已出发队伍" || item.plotType === "正在参与队伍" || item.plotType === "待命队伍") {
          } else {
            window.labeldataSource.entities.removeById(item.plotId + "_label");
          }
        } catch (error) {
          console.error("飞行过程中发生错误:", error);
          break; // 发生错误时终止循环
        }
      }

      // 如果所有点都飞完了，重新启动时间轴
      if (!this.endflag) {
        window.viewer.clockViewModel.shouldAnimate = true;
      }
    },
    ifstopandflash(currentTime, oldCurrentTime) {
      if(this.isMarkingLayer==false){
        return;
      }
      if (this.flyflag == false) {
        return;
      }
      this.plotArrinOneTime = this.plots.filter(plot => {
        return this.ifArriveTime(currentTime, oldCurrentTime, plot.startTime);
      });
      if (this.endflag) {
        window.viewer.clockViewModel.shouldAnimate = false;
        timeLine.makerLabelsShowPersonAndResouce(this.plots)

        console.log("终止333");
        return
      } else {
        if (this.plotArrinOneTime.length > 0) {
          window.viewer.clockViewModel.shouldAnimate = false;
          //先把这一时间点的标签隐藏，再一个一个弹出，
          timeLine.markerLabelsHidden(this.plotArrinOneTime)
          this.flyToPointsSequentially()
        }
      }
    },
    findLastRecordTimeAndContent() {
      console.log(new Date(this.currentTime), "new Date(currentTime) findLastRecordTimeAndContent")
      let filteredPlots = this.plots.filter(plot => {
        return new Date(plot.startTime).getTime() <= new Date(this.currentTime).getTime();
      });
      let latestPlot = null;
      let latestTime = new Date(this.centerPoint.startTime);
      filteredPlots.forEach(plot => {
        const plotStartTime = new Date(plot.startTime).getTime();
        if (plotStartTime > latestTime) {
          latestTime = plotStartTime;
          latestPlot = plot;
        }
      });

      if (latestPlot) {
        this.lastRecordTimeLocal = this.timestampToTimeChina(latestPlot.startTime)
        let plotId = latestPlot.plotId
        let plotType = latestPlot.plotType
        getPlotInfos({plotId, plotType}).then(res => {
          let labeltext = timeLine.labeltext(plotType, res)
          this.lastRecordContent = labeltext
        })
      }
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
  left: 18%;
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
}

.back_start {
  position: absolute;
  bottom: 3%;
  left: 40.5%;
}

.play_back {
  position: absolute;
  bottom: 3%;
  left: 42%;
}

.play_end {
  position: absolute;
  bottom: 3%;
  left: 43.5%;
}

.play_start {
  position: absolute;
  bottom: 3%;
  left: 45%;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 80px;
  background-color: #123051;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 0;
  position: absolute;
  z-index: 1;
  bottom: 125%; /* 将工具提示放在图标上方 */
  left: 50%;
  margin-left: -40px; /* 水平居中 */
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

/* 高亮样式 */
.highlight {
  border: 2px solid #4caf50; /* 绿色边框 */
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

.topLastRecordTimeLabel {
  background-color: rgba(32, 99, 150, 0.8);
  border-radius: 20px;
  height: 6%;
  width: 12%;
  top: 12%;
  position: absolute;
  z-index: 12;
  color: #FFFFFF;
  font-size: 16px;
  left: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
}


.topLastRecordContentLabel {
  background-color: rgba(32, 99, 150, 0.8);
  border-radius: 5px;
  height: 6%;
  width: 41%;
  top: 12%;
  position: absolute;
  z-index: 500;
  color: #FFFFFF;
  font-size: 16px;
  left: 32%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 隐藏超出容器的文本 */
}

.marquee {
  display: inline-block;
  white-space: nowrap; /* 确保文本不会换行 */
  overflow: hidden;
  position: relative; /* 相对于父元素定位 */
}

/* 创建滚动动画 */
@keyframes marquee {
  0% {
    left: 100%;
  }
  /* 从右侧开始 */
  100% {
    left: -100%;
  }
  /* 滚动到左侧 */
}

.marquee {
  display: inline-block;
  white-space: nowrap; /* 确保文本不会换行 */
  overflow: hidden;
  position: relative; /* 相对于父元素定位 */
  width: 100%; /* 宽度与父容器一致 */
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

.play-icon {
  width: 21px;
  margin-right: 4px;
  height: auto;
  cursor: pointer;
}

</style>
