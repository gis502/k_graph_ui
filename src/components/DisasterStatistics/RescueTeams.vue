<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div ref="chart" style="width:100%; height:250px;margin-top: 30px" ></div>
</template>

<!--<script setup>-->
<!--import * as echarts from "echarts";-->
<!--import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";-->
<!--import {useGlobalStore} from "../../store";-->
<!--import {getRescueForces} from "../../api/system/rescueTeams";-->


<!--const chart = ref(null);-->

<!--let echartsInstance = null; // 全局变量-->
<!--const eqid = ref('');-->
<!--const props = defineProps({-->
<!--  eqid: {-->
<!--    type: String,-->
<!--    required: true,-->
<!--  },-->
<!--});-->
<!--const FieldName = ref([-->
<!--  '解放军数量（人）',-->
<!--  '武警数量（人）',-->
<!--  '民兵数量（人）',-->
<!--  '消防救援数量（人）',-->
<!--  '森林消防数量（人）',-->
<!--  '专业力量人数（人）',-->
<!--  '应急安全生产人数（人）',-->
<!--  '医疗救援人数（人）',-->
<!--  '交通通信电力人数（人）',-->
<!--  '空中救援人数（人）',-->
<!--  '志愿抢修队（人）',-->
<!--]);-->
<!--const plaCount = ref([]) // 解放军数量-->
<!--const armedPoliceCount = ref([]) // 武警数量-->
<!--const militiaCount = ref ([]) // 民兵数量-->
<!--const fireRescueCount = ref([]) // 消防救援力量数量-->
<!--const forestFireRescueCount = ref([]) // 森林消防数量-->
<!--const professionalForcesCount = ref([]) // 专业力量：安能、…-->
<!--const emergencyProductionSafetyCount = ref([]) // 应急安全生产-->
<!--const medicalRescueCount = ref([]) // 医疗救援-->
<!--const transportationCommunicationPowerCount = ref([]) // 交通通信电力等力量-->
<!--const airRescueCount = ref([]) // 空中救援-->
<!--const volunteerRescueTeamCount = ref([]) // 志愿抢险队-->
<!--const earthquakeAreaName = ref([]) // 地点-->
<!--const latestTime = ref('')-->
<!--const store = useGlobalStore()-->

<!--setTimeout(()=>{-->
<!--  getRescueForces(store.globalEqId).then(res => {-->
<!--    update(res)-->
<!--  });-->
<!--},500)-->

<!--function update(data){-->
<!--  // 如果返回的数组为空，设置默认值-->
<!--  if (data.length === 0) {-->
<!--    earthquakeAreaName.value = ['抱歉暂无数据'];-->
<!--    plaCount.value = [0];-->
<!--    armedPoliceCount.value = [0];-->
<!--    militiaCount.value = [0];-->
<!--    fireRescueCount.value = [0];-->
<!--    forestFireRescueCount.value = [0];-->
<!--    professionalForcesCount.value = [0];-->
<!--    emergencyProductionSafetyCount.value = [0];-->
<!--    medicalRescueCount.value = [0];-->
<!--    transportationCommunicationPowerCount.value = [0];-->
<!--    airRescueCount.value = [0];-->
<!--    volunteerRescueTeamCount.value = [0];-->
<!--    latestTime.value = '';-->
<!--  } else {-->
<!--    earthquakeAreaName.value = data.map(item => item.earthquakeAreaName || '无数据');-->
<!--    plaCount.value = data.map(item => item.plaCount || 0);-->
<!--    armedPoliceCount.value = data.map(item => item.armedPoliceCount || 0);-->
<!--    militiaCount.value = data.map(item => item.militiaCount || 0);-->
<!--    fireRescueCount.value = data.map(item => item.fireRescueCount || 0);-->
<!--    forestFireRescueCount.value = data.map(item => item.forestFireRescueCount || 0);-->
<!--    professionalForcesCount.value = data.map(item => item.professionalForcesCount || 0);-->
<!--    emergencyProductionSafetyCount.value = data.map(item => item.emergencyProductionSafetyCount || 0);-->
<!--    medicalRescueCount.value = data.map(item => item.medicalRescueCount || 0);-->
<!--    transportationCommunicationPowerCount.value = data.map(item => item.transportationCommunicationPowerCount || 0);-->
<!--    airRescueCount.value = data.map(item => item.airRescueCount || 0);-->
<!--    volunteerRescueTeamCount.value = data.map(item => item.volunteerRescueTeamCount || 0);-->
<!--    latestTime.value = data.map(item => formatDate(item.systemInsertTime) || '抱歉暂无数据');-->
<!--  }-->

<!--  echartsInstance.setOption({-->
<!--    xAxis: {-->
<!--      data: earthquakeAreaName.value-->
<!--    },-->
<!--    series: [-->
<!--      {-->
<!--        data: plaCount.value-->
<!--      },-->
<!--      {-->
<!--        data: armedPoliceCount.value-->
<!--      },-->
<!--      {-->
<!--        data: militiaCount.value-->
<!--      },-->
<!--      {-->
<!--        data: fireRescueCount.value-->
<!--      },-->
<!--      {-->
<!--        data: forestFireRescueCount.value-->
<!--      },-->
<!--      {-->
<!--        data: professionalForcesCount.value-->
<!--      },-->
<!--      {-->
<!--        data: emergencyProductionSafetyCount.value-->
<!--      },-->
<!--      {-->
<!--        data: medicalRescueCount.value-->
<!--      },-->
<!--      {-->
<!--        data: transportationCommunicationPowerCount.value-->
<!--      },-->
<!--      {-->
<!--        data: airRescueCount.value-->
<!--      },-->
<!--      {-->
<!--        data: volunteerRescueTeamCount.value-->
<!--      },-->
<!--    ]-->
<!--  });-->
<!--}-->

