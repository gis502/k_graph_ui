<template>
  <div class="content-body">
    <div class="header">
      <div class="header-center">
        <span style="text-shadow: -1px 1px 0 #f6f1f1, 1px 1px 0 #939191;font-size: 28px;">灾链智控--基于大语言模型与知识图谱的地震应急信息平台</span>
      </div>
      <div class="header-time">
        <span id="time">{{ nowTime }}</span>
      </div>
    </div>

    <div class="content">
      <div class="content-con">


        <div class="center-body">
          <e-map :eq-data="MapData"/>
        </div>

        <div class="left">
          <div class="left-body">
            <div class="left-top public-bg" ref="leftTop">
              <!--              <div class="public-title">最新地震</div>-->
              <span style=" position: absolute;
                            top: 7%; /* 让文字居中 */
                            left:32%;transform: translate(-50%, -50%); /* 精确居中 */
                            font-size:18px;
                            font-weight: bold;
                            color: white;
                             /* 黑色阴影从上到下加深 */
                            text-shadow:
                              0px -1px 3px rgba(0, 0, 0, 0.2),
                              0px -2px 6px rgba(0, 0, 0, 0.4),
                              0px -3px 9px rgba(0, 0, 0, 0.6),
                              0px -4px 12px rgba(0, 0, 0, 0.8);
                            z-index: 2; /* 确保文字在图片上 */white-space: nowrap; /* 防止换行 */">最新地震词云图</span>
              <img src="@/assets/front_page/latestEarthquake3.png" alt="最新地震" style="width: 102%; height: auto;">
              <chart3/>
            </div>

            <div class="left-con public-bg" ref="leftCon">
              <span style="position: absolute;
                           top: 32.8%; /* 让文字居中 */
                           left: 24%;transform: translate(-50%, -50%); /* 精确居中 */
                           font-size: 18px;
                           font-weight: bold;
                           color: white;
                           /* 黑色阴影从上到下加深 */
                           text-shadow:
                             0px -1px 3px rgba(0, 0, 0, 0.2),
                             0px -2px 6px rgba(0, 0, 0, 0.4),
                             0px -3px 9px rgba(0, 0, 0, 0.6),
                             0px -4px 12px rgba(0, 0, 0, 0.8);
                           z-index: 2; /* 确保文字在图片上 */
                           white-space: nowrap; /* 防止换行 */">最新地震</span>
              <img src="@/assets/front_page/latestEarthquake3.png" alt="最新地震" style="width: 102%; height: auto;">
              <new-info :last-eq="lastEqData"/>
            </div>
            <div class="left-bottom public-bg" ref="leftBottom">
              <span style="position: absolute;
                           top: 63.5%; /* 让文字居中 */
                           left: 24%;transform: translate(-50%, -50%); /* 精确居中 */
                           font-size: 18px;
                           font-weight: bold;
                           color: white;
                           /* 黑色阴影从上到下加深 */
                           text-shadow:
                             0px -1px 3px rgba(0, 0, 0, 0.2),
                             0px -2px 6px rgba(0, 0, 0, 0.4),
                             0px -3px 9px rgba(0, 0, 0, 0.6),
                             0px -4px 12px rgba(0, 0, 0, 0.8);
                           z-index: 2; /* 确保文字在图片上 */
                           white-space: nowrap; /* 防止换行 */">热门话题</span>
              <img src="@/assets/front_page/ranking.png" alt="区域地震排行榜" style="width: 102%; height: auto;">
              <chart2 :last-eq="lastEqData"/>
            </div>
          </div>
        </div>


        <div class="right">
          <div class="right-body">
            <div class="right-top public-bg" ref="rightTop">
              <div style="position: relative; width: 100%; height: 110px;">
                <div class="right-title">地震列表</div>
                <!-- 输入框和按钮 -->
                <div
                  style="position: absolute; top: 70px; left: 40px; display: flex; align-items: center; z-index: 1;"
                >
                    <input type="text"
                           placeholder="搜索"
                           style="width: 11vw;
                                  font-size: 16px;
                                  margin-right: 6px;
                                  background-color: transparent;
                                  border: none ;
                                  outline: none ; /* 移除聚焦时的外边框 */
                                  box-shadow: none; /* 移除可能的阴影 */
                                  color: white;"
                           v-model="requestParams"
                           @keyup.enter="query()">
