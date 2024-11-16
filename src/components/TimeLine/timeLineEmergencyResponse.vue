<template>
  <div>
    <div class="pop">
      <h2 class="pop_title">
        应急响应:
        <span class="time">{{ recordTime }}</span>
      </h2>
      <div class="pop_content">
        <p class="pop_txt"><span>{{ this.activity.department }}</span></p>
        <p class="pop_responseName">
          <span>{{ this.activity.ResponseName }}</span>
          <span class="pop_txt">{{ this.activity.state }}</span>
        </p>
      </div>

      <div class="pop_time_div">
        <div class="pop_title-underline"></div>
      </div>
    </div>

    <!--    <div v-if="showNewPanel" class="new-panel" :style="{ height: panelHeight }">-->
    <!--      <div v-for="(item, index) in responseNewPanelShow" :key="index">-->
    <!--        <span>{{ item.time }}{{ item.department }}{{ item.state }}{{ item.ResponseName }}</span>-->
    <!--      </div>-->
    <!--    </div>-->

    <div v-if="showNewPanel && this.responseNewPanelShow.length!=0 " class="new-panel" :style="{ height: panelHeight }">
      <table class="data-table">
        <thead>
        <tr>
          <th>时间</th>
          <th>部门</th>
          <th>状态</th>
          <th>响应级别</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in responseNewPanelShow" :key="index">
          <td>{{ item.time }}</td>
          <td>{{ item.department }}</td>
          <td>{{ item.state }}</td>
          <td>{{ item.ResponseName }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {getEmergencyResponse} from "../../api/system/timeLine.js";

export default {
  data() {
    return {
      EmergencyResponseResponsecontent: [],
      activity: {
        ResponseName: '',
        state: '',
        department: '',
        time: '',
      },


      responseHistory: [],
      responseNewPanelShow: [],
      recordTime: '',

      showNewPanel: false,

    };
  },
  props: ['currentTime', 'eqid', 'isfirst','eqstartTime'],
  mounted() {
    this.init();
  },
  watch: {
    currentTime(newVal) {
      this.updateEmergencyResponse(newVal);
    }
  },
  computed: {
    panelHeight() {
      // 假设每个项目的高度是100px，加上一些额外的空间（如padding和border）
      const itemHeight = 21;
      const itemsCount = this.responseNewPanelShow.length + 2;
      const totalHeight = itemsCount * itemHeight;
      // 确保高度不超过一个最大值，例如400px
      // const maxHeight = Math.min(totalHeight, 400);
      return totalHeight + 'px';
    }
  },
  methods: {
    init() {
      getEmergencyResponse({eqid: this.eqid}).then(res => {
        this.EmergencyResponseResponsecontent = res;
        const times = res.map(item => item.responseTime);
        this.$emit('addJumpNodes', times);
        this.updateEmergencyResponse(this.currentTime);
      });
    },

    async updateEmergencyResponse(currentTime) {
      const activities = await this.EmergencyResponseResponsecontent.filter(activity => {
        return new Date(activity.responseTime) <= currentTime;
      });
      if(currentTime===this.eqstartTime){
        this.responseNewPanelShow = []
        this.responseHistory = []
      }
      //结束位置也不显示
      if (this.isfirst) {
        this.showNewPanel = false
      } else {
        //没有更新
        if (this.responseHistory.length == activities.length) {
          this.showNewPanel = false
        }
        //回退
        else if (this.responseHistory.length > activities.length) {
          this.responseNewPanelShow = []
          this.responseHistory = []
          activities.forEach(item => {
            // if (!this.existsInresponseHistory(item)) {
            // console.log(item, "notexit")
            let tmpact = {
              ResponseName: item.level,
              state: item.status,
              department: item.unit,
              time: this.timestampToTimeChina(item.responseTime),
            }
            this.responseHistory.push(tmpact)
          })
        } else {
          this.showNewPanel = true
          this.responseNewPanelShow = []
          console.log("11111")
          // 到目前为止所有
          activities.forEach(item => {
            if (!this.existsInresponseHistory(item)) {
              console.log(item, "notexit")
              let tmpact = {
                ResponseName: item.level,
                state: item.status,
                department: item.unit,
                time: this.timestampToTimeChina(item.responseTime),
              }
              this.responseHistory.push(tmpact)
              this.responseNewPanelShow.push(tmpact)
            }
          })
        }

      }

      console.log(this.responseHistory, "this.responseHistory.length")
      if (activities.length > 0) {
        activities.sort((a, b) => {
          if (a.responseTime < b.responseTime) return -1;
          if (a.responseTime > b.responseTime) return 1;
          return 0;
        });

        //显示的一个
        let tmp = activities[activities.length - 1];
        this.activity.time = this.timestampToTimeChina(tmp.responseTime);
        this.recordTime = this.timestampToTime(tmp.responseTime);
        this.activity.department = tmp.unit;
        this.activity.ResponseName = tmp.level;
        this.activity.state = tmp.status;
      } else {
        this.recordTime = this.timestampToTime(currentTime);
      }
    },
    existsInresponseHistory(item) {
      return this.responseHistory.some(existingItem => {
        return (
            existingItem.ResponseName === item.level &&
            existingItem.state === item.status &&
            existingItem.department === item.unit &&
            existingItem.time === this.timestampToTimeChina(item.responseTime)
        );
      });
    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp);
      let year = DateObj.getFullYear();
      let month = DateObj.getMonth() + 1;
      let day = DateObj.getDate();
      let hh = DateObj.getHours();
      let mm = DateObj.getMinutes();
      let ss = DateObj.getSeconds();
      month = month > 9 ? month : '0' + month;
      day = day > 9 ? day : '0' + day;
      hh = hh > 9 ? hh : '0' + hh;
      mm = mm > 9 ? mm : '0' + mm;
      ss = ss > 9 ? ss : '0' + ss;
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
    },
    timestampToTimeChina(timestamp) {
      let DateObj = new Date(timestamp);
      let year = DateObj.getFullYear();
      let month = DateObj.getMonth() + 1;
      let day = DateObj.getDate();
      let hh = DateObj.getHours();
      let mm = DateObj.getMinutes();
      let ss = DateObj.getSeconds();
      month = month > 9 ? month : '0' + month;
      day = day > 9 ? day : '0' + day;
      hh = hh > 9 ? hh : '0' + hh;
      mm = mm > 9 ? mm : '0' + mm;
      ss = ss > 9 ? ss : '0' + ss;
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
    },
  }
};
</script>


