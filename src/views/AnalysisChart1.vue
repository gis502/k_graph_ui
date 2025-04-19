<template>
  <div class="container">
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import {onBeforeUnmount, onMounted, ref} from "vue";
import {getSentimentAnalysisChartData} from '@/api/system/SentimentAnalysisChart'
import 'echarts-wordcloud';


// 响应式数据
const chart = ref(null);
const echartsInstance = ref(null);
const data = ref([
  // === 地震核心信息（高权重）===
  { name: '缅甸地震', value: 1000 },
  { name: '6.8级强震', value: 950 },
  { name: '浅源地震', value: 900 },
  { name: '震中仰光', value: 880 },
  { name: '主震', value: 850 },
  { name: '余震频发', value: 830 },
  { name: '震源深度10km', value: 800 },
  { name: '北纬19.5°', value: 780 },
  { name: '东经96.0°', value: 760 },
  { name: '地震序列', value: 740 },

  // === 受灾地区（按影响程度分级）===
  { name: '曼德勒', value: 850 },
  { name: '内比都', value: 820 },
  { name: '勃固省', value: 800 },
  { name: '伊洛瓦底', value: 780 },
  { name: '掸邦', value: 760 },
  { name: '克钦邦', value: 740 },
  { name: '若开邦', value: 720 },
  { name: '仰光市区', value: 700 },
  { name: '毛淡棉', value: 680 },
  { name: '卑谬', value: 660 },
  { name: '东枝', value: 640 },
  { name: '腊戍', value: 620 },
  { name: '实皆', value: 600 },
  { name: '密支那', value: 580 },
  { name: '丹老群岛', value: 550 },

  // === 灾害直接后果（高关注度）===
  { name: '房屋倒塌', value: 900 },
  { name: '人员伤亡', value: 880 },
  { name: '失踪人员', value: 850 },
  { name: '道路中断', value: 830 },
  { name: '桥梁损毁', value: 810 },
  { name: '山体滑坡', value: 790 },
  { name: '电力瘫痪', value: 770 },
  { name: '通讯中断', value: 750 },
  { name: '水源污染', value: 730 },
  { name: '医院超载', value: 710 },
  { name: '学校损毁', value: 690 },
  { name: '古迹受损', value: 670 },
  { name: '工厂停工', value: 650 },
  { name: '农田被毁', value: 630 },
  { name: '牲畜死亡', value: 610 },

  // === 救援与应急响应 ===
  { name: '国际救援队', value: 800 },
  { name: '红十字会', value: 780 },
  { name: '搜救犬', value: 760 },
  { name: '生命探测仪', value: 740 },
  { name: '临时避难所', value: 720 },
  { name: '救灾物资', value: 700 },
  { name: '帐篷发放', value: 680 },
  { name: '医疗队', value: 660 },
  { name: '直升机转运', value: 640 },
  { name: '卫星电话', value: 620 },
  { name: '灾民安置', value: 600 },
  { name: '心理援助', value: 580 },
  { name: '儿童保护', value: 560 },
  { name: '应急供水', value: 540 },
  { name: '防疫消杀', value: 520 },

  // === 地质与科学分析 ===
  { name: '印澳板块', value: 600 },
  { name: '欧亚板块', value: 580 },
  { name: '俯冲带', value: 560 },
  { name: '断裂带活动', value: 540 },
  { name: '地震预警', value: 520 },
  { name: 'P波检测', value: 500 },
  { name: '烈度分布图', value: 480 },
  { name: '地质调查', value: 460 },
  { name: '次生灾害', value: 440 },
  { name: '土壤液化', value: 420 },

  // === 国际反应 ===
  { name: '中国援助', value: 700 },
  { name: '联合国评估', value: 680 },
  { name: '东盟合作', value: 660 },
  { name: '日本专家', value: 640 },
  { name: '美国USAR', value: 620 },
  { name: '欧盟救援', value: 600 },
  { name: '印度支援', value: 580 },
  { name: '泰国医疗队', value: 560 },
  { name: '新加坡物资', value: 540 },
  { name: '世界银行拨款', value: 520 },

  // === 时间线关键词 ===
  { name: '黄金72小时', value: 600 },
  { name: '首日救援', value: 550 },
  { name: '灾后重建', value: 500 },
  { name: '周年纪念', value: 450 },
  { name: '地震演练', value: 400 },

  // === 其他补充词汇（按需调整）===
  { name: '志愿者', value: 300 },
  { name: '捐款通道', value: 280 },
  { name: '社交媒体', value: 260 },
  { name: '新闻直播', value: 240 },
  { name: '专家解读', value: 220 },
  { name: '地震云', value: 200 }, // 伪科学词，用于舆情对比
  { name: '祈福', value: 180 },
  { name: '烛光悼念', value: 150 }
]);

// ECharts 配置
const maskImage = new Image();
maskImage.src = 'data:image/png;base64,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'
const echartsOption = ref({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      title: {
        text: '地震词云图',  // 标题文字
        left: 'left',   // 水平居中
        top: 40,          // 距离顶部 20px
        textStyle: {
          color: 'white',  // 标题颜色
          fontSize: 24,   // 字体大小
          fontWeight: 'bold' // 加粗
        }
      },
      tooltip: {
        show: false,
      },
      series: [{
          maskImage: maskImage, //自定义形状
          type: 'wordCloud',
          gridSize: 5,
          sizeRange: [10, 30],
          width: '50%',
          height: '100%',
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
        },
      ],
    });

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
const getData = async () =>{
  try {
    const res = await getSentimentAnalysisChartData();

    console.log(res,"这个结果是什么")
    initChart();
  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};


// 生命周期钩子
onMounted(() => {
  getData();
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
