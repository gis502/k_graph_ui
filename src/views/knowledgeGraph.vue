<template>
  <div class="content-body">
    <div class="timeLabel">
      {{lastRecordTimeLocal}}
    </div>
    <div class="closeAll">
      <button @click="handleClick">×</button>
    </div>

    <div class="catalog" v-show="ifShowCatalog">
      <div class="titleName">
        知识图谱
      </div>
      <div class="search">
        <el-button type="primary" class="search-button" @click="focusNode(inputValue)">
          <el-icon>
            <Search/>
          </el-icon>
        </el-button>
        <input
            v-model="inputValue"
            class="search-input"
            placeholder="搜索图谱中的词条"
            @keydown.enter="focusNode(inputValue)"
        />
      </div>
      <div class="list">
        <li
            v-for="item in list"
            :key="item.id"
            :class="{'clicked': currentIndex === item.id}"
            @click="showDescription(item,item.value)"
        >{{ item.value }}({{ item.fatherCount }})
          <!--          如果有子项展开子项-->
          <ul v-if="item.isOpen">
            <li
                v-for="child in item.children"
                :key="child.id"
                :class="{'clicked': currentIndex === child.id}"
                @click.stop="handleChildClick(child)"
            >
              {{ child.value }}({{ child.sonCount }})
            </li>
          </ul>
        </li>
      </div>
    </div>

    <div class="knowledgeGraph">
      <div class="chartContainer" ref="chart"></div>
      <div class="restart">
        <button @click="getData">一键复原</button>
      </div>
      <div class="chartCount">
        <button>共{{ chartDataCount }}个实体球</button>
      </div>
      <div class="graphLagend">
        <div class="legendHeader">
          <span>图例详情</span>
        </div>
        <div class="legendContent">
          <div class="legend-item" v-for="item in legend " :key="item.id">
            <div class="legend-image">
              <img :src="item.img" alt="图例说明">
            </div>
            <div class="legend-description">
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toggle-button open" @click="updateChartData" v-show="ifShowCatalog">问答助手</div>

    <div class="chat-panel" v-if="showChat">
      <div class="chat-title">智能问答助手</div>
      <div class="toggle-button close" @click="updateChartData">
        关闭助手
      </div>
      <div class="message-panel" id="message-panel">
        <div class="message-list">
          <div
              :class="['message-item', item.type === 1 ? 'ai-item' : '']"
              v-for="(item, index) in messageList"
              :id="'item' + index"
          >
            <template v-if="item.type === 0">
              <div class="message-content">
                <div class="content-inner">{{ item.content }}</div>
              </div>
              <div class="user-icon">我</div>
            </template>
            <template v-else>
              <div class="user-icon">AI</div>
              <div class="message-content ai-item">
                <MdPreview
                    previewTheme="vuepress"
                    :codeFoldable="false"
                    editorId="preview"
                    :modelValue="item.content.join('')"
                />
                <div class="loading" v-if="item.loading">
                  <img src="../assets/loading.gif"/>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="send-panel">
        <el-form :model="formData" ref="formDataRef" @submit.prevent>
          <!--input输入-->
          <el-form-item label="" prop="content">
            <el-input
                type="textarea"
                :rows="3"
                clearable
                placeholder="请输入你想问的问题"
                v-model="formData.content"
                @keyup="keySend"
                class="elInput"
            ></el-input>
          </el-form-item>
          <!--input输入-->
          <el-form-item label="" prop="" class="send-btn">
            <el-button type="primary"
                       @click="sendMessage"
                       :disabled="loading"
                       style="
                          background-color: transparent;
                          border: 1px solid rgba(255, 255, 255, 0.3);
                          font-size: 14px;
                          font-weight: 500;
                          color: white;"
            >发送(ctrl+enter)
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

  </div>
</template>

