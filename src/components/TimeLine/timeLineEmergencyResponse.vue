<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <h2 class="pop_title">
          应急响应
          <span class="time">{{ recordTime }}</span>
        </h2></div>
      <div class="pop_content">
        <p class="pop_txt"><span>{{ this.activity.department }}</span></p>
        <p class="pop_responseName">
          <span>{{ this.activity.ResponseName }}</span>
          <span class="pop_txt">{{ this.activity.state }}</span>
        </p>
      </div>
    </div>
    <div v-if="showNewPanel && this.responseNewPanelShow.length!=0 " class="new-panel" :style="{ height: panelHeight }">
      <div class="close-button" @click="hideDetailedNews">
        &times; <!-- 叉号字符 -->
      </div>
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
import { getEmergencyResponse } from "../../api/system/timeLine.js";

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
      getEmergencyResponse({ eqid: this.eqid }).then(res => {
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
          this.responseNewPanelShow.sort((a, b) => {
            return a.time - b.time;
            // return new Date(a.time) - new Date(b.time);
          });
          console.log(this.responseNewPanelShow,"this.responseNewPanelShow")
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
        this.recordTime = this.timestampToTimeChina(currentTime);
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
    hideDetailedNews(){
      this.showNewPanel = false
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
.pop_content {
  left: 7%;
  top: -2%;
  position: relative;
}
.pop_responseName{
  font-size: 1.1rem;
  line-height: 0.6rem;
  font-weight: bold;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}
.pop_txt{
  line-height: 0.6rem;
  font-size: 1.1rem;
  font-weight: 550;
  color: #ffffff;
}

.time{
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

</style>
