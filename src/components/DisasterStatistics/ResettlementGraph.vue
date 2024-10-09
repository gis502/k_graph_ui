<template>
  <div id="chart" style="width: 100%; height: 200px;"></div>
</template>

<script setup>
import { onMounted, ref, watch, defineProps } from 'vue';
import * as echarts from 'echarts';
import { getTotal } from "../../api/system/relocation";

const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

const emergencyShelters = ref(0);
const temporaryShelter = ref(0);
const newlyTransferred = ref(0);
const cumulativeTransferred = ref(0);

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
      left: (index * 25 + 12.5) + "%",
      top: "90%",
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
      center: [(index * 25 + 12.5) + "%", "50%"],
      data: [
        {
          value: item.value,
          label: {
            normal: {
              formatter: function (params) {
                return params.value;
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
          value: 1000 - item.value,
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
const initChart = async (eqid) => {
  const res = await getTotal(eqid);

  emergencyShelters.value = res[0]?.emergencyShelters || 0;
  temporaryShelter.value = res[0]?.temporaryShelters || 0;
  newlyTransferred.value = res[0]?.newlyTransferred || 0;
  cumulativeTransferred.value = res[0]?.cumulativeTransferred || 0;

  const data = [
    { name: "启用应急避难所", value: emergencyShelters.value },
    { name: "搭建临时安置点", value: temporaryShelter.value },
    { name: "新增转移安置（人）", value: newlyTransferred.value },
    { name: "累计转移安置（人）", value: cumulativeTransferred.value },
  ];

  const chartDom = document.getElementById('chart');
  const myChart = echarts.init(chartDom);
  const option = generateChartOptions(data);
  myChart.setOption(option);

  window.addEventListener('resize', () => {
    myChart.resize();
  });
};

// 监听 eqid 的变化
watch(() => props.eqid, (newValue) => {
  initChart(newValue);
});

// 组件加载时初始化图表
onMounted(() => {
  initChart(props.eqid || 'be3a5ea4-8dfd-a0 a2-2510-21845f17960b'); // 使用默认 eqid
});
</script>

<style scoped>
#chart {
  display: block;
  margin: 0 auto;
}
</style>
