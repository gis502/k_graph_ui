<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div>
    <div ref="chart" style="width: 100%; height: 200px;" className="container-left"></div>
  </div>
</template>

<script setup>

import * as echarts from "echarts";
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useGlobalStore} from "../../store";
import {getSupplySituationList} from "../../api/system/supplySituation";
const latestTime = ref(''); // 时间
const earthquakeAreaName = ref([]); // 地点
const centralizedWaterProjectDamages = ref([]); // 受损数量
const chart = ref(null);
const store = useGlobalStore()
const eqid = ref('');
let echartsInstance = null; // 全局变量
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
  userInput:{
    type:String,
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
  console.log("ConcentratedWaterSupplyProjectDamage",userInputTime.value,store.globalEqId)
  // 后端逻辑处理：

})
// --------------------------------------------------------------------------------------------------------


setTimeout(()=>{
  getSupplySituationList(store.globalEqId).then(res => {
    update(res)
  })
},500)



watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getSupplySituationList(eqid.value).then(res => {
    update(res)
  })
});

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


function update(data){
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    earthquakeAreaName.value = ['抱歉暂无数据'];
    centralizedWaterProjectDamages.value = [0];
    latestTime.value = '';
  } else {
    earthquakeAreaName.value = data.map(item => item.earthquakeAreaName || '无数据');
    centralizedWaterProjectDamages.value = data.map(item => item.centralizedWaterProjectDamage || 0);
    latestTime.value = data.reduce((max, item) => {
      return new Date(formatDate(max)) > new Date(formatDate(item.reportDeadline)) ? formatDate(max) : formatDate(item.reportDeadline);
    }, formatDate(data[0].reportDeadline)); // 确保初始值

    latestTime.value = formatDateChina(latestTime.value)
  }

  echartsInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return params.map(item => `
          <span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${item.color};border-radius:50%;"></span>
          ${item.seriesName}: ${item.value} 处<br/>`).join('');
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
        data: centralizedWaterProjectDamages.value
      },
    ]
  });
}

const initChart = () => {
  echartsInstance = echarts.init(chart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return params.map(item => `
          <span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${item.color};border-radius:50%;"></span>
          ${item.seriesName}: ${item.value} 处<br/>`).join('');
      }
    },
    legend: {
      textStyle: {
        color: '#ffffff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: earthquakeAreaName.value,
      axisLabel: {
        color: '#ffffff'
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1
        }
      },
      axisLabel: {
        color: '#ffffff'
      }
    },
    series: [
      {
        name: '集中供水工程受损统计（处）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#4A90E2'
        },
        data: centralizedWaterProjectDamages.value
      },
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