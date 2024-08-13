
<template>
  <div>
    <div class="rescue_team" v-show="rescue_team_isExpanded">
      <p class="title">救援出队</p>

      <div class="rescue_team_expand_button" @click="rescue_team_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
      </div>

      <div class="title-underline"></div>

      <p class="rescue_team_p">
        <!--        <span v-if="this.activity.gotime">{{this.activity.gotime}}</span>-->
        <span v-if="this.activity.gotime">{{this.activity.goyear}}年{{this.activity.gomonth}}月{{this.activity.goday}}日</span>
        <span v-if="this.activity.gohour">{{this.activity.gohour}}:{{this.activity.gominute}}</span>
        <span v-if="this.activity.gotime">，</span>
        <span  v-if="this.activity.team">{{this.activity.team}}</span>
        <span v-if="this.activity.personnum">{{this.activity.personnum}}人 </span>
        <span v-if="this.activity.destination">前往{{this.activity.destination}}</span>
        <!--        <span>。</span>-->
      </p>

      <div class="rescue_team_time_div">
        <div class="title-underline_low"></div>
        <p class="time_text"> 数据更新时间</p>
        <p class="time">{{this.activity.recordtime}}</p>
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
      activity:{
        recordtime: '',
        gotime:'',
        goyear: '',
        gomonth: '',
        goday: '',
        gohour:'',
        gominute:'',


        // gotime: '',
        team: '',
        personnum: '',
        destination: '',
      },
      rescue_team_isExpanded:'true',



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
      this.Responsecontent = [...timeLineRescueTeam]
      // console.log(this.Responsecontent)
    },
    rescue_team_update(currentTime){
      // console.log("rescue_team_update",this.Responsecontent)
      // console.log(currentTime)
      const activities = this.Responsecontent.filter((activity) => {
        return (
            new Date(activity[0]) <= currentTime
        );
      });
      if(activities.length>=1){
        // console.log("activities",activities)
        activities.sort((a, b) => {
          if (a[0] < b[0]) return -1;
          if (a[0] > b[0]) return 1;
          return 0;
        });
        let tmp=activities[activities.length-1]

        this.activity.recordtime=tmp[0]
        this.activity.gotime=new Date(tmp[1])
        this.activity.team=tmp[2]
        this.activity.personnum=tmp[3]
        this.activity.destination=tmp[4]

        this.activity.goyear = this.activity.gotime.getFullYear()
        this.activity.gomonth = this.activity.gotime.getMonth() + 1
        this.activity.goday = this.activity.gotime.getDate()

        this.activity.gohour = String(this.activity.gotime.getHours()).padStart(2, '0');
        this.activity.gominute = String(this.activity.gotime.getMinutes()).padStart(2, '0');
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
  top: 53%;
  width: 23%;  /* 调整宽度 */
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
  top: 52%;
  left: 1%;
  z-index: 22; /* 提高层级 */
}

.title-underline {
  width: 100%;
  height: 1px;
  background-color: #FFFFFF;
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
</style>
