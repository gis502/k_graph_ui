<template>
  <div ref="chart3" class="chart3"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';

const chart3 = ref(null);

const initChart = () => {
  const myChart = echarts.init(chart3.value);
  const option = {
    title: {
      // text: 'Referer of a Website',
      // subtext: 'Fake Data',
      // left: 'center'
    },
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
        radius: ['35%', '60%'],  // Adjust inner and outer radius
        center: ['50%', '50%'],  // Center the pie chart
        data: [
          { value: 0, name: '遇难人数', itemStyle: { color: 'rgba(248,25,25,0.7)' } },
          { value: 0, name: '受伤人数', itemStyle: { color: 'rgba(255,235,47,0.7)' } },
          { value: 0, name: '失联人数', itemStyle: { color: 'rgba(40,137,255,0.7)' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,  // Ensure labels are shown
          position: 'inside',  // Adjust label position
          formatter: (params) => `${params.name}: ${params.value} 人`,  // Custom label formatter
          color: 'rgb(241,106,106)',
          textStyle: {
            fontSize: 16,  // Increase font size
            fontWeight: 'bold',  // Bold font
            textShadowColor: 'rgba(0, 0, 0, 0.8)',  // Set shadow color
            textShadowBlur: 6,  // Set shadow blur
            textShadowOffsetX: 3,  // Shadow X offset
            textShadowOffsetY: 3,  // Shadow Y offset
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
.chart3{
  width: 100%;
  height: 100%;
}
</style>
