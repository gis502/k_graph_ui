<template>
  <div ref="chart" style="width:100%; height:250px;margin-top: 30px" ></div>
</template>

<script setup>
import * as echarts from "echarts";
import {onBeforeUnmount, onMounted, ref} from "vue";

const times = ref([]);
const chart = ref(null);
const FieldName = ref([]);
const areas = ref([])
const totalDeceased = ref([])
const totalMissing = ref([])
const totalInjured = ref([])
let echartsInstance = null; // 全局变量

const initChart = () => {
  echartsInstance = echarts.init(chart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        // 第一行显示地区名称
        let result = `${params[0].axisValue}<br/>`;
        // 第二行显示截止时间
        const timeIndex = params[0].dataIndex; // 根据 dataIndex 获取对应的时间
        result += `<span style="color: red;">统计截止时间: ${times[timeIndex]}</span><br/>`;
        // 显示系列名和数值
        params.forEach(item => {
          result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data:FieldName.value,
      align: 'right',
      right: 10,
      textStyle: {
        color: "#fff"
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 35
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: areas.value, // 使用动态获取的区域数据
      // 其他 xAxis 配置
    }],
    yAxis: [{
      type: 'value',
      axisLabel: {
        // 移除百分比格式化
        // formatter: '{value} %'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#00c7ff",
          width: 1,
          type: "solid"
        }
      },
      splitLine: {
        lineStyle: {
          color: "#063374"
        }
      }
    }],
    series: [
      {
        name: '累计遇难（人）',
        type: 'bar',
        data: totalDeceased.value, // 使用动态获取的死亡人数
        // 其他系列配置
      },
      {
        name: '累计失联（人）',
        type: 'bar',
        data: totalMissing.value, // 使用动态获取的失联人数
        // 其他系列配置
      },
      {
        name: '累计受伤（人）',
        type: 'bar',
        data: totalInjured.value, // 使用动态获取的受伤人数
        // 其他系列配置
      }
    ]
  };
  echartsInstance.setOption(option);
};

onMounted(() => {
  initChart(); // 初始化图表
});

onBeforeUnmount(() => {
  echartsInstance?.dispose(); // 释放实例
});

</script>

<style scoped>
</style>