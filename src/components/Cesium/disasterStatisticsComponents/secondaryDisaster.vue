<template>
  <div class="container">
    <el-carousel
        :interval="0" arrow="always" :initial-index="initialIndex"
        indicator-position="none"  @change="handleCarouselChange"
    >

      <!-- 第一页 -->
      <el-carousel-item>

        <div class="main" >
          <span>更新时间：{{ latestTime }}</span>
          <div ref="chart" class="chart"></div>
        </div>
      </el-carousel-item>

      <!-- 第二页 -->
      <el-carousel-item>
        <div class="two">
          <div class="top">
            <span>更新时间：{{ latestTime1 }}</span>
            <div ref="top_chart" class="top_chart"></div>
          </div>
          <div class="bottom">
            <span>更新时间：{{ latestTime2 }}</span>
            <div ref="bottom_chart" class="bottom_chart"></div>
          </div>
        </div>
      </el-carousel-item>

      <!-- 第一页复用 -->
      <el-carousel-item>

        <div class="main">
          <span>更新时间：{{ latestTime }}</span>
          <div ref="chart2" class="chart2"></div>
        </div>
      </el-carousel-item>

      <!-- 第二页复用 -->
      <el-carousel-item>
        <div class="two">
          <div class="top">
            <span>更新时间：{{ latestTime1 }}</span>
            <div ref="top_chart2" class="top_chart2"></div>
          </div>
          <div class="bottom">
            <span>更新时间：{{ latestTime2 }}</span>
            <div ref="bottom_chart2" class="bottom_chart2"></div>
          </div>
        </div>
      </el-carousel-item>

    </el-carousel>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {onMounted, ref, reactive, onBeforeUnmount, nextTick, watch, defineProps} from 'vue';
import {getRiskConstructionGeohazards} from "@/api/system/geologicalDisaster";  //第一页
import {getSecondaryDisaster} from "@/api/system/mountainFlood";  //山洪
import {useGlobalStore} from "@/store/index.js";
import {getBarrierlakeSituation} from "@/api/system/barrierlakeSituation.js";

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
const quakeAreaName = ref([]) // 地点

const top_chart = ref(null); // 图表 DOM 引用
let topChart = null; // 图表实例
const topAffectedArea = ref(["抱歉暂无数据"]); // 山洪危险区的地点
// const topThreatenedPopulation = ref([0]); // 山洪危险区受威胁群众人数
// const topHazardPoints = ref([0]); // 山洪危险区隐患点
// const topEvacuation = ref([0]); // 山洪危险区避险转移人数


const bottom_chart = ref(null); // 图表 DOM 引用
let bottomChart = null; // 图表实例
const bottomAffectedArea = ref(["抱歉暂无数据"]); // 堰塞湖的地点
// const bottomThreatenedPopulation = ref([0]); // 堰塞湖受威胁群众人数
// const bottomEvacuation = ref([0]); // 堰塞湖避险转移人数

//            ----------------------复用--------------------------------
const chart2 = ref(null); // 图表 DOM 引用
let Chart2 = null; // 图表实例

const top_chart2 = ref(null); // 图表 DOM 引用
let topChart2 = null; // 图表实例


const bottom_chart2 = ref(null); // 图表 DOM 引用
let bottomChart2 = null; // 图表实例


//----------------------------三个共用方法------------------------------------
const eqid = ref('');
const latestTime = ref('') // 时间
const latestTime1 = ref('') // 时间
const latestTime2 = ref('') // 时间
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

//地质灾害情况
const geologicalDisasterData = () => {
  getRiskConstructionGeohazards(props.eqid).then(res => {
    updateGeologicalDisaster(res)
  })
};

// 加载山洪危险区数据
const loadMountainFloodData = () => {
  getSecondaryDisaster(props.eqid).then(res => {
    updateMountainFloodData(res); // 更新山洪危险区数据
  });
};

// 加载堰塞湖数据
const loadBarrierLakeData = () => {
  getBarrierlakeSituation(props.eqid).then(res => { //store.globalEqId
    updateBarrierLakeData(res); // 更新堰塞湖数据
  });
};

