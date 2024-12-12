<template>
  <p style="margin: 0;font-size: 16px;color: orangered">图表上传时间：{{latestTime}}</p>
  <div ref="chart" style="width: 100%; height: 250px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {fromFacility, getFacility} from "../../api/system/CommunicationFacilityDamageRepairStatus";
import {useGlobalStore} from "../../store";
const eqid = ref('');
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
  userInput:{
    type:[String, Date],
    required: true
  }
});
// 时间查询功能
const formatDateChina = (dateStr) => {
  if(dateStr){
    const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  }
};

const userInputTime = ref('')

watch(()=>props.userInput,(newValue) => {
  userInputTime.value = newValue;
  // 后端逻辑处理：
  fromFacility(store.globalEqId,newValue).then(res => {
    console.log("通信设施损毁及抢修情况",res)
    update(res.data)
  })
})
// --------------------------------------------------------------------------------------------------------

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
      return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
    },data[0].reportingDeadline); // 确保初始值

    latestTime.value = formatDateChina(latestTime.value)
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
          show: true,
          textStyle: {
            color: "#00c7ff"
          }
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
