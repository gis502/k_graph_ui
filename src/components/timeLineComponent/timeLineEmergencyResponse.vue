<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <h2 class="pop_title">
          应急响应
          <span class="time">{{ timestampToTimeChina(recordTime) }}</span>
        </h2></div>
      <div class="sub-main">
        <ul class="sub-ul">
          <li :class="[i === 0 || i === 1 ? 'high' : '']"
              v-for="(item, i) in responseShow"
          >
            <div class="pop_content">
              <p class="pop_txt"><span>{{ timestampToTimeChina(item.responseTime) }}</span></p>
              <p class="pop_txt"><span>{{ item.unit }}</span></p>
              <p class="pop_responseName">
                <span>{{ item.level }}</span>
                <span class="pop_txt">{{ item.status }}</span>
              </p>
              <el-divider class="eldriver"></el-divider>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {getEmergencyResponse} from "../../api/system/timeLine.js";
import timeTransfer from "@/api/tool/timeTransfer.js";

export default {
  data() {
    return {
      EmergencyResponseResponsecontent: [],
      responseShow:[],
      recordTime: '',
    };
  },
  props: ['currentTime', 'eqid'],
  mounted() {
    this.init();
  },

  watch: {
    currentTime(newVal) {
      this.updateEmergencyResponse(this.currentTime);
    },
    centerPoint(newVal) {
    }
  },
  computed: {
    panelHeight() {
      // 假设每个项目的高度是100px，加上一些额外的空间（如padding和border）
      const itemHeight = 21;
      const itemsCount = this.responseNewPanelShow.length + 2;
      const totalHeight = itemsCount * itemHeight;
      return totalHeight + 'px';
    }
  },
  methods: {
    init() {
      getEmergencyResponse({eqid: this.eqid}).then(res => {
        console.log("getEmergencyResponse",res)
        this.EmergencyResponseResponsecontent = res;
        this.updateEmergencyResponse(this.currentTime);
      });
    },
    async updateEmergencyResponse(currentTime) {
       this.responseShow = await this.EmergencyResponseResponsecontent.filter(item => {
        return new Date(item.responseTime) <= new Date(timeTransfer.timestampToTime(currentTime));
      });
      if(this.responseShow.length>0){
        // console.log(this.responseShow[0],"this.responseShow[length-1]")
        this.recordTime=this.responseShow[0].responseTime
      }
      else{
        this.recordTime=timeTransfer.timestampToTime(currentTime)
      }
    },
    timestampToTimeChina(time){
      return timeTransfer.timestampToTimeChina(time)
    }
  }
};
</script>


<style scoped>
.pop {
  position: absolute;
  width: 100%; /* 调整宽度 */
  height: 19%;
  z-index: 20; /* 提高层级 */
  transition: border 0.3s ease-in-out;
}

.tech-glow {
  animation: tech-glow-animation 1.5s infinite;
}

@keyframes tech-glow-animation {

  0%, 100% {
    box-shadow:
        0 0 5px rgba(0, 123, 255, 0.6), /* 蓝色 */
        0 0 10px rgba(0, 123, 255, 0.4),
        0 0 15px rgba(0, 123, 255, 0.4),
        0 0 20px rgba(255, 255, 0, 0.4), /* 黄色 */
        0 0 25px rgba(252, 1, 1, 0.4); /* 红色 */
  }
  50% {
    box-shadow:
        0 0 5px rgba(0, 123, 255, 0.7), /* 蓝色 */
        0 0 10px rgba(0, 123, 255, 0.5),
        0 0 15px rgba(255, 255, 0, 0.5), /* 黄色 */
        0 0 20px rgba(255, 0, 0, 0.5), /* 红色 */
        0 0 25px rgba(255, 0, 0, 0.6);
  }
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
  top: 26%;
  position: relative;
  left: 7%;
}

.sub-main {
  margin-top: -6%;
  max-height: 10vh;
  left: -2%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 0px;
}


.sub-ul {
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1rem;
  overflow-y: hidden; /* 当内容超出时隐藏垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: -21px; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.pop_content {
  left: 7%;
  top: -2%;
  position: relative;
}

.pop_responseName {
  font-size:0.9rem;
  line-height: 0.6rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}

.pop_txt {
  line-height: 0.6rem;
  font-size: 0.9rem;
  font-weight: normal;
  color: #ffffff;
}

.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.new-panel {
  position: absolute;
  top: 8%;
  left: 100%;
  width: 176%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  z-index: 50;
}

.data-table {
  width: 100%; /* 表格宽度 */
  border-collapse: collapse; /* 合并边框 */
}

.data-table th, .data-table td {
  background-color: #1e3b4d !important;
  border-color: rgba(131, 190, 222, 0.24);
  padding: 10px; /* 内边距 */
  text-align: center;
  color: #fff;
  font-size: 16px;
}

.data-table th {
  border-width: 1px;
  border-style: solid;
  border-color: rgba(131, 190, 222, 0.24);
  background-color: #1e3b4d !important;
  color: #fff;
  padding: 0;
  text-align: center;
  font-size: 18px;
}

.close-button {
  position: absolute; /* Position the button absolutely */
  top: 0px; /* Distance from the top */
  right: 10px; /* Distance from the right */
  cursor: pointer; /* Change cursor to pointer */
  font-size: 24px; /* Adjust font size */
  color: #ffffff; /* Optional: Set color */
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
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
.eldriver{
  width: 250px;
}
</style>
