<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ lastTime }}</p>
  <div>
    <div ref="chart" style="width: 100%; height: 200px;" className="container-left"></div>
  </div>
</template>

<script setup>

import * as echarts from "echarts";
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useGlobalStore} from "../../store";
import {getWorkGroupInfo} from "../../api/system/systemApi.js";

const lastTime = ref(''); // 时间
const workGroupName = ref([]); // 各工作组名称
const workGroupNameInfo = ref([]); // 上传数量
const chart = ref(null);
const store = useGlobalStore()
const eqid = ref('');
let echartsInstance = null; // 全局变量

setTimeout(() => {
  getWorkGroupInfo(store.globalEqId).then(res => {
    console.log(res.data.workGroupData, '------------>')
    update(res.data.workGroupData, res.data.lastTime)
  })
}, 500)

const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getWorkGroupInfo(eqid.value).then(res => {
    update(res.data.workGroupData, res.data.lastTime)
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

function update(data, time) {
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    workGroupName.value = ['抱歉暂无数据'];
    workGroupNameInfo.value = [0];
    lastTime.value = '';
  } else {
    workGroupName.value = data.map(item => item.workgroupname || '无数据');
    workGroupNameInfo.value = data.map(item => item.workgroupnameinfo || 0);

    if (time) {
      const formattedTime = formatDate(new Date(time));
      if (!lastTime.value || new Date(time) > new Date(lastTime.value)) {
        lastTime.value = formattedTime;
      }

      console.log("当前时间-》", lastTime)

    }

  }


  echartsInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return params.map(item => `
        <span>${workGroupName.value[item.dataIndex]}</span><br/> <!-- 新增的工作组名称标签 -->
        <span>${item.seriesName} : ${item.value}</span> <!-- 原有的标签 -->
        <br/>`).join('');
      }
    },
    xAxis: {
      data: workGroupName.value,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        },
        formatter: function (value) {
          if (value.length > 3) {
            return value.substr(0, 3) + '...'
          } else {
            return value
          }
        }
      }
    },
    series: [
      {
        data: workGroupNameInfo.value
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
        <span>${workGroupName.value[item.dataIndex]}</span><br/> <!-- 新增的工作组名称标签 -->
        <span>${item.seriesName} : ${item.value}</span> <!-- 原有的标签 -->
        <br/>`).join('');
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
      data: workGroupName.value,
      axisLabel: {
        color: '#ffffff',
        formatter: function (value) {
          if (value.length > 3) {
            return value.substr(0, 3) + '...'
          } else {
            return value
          }
        }
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
        color: '#ffffff',
        formatter: function (value) {
          if (value.length > 3) {
            return value.substr(0, 3) + '...'
          } else {
            return value
          }
        }
      }
    },
    series: [
      {
        name: '上报信息',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#4A90E2'
        },
        data: workGroupNameInfo.value
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