<script setup>
import {Search} from "@element-plus/icons-vue";
import * as echarts from 'echarts';
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue';
import {getChartDataBy, getGraphData} from "@/api/system/knowledgeGraph.js";
import {MdPreview} from "md-editor-v3";
import {ElMessage} from "element-plus";
import timeTransfer from "@/cesium/tool/timeTransfer.js";
// 该数据不准二次赋值，用于全局调用，保存初始数据 ！！！
let allDataLinks = [];
// 定义要触发的事件
const emit = defineEmits(['bigGraphShow'])
const props = defineProps({
  eqMagnitude: {
    type: String,
  },
  eqid: {
    type: String,
  },
  currentTime: {
    type: String,
  },
  eqAddr: {
    type: String,
  }
})
// 存放图例的信息
const legend = [
  {
    id: 0,
    img: "../../../public/images/eqentity1.png",
    description: "一级实体"
  },
  {
    id: 1,
    img: "../../../public/images/eqentity2.png",
    description: "二级实体"
  },
  {
    id: 2,
    img: "../../../public/images/eqentity3.png",
    description: "三级实体"
  },
  {
    id: 3,
    img: "../../../public/images/eqentity4.png",
    description: "四级实体"
  },
]
// 响应式数据
const inputValue = ref('');
const currentIndex = ref(null);
const showChat = ref(false);
const formData = ref({});
const messageList = ref([]);
const loading = ref(false);
const chart = ref(null);
// 永远不会改变的初始值（这里有BUG，不知道为什么变化了）
const StartData = ref([]);
const StartLinks = ref([]);
const firstData = [
  {
    name: "地震震情信息"
  },
  {
    name: "地震灾情信息"
  },
  {
    name: "应急指挥协调信息"
  },
  {
    name: "应急决策信息"
  },
  {
    name: "态势标绘信息"
  },
  {
    name: "社会反应动态信息"
  },
  {
    name: "灾害现场动态信息"
  },
  {
    name: "应急处置信息"
  }
]
const secondData = [
  {"name": "地震参数"},
  {"name": "强震监测信息"},
  {"name": "测震监测信息"},
  {"name": "预报信息"},
  {"name": "余震情况"},
  {"name": "人员伤亡"},
  {"name": "房屋破坏"},
  {"name": "生命线震害信息"},
  {"name": "次生灾害信息"},
  {"name": "人员伤亡"},
  {"name": "灾区灾情简报"},
  {"name": "用户上传会议信息"},
  {"name": "应急响应信息"},
  {"name": "应急决策基础信息"},
  {"name": "应急处置基础信息"},
  {"name": "态势标绘基础信息"},
  {"name": "灾害现场动态基础信息"},
  {"name": "社会反应动态基础信息"}
]
// 一开始展示的信息（后续处理过程发生了改变）
const chartStartData = ref([]);
const chartStartLinks = ref([]);
// 不断变化的信息
const chartChangeData = ref([]);
const chartChangeLinks = ref([]);
// 所有的数据信息
const chartData = ref([]);
const chartLinks = ref([]);
// 用于检查随着时间轴变化是否更新
const lastChartData = ref([]);
const echartsInstance = ref(null);
// 控制左侧列表是否隐藏
const ifShowCatalog = ref(true);
// 左侧列表数据
const list = ref([
  {
    id: 1,
    value: '地震震情信息',
    isOpen: false,
    children: [
      {id: 11, value: '地震参数'},
      {id: 12, value: '强震检测信息'},
      {id: 13, value: '测震监测信息'},
      {id: 14, value: '预报信息'},
      {id: 15, value: '余震情况'},
    ],
    fatherCount: 5,
  },
  {
    id: 2,
    value: '地震灾情信息',
    isOpen: false,
    children: [
      {id: 21, value: '人员伤亡'},
      {id: 22, value: '房屋破坏'},
      {id: 23, value: '生命线震害信息'},
      {id: 24, value: '次生灾害信息'},
      {id: 25, value: '人员伤亡'},
      {id: 26, value: '灾区灾情简报'},
    ],
    fatherCount: 6,
  },
  {
    id: 3,
    value: '应急指挥协调信息',
    isOpen: false,
    children: [
      {id: 31, value: '用户上传会议信息'},
      {id: 32, value: '应急响应信息'},
    ],
    fatherCount: 2,
  },
  {
    id: 4,
    value: '应急决策信息',
    isOpen: false,
    children: [
      {id: 41, value: '应急决策基础信息'},
    ],
    fatherCount: 1,
  },
  {
    id: 5,
    value: '应急处置信息',
    isOpen: false,
    children: [
      {id: 51, value: '应急处置基础信息'},
    ],
    fatherCount: 1,
  },
  {
    id: 6,
    value: '态势标绘信息',
    isOpen: false,
    children: [
      {id: 61, value: '态势标绘基础信息'},
    ],
    fatherCount: 1,
  },
  {
    id: 7,
    value: '灾害现场动态信息',
    isOpen: false,
    children: [
      {id: 71, value: '灾害现场动态基础信息'},
    ],
    fatherCount: 1,
  },
  {
    id: 8,
    value: '社会反应动态信息',
    isOpen: false,
    children: [
      {id: 81, value: '社会反应动态基础信息'},
    ],
    fatherCount: 1,
  },
]);
// const newList = ref([]);
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
      repulsion: 1000,
      edgeLength: [120, 200],
      layoutAnimation: true,
    },
    symbolSize: 70,
    nodeScaleRatio: 1,
    roam: true,
    zoom: 0.35,
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
// 计算一共有多少个实体球
const chartDataCount = ref();

