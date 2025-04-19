<template>
  <div class="container">
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {onBeforeUnmount, onMounted, ref} from "vue";
import 'echarts-wordcloud';
import {useRouter} from 'vue-router';
const router = useRouter();

// 响应式数据
const chart = ref(null);
const echartsInstance = ref(null);
const data = ref([
  { name: '缅甸地震', value: 500, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '震级6.8', value: 400, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '仰光', value: 350, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '曼德勒', value: 300, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '震源深度10公里', value: 280, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '余震', value: 250, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '救援', value: 220, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '伤亡', value: 200, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '建筑物倒塌', value: 180, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '国际援助', value: 150, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '地震带', value: 120, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '红十字会', value: 100, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '避难所', value: 90, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '电力中断', value: 80, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '通讯中断', value: 70, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '地质活动', value: 60, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '预警系统', value: 50, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' },
  { name: '板块运动', value: 40, eqid: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', eqqueueId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b01c' }
]);

const go = (row) => {
  const route = router.resolve({path: '/thd', query: {eqid: row.eqid, eqqueueId: row.eqqueueId}}).href;
  // const route = router.resolve({path: '/knowledgeGraph', query: {eqName: row.earthquakeFullName}}).href;
  // console.log("row.eqid----------------",row.eqid) n0b+
  window.open(route, '_blank');
};

// ECharts 配置
const echartsOption = ref({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  tooltip: {
    show: false,
  },
  series: [
    {
      type: 'wordCloud',
      gridSize: 5,
      sizeRange: [10, 30],
      width: '100%',
      height: '70%',
      // rotationRange: [-45, 0, 45, 90],
      // maskImage: maskImage,
      textStyle: {
        color: () => {
          // 方案1：从预定义的一组美观颜色中随机选择
          const colors = [
            '#37A2FF', '#32C5E9', '#67E0E3', '#9FE6B8',
            '#FFDB5C', '#FF9F7F', '#FB7293', '#E062AE',
            '#E690D1', '#E7BCF3', '#9D96F5', '#8378EA'
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        },
        emphasis: {             // 鼠标悬停效果
          shadowBlur: 5,
          shadowColor: '#333'
        }
      },
      left: 'center',
      top: 'center',
      right: null,
      bottom: null,
      data: data,
      shape: 'circle',
    },
  ],
}
);

const initChart = () => {
  if (!chart.value) return;

  echartsInstance.value = echarts.init(chart.value);
  echartsInstance.value.setOption(echartsOption.value);


  // 添加点击事件监听
  echartsInstance.value.on('click', function (params) {
    // 获取点击的词条数据
    const clickedItem = params.data;
    if (clickedItem && clickedItem.eqid && clickedItem.eqqueueId) {
      go(clickedItem);
    } else {
      console.warn('缺少必要参数：eqid 或 eqqueueId');
    }
  });



  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
};

// 处理窗口大小变化
const handleResize = () => {
  if (echartsInstance.value) {
    echartsInstance.value.resize();
  }
};

// 生命周期钩子
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (echartsInstance.value) {
    echartsInstance.value.dispose();
    window.removeEventListener('resize', handleResize);
  }
});
</script>


<style scoped lang="less">
.container{
  position: relative;
  height: 100%;
  width: 80%;

  .chartContainer {
    position: absolute;
    bottom: 40px;
    left: 10px;
    width: 100%;
    height: 100%;
  }
}
</style>
