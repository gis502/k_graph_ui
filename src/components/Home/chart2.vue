<template>
  <div ref="chart2" class="chart2"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { getAftershockMagnitude } from "@/api/system/statistics.js";

const chart2 = ref(null);
const props = defineProps(['lastEq']);
let myChart = null;

// 初始化图表
const initChart = () => {
  if (!chart2.value) return;

  myChart = echarts.init(chart2.value); // 初始化 ECharts
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
      data: ['3 - 3.9级', '4 - 4.9级', '5 - 5.9级', '6级及以上']
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
        data: [0, 0, 0, 0], // 初始数据，后续用实际数据替换
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const colors = ['#2889ff', '#ffeb2f', '#ffa500', '#ff2f2f'];
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
  myChart.setOption(option); // 设置初始图表配置
};

// 更新图表数据
const updateChart = (data) => {
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: [
            data.magnitude_3_0_to_3_9 || 0,
            data.magnitude_4_0_to_4_9 || 0,
            data.magnitude_5_0_to_5_9 || 0,
            0
          ],
        }
      ]
    });
  }
};

// 监听 eqid 的变化
watch(() => props.lastEq, async (newEqid) => {
  console.log('LastEq 内容:', props.lastEq);
  if (!newEqid) {
    console.warn('eqid is not available.'); // 如果没有 eqid，打印警告
    return;
  }
  try {
    // // 发起请求，将 eqid 传递到后端获取数据
    // const response = await getAftershockMagnitude(newEqid); // 确保该方法接受 eqid
    // console.log('Received data:', response); // 打印从后端接收到的数据
    //
    // // 更新图表数据
    // updateChart(response);
  } catch (error) {
    console.error('Failed to fetch aftershock data:', error);
  }
});


// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});
</script>

<style scoped>
.chart2 {
  width: 100%;
  height: 100%;
}
</style>
