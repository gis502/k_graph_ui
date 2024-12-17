<template>
  <div class="container">
    <span style="padding-left: 5px;background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%); ">
      更新时间：{{lastTime}}
    </span>
    <!-- ECharts 图表替代 top-section -->
    <div class="top-section">
      <div class="chart" ref="chart"></div>
    </div>

    <span style="padding-left: 5px;background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%); ">
      更新时间：{{lastTime2}}
    </span>
    <!-- ECharts 饼图替代 bottom-section -->
    <div class="bottom-section">
      <div class="pie-chart" ref="pieChart"></div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, defineProps, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import img from '@/assets/cirque.png';
import {getWorkGroupInfo} from "@/api/system/systemApi.js";
import {useGlobalStore} from "@/store/index.js";

const eqid = ref('');
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
});
eqid.value = props.eqid
// const color = ['#00FFFF', '#409B5C', '#006CED', '#FFE000'];  // 震级类别的颜色

const formatDateChina = (dateStr) => {
  if(dateStr){
    const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  }
};

// 1111111111111
const workGroupName = ref([]); // 各工作组名称
const workGroupNameInfo = ref([]); // 上传数量lastTime
const lastTime = ref(''); // 上传数量
const store = useGlobalStore()
// // 定义图表容器的 ref
const chart = ref(null);
let echartInstance1 = null;

// 22222222222
// 这行代码里面的赋值已经不再是neweqid的默认值，这里的作用是为了一开始watch没有监听到eqid值变化的时候给的值
// 防止因为没有eqid的传值而报错，删除或者更换为空值或者其他非正常eqid值都会报错
const lastTime2 = ref(''); // 上传数量
const neweqid = ref('');
neweqid.value = store.globalEqId
const bxArea = ref(0);  // 宝兴区
const lsArea = ref(0);  // 芦山县
const ycArea = ref(0);  // 雨城区
const msArea = ref(0);  // 名山区
const yjArea = ref(0);  // 荥经县
const tqArea = ref(0);  // 天全县
const smArea = ref(0);  // 石棉县
const hyArea = ref(0);  // 汉源县
const all_aftershocks = ref(0);// 定义图表数据
const pieChartData = ref([]);
// // 定义图表容器的 ref
const pieChart = ref(null);
let chartsInstance2 = null;

// ----------------------------------后端获取数据-------------------------------------------

// 11111111
function workGroupInfoData1(eqid) {
  getWorkGroupInfo(eqid).then(res => {
    // console.log('1.---------------------------------------------')
    // console.log(res.data.workGroupData)
    // console.log(res.data.lastTime)
    update(res.data.workGroupData, res.data.lastTime)
  });
}
function formatDate1(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) return '无效日期'; // 检查日期有效性

  const pad = (num) => (num < 10 ? '0' + num : num); // 补零函数

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 月份从 0 开始
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}
function update(data, time) {
  // 如果返回的数组为空，设置默认值
  if (data.length === 0) {
    workGroupName.value = ['抱歉暂无数据'];
    workGroupNameInfo.value = [0];
    lastTime.value = '';
  } else {
    workGroupName.value = data.map(item => item.workgroupname || '无数据');
    workGroupNameInfo.value = data.map(item => item.workgroupnameinfo || 0);

    if (time) {
      const formattedTime = formatDate1(new Date(time));
      if (!lastTime.value || new Date(time) > new Date(lastTime.value)) {
        lastTime.value = formattedTime;
      }

      console.log("当前时间-》", lastTime.value)

    }

  }
  echartInstance1.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return params.map(item => `
        <span>${workGroupName.value[item.dataIndex]}</span><br/> <!-- 新增的工作组名称标签 -->
        <span>${item.seriesName} : ${item.value}</span> <!-- 原有的标签 -->
        <br/>`).join('');
      }
    },
    xAxis: {
      data: workGroupName.value,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#00c7ff"
        },
        formatter: function (value) {
          if (value.length > 3) {
            return value.substr(0, 3) + '...'
          } else {
            return value
          }
        }
      }
    },
    series: [
      {
        data: workGroupNameInfo.value
      },
    ]
  });
}
setTimeout(() => {
  getWorkGroupInfo(store.globalEqId).then(res => {
    // console.log(res.data.workGroupData, '------------>')
    update(res.data.workGroupData, res.data.lastTime)
  })
}, 500)
const initChart1 = () => {
  echartInstance1 = echarts.init(chart.value);
  const barChartOption ={
    backgroundColor: 'transparent',
    title: {
      text: '转移安置信息统计',
      textStyle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
      },
      left: 'center',
      top: '-2%',
    },
    grid: {top: '23%', right: '3%', left: '5%', bottom: '15%'},
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17,95,182,0.5)',  // 背景颜色
      textStyle: {
        color: "#fff"  // 文本颜色
      },
      axisPointer: {
        type: 'shadow'  // 鼠标指针样式
      },
      formatter: '{b}<br/>数量: {c}'  // 格式化显示内容，b 是区域名称，c 是数量
    },
    xAxis: {
      type: 'category',
      data: workGroupName.value,  // 这里是区域名称数据
      axisLine: {
        lineStyle: {
          color: '#ddd'  // 轴线颜色
        }
      },
      axisLabel: {
        color: '#fff'  // 轴标签文字颜色
      },
      nameTextStyle: {
        color: '#fff'  // 轴名颜色
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#fff'  // Y 轴标签文字颜色
      },
      nameTextStyle: {
        color: '#fff'  // Y 轴名颜色
      }
    },
    legend: {
      show: false, // 不显示图例
    },
    series: [{
      name: '数量',
      type: 'bar',
      data: workGroupNameInfo.value,  // 这里是对应数量的数据
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            { offset: 0, color: '#00FFB4' },  // 渐变色起始颜色
            { offset: 1, color: 'rgba(0, 255, 255, 0.1)' } // 渐变色结束颜色
          ]),
          opacity: 1, // 设置柱子的透明度
          barBorderRadius: [0, 30, 30, 0],  // 设置圆角
        }
      },
      barWidth: 10,  // 柱子宽度
      barGap: 1,     // 柱子之间的间距
      label: {
        show: true,
        position: 'top', // 标签显示在柱子顶部
        color: '#fff',  // 标签文字颜色
        fontSize: 14,  // 标签文字大小
        formatter: '{c}'  // 在柱子顶部显示数量
      }
    }]
  };
  echartInstance1.setOption(barChartOption);
};


