<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ latestTime }}</p>
  <div ref="chart" class="container-left" style="width: 100%; height: 200px;"></div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref, watch,defineProps} from 'vue';
import * as echarts from 'echarts';
import {getVillages} from "../../api/system/ZhongDuanVillage";
import {useGlobalStore} from "../../store";
const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});
const eqid = ref('');
const latestTime = ref(''); // 最新时间
const currentlyBlackedOutVillages = ref('') // 供电
const currentInterruptedVillages  = ref('') // 通信
const roadBlockVillage = ref('') // 道路
const chart = ref(null);
const echartData = ref([
  {
    value: 0,
    name: '目前道路中断村（个）',
    itemStyle: {
      normal: {
        color: '#ffc258',
      },
    },
  },
  {
    value:0,
    name: '目前主网供电中断村（个）',
    itemStyle: {
      normal: {
        color: '#ff8d39',
      },
    },
  },
  {
    value: 0,
    name: '目前通信中断村（个）',
    itemStyle: {
      normal: {
        color: '#3a9bf4',
      },
    },
  },
]);
let chartInstance = null;
const initChart = () => {
  if (chart.value) {
    // 销毁之前的实例，防止重复初始化
    if (chartInstance) {
      chartInstance.dispose();
    }
    // 初始化 ECharts 实例
    chartInstance = echarts.init(chart.value);

    const option = {
      title: {
        text: '中断累计',
        top: 'center',
        right: 'center',
        textStyle: {
          color: '#f2f2f2',
          fontSize: 23,
          align: 'center',
        },
        subtextStyle: {
          fontSize: 25,
          color: ['#ff9d19'],
        },
      },
      legend: {
        orient: 'vertical',
        x: '0',
        y: '30',
        itemWidth: 20,
        itemHeight: 16,
        textStyle: {
          color: '#fff',
        },
        itemGap: 30,
        data: echartData.value.map((item) => item.name),
      },
      series: [
        {
          type: 'pie',
          itemStyle: {
            normal: {
              borderWidth: 5,
            },
          },
          radius: ['80%', '65%'],
          hoverAnimation: false,
          label: {
            normal: {
              formatter: (params) => {
                return '{yellow|' + params.name + '}\n{value|' + params.value + '}';
              },
              rich: {
                yellow: {
                  color: '#ffc72b',
                  fontSize: 16,
                  align: 'center',
                },
                value: {
                  color: 'yellow',
                  fontSize: 23,
                  align: 'center',
                  lineHeight: 35,
                },
              },
            },
          },
          labelLine: {
            normal: {
              length: 25,
              length2: 15,
              lineStyle: {
                color: '#fff',
              },
            },
          },
          data: echartData.value,
        },
      ],
    };

    chartInstance.setOption(option);
  } else {
    console.error('chart DOM element is not ready.');
  }
};
const store = useGlobalStore();

setTimeout(()=>{
  getVillages(store.globalEqId).then(res => {
    update(res);
  })
},500)

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  getVillages(eqid.value).then(res => {
    console.log("中断村 res",res)
    update(res);
  })
})

function update(data){
  const formatDateTime = (dateString) => {
    if (dateString === null ){
      return null;
    }
    return dateString.split('T')[0] + ' ' + dateString.split('T')[1].split('.')[0];
  };
  latestTime.value = formatDateTime(data[0].insertTime);
  currentInterruptedVillages.value = data[0].currentInterruptedVillages;
  currentlyBlackedOutVillages.value = data[0].currentlyBlackedOutVillages;
  roadBlockVillage.value = data[0].roadBlockVillage;

  // 更新 echartData 的值
  echartData.value[0].value = roadBlockVillage.value; // 道路中断村
  echartData.value[1].value = currentlyBlackedOutVillages.value; // 供电中断村
  echartData.value[2].value = currentInterruptedVillages.value; // 通信中断村

  chartInstance.setOption({
    series: [{
      data: echartData.value, // 更新图表数据
    }],
  });
}

// 监听 echartData 的变化
watch(echartData, () => {
  initChart();
}, {deep: true});

// 组件挂载后初始化图表
onMounted(() => {
  initChart();
});

// 组件卸载前销毁图表实例
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
.container-left {
  margin-left: 10px;
}
</style>
