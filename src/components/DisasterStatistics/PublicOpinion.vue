<template>
  <div ref="chart" style="width:100%; height:230px;margin-top: 30px" ></div>
</template>

<script setup>
import * as echarts from "echarts";
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useGlobalStore} from "../../store";
import {fromPublic, getPublicOpinion} from "../../api/system/publicOpinion";
import {fromSocialOrder} from "../../api/system/socialOrder";


const chart = ref(null);
const FieldName = ref(['宣传报道（篇）','中省主要媒体报道（篇）','舆论风情提示（条）','发布会（场）','处置负面舆论（条）']);
let echartsInstance = null; // 全局变量
const eqid = ref('');
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
  userInput:{
    type:[String,Date],
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
  fromPublic(store.globalEqId,newValue).then(res => {
    console.log("宣传舆论情况",res)
    update(res.data)
  })
})
// --------------------------------------------------------------------------------------------------------

const publicityReport = ref([]) // 宣传报道
const provincialMediaReport = ref([]) // 中省主要媒体报道
const publicOpinionRiskWarning = ref ([]) // 舆情风险提示
const pressConference = ref([]) // 发布会
const negativeOpinionDisposal = ref([]) // 处置负面舆论
const earthquakeZoneName = ref([]) // 地点
const latestTime = ref('')
const store = useGlobalStore()

setTimeout(()=>{
  getPublicOpinion(store.globalEqId).then(res => {
    update(res)
  });
},500)


function update(data){
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    earthquakeZoneName.value = ['抱歉暂无数据'];
    publicityReport.value = [0];
    provincialMediaReport.value = [0];
    publicOpinionRiskWarning.value = [0];
    pressConference.value = [0];
    negativeOpinionDisposal.value = [0];
    latestTime.value = ['抱歉暂无数据'];
  } else {
    earthquakeZoneName.value = data.map(item => item.earthquakeZoneName || '无数据');
    publicityReport.value = data.map(item => item.publicityReport || 0);
    provincialMediaReport.value = data.map(item => item.provincialMediaReport || 0);
    publicOpinionRiskWarning.value = data.map(item => item.publicOpinionRiskWarning || 0);
    pressConference.value = data.map(item => item.pressConference || 0);
    negativeOpinionDisposal.value = data.map(item => item.negativeOpinionDisposal || 0);
    latestTime.value = data.map(item => formatDate(item.submissionDeadline) || '抱歉暂无数据');

    latestTime.value = latestTime.value.map(item => formatDateChina(item))
  }

  echartsInstance.setOption({
    xAxis: {
      data: earthquakeZoneName.value
    },
    series: [
      {
        data: publicityReport.value
      },
      {
        data: provincialMediaReport.value
      },
      {
        data: publicOpinionRiskWarning.value
      },
      {
        data: pressConference.value
      },
      {
        data: negativeOpinionDisposal.value
      },
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
  getPublicOpinion(eqid.value).then(res => {
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
        result += `<span style="color: red;">图表上传时间: ${latestTime.value[timeIndex]}</span><br/>`;
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
      data: earthquakeZoneName.value, // 使用动态获取的区域数据
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
        name: '宣传报道（篇）',
        type: 'bar',
        data: publicityReport.value,
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
        name: '中省主要媒体报道（篇）',
        type: 'bar',
        data: provincialMediaReport.value,
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
        name: '舆论风情提示（条）',
        type: 'bar',
        data: publicOpinionRiskWarning.value,
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
        name: '发布会（场）',
        type: 'bar',
        data: pressConference.value,
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
        name: '处置负面舆论（条）',
        type: 'bar',
        data: negativeOpinionDisposal.value,
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color:'#00B2A9',
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