<!--                  <el-input-->
<!--                   -->
<!--                  ></el-input>-->
                  <el-button
                    size="small"
                    style="font-size: 14px;"
                    @click="query()"
                  >查询</el-button>
                  <el-button
                    size="small"
                    style="font-size: 14px;"
                    @click="openQueryFrom()"
                  >筛选</el-button>
                  <!-- 正式和测试按钮，固定不切换 -->
                  <el-button
                    size="small"
                    style="font-size: 14px;"
                    @click="addEq"
                  >
                    新增
                  </el-button>
                </div>
              </div>
              <div style="flex:1">
                <eq-table :eq-data="tableData"/>
              </div>
            </div>
            <div class="right-bottom">
              <span style="position: absolute;
                           top: 58%; /* 让文字居中 */
                           left: 19%;transform: translate(-50%, -50%); /* 精确居中 */
                           font-size: 18px;
                           font-weight: bold;
                           color: white;
                           /* 黑色阴影从上到下加深 */
                           text-shadow:
                             0px -1px 3px rgba(0, 0, 0, 0.2),
                             0px -2px 6px rgba(0, 0, 0, 0.4),
                             0px -3px 9px rgba(0, 0, 0, 0.6),
                             0px -4px 12px rgba(0, 0, 0, 0.8);
                           z-index: 2; /* 确保文字在图片上 */
                           white-space: nowrap; /* 防止换行 */">舆情分析</span>
              <img src="@/assets/front_page/latestEarthquake3.png" alt="最新地震" style="width: 102%; height: 35px;">
              <SentimentAnalysisChart></SentimentAnalysisChart>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="新增地震" v-model="addPanel" width="30%">
      <el-form ref="panel" :model="addDTO">
        <el-row>
          <el-col :span="55">
            <el-form-item label="震发位置：" prop="eqAddr">
              <div class="custom-cascader-wrapper">
                <!-- 输入框 -->
                <el-input
                  v-model="addDTO.eqAddr"
                  placeholder="请输入具体省市区（县）"
                  class="custom-input"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="发震时间：" prop="eqTime">
              <el-date-picker
                v-model="addDTO.eqTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="震级(级)：" prop="eqMagnitude">
              <el-input v-model="addDTO.eqMagnitude" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="深度(千米)：" prop="eqDepth">
              <el-input v-model="addDTO.eqDepth" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="addDTO.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="addDTO.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelPanel">取 消</el-button>
          <el-button type="primary" @click="commitPanel">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>

    <el-dialog v-model="queryFormVisible" title="筛选" width="28vw" style="top:20vh">
      <el-form :inline="true" :model="formValue">
        <el-form-item label="地震位置">
          <el-input v-model="formValue.earthquakeName" style="width: 23vw;" placeholder="地震位置" clearable/>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
            v-model="formValue.occurrenceTime"
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
          <el-input v-model="formValue.startMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px">(级)</span>
        </el-form-item>
        <el-form-item label="地震深度">
          <el-input v-model="formValue.startDepth" style="width: 5vw"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endDepth" style="width: 5vw"/>
          <span style="margin: 0 10px">(千米)</span>
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
import { onMounted, ref, reactive, nextTick, watch } from 'vue';
import EMap from '@/components/Home/emap.vue';
import EqTable from '@/components/Home/eqtable.vue';
import NewInfo from '@/components/Home/newInfo.vue';
import SentimentAnalysisChart from '@/components/Home/SentimentAnalysisChart.vue';
import Chart2 from '@/components/Home/chart2.vue';
import Chart3 from '@/components/Home/chart3.vue';
import {addNewEq, fromEqList, queryEqList} from '@/api/system/eqlist';
import {getEqList} from "@/api/system/damageassessment.js";

