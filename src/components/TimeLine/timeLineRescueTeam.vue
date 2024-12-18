<template>
  <div class="pop-new">
    <div class="pop_header">
      <h2 class="pop_title">基础信息
        <span class="time">{{ timestampToTimeChina(props.currentTime) }}</span>
      </h2>

    </div>
    <div class="main">
      <el-carousel :interval="0" arrow="always" :initial-index="initialIndex" indicator-position="none">

        <el-carousel-item>
 <span
     style=" position: absolute;    font-weight: bold;padding-left: 0px;margin-top: 7px; margin-left: 3%; font-size: 14px; color: #fff;">
            2023年各区县人口情况
          </span>

          <!-- 新饼图 -->
          <div ref="pieChart" class="chart-container"></div>

        </el-carousel-item>

        <el-carousel-item>

          <!-- 卡片布局 -->
          <div class="card-layout">
            <span
                style="position: fixed; padding-left: 0px;margin-top: 2%; font-size: 17px; color: #fff;  font-weight: bold;">
            地形地貌
          </span>
            <div class="card-list">
              <!-- 顶部区域 -->
              <div class="top-box">
                <div class="card top-left">
                  <p class="top-title">最高海拔</p>
                  <p class="top-value">{{ stats.highestAltitude }} <span class="unit">米</span></p>
                </div>
                <div class="card top-right">
                  <p class="top-title">最低海拔</p>
                  <p class="top-value">{{ stats.minimumAltitude }} <span class="unit">米</span></p>
                </div>
              </div>
              <!-- 中间区域 -->
              <div class="card center">
                <p class="main-title">{{ stats.countyDistrict }}</p>
              </div>
              <!-- 底部区域 -->
              <div class="bottom-box">
                <div class="card bottom-left">
                  <p class="bottom-title">地貌</p>
                  <p class="bottom-value">{{ stats.landform }}</p>
                </div>
                <div class="card bottom-right">
                  <p class="bottom-title">地形</p>
                  <p class="bottom-value">{{ stats.terrain }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>


        <el-carousel-item>
    <span
        style="position: absolute;    font-weight: bold; padding-left: 0px;margin-top: 7px; margin-left: 3%; font-size: 14px; color: #fff;">
            {{ eqyear }}年各区县经济情况
          </span>

          <!-- 折线图 -->
          <div ref="lineChart" class="chart-container"></div>
        </el-carousel-item>


      </el-carousel>
    </div>
  </div>
</template>

<script setup>
import {getAftershockMagnitude, getPopulationData, getRiskPoint} from "@/api/system/statistics.js";
import {getDistrictEconomy} from "@/api/system/districtEconomy.js"; //地形、经济

import {ref, onMounted, onBeforeUnmount, nextTick, watch} from 'vue';
import * as echarts from 'echarts';

// const recordtime = ref(new Date().toLocaleString());
const initialIndex = ref(0);

const lineChart = ref(null); //经济折线图
const pieChart = ref(null);  //人口折线图

let lineChartInstance = null;
let pieChartInstance = null;

// 接收父组件的 eqid
const props = defineProps(['eqid', 'eqyear', 'earthquakeName', 'currentTime']); // 接收 eqid 和 eqyear


// 计算earthquakeName的最后三个字符
const earthquakeNameSuffix = props.earthquakeName.slice(-3);

//------------------------------------卡片数据------------------------------------------
// 卡片数据初定义
const stats = ref({
  highestAltitude: '_', // 最高海拔
  minimumAltitude: '_', // 最低海拔
  countyDistrict: 0, // 区县
  landform: '暂无数据', // 地貌
  terrain: '暂无数据', // 地形
});


//接收卡片信息
const fetchDistrictEconomy = async () => {
  try {
    const response = await getDistrictEconomy(props.eqyear || new Date().getFullYear()); // 根据年份动态获取数据
    if (response && response.length > 0) {
      console.log("获取的卡片信息：", response)

      // 根据 props.earthquakeName 匹配对应的县区数据
      const districtData = response.find(item => item.countyDistrict === earthquakeNameSuffix);

      if (districtData) {
        console.log("有匹配的区县获取的卡片信息：", districtData)
        // 如果找到匹配的区县数据，则填充对应的字段
        stats.value.highestAltitude = districtData.highestAltitude || '暂无数据';
        stats.value.minimumAltitude = districtData.minimumAltitude || '暂无数据';
        stats.value.countyDistrict = districtData.countyDistrict || '未知区县';
        stats.value.landform = districtData.landform || '暂无数据';
        stats.value.terrain = districtData.terrain || '暂无数据';
      } else {
        // 如果没有找到匹配的区县，则使用默认值
        console.warn(`没有找到与 ${props.earthquakeName} 匹配的区县数据`);
        setDefaultStats();
      }
    } else {
      console.warn(`年份 ${props.eqyear} 没有获取到区县卡片数据或数据为空`);
      // 提供默认数据或提示
      setDefaultStats();
    }
  } catch (error) {
    console.error("获取区县卡片数据失败:", error);
    setDefaultStats(); // 调用默认值方法
  }
};

// 设置默认数据的方法
const setDefaultStats = () => {
  stats.value.highestAltitude = '5150';
  stats.value.minimumAltitude = '600';
  stats.value.countyDistrict = '天全县';
  stats.value.landform = '丘陵1.5% 山地98.5%';
  stats.value.terrain = '呈深中切割，地势西北高，东南低。';
};

//------------------------------------经济数据------------------------------------------


//经济折线图数据
// 接收卡片信息并根据年份动态获取数据
//经济折线图数据

const datas = ref({
  districtEconomy: [], // 经济
  countyDistrict: [], //区县
  growthRate: [], // 同比增长率
});

const economicData = async () => {
  const currentYear = props.eqyear || new Date().getFullYear(); // 如果没有传递年份，默认使用当前年份

  try {
    // 调用接口获取数据
    const response = await getDistrictEconomy(currentYear);
    if (response && Array.isArray(response) && response.length > 0) {
      console.log(`年份 ${currentYear} 获取的区县经济数据：`, response);


      const districtEconomy = response.map(item => item.districtEconomy || '暂无数据');
      const countyDistrict = response.map(item => item.countyDistrict || '未知区县');
      //replace('%', '')：去掉百分号。
      //trim()：去除空白字符，防止前后有多余空格或制表符。
      const growthRate = response.map(item => {
        const rate = item.growthRate || '未知区县';
        return rate === '未知区县' ? rate : rate.replace('%', '').trim();
      });


      datas.value.districtEconomy = districtEconomy; // 响应式更新
      datas.value.countyDistrict = countyDistrict; // 响应式更新
      datas.value.growthRate = growthRate; // 响应式更新

      console.log("提取后的经济数据:", datas.value);


      // 确保在数据加载完成后初始化图表
      initCharts(); // 现在调用 initCharts

    } else {
      console.warn(`年份 ${currentYear} 没有获取到区县经济数据或数据为空`);
      // 提供默认数据或提示
      fetchDistrictEconomyAndCounty();
    }
  } catch (error) {
    console.error(`获取年份 ${currentYear} 的区县经济数据失败:`, error);
    fetchDistrictEconomyAndCounty(); // 调用默认值方法
  }
};


// 设置默认数据的方法
const fetchDistrictEconomyAndCounty = () => {
  datas.value.districtEconomy = [4200, 5000, 4300, 6100, 3900, 4200, 120];
  datas.value.countyDistrict = ['雨城区', '名山区', '荥经县', '汉源县', '石棉县', '天全县', '芦山县', '宝兴县'];

};

//------------------------------------人口数据------------------------------------------

// 人口新饼图数据和初始化

const populationDataChartUpdateTime = ref('')
// 存储人口数据的响应式变量
const populationData = ref({
  xAxisData: [], //区县
  seriesData: [],  //人口总数
});

// 处理人口数据
const handlePopulationData = () => {
  getPopulationData().then((res) => {
    console.log("后端返回的人口数据:", res); // 查看实际返回的数据

    // 确保返回数据是有效的，并且 data 字段存在
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 提取 `area` 和 `totalPopulation`
      const xAxisData = res.data.map(item => item.area);  // 存储区域名
      const seriesData = res.data.map((item) => (item.totalPopulation / 10000).toFixed(2)); // 保留两位小数
      // const seriesData = res.data.map(item => item.totalPopulation);  // 存储人口数

      populationData.value = {xAxisData, seriesData}; // 格式化存储数据
      console.log("提取后的人口数据:", populationData.value);

      populationDataChartUpdateTime.value = res.data[0].updateTime; // 更新时间
      populationDataChartUpdateTime.value = formatDate(populationDataChartUpdateTime.value);  // 更改时间格式

      // 确保在数据加载完成后初始化图表
      initCharts(); // 现在调用 initCharts

    } else {
      console.error("返回的人口数据格式不正确或数据为空", res);
    }
  }).catch(error => {
    console.error("获取人口数据时出错:", error); // 捕获并处理错误
  });

};

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');  // 月份从0开始，因此要加1
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

