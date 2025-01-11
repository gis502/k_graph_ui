<template>
  <div class="container">
    <span>更新时间：{{ latestTime }}</span>
    <el-carousel
        :interval="0" arrow="always" :initial-index="initialIndex"
        indicator-position="none"  @change="handleCarouselChange"
    >

      <!-- 第一页 -->
      <el-carousel-item>
        <div class="main">
          <div ref="chart" class="chart"></div>
        </div>
      </el-carousel-item>

      <!-- 第二页 -->
      <el-carousel-item>
          <div class="top">
            <div ref="top_chart" class="top_chart"></div>
          </div>
      </el-carousel-item>

      <!-- 第一页复用 -->
      <el-carousel-item>
        <div class="main">
          <div ref="chart2" class="chart2"></div>
        </div>
      </el-carousel-item>

      <!-- 第二页复用 -->
      <el-carousel-item>
        <div class="top">
          <div ref="top_chart2" class="top_chart2"></div>
        </div>
      </el-carousel-item>

    </el-carousel>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {onMounted, ref, reactive, onBeforeUnmount, nextTick, watch, defineProps} from 'vue';
import { getPublicOpinion} from "@/api/system/publicOpinion"; //第一页 宣传舆论情况
import {getSocialOrder} from "@/api/system/socialOrder"; //第二页
import {useGlobalStore} from "@/store/index.js";


const props = defineProps({
  eqid:{
    type: String,
    required: true
  },

});


//----------------------------轮播图，echars实例-------------------------------------------------

const initialIndex = ref(0); // 轮播图初始页索引

const chart = ref(null); // 图表 DOM 引用
let Chart = null; // 图表实例
const earthquakeZoneName = ref([]) // 地点

const top_chart = ref(null); // 图表 DOM 引用
let topChart = null; // 图表实例
const topEarthquakeAreaName = ref(["抱歉暂无数据"]) //地点
const policeForce = ref([0]) // 投入警力
const reportedRescueInfo = ref([0]) // 接报救助信息


//            ----------------------复用--------------------------------
const chart2 = ref(null); // 图表 DOM 引用
let Chart2 = null; // 图表实例

const top_chart2 = ref(null); // 图表 DOM 引用
let topChart2 = null; // 图表实例




//----------------------------三个共用方法------------------------------------
const eqid = ref('');
const latestTime = ref('') // 时间
const store = useGlobalStore()

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) return '无效日期'; // 检查日期有效性

  const pad = (num) => (num < 10 ? '0' + num : num); // 补零函数

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 月份从 0 开始
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//加载宣传舆论情况数据
const PublicOpinionData = () => {
  getPublicOpinion(store.globalEqId).then(res => {
    updatePublicOpinion(res)
  })
};

// 加载社会秩序情况数据
const SocialOrder = () => {
  getSocialOrder(props.eqid).then(res => {
    updateSocialOrder(res); // 更新社会秩序情况
  });
};


//------------------------------------第一页数据-----------------------------------------


const formatDateChina = (dateStr) => {
  if (dateStr) {
    const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  }
};