const nowTime = ref(null);
const tableData = ref([]);
const EqAll = ref([]);
const lastValidEqData = ref(null);
let addPanel = ref(false);
let addDTO = ref({
    // event: '',
    eqName: '',
    eqTime: '',
    eqAddr: '',
    longitude: 0.0,
    latitude: 0.0,
    magnitude: 0.0,
    eqDepth: 0.0,
    eqType: '',
    fullName:''
})


const getEq = () => {
  getEqList().then((res) => {
    console.log("地震数据", res.data)
    EqAll.value = res.data;
    console.log("EqAll.value", EqAll.value)
    tableData.value = res.data.filter(item => item.eqType === 'Z');

    lastEqData.value = tableData.value[0];

  });
};

const addEq = () => {
  addPanel.value = true;
}

const cancelPanel = () => {
  addDTO = {
    // event: '',
    eqName: '',
    eqTime: '',
    eqAddr: '',
    longitude: 0.0,
    latitude: 0.0,
    magnitude: 0.0,
    eqDepth: 0.0,
    eqType: ''
  }
}

const commitPanel = () => {
  addPanel.value = !addPanel.value
  addDTO.value.eqAddr = simplifyLocation(addDTO.value.eqAddr);
  addDTO.value.eqName = simplifyEqName(addDTO.value.eqAddr);
  addDTO.value.eqName += addDTO.value.eqMagnitude + '级地震';
  // 确保 longitude、latitude 和 eqMagnitude 是浮点数
  addDTO.value.longitude = parseFloat(addDTO.value.longitude);
  addDTO.value.latitude = parseFloat(addDTO.value.latitude);
  addDTO.value.magnitude = parseFloat(addDTO.value.eqMagnitude);
  addDTO.value.eqDepth = parseFloat(addDTO.value.eqDepth);
  // addDTO.value.event = guid();
  addDTO.value.eqType = 'Z';
  addDTO.value.eqTime = addDTO.value.eqTime.replace(/T/, ' ')

  // 处理 eqTime，提取出 '4月22日'
  const date = new Date(addDTO.value.eqTime)
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`
  // 处理 eqAddr，拼接 '地震'
  const formattedAddr = `${addDTO.value.eqAddr}地震`
  // 拼接成 fullName
  addDTO.value.fullName = `${formattedDate}${formattedAddr}`


  setTimeout(() => {
    getEq();
    console.log("新增成功！")
  }, 1000)



  addNewEq(addDTO.value).then(() => {
  })

  function simplifyEqName(fullName) {
    // 匹配“X省X市X县”或“X省X市X区”等结构
    const match = fullName.match(/([\u4e00-\u9fa5]+省)?([\u4e00-\u9fa5]+市)?([\u4e00-\u4e00-\u9fa5]+(县|区))?/);

    if (match) {
      // 提取各级地名并去掉“省市县区”等字
      const province = match[1] ? match[1].replace('省', '') : '';
      const city = match[2] ? match[2].replace('市', '') : '';
      const county = match[3] ? match[3].replace(/(县|区)/, '') : '';
      return province + city + county;
    }

    // fallback：去除“省市县区乡镇”等字样，仅保留核心地名
    return fullName.replace(/(省|市|县|区|乡|镇)/g, '');
  }



  console.log("新增成功！")

}

const simplifyLocation = (eqAddr) => {
  // 使用正则表达式匹配省、市、区、镇
  const match = eqAddr.match(/^(\S*省)?(\S*市|\S*州)?(\S*区|\S*县)?(\S*镇)?/);

  // 如果没有匹配到任何内容，直接返回原始地址
  if (!match) return eqAddr;

  // 提取匹配到的省、市、区、镇
  const province = match[1] || ''; // 省份
  const cityOrState = match[2] || ''; // 市或州
  const county = match[3] || ''; // 区或县
  const town = match[4] || ''; // 镇

  // 如果省、市、区、镇中至少有一个有值，就返回简化后的地址
  if (province || cityOrState || county || town) {
    return `${province}${cityOrState}${county}${town}`;
  }

  // 如果省、市、区、镇都没有匹配到，直接返回原始地址
  return eqAddr;
}


const guid =(num) => {
  return num ?
    Array.from({length: num}, () => Math.floor(Math.random() * 10)).join('') :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}


let lastEqData = ref(null);

const requestParams = ref('');
// 当前模式，初始为正式
const activeMode = ref('Z');
const MapData = computed(() => {
  let filteredData = tableData.value;

  if (activeMode.value === 'Z') {
    filteredData = filteredData.filter(item => item.eqType === 'Z');
  }
  // 过滤出年份大于等于2000的地震数据
  filteredData = filteredData.filter(item => item.occurrenceTime && new Date(item.occurrenceTime).getFullYear() >= 2000&&item.magnitude >= 3);
  console.log("filterDate2000",filteredData)
  return filteredData;
});


// 监听 MapData 变化，更新 lastEqData
watch(MapData, (newVal) => {
  if (newVal.length > 0&&newVal[0].magnitude>=3) {
    lastValidEqData.value = newVal[0]; // 存储上一次有值的第一条数据
    lastEqData.value = newVal[0];
  } else {
    lastEqData.value = lastValidEqData.value; // 为空时回退到存储值
  }
}, { deep: true, immediate: true });

const queryFormVisible = ref(false);

const borderBoxStyles1 = ref({});
const borderBoxStyles2 = ref({});
const borderBoxStyles3 = ref({});
const borderBoxStyles4 = ref({});
const borderBoxStyles5 = ref({});

// ResizeObserver
const resizeObserver = new ResizeObserver(() => {
  // Adjust styles dynamically instead of using key
  updateStyles();
});

// Element refs
const leftTop = ref(null);
const leftCon = ref(null);
const leftBottom = ref(null);
const rightTop = ref(null);
const rightBottom = ref(null);

const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
  {
    text: '近一年',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
      return [start, end];
    },
  },
];

const formValue = reactive({
  earthquakeName: '',
  occurrenceTime: '',
  startMagnitude: '',
  endMagnitude: '',
  startDepth: '',
  endDepth: '',
  startDate: '',
  endDate: '',
});

//筛选
const onSubmit = () => {
  if (formValue.occurrenceTime !== '') {
    const [startTime, endTime] = formValue.occurrenceTime;
    const startDate = new Date(startTime).toISOString();
    const endDate = new Date(endTime).toISOString();

    formValue.startDate = startDate;
    formValue.endDate = endDate;
  }

  // 构建查询对象
  const queryParams = {
    earthquakeName: formValue.earthquakeName || undefined,
    startTime: formValue.startDate || undefined,
    endTime: formValue.endDate || undefined,
    startMagnitude: formValue.startMagnitude || undefined,
    endMagnitude: formValue.endMagnitude || undefined,
    startDepth: formValue.startDepth || undefined,
    endDepth: formValue.endDepth || undefined,
  };


  console.log("5555555555555555555555555555", queryParams)

  fromEqList(queryParams).then((res) => {
    console.log(tableData,"tableData")
    tableData.value = res;
    console.log(res)
    lastEqData.value = tableData.value.length > 0 ? tableData.value[0] : null;
  });
  queryFormVisible.value = false;
};

const openQueryFrom = () => {
  queryFormVisible.value = true;
};
//查询
const query = () => {
  if (requestParams.value === '') {
    tableData.value = EqAll.value;
    lastEqData.value = tableData.value.length > 0 ? tableData.value[0] : null;
    return;
  }
  // queryEq({ queryValue: requestParams.value }).then((res) => {
  queryEqList({queryValue: requestParams.value}).then((res) => {
    console.log(requestParams.value)
    tableData.value = res;
    lastEqData.value = tableData.value.length > 0 ? tableData.value[0] : null;
  });
};

const updateTime = () => {
  nowTime.value = now_time();
};

const now_time = () => {
  let myDate = new Date();
  let myYear = myDate.getFullYear(); // 获取完整的年份(4位,1970-????)
  let myMonth = myDate.getMonth() + 1; // 获取当前月份(0-11,0代表1月)
  let myToday = myDate.getDate(); // 获取当前日(1-31)
  let myDay = myDate.getDay(); // 获取当前星期X(0-6,0代表星期天)
  let myHour = myDate.getHours(); // 获取当前小时数(0-23)
  let myMinute = myDate.getMinutes(); // 获取当前分钟数(0-59)
  let mySecond = myDate.getSeconds(); // 获取当前秒数(0-59)
  let week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return (
    myYear +
    '年' +
    fillZero(myMonth) +
    '月' +
    fillZero(myToday) +
    '日' +
    fillZero(myHour) +
    ':' +
    fillZero(myMinute) +
    ':' +
    fillZero(mySecond) +
    week[myDay]
  );
};

const fillZero = (str) => {
  return str < 10 ? '0' + str : str;
};

const updateStyles = () => {
  if (leftTop.value) {
    borderBoxStyles1.value = {
      width: leftTop.value.offsetWidth + 'px',
      height: leftTop.value.offsetHeight + 'px',
    };
  }

  if (leftCon.value) {
    borderBoxStyles2.value = {
      width: leftCon.value.offsetWidth + 'px',
      height: leftCon.value.offsetHeight + 'px',
    };
  }

  if (leftBottom.value) {
    borderBoxStyles3.value = {
      width: leftBottom.value.offsetWidth + 'px',
      height: leftBottom.value.offsetHeight + 'px',
    };
  }

  if (rightTop.value) {
    borderBoxStyles4.value = {
      width: rightTop.value.offsetWidth + 'px',
      height: rightTop.value.offsetHeight + 'px',
    };
  }

  if (rightBottom.value) {
    borderBoxStyles5.value = {
      width: rightBottom.value.offsetWidth + 'px',
      height: rightBottom.value.offsetHeight + 'px',
    };
  }
};


onMounted(() => {
  nextTick(() => {
    if (leftTop.value) resizeObserver.observe(leftTop.value);
    if (leftCon.value) resizeObserver.observe(leftCon.value);
    if (leftBottom.value) resizeObserver.observe(leftBottom.value);
    if (rightTop.value) resizeObserver.observe(rightTop.value);
    if (rightBottom.value) resizeObserver.observe(rightBottom.value);
  });

  setInterval(updateTime, 500);
  getEq();
});

</script>

<style scoped>
.public-bg {
  /*background: rgba(12, 26, 63, 0.3);*/
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
  font-size: 15px;
}

.public-title:before {
  width: 0px;
  height: 20px;
  top: 5px;
  position: absolute;
  content: "";
  background: #2997e4;
  border-radius: 2px;
  left: 4px;
}

.content-body {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/bg2.png");
  background-size: 100% 100%;
  position: absolute;
}

.header {
  margin-top: 2vh;
  position: absolute;
  display: flex;
  justify-content: center; /* 标题居中对齐 */
  align-items: center;
  height: 22px;
  margin-bottom: 2vh;
  width: 100%; /* 使用 100% 来适应父容器宽度 */
  z-index: 10;
}

.header-center {
  color: #69d1e1; /* 设置字体颜色为 #69d1e1 */
  font-weight: bold;
  font-size: 22px;
  letter-spacing: 2px;
  text-align: center; /* 确保文本在容器内居中 */
  width: 100%; /* 确保 header-center 占满父容器 */
  margin-left: -1.7%;
}

.header-time {
  top: 13px;
  position: absolute;
  color: #73FFFA; /* 使用给定的颜色 */
  right: 4vw;
  font-size: 12px; /* 字体稍微变小，提升精致感 */
  font-weight: 300; /* 使用较细的字体粗细 */
  font-family: 'Source Han Sans', '思源黑体', sans-serif; /* 使用思源黑体字体 */
  letter-spacing: 0.5px; /* 增加字母间距，让字体更加通透 */
  line-height: 1.4; /* 调整行高，确保文字看起来不拥挤 */
}

.content {
  left: 7px;
  padding: 3px 16px;
  position: absolute;
  margin-top: 7vh;
  width: 100%;
  height: calc(100% - 62px);
}

.content .content-con {
  height: 100%;
  padding-bottom: 26px;
}

.left {
  position: absolute;
  width: 22%;
  height: 97.8%;
  left: 0.5%;
  float: left;
  /*background-image: url("@/assets/home/黑色遮罩左.png");*/
  background: rgb(2, 0, 36);
  background: linear-gradient(90deg, rgb(13 17 42 / 96%) 0%, rgb(5 43 70) 40%, rgb(25 51 81 / 33%) 60%, rgba(17, 36, 82, 0.2704541289171919) 100%);

}

.left-body {
  width: 98%;
  height: 100%;
  margin: 0 0.3%;

}

.left-body .left-top {
  position: relative;
  width: 100%;
  height: 30%;
  overflow: hidden;
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
  height: 30%;
  margin-top: 1.6%;
  overflow: hidden;
}

.left-body .left-bottom {
  width: 100%;
  height: 44%;
  margin-top: 1.6%;
}

.center-body {
  position: absolute;
  width: 100%;
  height: 100%;
  /*margin: 0 0.3%;*/
  float: left;
}

.center-body .map {
  width: 97%;
  height: 96%;
}

.right {
  position: absolute;
  width: 32.3%;
  left: 66%;
  height: 97.8%;
  float: right;
  margin: 0 0.3%;
  background-image: url("@/assets/home/黑色遮罩右.png");
  /*background: linear-gradient(81deg, rgb(51 145 229 / 9%) 25%, rgb(0 9 26 / 86%) 88%);*/
}

.right-body {
  width: 98%;
  height: 100%;
  margin: 0 0.3%;
}
.right-top{
  height: 440px;
  display: flex;
  flex-direction: column;
}

.right-body .right-top {
  width: 100%;
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

.right-body {
  width: 100%;
  height: 100%;
  margin-top: 1%;
}

.right-bottom{
  height: 40%;
}


/* 新增样式 */
.content-body {

  /*background: linear-gradient(135deg, #1e1e2f, #2b2d42);*/
  color: #e0e0e0;
  font-family: 'Roboto', sans-serif;
}

.public-bg {
  /*background: rgba(30, 30, 47, 0.9);*/
  //border-radius: 10px;
  //box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.public-title {
  color: #00eaff;
  font-weight: bold;
  text-shadow: 0 0 5px #00eaff;
}

.el-input,
.el-button {
  border-radius: 5px;
}


.el-button:hover {
  background-color: #006f8c;
}

.dv-border-box7 {
  border: 1px solid #00eaff;
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px #00eaff;
  }
  to {
    box-shadow: 0 0 20px #00eaff;
  }
}

#time {
  color: #00eaff;
  font-size: 1.2em;
  font-weight: bold;
}

/* 新增高科技感样式 */
.content-body {
  /*background: linear-gradient(135deg, #0f0c29, #483fa1, #24243e);*/
  color: #ffffff;
  font-family: 'Orbitron', sans-serif;
}

/*!*边框蓝线*!
.public-bg {
  background: rgba(20, 20, 50, 0.85);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  border: 1px solid #0ff;
}*/


/*字体蓝光*/
/*.public-title {*/
/*  color: #0ff;*/
/*  font-weight: 700;*/
/*  text-shadow: 0 0 10px #0ff, 0 0 20px #00f, 0 0 30px #0ff;*/
/*}*/

.el-input,
.el-button {
  border-radius: 8px;
  border: none;
}

.el-button {

  background: linear-gradient(45deg, #2c3364, #0ff);
  color: #dce9fa;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
}

.dv-border-box7 {
  border: 1px solid #0ff;
  animation: neonGlow 2s infinite alternate;
  box-shadow: 0 0 15px #00eaff, 0 0 30px #0ff inset;
}

@keyframes neonGlow {
  from {
    box-shadow: 0 0 10px #00eaff;
  }
  to {
    box-shadow: 0 0 25px #00eaff;
  }
}

#time {
  color: #0ff;
  font-size: 1.5em;
  font-weight: 700;
  text-shadow: 0 0 5px #00eaff;
}

.right-title{
  position: absolute;
  top:30px;
  left: 60px;
  font-size: 28px;
  font-weight: 40000;
  letter-spacing: 0px;
  line-height: 40px;
  /* 文字自下向上渐变 */
  background-image: linear-gradient(to top, #0ff , #e0e0e0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}


</style>


