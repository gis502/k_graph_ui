<template>
  <div class="container">
    <el-carousel
        :initial-index="initialIndex"
        arrow="always"
        indicator-position="none"
        interval="0"
        @change="onCarouselChange"
    >
      <!-- 第1个 top and bottom carousel item -->
      <el-carousel-item>
        <div class="two">
           <span class="update-time1">
        更新时间：{{ lastTime }}</span>
          <div class="top">
            <div ref="chart" class="chart" style="width: 400px;height: 260px"></div>
          </div>
          <span class="update-time1">
          更新时间：{{ lastTime }}
          </span>
          <div class="bottom">
            <div ref="chart0" class="chart"></div>
          </div>
        </div>

      </el-carousel-item>

      <!-- 第2个 carousel item -->
      <el-carousel-item>
        <div class="main">
          <div ref="chart1" class="chart1"></div>
        </div>
      </el-carousel-item>

      <!-- 第3个 top and bottom carousel item -->
      <el-carousel-item>
        <div class="two">
           <span class="update-time1">
        更新时间：{{ lastTime }}
        </span>
        <div class="top">
              <div ref="chart31" class="chart"></div>
        </div>
          <span class="update-time1">
        更新时间：{{ lastTime }}
        </span>
          <div class="bottom">
            <div ref="chart32" class="chart"></div>
          </div>
        </div>

      </el-carousel-item>

      <!-- 第4个 carousel item -->
      <el-carousel-item>
        <div class="main">
          <div ref="chart2" class="chart1"></div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {defineProps, nextTick, onBeforeUnmount, onMounted, ref} from 'vue';
import {getEnsureWaterSupply} from "@/api/system/supplyWater.js";
import {getSupplySituationList} from "@/api/system/supplySituation.js";
import {getHousingSituationList} from "@/api/system/housingSituation.js";

const lastTime = ref(''); // 上传数量
const initialIndex = ref(0);
// 第1个 top and bottom carousel item
const chart = ref(null);
const chart0 = ref(null);
//  第4个 第2个 carousel item
const chart1 = ref(null);
const chart2 = ref(null);
// 第2个 top and bottom carousel item
const chart31 = ref(null);
const chart32 = ref(null);

let chartInstance = null;
let chartInstance0 = null;
let chartInstance1 = null;
let chartInstance2 = null;

let chartInstance31 = null;
let chartInstance32 = null;

// ---------------------------------------------------------------------------------
const props = defineProps({
  eqid: {
    type: String,
    required: true
  }
});

// 图表配置 只有一个echarts的
const getHousingSituationChartOptions = (yAxisDataArray, xAxisData) => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(17,95,182,0.5)',
    textStyle: {color: "#fff"},
    axisPointer: {type: 'shadow'},

  },
  title: {
    text: '房屋损毁情况',
    x: 'center',
    y: '0%',
    textStyle: {
      color: '#fff',
      fontSize: 20,
    },
  },
  legend: {
    data: ['目前受损(个)', '目前禁用(个)', '目前限用(个)', '目前可用(个)'],  // Y轴数据名称
    textStyle: {color: "rgba(255,255,255,0.9)"},
    itemWidth: 15,
    itemHeight: 10,
    itemGap: 15,
    top: '5%',
    maxRow: 2, // 最多显示两行
    icon: 'path://M961.3,130.5c-165.8-0.7-315.7,98.6-379.7,251.6c-64,153-29.4,329.4,87.6,447c117,117.5,293.3,152.9,446.6,89.6C1269,855.5,1369,706,1369.1,540.2C1369.3,314.6,1186.9,131.3,961.3,130.5L961.3,130.5zM961.3,740.5c-106.9,0-193.9-89.9-193.9-200.2c0-110.3,87-200.2,193.9-200.2c106.9,0,194,89.8,194,200.2S1068.1,740.5,961.3,740.5L961.3,740.5z M961.3,740.5'
  },
  grid: {
    top: '14%',
    left: '8%',
    right: '8%',
    bottom: '15%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'value',  // 现在是 X 轴变为数值轴
      axisLabel: {
        formatter: '{value}',
        textStyle: {color: 'rgba(255,255,255,0.8)', fontSize: 10},
      },
      splitLine: {lineStyle: {color: "#063374", type: "dashed"}},
    },
  ],
  yAxis: [
    {
      type: 'category',  // 现在是 Y 轴变为类目轴
      data: xAxisData,  // 原 X 轴的数据
      axisLabel: {textStyle: {color: 'rgb(255,255,255)', fontSize: 12, fontWeight: 'bold'}},
      axisLine: {lineStyle: {color: '#063374'}},
    },
  ],
  series: yAxisDataArray.map((yAxisData, index) => ({
    name: ['目前受损(个)', '目前禁用(个)', '目前限用(个)', '目前可用(个)'][index],  // 根据索引设置 Y 轴的名称
    type: 'bar',
    data: yAxisData,  // 动态设置 Y 轴的数据
    barWidth: 10,  // 柱子变小
    itemStyle: {
      color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
        {offset: 0, color: index === 0 ? '#FF5733' : index === 1 ? '#0291FF' : index === 2 ? '#FEC060' : '#00FFB4'},
        {offset: 1, color: 'rgba(255, 255, 255, 0.1)'},
      ]),
      barBorderRadius: [0, 30, 30, 0],
    },
  })),
});
// ----------------------------------------------------------------------------------------------

