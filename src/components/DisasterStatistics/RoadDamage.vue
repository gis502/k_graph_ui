<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div>
    <div ref="chart" style="width: 100%; height: 250px;" className="container-left"></div>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {getRoadRepairs} from "../../api/system/roadDamage";
import {useGlobalStore} from "../../store";

const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

const eqid = ref('');
const latestTime = ref(''); // 时间
const affectedArea = ref([]); // 地点
const restoredKm = ref([]); // 已经抢修
const pendingRepairKm = ref([]); // 等待抢修
const chart = ref(null);
let echartsInstance = null; // 全局变量
const store = useGlobalStore()

setTimeout(()=>{
  getRoadRepairs(store.globalEqId).then(res => {
    update(res);
  });
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getRoadRepairs(eqid.value).then(res => {
    update(res);
  });
});

function update(data) {
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    affectedArea.value = ['抱歉暂无数据'];
    restoredKm.value = [0];
    pendingRepairKm.value = [0];
    latestTime.value = '';
  } else {
    affectedArea.value = data.map(item => item.affectedArea || '无数据');
    restoredKm.value = data.map(item => item.restoredKm || 0);
    pendingRepairKm.value = data.map(item => item.pendingRepairKm || 0);
    latestTime.value = data.reduce((max, item) => {
      return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
    }, data[0].reportingDeadline); // 确保初始值
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
          ${item.seriesName}: ${item.value} 公里<br/>`).join('');
      }
    },
    xAxis: {
      data: affectedArea.value,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        }
      }
    },
    series: [
      {
        data: restoredKm.value
      },
      {
        data: pendingRepairKm.value
      }
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
          ${item.seriesName}: ${item.value} 公里<br/>`).join('');
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
      data: affectedArea.value,
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
        name: '已抢救道路损毁公里数',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#4A90E2'
        },
        data: restoredKm.value
      },
      {
        name: '待抢救道路损毁公里数',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#005193'
        },
        data: pendingRepairKm.value
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
.container-left {
  /* 自定义样式 */
}
</style>
