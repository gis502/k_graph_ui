<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <p class="pop_title">人员伤亡
          <span class="time">{{ activity.time }}</span>
        </p>

        <ul class="total-list">
          <li class="injure">
            <p class="injure_text">
              <span class="injure_num">{{ activity.injure }}</span> 人
            </p>
            <p>受伤人数</p>
          </li>
          <li class="miss">
            <p class="miss_text">
              <span class="miss_num">{{ activity.miss }}</span> 人
            </p>
            <p>失联人数</p>
          </li>
          <li class="death">
            <p class="death_text">
              <span class="death_num">{{ activity.death }}</span> 人
            </p>
            <p>死亡人数</p>
          </li>
        </ul>
      </div>
      <!-- 新增折线图 -->
      <div id="casualtyChart"></div>
    </div>
  </div>
</template>

<script>
import {getRescueActionCasualties} from "../../api/system/timeLine.js";
import * as echarts from "echarts";
import {getData} from "@/api/system/excel.js";
import WebSocketReconnect from "@/api/websocket.js";
import {initWebSocket} from "@/cesium/WS.js"; // 引入 ECharts

export default {
  data() {
    return {
      Responsecontent: [],
      casualtiesHistory:[],
      activity: {
        time: "",
        death: "0",
        miss: "0",
        injure: "0",
      },
      chartInstance: null, // 保存 ECharts 实例
    };
  },
  props: ["currentTime", "eqid","eqstartTime"],
  mounted() {
    this.init();
    this.initChart(); // 初始化图表

  },
  watch: {
    currentTime(newVal) {
      this.personnel_casualties_update(newVal);
      this.updateChart();
    },
  },
  methods: {
    async init() {
      // this.websocket = new WebSocketReconnect('ws://localhost:8080' + '/WebSocketServerExcel/');
      // this.websock = initWebSocket(this.eqid)
      // this.websock.eqid = this.eqid
      // this.websock.onmessage = (event) => {
        // console.log('收到消息：event', event);
        // console.log('收到消息：enevt data', event.data);
        // 处理接收到的数据
        // this.handleMessage(event.data);
      // };
      this.Responsecontent = await getRescueActionCasualties({eqid: this.eqid});
      this.personnel_casualties_update(this.currentTime);
      this.updateChart(); // 更新图表数据
    },
    async personnel_casualties_update(currentTime) {
      console.log(this.Responsecontent,"this.Responsecontent personnel_casualties_update")
      this.casualtiesHistory = this.Responsecontent.filter((activity) => {
        return new Date(activity.submissionDeadline) <= currentTime;
      });
      if (this.casualtiesHistory.length >= 1) {
        const latest = this.casualtiesHistory[this.casualtiesHistory.length - 1];
        this.activity = {
          time: this.timestampToTime(latest.submissionDeadline),
          death: latest.totalDeceased,
          miss: latest.totalMissing,
          injure: latest.totalInjured,
        };
        this.updateChart(); // 更新图表数据
      }
      else {
        this.activity = {time: this.timestampToTime(currentTime), death: "0", miss: "0", injure: "0"};
      }
    },
    initChart() {
      const chartDom = document.getElementById("casualtyChart");
      this.chartInstance = echarts.init(chartDom);

      const option = {
        title: {
          left: "center",
          textStyle: {},
        },
        tooltip: {
          trigger: "axis",
          textStyle: {
            color: "#ffffff", // 提示框字体颜色
          },
        },
        legend: {
          data: ["死亡人数", "失联人数", "受伤人数"],
          orient: "vertical", // 垂直布局
          right: -5, // 设置标签显示在右边
          top: "center", // 垂直居中
          textStyle: {
            color: "#ffffff", // 标签字体颜色
          },
        },
        xAxis: {
          type: "category",
          data: [this.timestampToTime(this.eqstartTime)], // X轴数据
          boundaryGap: false, // 起点和终点不留白
          axisLabel: {
            color: "#ffffff", // 白色字体
            fontSize: 10, // 缩小字体大小
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff", // X轴颜色
            },
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#ffffff", // Y轴颜色
            },
          },
          axisLabel: {
            color: "#ffffff", // Y轴标签字体颜色
          },
          splitLine: {
            lineStyle: {
              color: "rgba(255, 255, 255, 0.3)", // 网格线颜色
            },
          },
        },
        series: [
          {
            name: "死亡人数",
            type: "line",
            data: [0],
            smooth: true,
            lineStyle: {color: "rgba(255, 69, 58, 1)"},
            areaStyle: {color: "rgba(255, 69, 58, 0.2)"},
          },
          {
            name: "失联人数",
            type: "line",
            data: [0],
            smooth: true,
            lineStyle: {color: "rgba(54, 162, 235, 1)"},
            areaStyle: {color: "rgba(54, 162, 235, 0.2)"},
          },
          {
            name: "受伤人数",
            type: "line",
            data: [0],
            smooth: true,
            lineStyle: {color: "rgba(75, 192, 192, 1)"},
            areaStyle: {color: "rgba(75, 192, 192, 0.2)"},
          },
        ],
      };

      this.chartInstance.setOption(option);

    },
    updateChart() {
      if (this.chartInstance) {
        const labels = this.casualtiesHistory.map((item) =>
            this.timestampToTime(item.submissionDeadline)
        );
        const deathData = this.casualtiesHistory.map((item) => item.totalDeceased);
        const missData = this.casualtiesHistory.map((item) => item.totalMissing);
        const injuryData = this.casualtiesHistory.map((item) => item.totalInjured);

        this.chartInstance.setOption({
          xAxis: {
            data: labels,
          },
          series: [
            {data: deathData},
            {data: missData},
            {data: injuryData},
          ],
        });
      }
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
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
      // return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },
  },
};
</script>

