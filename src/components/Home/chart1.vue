<template>
  <div ref="chart1" class="chart1">
    <el-carousel height="300px" indicator-position="none">
      <el-carousel-item v-for="(option, index) in chartOptions" :key="index">
        <div :ref="`chartContainer${index}`" class="chart" :style="{ width: '100%', height: '100%' }"></div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const chart1 = ref(null);
const props = defineProps(['eqData']);
const chartOptions = ref([]);
const chartInstances = ref([]);

const calculateMagnitudeData = (data, years) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;
  const magnitudeCounts = {
    '<3': Array(years + 1).fill(0),
    '3-4.5': Array(years + 1).fill(0),
    '4.5-6': Array(years + 1).fill(0),
    '≥6': Array(years + 1).fill(0),
  };

  data.forEach(item => {
    const year = new Date(item.occurrenceTime).getFullYear();
    const yearIndex = currentYear - year;

    if (year >= startYear && yearIndex >= 0 && yearIndex <= years) {
      if (item.magnitude < 3) {
        magnitudeCounts['<3'][yearIndex]++;
      } else if (item.magnitude < 4.5) {
        magnitudeCounts['3-4.5'][yearIndex]++;
      } else if (item.magnitude < 6) {
        magnitudeCounts['4.5-6'][yearIndex]++;
      } else {
        magnitudeCounts['≥6'][yearIndex]++;
      }
    }
  });

  return magnitudeCounts;
};

const initChart = async () => {
  const currentYear = new Date().getFullYear();
  const threeYearMagnitudes = calculateMagnitudeData(props.eqData, 3);
  const tenYearMagnitudes = calculateMagnitudeData(props.eqData, 10);

  chartOptions.value = [
    {
      title: {
        text: '近十年历史地震震级',
        textStyle: { color: '#FFFFFF' },
        fontSize: 15
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipContent = `${params[0].axisValue}年地震震级次数:<br>`;
          params.forEach(param => {
            tooltipContent += `
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
              ${param.seriesName}: <span style="float: right;">${param.data} 次</span><br>
            `;
          });
          return tooltipContent;
        },
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        top: '10%',
        orient: 'horizontal',
        left: 'center',
        textStyle: { color: '#FFFFFF' }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
        axisLabel: {
          color: '#FFFFFF',
          show: true,
          interval: 0,
        },
      },
      yAxis: { type: 'value' },
      series: [
        { name: '<3', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['<3'], itemStyle: { color: '#2889ff' } },
        { name: '3-4.5', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['3-4.5'], itemStyle: { color: '#ffeb2f' } },
        { name: '4.5-6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['4.5-6'], itemStyle: { color: '#ffa500' } },
        { name: '≥6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['≥6'], itemStyle: { color: '#ff2f2f' } },
      ],
    },
    // 近三年地震震级分布的配置同上
    {
      title: { text: '近三年历史地震震级', textStyle: { color: '#FFFFFF' }, fontSize: 15 },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipContent = `${params[0].axisValue}年地震震级次数:<br>`;
          params.forEach(param => {
            tooltipContent += `
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
              ${param.seriesName}: <span style="float: right;">${param.data} 次</span><br>
            `;
          });
          return tooltipContent;
        },
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        top: '10%',
        orient: 'horizontal',
        left: 'center',
        textStyle: { color: '#FFFFFF' }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()),
        axisLabel: {
          color: '#FFFFFF',
          show: true,
          interval: 0,
        },
      },
      yAxis: { type: 'value' },
      series: [
        { name: '<3', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['<3'], itemStyle: { color: '#2889ff' } },
        { name: '3-4.5', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['3-4.5'], itemStyle: { color: '#ffeb2f' } },
        { name: '4.5-6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['4.5-6'], itemStyle: { color: '#ffa500' } },
        { name: '≥6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['≥6'], itemStyle: { color: '#ff2f2f' } },
      ],
    },
    {
      title: {
        text: '近十年历史地震震级',
        textStyle: { color: '#FFFFFF' },
        fontSize: 15
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipContent = `${params[0].axisValue}年地震震级次数:<br>`;
          params.forEach(param => {
            tooltipContent += `
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
              ${param.seriesName}: <span style="float: right;">${param.data} 次</span><br>
            `;
          });
          return tooltipContent;
        },
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        top: '10%',
        orient: 'horizontal',
        left: 'center',
        textStyle: { color: '#FFFFFF' }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
        axisLabel: {
          color: '#FFFFFF',
          show: true,
          interval: 0,
        },
      },
      yAxis: { type: 'value' },
      series: [
        { name: '<3', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['<3'], itemStyle: { color: '#2889ff' } },
        { name: '3-4.5', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['3-4.5'], itemStyle: { color: '#ffeb2f' } },
        { name: '4.5-6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['4.5-6'], itemStyle: { color: '#ffa500' } },
        { name: '≥6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: tenYearMagnitudes['≥6'], itemStyle: { color: '#ff2f2f' } },
      ],
    },
    // 近三年地震震级分布的配置同上
    {
      title: { text: '近三年历史地震震级', textStyle: { color: '#FFFFFF' }, fontSize: 15 },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipContent = `${params[0].axisValue}年地震震级次数:<br>`;
          params.forEach(param => {
            tooltipContent += `
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
              ${param.seriesName}: <span style="float: right;">${param.data} 次</span><br>
            `;
          });
          return tooltipContent;
        },
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        top: '10%',
        orient: 'horizontal',
        left: 'center',
        textStyle: { color: '#FFFFFF' }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()),
        axisLabel: {
          color: '#FFFFFF',
          show: true,
          interval: 0,
        },
      },
      yAxis: { type: 'value' },
      series: [
        { name: '<3', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['<3'], itemStyle: { color: '#2889ff' } },
        { name: '3-4.5', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['3-4.5'], itemStyle: { color: '#ffeb2f' } },
        { name: '4.5-6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['4.5-6'], itemStyle: { color: '#ffa500' } },
        { name: '≥6', type: 'bar', stack: '震级', emphasis: { focus: 'series' }, data: threeYearMagnitudes['≥6'], itemStyle: { color: '#ff2f2f' } },
      ],
    },
  ];




  await nextTick();

  chartInstances.value.forEach(instance => instance?.dispose());
  chartInstances.value = [];

  const chartContainers = chart1.value.querySelectorAll('.chart');
  chartContainers.forEach(container => {
    container.innerHTML = '';
  });

  chartOptions.value.forEach((option, index) => {
    const chartContainer = chart1.value.querySelectorAll('.chart')[index];
    if (chartContainer) {
      const chartInstance = echarts.init(chartContainer);
      chartInstance.setOption(option);
      chartInstances.value[index] = chartInstance;
      console.log(`Initialized chart ${index + 1}:`, chartInstance);
    }
  });

  console.log('Current Chart Instances:', chartInstances.value.length);
};

onMounted(async () => {
  await initChart();
});

watch(() => props.eqData, async () => {
  await initChart();
}, { deep: true });
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>