<!--function formatDate(dateString) {-->
<!--  if (!dateString) return null;-->
<!--  const date = new Date(dateString);-->
<!--  if (isNaN(date)) return '无效日期'; // 检查日期有效性-->

<!--  const pad = (num) => (num < 10 ? '0' + num : num); // 补零函数-->

<!--  const year = date.getFullYear();-->
<!--  const month = pad(date.getMonth() + 1); // 月份从 0 开始-->
<!--  const day = pad(date.getDate());-->
<!--  const hours = pad(date.getHours());-->
<!--  const minutes = pad(date.getMinutes());-->
<!--  const seconds = pad(date.getSeconds());-->

<!--  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;-->
<!--}-->

<!--watch(() => props.eqid, (newValue) => {-->
<!--  eqid.value = newValue;-->
<!--  getRescueForces(eqid.value).then(res => {-->
<!--    console.log('getRescueForces',res)-->
<!--    update(res)-->
<!--  });-->
<!--});-->

<!--const initChart = () => {-->
<!--  echartsInstance = echarts.init(chart.value);-->
<!--  const option = {-->
<!--    tooltip: {-->
<!--      trigger: 'axis',-->
<!--      axisPointer: {-->
<!--        type: 'shadow'-->
<!--      },-->
<!--      formatter: function (params) {-->
<!--        // 第一行显示地区名称-->
<!--        let result = `${params[0].axisValue}<br/>`;-->
<!--        // 第二行显示截止时间-->
<!--        const timeIndex = params[0].dataIndex; // 根据 dataIndex 获取对应的时间-->
<!--        result += `<span style="color: red;">统计截止时间: ${latestTime.value[timeIndex]}</span><br/>`;-->
<!--        // 显示系列名和数值-->
<!--        params.forEach(item => {-->
<!--          result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;-->
<!--        });-->
<!--        return result;-->
<!--      }-->
<!--    },-->
<!--    legend: {-->
<!--      data:FieldName.value,-->
<!--      align: 'right',-->
<!--      right: 10,-->
<!--      textStyle: {-->
<!--        color: "#fff"-->
<!--      },-->
<!--      itemWidth: 10,-->
<!--      itemHeight: 10,-->
<!--      itemGap: 35-->
<!--    },-->
<!--    grid: {-->
<!--      left: '3%',-->
<!--      right: '4%',-->
<!--      bottom: '3%',-->
<!--      containLabel: true-->
<!--    },-->
<!--    xAxis: [{-->
<!--      type: 'category',-->
<!--      data: earthquakeAreaName.value, // 使用动态获取的区域数据-->
<!--      axisLine: {-->
<!--        show: true,-->
<!--        lineStyle: {-->
<!--          color: "#063374",-->
<!--          width: 1,-->
<!--          type: "solid"-->
<!--        }-->
<!--      },-->
<!--      axisTick: {-->
<!--        show: false-->
<!--      },-->
<!--      axisLabel: {-->
<!--        show: true,-->
<!--        textStyle: {-->
<!--          color: "#00c7ff"-->
<!--        }-->
<!--      }-->
<!--    }],-->
<!--    yAxis: [{-->
<!--      type: 'value',-->
<!--      axisLabel: {-->
<!--        // 移除百分比格式化-->
<!--        // formatter: '{value} %'-->
<!--      },-->
<!--      axisTick: {-->
<!--        show: false-->
<!--      },-->
<!--      axisLine: {-->
<!--        show: false,-->
<!--        lineStyle: {-->
<!--          color: "#00c7ff",-->
<!--          width: 1,-->
<!--          type: "solid"-->
<!--        }-->
<!--      },-->
<!--      splitLine: {-->
<!--        lineStyle: {-->
<!--          color: "#063374"-->
<!--        }-->
<!--      }-->
<!--    }],-->
<!--    series: [-->
<!--      {-->
<!--        name: '解放军数量（人）',-->
<!--        type: 'bar',-->
<!--        data: plaCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#FF0000',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '武警数量（人）',-->
<!--        type: 'bar',-->
<!--        data: armedPoliceCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#0000FF',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '民兵数量（人）',-->
<!--        type: 'bar',-->
<!--        data: militiaCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#008000',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '消防救援数量（人）',-->
<!--        type: 'bar',-->
<!--        data: fireRescueCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#FFA500',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '森林消防数量（人）',-->
<!--        type: 'bar',-->
<!--        data: forestFireRescueCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#800080',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '专业力量人数（人）',-->
<!--        type: 'bar',-->
<!--        data: professionalForcesCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#FFFF00',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '应急安全生产人数（人）',-->
<!--        type: 'bar',-->
<!--        data: emergencyProductionSafetyCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#00FFFF',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '医疗救援人数（人）',-->
<!--        type: 'bar',-->
<!--        data: medicalRescueCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#FFC0CB',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '交通通信电力人数（人）',-->
<!--        type: 'bar',-->
<!--        data: transportationCommunicationPowerCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#A52A2A',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '空中救援人数（人）',-->
<!--        type: 'bar',-->
<!--        data: airRescueCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#808080',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--      {-->
<!--        name: '志愿抢修队（人）',-->
<!--        type: 'bar',-->
<!--        data: volunteerRescueTeamCount.value,-->
<!--        barWidth: 13,-->
<!--        barGap: 1,-->
<!--        itemStyle: {-->
<!--          normal: {-->
<!--            color:'#00008B',-->
<!--            opacity: 1-->
<!--          }-->
<!--        }-->
<!--      },-->
<!--    ]-->
<!--  };-->
<!--  echartsInstance.setOption(option);-->
<!--};-->