//------------------------------------第一页数据-----------------------------------------

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getRiskConstructionGeohazards(eqid.value).then(res => {
    updateGeologicalDisaster(res)
  });
});

// 更新地质灾害情况数据
function updateGeologicalDisaster(data) {

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

  console.log('地质灾害统计数据：' ,data)
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    quakeAreaName.value = ['抱歉暂无数据'];
    chartData.series.forEach(series => series.data = [0]); // 将所有 series 的 data 设置为默认值
    latestTime.value = ['抱歉暂无数据'];
  } else {
    quakeAreaName.value = data.map(item => item.quakeAreaName || '无数据');
    chartData.series[0].data = data.map(item => item.existingRiskPoints || 0); //现有隐患点（个）
    chartData.series[1].data = data.map(item => item.newRiskPoints || 0); //新增隐患点（个）
    chartData.series[2].data = data.map(item => item.constructionPoints || 0); //正在施工点（个）
    chartData.series[3].data = data.map(item => item.infrastructureCheckpoints || 0);  //基础设施检查点（个）
    chartData.series[4].data = data.map(item => item.alarmCount || 0); //预警发布（次）
    chartData.series[5].data = data.map(item => item.evacuationCount || 0); //转移避险（人）
// 获取格式化后的所有时间
    latestTime.value = data.map(item => formatDate(item.reportDeadline) || '抱歉暂无数据');

// 打印地质灾害数据
    console.log('得到地质灾害数据：', data);

// 获取所有日期中最新的那个
    if (latestTime.value.length > 0) {
      latestTime.value = latestTime.value.reduce((latest, current) => {
        return new Date(current) > new Date(latest) ? current : latest;
      });
    }

// 格式化为中国时间格式
    latestTime.value = formatDateChina(latestTime.value);
  }

  // 使用 nextTick 确保 DOM 渲染后初始化
  nextTick(() => {
    initCharts(); // 第二页的图表初始化
  });


};

const chartData = reactive({
  series: [
    { name: '现有隐患点（个）', data: [] },
    { name: '新增隐患点（个）', data: [] },
    { name: '正在施工点（个）', data: [] },
    { name: '基础设施检查点（个）', data: [] },
    { name: '预警发布（次）', data: [] },
    { name: '转移避险（人）', data: [] },
  ],
});