// 更新舆论情况数据
function updatePublicOpinion(data) {
  console.log('宣传舆论情况数据：' ,data)
  // 如果返回的数组为空，设置默认值
    // 如果返回的数组为空，设置默认值
    if (data.length === 0) {
      earthquakeZoneName.value = ['抱歉暂无数据'];
      // 为 chartData.series 中的每个数据字段设置默认值
      chartData.series.forEach(item => {
        item.data = [0];
      });
      latestTime.value = ['抱歉暂无数据'];
    }

    else {
      earthquakeZoneName.value = data.map(item => item.earthquakeZoneName || '无数据');
      chartData.series[0].data = data.map(item => item.publicityReport || 0); // 宣传报道
      chartData.series[1].data = data.map(item => item.provincialMediaReport || 0); // 中省主要媒体报道
      chartData.series[2].data = data.map(item => item.publicOpinionRiskWarning || 0); // 舆论风情提示
      chartData.series[3].data = data.map(item => item.pressConference || 0); // 发布会
      chartData.series[4].data = data.map(item => item.negativeOpinionDisposal || 0); // 处置负面舆论
      latestTime.value = data
          .map(item => formatDate(item.submissionDeadline) || '抱歉暂无数据') // 获取所有时间
          .reduce((latest, current) => {
            // 如果 current 不为空且比 latest 大，就更新 latest
            return current !== '抱歉暂无数据' && new Date(current) > new Date(latest) ? current : latest;
          }, '抱歉暂无数据'); // 初始值为'抱歉暂无数据'

// 如果最新时间不是'抱歉暂无数据'，格式化为中国时间格式
      if (latestTime.value !== '抱歉暂无数据') {
        latestTime.value = formatDateChina(latestTime.value);
      }
    }
    // 使用 nextTick 确保 DOM 渲染后初始化
    nextTick(() => {
      initCharts(); // 第二页的图表初始化
    });
};

const chartData = reactive({
  series: [
    { name: '宣传报道（篇）', data: [] },
    { name: '中省主要媒体报道（篇）', data: [] },
    { name: '舆论风情提示（条）', data: [] },
    { name: '发布会（场）', data: [] },
    { name: '处置负面舆论（条）', data: [] },
  ],
});


//------------------------------------第一页——初始化echarts-----------------------------------------
const initCharts = () => {
  console.log('得到宣传舆论情况数据：chartData',chartData)
  nextTick(() => {
    console.log("初始化第一页图表");
    Chart = echarts.init(chart.value);

    const option = {
      title: {
        text: '宣传舆论情况',
        top:'8',
        x: 'center',
        y: '0%',
        textStyle: {
          color: '#fff',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,95,182,0.5)',
        textStyle: {
          color: "#fff",
          fontSize: 11, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: chartData.series.map(item => item.name),
        align: 'left',
        left: 'center', // 水平居中
        top: '7%', // 调整上方的空间
        orient: 'horizontal', // 水平排列
        textStyle: {color: "rgba(255,255,255,0.9)", fontSize: 9}, //图例文本的样式
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        itemGap: 15, // 图例项之间的间距
        fontSize: 12,
        // 设置每行最多显示3个图例
        pageButtonItemGap: 10,
        pageButtonPosition: 'end',
        maxRow: 2, // 最多显示两行
      },
      grid: {
        top: '17.5%', // 调整上方的空间
        left: '10%',
        right: '10%',
        bottom: '0%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value}',
            textStyle: {color: 'rgba(255,255,255,0.8)', fontSize: 10},
          },
          splitLine: {lineStyle: {color: "#063374", type: "dashed"}},
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: ['宝兴县', '芦山县', '天全县', '石棉县', '汉源县', '荥经县', '名山区', '雨城区'],
          axisLabel: {textStyle: {color: 'rgb(255,255,255)', fontSize: 11, fontWeight: 'bold'}},
        },
      ],
      series: chartData.series.map((item, index) => ({
        name: item.name,
        type: 'bar',
        data: item.data,
        barWidth: 6,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            {
              offset: 0, color: index === 0 ? '#00FFB4' :
                  index === 1 ? '#0291FF' :
                      index === 2 ? '#FEC060' :
                          index === 3 ? '#FF8A29' :
                              index === 4 ? '#F07F5C' : '#7D6A93'
            },
            {offset: 1, color: 'rgba(255, 255, 255, 0.1)'},
          ]),
          barBorderRadius: [0, 30, 30, 0],
        },
      })),
    };

    Chart.setOption(option);

    setTimeout(() => {
      Chart.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小

    // 响应窗口大小变化
    window.addEventListener('resize', () => Chart.resize());

    // -----------------------------------复用--------------------------------------

    Chart2 = echarts.init(chart2.value);

    const option2 = {
      title: {
        text: '宣传舆论情况',
        top:'8',
        x: 'center',
        y: '0%',
        textStyle: {
          color: '#fff',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,95,182,0.5)',
        textStyle: {
          color: "#fff",
          fontSize: 11, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: chartData.series.map(item => item.name),
        align: 'left',
        left: 'center', // 水平居中
        top: '7%', // 调整上方的空间
        orient: 'horizontal', // 水平排列
        textStyle: {color: "rgba(255,255,255,0.9)", fontSize: 9}, //图例文本的样式
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        itemGap: 15, // 图例项之间的间距
        fontSize: 12,
        // 设置每行最多显示3个图例
        pageButtonItemGap: 10,
        pageButtonPosition: 'end',
        maxRow: 2, // 最多显示两行
      },
      grid: {
        top: '17.5%', // 调整上方的空间
        left: '10%',
        right: '10%',
        bottom: '0%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value}',
            textStyle: {color: 'rgba(255,255,255,0.8)', fontSize: 10},
          },
          splitLine: {lineStyle: {color: "#063374", type: "dashed"}},
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: ['宝兴县', '芦山县', '天全县', '石棉县', '汉源县', '荥经县', '名山区', '雨城区'],
          axisLabel: {textStyle: {color: 'rgb(255,255,255)', fontSize: 11, fontWeight: 'bold'}},
        },
      ],
      series: chartData.series.map((item, index) => ({
        name: item.name,
        type: 'bar',
        data: item.data,
        barWidth: 6,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            {
              offset: 0, color: index === 0 ? '#00FFB4' :
                  index === 1 ? '#0291FF' :
                      index === 2 ? '#FEC060' :
                          index === 3 ? '#FF8A29' :
                              index === 4 ? '#F07F5C' : '#7D6A93'
            },
            {offset: 1, color: 'rgba(255, 255, 255, 0.1)'},
          ]),
          barBorderRadius: [0, 30, 30, 0],
        },
      })),
    };

    Chart2.setOption(option2);

    setTimeout(() => {
      Chart2.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小
    // 响应窗口大小变化
    window.addEventListener('resize', () => Chart2.resize());

  });
}


