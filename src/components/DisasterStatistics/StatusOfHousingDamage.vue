<template>
  <div ref="chart" style="width:100%; height:250px;margin-top: 30px" ></div>
</template>

<script setup>
import * as echarts from "echarts";
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {getHousingSituationList} from "../../api/system/housingSituation";
import {useGlobalStore} from "../../store";


const chart = ref(null);
const FieldName = ref(['目前受损（个）','目前禁用（个）','目前限用（个）','目前可用（个）']);
let echartsInstance = null; // 全局变量
const eqid = ref('');
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const currentlyDamaged = ref([]) // 目前受损
const currentlyDisabled = ref([]) // 目前禁用
const currentlyRestricted = ref([]) // 目前限用
const currentlyAvailable = ref([]) // 目前可用
const affectedAreaName = ref([]) // 地点
const latestTime = ref('')
const latestTimes = ref('')
const store = useGlobalStore()

setTimeout(()=>{
  getHousingSituationList(store.globalEqId).then(res => {
    update(res)
  });
},500)

function update(data){
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    affectedAreaName.value = ['抱歉暂无数据'];
    currentlyDamaged.value = [0];
    currentlyDisabled.value = [0];
    currentlyRestricted.value = [0];
    currentlyAvailable.value = [0];
    latestTime.value = '';
  } else {
    affectedAreaName.value = data.map(item => item.affectedAreaName || '无数据');
    currentlyDamaged.value = data.map(item => item.currentlyDamaged || 0);
    currentlyDisabled.value = data.map(item => item.currentlyDisabled || 0);
    currentlyRestricted.value = data.map(item => item.currentlyRestricted || 0);
    currentlyAvailable.value = data.map(item => item.currentlyAvailable || 0);
    latestTime.value = data.map(item => formatDate(item.systemInsertTime) || '抱歉暂无数据');
    latestTimes.value = data.map(item => item.systemInsertTime || '抱歉暂无数据');
  }

  echartsInstance.setOption({
    xAxis: {
      data: affectedAreaName.value
    },
    series: [
      {
        data: currentlyDamaged.value
      },
      {
        data: currentlyDisabled.value
      },
      {
        data: currentlyRestricted.value
      },
      {
        data: currentlyAvailable.value
      }
    ]
  });
}

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

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getHousingSituationList(eqid.value).then(res => {
    update(res)
  });
});

const initChart = () => {
  echartsInstance = echarts.init(chart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        // 第一行显示地区名称
        let result = `${params[0].axisValue}<br/>`;
        // 第二行显示截止时间
        const timeIndex = params[0].dataIndex; // 根据 dataIndex 获取对应的时间
        result += `<span style="color: red;">统计截止时间: ${latestTime.value[timeIndex]}</span><br/>`;
        // 显示系列名和数值
        params.forEach(item => {
          result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data:FieldName.value,
      align: 'right',
      right: 10,
      textStyle: {
        color: "#fff"
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 35
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: affectedAreaName.value, // 使用动态获取的区域数据
      axisLine: {
        show: true,
        lineStyle: {
          color: "#063374",
          width: 1,
          type: "solid"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        }
      }
    }],
    yAxis: [{
      type: 'value',
      axisLabel: {
        // 移除百分比格式化
        // formatter: '{value} %'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#00c7ff",
          width: 1,
          type: "solid"
        }
      },
      splitLine: {
        lineStyle: {
          color: "#063374"
        }
      }
    }],
    series: [
      {
        name: '目前受损（个）',
        type: 'bar',
        data: currentlyDamaged.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#ffeb2f',
            opacity: 1
          }
        }
      },
      {
        name: '目前禁用（个）',
        type: 'bar',
        data: currentlyDisabled.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#ffa500',
            opacity: 1
          }
        }
      },
      {
        name: '目前限用（个）',
        type: 'bar',
        data: currentlyRestricted.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#f81919',
            opacity: 1
          }
        }
      },
      {
        name: '目前可用（个）',
        type: 'bar',
        data: currentlyAvailable.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#00C800',
            opacity: 1
          }
        }
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
</style>