<style scoped>
.pop {
  position: absolute;
  width: 22%; /* 调整宽度 */
  height: 21%;
  padding: 10px;
  border-radius: 5px;
  top: 13%;
  left: 1%;
  z-index: 20; /* 提高层级 */
  background-color: rgb(22, 53, 77, 0.9);
  backdrop-filter: none !important;
  border: 1px solid #008aff70;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: -16px;
  position: relative;
}

.pop_title:before {
  content: "";
  width: 11px;
  height: 23px;
  position: relative;
  top: 7px;
  margin: 0 10px;
  display: inline-block;
  background-image: url("@/assets/images/CommandScreen/弹框标题图标.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title:after {
  content: "";
  width: 90%;
  height: 6px;
  position: absolute;
  bottom: -15px;
  left: 9px;
  background-image: url("@/assets/images/CommandScreen/弹框标题分割线.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_content {
  left: 3%;
  position: relative;
}

.pop_title-underline {
  width: 100%;
  height: 0.5px;
  background-color: #1f9dca;
  margin-top: 1px;
}

.pop_responseName {
  font-size: 1.1rem;
  line-height: 0.6rem;
  font-weight: bold;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}

.pop_txt {
  line-height: 0.6rem;
  font-size: 1.1rem;
  font-weight: 550;
  color: #ffffff;
}

.pop_time_div {
  position: absolute;
  width: 94%;
  height: 5%;
  bottom: 16%;
}

.time {
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}


.new-panel {
  position: absolute;
  top: 15%; /* 垂直居中 */
  left: 26%; /* 水平居中 */
  width: 47%; /* 宽度 */
  background-color: rgba(255, 255, 255, 0.9); /* 背景颜色，透明度 */
  border-radius: 8px; /* 圆角 */
  z-index: 50; /* 确保面板在最上层 */
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


</style>