<!--onMounted(() => {-->
<!--  initChart(); // 初始化图表-->
<!--});-->

<!--onBeforeUnmount(() => {-->
<!--  echartsInstance?.dispose(); // 释放实例-->
<!--});-->

<!--</script>-->

<!--<style scoped>-->
<!--</style>-->

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {useGlobalStore} from "../../store";
import {getRescueForces} from "../../api/system/rescueTeams";
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');


const plaCount = ref([]) // 解放军数量
const armedPoliceCount = ref([]) // 武警数量
const militiaCount = ref ([]) // 民兵数量
const fireRescueCount = ref([]) // 消防救援力量数量
const forestFireRescueCount = ref([]) // 森林消防数量
const professionalForcesCount = ref([]) // 专业力量：安能、…
const emergencyProductionSafetyCount = ref([]) // 应急安全生产
const medicalRescueCount = ref([]) // 医疗救援
const transportationCommunicationPowerCount = ref([]) // 交通通信电力等力量
const airRescueCount = ref([]) // 空中救援
const volunteerRescueTeamCount = ref([]) // 志愿抢险队
const earthquakeAreaName = ref([]) // 地点
const latestTime = ref('')


const helicopterCount = ref([]) // 直升机数量
const bridgeBoatCount = ref([]) // 舟桥数量
const wingDroneCount = ref([]) // 翼龙无人机数量
const chart = ref(null);
let echartsInstance = null;
const store = useGlobalStore()

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

