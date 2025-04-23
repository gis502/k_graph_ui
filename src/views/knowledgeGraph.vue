<template>
  <div class="content-body">
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
            v-for="item in newList"
            :key="item.id"
            :class="{'clicked': currentIndex === item.id}"
            @click="showDescription(item,item.value)"
        >{{ item.value }}
        </li>
      </div>
    </div>

    <div class="knowledgeGraph">
      <div class="chartContainer" ref="chart"></div>
    </div>

    <div class="toggle-button open" @click="updateChartData" v-show="ifShowCatalog">问答助手</div>

    <div class="chat-panel" v-if="showChat">
      <div class="chat-title">小助手</div>
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
            ></el-input>
          </el-form-item>
          <!--input输入-->
          <el-form-item label="" prop="" class="send-btn">
            <el-button type="primary" @click="sendMessage" :disabled="loading"
            >发送(ctrl+enter)
            </el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {Position, Search} from "@element-plus/icons-vue";
import * as echarts from 'echarts';
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue';
import {getChartDataBy, getGraphData} from "@/api/system/knowledgeGraph.js";
import {MdPreview} from "md-editor-v3";
import {ElMessage} from "element-plus";
import AnalysisChart1 from '@/views/AnalysisChart1.vue';
import AnalysisChart2 from '@/views/AnalysisChart2.vue';


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
  }
})
// 响应式数据
const inputValue = ref('');
const currentIndex = ref(null);
const showChat = ref(false);
const formData = ref({});
const messageList = ref([]);
const loading = ref(false);
const chart = ref(null);
const chartData = ref([]);
const lastChartData = ref([]);
const chartLinks = ref([]);
const echartsInstance = ref(null);

// 控制左侧列表是否隐藏
const ifShowCatalog = ref(true);
// 左侧列表数据
const list = [
  {value: "基础背景信息"},
  {value: "地震灾害和救灾背景信息"},
  {value: "地震台网信息"},
  {value: "救灾能力储备信息"},
  {value: "应急联络信息"},
  {value: "预案与规划信息"},
  {value: "防震减灾示范与演习经验信息"},
  {value: "地震震情信息"},
  {value: "地震灾情信息"},
  {value: "应急指挥协调信息"},
  {value: "应急决策信息"},
  {value: "应急处置信息"},
  {value: "态势标绘信息"},
  {value: "灾害现场动态信息"},
  {value: "社会反应动态信息"},
  {value: "救援物资信息"}
];
const newList = ref([]);

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

