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
      recordTime: ''
    };
  },
  props: ['currentTime', 'eqid'],
  mounted() {
    this.init();
  },
  watch: {
    currentTime(newVal) {
      this.updateEmergencyResponse(newVal);
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
      if (activities.length > 0) {
        activities.sort((a, b) => {
          if (a.responseTime < b.responseTime) return -1;
          if (a.responseTime > b.responseTime) return 1;
          return 0;
        });
        let tmp = activities[activities.length - 1];
        this.activity.time = this.timestampToTime(tmp.responseTime);
        this.recordTime = this.timestampToTime(tmp.responseTime);
        this.activity.department = tmp.unit;
        this.activity.ResponseName = tmp.level;
        this.activity.state = tmp.status;
      } else {
        this.recordTime = this.timestampToTime(currentTime);
      }
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
    }
  }
};
</script>


<style scoped>
.pop {
  position: absolute;
  width: 25%; /* 调整宽度 */
  height: 21%;
  padding: 10px;
  border-radius: 5px;
  top:13%;
  left: 1%;
  z-index: 20; /* 提高层级 */
  background-color: rgb(22, 53, 77,0.9);
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}
.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top:-16px;
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

.pop_time_div{
  position: absolute;
  width: 94%;
  height: 5%;
  bottom:16%;
}

.time{
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}
</style>
