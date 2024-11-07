<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div ref="chart" style="width: 100%; height: 250px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {useGlobalStore} from "../../store";
import {getBarrierlakeSituation} from "../../api/system/barrierlakeSituation";
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');
const latestTime = ref('') // 时间
const affectedArea = ref(["抱歉暂无数据"]) //地点
const threatenedPopulation = ref([0]) // 受威胁群众人数
const evacuation = ref([0]) // 避险转移人数
const chart = ref(null);
let echartsInstance = null;
const store = useGlobalStore()

setTimeout(()=>{
  getBarrierlakeSituation(store.globalEqId).then(res => {
    update(res)
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getBarrierlakeSituation(eqid.value).then(res => {
    console.log("getBarrierlakeSituation",res)
    update(res)
  })
})

function update(data){
  if(data.length === 0){
    affectedArea.value = ["抱歉暂无数据"]
    threatenedPopulation.value = [0]
    evacuation.value = [0]
    latestTime.value = ''
  }else {
    affectedArea.value = data.map(item => item.affectedArea || "抱歉暂无数据")
    threatenedPopulation.value = data.map(item => item.threatenedPopulation || 0)
    evacuation.value = data.map(item => item.evacuation || 0)
    latestTime.value = data.reduce((max, item) => {
      return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
    },data[0].reportingDeadline); // 确保初始值
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
        data: threatenedPopulation.value,
      },
      {
        data: evacuation.value,
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
        data: affectedArea.value,
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
        name: '受威胁群众人数',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#4A90E2',
        },
        data: threatenedPopulation.value,
      },
      {
        name: '避险转移人数',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#005193',
        },
        data: evacuation.value,
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
