<template>
  <div ref="chart" style="width: 100%; height: 250px;" class="container-left"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

// 定义图表数据
const echartData = ref([
  {
    value: 93,
    name: '累计遇难（人）',
    itemStyle: {
      normal: {
        color:'black',
      },
    },
  },
  {
    value: 38,
    name: '累计失联（人）',
    itemStyle: {
      normal: {
        color:'#ffa500',
      },
    },
  },
  {
    value: 35,
    name: '累计受伤（人）',
    itemStyle: {
      normal: {
        color:'#f81919',
      },
    },
  },
]);

// 计算总数
const totalDatas = ref('1222');




// 定义图表容器的 ref
const chart = ref(null);
let chartInstance = null;

// 初始化 ECharts 图表
const initChart = () => {
  if (chart.value) {
    // 销毁之前的实例，防止重复初始化
    if (chartInstance) {
      chartInstance.dispose();
    }
    // 初始化 ECharts 实例
    chartInstance = echarts.init(chart.value);

    const option = {
      // backgroundColor: '#060d22',
      title: {
        text: '受灾人数累积',
        top: "center",
        right: "center",
        subtext: totalDatas.value,
        textStyle: {
          color: '#f2f2f2',
          fontSize: 23,
          align: 'center',
        },
        subtextStyle: {
          fontSize: 25, // 修改 subtext 字体大小
          color: ['#ff9d19'],
        },
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        y: '10',
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
              // borderColor: '#030d22',
            },
          },
          radius: ['80%', '65%'],
          // center: ['60%', '50%'], // 使饼图靠右
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
                  color: 'yellow', // 字体颜色
                  fontSize: 23,  // 字体大小
                  align: 'center', // 居中对齐
                  lineHeight: 35,
                }
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

// 当组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 监听 echartData 的变化并重新初始化图表
watch(
    () => echartData.value,
    () => {
      initChart();
    },
    { immediate: true }
);
</script>

<style scoped>
.container-left{
  margin-left: 10px;
}
</style>
