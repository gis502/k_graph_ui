<template>
  <div ref="chart2" class="chart2"></div>
</template>

<script setup>
import { onMounted, ref, } from 'vue';
import * as echarts from 'echarts';
import {aftershockSum} from '/src/api/system/statistics.js'; // 确保路径正确

const chart2 = ref(null);
let myChart = null;

onMounted(() => {
  initChart();  // 初始化图表
  fetchAftershockData();  // 获取最新余震数据
});

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chart2.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '20%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff',
          fontSize: 14,
        },
        interval: 0,
      },
      data: ['3 - 3.9级', '4 - 4.9级', '5 - 5.9级']
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#fff',
        fontSize: 14,
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        }
      },
      minInterval: 1,
    },
    series: [
      {
        name: '余震数量',
        data: [0, 0, 0],  // 初始数据
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const colors = ['#2889ff', '#ffeb2f', '#ffa500'];
            return colors[params.dataIndex];
          }
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 16,
        },
      }
    ]
  };
  myChart.setOption(option);
};

// 获取最新余震数据
const fetchAftershockData = async () => {
  try {
    const res = await aftershockSum();
    updateChart(res); // 更新图表数据
  } catch (error) {
    console.error('获取余震数据失败:', error);
  }
};

// 更新图表数据
const updateChart = (res) => {
  console.log('图表更新数据:', res);  // 打印传递给图表的数据
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: [res.magnitude_3_0_to_3_9, res.magnitude_4_0_to_4_9, res.magnitude_5_0_to_5_9]
        }
      ]
    });
  }
};

</script>

<style scoped>
.chart2 {
  width: 100%;
  height: 100%;
}
</style>