const filteredNodes = ref([])
const filteredLinks = ref([])
let lastRecordTimeLocal=''
// let lastRecordTimeLocal= timestampToTimeChina(new Date(props.currentTime))
const timestampToTimeChina=(time)  =>{
  return timeTransfer.timestampToTimeChina(time)
}
// 获取数据并初始化图表
const getData = async () => {
  try {
    const res = await getChartDataBy(props.eqid)
    console.log("res的结果", res)
    // 生成随机时间的函数
    const generateRandomTime = () => {
      const start = new Date('2022-06-01T17:30:00Z');
      const end = new Date('2022-06-03T12:00:00Z');
      const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return randomTime.toISOString(); // 返回 ISO 字符串格式的时间
    };

    const nodesMap = new Map();

// 遍历 res 数组，为符合条件的节点添加 time 属性并添加到 Map 中
    res.forEach(item => {
      const sourceNode = {...item.source};
      const targetNode = {...item.target};

      // 检查 sourceNode 是否满足条件
      if (
          sourceNode.name !== props.eqAddr &&
          !firstData.some(dataItem => dataItem.name === sourceNode.name) &&
          !secondData.some(dataItem => dataItem.name === sourceNode.name)
      ) {
        sourceNode.time = generateRandomTime(); // 添加时间属性
      }

      // 检查 targetNode 是否满足条件
      if (
          targetNode.name !== props.eqAddr &&
          !firstData.some(dataItem => dataItem.name === targetNode.name) &&
          !secondData.some(dataItem => dataItem.name === targetNode.name)
      ) {
        targetNode.time = generateRandomTime(); // 添加时间属性
      }

      // 添加到 Map 中
      if (!nodesMap.has(sourceNode.name)) {
        nodesMap.set(sourceNode.name, sourceNode);
      }
      if (!nodesMap.has(targetNode.name)) {
        nodesMap.set(targetNode.name, targetNode);
      }
    });
    chartData.value = Array.from(nodesMap.values())
    console.log("chartData with time", chartData.value)

    // source（起始节点）、target（目标节点）和关系类型 value
    //线
    chartLinks.value = res.map(item => ({
      source: item.source.name,
      target: item.target.name,
      value: item.value.type
    }));

    console.log("chartLinks", chartLinks.value)

    chartDataCount.value = chartData.value.length;

    // 给每个子项计算 sonCount
    list.value.forEach(item => {
      item.children.forEach(child => {
        const sonCount = chartLinks.value.filter(link => link.source === child.value).length;
        child.sonCount = sonCount;
      });
    });
    console.log(list.value, "跟新后的数据")
    let centerPoint = chartData.value.find(node => node.name === props.eqAddr); // 地震主节点
    centerPoint = centerPoint ? [centerPoint] : [];
    let firstPoints = chartData.value.filter(node => firstData.some(dataItem => dataItem.name === node.name));
    let center_firstlink=chartLinks.value.filter(link => firstPoints.some(dataItem => link.target=== dataItem.name))
    let SecondPoints = chartData.value.filter(node => secondData.some(dataItem => dataItem.name === node.name));
    let first_secondlink=chartLinks.value.filter(link => SecondPoints.some(dataItem => link.target=== dataItem.name))
    chartStartData.value =[
        ...centerPoint,
        ...firstPoints,
        ...SecondPoints
    ]

    chartStartLinks.value =[
        ...center_firstlink,
        ...first_secondlink
    ]

    console.log("chartStartData", chartStartData.value)
    console.log("chartStartLinks", chartStartLinks.value)

    initChart(chartStartData, chartStartLinks);

  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};
// 初始化图表
// chartStartData chartStartLinks
const initChart = (nodes, links) => {

  if (!chart.value) return;
  //
  // // 检查数据是否发生变化
  const isDataChanged =
      JSON.stringify(nodes.value) !== JSON.stringify(echartsOption.value.series[0].data) ||
      JSON.stringify(links.value) !== JSON.stringify(echartsOption.value.series[0].links);

  if (!isDataChanged) {
    console.log('数据未变化，跳过渲染');
    return; // 直接返回，不执行后续渲染逻辑
  }
  let lastRecordTimeLocaltmp = timestampToTimeChina(props.currentTime)
  if (lastRecordTimeLocaltmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
    lastRecordTimeLocal = lastRecordTimeLocaltmp
  }
  echartsOption.value.series[0].data = nodes.value;
  echartsOption.value.series[0].links = links.value;

  // 特殊节点样式
  echartsOption.value.series[0].data = nodes.value.map(item => {

    if (item.name === props.eqAddr) {
      item.symbol = `image:///images/eqentity1.png`
      item.itemStyle = {
        borderColor: '#f20404',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#f20404',
        color: 'rgba(242, 4, 4, 0.7)',
      };
    } else if (firstData.some(dataItem => dataItem.name === item.name)) {
      item.symbol = `image:///images/eqentity2.png`
      item.itemStyle = {
        borderColor: '#e2f204',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#e2f204',
        color: 'rgba(226, 242, 4, 0.6)',
      };
    } else if (secondData.some(dataItem => dataItem.name === item.name)) {
      item.symbol = `image:///images/eqentity3.png`
      item.itemStyle = {
        borderColor: '#04f2c6',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f2c6',
        color: 'rgba(4, 242, 198, 0.7)'
      };
    } else {
      item.symbol = `image:///images/eqentity4.png`
      item.itemStyle = {
        borderColor: '#04f218',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f218',
        color: 'rgba(4, 242, 24, 0.7)'
      };
    }

    return item;
  });
  if (!echartsInstance.value) {
    //
    echartsInstance.value = echarts.init(chart.value);
    echartsInstance.value.setOption(echartsOption.value);
    // 强制调整大小，确保初始渲染时的大小正确
    echartsInstance.value.resize();

    // 监听 click 事件
    echartsInstance.value.on('click', function (params) {
      // 判断点击的是节点还是边
      if (params.componentType === 'series' && params.seriesType === 'graph') {
        if (params.dataType === 'node') {
          // 处理节点点击
          handleNodeClick(params.data);
        } else if (params.dataType === 'edge') {
          // 处理边点击
        }
      }
    });

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
  } else {
    // 如果实例已存在，直接更新数据
    echartsInstance.value.setOption(echartsOption.value);
  }
};

// 点击节点触发函数
const handleNodeClick = (value) => {
  // value:{name:"地震灾情信息",symbolSize:60}

  // 打印被点击的节点信息
  console.log(value, "这个节点被点击了");

  // 获取节点的名称 (name)
  const nodeName = value.name;

  // 从 chartLinks 中查找所有 source 等于 nodeName 的对象
  const relatedLinks = chartLinks.value.filter(link => link.source === nodeName);

  // 将相关的链接对象添加到 chartStartLinks 中
  relatedLinks.forEach(link => {
    // 如果 chartStartLinks 中没有该链接对象，则添加
    if (!chartStartLinks.value.some(item => item.source === link.source && item.target === link.target)) {
      chartStartLinks.value.push(link);
    }
  });

  // 将更新后的 chartStartLinks 存入 chartChangeLinks
  chartChangeLinks.value = [...chartStartLinks.value];

  // 打印更新后的 chartChangeLinks
  console.log("更新后的 chartChangeLinks:", chartChangeLinks.value);

  // 提取所有 target 值
  const newTargets = relatedLinks.map(link => link.target);

  // 把这些 target 值添加到 chartStartData 中
  newTargets.forEach(target => {
    // 如果 chartStartData 中没有这个 target 名称的节点，则添加
    if (!chartStartData.value.some(item => item.name === target)) {
      chartStartData.value.push({name: target});
    }
  });

  // 将 chartStartData 存入 chartChangeData
  chartChangeData.value = [...chartStartData.value];

  // 打印更新后的 chartChangeData
  console.log("更新后的 chartChangeData:", chartChangeData.value);

  updateEchart(chartChangeData.value, chartChangeLinks.value)
};

const updateEchart = (data, link) => {
  if (echartsInstance.value !== null) {
    echartsInstance.value.dispose();
  }

  console.log("data数据", data)
  console.log("link数据", link)


  // 特殊节点样式
  echartsOption.value.series[0].data = chartStartData.value.map(item => {
    if (item.name === props.eqAddr) {
      item.symbol = `image:///images/eqentity1.png`
      item.itemStyle = {
        borderColor: '#f20404',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#f20404',
        color: 'rgba(242, 4, 4, 0.7)',
      };
    } else if (firstData.some(dataItem => dataItem.name === item.name)) {
      item.symbol = `image:///images/eqentity2.png`
      item.itemStyle = {
        borderColor: '#e2f204',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#e2f204',
        color: 'rgba(226, 242, 4, 0.6)',
      };
    } else if (secondData.some(dataItem => dataItem.name === item.name)) {
      item.symbol = `image:///images/eqentity3.png`
      item.itemStyle = {
        borderColor: '#04f2c6',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f2c6',
        color: 'rgba(4, 242, 198, 0.7)'
      };
    } else {
      item.symbol = `image:///images/eqentity4.png`
      item.itemStyle = {
        borderColor: '#04f218',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f218',
        color: 'rgba(4, 242, 24, 0.7)'
      };
    }

    return item;
  });
  echartsOption.value.series[0].links = link;

  echartsInstance.value = echarts.init(chart.value);
  echartsInstance.value.setOption(echartsOption.value);

  // 监听 click 事件
  echartsInstance.value.on('click', function (params) {
    // 判断点击的是节点还是边
    if (params.componentType === 'series' && params.seriesType === 'graph') {
      if (params.dataType === 'node') {
        // 处理节点点击
        handleNodeClick(params.data);
      } else if (params.dataType === 'edge') {
        // 处理边点击
      }
    }
  });
}

// 处理窗口大小变化
const handleResize = () => {
  if (echartsInstance.value) {
    echartsInstance.value.resize();
  }
};

// 关闭助手并调整图表大小
const updateChartData = () => {
  showChat.value = !showChat.value;
  ifShowCatalog.value = !ifShowCatalog.value;
  nextTick(() => {
    handleResize();
  });
};

// 搜索节点并聚焦
const focusNode = (nodeName) => {

  console.log(inputValue.value, "输入框的内容")
  console.log(nodeName, "节点名称")

  if (!nodeName?.trim()) {
    inputValue.value = '';
    return;
  }

  const index = findNodeIndex(nodeName);
  if (index === -1) {
    ElMessage.warning(`节点 "${nodeName}" 不存在`);
    inputValue.value = '';
    return;
  }

  if (echartsInstance.value) {
    echartsInstance.value.dispatchAction({
      type: 'highlight',
      name: nodeName
    });

    echartsInstance.value.dispatchAction({
      type: 'focusNodeAdjacency',
      seriesIndex: 0,
      dataIndex: index
    });
  }

  inputValue.value = '';
};

// 查找节点索引
const findNodeIndex = (name) => {
  return echartsOption.value.series[0].data.findIndex(
      node => node.name.toLowerCase() === name.toLowerCase()
  );
};

// 显示描述并聚焦节点
const showDescription = (item, value) => {
  item.isOpen = !item.isOpen;

  // 如果展开了，更新 currentIndex，表示当前项被选中
  if (item.isOpen) {
    currentIndex.value = item.id;
  } else {
    // 如果收起了，清除 currentIndex
    if (currentIndex.value === item.id) {
      currentIndex.value = null;
    }
  }

  const nodeName = {name: item.value}
  handleNodeClick(nodeName);

  focusNode(value);
};

// 发送消息
// const sendMessage = () => {
//
//   const message = formData.value.content?.trim();
//
//   if (!message) {
//     ElMessage.warning('请输入内容');
//     return;
//   }
//
//   messageList.value.push({
//     type: 0,
//     content: message,
//   });
//
//   messageList.value.push({
//     type: 1,
//     content: [],
//     loading: true,
//   });
//
//   loading.value = true;
//
//   formData.value.content = '';
//
//   // 模拟 SSE 连接
//   const eventSource = new EventSource(`http://localhost:8080/seek/stream?message=${encodeURIComponent(message)}`);
//
//   eventSource.onmessage = (event) => {
//     if (event.data === 'end') {
//       closeEventSource();
//       return;
//     }
//
//     try {
//       const response = JSON.parse(event.data).content;
//       const lastMsg = messageList.value[messageList.value.length - 1];
//       lastMsg.content.push(response);
//
//       nextTick(() => {
//         const panel = document.getElementById('message-panel');
//         if (panel) panel.scrollTop = panel.scrollHeight;
//       });
//     } catch (e) {
//       console.error('解析消息失败:', e);
//     }
//   };
//
//   eventSource.onerror = (error) => {
//     console.error('SSE 错误:', error);
//     closeEventSource();
//   };
//   const closeEventSource = () => {
//     eventSource.close();
//     const lastMsg = messageList.value[messageList.value.length - 1];
//     if (lastMsg) lastMsg.loading = false;
//     loading.value = false;
//   };
// };

const sendMessage = async () => {
  const message = formData.value.content?.trim();

  if (!message) {
    ElMessage.warning('请输入内容');
    return;
  }

  // 添加用户消息
  messageList.value.push({
    type: 0,  // 用户消息
    content: message,
  });

  // 添加AI的"正在输入"占位消息
  const loadingMessage = {
    type: 1,  // AI消息
    content: [],
    loading: true,
  };
  messageList.value.push(loadingMessage);

  formData.value.content = ''; // 清空输入框
  loading.value = true;

  try {
    const response = await fetch('http://39.106.228.188:5000/conversation_gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // 明确要求返回JSON
      },
      body: JSON.stringify({
        content: message,
        prompt: allDataLinks,
      }),
    });

    // 先检查HTTP状态码
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 尝试解析响应（兼容非JSON情况）
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // 如果返回的是纯文本，包装成统一结构
      data = {content: text};
    }

    // 更新最后一条消息
    const lastMsg = messageList.value[messageList.value.length - 1];
    if (data.content) {
      lastMsg.content = Array.isArray(lastMsg.content)
          ? [...lastMsg.content, data.content]
          : [data.content];
    }

    // 滚动到底部
    nextTick(() => {
      const panel = document.getElementById('message-panel');
      if (panel) panel.scrollTop = panel.scrollHeight;
    });
  } catch (error) {
    console.error('请求失败:', error);

    // 显示错误提示
    const lastMsg = messageList.value[messageList.value.length - 1];
    if (lastMsg) {
      lastMsg.content = ["AI 响应失败，请稍后重试"];
      lastMsg.loading = false;
    }

    ElMessage.error('请求失败: ' + error.message);
  } finally {
    loading.value = false;
    const lastMsg = messageList.value[messageList.value.length - 1];
    if (lastMsg) lastMsg.loading = false;
  }
};

