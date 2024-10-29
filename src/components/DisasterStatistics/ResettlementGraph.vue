<template>
  <p style="margin: 0; font-size: 16px; color: orangered">最新上传时间：{{ systemInserttime }}</p>
  <div ref="chart" style="width: 100%; height: 190px;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, defineProps } from 'vue';
import * as echarts from 'echarts';
import { getTotal } from "../../api/system/relocation";
import {useGlobalStore} from "../../store";

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
const systemInserttime = ref('');
const chart = ref(null);
let chartInstance = null;

const colors = [
  ["#389af4", "#dfeaff"],
  ["#ff8c37", "#ffdcc3"],
  ["#ffc257", "#ffedcc"],
  ["#fd6f97", "#fed4e0"],
];

const generateChartOptions = () => {
  const data = [
    { name: "启用应急避难所", value: emergencyShelters.value },
    { name: "搭建临时安置点", value: temporaryShelter.value },
    { name: "新增转移安置（人）", value: newlyTransferred.value },
    { name: "累计转移安置（人）", value: cumulativeTransferred.value },
  ];

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
          label: { show: false },
          labelLine: { show: false },
        },
      },
      hoverAnimation: false,
      center: [(index * 25 + 12.5) + "%", "50%"],
      data: [
        {
          value: item.value,
          label: {
            normal: {
              formatter: (params) => params.value,
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
};

const initChart = () => {
  if (chart.value) {
    if (chartInstance) {
      chartInstance.dispose(); // 销毁之前的实例
    }
    chartInstance = echarts.init(chart.value);
    window.addEventListener('resize', () => {
      chartInstance.resize(); // 窗口大小改变时调整图表大小
    });

    const option = generateChartOptions();
    chartInstance.setOption(option);
  } else {
    console.error('chart DOM element is not ready.');
  }
};

const updateChartData = (data) => {
  if(data === null){
    emergencyShelters.value = 0;
    temporaryShelter.value = 0;
    newlyTransferred.value = 0 ;
    cumulativeTransferred.value = 0;
    systemInserttime.value = '';
  }else{
    emergencyShelters.value = data.emergencyShelters ;
    temporaryShelter.value = data.temporaryShelters ;
    newlyTransferred.value = data.newlyTransferred ;
    cumulativeTransferred.value = data.cumulativeTransferred ;
    systemInserttime.value = data.systemInserttime ;
  }

  const option = generateChartOptions();
  chartInstance.setOption(option); // 更新图表
};

watch(() => props.eqid, async (newValue) => {
  const res = await getTotal(newValue);
  updateChartData(res[0]);
});

const store = useGlobalStore();
setTimeout(()=>{
  getTotal(store.globalEqId).then(res =>{
    updateChartData(res[0]);
  })
},500)

onMounted(() => {
  initChart(); // 初始化图表
});

// 组件卸载前销毁图表实例
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
#chart {
  display: block;
  margin: 0 auto;
}
</style>