//------------------------------------第二页数据--------------------------------------------------------

// 更新社会秩序情况数据
const updateSocialOrder = (data) => {

// 格式化时间
  const formatDateChina = (dateStr) => {
    if (dateStr) {
      const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
      const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }
  };

  console.log('开始社会秩序情况数据：')
  if(data.length === 0){
    topEarthquakeAreaName.value = ["抱歉暂无数据"]
    policeForce.value = [0];
    reportedRescueInfo.value  = [0];
    latestTime.value = ''
  }else {
    topEarthquakeAreaName.value = data.map(item => item.earthquakeAreaName || "抱歉暂无数据")
    policeForce.value = data.map(item => item.policeForce || 0)
    reportedRescueInfo.value  = data.map(item => item.reportedRescueInfo || 0)
    latestTime.value = data.reduce((max, item) => {
      return new Date(formatDate(max)) > new Date(formatDate(item.reportingDeadline)) ? formatDate(max) : formatDate(item.reportingDeadline);
    }, formatDate(data[0].reportingDeadline)); // 确保初始值

    latestTime.value = formatDateChina(latestTime.value)
  }

  // 使用 nextTick 确保 DOM 渲染后初始化
  nextTick(() => {
    thumbnailCharts(); // 第二页的图表初始化
  });


}

//------------------------------------第二页——初始化echarts-----------------------------------------