function timestampToTimeChina(timestamp) {
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
}

const colors = ['rgba(113, 226, 135, 1)', 'rgba(119, 247, 253, 1)', 'rgba(44, 104, 231, 1)', 'rgba(93, 202, 250, 1)'];


//------------------------------------初始化echars-----------------------------------------
// 初始化echars图
const initCharts = () => {


  // 经济柱状图图初始化（保持之前逻辑）
  // console.log("解构经济提取数据countyDistrict:", datas.value.countyDistrict);
  // console.log("解构经济提取数据datas:", datas.value);
  lineChartInstance = echarts.init(lineChart.value);

// 找到与 props.earthquakeName 匹配的县区的下标
  const selectedIndex = datas.value.countyDistrict.findIndex(item => item === earthquakeNameSuffix);

// 根据选中下标动态生成数据数组
  const barData = datas.value.districtEconomy.map((value, index) => {
    if (index === selectedIndex) {
      // 如果是选中的柱子，设置为渐变红色
      return {
        value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: 'rgb(255,138,94)'}, // 红色渐变
            {offset: 1, color: 'rgb(138,35,11)'}, // 深红色渐变
          ]),
        },
      };
    } else {
      // 其它柱子保持原来的颜色
      return {
        value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#12B9DB'},
            {offset: 1, color: '#6F8EF2'},
          ]),
        },
      };
    }
  });

  const lineoption = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        // Tooltip 中显示时补充百分号
        if (params.seriesName === "同比增长率") {
          return `${params.name}: ${params.value}%`;
        } else {
          return `${params.name}: ${params.value}亿元`;
        }
      },
    },
    grid: {
      left: "16%",
      right: "17%",
      top: "19%",
      bottom: "27%",
    },
    xAxis: {
      data: datas.value.countyDistrict, // X 轴数据来源
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          type: "solid",
          color: "gray",
          opacity: 1,
        },
      },
      axisLabel: {
        interval: 0,
        textStyle: {
          color: "#fff",
          fontSize: 9,
        },
        margin: 20,
        bottom: "25%",
      },
    },
    yAxis: [
      {
        name: "(亿元)",
        nameTextStyle: {
          align: "left",
          color: "#fff",
          padding: [0, 0, 0, -50],
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            opacity: 0.5,
          },
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          // formatter: '{value}', // 不加百分号，显示实际的亿元数值
        },
      },
      {
        show: true,
        name: "{%}",
        splitLine: {show: false},
        axisLine: {show: false},
        axisTick: {show: false},
        axisLabel: {
          textStyle: {fontSize: 12, color: "#fff"},
          formatter: '{value}%', // 动态添加百分号
        },
      },
    ],
    legend: {
      top: "4%",
      textStyle: {
        color: "#A1D5FF",
        fontSize: 12,
      },
      itemGap: 16,
    },
    series: [
      {
        name: "同比增长率",
        z: 9,
        yAxisIndex: 1,
        type: "line",
        // data: [12,14],
        data: datas.value.growthRate,
        symbol: "circle",
        symbolSize: 10,
        lineStyle: {
          width: 3,
          color: "#ffbb00",
        },
        itemStyle: {
          // 使用渐变色
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#12B9DB'},  // 渐变起始颜色
            {offset: 1, color: '#6F8EF2'}   // 渐变结束颜色
          ]),
        },
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //     {offset: 0, color: "rgba(255,187,0,.8)"},
        //     {offset: 1, color: "rgba(25,163,223,0)"},
        //   ]),
        // },
      },
      {
        name: "地区生产总值（GDP）",
        type: "bar",
        barWidth: 22,
        barGap: "-50%",
        data: barData, // 动态生成的数据数组--动态颜色
      },
    ],
  };

  // 初始化并设置图表
  lineChartInstance.setOption(lineoption);
  lineChartInstance.resize(); // 调整大小


  // 新人口折线图初始化
  console.log("解构人口提取数据xAxisData:", populationData.value.xAxisData);
  console.log("解构人口提取数据seriesData:", populationData.value);
  pieChartInstance = echarts.init(pieChart.value);

  // 找到与 props.earthquakeName 匹配的县区的下标
  const targetIndex = populationData.value.xAxisData.findIndex((item) => item === earthquakeNameSuffix);

