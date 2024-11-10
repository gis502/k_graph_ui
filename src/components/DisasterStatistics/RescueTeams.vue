<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{latestTime}}</p>
  <div ref="chart" style="width:100%; height:230px;margin-top: 30px" ></div>
</template>

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
const drilldownData = ref() // echarts 配置 分类详情
const xName = ref([])// echarts 配置 地区数据
const yCount = ref([]) // echarts 配置 主类y轴计数数据
const seriesData = ref([]) // echarts 配置 主类相关数据
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
    latestTime.value = ''

    xName.value = ['抱歉暂无数据']

    yCount.value = [0]

    seriesData.value = yCount.value.map(item => ({
      value: [0],
      groupId: '抱歉暂时无数据'
    }));

    drilldownData.value = [0]

    echartsInstance.setOption({
      xAxis: {
        data: xName.value,
      },
      series: {
        data: seriesData.value,
      },
    })
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
      return formatDate(max) > formatDate(item.submissionDeadline) ? formatDate(max) : formatDate(item.submissionDeadline)
    },formatDate(data[0].submissionDeadline))

    xName.value = data.map(item => item.earthquakeAreaName || '抱歉暂无数据')

    yCount.value = data.map(item =>{
      const totalCount = item.plaCount + item.armedPoliceCount + item.militiaCount +
          item.fireRescueCount + item.forestFireRescueCount +
          item.professionalForcesCount + item.emergencyProductionSafetyCount +
          item.medicalRescueCount + item.transportationCommunicationPowerCount +
          item.airRescueCount + item.volunteerRescueTeamCount;

      return {
        areaName: item.earthquakeAreaName,
        counts: totalCount
      }
    })

    seriesData.value = yCount.value.map(item => ({
      value: item.counts,
      groupId: `'${item.areaName}'`
    }));

    drilldownData.value = data.map(item => ({
      dataGroupId: `'${item.earthquakeAreaName}'`,  // 使用单引号包裹地区名称
      data: [
        ['解放军', item.plaCount],
        ['武警', item.armedPoliceCount],
        ['民兵', item.militiaCount],
        ['消防救援', item.fireRescueCount],
        ['森林消防', item.forestFireRescueCount],
        ['专业力量', item.professionalForcesCount],
        ['应急安全', item.emergencyProductionSafetyCount],
        ['医疗救援', item.medicalRescueCount],
        ['交通通信电力', item.transportationCommunicationPowerCount],
        ['空中救援', item.airRescueCount],
        ['志愿抢险队', item.volunteerRescueTeamCount],
      ]
    }));

    echartsInstance.setOption({
      xAxis: {
        data: xName.value,
      },
      series: {
        data: seriesData.value,
      },
    })
  }
}

const initChart = () => {
  echartsInstance = echarts.init(chart.value);

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        }
      },
      data: earthquakeAreaName.value
    },
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
    dataGroupId: '',
    animationDurationUpdate: 500,
    series: {
      type: 'bar',
      id: 'sales',
      data: seriesData.value,
      universalTransition: {
        enabled: true,
        divideShape: 'clone'
      }
    }
  };
  echartsInstance.setOption(option);
  echartsInstance.on('click', function (event) {
    if (event.data) {
      var subData = drilldownData.value.find(function (data) {
        return data.dataGroupId === event.data.groupId;
      });
      if (!subData) {
        return;
      }

      echartsInstance.setOption({
        xAxis: {
          data: subData.data.map(function (item) {
            return item[0];
          })
        },
        series: {
          type: 'bar',
          id: 'sales',
          dataGroupId: subData.dataGroupId,
          data: subData.data.map(function (item) {
            return item[1];
          }),
          universalTransition: {
            enabled: true,
            divideShape: 'clone'
          }
        },
        graphic: [
          {
            type: 'text',
            left: 50,
            top: 0,
            style: {
              text: '返回',
              fontSize: 16,
              fontFamily: 'Arial', // 字体类型
              fontWeight: 'bold',  // 字体粗细
              fill: '#00c7ff',
              padding: [10, 20],  // 内边距，格式为：[上下, 左右]
              borderRadius: 10,   // 圆角
              borderColor: '#ffffff', // 边框颜色
              borderWidth: 2,     // 边框宽度
              cursor: 'pointer',  // 鼠标悬停时的样式
              textAlign: 'center', // 水平居中对齐
              verticalAlign: 'middle', // 垂直居中对齐
            },
            onclick: function () {
              // 初始的 option 配置
              const initialOption = {
                grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '3%',
                  containLabel: true
                },
                xAxis: {
                  axisLabel: {
                    show: true,
                    textStyle: {
                      color: "#00c7ff"
                    }
                  },
                  data: earthquakeAreaName.value
                },
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
                dataGroupId: '',
                animationDurationUpdate: 500,
                series: {
                  type: 'bar',
                  id: 'sales',
                  data: seriesData.value,
                  universalTransition: {
                    enabled: true,
                    divideShape: 'clone'
                  }
                }
              };
              echartsInstance.setOption(initialOption);
            }
          }
        ]
      });
    }
  });
}

onMounted(() => {
  initChart(); //初始化图表
});

onBeforeUnmount(() => {
  echartsInstance?.dispose() //释放实例
});
</script>

<style scoped >
</style>