// 22222
function formatDate2(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  };
  return new Intl.DateTimeFormat('zh-CN', options).format(date).replace(/\//g, '-').replace(',', '');
}
function updateData(data, time) {
  // 初始化区域数据
  bxArea.value = 0;
  lsArea.value = 0;
  ycArea.value = 0;
  msArea.value = 0;
  yjArea.value = 0;
  tqArea.value = 0;
  smArea.value = 0;
  hyArea.value = 0;
  all_aftershocks.value = 0;
  lastTime2.value = '';

  // 遍历数据
  data.forEach(item => {
    switch (item.workgroupname) {
      case '宝兴县':
        bxArea.value = item.workgroupnameinfo;
        break;
      case '芦山县':
        lsArea.value += item.workgroupnameinfo;
        break;
      case '雨城区':
        ycArea.value += item.workgroupnameinfo;
        break;
      case '名山区':
        msArea.value += item.workgroupnameinfo;
        break;
      case '荥经县':
        yjArea.value += item.workgroupnameinfo;
        break;
      case '天全县':
        tqArea.value += item.workgroupnameinfo;
        break;
      case '石棉县':
        smArea.value += item.workgroupnameinfo;
        break;
      case '汉源县':
        hyArea.value += item.workgroupnameinfo;
        break;
    }
    if (time) {
      const formattedTime = formatDateChina(time);
      lastTime2.value = formattedTime;
      // console.log('2.time---------',lastTime2.value)
    }
  });

  // 更新 pieChartData
  // pieChartData.value = [
  //   { value: bxArea.value, name: '宝兴县' },
  //   { value: lsArea.value, name: '芦山县' },
  //   { value: ycArea.value, name: '雨城区' },
  //   { value: msArea.value, name: '名山区' },
  //   { value: yjArea.value, name: '荥经县' },
  //   { value: tqArea.value, name: '天全县' },
  //   { value: smArea.value, name: '石棉县' },
  //   { value: hyArea.value, name: '汉源县' },
  // ];

  pieChartData.value = [
    {value: bxArea.value, name: '宝兴县', itemStyle: {normal: {color: '#00FFFF'}}},
    {value: lsArea.value, name: '芦山县', itemStyle: {normal: {color: '#409B5C'}}},
    {value: ycArea.value, name: '雨城区', itemStyle: {normal: {color: '#006CED'}}},
    {value: msArea.value, name: '名山区', itemStyle: {normal: {color: '#FFE000'}}},
    {value: yjArea.value, name: '荥经县', itemStyle: {normal: {color: 'rgb(255,116,0)'}}},
    {value: tqArea.value, name: '天全县', itemStyle: {normal: {color: 'rgba(248,27,27,0.98)'}}},
    {value: smArea.value, name: '石棉县', itemStyle: {normal: {color: 'rgba(255,0,0,0.74)'}}},
    {value: hyArea.value, name: '汉源县', itemStyle: {normal: {color: 'rgba(255,20,20,0.48)'}}},
  ];


  console.log('Updated pieChartData:', pieChartData.value);
}
function workGroupInfoData2(eqid) {
  getWorkGroupInfo(eqid).then(res => {
    // console.log('1.---------------------------------------------')
    // console.log(res.data.areaUploadData)
    // console.log(res.data.lastTime)
    updateData(res.data.areaUploadData, res.data.lastTime)
    nextTick(() => {
      initChart2();
    });
  })
}
const initChart2 = () => {
  // 没有获取到数据
  console.log('4.pieChartData.value-----------------------------------------------------')
  console.log(pieChartData.value)
  if (chartsInstance2) {
    chartsInstance2.dispose();  // 销毁旧实例
  }
  chartsInstance2 = echarts.init(pieChart.value);
  if (!pieChartData.value || pieChartData.value.length === 0) {
    console.log('No data available for pie chart');
    return;  // 没有数据时跳过渲染
  }

  const pieChartOption = {
    backgroundColor: 'transparent',
    title: {
      text: '各区统计信息',
      top: '36%',
      textAlign: "center",
      left: "49%",
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '400'
      },
    },
    graphic: {
      elements: [{
        type: "image",
        z: 3,
        style: {
          image: img,  // 替换为你想展示的图像
          width: 105,  // 缩小图片宽度
          height: 105  // 缩小图片高度
        },
        left: 'center',  // 可以适当调整，增加或减少数值来改变水平位置
        top: '20%',   // 可以适当调整，增加或减少数值来改变垂直位置
        position: [0, -20]  // 调整偏移量，这里改为向上偏移20，可以根据需要增大或减小
      }]
    },
    tooltip: {
      show: true,
      formatter: function(params) {
        return `${params.name}: ${params.value}次`;
      },
      backgroundColor: 'rgba(17,95,182,0.5)',
      textStyle: {
        color: "#fff"
      },
    },
    legend: {
      icon: "circle",
      orient: 'horizontal',
      data: pieChartData.value.map(item => item.name),  // 动态生成图例
      right: 70,
      bottom: -5,
      align: 'right',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      itemGap: 15
    },
    toolbox: {
      show: false
    },
    series: [{
      name: '',
      type: 'pie',
      clockWise: false,
      top:'-18%',
      radius: ['40%', '45%'],  // 增大外半径和内半径的差距
      hoverAnimation: false,
      itemStyle: {
        normal: {
          label: {
            show: true,
            position: 'outside',
            color: '#ddd',
            formatter: function(params) {
              return `${params.name}: ${params.value}次`;
            },
            rich: {
              name: {
                lineHeight: 12,  // 缩小行高
                padding: [0, 0, 3, 0]  // 缩小底部间距
              },
              percent: {
                lineHeight: 14,  // 设置为20以减少行高
                padding: [3, 0, 0, 0]  // 调整顶部间距
              }
            }
          },
          labelLine: {
            length: 30,
            length2: 20,
            show: true,
            color: '#00FFFF'
          }
        }
      },
      data: pieChartData.value.map((item, index) => ({
        ...item,
        itemStyle: {
          normal: {
            color: item.itemStyle.normal.color,
            borderWidth: 2,  // 设置边框宽度
            borderColor: item.itemStyle.normal.color,  // 设置边框颜色为该区域的颜色
            shadowBlur: 20,  // 设置阴影模糊度
            shadowColor: item.itemStyle.normal.color,  // 设置阴影颜色与该区域颜色相同
          }
        }
      }))  // 动态修改每个扇形的样式
    }]
  };

  chartsInstance2.setOption(pieChartOption);
};

// ---------------------------------------------------------------------------
// 在 onMounted 生命周期钩子中初始化图表
onMounted(() => {
  initChart1();
  workGroupInfoData2(neweqid.value);
  console.log("初始更新时间：", lastTime.value);  // 查看是否有初始值
  // Resize event listener
  // window.addEventListener('resize', resizeChart);
});// onBeforeUnmount(() => {
//   window.removeEventListener('resize', resizeChart);
// });

// const resizeChart = () => {
//   if (chart.value) {
//     chart.value.resize();
//   }
//   if (pieChart.value) {
//     pieChart.value.resize();
//   }
// };


// onBeforeUnmount(() => {
//   echartsInstance?.dispose(); // 释放实例
// });

</script>

<style scoped>
.container {
  margin: 0px;
  padding: 0px;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  height: 70vh; /* 让容器占满整个视口高度 */
}

.top-section, .bottom-section {
  flex: 1; /* 每个部分占据相等的高度 */
  display: flex;
  justify-content: center;
  align-items: center;
}


.chart{
  width: 350px;
  height: 25vh;
}

.pie-chart {
  width: 350px;
  height: 32vh;
}
</style>
