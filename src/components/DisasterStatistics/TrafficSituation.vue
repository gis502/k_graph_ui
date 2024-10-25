<template>
  <div ref="chart" style="width: 100%; height: 250px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {getFacility} from "../../api/system/CommunicationFacilityDamageRepairStatus";



const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

const eqid = ref('');
const earthquakeZoneName = ref([]) //地点
const repairedCableLength = ref([]) //已修复
const currentPendingRepairCableLength = ref([]) //待修复
const chart = ref(null);
let echartsInstance = null;

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  console.log("交通模块的第四个echarts图", eqid.value);

  getFacility(eqid.value).then(res => {
    console.log("交通板块的通信设施损毁及抢修情况", res);

    if(res.length === 0){
      earthquakeZoneName.value = ["抱歉暂无数据"]
      repairedCableLength.value = [0]
      currentPendingRepairCableLength.value = [0]
    }else {
      earthquakeZoneName.value = res.map(item => item.earthquakeZoneName || "抱歉暂无数据")
      repairedCableLength.value = res.map(item => item.repairedCableLength || 0)
      currentPendingRepairCableLength.value = res.map(item => item.currentPendingRepairCableLength || 0)
    }

    // console.log("earthquakeZoneName",earthquakeZoneName.value)
    // console.log("repairedCableLength",repairedCableLength.value)
    // console.log("currentPendingRepairCableLength",currentPendingRepairCableLength.value)

    update()
  })
})

function update(){
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

<style scoped>
.container-left {
  /* 自定义样式 */
}
</style>
