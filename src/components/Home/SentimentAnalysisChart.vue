<template>
  <div class="container">
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {onBeforeUnmount, onMounted, ref} from "vue";
import 'echarts-wordcloud';

// 响应式数据
const chart = ref(null);
const echartsInstance = ref(null);
const data = ref([
  { name: '缅甸地震', value: 500 },      // 核心事件
  { name: '震级6.8', value: 400 },      // 地震强度
  { name: '仰光', value: 350 },         // 影响城市
  { name: '曼德勒', value: 300 },       // 影响城市
  { name: '震源深度10公里', value: 280 }, // 地震参数
  { name: '余震', value: 250 },         // 次生灾害
  { name: '救援', value: 220 },         // 应急响应
  { name: '伤亡', value: 200 },          // 人员影响
  { name: '建筑物倒塌', value: 180 },    // 直接破坏
  { name: '国际援助', value: 150 },      // 外部支援
  { name: '地震带', value: 120 },        // 地理背景
  { name: '红十字会', value: 100 },      // 救援组织
  { name: '避难所', value: 90},         // 灾后安置
  { name: '电力中断', value: 80 },       // 基础设施影响
  { name: '通讯中断', value: 70 },       // 基础设施影响
  { name: '地质活动', value: 60 },       // 科学分析
  { name: '预警系统', value: 50 },       // 防灾措施
  { name: '板块运动', value: 40 },       // 地震原因
]);

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
  height: 90%;
  width: 90%;

  .chartContainer {
    position: absolute;
    bottom: 10px;
    width: 100%;
    height: 100%;
  }
}
</style>