//------------------------------------第一页——初始化echarts-----------------------------------------
const initCharts = () => {
  console.log('得到地质灾害情况数据：chartData',chartData)
  nextTick(() => {
    console.log("初始化第一页图表");
    Chart = echarts.init(chart.value);

    const option = {
      title: {
        text: '地质灾害情况',
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
        top: '5%', // 调整上方的空间
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
        top: '13.5%', // 调整上方的空间
        left: '8%',
        right: '10%',
        bottom: '1%',
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
        text: '地质灾害情况',
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
        top: '5%', // 调整上方的空间
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
        top: '13.5%', // 调整上方的空间
        left: '8%',
        right: '10%',
        bottom: '1%',
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
watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getSecondaryDisaster(eqid.value).then(res => {
    updateMountainFloodData(res)
  })
})

// 更新山洪危险区数据
const updateMountainFloodData = (data) => {

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

  console.log('开始山洪危险区数据：')
  if (data.length === 0) {
    topAffectedArea.value = ["抱歉暂无数据"];
    topData[0].data = [0];
    topData[1].data = [0];
    topData[2].data = [0];
    latestTime1.value = '';
  } else {
    console.log('dd得到山洪危险区数据：',data)
    topAffectedArea.value = data.map(item => item.affectedArea || "抱歉暂无数据");
    topData[0].data = data.map(item => item.threatenedPopulation || 0);  //受威胁群众人数
    topData[1].data = data.map(item => item.evacuation || 0);  //避险转移人数
    topData[2].data = data.map(item => item.hazardPoints || 0);  //隐患点数

    latestTime1.value = data.reduce((max, item) => {
      return new Date(formatDate(max)) > new Date(formatDate(item.reportingDeadline)) ? formatDate(max) : formatDate(item.reportingDeadline);
    }, formatDate(data[0].reportingDeadline));
    latestTime1.value = formatDateChina(latestTime1.value);

    console.log('得到山洪危险区数据：',data)
  }


  // 使用 nextTick 确保 DOM 渲染后初始化
  nextTick(() => {
    thumbnailCharts(); // 第二页的图表初始化
  });


}

const topData = reactive([
  { name: '受威胁群众人数', data: [] },
  { name: '避险转移人数', data: [] },
  { name: '隐患点数', data: [] },
]);



//-----------------------------------上下部分---分割线---------------------------------


watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getBarrierlakeSituation(eqid.value).then(res => {
    console.log("getBarrierlakeSituation",res)
    updateBarrierLakeData(res)
  })
})

  // 更新堰塞湖数据
  const updateBarrierLakeData = (data) => {

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

    console.log('堰塞湖雍塞体统计数据：',data)
    if (data.length === 0) {
      bottomAffectedArea.value = ["抱歉暂无数据"];
      bottomData[0].data  = [0];
      bottomData[1].data = [0];
      latestTime2.value = '';
    } else {
      bottomAffectedArea.value = data.map(item => item.affectedArea || "抱歉暂无数据");
      bottomData[0].data = data.map(item => item.threatenedPopulation || 0);  //受威胁群众人数
      bottomData[1].data = data.map(item => item.evacuation || 0);  //避险转移人数

      latestTime2.value = data.reduce((max, item) => {
        return new Date(formatDate(max)) > new Date(formatDate(item.reportingDeadline)) ? formatDate(max) : formatDate(item.reportingDeadline);
      }, formatDate(data[0].reportingDeadline));
      latestTime2.value = formatDateChina(latestTime2.value);
      console.log('得到堰塞湖雍塞体统计数据：',data)
    }


    // 使用 nextTick 确保 DOM 渲染后初始化
    nextTick(() => {
      thumbnailCharts(); // 第二页的图表初始化
    });
  };

const bottomData = reactive([
  {name: '受威胁群众人数',data: [] },
  {name: '避险转移人数',data: [] },
]);

// X轴固定地名
const xAxisData = ['雨城区', '名山区', '荥经县', '汉源县', '石棉县', '天全县', '芦山县', '宝兴县'];



//------------------------------------第二页——初始化echarts-----------------------------------------
// 第二页——初始化echarts
const thumbnailCharts = () => {
  // console.log('得到山洪危险区数据：topThreatenedPopulation',topThreatenedPopulation.value)
  console.log('得到山洪危险区数据：topData',topData)
  console.log('得到堰塞湖雍塞体统计数据：bottomData',bottomData)
  nextTick(() => {
    console.log("初始化第二页图表");
    // 初始化 topChart
    topChart = echarts.init(top_chart.value);


// 合并为三个独立的柱子
    const top_seriesData = topData.map((item, index) => ({
      name: item.name,
      type: 'bar',
      data: item.data, // 每个柱子单独一组数据
      barWidth: '20%', // 控制柱子的宽度
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: `rgba(${index * 60},244,255,1)`, // 动态颜色
                },
                {
                  offset: 1,
                  color: `rgba(${index * 60},77,167,1)`, // 动态颜色
                },
              ],
              false
          ),
          barBorderRadius: [10, 10, 0, 0], // 设置顶部圆角
        },
      },
    }));

