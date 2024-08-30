
<template>
  <div>
    <div class="rescue_team" v-show="rescue_team_isExpanded">
      <p class="title">救援出队</p>

      <div class="rescue_team_expand_button" @click="rescue_team_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
      </div>

      <div class="title-underline"></div>

      <div class="sub-main">
        <ul class="sub-ul">
<!--          <li-->
<!--              :class="[i === 0 || i === 1 ? 'high' : '']"-->
<!--              v-for="item in showRescueTeam"-->
<!--          >-->
            <li v-for="item in showRescueTeam">

            <div class="sub-content">
              <p class="rescue_team_p">
                <span v-if="item.gotime && item.gotime!==''">{{item.goyear}}年{{item.gomonth}}月{{item.goday}}日</span>
                <span v-if="item.gohour">{{item.gohour}}:{{item.gominute}}</span>
                <span v-if="item.gotime">，</span>
                <span v-if="item.team">{{item.team}}</span>
                <span v-if="item.personnum">{{item.personnum}}人 </span>
                <span v-if="item.destination">前往{{item.destination}}</span>
                <div v-if="item.gotime || item.team || item.personnum || item.destination" class="p-underline"></div>
              </p>

            </div>
          </li>
        </ul>
      </div>




      <div class="rescue_team_time_div">
        <div class="title-underline_low"></div>
        <p class="time_text"> 数据更新时间</p>
        <p class="time">{{this.recordtime}}</p>
      </div>

    </div>

    <div v-show="!rescue_team_isExpanded">
      <div class="rescue_team_notexpand_button" @click="rescue_team_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%;width: 100%">
      </div>
    </div>
  </div>


</template>


<script>
import timeLineRescueTeam from "@/assets/json/TimeLine/timeLineRescueTeam";
export default {
  data() {
    return {
      Responsecontent:'',
      showRescueTeam:[],
      rescue_team_isExpanded:'true',
      recordtime: '',
    }
  },
  props: [
    'currentTime'
  ],
  mounted() {
    this.init()
  },
  watch: {
    currentTime(newVal) {
      this.rescue_team_update(newVal)
    }
  },
  methods: {
    init() {
      // if()
      this.Responsecontent = [...timeLineRescueTeam].sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      });
      // console.log("this.Responsecontent",this.Responsecontent)
    },

    rescue_team_update(currentTime){
      this.showRescueTeam=[]
      // console.log("rescue_team_update",this.Responsecontent)
      // console.log(currentTime)
      const activities = this.Responsecontent.filter((activity) => {
        return (
            new Date(activity[0]) <= currentTime
            // new Date(activity[0]) <= currentTime && new Date(activity[0]) > new Date(currentTime.getTime()-5*60*1000)
        );
      });


      if(activities.length>0){
        // console.log("activities",activities)
        this.recordtime=activities[activities.length-1][0]
        activities.forEach((item) => {
          let activity={
            recordtime: item[0],
            gotime:'',
            goyear: '',
            gomonth: '',
            goday: '',
            gohour:'',
            gominute:'',
            team: item[2],
            personnum: item[3],
            destination: item[4],
          }

          if(item[1]){
            activity.gotime=new Date(item[1])
            activity.goyear = activity.gotime.getFullYear()
            activity.gomonth = activity.gotime.getMonth() + 1
            activity.goday = activity.gotime.getDate()
            activity.gohour = String(new Date(item[1]).getHours()).padStart(2, '0');
            activity.gominute = String(new Date(item[1]).getMinutes()).padStart(2, '0');
          }
          this.showRescueTeam.unshift(activity)
        })
        // console.log(this.showRescueTeam)
      }
      else{
        this.showRescueTeam=[]
        this.recordtime=''
      }


    },
    rescue_team_toggleExpand() {
      this.rescue_team_isExpanded = !this.rescue_team_isExpanded
    }
  }
}
</script>

<style>


.rescue_team{
  position: absolute;
  top: 55%;
  width: 25%;  /* 调整宽度 */
  height: 30%;
  padding: 10px;
  border-radius: 5px;
  left: 1%;
  z-index: 10; /* 提高层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.title{
  margin: 0.9px;
  font-size: 1.1rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.rescue_team_expand_button {
  position: absolute;
  width: 10%; /* 调整宽度 */
  //height: 25%;
  padding: 10px;
  border-radius: 5px;
  top: 0%;
  right: 1%;
  z-index: 22; /* 提高层级 */
}

.rescue_team_notexpand_button {
  position: absolute;
  width: 2.5%; /* 调整宽度 */
  padding: 10px;
  border-radius: 5px;
  top: 54%;
  left: 1%;
  z-index: 22; /* 提高层级 */
}

.title-underline {
  width: 100%;
  height: 1px;
  background-color: #FFFFFF;
  margin-top: 0px;
}
.p-underline {
  width: 100%;
  height: 0.5px;
  background-color: rgba(223, 225, 229, 0.42);
  margin-top: 0px;
}

.rescue_team_time_div{
  position: absolute;
  width: 94%;
  height: 20%;
  bottom:1%;
}
.title-underline_low{
  width: 100%;
  height: 0.5px;
  background-color: #FFFFFF;
  margin-top: 0px;
}

.rescue_team_p{
  margin-top: 1em;
  margin: 1px;
  font-size: 1rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.time_text{
  margin: 1px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.time{
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}


.sub-title {
  font-family: myFirstFont;
  font-size: 1.1rem;
  line-height: 1.8rem;
  /*padding: 1rem 0 1rem !important;*/
  color: #ffffff;
  letter-spacing: 0;
  text-align: justify;
  text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
  border-bottom: 0.1rem solid #ffffff;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}



.icon {
  margin-right: 10px;
}

.icon img {
  max-width: 12px; /* 设置图片最大宽度 */
  max-height: 12px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */

}

.sub-main {
  margin-top: 0px;
  max-height: 65%;
  overflow-y: auto;
  padding: 0px;
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
