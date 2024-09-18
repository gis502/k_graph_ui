<template>
  <div ref="chart2" class="chart2"></div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';

const chart2 = ref(null);
const props = defineProps(['lastEq']);

watch(() => props.lastEq, () => {
  initChart();
});

const initChart = () => {
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
          fontSize: 14,  // Adjust font size if needed
        },
        interval: 0,  // Ensure all labels are shown
      },
      data: ['3级以下', '3 - 4' +
      '.5级', '4.5 - 6级', '6级以上']
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#fff',
        fontSize: 14,  // Adjust font size for the unit label
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff'
        }
      },
      minInterval: 1,  // Ensure that each grid line is spaced by at least 1 unit
    },
    series: [
      {
        name: '余震数量',
        data: [
          0,  // 弱震 (< 3级)
          0,  // 有感地震 (3 - 4.5级)
          0,  // 中强震 (4.5 - 6级)
          0   // 强震 (≥ 6级)
        ],
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const colors = ['#2889ff', '#ffeb2f', '#ffa500', '#f81919'];
            return colors[params.dataIndex];
          }
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 16, // Increase font size for labels
        },
      }
    ]
  };
  myChart.setOption(option);
};

</script>

<style scoped>
.chart2 {
  width: 100%;
  height: 100%;
}
</style>