//  图表配置 一个item里面的两个echarts
const getChartOptions = (yAxisData, xAxisData, chartName) => {
  const commonOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
    },
    legend: {
      top: '10%',
      textStyle: {
        color: '#fff',
        // top: '10%'
      }
    },
    grid: {top: '25%', right: '3%', left: '5%', bottom: '15%'},
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        interval: 0,   // 确保所有文字都显示
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {color: '#fff'},
    },
  };

  // 根据不同的 chartName 返回不同的配置
  if (chartName === '集中供水工程受损统计') {
    return {
      ...commonOptions,
      title: {
        text: '集中供水工程受损统计',
        textStyle: {color: '#fff', fontSize: 20},
        x: 'center',
        top: '0%',   // 将标题稍微上移

      },

      series: [
        {
          name: '集中供水工程受损统计（处）',
          type: 'bar',
          data: yAxisData,
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgba(0,244,255,1)'},
              {offset: 1, color: 'rgba(0,77,167,1)'},
            ]),
            borderRadius: [10, 10, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
          },
        },
        {
          type: 'bar',
          // data: new Array(data.length).fill(8000),
          // barGap: '-100%',
          itemStyle: {color: 'rgba(0,255,255,.2)'},
        },
      ],
    };
  }

  if (chartName === '保障安置点供水统计') {
    return {
      ...commonOptions,
      title: {
        text: '保障安置点供水统计',
        textStyle: {color: '#fff', fontSize: 20},
        x: 'center',
        top: '0%',   // 将标题稍微上移
      },
      series: [
        {
          name: '保障安置点供水统计（处）',
          type: 'bar',
          data: yAxisData,
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgba(0,244,255,1)'},
              {offset: 1, color: 'rgba(0,77,167,1)'},
            ]),
            borderRadius: [10, 10, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
          },
        },
        {
          type: 'bar',
          // data: new Array(data.length).fill(8000),
          barGap: '-100%',
          itemStyle: {color: 'rgba(0,255,255,.2)'},
        },
      ],
    };
  }

  // 默认返回一个公共配置
  return commonOptions;
};