<style scoped>
.pop {
  position: absolute;
  top: 19%;
  width: 100%; /* 调整宽度 */
  height: 21%;
  z-index: 20;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 18%;
  position: relative;
  left: 7%;
}

.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.total-list {
  list-style-type: none;
  left: 7%;
  top: 22%;
  position: relative;
  padding: 0;
  display: flex;
  gap: 14px;
  align-items: center;
  color: #fff;
  text-align: left; /* 设置整体文字居左 */
}

.total-list li {
  text-align: left;
  width: 26%;
  height: 5vh;
  padding: 4px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加轻微阴影 */
}

.total-list li.death {
  background: linear-gradient(90deg, rgb(174, 40, 37) 0%, rgb(164, 62, 68) 34%, rgb(152, 89, 98) 61%, rgb(96, 79, 85) 100%);
}

.total-list li.miss {
  background: rgb(66, 146, 196);
  background: linear-gradient(90deg, rgb(17, 54, 105) 0%, rgb(16, 48, 95) 37%, rgb(13, 43, 79) 61%, rgb(11, 37, 71) 100%);
}

.total-list li.injure {
  background: linear-gradient(90deg, rgb(27, 96, 86) 0%, rgb(24, 83, 81) 37%, rgb(17, 63, 69) 61%, rgb(12, 49, 63) 100%);
}

.injure_text {
  color: #63e8bd;
}

.miss_text {
  color: #4896f1;
}

.death_text {
  color: #e80c1a;

}

.total-list li p {
  margin: 0;
  left: 10%;
  bottom: 7%;
  font-size: .8rem;
  position: relative;
}

.total-list li p:first-child {
  font-size: .8rem;
  font-weight: bold;
}

.total-list li p span {
  font-size: 1.4rem;
  font-weight: bold;
}

#casualtyChart {
  width: 90%;
  margin: auto;
  height: 27vh;
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px; /* 滚动条的宽度 */
  height: 12px; /* 滚动条的高度，对水平滚动条有效 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 3px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
</style>
