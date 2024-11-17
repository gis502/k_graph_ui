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
</style>