// 获取数据并初始化图表
const getData = async () => {
  try {
//const res = await getGraphData();
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

// 初始化图表
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

  if (echartsInstance.value !== null) {
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
  currentIndex.value = item.id;
  focusNode(value);
};

// 发送消息
const sendMessage = () => {
  const message = formData.value.content?.trim();
  if (!message) {
    ElMessage.warning('请输入内容');
    return;
  }

  messageList.value.push({
    type: 0,
    content: message,
  });

  messageList.value.push({
    type: 1,
    content: [],
    loading: true,
  });

  loading.value = true;
  formData.value.content = '';

  // 模拟 SSE 连接
  const eventSource = new EventSource(`http://localhost:8080/seek/stream?message=${encodeURIComponent(message)}`);

  eventSource.onmessage = (event) => {
    if (event.data === 'end') {
      closeEventSource();
      return;
    }

    try {
      const response = JSON.parse(event.data).content;
      const lastMsg = messageList.value[messageList.value.length - 1];
      lastMsg.content.push(response);

      nextTick(() => {
        const panel = document.getElementById('message-panel');
        if (panel) panel.scrollTop = panel.scrollHeight;
      });
    } catch (e) {
      console.error('解析消息失败:', e);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE 错误:', error);
    closeEventSource();
  };
  const closeEventSource = () => {
    eventSource.close();
    const lastMsg = messageList.value[messageList.value.length - 1];
    if (lastMsg) lastMsg.loading = false;
    loading.value = false;
  };
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

// watch(() => props.currentTime, (newTime) => {
//       console.log('currentTime changed:', new Date(newTime));
//       const time1 = new Date("2022-06-02 00:00:00");
//       const time2 = new Date("2022-06-05 00:00:00");
//       const time3 = new Date("2022-06-08 00:00:00");
//       const time4 = new Date("2022-06-10 00:00:00")
//       switch (true) {
//         case new Date(newTime) < time1:
//           console.log("时间早于 2022-06-02");
//           chartData.value = [
//             {name: '项目', symbolSize: 80},
//             {name: '聂天宇', symbolSize: 60},
//           ]
//           chartLinks.value = [
//             {source: '项目', target: '聂天宇', value: '项目负责人'},
//           ]
//           initChart();
//           break;
//         case new Date(newTime) >= time1 && new Date(newTime) < time2:
//           console.log("时间在 2022-06-01 到 2022-06-05 之间");
//           chartData.value = [
//             {name: '项目', symbolSize: 80},
//             {name: '聂天宇', symbolSize: 60},
//             {name: '江立珂', symbolSize: 60},
//           ]
//           chartLinks.value = [
//             {source: '项目', target: '聂天宇', value: '项目负责人'},
//             {source: '项目', target: '江立珂', value: '项目成员'},
//           ]
//           initChart();
//           break;
//         case new Date(newTime) >= time2 && new Date(newTime) < time3:
//           console.log("时间在 2022-06-05 到 2022-06-08 之间");
//           chartData.value = [
//             {name: '项目', symbolSize: 80},
//             {name: '聂天宇', symbolSize: 60},
//             {name: '江立珂', symbolSize: 60},
//             {name: '白颜诺', symbolSize: 60},
//           ]
//           chartLinks.value = [
//             {source: '项目', target: '聂天宇', value: '项目负责人'},
//             {source: '项目', target: '江立珂', value: '项目成员'},
//             {source: '项目', target: '白颜诺', value: '项目成员'},
//           ]
//           initChart();
//           break;
//         case new Date(newTime) >= time3 && new Date(newTime) < time4:
//           console.log("时间在 2022-06-08 到 2022-06-10 之间");
//           chartData.value = [
//             {name: '项目', symbolSize: 80},
//             {name: '聂天宇', symbolSize: 60},
//             {name: '江立珂', symbolSize: 60},
//             {name: '白颜诺', symbolSize: 60},
//             {name: '李涌鑫', symbolSize: 60},
//           ]
//           chartLinks.value = [
//             {source: '项目', target: '聂天宇', value: '项目负责人'},
//             {source: '项目', target: '江立珂', value: '项目成员'},
//             {source: '项目', target: '白颜诺', value: '项目成员'},
//             {source: '项目', target: '李涌鑫', value: '项目牛马'},
//           ]
//           initChart();
//         default:
//           console.log("时间晚于或等于 2022-06-08");
//       }
//     });

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
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row; /* 使元素横向排列 */
  // 确保 flex 容器允许子元素增长和收缩
  border-radius: 20px;
  z-index: 2;
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

  > * {
    flex-shrink: 1;
  }

  .knowledgeGraph {
    flex: 1;
    height: 100%;

    .chartContainer {
      width: 100%;
      height: 100%;
      min-width: 0; // 防止 flex 项目溢出
    }
  }

  .sentimentAnalysis {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;

    .sentimentAnalysis-title {
      width: 100%;
      height: 50px;
      line-height: 50px;
      color: whitesmoke;
      text-align: center;
      font-size: 30px;
      margin-bottom: 20px;
    }

    .sentimentAnalysisChart1, .sentimentAnalysisChart2 {
      flex: 1;
      width: 100%;
      height: calc(50% - 20px);
      margin-bottom: 20px;
    }
  }

  .chat-panel {
    //background: #eff0f6;
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
          }

          .content-inner {
            background: #2d65f7;
            border-radius: 5px;
            padding: 10px;
            color: #fff;
          }
        }

        .ai-item {
          line-height: 23px;

          .message-content {
            display: block;
            background: #fff;
            border-radius: 5px;
          }

          .user-icon {
            background: #64018f;
            margin-left: 0px;
          }

          :deep(.md-editor-previewOnly) {
            border-radius: 5px;
            background: #fff;
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
      background: #fff;
      border-radius: 20px;
      padding: 5px;

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
      }
    }
  }

  .catalog {
    background-color: rgba(0, 0, 0, 0);
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
      flex-shrink: 0; /* 防止盒子宽度缩小 */
      width: 200px;

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
        width: 140px;
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
        height: 60px;
        line-height: 60px;
        color: #fff;
        user-select: none; /* 禁用文本选择 */
      }

      li::before {
        content: ''; /* 空内容 */
        position: absolute; /* 定位 */
        left: -20px; /* 左偏移，调整圆点位置 */
        top: 50%; /* 垂直居中 */
        transform: translateY(-50%); /* 垂直居中 */
        width: 8px; /* 圆点的宽度 */
        height: 8px; /* 圆点的高度 */
        border-radius: 50%; /* 使其变成圆形 */
        background-color: #fff; /* 圆点颜色 */
        user-select: none; /* 禁用文本选择 */
      }

      li.clicked {
        color: #9ed5ff;
        font-weight: 500;
        border-right: 2px solid transparent; /* 透明的边框，使border-image起作用 */
        border-image: linear-gradient(to top, #192a63, #7196ff, #192a63); /* 渐变从 #192a63 到更亮的颜色 #4f6abf */
        border-image-slice: 1; /* 使渐变充满整个边框 */
      }

      li.clicked::before {
        background-image: linear-gradient(151deg, #66c8f2, #35f 66%);
      }
    }

    /* 隐藏滚动条 */

    .list::-webkit-scrollbar {
      display: none;
    }
  }

  .observationWindow {
    pointer-events: none;
    height: 100%;
    width: 48%;
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

</style>


