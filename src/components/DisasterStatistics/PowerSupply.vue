<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{reportingDeadline}}</p>
  <div className="chart-container">
    <div className="chart-wrapper">
      <div ref="chart1" className="chart" style="width: 100%; height: 145px;"></div>
      <p className="chart-description" style="font-size: 17px; color: white;">变站</p>
    </div>
    <div className="chart-wrapper">
      <div ref="chart2" className="chart" style="width: 100%; height: 145px;"></div>
      <p className="chart-description" style="font-size: 17px; color: white;">跳闸线路</p>
    </div>
    <div className="chart-wrapper">
      <div ref="chart3" className="chart" style="width: 100%; height: 145px;"></div>
      <p className="chart-description" style="font-size: 17px; color: white;">主网停电用户数</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import { getPowerSupply } from "../../api/system/powerSupply";
import { defineProps } from "vue";
import {useGlobalStore} from "../../store";

const chart1 = ref(null);
const chart2 = ref(null);
const chart3 = ref(null);
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');
const reportingDeadline = ref('')
const store = useGlobalStore();

setTimeout(() => {
  getPowerSupply(store.globalEqId).then(res => {
    updataData(res)
  });
},500)

function updataData(data){
  // 处理数据，提取所需信息
  const totalRestoredSubstations = data.reduce((sum, item) => sum + item.restoredSubstations, 0);
  const totalToBeRepairedSubstations = data.reduce((sum, item) => sum + item.toBeRepairedSubstations, 0);
  const totalRestoredCircuits = data.reduce((sum, item) => sum + item.restoredCircuits, 0);
  const totalToBeRestoredCircuits = data.reduce((sum, item) => sum + item.toBeRestoredCircuits, 0);
  const totalBlackoutUsers = data.reduce((sum, item) => sum + item.totalBlackoutUsers, 0);
  const totalRestoredPowerUsers = data.reduce((sum, item) => sum + item.restoredPowerUsers, 0);

  reportingDeadline.value = data.reduce((max, item) => {
    return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
  }, data[0]?.reportingDeadline); // 确保初始值

  // 更新图表1的数据
  option1.series[0].data[0].value = totalRestoredSubstations;
  option1.series[0].data[1].value = totalToBeRepairedSubstations;

  // 更新图表2的数据
  option2.series[0].data[0].value = totalRestoredCircuits;
  option2.series[0].data[1].value = totalToBeRestoredCircuits;

  // 更新图表3的数据
  option3.series[0].data[0].value = totalBlackoutUsers;
  option3.series[0].data[1].value = totalRestoredPowerUsers;

  // 重新渲染图表
  chart1Instance.setOption(option1);
  chart2Instance.setOption(option2);
  chart3Instance.setOption(option3);
}

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getPowerSupply(eqid.value).then(res => {
    console.log("res powerSupply eeeeeeeeeeeeee",res)
    updataData(res)
  });
});

let chart1Instance, chart2Instance, chart3Instance;

const option1 = {
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const color = params.color;
      return `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${color};border-radius:50%;"></span>
              ${params.name}: ${params.value} 站`;
    }
  },
  legend: {
    top: '5%',
    left: 'center',
    textStyle: {
      color: '#ffffff'
    },
  },
  series: [
    {
      name: '电力设施损毁及抢修情况',
      type: 'pie',
      radius: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '已恢复变站',
          itemStyle: { color: '#389af4' }
        },
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '待修复变站',
          itemStyle: { color: '#dfeaff' }
        }
      ]
    }
  ]
};

const option2 = {
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const color = params.color;
      return `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${color};border-radius:50%;"></span>
              ${params.name}: ${params.value} 条`;
    }
  },
  legend: {
    top: '5%',
    left: 'center',
    textStyle: {
      color: '#ffffff'
    },
  },
  series: [
    {
      name: '电力设施损毁及抢修情况',
      type: 'pie',
      radius: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '已恢复线路',
          itemStyle: { color: '#ff8c37' }
        },
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '待恢复线路',
          itemStyle: { color: '#ffdcc3' }
        }
      ]
    }
  ]
};

const option3 = {
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const color = params.color;
      return `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${color};border-radius:50%;"></span>
              ${params.name}: ${params.value} 户`;
    }
  },
  legend: {
    top: '5%',
    left: 'center',
    textStyle: {
      color: '#ffffff'
    },
    padding: [0, 0, 0, 0]
  },
  series: [
    {
      name: '电力设施损毁及抢修情况',
      type: 'pie',
      radius: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '累计主网停电用户数',
          itemStyle: { color: '#ffc257' }
        },
        {
          value: 0, // 初始值，将在动态更新后修改
          name: '已恢复主网停电用户数',
          itemStyle: { color: '#ffedcc' }
        }
      ]
    }
  ]
};

onMounted(() => {
  chart1Instance = echarts.init(chart1.value);
  chart2Instance = echarts.init(chart2.value);
  chart3Instance = echarts.init(chart3.value);

  chart1Instance.setOption(option1);
  chart2Instance.setOption(option2);
  chart3Instance.setOption(option3);

  // 当组件完全卸载前面触发，这里主要是销毁echarts图，释放内存
  onBeforeUnmount(() => {
    if (chart1Instance) {
      chart1Instance.dispose();
    }
    if (chart2Instance) {
      chart2Instance.dispose();
    }
    if (chart3Instance) {
      chart3Instance.dispose();
    }
  });
});
</script>




<style scoped>
.chart-container {
  display: flex;
  justify-content: space-between;
}

.chart-wrapper {
  width: 48%;
  margin: 5px;
}

.chart-description {
  text-align: center;
  color: white;
  font-size: 17px;
}
</style>
