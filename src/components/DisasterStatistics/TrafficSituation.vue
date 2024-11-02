<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div ref="chart" style="width: 100%; height: 250px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {getFacility} from "../../api/system/CommunicationFacilityDamageRepairStatus";
import {useGlobalStore} from "../../store";
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');
const latestTime = ref('') // 时间
const earthquakeZoneName = ref([]) //地点
const repairedCableLength = ref([]) //已修复
const currentPendingRepairCableLength = ref([]) //待修复
const chart = ref(null);
let echartsInstance = null;
const store = useGlobalStore()

setTimeout(()=>{
  getFacility(store.globalEqId).then(res => {
    update(res)
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getFacility(eqid.value).then(res => {
    update(res)
  })
})

function update(data){
  if(data.length === 0){
    earthquakeZoneName.value = ["抱歉暂无数据"]
    repairedCableLength.value = [0]
    currentPendingRepairCableLength.value = [0]
    latestTime.value = ''
  }else {
    earthquakeZoneName.value = data.map(item => item.earthquakeZoneName || "抱歉暂无数据")
    repairedCableLength.value = data.map(item => item.repairedCableLength || 0)
    currentPendingRepairCableLength.value = data.map(item => item.currentPendingRepairCableLength || 0)
    latestTime.value = data.reduce((max, item) => {
      return new Date(max) > new Date(item.systemInsertionTime) ? max : item.systemInsertionTime;
    },data[0].systemInsertionTime); // 确保初始值
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
                             ${item.seriesName}: ${item.value} 公里<br/>`;
        });
        return tooltipContent;
      }
    },
    xAxis: {
        data: earthquakeZoneName.value,
      },
    series: [
      {
        data: repairedCableLength.value,
      },
      {
        data: currentPendingRepairCableLength.value,
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
        data: earthquakeZoneName.value,
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
        name: '抢通恢复光缆',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#4A90E2',
        },
        data: repairedCableLength.value,
      },
      {
        name: '目前待修复光缆',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#005193',
        },
        data: currentPendingRepairCableLength.value,
      }
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