// 根据选中下标动态生成柱状图数据并设置颜色
  const barSeriesData = populationData.value.seriesData.map((value, index) => ({
    value,
    itemStyle: {
      color:
          index === targetIndex
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: 'rgb(255,156,103)'}, // 红色渐变起点
                {offset: 0.33, color: 'rgb(253,99,168)'}, // 红色中间色
                {offset: 0.66, color: 'rgb(255,70,98)'}, // 红色中间色
                {offset: 1, color: 'rgb(168,12,83)'},     // 红色渐变终点
              ])
              : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: 'rgba(113, 226, 135, 1)'}, // 默认渐变起点
                {offset: 0.33, color: 'rgba(10, 180, 230, 1)'}, // 默认渐变中点 1
                {offset: 0.66, color: 'rgba(0, 100, 200, 1)'}, // 默认渐变中点 2
                {offset: 1, color: 'rgba(0, 49, 144, 1)'},    // 默认渐变终点
              ]),
    },
  }));


  const pieOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b0}: {c0}万',
    },
    grid: {
      left: "16%",
      right: "15%",
      top: "20%",
      bottom: "20%",
    },
    xAxis: {
      type: 'category',
      name: '区县',
      nameTextStyle: {
        color: '#FFFFFF',
        fontSize: 9,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        margin: 6,
        textStyle: {
          color: '#FFFFFF',
          fontSize: 8,
        },
      },
      data: populationData.value.xAxisData,  // 使用动态的 x 轴数据
    },
    yAxis: {
      type: 'value',
      name: '人口（万）',
      nameTextStyle: {
        color: '#FFFFFF',
        fontSize: 9,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#FFFFFF',
        formatter: function (value) {
          return value + ' 万人';  // y轴显示万人单位
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255,255,255,0.5)',
          width: 1,
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '柱状图',
        type: 'pictorialBar',
        symbol: 'rect', // 使用矩形作为柱状图形
        barWidth: '50%', // 设置柱宽
        symbolRepeat: true, // 开启重复模式
        symbolMargin: 3, // 矩形之间的间隔
        symbolSize: ['100%', 8], // 每个矩形的宽度和高度
        data: barSeriesData, // 使用动态的 y 轴数据--动态颜色
        z: 5,
      },
      {
        name: '透明间隔',
        type: 'pictorialBar',
        barWidth: '50%',
        symbol: 'rect',
        symbolRepeat: true,
        symbolMargin: 3,
        symbolSize: ['100%', 8],
        itemStyle: {
          normal: {
            color: 'rgba(0, 0, 0, 0)', // 透明色
          },
        },
        data: populationData.value.seriesData, // 使用动态的 y 轴数据
        z: 4, // 透明部分放在渐变层之下
      },
    ],
  };

