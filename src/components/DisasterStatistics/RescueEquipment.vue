<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div ref="chart" style="width: 100%; height: 250px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {useGlobalStore} from "../../store";
import {getEquipment} from "../../api/system/rescueEquipment";
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');
const latestTime = ref('') // 时间
const earthquakeAreaName = ref(["抱歉暂无数据"]) //地点
const helicopterCount = ref([]) // 直升机数量
const bridgeBoatCount = ref([]) // 舟桥数量
const wingDroneCount = ref([]) // 翼龙无人机数量
const chart = ref(null);
let echartsInstance = null;
const store = useGlobalStore()

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) return '无效日期'; // 检查日期有效性

  const pad = (num) => (num < 10 ? '0' + num : num); // 补零函数

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 月份从 0 开始
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

setTimeout(()=>{
  getEquipment(store.globalEqId).then(res => {
    update(res)
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getEquipment(eqid.value).then(res => {
    update(res)
  })
})

function update(data){
  if(data.length === 0){
    earthquakeAreaName.value = ["抱歉暂无数据"]
    helicopterCount.value = [0]
    bridgeBoatCount.value = [0]
    wingDroneCount.value = [0]
    latestTime.value = ''
  }else {
    earthquakeAreaName.value = data.map(item => item.earthquakeAreaName || "抱歉暂无数据")
    helicopterCount.value = data.map(item => item.helicopterCount || 0)
    bridgeBoatCount.value = data.map(item => item.bridgeBoatCount || 0)
    wingDroneCount.value = data.map(item => item.wingDroneCount || 0)
    latestTime.value = data.reduce((max, item) => {
      return new Date(formatDate(max)) > new Date(formatDate(item.systemInsertTime)) ? max : formatDate(item.systemInsertTime);
    },formatDate(data[0].systemInsertTime)); // 确保初始值
  }


  echartsInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        let tooltipContent = '';
        params.forEach(item => {
          tooltipContent += `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${item.color};border-radius:50%;"></span>
                             ${item.seriesName}: ${item.value} 人<br/>`;
        });
        return tooltipContent;
      }
    },
    xAxis: {
      data: earthquakeAreaName.value,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        }
      }
    },
    series: [
      {
        data: helicopterCount.value,
      },
      {
        data: bridgeBoatCount.value,
      },
      {
        data: wingDroneCount.value,
      }
    ]
  })
}

const initChart = () => {
  echartsInstance = echarts.init(chart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        let tooltipContent = '';
        params.forEach(item => {
          tooltipContent += `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${item.color};border-radius:50%;"></span>
                             ${item.seriesName}: ${item.value} 公里<br/>`;
        });
        return tooltipContent;
      }
    },
    legend: {
      textStyle: {
        color: '#ffffff',
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: earthquakeAreaName.value,
        axisLabel: {
          color: '#ffffff',
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
            width: 1,
          }
        },
        axisLabel: {
          color: '#ffffff',
        }
      }
    ],
    series: [
      {
        name: '直升机数量（架）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#4A90E2',
        },
        data: helicopterCount.value,
      },
      {
        name: '舟桥（座）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#007BB8',
        },
        data: bridgeBoatCount.value,
      },
      {
        name: '翼龙无人机（架）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#005F8C',
        },
        data: wingDroneCount.value,
      },
    ]
  };
  echartsInstance.setOption(option);
}

onMounted(() => {
  initChart(); //初始化图表
});

onBeforeUnmount(() => {
  echartsInstance?.dispose() //释放实例
});
</script>

<style scoped >
.container-left {
  /* 自定义样式 */
}
</style>
