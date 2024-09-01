<template>
  <div ref="chart3" class="chart3"></div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import * as echarts from 'echarts';

const chart3 = ref(null);

const initChart = () => {
  const myChart = echarts.init(chart3.value);

  const rawData = [
    {value: 1, name: '受伤人数', itemStyle: {color: 'rgba(248,25,25,0.7)'}},
    {value: 1, name: '失联人数', itemStyle: {color: 'rgba(255,235,47,0.7)'}},
    {value: 1, name: '遇难人数', itemStyle: {color: 'rgba(0, 0, 0, 0.5)'}},
  ];

  const option = {
    grid: {
      left: '3%',
      right: '3%',
      bottom: '2%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      top: 'top',
      textStyle: {
        color: '#fff'
      },
    },
    series: [
      {
        type: 'pie',
        showEmptyCircle: false,
        radius: ['0%', '70%'],
        center: ['50%', '50%'],
        data: rawData,
        emphasis: {
          itemStyle: {
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (params) => {
            return params.value !== 0 ? `${params.name}: ${params.value} 人` : '';
          },
          color: 'rgb(241,106,106)',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowBlur: 6,
            textShadowOffsetX: 3,
            textShadowOffsetY: 3,
          },
        },
        labelLine: {
          show: true,
          length: 20,
          length2: 25,
        }
      }
    ]
  };

  myChart.setOption(option);
};



onMounted(() => {
  initChart();
});

</script>

<style scoped>
.chart3 {
  width: 100%;
  height: 100%;
}
</style>
