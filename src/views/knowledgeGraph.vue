<template>
  <div class="content-body">
    <div class="catalog">
      <div class="titleName">
        知识图谱
      </div>
      <div class="search">
        <el-button type="primary" class="search-button" @click="focusNode(inputValue)" >
          <el-icon><Search /></el-icon>
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
        >{{item.value}}</li>
      </div>
    </div>
    <div class="knowledgeGraph">
      <div class="chartContainer" ref="chart"></div>
    </div>
    <div class="details">
      <!--      <div class="details-description">{{detailsName}}</div>-->
      <!--      <p>{{currentDescription}}</p>-->
      <div class="details-description">地震参数</div>
      <div class="img-box">
        <img src="https://tse2-mm.cn.bing.net/th/id/OIP-C.cj-wC8g2ByprUYJ_15wepAHaGn?rs=1&pid=ImgDetMain" alt="">
      </div>
      <div class="basic-info">
        <p class="basic">基本信息</p>
        <p>序号: 001</p>
        <p>发震时间: 2022-06-06 14:45:00</p>
        <p>地点: 29.596°N, 106.487°E</p>
        <p>震级: 6.3</p>
        <p>震源深度: 10 km</p>
        <p>烈度: VIII (强烈)</p>
        <p>地震名称: 庐山地震</p>
        <p>提供部门: 国家地震局</p>
        <p>唯一标识: Lushan_2022_06_06</p>
      </div>
      <div class="divider"></div>
      <div class="entry-overview">
        <p class="entry-overview-basic">词条概述</p>
        <p class="text">地震参数是用于描述地震事件特征的基本数据，涵盖了地震发生的时间、地点、规模、深度以及对周围环境的影响等方面的信息。这些参数为地震研究、灾后评估、应急响应及地震预警系统提供了重要依据。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";
import * as echarts from 'echarts';
import { ref,onMounted} from 'vue';
import {getGraphData} from "@/api/system/knowledgeGraph.js";

// 搜索框内容
const inputValue = ref('');
// 关系图echarts
const chart =ref(null);
const chartData = ref([]);
const chartLinks = ref([]);
// 右侧内容标题及其内容
const currentDescription = ref('2022年四川省雅安市庐山县地震');
const detailsName = ref('详细介绍')
// 左侧用于存储当前被点击的 li 的索引
const currentIndex = ref(null);
// 左侧列表标准数据
const list = [
  {
    value:"基础背景信息",
  },
  {
    value:"地震灾害和救灾背景信息",
  },
  {
    value:"地震台网信息",
  },
  {
    value:"救灾能力储备信息",
  },
  {
    value:"应急联络信息",
  },
  {
    value:"预案与规划信息",
  },
  {
    value:"防震减灾示范与演习经验信息",
  },
  {
    value:"地震震情信息",
  },
  {
    value:"地震灾情信息",
  },
  {
    value:"应急指挥协调信息",
  },
  {
    value:"应急决策信息",
  },
  {
    value:"应急处置信息",
  },
  {
    value:"态势标绘信息",
  },
  {
    value:"灾害现场动态信息",
  },
  {
    value:"社会反应动态信息",
  },
  {
    value:"救援物资信息",
  }
];
const newList = ref([]);
// 关系图配置项
let echartsInstance ;
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
      edgeLength: [100,400],
      layoutAnimation: true,
    },
    symbolSize: 70,
    nodeScaleRatio: 1, //图标大小是否随鼠标滚动而变
    roam: true, //缩放
    zoom:1,
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

    chartData.value = Array.from(nodeSet).map(name => ({ name }));

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
      }else if(item.name === '地震震情信息s'){
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

// eharts搜索后自动聚焦功能
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
const showDescription = (item,value)=>{
  currentIndex.value = item.id;
  focusNode(value);
};

// 关系图生成时机
onMounted(()=>{
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
    background-color:#1a4377;
    flex-shrink: 0;           /* 防止盒子宽度缩小 */

    .chartContainer{
      width: 100%;
      height: 100%;
    }
  }

  .details{

    .details-description{
      text-align: center;
      width: 300px;
      white-space: nowrap;    /* 防止换行 */
      overflow: hidden;    /* 隐藏溢出文本 */
      text-overflow: ellipsis; /* 使用省略号代替溢出部分 */
      height: 100px;
      line-height: 100px;
      color: white;
      font-size: 30px;
      user-select: none; /* 禁用文本选择 */
    }

    .img-box{
      margin-left: 23px;
      width: 85%;
      img{
        max-width: 100%;
        height: auto;
      }
    }

    .basic-info{
      .basic{
        width: 90%;
        color: white;
        margin-left: 1em;
        font-size: 20px;
        user-select: none; /* 禁用文本选择 */
      }

      p{
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

    .entry-overview{
      .entry-overview-basic{
        width: 90%;
        color: white;
        margin-left: 1em;
        font-size: 20px;
        user-select: none; /* 禁用文本选择 */
      }

      .text{
        margin-left: 2em;
        color: #a4acc7;
        text-indent: 2em;  /* 首行缩进两个字符 */
        line-height: 1.5;  /* 增加行间距，可以根据需求调整 */
      }
    }
  }

  .catalog, .details {
    background-color: #0e172b;
    flex: 8;
    height: 100%;
  }

  .catalog{
    display: flex;
    flex-direction: column;

    .titleName{
      height: 100px;
      text-align: center;
      line-height: 100px;
      color: white;
      font-size: 30px;
      user-select: none; /* 禁用文本选择 */
    }

    .search{
      text-align: center;
      margin-bottom: 10px;
      flex-shrink: 0;           /* 防止盒子宽度缩小 */

      .search-button,.search-input{
        background-color: #0c1c50 ;
        box-shadow: inset 0 -1px 1px 0 #2e4a91 ;
        border-color: #FFFFFF00;
        height: 44px;
      }

      .search-button{
        border-radius: 12px 0 0 12px;
      }

      .search-input{
        border-radius: 0 12px 12px 0;
        color: whitesmoke;
        width: 180px;
      }
    }
    .list{
      flex:1;
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
        border-image: linear-gradient(to top, #192a63, #7196ff,#192a63); /* 渐变从 #192a63 到更亮的颜色 #4f6abf */
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


</style>


