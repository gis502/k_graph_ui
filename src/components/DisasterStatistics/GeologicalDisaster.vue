<template>
  <div ref="chart" style="width:100%; height:250px;margin-top: 30px" ></div>
</template>

<script setup>
import * as echarts from "echarts";
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {getHousingSituationList} from "../../api/system/housingSituation";
import {useGlobalStore} from "../../store";
import {getRiskConstructionGeohazards} from "../../api/system/geologicalDisaster";


const chart = ref(null);
const FieldName = ref(['现有隐患点（个）','新增隐患点（个）','正在施工点（个）','基础设施检查点（个）','预警发布（次）','转移避险（人）']);
let echartsInstance = null; // 全局变量
const eqid = ref('');
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

const publicityReport = ref([]) // 宣传报道
const provincialMediaReport = ref([]) // 中省主要媒体报道
const publicOpinionRiskWarning = ref ([]) // 舆情风险提示
const pressConference = ref([]) // 发布会
const negativeOpinionDisposal = ref([]) // 处置负面舆论
const earthquakeZoneName = ref([]) // 地点

const existingRiskPoints = ref([]) // 现有隐患点
const newRiskPoints = ref([]) // 新增隐患点
const constructionPoints = ref([]) // 正在施工点
const infrastructureCheckpoints = ref([]) // 基础设施检查点
const alarmCount = ref([]) // 预警发布
const evacuationCount = ref([]) // 转移避险
const quakeAreaName = ref([]) // 地点
const latestTime = ref('')
const store = useGlobalStore()

setTimeout(()=>{
  getRiskConstructionGeohazards(store.globalEqId).then(res => {
    update(res)
  });
},500)

quakeAreaName

function update(data){
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    quakeAreaName.value = ['抱歉暂无数据'];
    existingRiskPoints.value = [0];
    newRiskPoints.value = [0];
    constructionPoints.value = [0];
    infrastructureCheckpoints.value = [0];
    alarmCount.value = [0];
    evacuationCount.value = [0];
    latestTime.value = ['抱歉暂无数据'];
  } else {
    quakeAreaName.value = data.map(item => item.quakeAreaName || '无数据');
    existingRiskPoints.value = data.map(item => item.existingRiskPoints || 0);
    newRiskPoints.value = data.map(item => item.newRiskPoints || 0);
    constructionPoints.value = data.map(item => item.constructionPoints || 0);
    infrastructureCheckpoints.value = data.map(item => item.infrastructureCheckpoints || 0);
    alarmCount.value = data.map(item => item.alarmCount || 0);
    evacuationCount.value = data.map(item => item.evacuationCount || 0);
    latestTime.value = data.map(item => formatDate(item.reportDeadline) || '抱歉暂无数据');
  }

  echartsInstance.setOption({
    xAxis: {
      data: quakeAreaName.value
    },
    series: [
      {
        data: existingRiskPoints.value
      },
      {
        data: newRiskPoints.value
      },
      {
        data: constructionPoints.value
      },
      {
        data: infrastructureCheckpoints.value
      },
      {
        data: alarmCount.value
      },
      {
        data: evacuationCount.value
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
  getRiskConstructionGeohazards(eqid.value).then(res => {
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
      data: quakeAreaName.value, // 使用动态获取的区域数据
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
        name: '现有隐患点（个）',
        type: 'bar',
        data: existingRiskPoints.value,
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
        name: '新增隐患点（个）',
        type: 'bar',
        data: newRiskPoints.value,
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
        name: '正在施工点（个）',
        type: 'bar',
        data: constructionPoints.value,
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
        name: '基础设施检查点（个）',
        type: 'bar',
        data: infrastructureCheckpoints.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#00C800',
            opacity: 1
          }
        }
      },
      {
        name: '预警发布（次）',
        type: 'bar',
        data: alarmCount.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#00B2A9',
            opacity: 1
          }
        }
      },
      {
        name: '转移避险（人）',
        type: 'bar',
        data: evacuationCount.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#3B99E0',
            opacity: 1
          }
        }
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