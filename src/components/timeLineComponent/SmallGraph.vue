<template>
  <div class="content-body">
    <div class="smallGraph-title">
      <h2 class="sub-title">
        知识图谱
        <button @click="handleClick">详情</button>
      </h2>
    </div>
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {getChartDataBy, getGraphData} from "@/api/system/knowledgeGraph.js";
import * as echarts from "echarts";

const chart = ref(null);
const echartsInstance = ref(null);
const chartData = ref([]);
const chartLinks = ref([]);
const chartStartData = ref([]);
const chartStartLinks = ref([]);
const firstData = [
  {
    name:"地震震情信息"
  },
  {
    name:"地震灾情信息"
  },
  {
    name:"应急指挥协调信息"
  },
  {
    name:"应急决策信息"
  },
  {
    name:"态势标绘信息"
  },
  {
    name:"社会反应动态信息"
  },
  {
    name:"灾害现场动态信息"
  },
  {
    name:"应急处置信息"
  }
]
const secondData = [
  { "name": "地震参数" },
  { "name": "强震监测信息" },
  { "name": "测震监测信息" },
  { "name": "预报信息" },
  { "name": "余震情况" },
  { "name": "人员伤亡" },
  { "name": "房屋破坏" },
  { "name": "生命线震害信息" },
  { "name": "次生灾害信息" },
  { "name": "人员伤亡" },
  { "name": "灾区灾情简报" },
  { "name": "用户上传会议信息" },
  { "name": "应急响应信息" },
  { "name": "应急决策基础信息" },
  { "name": "应急处置基础信息" },
  { "name": "态势标绘基础信息" },
  { "name": "灾害现场动态基础信息" },
  { "name": "社会反应动态基础信息" }
]
// 地震列表数据
const tableData = ref([])
// 左侧列表数据
const list = ref([
  {
    id: 1,
    value: '地震震情信息',
    isOpen: false,
    children: [
      { id: 11, value: '地震参数' },
      { id: 12, value: '强震检测信息'},
      { id: 13, value: '测震监测信息' },
      { id: 14, value: '预报信息'},
      { id: 15, value: '余震情况' },
    ],
    fatherCount:5,
  },
  {
    id: 2,
    value: '地震灾情信息',
    isOpen: false,
    children: [
      { id: 21, value: '人员伤亡'},
      { id: 22, value: '房屋破坏'},
      { id: 23, value: '生命线震害信息'},
      { id: 24, value: '次生灾害信息'},
      { id: 25, value: '人员伤亡'},
      { id: 26, value: '灾区灾情简报'},
    ],
    fatherCount:6,
  },
  {
    id: 3,
    value: '应急指挥协调信息',
    isOpen: false,
    children: [
      { id: 31, value: '用户上传会议信息' },
      { id: 32, value: '应急响应信息' },
    ],
    fatherCount:2,
  },
  {
    id: 4,
    value: '应急决策信息',
    isOpen: false,
    children: [
      { id: 41, value: '应急决策基础信息' },
    ],
    fatherCount:1,
  },
  {
    id: 5,
    value: '应急处置信息',
    isOpen: false,
    children: [
      { id: 51, value: '应急处置基础信息' },
    ],
    fatherCount:1,
  },
  {
    id: 6,
    value: '态势标绘信息',
    isOpen: false,
    children: [
      { id: 61, value: '态势标绘基础信息' },
    ],
    fatherCount:1,
  },
  {
    id: 7,
    value: '灾害现场动态信息',
    isOpen: false,
    children: [
      { id: 71, value: '灾害现场动态基础信息' },
    ],
    fatherCount:1,
  },
  {
    id: 8,
    value: '社会反应动态信息',
    isOpen: false,
    children: [
      { id: 81, value: '社会反应动态基础信息' },
    ],
    fatherCount:1,
  },
]);

const newList = ref([]);
// 定义要触发的事件
const emit = defineEmits(['samllGraphShow'])

const props = defineProps({
  eqid: {
    type: String,
  },
})
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
      color: 'white'
    },
    edgeLabel: {
      show: true,
      fontSize: 12,
      color: '#fff',
      formatter: "{c}"
    },
    categories: [
      {name: '属性'},
      {name: '关系', symbol: 'rect'}
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
          {offset: 0, color: '#e0f55a'},
          {offset: 1, color: '#639564'}
        ],
        globalCoord: false
      }
    },
    symbolKeepAspect: false,
    data: chartData.value,
    links: chartLinks.value
  }]
});


const getData = async () => {
  try {
    // const res = await getGraphData();
    const res = await getChartDataBy(props.eqid)
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
    chartData.value = Array.from(nodeSet).map(name => ({name}));

    // 处理 一开始展示 数据（这里的顺序不要更换否则会出问题）
    const validValues = new Set(list.value.map(item => item.value));
    chartStartData.value = chartData.value.filter(item => validValues.has(item.name))
    chartStartLinks.value = chartStartData.value.map(item => (
            {
              source: "震后生成",
              target: item.name,
              value: "包含"
            }
        )
    )
    chartStartLinks.value.push({
      source: "地震震情信息",
      target: "地震参数",
      value: "包含"
    })
    chartStartData.value.push({ name: "震后生成" });

    initChart();

  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};

const initChart = () => {
  if (!chart.value) return;

  if (echartsInstance.value !== null) {
    echartsInstance.value.dispose();
  }

  // 特殊节点样式
  echartsOption.value.series[0].data = chartStartData.value.map(item => {
    if (item.name === '震后生成') {
      item.itemStyle = {
        borderColor: '#f20404',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#f20404',
        color:'rgba(242, 4, 4, 0.7)',
      };
    } else if (firstData.some(dataItem => dataItem.name === item.name)) {
      item.itemStyle = {
        borderColor: '#e2f204',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#e2f204',
        color:'rgba(226, 242, 4, 0.6)',
      };
    } else if (secondData.some(dataItem => dataItem.name === item.name)) {
      item.itemStyle = {
        borderColor: '#04f2c6',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f2c6',
        color:'rgba(4, 242, 198, 0.7)'
      };
    }else{
      item.itemStyle = {
        borderColor: '#04f218',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f218',
        color:'rgba(4, 242, 24, 0.7)'
      };
    }

    return item;
  });
  echartsOption.value.series[0].links = chartStartLinks.value;

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
const handleClick = () => {
  // 触发事件通知父组件
  emit('samllGraphShow', true)
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
.content-body {
  width: 100%;
  height: 42vh;
  position: relative;

  .smallGraph-title {
    height: 3.8vh;
    position: relative;
    background-image: url("@/assets/images/CommandScreen/标题底图.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    top: -4%;

    .sub-title {
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
        background: linear-gradient(to bottom right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0) 30%,
        rgba(255, 255, 255, 0.15) 45%,
        rgba(255, 255, 255, 0) 60%);
        transform: rotate(30deg);
        transition: all 0.5s ease;
      }

      button:hover::after {
        left: 100%;
        top: 100%;
      }
    }
  }

  .chartContainer {
    position: absolute;
    width: 100%;
    height: 95%;
    top: 20px;
  }
}
</style>