// 第二页——初始化echarts
const thumbnailCharts = () => {
  console.log('得到社会秩序情况数据：reportedRescueInfo',reportedRescueInfo.value)

// X轴固定地名
  const xAxisData = ['宝兴县', '芦山县', '天全县', '石棉县', '汉源县', '荥经县', '名山区', '雨城区']


  nextTick(() => {
    console.log("初始化第二页图表");
    // 初始化 topChart
    topChart = echarts.init(top_chart.value);

    console.log('调用 API 参数 eqid：', props.eqid);


// 配置项
    const topOption = {
      tooltip: {
        show: true,
      },
      title: {
        text: '社会秩序情况',
        textStyle: {
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: '16',
        },
        left: 'center',
        top: '4%',
      },
      legend: {
        show: true,
        top: '10%',
        textStyle: {
          color: '#CDD7D7'
        },
        data: ['投入警力（人）', '接收救助信息（起）']
      },
      grid: [
        // 左边柱子
        {
          show: false,
          left: '10%',
          top: '16%',
          bottom: '20',
          containLabel: true,
          width: '33%'
        },
        // 中间
        {
          show: false,
          left: '51.5%',
          top: '16%',
          bottom: '20',
          width: '0%'
        },
        // 右边柱子
        {
          show: false,
          right: '10%',
          top: '16%',
          bottom: '20',
          containLabel: true,
          width: '33%'
        }
      ],
      xAxis: [
        {
          type: 'value',
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          gridIndex: 1,
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          gridIndex: 2,
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'category',
          inverse: true,
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: xAxisData,
        },
        {
          gridIndex: 1,
          type: 'category',
          inverse: true,
          position: 'center',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: true, align: 'center', color: '#CDD7D7', fontSize: 14 },
          data: xAxisData,
        },
        {
          gridIndex: 2,
          type: 'category',
          inverse: true,
          position: 'left',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: xAxisData,
        },
      ],
      series: [
        {
          name: '投入警力（人）',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          barWidth: 15,
          showBackground: true,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3A6ECD' },
              { offset: 1, color: '#4BE6E6' },
            ]),
          },
          label: {
            show: true,
            position: 'left',
            color: '#4BE6E6'
          },
          data: policeForce.value,
        },
        {
          name: '接收救助信息（起）',
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          barWidth: 15,
          showBackground: true,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [      { offset: 0, color: '#F9DD46' },
              { offset: 1, color: '#F29740' },
            ])
          },
          label: {
            show: true,
            position: 'right',
            color: '#F29740'
          },
          data:  reportedRescueInfo.value,
        }
      ]
    };

    topChart.setOption(topOption);

    setTimeout(() => {
      topChart.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小


    console.log("top_chart.value", top_chart.value);

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (topChart) topChart.resize();

    });

    //-----------------------复用----------------------------------
    // 初始化 topChart
    topChart2 = echarts.init(top_chart2.value);

// 配置项
    const topOption2 = {
      tooltip: {
        show: true,
      },
      title: {
        text: '社会秩序情况',
        textStyle: {
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: '16',
        },
        left: 'center',
        top: '4%',
      },
      legend: {
        show: true,
        top: '10%',
        textStyle: {
          color: '#CDD7D7'
        },
        data: ['投入警力（人）', '接收救助信息（起）']
      },
      grid: [
        // 左边柱子
        {
          show: false,
          left: '10%',
          top: '16%',
          bottom: '20',
          containLabel: true,
          width: '33%'
        },
        // 中间
        {
          show: false,
          left: '51.5%',
          top: '16%',
          bottom: '20',
          width: '0%'
        },
        // 右边柱子
        {
          show: false,
          right: '10%',
          top: '16%',
          bottom: '20',
          containLabel: true,
          width: '33%'
        }
      ],
      xAxis: [
        {
          type: 'value',
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          gridIndex: 1,
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          gridIndex: 2,
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'category',
          inverse: true,
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: xAxisData,
        },
        {
          gridIndex: 1,
          type: 'category',
          inverse: true,
          position: 'center',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: true, align: 'center', color: '#CDD7D7', fontSize: 14 },
          data: xAxisData,
        },
        {
          gridIndex: 2,
          type: 'category',
          inverse: true,
          position: 'left',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: xAxisData,
        },
      ],
      series: [
        {
          name: '投入警力（人）',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          barWidth: 15,
          showBackground: true,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3A6ECD' },
              { offset: 1, color: '#4BE6E6' },
            ]),
          },
          label: {
            show: true,
            position: 'left',
            color: '#4BE6E6'
          },
          data: policeForce.value,
        },
        {
          name: '接收救助信息（起）',
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          barWidth: 15,
          showBackground: true,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [      { offset: 0, color: '#F9DD46' },
              { offset: 1, color: '#F29740' },
            ])
          },
          label: {
            show: true,
            position: 'right',
            color: '#F29740'
          },
          data:  reportedRescueInfo.value,
        }
      ]
    };

    topChart2.setOption(topOption2);



    setTimeout(() => {
      topChart2.resize();

    }, 2000); // 延迟 500 毫秒调整图表大小

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (topChart2) topChart2.resize();

    });

  });
};

