<template>
  <div class="content-body">
    <div class="catalog">
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
<!--      <iframe-->
<!--        src="http://172.17.130.189/chat/share?shared_id=c42fb59a128a11f09b130242ac130006&from=chat&auth=c3NTdhMWYwMTI4YjExZjBhNTA3MDI0Mm"-->
<!--        style="width: 100%; height: 100%; min-height: 600px"-->
<!--        frameborder="0"-->
<!--      >-->
<!--      </iframe>-->
    <div class="chat-panel" v-if="showChat">
      <div class="chat-title">小助手</div>
      <div class="close-button" @click="updateChartData">
        关闭助手
      </div>
      <div class="message-panel" id="message-panel">
        <div class="message-list">
          <div
            :class="['message-item', item.type == 1 ? 'ai-item' : '']"
            v-for="(item, index) in messageList"
            :id="'item' + index"
          >
            <template v-if="item.type == 0">
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
                  <img src="../assets/loading.gif" />
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
            >发送(ctrl+enter)</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {Search} from "@element-plus/icons-vue";
import * as echarts from 'echarts';
import {ref, onMounted, getCurrentInstance, nextTick} from 'vue';
import {getGraphData} from "@/api/system/knowledgeGraph.js";
import {MdPreview} from "md-editor-v3";
import {ElMessage} from "element-plus";


const { proxy } = getCurrentInstance();

const formData = ref({});
const messageList = ref([]);
const loading = ref(false);

const showChat = ref(true);

// 搜索框内容
const inputValue = ref('');
// 关系图echarts
const chart = ref(null);
const chartData = ref([]);
const chartLinks = ref([]);
// 左侧用于存储当前被点击的 li 的索引
const currentIndex = ref(null);
// 左侧列表标准数据
const list = [
  {
    value: "基础背景信息",
  },
  {
    value: "地震灾害和救灾背景信息",
  },
  {
    value: "地震台网信息",
  },
  {
    value: "救灾能力储备信息",
  },
  {
    value: "应急联络信息",
  },
  {
    value: "预案与规划信息",
  },
  {
    value: "防震减灾示范与演习经验信息",
  },
  {
    value: "地震震情信息",
  },
  {
    value: "地震灾情信息",
  },
  {
    value: "应急指挥协调信息",
  },
  {
    value: "应急决策信息",
  },
  {
    value: "应急处置信息",
  },
  {
    value: "态势标绘信息",
  },
  {
    value: "灾害现场动态信息",
  },
  {
    value: "社会反应动态信息",
  },
  {
    value: "救援物资信息",
  }
];
const newList = ref([]);
// 关系图配置项
let echartsInstance;
const echartsOption = ref({
  backgroundColor: {
    image: 'https://pic.52112.com/180408/180408_203/ZOvUpabmkG_small.jpg', // 支持 base64/网络URL
    repeat: 'repeat', // 不重复
    width: '100%',      // 宽度适配
    height: '100%',     // 高度适配
    opacity: 0.8        // 透明度（可选）
  },
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
    nodeScaleRatio: 1, //图标大小是否随鼠标滚动而变
    roam: true, //缩放
    zoom: 1,
    draggable: true, //节点是否可以拖拽
    focusNodeAdjacency: false, //是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点
    edgeSymbol: ['circle', 'arrow'], //线两头标记
    label: {
      normal: {
        show: true,
        position: 'inside',
        color: 'gold'
      }
    },
    edgeLabel: {
      normal: {
        show: true,
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        formatter: "{c}"
      }
    },
    categories: [{
      name: '属性',
    }, {
      name: '关系',
      symbol: 'rect'
    }],
    itemStyle: {
      normal: {
        borderColor: '#04f2a7',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#04f2a7',
        color: '#001c43',
      }
    },
    lineStyle: {
      normal: {
        opacity: 0.9,
        width: 2,
        curveness: 0,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#e0f55a' // 0% 处的颜色
          }, {
            offset: 1,
            color: '#639564' // 100% 处的颜色
          }],
          globalCoord: false // 缺省为 false
        }
      }
    },
    symbolKeepAspect: false,
    data: chartData.value,
    links: chartLinks.value
  }]
});

