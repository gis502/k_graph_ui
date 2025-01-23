<template>
  <div class="chart-container">
           <span
               style="position: absolute;    font-weight: bold; padding-left: 0px;margin-top: 0px; margin-left: 3%; font-size: 14px; color: #fff;">
                  {{ year }}年各区县经济情况
                </span>
    <div ref="lineChart" class="chart"></div>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, nextTick, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {getDistrictEconomy} from "@/api/system/districtEconomy.js";

const lineChart = ref(null);
let lineChartInstance = null;

const props = defineProps({
  centerPoint: String
});
watch(() => props.centerPoint, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    initChart();
  }
});
//经济折线图数据
// 接收卡片信息并根据年份动态获取数据
//经济折线图数据
const year = ref('')
const datas = ref({
  districtEconomy: [], // 经济
  countyDistrict: [], //区县
  growthRate: [], // 同比增长率
});
const economicData = async () => {
  // const currentYear = props.eqyear || new Date().getFullYear(); // 如果没有传递年份，默认使用当前年份
  try {
    // 调用接口获取数据
    const response = await getDistrictEconomy();
    year.value = response[0].year || '2020'
    console.log(`年份 ${response[0].year} 获取的区县经济数据：`, response);
    const districtEconomy = response.map(item => item.districtEconomy || '暂无数据');
    const countyDistrict = response.map(item => item.countyDistrict || '未知区县');
    const growthRate = response.map(item => {
      const rate = item.growthRate || '未知区县';
      return rate === '未知区县' ? rate : rate.replace('%', '').trim();
    });


    datas.value.districtEconomy = districtEconomy; // 响应式更新
    datas.value.countyDistrict = countyDistrict; // 响应式更新
    datas.value.growthRate = growthRate; // 响应式更新

    console.log("提取后的经济数据:", datas.value);
    initChart();
  } catch (error) {
    console.error(`获取区县经济数据失败:`, error);
  }
};

const initChart = () => {
  if (lineChart.value) {
    lineChartInstance = echarts.init(lineChart.value, {width: '250px', height: '130px'});
    const selectedIndex = datas.value.countyDistrict.findIndex(item => item === props.centerPoint.earthquakeName.slice(-3));
    const barData = datas.value.districtEconomy.map((value, index) => {
      if (index === selectedIndex) {
        return {
          value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgb(255,138,94)'},
              {offset: 1, color: 'rgb(138,35,11)'},
            ]),
          },
        };
      } else {
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

    const lineOption = {
      tooltip: {
        trigger: "item",
        formatter: function (params) {
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
        data: datas.value.countyDistrict,
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
            formatter: '{value}%',
          },
        },
      ],
      legend: {
        orient: 'horizontal', // 设置图例为水平布局
        left: '18%', // 设置图例左边距为容器的5%
        top: "4%",
        textStyle: {
          color: "#A1D5FF",
          fontSize: 12,
        },
        itemGap: 8,
      },
      series: [
        {
          name: "同比增长率",
          z: 9,
          yAxisIndex: 1,
          type: "line",
          data: datas.value.growthRate,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: {
            width: 3,
            color: "#ffbb00",
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: '#12B9DB'},
              {offset: 1, color: '#6F8EF2'},
            ]),
          },
        },
        {
          name: "地区生产总值（GDP）",
          type: "bar",
          barWidth: 22,
          barGap: "-50%",
          data: barData,
        },
      ],
    };

    lineChartInstance.setOption(lineOption);
    lineChartInstance.resize();
  }
};

onMounted(() => {
  nextTick(() => {
    economicData()
  });
});

onBeforeUnmount(() => {
  if (lineChartInstance) lineChartInstance.dispose();
});
</script>

<style scoped>
.chart-container {
  position: relative;
  top: 7% !important;
  width: 98%;
  height: 98%;
  min-height: 50px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>