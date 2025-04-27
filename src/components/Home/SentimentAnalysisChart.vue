<template>
  <div class="contentBody">
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {getChartDataBy, getGraphData} from "@/api/system/knowledgeGraph.js";
import * as echarts from "echarts";
import {getEqList} from "@/api/system/damageassessment.js";

const chart = ref(null);
const echartsInstance = ref(null);
const chartData = ref([]);
const chartLinks = ref([]);
// 一开始展示的信息（后续处理过程发生了改变）
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
// 最新的地震数据
const lastEqData = ref([])
// 最新的地震的eqid
const lastEqid = ref()
const lastEqqueueId = ref()
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
      saveAsImage: false,
    }
  },
  series: [{
    type: 'graph',
    layout: 'force',
    force: {
      repulsion: 600,
      edgeLength: [100, 300],
      layoutAnimation: true,
    },
    symbolSize: 70,
    nodeScaleRatio: 1,
    roam: true,
    zoom: 0.6,
    draggable: true,
    focusNodeAdjacency: false,
    edgeSymbol: ['circle', 'arrow'],
    label: {
      show: true,
      position: 'bottom',
      color: 'white'
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

const getData = async () => {
  try {
    // 1. 先获取地震列表
    const eqListRes = await getEqList(); // 等待完成
    console.log("地震数据", eqListRes.data);

    // 2. 过滤数据
    tableData.value = eqListRes.data.filter(item => item.eqType === 'Z' && item.magnitude >= 6 && item.earthquakeName.includes("四川"));

    lastEqData.value = tableData.value[0];
    lastEqid.value = lastEqData.value.eqid; // 确保这里已赋值

    console.log("数据是什么",lastEqData.value)

    // const res = await getGraphData();

    const res = await getChartDataBy(lastEqid.value)
    console.log("res的结果",res)

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
              source: lastEqData.value.eqAddr,
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
    // earthquakeFullName
    chartStartData.value.push({ name: lastEqData.value.eqAddr });

    initChart();
  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};

const initChart = () => {
  if (!chart.value) return;

  if(echartsInstance.value !== null ){
    echartsInstance.value.dispose();
  }

  // 特殊节点样式
  echartsOption.value.series[0].data = chartStartData.value.map(item => {
    if (item.name === lastEqData.value.eqAddr) {
      item.symbol= `image:///images/地震灾害一级标题.png`
      item.itemStyle = {
        borderColor: '#f20404',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#f20404',
        color:'rgba(242, 4, 4, 0.7)',
      };
    } else if (firstData.some(dataItem => dataItem.name === item.name)) {
      item.symbol= `image:///images/地震灾害二级标题.png`
      item.itemStyle = {
        borderColor: '#e2f204',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#e2f204',
        color:'rgba(226, 242, 4, 0.6)',
      };
    } else if (secondData.some(dataItem => dataItem.name === item.name)) {
      item.symbol= `image:///images/地震灾害三级标题.png`
      item.itemStyle = {
        borderColor: '#04f2c6',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f2c6',
        color:'rgba(4, 242, 198, 0.7)'
      };
    }else{
      item.symbol= `image:///images/地震灾害四级标题.png`
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
.contentBody{
  position: relative;
  height: 90%;
  width: 98%;

  .chartContainer{
    position: absolute;
    bottom: 10px;
    width: 100%;
    height: 100%;
  }
}
</style>