// 获取数据
const getData = () => {
  getGraphData().then(res => {
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

    // newList数据处理
    const validValues = new Set(list.map(item => item.value));
    newList.value = chartData.value
      .filter(item => validValues.has(item.name))
      .map((item, index) => ({
        id: index + 1,
        value: item.name
      }));


    echartsOption.value.series[0].data = chartData.value.map((item, index) => {
      // 设置基础背景信息节点为红色
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
    })
    echartsOption.value.series[0].links = chartLinks.value

    echartsInstance = echarts.init(chart.value);
    echartsInstance.setOption(echartsOption.value);

    // handleClick(echartsInstance, echartsOption);

  });
}

const updateChartData = () => {
  showChat.value = false;
};

const keySend = (event) => {
  if (!(event.ctrlKey && event.key === 'Enter')) {
    return;
  }
  sendMessage();
};

const sendMessage = () => {
  const message = formData.value.content;
  if (!message) {
    ElMessage({
      type: 'warning',
      message: '请输入内容',
      duration: 2000,
    });
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

  const eventSource = new EventSource(`http://localhost:8080/seek/stream?message=${message}`);
  console.log(eventSource)
  formData.value.content = '';
  eventSource.onmessage = (event) => {
    let response = event.data;
    console.log(response);
    if (response === 'end') {
      close();
      return;
    }
    response = JSON.parse(response).content;
    messageList.value[messageList.value.length - 1].content.push(response);
    //滚动到底部
    nextTick(() => {
      const content = document.getElementById('message-panel');
      content.scrollTop = content.scrollHeight;
    });
  };

  eventSource.onerror = (error) => {
    close();
  };

  const close = () => {
    eventSource.close();
    messageList.value[messageList.value.length - 1].loading = false;
    loading.value = false;
  };
};

// echarts搜索后自动聚焦功能
function focusNode(nodeName) {
  // 1. 检查空输入
  if (!nodeName || !nodeName.trim()) {
    inputValue.value = ''; // 清空输入框
    return;
  }

  // 2. 检查节点是否存在
  const index = findNodeIndex(nodeName);
  if (index === -1) {
    console.warn(`节点 "${nodeName}" 不存在`);
    inputValue.value = ''; // 清空输入框
    return;
  }

  // 3. 执行聚焦操作
  echartsInstance.dispatchAction({
    type: 'highlight',
    name: nodeName
  });

  echartsInstance.dispatchAction({
    type: 'focusNodeAdjacency',
    seriesIndex: 0,
    dataIndex: index
  });

  // 4. 清空输入框（无论成功与否）
  inputValue.value = '';
}

// 辅助函数：查找节点索引（兼容大小写）
function findNodeIndex(name) {
  return echartsOption.value.series[0].data.findIndex(
    node => node.name.toLowerCase() === name.toLowerCase()
  );
}

// 定义点击事件的处理函数
// const handleClick = (echartsInstance, echartsOption) => {
//   echartsInstance.on('click', function (params) {
//     if (params.dataType === 'node') {
//       const clickedNode = params.data.name;
//
//       // 定义一个用于更新节点和边数据的函数
//       const updateChartData = (newNodes, newLinks) => {
//         echartsOption.value.series[0].data = newNodes;
//         echartsOption.value.series[0].links = newLinks;
//         echartsInstance.setOption(echartsOption.value);
//       };
//
//       let newNodes = [];
//       let newLinks = [];
//
//       // 根据点击的节点更新新的节点和边数据
//       if (clickedNode === '震前准备') {
//         newNodes = [
//           { name: '震前准备' },
//           { name: '基础背景信息' },
//           { name: '历史自然灾害信息' },
//           { name: '地震灾害和救灾背景信息' },
//           { name: '地震台网信息' },
//           { name: '救灾能力储备信息' },
//           { name: '应急联络信息' },
//           { name: '已有地震对策信息' },
//           { name: '法律法规信息' },
//           { name: '预案与规划信息' },
//           { name: '防震减灾示范与演习经验信息' }
//         ];
//         newLinks = [
//           { source: '震前准备', target: '基础背景信息', value: '分类' },
//           { source: '震前准备', target: '历史自然灾害信息', value: '分类' },
//           { source: '震前准备', target: '地震灾害和救灾背景信息', value: '分类' },
//           { source: '震前准备', target: '地震台网信息', value: '分类' },
//           { source: '震前准备', target: '救灾能力储备信息', value: '分类' },
//           { source: '震前准备', target: '应急联络信息', value: '分类' },
//           { source: '震前准备', target: '已有地震对策信息', value: '分类' },
//           { source: '震前准备', target: '法律法规信息', value: '分类' },
//           { source: '震前准备', target: '预案与规划信息', value: '分类' },
//           { source: '震前准备', target: '防震减灾示范与演习经验信息', value: '分类' }
//         ];
//       } else if (clickedNode === '震后生成') {
//         newNodes = [
//           { name: '震后生成' },
//           { name: '地震震情信息' },
//           { name: '地震灾情信息' },
//           { name: '应急指挥协调信息' },
//           { name: '应急响应信息' },
//           { name: '应急决策信息' },
//           { name: '应急处置信息' },
//           { name: '态势标绘' },
//           { name: '灾害现场动态信息' },
//           { name: '社会反应动态信息' }
//         ];
//         newLinks = [
//           { source: '震后生成', target: '地震震情信息', value: '分类' },
//           { source: '震后生成', target: '地震灾情信息', value: '分类' },
//           { source: '震后生成', target: '应急指挥协调信息', value: '分类' },
//           { source: '震后生成', target: '应急响应信息', value: '分类' },
//           { source: '震后生成', target: '应急决策信息', value: '分类' },
//           { source: '震后生成', target: '应急处置信息', value: '分类' },
//           { source: '震后生成', target: '态势标绘', value: '分类' },
//           { source: '震后生成', target: '灾害现场动态信息', value: '分类' },
//           { source: '震后生成', target: '社会反应动态信息', value: '分类' }
//         ];
//       } else if (clickedNode === '基础背景信息详细1') {
//         newNodes = [
//           { name: '呵呵' },
//           { name: '哈哈' }
//         ];
//         newLinks = [
//           { source: '哈哈', target: '呵呵', value: '关系' }
//         ];
//       } else if (clickedNode === '地震参数') {
//         let relatedNodes = [];
//
//         // 查找与“地震参数”相关的节点
//         echartsOption.value.series[0].links.forEach(link => {
//           if (link.source === '地震参数' && link.value === '属性') {
//             relatedNodes.push(link.target);
//           } else if (link.target === '地震参数' && link.value === '属性') {
//             relatedNodes.push(link.source);
//           }
//         });
//
//         // 切换相关节点的可见性
//         const updatedNodes = echartsOption.value.series[0].data.map(item => {
//           // 如果该节点与“地震参数”相关，切换显示状态
//           if (relatedNodes.includes(item.name)) {
//             // 通过 itemStyle 来控制节点的显示和隐藏
//             item.itemStyle = item.itemStyle || {}; // 防止 itemStyle 未定义
//             item.itemStyle.opacity = item.itemStyle.opacity === 0 ? 1 : 0; // 切换节点透明度，0 为隐藏，1 为显示
//
//             // 也可以通过 label.show 来控制标签显示
//             item.label = item.label || {};  // 防止 label 未定义
//             item.label.show = item.label.show === false ? true : false;  // 切换标签显示
//           }
//
//           return item;
//         })
//       }else {
//         // 默认情况，展示其他节点
//         newNodes = [
//           { name: '基础背景信息' },
//           { name: '地震灾害和救灾背景信息' },
//           { name: '地震台网信息' },
//           { name: '救灾能力储备信息' },
//           { name: '应急联络信息' },
//           { name: '预案与规划信息' },
//           { name: '防震减灾示范与演习经验信息' },
//           { name: '地震震情信息'  },
//           { name: '地震灾情信息' },
//           { name: '应急指挥协调信息' },
//           { name: '应急决策信息' },
//           { name: '应急处置信息' },
//           { name: '态势标绘信息' },
//           { name: '灾害现场动态信息' },
//           { name: '社会反应动态信息' },
//           { name: '法律法规信息' }
//         ];
//         newLinks = [
//           { source: 0, target: 1, value: '支持' },
//           { source: 0, target: 2, value: '支持' },
//           { source: 0, target: 3, value: '支持' },
//           { source: 1, target: 3, value: '影响' },
//           { source: 1, target: 4, value: '影响' },
//           { source: 2, target: 7, value: '支持' },
//           { source: 2, target: 10, value: '支持' },
//           { source: 3, target: 11, value: '支持' },
//           { source: 4, target: 9, value: '支持' },
//           { source: 4, target: 12, value: '影响' },
//           { source: 5, target: 10, value: '指导' },
//           { source: 5, target: 13, value: '支持' },
//           { source: 6, target: 8, value: '影响' },
//           { source: 6, target: 14, value: '支持' },
//           { source: 7, target: 8, value: '影响' },
//           { source: 7, target: 10, value: '影响' },
//           { source: 8, target: 13, value: '提供' },
//           { source: 8, target: 15, value: '提供' }
//         ];
//       }
//
//       // 更新图表数据
//       updateChartData(newNodes, newLinks);
//     }
//   });
// };
// 右侧内容标题与左侧列表点击关联函数
const showDescription = (item, value) => {
  currentIndex.value = item.id;
  focusNode(value);
};

// 关系图生成时机
onMounted(() => {
  getData();
})
</script>

<style scoped lang="less">
// 采用css嵌套语法书写
.content-body {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row; /* 使元素横向排列 */

  .knowledgeGraph {
    flex: 32;
    height: 100%;
    background-color: #1a4377;
    flex-shrink: 0; /* 防止盒子宽度缩小 */

    .chartContainer {
      width: 100%;
      height: 100%;
    }
  }

  .details {

    .details-description {
      text-align: center;
      width: 300px;
      white-space: nowrap; /* 防止换行 */
      overflow: hidden; /* 隐藏溢出文本 */
      text-overflow: ellipsis; /* 使用省略号代替溢出部分 */
      height: 100px;
      line-height: 100px;
      color: white;
      font-size: 30px;
      user-select: none; /* 禁用文本选择 */
    }

    .img-box {
      margin-left: 23px;
      width: 85%;

      img {
        max-width: 100%;
        height: auto;
      }
    }

    .basic-info {
      .basic {
        width: 90%;
        color: white;
        margin-left: 1em;
        font-size: 20px;
        user-select: none; /* 禁用文本选择 */
      }

      p {
        margin-left: 2em;
        color: #a4acc7;
      }
    }

    .divider::before {
      content: '';
      display: block;
      width: 250px;
      height: 1px;
      background-color: #34467f;
      margin-left: 25px;
    }

    .entry-overview {
      .entry-overview-basic {
        width: 90%;
        color: white;
        margin-left: 1em;
        font-size: 20px;
        user-select: none; /* 禁用文本选择 */
      }

      .text {
        margin-left: 2em;
        color: #a4acc7;
        text-indent: 2em; /* 首行缩进两个字符 */
        line-height: 1.5; /* 增加行间距，可以根据需求调整 */
      }
    }
  }

  .catalog, .details {
    background-color: #0e172b;
    height: 100%;
  }

  .catalog {
    display: flex;
    flex-direction: column;

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

      .search-button, .search-input {
        background-color: #0c1c50;
        box-shadow: inset 0 -1px 1px 0 #2e4a91;
        border-color: #FFFFFF00;
        height: 44px;
      }

      .search-button {
        border-radius: 12px 0 0 12px;
      }

      .search-input {
        border-radius: 0 12px 12px 0;
        color: whitesmoke;
        width: 180px;
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
}

.chat-panel {
  background: #eff0f6;
  height: calc(100vh);
  .chat-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .message-panel {
    position: relative;
    height: calc(100vh - 200px);
    overflow: auto;
    padding-bottom: 10px;
    .message-list {
      margin: 0px auto;
      width: 450px;
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
    border-radius: 5px;
    padding: 10px;
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

.no-data {
  text-align: center;
  color: #5f5f5f;
}

.close-button {
  position: relative;
  background-color: #6897bb;
  left: 10px;
  border-radius: 5px;
  padding: 5px;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #4f6abf;
  }
  width: 100px;
  height: 30px;
  text-align: center;
}

</style>


