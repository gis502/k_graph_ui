<template>
  <div>
    <div class="pop">
      <p class="pop_title">人员伤亡</p>

      <ul class="total-list">
        <li>
          <p>
            <span class="death_num">{{ activity.death }}</span> 人
          </p>
          <p>死亡人数</p>
        </li>
        <li>
          <p>
            <span class="miss_num">{{ activity.miss }} </span> 人
          </p>
          <p>失联人数</p>
        </li>
        <li>
          <p>
            <span class="injure_num"> {{ activity.injure }} </span> 人
          </p>
          <p>受伤人数</p>
        </li>
      </ul>

      <div class="pop_time_div">
        <div class="title-underline"></div>
        <p class="time_text">数据更新时间</p>
        <p class="time">{{ activity.time }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getRescueActionCasualties } from "../../api/system/timeLine.js";

export default {
  data() {
    return {
      Responsecontent: '',
      activity: {
        time: '',
        death: '0',
        miss: '0',
        injure: '0',
      }
    }
  },
  props: [
    'currentTime',
    'eqid'
  ],
  mounted() {
    this.init()
  },
  watch: {
    currentTime(newVal) {
      this.personnel_casualties_update(newVal)
    }
  },
  methods: {
    init() {
      getRescueActionCasualties({ eqid: this.eqid }).then(res => {
        console.log("res人员伤亡:", res)
        this.Responsecontent = res
        const times = res.map(item => item.recordTime);
        this.$emit('addJumpNodes', times)
        this.personnel_casualties_update(this.currentTime)
      })
    },
    async personnel_casualties_update(currentTime) {
      const activities = await this.Responsecontent.filter((activity) => {
        return new Date(activity.recordTime) <= currentTime;
      });
      if (activities.length >= 1) {
        activities.sort((a, b) => a.recordTime < b.recordTime ? -1 : 1);
        let tmp = activities[activities.length - 1];
        this.activity.time = this.timestampToTime(tmp.recordTime);
        this.activity.death = tmp.totalDeathCount;
        this.activity.miss = 0;
        this.activity.injure = tmp.totalSeriousInjuryCount + tmp.totalMildInjuryCount + tmp.totalCriticalInjuryCount;
      } else {
        this.activity.time = this.timestampToTime(currentTime);
        this.activity.death = '0';
        this.activity.miss = '0';
        this.activity.injure = '0';
      }
    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp);
      let year = DateObj.getFullYear();
      let month = (DateObj.getMonth() + 1).toString().padStart(2, '0');
      let day = DateObj.getDate().toString().padStart(2, '0');
      let hh = DateObj.getHours().toString().padStart(2, '0');
      let mm = DateObj.getMinutes().toString().padStart(2, '0');
      let ss = DateObj.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
    }
  }
}
</script>

<style scoped>
.pop {
  position: absolute;
  top: 35.5%;
  width: 25%;
  height: 20%;
  padding: 10px;
  border-radius: 5px;
  left: 1%;
  z-index: 20;
  background-color: rgb(22, 53, 77,0.9);
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}

.pop_title {
  color: #FFFFFF;
  font-size: 19px;
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
.title-underline {
  width: 100%;
  height: 1px;
  background-color: #1f9dca;
  margin-top: 1px;
}

.total-list {
  height: 25%;
  list-style-type: none;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff; /* 设置文字颜色为白色 */
}

.total-list li {
  text-align: center;
  margin: 0 17px;
}

.total-list li p {
  margin: 0;
  font-size: 0.9rem;
}

.total-list li p:first-child {
  font-size: 0.9rem;
  font-weight: normal;
}

.total-list li p span {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 5px;
}

.death_num {
  color: #b92853;
}

.miss_num {
  color: #a59ccb;
}

.injure_num {

  color: #c1d58b;
}

.personnel_casualties_time_div {
  position: absolute;
  width: 94%;
  height: 20%;
  bottom: 10%;
}

.time_text {
  margin: 1px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.time {
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px;               /* 滚动条的宽度 */
  height: 12px;              /* 滚动条的高度，对水平滚动条有效 */
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
