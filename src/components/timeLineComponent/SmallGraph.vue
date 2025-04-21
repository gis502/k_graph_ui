<template>
  <div class="content-body">
    <div class="smallGraph-title">
      <h2 class="sub-title">
        知识图谱
        <button @click="showDetails">详情</button>
      </h2>
    </div>
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {getGraphData} from "@/api/system/knowledgeGraph.js";
import * as echarts from "echarts";

const chart = ref(null);
const echartsInstance = ref(null);
const chartData = ref([]);
const lastChartData = ref([]);
const chartLinks = ref([]);
const newList = ref([]);
// 定义要触发的事件
const emit = defineEmits(['showDetails'])

// 2. 触发事件的函数
const sendDataToParent = () => {
  const data = { message: 'Hello from child' }
  emit('eventName', data) // 触发事件并传数据
}
// ECharts 配置
const echartsOption = ref({
  backgroundColor: 'rgba(0,0,0,0)',
  grid: {
    left: '10%',
    top: 60,
    right: '10%',
    bottom: 60,
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  series: [{
    type: 'graph',
    layout: 'force',
    force: {
      repulsion: 600,
      edgeLength: [100, 400],
      layoutAnimation: true,
    },
    symbolSize: 70,
    nodeScaleRatio: 1,
    roam: true,
    zoom: 1,
    draggable: true,
    focusNodeAdjacency: false,
    edgeSymbol: ['circle', 'arrow'],
    label: {
      show: true,
      position: 'inside',
      color: 'gold'
    },
    edgeLabel: {
      show: true,
      fontSize: 12,
      color: '#fff',
      formatter: "{c}"
    },
    categories: [
      { name: '属性' },
      { name: '关系', symbol: 'rect' }
    ],
    itemStyle: {
      borderColor: '#04f2a7',
      borderWidth: 2,
      shadowBlur: 10,
      shadowColor: '#04f2a7',
      color: '#001c43',
    },
    lineStyle: {
      opacity: 0.9,
      width: 2,
      curveness: 0,
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: '#e0f55a' },
          { offset: 1, color: '#639564' }
        ],
        globalCoord: false
      }
    },
    symbolKeepAspect: false,
    data: chartData.value,
    links: chartLinks.value
  }]
});

// 左侧列表数据
const list = [
  { value: "基础背景信息" },
  { value: "地震灾害和救灾背景信息" },
  { value: "地震台网信息" },
  { value: "救灾能力储备信息" },
  { value: "应急联络信息" },
  { value: "预案与规划信息" },
  { value: "防震减灾示范与演习经验信息" },
  { value: "地震震情信息" },
  { value: "地震灾情信息" },
  { value: "应急指挥协调信息" },
  { value: "应急决策信息" },
  { value: "应急处置信息" },
  { value: "态势标绘信息" },
  { value: "灾害现场动态信息" },
  { value: "社会反应动态信息" },
  { value: "救援物资信息" }
];

const getData = async () => {
  try {
      const res = await getGraphData();

      chartLinks.value = res.map(item => ({
        source: item.source.name,
        target: item.target.name,
        value: item.value.type
      }));

      const nodeSet = new Set();

      chartLinks.value.forEach(item => {
        nodeSet.add(item.source);
        nodeSet.add(item.target);
      });

      chartData.value = Array.from(nodeSet).map(name => ({ name }));

      // 处理 newList 数据
      const validValues = new Set(list.map(item => item.value));
      newList.value = chartData.value
          .filter(item => validValues.has(item.name))
          .map((item, index) => ({
            id: index + 1,
            value: item.name
          }));

      initChart();

  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};

const initChart = () => {
  if (!chart.value) return;

  // 检查 chartData 是否发生变化
  const isDataChanged = JSON.stringify(chartData.value) !== JSON.stringify(lastChartData.value);

  if (!isDataChanged) {
    console.log('数据未变化，跳过渲染');
    return; // 直接返回，不执行后续渲染逻辑
  }

  // 更新 lastChartData
  lastChartData.value = JSON.parse(JSON.stringify(chartData.value));

  if(echartsInstance.value !== null ){
    echartsInstance.value.dispose();
  }

  // 特殊节点样式
  echartsOption.value.series[0].data = chartData.value.map(item => {
    item.symbolSize = 60;
    if (item.name === '地震参数') {
      item.itemStyle = {
        borderColor: '#f20404',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#f20404',
        color: '#001c43',
      };
      item.symbolSize = 100;
    } else if (item.name === '地震震情信息s') {
      item.itemStyle = {
        borderColor: '#e2f204',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#e2f204',
        color: '#001c43',
      };
    }
    return item;
  });
  echartsOption.value.series[0].links = chartLinks.value;

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

// 展开详细的页面
const showDetails = () => {

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
.content-body{
  width: 100%;
  height: 42vh;
  position: relative;

  .smallGraph-title{
    height: 3.8vh;
    position: relative;
    background-image: url("@/assets/images/CommandScreen/标题底图.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    top:-4%;

    .sub-title{
      color: #FFFFFF;
      font-size: 1.1rem;
      font-weight: 550;
      top: 20%;
      position: relative;
      left: 7%;
      width: 93%;


      button {
        /* 基础样式 */
        background: linear-gradient(135deg, #1a3a8f 0%, #0a2840 100%);
        color: whitesmoke;
        font-size: 0.8rem;
        font-weight: 550;
        padding: 2px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        float: right;
        margin-right: 10px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        top: -1px;

        /* 边框光效（可选） */
        border: 1px solid rgba(74, 144, 226, 0.3);
      }

      /* 悬浮效果 */
      button:hover {
        background: linear-gradient(135deg, #2451b5 0%, #123456 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      /* 点击效果 */
      button:active {
        transform: translateY(1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      /* 光效动画（高级效果） */
      button::after {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.15) 45%,
            rgba(255, 255, 255, 0) 60%
        );
        transform: rotate(30deg);
        transition: all 0.5s ease;
      }

      button:hover::after {
        left: 100%;
        top: 100%;
      }
    }
  }

  .chartContainer{
    position:absolute;
    width: 100%;
    height: 95%;
    top: 20px;
  }
}
</style>