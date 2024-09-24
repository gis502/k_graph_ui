<template>
  <div id="chart" style="width: 100%; height: 200px;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as echarts from 'echarts';
import {getResettlementData} from "@/api/system/excel.js";

// 数据源
const data = [
  { name: "启用应急避难所", value: 79 },
  { name: "搭建临时安置点", value:23 },
  { name: "新增转移安置（人）", value: 23 },
  { name: "累计转移安置（人）", value: 430 },
];
const  fetchData= async () => {
  getResettlementData().then(res => {
    const values = res.data;  // 假设后端返回一个 value 数组
    data.value.forEach((item, index) => {
      item.value = res.data[index].value;
    }
  );
  })
}

// 定义颜色
const colors = [
  ["#389af4", "#dfeaff"],
  ["#ff8c37", "#ffdcc3"],
  ["#ffc257", "#ffedcc"],
  ["#fd6f97", "#fed4e0"],
];

// 构建标题和系列数据
function generateChartOptions(data) {
  const titleArr = [];
  const seriesArr = [];

  data.forEach((item, index) => {
    titleArr.push({
      text: item.name,
      left: (index * 25 + 12.5) + "%", // 手动设置居中位置，间距均匀
      top: "90%", // 调整标题的纵向位置
      textAlign: "center",
      textStyle: {
        fontWeight: "normal",
        fontSize: "16",
        color: colors[index][0],
        textAlign: "center",
      },
    });

    seriesArr.push({
      name: item.name,
      type: "pie",
      clockWise: false,
      radius: [40, 50],
      itemStyle: {
        normal: {
          color: colors[index][0],
          shadowColor: colors[index][0],
          shadowBlur: 0,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
        },
      },
      hoverAnimation: false,
      center: [(index * 25 + 12.5) + "%", "50%"], // 手动设置饼图居中，调整左右间距
      data: [
        {
          value: item.value,
          label: {
            normal: {
              formatter: function (params) {
                return params.value; // 直接显示数值
              },
              position: "center",
              show: true,
              textStyle: {
                fontSize: "30",
                fontWeight: "bold",
                color: colors[index][0],
              },
            },
          },
        },
        {
          value: 500 - item.value,
          name: "invisible",
          itemStyle: {
            normal: {
              color: colors[index][1],
            },
            emphasis: {
              color: colors[index][1],
            },
          },
        },
      ],
    });
  });

  return {
    title: titleArr,
    series: seriesArr,
  };
}

// 图表初始化函数
onMounted(() => {
  fetchData()
  const chartDom = document.getElementById('chart');
  const myChart = echarts.init(chartDom);

  // 生成图表配置项
  const option = generateChartOptions(data);

  // 设置图表配置并渲染
  myChart.setOption(option);

  // 监听窗口大小变化，确保图表自适应
  window.addEventListener('resize', () => {
    myChart.resize();
  });
});
</script>

<style scoped>
#chart {
  display: block;
  margin: 0 auto;
}
</style>