// 初始化并设置图表
  pieChartInstance.setOption(pieOption);
  pieChartInstance.resize(); // 调整大小

};

// 监听窗口大小变化
const resizeCharts = () => {
  if (lineChartInstance) lineChartInstance.resize();
  if (pieChartInstance) pieChartInstance.resize();
};


onMounted(() => {
  nextTick(() => {
    fetchDistrictEconomy(); // 调用卡片获取数据的方法
    handlePopulationData(); // 调用人口获取数据的方法
    economicData(); // 调用经济获取数据的方法
    initCharts(); // 确保 DOM 渲染后初始化图表


    window.addEventListener('resize', resizeCharts); // 监听窗口大小变化
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  if (lineChartInstance) lineChartInstance.dispose();
  if (pieChartInstance) pieChartInstance.dispose();
});
</script>

<style scoped>
.pop-new {
  position: absolute;
  top: 54.4%;
  height: 28%;
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
}

.pop_header {
  top: -2%;
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


.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.main {
  width: 100%;
  height: 100%;
  margin-top: -15px;
}


/*echars外边一层包裹*/
:deep(.el-carousel__container) {
  height: 236px;
  position: relative;
}

.chart-container {
  position: relative;
  top: 7.5% !important;
  width: 98%;
  height: 98%;
  min-height: 50px;
}

.text-content {
  text-align: center;
  color: #475669;
  line-height: 1.5;
}

/*卡片*/
/* 整体布局 */
.card-layout {
  position: relative;
  background-image: url("@/assets/images/CommandScreen/左下角卡片.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 82%;
  height: 105%;
  left: 6%;
}

/* 卡片列表 */
.card-list {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 顶部区域布局 */
.top-box {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 15%;
  width: 91%;
  left: 3.2%;
}

.card.top-left {
  flex: 1;
  text-align: left;
  margin-right: 3%;
}

.card.top-right {
  flex: 1;
  text-align: right;
  margin-left: 3%;
}

/* 中间浮动卡片 */
.card.center {
  position: absolute;
  top: 49%;
  left: 48.5%;
  transform: translate(-50%, -50%);
  width: 18%;
  height: 18%;
  border-radius: 50%; /* 圆形 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 底部区域布局 */
.bottom-box {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 16%;
  width: 91%;
  left: 3.2%;
}

.card.bottom-left {
  flex: 1;
  text-align: left;
  margin-right: 11%;
}

.card.bottom-right {
  flex: 1;
  text-align: right;
  margin-left: 3%;
}

/* 文本样式 */
.card .top-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* 文本样式 */
.card .bottom-title {
  font-size: 16px;
  color: #fff;
}

.card .top-value {
  font-size: 18px;
  font-weight: bold;
  margin-top: -7px;
  color: #fff;
}


.card .bottom-value {
  font-size: 11px;
  font-weight: bold;
  margin-top: -5px;
  color: rgba(255, 255, 255, 0.7);
}

.card .main-title {
  font-size: 15px;
  font-weight: bold;
  color: #fff;
}

.card .unit {
  font-size: 18px;
  color: #fff;
}


</style>
