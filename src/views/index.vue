<template>
  <div class="content-body">
    <div class="header">
      <div class="header-center">
        <span>雅安市地震应急信息服务技术支撑平台</span>
        <dv-decoration5 :dur="2" style="width: auto; height: 20px;"/>
      </div>
      <div class="header-time">
        <span id="time">{{ nowTime }}</span>
      </div>
    </div>
    <div class="content">
      <div class="content-con">
        <div class="left-body">
          <div class="left-top public-bg">
            <dv-border-box7>
              <div class="public-title">最新地震</div>
              <new-info :last-eq="lastEqData"/>
            </dv-border-box7>
          </div>

          <div class="left-con public-bg">
            <dv-border-box7>
              <div class="public-title">最新地震受灾人员统计</div>
              <chart3 :last-eq="lastEqData"/>
            </dv-border-box7>
          </div>
          <div class="left-bottom public-bg">
            <dv-border-box7>
              <div class="public-title">最新地震余震情况统计(次)</div>
              <chart2 :last-eq="lastEqData"/>
            </dv-border-box7>
          </div>
        </div>
        <div class="center-body">
          <e-map/>
        </div>

        <div class="right-body">
          <div class="right-top public-bg">
            <dv-border-box7>
              <div class="public-title">
                地震列表

                <el-input size="small" style="width: 7vw; font-size: 16px" v-model="requestParams"></el-input>
                <el-button size="small" style="font-size: 16px" @click="query()">查询</el-button>
                <el-button size="small" style="font-size: 16px" @click="openQueryFrom()">筛选</el-button>
              </div>
              <eq-table :eq-data="tableData"/>
            </dv-border-box7>
          </div>
          <div class="right-bottom public-bg">
            <dv-border-box7>
              <div class="public-title">历史地震统计(次)</div>
              <chart1 :eq-data="EqAll"/>
            </dv-border-box7>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
        v-model="queryFormVisible"
        title="筛选"
        width="28vw"
        style="top:20vh"
    >
      <el-form :inline="true" :model="formValue">
        <el-form-item label="地震位置">
          <el-input v-model="formValue.position" style="width: 23vw;" placeholder="地震位置" clearable/>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
              v-model="formValue.time"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="shortcuts"
              style="width: 23vw;"
              value-format="x"
          />
        </el-form-item>
        <el-form-item label="地震震级">
          <el-input v-model="formValue.startMagnitude" style="width: 2.5vw"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endMagnitude" style="width: 2.5vw;"/>
        </el-form-item>
        <el-form-item label="地震深度(千米)">
          <el-input v-model="formValue.startDepth" style="width: 2.5vw"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endDepth" style="width: 2.5vw"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  BorderBox7 as DvBorderBox7,
  Decoration5 as DvDecoration5
} from '@kjgl77/datav-vue3'
import {onMounted, ref} from 'vue';
import eMap from '@/components/Home/emap.vue';
import eqTable from '@/components/Home/eqtable.vue';
import newInfo from '@/components/Home/newInfo.vue';
import chart1 from '@/components/Home/chart1.vue';
import chart2 from '@/components/Home/chart2.vue';
import chart3 from '@/components/Home/chart3.vue';
import {fromEq, getAllEq, queryEq} from '@/api/system/eqlist';

const nowTime = ref(null);
const tableData = ref([]);
const EqAll = ref([])
const lastEqData = ref()
const requestParams = ref("")

const queryFormVisible = ref(false)

const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
  {
    text: '近一年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
      return [start, end]
    },
  },
]

const formValue = reactive({
  position: "",
  time: "",
  startMagnitude: "",
  endMagnitude: "",
  startDepth: "",
  endDepth: "",
})

const onSubmit = () => {
  if (formValue.time !== "") {
    const [startTime, endTime] = formValue.time;
    const startDate = new Date(startTime).toISOString().slice(0, 19).replace('T', ' ');
    const endDate = new Date(endTime).toISOString().slice(0, 19).replace('T', ' ');

    formValue.time = `${startDate} 至 ${endDate}`;
  }
  fromEq(formValue).then(res => {
    tableData.value = res;
  });
  queryFormVisible.value = false;
}

const openQueryFrom = () => {
  queryFormVisible.value = true;
}

const query = () => {
  if (requestParams.value === "") {
    tableData.value = EqAll.value
    return
  }
  queryEq({queryValue: requestParams.value}).then(res => {
    tableData.value = res
  })
}

const updateTime = () => {
  nowTime.value = now_time();
};

const now_time = () => {
  let myDate = new Date();
  let myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
  let myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
  let myToday = myDate.getDate(); //获取当前日(1-31)
  let myDay = myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
  let myHour = myDate.getHours(); //获取当前小时数(0-23)
  let myMinute = myDate.getMinutes(); //获取当前分钟数(0-59)
  let mySecond = myDate.getSeconds(); //获取当前秒数(0-59)
  let week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return myYear + '年' + fillZero(myMonth) + '月' + fillZero(myToday) + '日' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond) + week[myDay];
};