// ----------------监听窗口大小变化-------------------------------------------------
const resizeCharts = () => {
  if (Chart) Chart.resize();
  if (topChart) topChart.resize();

  // -------------------复用--------------------------
  if (Chart2) Chart2.resize();
  if (topChart2) topChart2.resize();

};

const handleCarouselChange = (index) => {
  console.log("切换到第", index, "页");
  if (Chart) Chart.resize();
  if (topChart) topChart.resize();

  // -------------------复用--------------------------
  if (Chart2) Chart2.resize();
  if (topChart2) topChart2.resize();

};

window.addEventListener('resize', () => {
  if (Chart) {
    Chart.resize();
  }
});

//----------------------------------------------------------------------------

// 初始化图表
onMounted(() => {
  console.log("组件已挂载222111");
  console.log('调用 API 参数 eqid：', props.eqid);
  //第一页
  PublicOpinionData();
  //第二页
  SocialOrder();


  // 使用 nextTick 确保 DOM 渲染后初始化
  nextTick(() => {
    initCharts();  // 确保第一页的图表初始化
    thumbnailCharts(); // 第二页的图表初始化
  });
});


// 销毁前清理事件和实例
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  if (Chart) Chart.dispose();
  if (topChart) topChart.dispose();

  // -------------------复用--------------------------
  if (Chart2) Chart2.dispose();
  if (topChart2) topChart2.dispose();

})
//--------------------------------------------------------------------------------

</script>

<style scoped>

span{
  display: block;
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%);
}

.container {
  margin-top: -4%;
  margin-left: -4%;
  display: flex;
  flex-direction: column;
  height: 73vh;
  width: 100%;
}
/*轮播图左边按钮位置*/
:deep(.el-carousel__arrow--left) {
  left: -2px;
}

/*轮播图的大小*/
:deep(.el-carousel__container) {
  display: flex;
  height: 70vh;
  position: relative;
}

/*轮播图每页的宽度大小*/
:deep(.el-carousel--horizontal, .el-carousel--vertical) {
  overflow: hidden;
  width: 107%;
}

/*里面每一页显示的大小*/
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
  display: flex;
  flex-direction: column; /* 让子元素垂直排列 */
  justify-content: flex-start; /* 从顶部开始排列 */
  align-items: center; /* 水平居中 */
  height: 100%; /* 确保容器高度占满 */
}

.top {
  display: flex;
  flex-direction: column; /* 让子元素垂直排列 */
  justify-content: flex-start; /* 从顶部开始排列 */
  align-items: center; /* 水平居中 */
  height: 100%; /* 确保容器高度占满 */
}



.chart {
  width: 380px;
  height: 506px;
  margin-right: 8%;
}

.top_chart {
  width: 95%;
  height: 506px;
  margin-right: 8%;
}



.chart2 {
  width: 380px;
  height: 506px;
  margin-right: 8%;
}

.top_chart2 {
  width: 95%;
  height: 506px;
  margin-right: 8%;
}


</style>
