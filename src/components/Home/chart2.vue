<template>
  <div ref="chart2" class="chart2"></div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import {aftershockSum} from "@/api/system/statistics.js";

const chart2 = ref(null);
const props = defineProps(['lastEq']);

watch(() => props.lastEq, () => {
  initChart();
});

const initChart = async () => {
  try {
    const res = await aftershockSum(); // 从 API 获取数据

    const data = res; // 后端返回数据
    console.log(res)
    // x轴 匹配数据
    const chartData = [data.magnitude3to39, data.magnitude4to49, data.magnitude5to59];

    const myChart = echarts.init(chart2.value);
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
        data: ['3 - 3.9级', '4 - 4.9级 ', '5 - 5.9级']
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
          data: chartData, // 使用转换后的数据数组
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
            fontSize: 16, // 增大标签字体大小
          },
        }
      ]
    };
    myChart.setOption(option);
  } catch (error) {
    console.error('Error loading chart data:', error);
  }
};

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