// --------------------------------------下面是后端获取数据--------------------------------------------------------------
// 获取集中供水工程受损统计
function formatDateTime(formattedTime) {
  // 创建一个 Date 对象
  const date = new Date(formattedTime.replace(/-/g, '/')); // 替换为 '/' 来确保兼容性

  // 获取年、月、日、小时、分钟、秒
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份是从 0 开始的，需加 1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // 格式化为所需的日期时间格式
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

function SupplySituationData() {
  getSupplySituationList(props.eqid)
      .then(res => {
        console.log("getSupplySituationList",res)
        const formattedTime = res[0].reportDeadline
        lastTime.value=formatDateTime(formattedTime)
        console.log("formattedTime",lastTime.value)
        if (!res || res.length === 0) {
          console.error("返回数据为空或未定义");
          return;
        }
        // 提取X轴和Y轴数据
        const xAxisData = res.map(item => item.earthquakeAreaName);
        const yAxisData31 = res.map(item => item.centralizedWaterProjectDamage);
        // 调用更新图表的方法
        updateCharts(xAxisData, yAxisData31, []);
      })
      .catch(error => {
        console.error("请求失败", error); // 如果请求失败，则打印错误
      });

};

// 获取保障安置点供水统计 后端获取数据
function waterSupplyData() {
  getEnsureWaterSupply(props.eqid)
      .then(res => {

        // 提取X轴和Y轴数据
        const xAxisData = res.map(item => item.earthquakeAreaName);
        const yAxisData32 = res.map(item => item.waterSupplyPoints);
        console.log()

        // 调用更新图表的函数
        updateCharts(xAxisData, [], yAxisData32);
      })
};


// 房屋损毁情况
// 获取保障安置点供水统计
function housingSituationData() {
  getHousingSituationList(props.eqid)
      .then(res => {
        // 动态获取 X 轴数据（affectedAreaName）和 Y 轴数据（四个字段）
        const xAxisData = res.map(item => item.affectedAreaName);  // X轴数据：所有的 affectedAreaName
        const yAxisDataDamaged = res.map(item => item.currentlyDamaged);  // Y轴数据：所有的 currentlyDamaged
        const yAxisDataDisabled = res.map(item => item.currentlyDisabled);  // Y轴数据：所有的 currentlyDisabled
        const yAxisDataRestricted = res.map(item => item.currentlyRestricted);  // Y轴数据：所有的 currentlyRestricted
        const yAxisDataAvailable = res.map(item => item.currentlyAvailable);  // Y轴数据：所有的 currentlyAvailable

        // 调用更新图表的方法
        updateHousingSituationCharts(
            [yAxisDataDamaged, yAxisDataDisabled, yAxisDataRestricted, yAxisDataAvailable],
            xAxisData
        );
      })
};


// --------------------------------------------------------------------------------------------------------

// 更新房屋损毁情况图表
function updateHousingSituationCharts(yAxisDataArray, xAxisData) {
  const option = getHousingSituationChartOptions(yAxisDataArray, xAxisData);
  if (chartInstance1) chartInstance1.setOption(option);
  if (chartInstance2) chartInstance2.setOption(option);
}

// 更新图表选项
function updateCharts(xAxisData, yAxisData31, yAxisData32) {
  console.log('1. xAxisData:', xAxisData);
  console.log('2. yAxisData31:', yAxisData31);
  console.log('3. yAxisData32:', yAxisData32);

  // 针对图表31生成配置
  const option31 = yAxisData31 && yAxisData31.length > 0 ? getChartOptions(yAxisData31, xAxisData, '集中供水工程受损统计') : null;
  const option32 = yAxisData32 && yAxisData32.length > 0 ? getChartOptions(yAxisData32, xAxisData, '保障安置点供水统计') : null;

  // 打印生成的 chart option
  console.log('4. 生成的 chart option31:', option31);
  console.log('5. 生成的 chart option32:', option32);

  // 检查图表实例是否存在并为每个实例设置不同的 option
  if (chartInstance31 && option31) {
    chartInstance31.setOption(option31);
  }

  if (chartInstance32 && option32) {
    chartInstance32.setOption(option32);
  }
  if (chartInstance && option31) {
    chartInstance.setOption(option31);
  }

  if (chartInstance0 && option32) {
    chartInstance0.setOption(option32);
  }

}

// 初始化图表
function initializeCharts() {

  if (chart.value) {
    chartInstance = echarts.init(chart.value);
    chartInstance.resize();  // 初始化后强制调整图表大小
  }
  if (chart0.value) {
    chartInstance0 = echarts.init(chart0.value);
    chartInstance0.resize();  // 初始化后强制调整图表大小

  }
  if (chart1.value) {
    chartInstance1 = echarts.init(chart1.value);
    chartInstance1.resize();  // 初始化后强制调整图表大小

  }
  if (chart2.value) {
    chartInstance2 = echarts.init(chart2.value);
    chartInstance2.resize();  // 初始化后强制调整图表大小

  }
  if (chart31.value) {
    chartInstance31 = echarts.init(chart31.value);
    chartInstance31.resize();  // 初始化后强制调整图表大小

  }
  if (chart32.value) {
    chartInstance32 = echarts.init(chart32.value);
    chartInstance32.resize();  // 初始化后强制调整图表大小

  }

}

// 监听窗口大小变化
const resizeCharts = () => {
  if (chartInstance1) chartInstance1.resize();  // 调整图表尺寸
  if (chartInstance2) chartInstance2.resize();  // 调整图表尺寸
  if (chartInstance) chartInstance.resize();
  if (chartInstance0) chartInstance0.resize();
  if (chartInstance31) chartInstance31.resize();
  if (chartInstance32) chartInstance32.resize();
};

// 确保容器尺寸计算完成后初始化 ECharts：
// 在图表初始化时，
// 可能需要延迟几毫秒（比如 300ms）来确保容器大小计算完成，
// 尤其是在 el-carousel 这种动态加载项的情况下。
// 初始化并绑定 resize 事件
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      initializeCharts();
      resizeCharts();  // 调整图表大小
      SupplySituationData();
      waterSupplyData();
      housingSituationData();
    }, 3000);
  })
})


// 清理工作，移除 resize 事件
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);  // 移除事件监听
  if (chartInstance1) chartInstance1.dispose(); // 销毁图表实例
  if (chartInstance2) chartInstance2.dispose(); // 销毁图表实例
});
</script>

<style scoped>
.update-time1 {
  padding-top: 1px;
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218, 45, 45) 3%, rgba(254, 254, 254, 0) 90%);
  display: inline-block;
  color: white;
}
.two[data-v-8077b996] {
  margin-left: 0%;
}

.container {
  margin: 0px;
  padding: 0px;
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  width: 57vh;
  height: 70vh; /* 设置总高度 */
}


:deep(.el-carousel__container) {
  display: flex;
  height: 76vh;
  position: relative;
}

:deep(.el-carousel__item) {
  display: inline-grid;
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
}


.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1%;
}

.two {
  display: flex;
  flex-direction: column;
  margin-top: -1%;
  margin-left: 12%;
  height: 70vh;
  width: 400px;
}

.top {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /*padding: 0 20px;*/
  /*background-color: #cacece;*/
}

.bottom {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /*background-color: #566473;*/
}

.chart {
  margin-left: 33px;
  width: 400px; /* 父容器宽度占据 100% */
  height: 30vh; /* 父容器高度占据 100% */
}
.chart1 {
  width: 400px;
  height: 80vh;
}
</style>