const fillZero = (str) => {
  return str < 10 ? '0' + str : str;
};

const getEq = () => {
  getAllEq().then((res) => {
    EqAll.value = res
    tableData.value = res
    lastEqData.value = res[0]
  })
  ;
};

onMounted(() => {
  setInterval(updateTime, 500);
  getEq();
});
</script>
<style scoped>
.public-bg {
  background: rgba(12, 26, 63, 0.3);
}

.public-title {
  width: calc(100% - 30px);
  height: 30px;
  position: relative;
  top: 0;
  left: 5px;
  color: white;
  padding-left: 16px;
  line-height: 30px;
  font-size: 17px;
}

.public-title:before {
  width: 4px;
  height: 20px;
  top: 5px;
  position: absolute;
  content: "";
  background: #2997e4;
  border-radius: 2px;
  left: 5px;
}

.content-body {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/背景图片.jpg");
  background-size: 100% 100%;
  position: absolute;
}

.header {
  margin-top: 1vh;
  position: absolute;
  display: flex;
  justify-content: center; /* 标题居中对齐 */
  align-items: center;
  height: 34px;
  width: 100%;
  z-index: 10;
}

.header-center {
  margin-left: -5vw;
  color: #ffffff;
  font-weight: bold;
  font-size: 24px;
  letter-spacing: 2px;
}

.header-time {
  top: 0;
  position: absolute;
  color: #FFFFFF;
  right: 2vw;
  font-size: 18px;
}

.content {
  position: absolute;
  margin-top: 5vh;
  width: 100%;
  height: calc(100% - 75px);
}

.content .content-con {
  height: 100%;
}

.content .content-con .left-body {
  width: 22%;
  height: 100%;
  float: left;
  margin: 0 0.3%;
}

.left-body .left-top {
  width: 100%;
  height: 30%;
}

.left-body .left-top .top-body {
  width: 100%;
  height: calc(100% - 25px);
}

.left-body .left-top .top-body .top-left {
  float: left;
  width: 50%;
  height: 100%;
}

.top-left-title {
  width: 100%;
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.top-left-title h6 {
  color: #bad0e2;
}

.top-left-title span {
  margin-top: 30px;
  display: inline-block;
  color: #2aa4f1;
}

.top-left-title span b {
  font-size: 30px;
  letter-spacing: 5px;
}

.top-left-title img {
  width: 80%;
}

.left-body .left-top .top-body .top-right {
  float: left;
  width: 50%;
  height: 100%;
}

.left-body .left-con {
  width: 100%;
  height: 38%;
  margin-top: 1.6%;
}

.left-body .left-bottom {
  width: 100%;
  height: 32%;
  margin-top: 1.6%;
}

.center-body {
  width: 45%;
  height: 100%;
  margin: 0 0.3%;
  float: left;
}

.center-body .map {
  width: 100%;
  height: 100%;
}

.right-body {
  width: 31%;
  height: 100%;
  float: right;
  margin: 0 0.3%;
}

.right-body .right-top {
  width: 100%;
  height: 56%;
}

.title-nav .top5-ul {
  width: calc(100% - 20px);
  height: calc(100% - 30px);
  padding: 10px;
}

.title-nav .top5-ul ul {
  width: 100%;
  height: 100%;
}

.title-nav .top5-ul ul, li {
  list-style: none;
}

.title-nav .top5-ul ul > li {
  width: 100%;
  height: 20%;
  color: #ffffff;
  line-height: 68px;
  justify-content: center;
}

.title-nav .top5-ul ul li span {
  margin-left: 3%;
  font-size: 14px;
}

.title-nav .top5-ul ul li span:nth-child(1) {
  color: #EB6841;
  font-style: oblique;
  display: inline-block;
  text-align: center;
  font-size: 20px;
}

.title-nav .top5-ul ul li span:nth-child(2) {
  width: 10%;
  display: inline-block;
  text-align: center;
  height: 30px;
  line-height: 30px;
  vertical-align: center;
  border-radius: 5px;
  color: #ffffff;
}

.title-nav .top5-ul ul li:nth-child(1) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(2) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(3) span:nth-child(2) {
  background: #d89346;
}

.title-nav .top5-ul ul li:nth-child(4) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(5) span:nth-child(2) {
  background: #1db5ea;
}

.title-nav .top5-ul ul li span:nth-child(3) {
  /*width: 15%;*/
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(4) {
  /*width: 15%;*/
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(5) {
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(6) {
  display: inline-block;
  text-align: center;
}

.right-body .right-bottom {
  width: 100%;
  height: 45%;
  margin-top: 1%;
}
</style>
