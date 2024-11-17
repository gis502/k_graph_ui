<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <p class="pop_title">人员伤亡
          <span class="time">{{ activity.time }}</span>
        </p>

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
      </div>
      <div class="pop_time_div">
      </div>
    </div>
  </div>
</template>

<script>
import { getRescueActionCasualties } from "../../api/system/timeLine.js";

export default {
  data() {
    return {
      Responsecontent: [],
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
        res.sort((a, b) => a.recordTime < b.recordTime ? -1 : 1);
        // console.log(res,"人员伤亡排序")
        let deathtotal=0
        let misstotal=0
        let injurytotal=0
        let RACOneRecord;
        for (let i=0;i<res.length;i++) {
          switch (res[i].casualtyStatus) {
            case '死亡':
              RACOneRecord = {
                recordTime: res[i].recordTime,
                death: deathtotal + res[i].newCount,
                miss: misstotal,
                injury: injurytotal
              };
              deathtotal= deathtotal + res[i].newCount
              this.Responsecontent.push(RACOneRecord)
              break;
            case '失踪':
              RACOneRecord = {
                recordTime: res[i].recordTime,
                death: deathtotal,
                miss: misstotal + res[i].newCount,
                injury: injurytotal
              };
              misstotal= misstotal + res[i].newCount
              this.Responsecontent.push(RACOneRecord)
              break;
            default:
              RACOneRecord = {
                recordTime: res[i].recordTime,
                death: deathtotal,
                miss: misstotal ,
                injury: injurytotal+ res[i].newCount
              };
              injurytotal= injurytotal + res[i].newCount
              this.Responsecontent.push(RACOneRecord)
              break;
          }
        }
        this.personnel_casualties_update(this.currentTime)
      })
    },
    async personnel_casualties_update(currentTime) {
      const activities = await this.Responsecontent.filter((activity) => {
        return new Date(activity.recordTime) <= currentTime;
      });
      if (activities.length >= 1) {
        // activities.sort((a, b) => a.recordTime < b.recordTime ? -1 : 1);
        let tmp = activities[activities.length - 1];
        if(tmp.recordTime){
          this.activity.time = this.timestampToTime(tmp.recordTime);
        }
        else {
          this.activity.time = '';
        }
        this.activity.death = tmp.death;
        this.activity.miss = tmp.miss;
        this.activity.injure = tmp.injury;
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
  top: 15%;
  position: relative;
  left: 7%;
}

.total-list {
  height: 36%;
  list-style-type: none;
  top: 69%;
  position: relative;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
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
.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
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