// 配置项
    const topOption = {
      // backgroundColor: '#00265f',
      title: {
        text: '山洪危险区情况',
        x: 'center',
        y: '-1%',
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
          fontSize: 8, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: topData.map((item) => item.name), // 图例显示类别
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        textStyle: {
          color: '#e2e9ff',
        },
        top: '10%',
      },
      grid: {
        top: '22%',
        right: '8%',
        left: '13%',
        bottom: '12%',
      },
      xAxis: {
        type: 'category',
        data: xAxisData, // 分类字段直接为系列名称
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
        axisLabel: {
          color: '#e2e9ff',
          textStyle: {
            fontSize: 8,
          },
          rotate: 45, // 设置标签旋转角度为45°
          interval: 0, // 强制显示所有标签
        },
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}',
          color: '#e2e9ff',
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,1)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
      },
      series: top_seriesData,
    };

    topChart.setOption(topOption);

    setTimeout(() => {
      topChart.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小
// ---------------------------上下部分------------------------------------------
    // 初始化 bottomChart
    bottomChart = echarts.init(bottom_chart.value);

    // 生成柱状图的 series 配置
    const bottom_seriesData = bottomData.map((item, index) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barWidth: '20%', // 每个柱子的宽度
      barGap: '20%', // 设置柱子之间的间距（避免重叠）
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: `rgba(0,255,255,1)`, // 通过RGB设定渐变色的起始颜色
                },
                {
                  offset: 1,
                  color: `rgba(0,100,255,1)`, // 结束颜色
                },
              ],
              false
          ),
          barBorderRadius: [10, 10, 0, 0], // 圆角效果
        },
      },
    }));

    // // 添加背景系列（固定样式）
    // bottom_seriesData.unshift({
    //   name: '背景',
    //   type: 'bar',
    //   barWidth: '20%', // 背景柱子的宽度
    //   barGap: '-100%', // 确保背景在数据柱下方
    //   data: Array(bottomData[0].data.length).fill(8000), // 背景条的高度，填充一个足够大的值
    //   z: -1, // 使背景柱位于数据柱下方
    //   itemStyle: {
    //     normal: {
    //       color: 'rgba(0,255,255,.2)', // 背景颜色的透明度
    //       barBorderRadius: [10, 10, 0, 0], // 背景的圆角样式与数据柱一致
    //     },
    //   },
    // });


    const bottomOption = {
      // backgroundColor: '#00265f',
      title: {
        text: '堰塞湖雍塞体统计',
        x: 'center',
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
          fontSize: 8, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: bottomData.map((item) => item.name), // 图例显示类别
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        textStyle: {
          color: '#e2e9ff',
        },
        top: '10%',
      },
      grid: {
        top: '22%',
        right: '8%',
        left: '13%',
        bottom: '12%',
      },
      xAxis: {
        type: 'category',
        data: xAxisData, // X轴为地名
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
        axisLabel: {
          color: '#e2e9ff',
          textStyle: {
            fontSize: 8,
          },
          rotate: 45, // 设置标签旋转角度为45°
          interval: 0, // 强制显示所有标签
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '#e2e9ff',
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
      },
      series: bottom_seriesData,
    };

    bottomChart.setOption(bottomOption);

    setTimeout(() => {
      bottomChart.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小

    console.log("top_chart.value", top_chart.value);
    console.log("bottom_chart.value", bottom_chart.value);

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (topChart) topChart.resize();
      if (bottomChart) bottomChart.resize();
    });

    //-----------------------复用----------------------------------
    // 初始化 topChart
    topChart2 = echarts.init(top_chart2.value);

    // 配置项
    const topOption2 = {
      // backgroundColor: '#00265f',
      title: {
        text: '山洪危险区情况',
        x: 'center',
        y: '-1%',
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
          fontSize: 8, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: topData.map((item) => item.name), // 图例显示类别
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        textStyle: {
          color: '#e2e9ff',
        },
        top: '10%',
      },
      grid: {
        top: '22%',
        right: '8%',
        left: '13%',
        bottom: '12%',
      },
      xAxis: {
        type: 'category',
        data: xAxisData, // 分类字段直接为系列名称
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
        axisLabel: {
          color: '#e2e9ff',
          textStyle: {
            fontSize: 8,
          },
          rotate: 45, // 设置标签旋转角度为45°
          interval: 0, // 强制显示所有标签
        },
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}',
          color: '#e2e9ff',
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,1)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
      },
      series: top_seriesData,
    };

    topChart2.setOption(topOption2);

    // 初始化 bottomChart
    bottomChart2 = echarts.init(bottom_chart2.value);

    const bottomOption2 = {
      // backgroundColor: '#00265f',
      title: {
        text: '堰塞湖雍塞体统计',
        x: 'center',
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
          fontSize: 8, // 调小字体大小
        },
        axisPointer: {type: 'shadow'},
      },
      legend: {
        data: bottomData.map((item) => item.name), // 图例显示类别
        itemWidth: 20, // 每个图例项的宽度
        itemHeight: 10, // 每个图例项的高度
        textStyle: {
          color: '#e2e9ff',
        },
        top: '10%',
      },
      grid: {
        top: '22%',
        right: '8%',
        left: '13%',
        bottom: '12%',
      },
      xAxis: {
        type: 'category',
        data: xAxisData, // X轴为地名
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
        axisLabel: {
          color: '#e2e9ff',
          textStyle: {
            fontSize: 8,
          },
          rotate: 45, // 设置标签旋转角度为45°
          interval: 0, // 强制显示所有标签
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '#e2e9ff',
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
      },
      series: bottom_seriesData,
    };

    bottomChart2.setOption(bottomOption2);

    setTimeout(() => {
      topChart2.resize();
      bottomChart2.resize();
    }, 2000); // 延迟 500 毫秒调整图表大小

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (topChart2) topChart2.resize();
      if (bottomChart2) bottomChart2.resize();
    });

  });
};

