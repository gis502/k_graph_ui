<template>
  <div style="display: flex; align-items: center; padding-left: 10px; box-sizing: border-box;">
    <span
        style="font-size: 13px;color: white; padding-left: 5px; background: linear-gradient(to right, rgb(218,45,45) 0%, rgba(254, 254, 254, 0) 90%); width: 100%;">
      更新时间：{{ updateTime }}
    </span>
  </div>
  <div ref="chart2" class="chart2"></div>
</template>



<script setup>
import {onMounted, ref, watch, onBeforeUnmount} from 'vue';
import * as echarts from 'echarts';
import {getAftershockMagnitude} from "@/api/system/statistics.js";

const chart2 = ref(null);
const props = defineProps(['lastEq']);
const updateTime = ref("2024-09-14 09:16:36")
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
      bottom: '30%',
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
      data: ['3-3.9级', '4-4.9级', '5-5.9级', '6级及以上']
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#fff',
        fontSize: 13,
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
        data: [0, 0, 0, 0], // 初始数据
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
          fontSize: 13,
        },
      }
    ]
  };

  myChart.setOption(option); // 设置初始图表配置
};

// 更新图表数据
const updateChart = (data) => {
  console.log("111111")
  console.log(data)
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: [
            data.magnitude_3_3_9 || 0,
            data.magnitude_4_4_9 || 0,
            data.magnitude_5_5_9 || 0,
            0
          ],
        }
      ]
    });
  }
};

// 窗口尺寸改变时触发 resize
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

// 监听 eqid 的变化
watch(() => props.lastEq, () => {
  if (props.lastEq) {
    getAftershockMagnitude(props.lastEq.eqid).then((res) => {
      updateChart(res);  // 更新图表数据
      updateTime.value = res.system_insert_time.replace('T', ' ')
    });
  }else {
    updateTime.value = props.lastEq.occurrenceTime.replace('T', ' ')
  }
});

// 组件挂载时初始化图表并监听窗口尺寸变化
onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);  // 监听窗口尺寸变化
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
});
</script>


<style scoped>
.chart2 {
  width: 100%;  /* 设置宽度占满父级容器 */
  height: 100%; /* 设置高度占满父级容器 */
}


</style>
