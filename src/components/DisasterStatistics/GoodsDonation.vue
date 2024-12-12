<template>
  <p style="margin: 0;font-size: 16px;color: orangered">图表上传时间：{{latestTime}}</p>
  <div ref="chart" style="width: 100%; height: 200px;"></div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, defineProps, watch} from 'vue';
import * as echarts from 'echarts';
import {useGlobalStore} from "../../store";
import {getBarrierlakeSituation} from "../../api/system/barrierlakeSituation";
import {fromMaterialDonation, getMaterialDonation} from "../../api/system/materialDonation";
import {fromDisasterReliefMaterials} from "../../api/system/reliefSupplies";
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
  fromMaterialDonation(store.globalEqId,newValue).then(res => {
    console.log("物资捐赠情况",res)
    update(res.data)
  })
})
// --------------------------------------------------------------------------------------------------------
const eqid = ref('');
const latestTime = ref('') // 时间
const earthquakeAreaName = ref(["抱歉暂无数据"]) //地点
const materialDonationCount = ref([0]) // 捐赠物资
const drugsDonationCount = ref([0]) // 药品
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
  getMaterialDonation(store.globalEqId).then(res => {
    update(res)
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getMaterialDonation(eqid.value).then(res => {
    console.log("getBarrierlakeSituation",res)
    update(res)
  })
})

function update(data){
  if(data.length === 0){
    earthquakeAreaName.value = ["抱歉暂无数据"]
    materialDonationCount.value = [0]
    drugsDonationCount.value = [0]
    latestTime.value = ''
  }else {
    earthquakeAreaName.value = data.map(item => item.earthquakeAreaName || "抱歉暂无数据")
    materialDonationCount.value = data.map(item => item.materialDonationCount || 0)
    drugsDonationCount.value = data.map(item => item.drugsDonationCount || 0)
    latestTime.value = data.reduce((max, item) => {
      return new Date(formatDate(max)) > new Date(formatDate(item.reportDeadline)) ? formatDate(max) : formatDate(item.reportDeadline);
    }, formatDate(data[0].reportDeadline)); // 确保初始值

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
                             ${item.seriesName}: ${item.value} 人<br/>`;
        });
        return tooltipContent;
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
        data: materialDonationCount.value,
      },
      {
        data: drugsDonationCount.value,
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
        name: '捐赠物资（万件）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#4A90E2',
        },
        data: materialDonationCount.value,
      },
      {
        name: '药品（箱）',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: '#005193',
        },
        data: drugsDonationCount.value,
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