// ----------------监听窗口大小变化-------------------------------------------------
const resizeCharts = () => {
  if (Chart) Chart.resize();
  if (topChart) topChart.resize();
  if (bottomChart) bottomChart.resize();
  // -------------------复用--------------------------
  if (Chart2) Chart2.resize();
  if (topChart2) topChart2.resize();
  if (bottomChart2) bottomChart2.resize();
};

const handleCarouselChange = (index) => {
  console.log("切换到第", index, "页");
  if (Chart) Chart.resize();
  if (topChart) topChart.resize();
  if (bottomChart) bottomChart.resize();
  // -------------------复用--------------------------
  if (Chart2) Chart2.resize();
  if (topChart2) topChart2.resize();
  if (bottomChart2) bottomChart2.resize();
};

window.addEventListener('resize', () => {
  if (Chart) {
    Chart.resize();
  }
});

//----------------------------------------------------------------------------

// 初始化图表
onMounted(() => {
  console.log("组件已挂载");

  //第一页
  geologicalDisasterData();

  // 确保数据加载完成后再初始化图表
  loadMountainFloodData();
  loadBarrierLakeData();

  console.log("topData", topData);
  console.log("bottomData", bottomData);


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
  if (bottomChart) bottomChart.dispose();
  // -------------------复用--------------------------
  if (Chart2) Chart2.dispose();
  if (topChart2) topChart2.dispose();
  if (bottomChart2) bottomChart2.dispose();
})
//--------------------------------------------------------------------------------

</script>

<style scoped>
span {
  display: block;
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218, 45, 45) 3%, rgba(254, 254, 254, 0) 90%);
  width: 100%; /* 让span占满一行 */
  text-align: left; /* 可以根据需求调整文本的对齐方式 */
  margin-bottom: 10px; /* 为了给图表留一些间距 */
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


.two {
  display: flex;
  flex-direction: column; /* 垂直排列 .top 和 .bottom */
  flex-direction: column;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: column; /* 确保里面的元素垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: flex-start; /* 从上方开始排列 */
  width: 100%; /* 宽度占满 */
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: column; /* 确保里面的元素垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: flex-start; /* 从上方开始排列 */
  width: 100%; /* 宽度占满 */
}

.chart {
  width: 380px;
  height: 506px;
  margin-right: 8%;
}

.top_chart {
  width: 90%;
  height: 230px;
}

.bottom_chart {
  width: 90%;
  height: 228px;
}

.chart2 {
  width: 380px;
  height: 506px;
  margin-right: 8%;
}

.top_chart2 {
  width: 90%;
  height: 230px;
}

.bottom_chart2 {
  width: 90%;
  height: 228px;
}
</style>
