<template>
  <div class="pop">
    <div class="pop_header">
      <h2 class="pop_title">救援出队
        <span class="time">{{ this.recordtime }}</span>
      </h2>
      <div class="sub-main">
        <ul class="sub-ul">
          <li
              :class="[i === 0 || i === 1 ? 'high' : '']"
              v-for="item in showRescueTeam"
              :key="item.recordtime"
          >
            <div class="sub-content">
              <p class="pop_p">{{ showContent(item) }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import timeLineRescueTeam from "@/assets/json/TimeLine/timeLineRescueTeam";
import {getRescueTeam} from "../../api/system/timeLine.js";

export default {
  data() {
    return {
      RescueTeamInfo: '',
      showRescueTeam: [],
      recordtime: '',
      ifShowData: false,
    };
  },
  props: [
    'currentTime',
    'eqid'
  ],
  mounted() {
    this.init();
  },
  watch: {
    currentTime(newVal) {
      this.rescue_team_update(newVal);
    }
  },
  methods: {
    init() {
      getRescueTeam({eqid: this.eqid}).then(res => {
        console.log("res:救援队伍", res);
        this.RescueTeamInfo = res;
        this.rescue_team_update(this.currentTime);
      });
    },

    showContent(item) {
      let result = "";
      if (item.gotime) {
        result = `${item.goyear}年${item.gomonth}月${item.goday}日 ${item.gohour}:${item.gominute}，`;
      } else {
        result = `${item.goRecordyear}年${item.goRecordmonth}月${item.goRecordday}日 ${item.goRecordhour}:${item.goRecordminute}，`;
      }

      if (item.team) result += item.team;
      if (item.personnum) result += `${item.personnum}人`;
      if (item.destination) result += `前往${item.destination}。`;
      else result += '前往震区。';
      if (item.describeThings) result += item.describeThings.endsWith('。') ? item.describeThings : `${item.describeThings}。`;

      return result;
    },

    async rescue_team_update(currentTime) {
      this.showRescueTeam = [];
      const activities = await this.RescueTeamInfo.filter(activity => new Date(activity.recordTime) <= currentTime);
      activities.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime));

      if (activities.length > 0) {
        this.recordtime = this.timestampToTime(activities[activities.length - 1].recordTime);

        activities.forEach(item => {
          let activity = {
            recordtime: this.timestampToTime(item.departureDate),
            gotime: '',
            goyear: '',
            gomonth: '',
            goday: '',
            gohour: '',
            gominute: '',
            team: item.teamName,
            personnum: item.personnelCount,
            destination: item.plannedRescueArea,
            describeThings: item.describeThings,
          };
          if (item.departureDate) {
            const departureDate = new Date(item.departureDate);
            activity.gotime = departureDate;
            activity.goyear = departureDate.getFullYear();
            activity.gomonth = departureDate.getMonth() + 1;
            activity.goday = departureDate.getDate();
            activity.gohour = String(departureDate.getHours()).padStart(2, '0');
            activity.gominute = String(departureDate.getMinutes()).padStart(2, '0');
          }
          if (item.recordTime) {
            const recordTime = new Date(item.recordTime);
            activity.goRecordtime = recordTime;
            activity.goRecordyear = recordTime.getFullYear();
            activity.goRecordmonth = recordTime.getMonth() + 1;
            activity.goRecordday = recordTime.getDate();
            activity.goRecordhour = String(recordTime.getHours()).padStart(2, '0');
            activity.goRecordminute = String(recordTime.getMinutes()).padStart(2, '0');
          }
          this.showRescueTeam.unshift(activity);
        });
      } else {
        this.recordtime = this.timestampToTime(currentTime);
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
  }
};
</script>


<style scoped>
.pop {
  position: absolute;
  top: 56.4%;
  height: 28%;
  width: 100%; /* 调整宽度 */
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
  font-family: 'myFirstFont', sans-serif;
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
}

.pop_p {
  margin: 1px;
  font-size: 0.9rem;
  line-height: 1.2rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
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

:deep(.sub-main) {
  margin-top: -16px;
  top: 74%;
  max-height: 21vh;
  overflow-y: auto;
  padding: 0px;
  left: 2%;
  position: relative;
  width: 97%;
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

.sub-ul {
  padding: 0;
  margin: 0;
  font-size: .9rem;
  line-height: 1rem;
  overflow-y: auto; /* 当内容超出时显示垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: 0; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.sub-content {
  padding: 0;
  margin: 0;
  line-height: 2rem;
  font-size: .6rem;
  flex: 1;
}
</style>