setTimeout(()=>{
  getRescueForces(store.globalEqId).then(res => {
    update(res)
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getRescueForces(eqid.value).then(res => {
    console.log("getRescueForces",res)
    update(res)
  })
})

function update(data){
  if(data.length === 0){
    earthquakeAreaName.value = ["抱歉暂无数据"]
    plaCount.value = [0]
    armedPoliceCount.value = [0]
    militiaCount.value = [0]
    fireRescueCount.value = [0]
    forestFireRescueCount.value = [0]
    professionalForcesCount.value = [0]
    emergencyProductionSafetyCount.value = [0]
    medicalRescueCount.value = [0]
    transportationCommunicationPowerCount.value = [0]
    airRescueCount.value = [0]
    earthquakeAreaName.value = [0]
    wingDroneCount.value = [0]
    latestTime.value = ''
  }else {
    earthquakeAreaName.value = data.map(item => item.earthquakeAreaName || '抱歉无数据');
    plaCount.value = data.map(item => item.plaCount || 0);
    armedPoliceCount.value = data.map(item => item.armedPoliceCount || 0);
    militiaCount.value = data.map(item => item.militiaCount || 0);
    fireRescueCount.value = data.map(item => item.fireRescueCount || 0);
    forestFireRescueCount.value = data.map(item => item.forestFireRescueCount || 0);
    professionalForcesCount.value = data.map(item => item.professionalForcesCount || 0);
    emergencyProductionSafetyCount.value = data.map(item => item.emergencyProductionSafetyCount || 0);
    medicalRescueCount.value = data.map(item => item.medicalRescueCount || 0);
    transportationCommunicationPowerCount.value = data.map(item => item.transportationCommunicationPowerCount || 0);
    airRescueCount.value = data.map(item => item.airRescueCount || 0);
    volunteerRescueTeamCount.value = data.map(item => item.volunteerRescueTeamCount || 0);
    latestTime.value = data.reduce((max,item)=> {
      return formatDate(max) > formatDate(item.systemInsertTime) ? formatDate(max) : formatDate(item.systemInsertTime)
    },formatDate(data[0].systemInsertTime))
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
      data: earthquakeAreaName.value,
    },
    series: [
      {
        data: plaCount.value
      },
      {
        data: armedPoliceCount.value
      },
      {
        data: militiaCount.value
      },
      {
        data: fireRescueCount.value
      },
      {
        data: forestFireRescueCount.value
      },
      {
        data: professionalForcesCount.value
      },
      {
        data: emergencyProductionSafetyCount.value
      },
      {
        data: medicalRescueCount.value
      },
      {
        data: transportationCommunicationPowerCount.value
      },
      {
        data: airRescueCount.value
      },
      {
        data: volunteerRescueTeamCount.value
      },
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
        data: earthquakeAreaName.value,
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
        name: '解放军数量（人）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color:'#FF0000',
        },
        data: plaCount.value,
      },
      {
        name: '武警数量（人）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color:'#0000FF',
        },
        data: armedPoliceCount.value,
      },
      {
        name: '民兵数量（人）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#008000',
        },
        data: militiaCount.value,
      },
      {
        name: '消防救援数量（人）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#FFA500',
        },
        data: fireRescueCount.value,
      },
      {
        name: '森林消防数量（人）',
        type: 'bar',
        stack: 'Ad',
        data: forestFireRescueCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#800080',
        }
      },
      {
        name: '专业力量人数（人）',
        type: 'bar',
        stack: 'Ad',
        data: professionalForcesCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#FFFF00',
        }
      },
      {
        name: '应急安全生产人数（人）',
        type: 'bar',
        stack: 'Ad',
        data: emergencyProductionSafetyCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#00FFFF',
        }
      },
      {
        name: '医疗救援人数（人）',
        type: 'bar',
        stack: 'Ad',
        data: medicalRescueCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#FFC0CB',
        }
      },
      {
        name: '交通通信电力人数（人）',
        type: 'bar',
        stack: 'Ad',
        data: transportationCommunicationPowerCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#A52A2A',
        }
      },
      {
        name: '空中救援人数（人）',
        type: 'bar',
        stack: 'Ad',
        data: airRescueCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#808080',
        }
      },
      {
        name: '志愿抢修队（人）',
        type: 'bar',
        stack: 'Ad',
        data: volunteerRescueTeamCount.value,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
            color:'#00008B',
        }
      },
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