// 快捷键发送
const keySend = (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    sendMessage();
  }
};

// 向父组件传值不展示大知识图谱
const handleClick = () => {
  // 触发事件通知父组件
  emit('bigGraphShow', false)
};

const handleChildClick = (child) => {
  // child:{id: 12, value: '强震检测信息'}
  console.log(child, "我看看怎么个事")
  const newChild = {name: child.value}; // 转换成 {name: "强震检测信息"}
  handleNodeClick(newChild);
  focusNode(newChild.name);
};
const findRelatedNodesAndLinks = (forthFilteredData) => {
  // 初始化相关变量
  const relatedLinks = [];
  const relatedNodes = new Set(); // 使用 Set 确保节点唯一
  const centerPoint = chartData.value.find(node => node.name === props.eqAddr); // 地震主节点

  // 递归函数：从当前节点向上追溯，直到找到地震主节点
  const traceUp = (currentNode) => {
    // 如果当前节点是地震主节点，停止递归
    if (currentNode.name === props.eqAddr) {
      relatedNodes.add(centerPoint);
      return;
    }

    // 将当前节点加入相关节点集合
    // 查找所有从当前节点出发的连接
    const links = chartLinks.value.filter(link => link.target === currentNode.name);
    // console.log(links, "links chartLinks.value.filter(link => link.target === currentNode.name);")
    // 遍历这些连接，找到对应的源节点
    links.forEach(link => {
      const sourceNode = chartData.value.find(node => node.name === link.source);
      // 如果源节点存在且未被处理过
      relatedLinks.push(link); // 将连接加入相关连接列表
      relatedNodes.add(sourceNode);
      traceUp(sourceNode); // 递归向上追溯

    });
  };

  // 从每个 forthFilteredData 节点开始递归向上追溯
  forthFilteredData.forEach(node => {
    if (!relatedNodes.has(node)) {
    relatedNodes.add(node);
    traceUp(node);
    }
  });

  return {relatedNodes, relatedLinks};
};
watch(() => props.currentTime, (newTime) => {
  updateByTime()
})
const updateByTime=()=>{
  console.log("props.currentTime",props.currentTime)
  const currentTime = new Date(props.currentTime);

  let centerPoint = chartData.value.find(node => node.name === props.eqAddr); // 地震主节点
  centerPoint = centerPoint ? [centerPoint] : [];
  let firstPoints = chartData.value.filter(node => firstData.some(dataItem => dataItem.name === node.name));
  let center_firstlink=chartLinks.value.filter(link => firstPoints.some(dataItem => link.target=== dataItem.name))
  let SecondPoints = chartData.value.filter(node => secondData.some(dataItem => dataItem.name === node.name));
  let first_secondlink=chartLinks.value.filter(link => SecondPoints.some(dataItem => link.target=== dataItem.name))
  console.log(currentTime,"updateByTime currentTime")
  const forthFilteredData = chartData.value.filter(node => new Date(node.time) && new Date(node.time) <= currentTime && node.name !== props.eqAddr && !firstData.some(dataItem => dataItem.name === node.name) && !secondData.some(dataItem => dataItem.name === node.name));
  console.log(forthFilteredData,"forthFilteredData")
  const {relatedNodes, relatedLinks} = findRelatedNodesAndLinks(forthFilteredData)
  console.log(relatedNodes,"relatedNodes")
  console.log(relatedLinks,"relatedLinks")

  filteredNodes.value =[
    ...centerPoint,
    ...firstPoints,
    ...SecondPoints,
    ...relatedNodes
  ]

  filteredLinks.value =[
    ...center_firstlink,
    ...first_secondlink,
    ...relatedLinks
  ]
  console.log(filteredNodes.value, "filteredNodes");
  console.log(filteredLinks.value, "filteredLinks");

  const uniqueNodes = ref([]);
  const nodeNames = new Set();

  filteredNodes.value.forEach(node => {
    if (!nodeNames.has(node.name)) {
      uniqueNodes.value.push(node);
      nodeNames.add(node.name);
    }
  });

  // 去重连接
  const uniqueLinks = ref([]);
  const linkStrings = new Set();

  filteredLinks.value.forEach(link => {
    const linkString = `${link.source}-${link.target}`;
    if (!linkStrings.has(linkString)) {
      uniqueLinks.value.push(link);
      linkStrings.add(linkString);
    }
  });


  console.log(uniqueNodes.value, "uniqueNodes");
  console.log(uniqueLinks.value, "uniqueLinks");
  initChart(uniqueNodes, uniqueLinks)
}
// 生命周期钩子
onMounted(async () => {
  await getData(); // 初始化数据
  updateByTime()
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
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row; /* 使元素横向排列 */
  // 确保 flex 容器允许子元素增长和收缩
  border-radius: 20px;
  z-index: 3;
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);

  .closeAll {
    button {
      position: absolute;
      left: calc(95vw + 6px);
      top: 8px;
      z-index: 1;
      // 基础样式
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      padding: 5px 12px;
      color: white;
      cursor: pointer;
      height: 30px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      user-select: none;

      // 悬停时的流动边框
      &:hover {
        border-color: transparent; // 隐藏原始边框

        &::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 6px;
          padding: 1px; // 边框厚度
          background: linear-gradient(90deg,
          #0453fc,
          #00f7ff,
          #0453fc,);
          background-size: 200% auto;
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderFlow 1.5s linear infinite;
          z-index: 0;
        }
      }
    }
  }

  .knowledgeGraph {
    flex: 1;
    height: 100%;
    width: 100%;
    position: relative;

    .chartContainer {
      width: 100%;
      height: 100%;
    }

    .restart {
      button {
        position: absolute;
        top: 8px;
        z-index: 1;
        // 基础样式
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        padding: 5px 12px;
        color: white;
        cursor: pointer;
        height: 30px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        user-select: none;

        // 悬停时的流动边框
        &:hover {
          border-color: transparent; // 隐藏原始边框

          &::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 6px;
            padding: 1px; // 边框厚度
            background: linear-gradient(90deg,
            #0453fc,
            #00f7ff,
            #0453fc,);
            background-size: 200% auto;
            -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: borderFlow 1.5s linear infinite;
            z-index: 0;
          }
        }
      }
    }

    .chartCount {
      button {
        position: absolute;
        top: 46px;
        z-index: 1;
        // 基础样式
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        padding: 5px 12px;
        color: white;
        cursor: pointer;
        height: 30px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        user-select: none;

        // 悬停时的流动边框
        &:hover {
          border-color: transparent; // 隐藏原始边框

          &::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 6px;
            padding: 1px; // 边框厚度
            background: linear-gradient(90deg,
            #0453fc,
            #00f7ff,
            #0453fc,);
            background-size: 200% auto;
            -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: borderFlow 1.5s linear infinite;
            z-index: 0;
          }
        }
      }
    }

    .graphLagend {
      position: absolute;
      bottom: 0px;
      z-index: 1;
      left: 0vw;
      // 基础样式
      background-color: rgba(59, 80, 149, .1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      padding: 5px 12px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      user-select: none;
      display: flex;
      flex-direction: column;

      .legendHeader {
        text-align: center;
        margin-bottom: 10px;
      }

      .legendContent {
        flex: 1;
        display: flex;
        flex-direction: column;

        .legend-item {
          display: flex;
          flex-direction: row;
          margin-bottom: 10px;

          .legend-image {
            img {
              margin-top: 3px;
              width: 15px;
              margin-right: 10px;
            }
          }
        }
      }
    }
  }

  .chat-panel {
    background-color: rgba(59, 80, 149, .1);
    height: 100%;
    border-top-right-radius: 20px; /* 右上角圆角 */
    border-bottom-right-radius: 20px; /* 左下角圆角 */

    .chat-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: whitesmoke;
    }

    .message-panel {
      position: relative;
      height: calc(100% - 200px);
      overflow: auto;
      padding-bottom: 10px;
      /* 隐藏滚动条 */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */

      /* Chrome/Safari/Opera */

      .message-panel::-webkit-scrollbar {
        display: none;
      }

      .message-list {
        margin: 0 auto;
        width: 440px;

        .message-item {
          margin: 10px 0px;
          display: flex;

          .user-icon {
            width: 40px;
            height: 40px;
            line-height: 40px;
            border-radius: 20px;
            background: #535353;
            color: #fff;
            text-align: center;
            margin-left: 10px;
          }

          .message-content {
            flex: 1;
            margin-left: 10px;
            align-items: center;
            display: flex;
            justify-content: flex-end;
            color: #fff;
          }

          .content-inner {
            background-color: rgba(59, 80, 149, .1);
            border-radius: 5px;
            padding: 10px;
            color: #fff;
          }
        }

        .ai-item {
          line-height: 23px;

          .message-content {
            display: block;
            background-color: rgba(59, 80, 149, .1);
            border-radius: 5px;
          }

          .user-icon {
            background: #64018f;
            margin-left: 0px;
          }

          :deep(.md-editor-previewOnly) {
            border-radius: 5px;
            background-color: rgba(59, 80, 149, .1);
          }

          :deep(.md-editor-preview-wrapper) {
            padding: 10px;
          }

          .loading {
            text-align: center;
          }
        }
      }
    }

    .send-panel {
      position: relative;
      margin: 5px auto 0px;
      width: 450px;
      background-color: rgba(59, 80, 149, .1);
      border-radius: 20px;
      padding: 5px;

      .elInput :deep(.el-textarea__inner) {
        color: white;
      }


      .send-btn {
        text-align: right;
        margin-bottom: 0px;
        padding: 5px;

        :deep(.el-form-item__content) {
          justify-content: flex-end;
        }
      }

      :deep(.el-textarea__inner) {
        border: 0 !important;
        resize: none !important;
        box-shadow: none;
        background-color: transparent !important;
      }
    }
  }

  .catalog {
    background-color: rgba(59, 80, 149, .1);
    height: 100%;
    display: flex;
    flex-direction: column;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;


    .titleName {
      height: 100px;
      text-align: center;
      line-height: 100px;
      color: white;
      font-size: 30px;
      user-select: none; /* 禁用文本选择 */
    }

    .search {
      text-align: center;
      margin-bottom: 10px;

      .search-button, .search-input {
        background-color: rgba(0, 0, 0, 0);
        box-shadow: inset 0 -1px 1px 0 #0453fc;
        border-color: #FFFFFF00;
        height: 44px;
      }

      .search-button {
        border-radius: 12px 0 0 12px;
      }

      .search-input {
        border-radius: 0 12px 12px 0;
        color: whitesmoke;
        width: 170px;
      }
    }

    .list {
      flex: 1;
      overflow-y: scroll; /* 使内容可以垂直滚动 */

      li {
        list-style-type: none; /* 先去掉默认的小圆点 */
        position: relative; /* 为了定位伪元素 */
        margin-left: 40px;
        font-size: 20px;
        //height: 60px;
        line-height: 60px;
        color: #fff;
        user-select: none; /* 禁用文本选择 */

        ul {
          margin-top: 0px;
          margin-bottom: 0px;
          margin-right: 20px;

          li {
            line-height: 40px;
            margin-left: 0px;
            white-space: nowrap; /* 防止换行 */
            text-overflow: ellipsis; /* 使用省略号显示超出部分 */
          }

          li::before {
            content: ''; /* 空内容 */
            position: absolute; /* 定位 */
            right: 10px; /* 左偏移，调整圆点位置 */
            top: 20px; /* 垂直居中 */
            transform: translateY(-50%); /* 垂直居中 */
            width: 8px; /* 圆点的宽度 */
            height: 8px; /* 圆点的高度 */
            border-radius: 50%; /* 使其变成圆形 */
            background-color: #fff; /* 圆点颜色 */
            user-select: none; /* 禁用文本选择 */
          }

          //li.clicked {
          //  color: #9ed5ff;
          //  font-weight: 500;
          //  border-right: 2px solid transparent; /* 透明的边框，使border-image起作用 */
          //  border-image: linear-gradient(to top, #192a63, #7196ff, #192a63); /* 渐变从 #192a63 到更亮的颜色 #4f6abf */
          //  border-image-slice: 1; /* 使渐变充满整个边框 */
          //}
        }

        li.clicked::before {
          background-image: linear-gradient(151deg, #66c8f2, #35f 66%);
        }

      }

      li::before {
        content: ''; /* 空内容 */
        position: absolute; /* 定位 */
        left: -20px; /* 左偏移，调整圆点位置 */
        top: 30px; /* 垂直居中 */
        transform: translateY(-50%); /* 垂直居中 */
        width: 8px; /* 圆点的宽度 */
        height: 8px; /* 圆点的高度 */
        border-radius: 50%; /* 使其变成圆形 */
        background-color: #fff; /* 圆点颜色 */
        user-select: none; /* 禁用文本选择 */
      }

      //li.clicked {
      //  color: #9ed5ff;
      //  font-weight: 500;
      //  border-right: 2px solid transparent; /* 透明的边框，使border-image起作用 */
      //  border-image: linear-gradient(to top, #192a63, #7196ff, #192a63); /* 渐变从 #192a63 到更亮的颜色 #4f6abf */
      //  border-image-slice: 1; /* 使渐变充满整个边框 */
      //}

      li.clicked::before {
        background-image: linear-gradient(151deg, #66c8f2, #35f 66%);
      }
    }

    /* 隐藏滚动条 */

    .list::-webkit-scrollbar {
      display: none;
    }
  }

}

.toggle-button {
  // 基础样式
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  padding: 5px 12px;
  color: white;
  cursor: pointer;
  width: 100px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
  user-select: none;

  // 悬停时的流动边框
  &:hover {
    border-color: transparent; // 隐藏原始边框

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 6px;
      padding: 1px; // 边框厚度
      background: linear-gradient(90deg,
      #0453fc,
      #00f7ff,
      #0453fc,);
      background-size: 200% auto;
      -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: borderFlow 1.5s linear infinite;
      z-index: 0;
    }
  }
}

@keyframes borderFlow {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

.close {
  position: relative;
  top: -20px;
  left: 10px;
}

.open {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.timeLabel {
  background-color: rgba(32, 99, 150, 0.8);
  border-radius: 20px;
  height: 6%;
  width: 12%;
  top: 0%;
  position: absolute;
  z-index: 9;
  color: #FFFFFF;
  font-size: 16px;
  left: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>


