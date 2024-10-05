<template>
  <div ref="chart1" class="chart1"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const chart1 = ref(null);
const props = defineProps(['eqData']);

const categorizeData = (data) => {
  const categories = {
    '<3': 0,
    '3-4.5': 0,
    '4.5-6': 0,
    '≥6': 0
  };

  data.forEach(item => {
    const magnitude = parseFloat(item.magnitude);
    if (magnitude < 3) {
      categories['<3'] += 1;
    } else if (magnitude >= 3 && magnitude <= 4.5) {
      categories['3-4.5'] += 1;
    } else if (magnitude > 4.5 && magnitude < 6) {
      categories['4.5-6'] += 1;
    } else if (magnitude >= 6) {
      categories['≥6'] += 1;
    }
  });

  return Object.values(categories);
};

const initChart = () => {
  const myChart = echarts.init(chart1.value);
  const data = categorizeData(props.eqData);

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      top: '5%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        show: true,
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        interval: 0,
      },
      data: ['3级以下', '3 - 4.5级', '4.5 - 6级', '6级以上']
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#fff',
        fontSize: 16,
      },
      axisLabel: {
        show: true,
        textStyle: {
          fontSize: 15,
          color: '#fff'
        }
      },
    },
    series: [
      {
        name: '地震次数',
        data: data,
        type: 'line',
        smooth: false, // Disable smooth line
        itemStyle: {
          color: '#3099E2'
        },
        lineStyle: {
          color: '#1cccff',
          width: 2, // Adjust line thickness
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 16,
        }
      }
    ]
  };

  myChart.setOption(option);
};

onMounted(() => {
  initChart();
});

watch(() => props.eqData, () => {
  initChart();  // Reinitialize chart when data changes
}, {deep: true});
</script>

<style scoped>
.chart1 {
  width: 100%;
  height: 100%;
}
</style>
