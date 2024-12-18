<template>
<!--    上面echarts-->
    <span>更新时间：{{ updateTime1 }}</span>
    <el-carousel :interval="4200" indicator-position="none" height="250px">
      <!-- 第一个页面，放一个 ECharts -->
      <el-carousel-item>
        <div ref="echart1" style="height: 250px;width:420px"></div>
      </el-carousel-item>
      <!-- 第二个页面，放三个 ECharts -->
      <el-carousel-item style="height: 250px;width:420px;">
        <div style="text-align: center;width: 350px ;color: #fff;font-size: 18px;font-weight: 4200;margin-top: 10px">电力设施损毁及抢修情况</div>
        <div ref="echart2" style="width: 130px; height: 308px; float: left;"></div>
        <div ref="echart3" style="width: 130px; height: 308px; float: left;"></div>
        <div ref="echart4" style="width: 130px; height: 308px; float: left;"></div>
      </el-carousel-item>
<!--    第三个页面，放一个 ECharts -->
      <el-carousel-item>
        <div ref="echart5" style="height: 250px;width:420px"></div>
      </el-carousel-item>
      <!-- 第四个页面，放三个 ECharts -->
      <el-carousel-item style="height: 250px;width:420px;">
        <div style="text-align: center;width: 350px ;color: #fff;font-size: 18px;font-weight: 4200;margin-top: 10px">电力设施损毁及抢修情况</div>
        <div ref="echart6" style="width: 130px; height: 308px; float: left;"></div>
        <div ref="echart7" style="width: 130px; height: 308px; float: left;"></div>
        <div ref="echart8" style="width: 130px; height: 308px; float: left;"></div>
      </el-carousel-item>
    </el-carousel>
<!--    下面echarts-->
    <span>更新时间：{{ updateTime2 }}</span>
    <div ref="chart1" class="chart1" style="height: 248px;width:420px">
      <el-carousel height="248px"  indicator-position="none" :interval="4200">
        <el-carousel-item v-for="(option, index) in chartOptions1" :key="index">
          <div :ref="`chartContainer${index}`" class="chart" style="width:420px ;height: 248px }"></div>
        </el-carousel-item>
      </el-carousel>
    </div>
</template>

<script setup>
import {ref, onMounted, defineProps} from 'vue';
import * as echarts from 'echarts';
import {getVillages} from "../../../api/system/ZhongDuanVillage";
import {getPowerSupply} from "../../../api/system/powerSupply";
import {getRoadRepairs} from "../../../api/system/roadDamage";
import {getFacility} from "../../../api/system/CommunicationFacilityDamageRepairStatus";

const updateTime1 = ref('');
const updateTime2 = ref('');
const eqid = ref('');
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
});
eqid.value = props.eqid
const echart1 = ref(null);
const echart2 = ref(null);
const echart3 = ref(null);
const echart4 = ref(null);
const echart5 = ref(null);
const echart6 = ref(null);
const echart7 = ref(null);
const echart8 = ref(null);

const chart1 = ref(null);
const chartOptions1 = ref([]);
const chartInstances1 = ref([]);

let echartsInstance = null;
const chart = ref(null);

// 中断村
const latestTime1 = ref(''); // 最新时间
const currentlyBlackedOutVillages = ref('') // 供电
const currentInterruptedVillages  = ref('') // 通信
const roadBlockVillage = ref('') // 道路

// 电力设施损毁及抢修情况
const reportingDeadline = ref('') //最新时间
const totalRestoredSubstations = ref('') //已恢复变站
const totalToBeRepairedSubstations = ref('') //待修复变站
const totalRestoredCircuits = ref('') //已恢复线路
const totalToBeRestoredCircuits = ref('') //待恢复线路
const totalBlackoutUsers = ref('') //停电用户总数
const totalRestoredPowerUsers = ref('') //已恢复供电用户数

// 道路交通损毁及抢修情况与交通管控情况
const latestTime2 = ref(''); // 时间
const affectedArea = ref([]); // 地点
const restoredKm = ref([]); // 已经抢修
const pendingRepairKm = ref([]); // 等待抢修

// 通信设施损毁及抢修情况情况
const latestTime3 = ref('') // 时间
const earthquakeZoneName = ref([]) //地点
const repairedCableLength = ref([]) // 已修复
const currentPendingRepairCableLength = ref([]) //待修复

// 所有echarts的配置以及数据的获取
const initChart = async () => {
  // 获取数据
  const getData = async () => {
    // 时间格式化函数
    const formatDateTime = (dateString) => {
      if (dateString === null ){
        return null;
      }
      return dateString.split('T')[0] + ' ' + dateString.split('T')[1].split('.')[0];
    };
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

    // 中断村的数据
    function updateZhongDuan(data){
      latestTime1.value = formatDateTime(data[0].insertTime);
      currentInterruptedVillages.value = data[0].currentInterruptedVillages;
      currentlyBlackedOutVillages.value = data[0].currentlyBlackedOutVillages;
      roadBlockVillage.value = data[0].roadBlockVillage;
    }
    const res1 = await getVillages(eqid.value); // 等待 getVillages 异步完成
    updateZhongDuan(res1);

    // 电力设施损毁及抢修情况的数据
    function updataPowerSupply(data){
      // 处理数据，提取所需信息
      totalRestoredSubstations.value = data.reduce((sum, item) => sum + item.restoredSubstations, 0);
      totalToBeRepairedSubstations.value = data.reduce((sum, item) => sum + item.toBeRepairedSubstations, 0);
      totalRestoredCircuits.value = data.reduce((sum, item) => sum + item.restoredCircuits, 0);
      totalToBeRestoredCircuits.value = data.reduce((sum, item) => sum + item.toBeRestoredCircuits, 0);
      totalBlackoutUsers.value = data.reduce((sum, item) => sum + item.totalBlackoutUsers, 0);
      totalRestoredPowerUsers.value = data.reduce((sum, item) => sum + item.restoredPowerUsers, 0);
      reportingDeadline.value = data.reduce((max, item) => {
        return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
      }, data[0]?.reportingDeadline); // 确保初始值
    }
    const res2 = await getPowerSupply(eqid.value);
    updataPowerSupply(res2);

    // 道路交通损毁及抢修情况与交通管控情况的数据
    function updateRoadRepairs(data) {
      // 如果返回的数组为空，设置默认值
      if (data.length === 0) {
        affectedArea.value = ['抱歉暂无数据'];
        restoredKm.value = [0];
        pendingRepairKm.value = [0];
        latestTime2.value = '';
      } else {
        affectedArea.value = data.map(item => item.affectedArea || '无数据');
        restoredKm.value = data.map(item => item.restoredKm || 0);
        pendingRepairKm.value = data.map(item => item.pendingRepairKm || 0);
        latestTime2.value = data.reduce((max, item) => {
          return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
        }, data[0].reportingDeadline); // 确保初始值
      }
  }
    const res3 = await getRoadRepairs(eqid.value);
    updateRoadRepairs(res3);

    // 通信设施损毁及抢修情况的数据
    function updateFacility(data){
      if(data.length === 0){
        earthquakeZoneName.value = ["抱歉暂无数据"]
        repairedCableLength.value = [0]
        currentPendingRepairCableLength.value = [0]
        latestTime3.value = ''
      }else {
        earthquakeZoneName.value = data.map(item => item.earthquakeZoneName || "抱歉暂无数据")
        repairedCableLength.value = data.map(item => item.repairedCableLength || 0)
        currentPendingRepairCableLength.value = data.map(item => item.currentPendingRepairCableLength || 0)
        latestTime3.value = data.reduce((max, item) => {
          return new Date(max) > new Date(item.reportingDeadline) ? max : item.reportingDeadline;
        },data[0].reportingDeadline); // 确保初始值
      }
    }
    const res4 = await getFacility(eqid.value)
    updateFacility(res4);

    // 比较时间，获取最新的时间
    updateTime1.value = formatDateChina(new Date(latestTime1.value) > new Date(reportingDeadline.value) ? latestTime1.value : reportingDeadline.value);
    updateTime2.value = formatDateChina(new Date(latestTime2.value) > new Date(latestTime3.value) ? latestTime2.value : latestTime3.value);

  }
  await getData();
  // -----------------------------------------------------------------------------------------------------------
  // ehcarts的一些配置：
  // 高科技饼图配置
  var img = 'data:image/png;base64,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';
  var trafficWay = [{
    name: '通信',
    value: currentlyBlackedOutVillages.value
  },{
    name: '主网供电',
    value: currentlyBlackedOutVillages.value
  },{
    name: '道路',
    value: roadBlockVillage.value
  },
  ];
  var data = [];
  var color=['#00ffff','#409B5C','#006ced',] //'#ffe000','#ffa800','#ff5b00','#ff3000'
  for (var i = 0; i < trafficWay.length; i++) {
    data.push({
      value: trafficWay[i].value,
      name: trafficWay[i].name,
      itemStyle: {
        normal: {
          borderWidth: 5,
          shadowBlur: 20,
          borderColor: color[i],
          shadowColor: color[i]
        }
      }
    }, {
      value: 2,
      name: '',
      itemStyle: {
        normal: {
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          color: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 0
        }
      }
    });
  }
  var seriesOption = [{
    name: '',
    type: 'pie',
    clockWise: false,
    radius: ['40%', '41%'],  // 缩小饼图半径
    hoverAnimation: false,
    itemStyle: {
      normal: {
        label: {
          show: true,
          position: 'outside',
          color: '#ddd',
          formatter: function(params) {
            if (params.name !== '') {
              return '中断类别：' + params.name + '\n' + '\n' + '中断数量：' + params.value + '处';
            } else {
              return '';
            }
          },
        },
        labelLine: {
          length: 20,  // 缩短标注线长度
          length2: 60,  // 缩短第二段线的长度
          show: true,
          color: '#00ffff'
        }
      }
    },
    data: data
  }];

  // ------------------------------------------------------------------------------------------------------------------------------------
  // 以下是下面的echarts部分
  chartOptions1.value = [
    // 高科技饼图
    {
      title: {
        text: '道路交通损毁及抢修情况与交通管控情况',
        textStyle: {
          align: 'left',
          color: '#fff',
          fontSize: 20,
        },
        top: '3%',
        left: '10%',
      },
      grid: {
        top: "25%",
        bottom: "10%" // 控制图表的底部间距
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        }
      },
      legend: {
        data: ["已经抢修", "等待抢修"],
        top: "15%",
        textStyle: {
          color: "#ffffff"
        }
      },
      xAxis: {
        data: affectedArea.value,
        axisLine: {
          show: true, // 显示X轴轴线
          lineStyle: {
            color: '#01FCE3'
          }
        },
        axisTick: {
          show: true // 显示X轴刻度
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac" // X轴文字颜色
          }
        }
      },
      yAxis: [{
        type: "value",
        name: "公里",
        nameTextStyle: {
          color: "#ebf8ac"
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#FFFFFF'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac"
          }
        },
      }],
      series: [
        {
        name: "已经抢修",
        type: "line",
        smooth: true, // 平滑曲线显示
        showAllSymbol: true, // 显示所有图形
        symbol: "circle", // 标记的图形为实心圆
        itemStyle: {
          color: "#058cff" // 曲线颜色
        },
        lineStyle: {
          color: "#058cff",// 曲线颜色
        },
        areaStyle: {
          color: "rgba(5,140,255, 0.2)"
        },
        data: restoredKm.value
      },
        {
          name: "等待抢修",
          type: "bar",
          barWidth: 15,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "#00FFE3"
              },
                {
                  offset: 1,
                  color: "#4693EC"
                }
              ])
            }
          },
          data: pendingRepairKm.value
        }]
    },
    // 高科技饼图
    {
      title: {
        text: '通信设施损毁及抢修情况',
        textStyle: {
          align: 'center',
          color: '#fff',
          fontSize: 20,
        },
        top: '3%',
        left: '10%',
      },
      grid: {
        top: "25%",
        bottom: "10%" // 控制图表的底部间距
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        }
      },
      legend: {
        data: ["抢通恢复光缆", "目前待修复光缆"],
        top: "15%",
        textStyle: {
          color: "#ffffff"
        }
      },
      xAxis: {
        data: earthquakeZoneName.value,
        axisLine: {
          show: true, // 显示X轴轴线
          lineStyle: {
            color: '#01FCE3'
          }
        },
        axisTick: {
          show: true // 显示X轴刻度
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac" // X轴文字颜色
          }
        }
      },
      yAxis: [{
        type: "value",
        name: "公里",
        nameTextStyle: {
          color: "#ebf8ac"
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#FFFFFF'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac"
          }
        },
      }],
      series: [
        {
        name: "抢通恢复光缆",
        type: "line",
        smooth: true, // 平滑曲线显示
        showAllSymbol: true, // 显示所有图形
        symbol: "circle", // 标记的图形为实心圆
        symbolSize: 10, // 标记的大小
        itemStyle: {
          color: "#058cff" // 曲线颜色
        },
        lineStyle: {
          color: "#058cff" // 曲线颜色
        },
        areaStyle: {
          color: "rgba(5,140,255, 0.2)"
        },
        data: repairedCableLength.value
      },
        {
          name: "目前待修复光缆",
          type: "bar",
          barWidth: 15,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "#00FFE3"
              },
                {
                  offset: 1,
                  color: "#4693EC"
                }
              ])
            }
          },
          data: currentPendingRepairCableLength.value
        }
        ]
    },
    // 高科技饼图
    {
      title: {
        text: '道路交通损毁及抢修情况与交通管控情况',
        textStyle: {
          align: 'center',
          color: '#fff',
          fontSize: 20,
        },
        top: '3%',
        left: '10%',
      },
      grid: {
        top: "25%",
        bottom: "10%" // 控制图表的底部间距
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        }
      },
      legend: {
        data: ["已经抢修", "等待抢修"],
        top: "15%",
        textStyle: {
          color: "#ffffff"
        }
      },
      xAxis: {
        data: affectedArea.value,
        axisLine: {
          show: true, // 显示X轴轴线
          lineStyle: {
            color: '#01FCE3'
          }
        },
        axisTick: {
          show: true // 显示X轴刻度
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac" // X轴文字颜色
          }
        }
      },
      yAxis: [{
        type: "value",
        name: "公里",
        nameTextStyle: {
          color: "#ebf8ac"
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#FFFFFF'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac"
          }
        },
      }],
      series: [{
        name: "已经抢修",
        type: "line",
        smooth: true, // 平滑曲线显示
        showAllSymbol: true, // 显示所有图形
        symbol: "circle", // 标记的图形为实心圆
        symbolSize: 10, // 标记的大小
        itemStyle: {
          color: "#058cff" // 曲线颜色
        },
        lineStyle: {
          color: "#058cff" // 曲线颜色
        },
        areaStyle: {
          color: "rgba(5,140,255, 0.2)"
        },
        data: restoredKm.value
      },
        {
          name: "等待抢修",
          type: "bar",
          barWidth: 15,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "#00FFE3"
              },
                {
                  offset: 1,
                  color: "#4693EC"
                }
              ])
            }
          },
          data: pendingRepairKm.value
        }]
    },
    // 高科技饼图
    {
      title: {
        text: '通信设施损毁及抢修情况',
        textStyle: {
          align: 'center',
          color: '#fff',
          fontSize: 20,
        },
        top: '3%',
        left: '10%',
      },
      grid: {
        top: "25%",
        bottom: "10%" // 控制图表的底部间距
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        }
      },
      legend: {
        data: ["抢通恢复光缆", "目前待修复光缆"],
        top: "15%",
        textStyle: {
          color: "#ffffff"
        }
      },
      xAxis: {
        data: earthquakeZoneName.value,
        axisLine: {
          show: true, // 显示X轴轴线
          lineStyle: {
            color: '#01FCE3'
          }
        },
        axisTick: {
          show: true // 显示X轴刻度
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac" // X轴文字颜色
          }
        }
      },
      yAxis: [{
        type: "value",
        name: "公里",
        nameTextStyle: {
          color: "#ebf8ac"
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: true
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#FFFFFF'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ebf8ac"
          }
        },
      }],
      series: [
        {
          name: "抢通恢复光缆",
          type: "line",
          smooth: true, // 平滑曲线显示
          showAllSymbol: true, // 显示所有图形
          symbol: "circle", // 标记的图形为实心圆
          symbolSize: 10, // 标记的大小
          itemStyle: {
            color: "#058cff" // 曲线颜色
          },
          lineStyle: {
            color: "#058cff" // 曲线颜色
          },
          areaStyle: {
            color: "rgba(5,140,255, 0.2)"
          },
          data: repairedCableLength.value
        },
        {
          name: "目前待修复光缆",
          type: "bar",
          barWidth: 15,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "#00FFE3"
              },
                {
                  offset: 1,
                  color: "#4693EC"
                }
              ])
            }
          },
          data: currentPendingRepairCableLength.value
        }
      ]
    },
  ];
  setTimeout(()=>{
    chartOptions1.value.forEach((option, index) => {
      const chartContainer = chart1.value.querySelectorAll('.chart')[index];
      if (chartContainer) {
        const chartInstance = echarts.init(chartContainer);
        chartInstance.setOption(option);
        chartInstances1.value[index] = chartInstance;
      }
    });
  },2000)

  // -----------------------------------------------------------------------------------------------------
  // 以下是上面的echarts部分
  const option1 = {
    color: color,
    title: {
      text: '中断累计',
      top: '45%',  // 上移
      left: '50%',  // 居中
      textAlign: "center",
      textStyle: {
        color: '#fff',
        fontSize: 18,  // 缩小字体
        fontWeight: '420'
      },
    },
    graphic: {
      elements: [{
        type: "image",
        z: 3,
       style: {
          image: img,
          width: 85,
          height: 85
        },
        left: 'center',
        top: 'center',
        position: [50, 50]
      }]
    },
    tooltip: {
      show: false
    },
    legend: {
      icon: "circle",
      orient: 'horizontal',
      data: ['通信', '主网供电', '道路'],
      right: 120,  // 更靠右
      bottom: 40,  // 提高图例位置
      align: 'right',
      itemWidth: 10,  // 图例项的宽度，默认是25
      itemHeight: 10,  // 图例项的高度，默认是14
      textStyle: {
        color: "#fff",
        fontSize: 12  // 缩小字体
      },
      itemGap: 15  // 缩小图例项间距
    },
    toolbox: {
      show: false
    },
    series: seriesOption
  };
  const option2 = {
    legend: {
      orient: 'horizontal',  // 水平排列图例
      show: true,
      bottom: 120,          // 将图例放到图表底部并调整位置（可根据需要调整百分比）
      left: 'center',         // 将图例居中
      itemWidth: 10,          // 图例项的宽度
      itemHeight: 10,         // 图例项的高度
      itemGap: 10,            // 图例项之间的间距
      textStyle: {
        color: '#7a8c9f',
        fontSize: 10,         // 图例字体大小
        lineHeight: 14,
        rich: {
          percent: {
            color: '#fff',
            fontSize: 12,      // 百分比字体大小
          },
        },
      },
      formatter: name => {
        switch (name) {
          case '已恢复变站':
            return '已恢复变站 ' + ' ' + totalRestoredSubstations.value + '处';
          case '待修复变站':
            return '待修复变站 ' + ' ' + totalToBeRepairedSubstations.value + '处';
          default:
            break;
        }
      },
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '60%'],  // 缩小图表的半径
        center: ['50%', '30%'],  // 将图表的中心设置为容器的中心
        hoverAnimation: false,
        z: 10,
        label: {
          position: 'center',
          formatter: () => {
            return '变站';
          },
          rich: {
            total: {
              fontSize: 18,       // 调整字体大小
              color: '#fff',
            },
          },
          color: '#7a8c9f',
          fontSize: 14,
          lineHeight: 30,
        },
        data: [
          {
            value: totalRestoredSubstations.value,
            name: '已恢复变站',
            itemStyle: {
              color: '#0286ff',
            },
          },
          {
            value: totalToBeRepairedSubstations.value,
            name: '待修复变站',
            itemStyle: {
              color: '#ffd302',
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['42%', '52%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalRestoredSubstations.value,
            name: '已恢复变站',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.4,
            },
          },
          {
            value: totalToBeRepairedSubstations.value,
            name: '待修复变站',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.4,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['35%', '45%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalRestoredSubstations.value,
            name: '已恢复变站',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.1,
            },
          },
          {
            value: totalToBeRepairedSubstations.value,
            name: '待修复变站',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.1,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
    ],
  };
  const option3 = {
    legend: {
      orient: 'horizontal',  // 水平排列图例
      show: true,
      bottom: 120,          // 将图例放到图表底部并调整位置（可根据需要调整百分比）
      left: 'center',         // 将图例居中
      itemWidth: 10,          // 图例项的宽度
      itemHeight: 10,         // 图例项的高度
      itemGap: 10,            // 图例项之间的间距
      textStyle: {
        color: '#7a8c9f',
        fontSize: 10,         // 图例字体大小
        lineHeight: 14,
        rich: {
          percent: {
            color: '#fff',
            fontSize: 12,      // 百分比字体大小
          },
        },
      },
      formatter: name => {
        switch (name) {
          case '已恢复线路':
            return '已恢复线路 ' + ' ' + totalRestoredCircuits.value + '条';
          case '待恢复线路':
            return '待恢复线路 ' + ' ' + totalToBeRestoredCircuits.value + '处';
          default:
            break;
        }
      },
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '60%'],  // 缩小图表的半径
        center: ['50%', '30%'],  // 将图表的中心设置为容器的中心
        hoverAnimation: false,
        z: 10,
        label: {
          position: 'center',
          formatter: () => {
            return '跳闸线路';
          },
          rich: {
            total: {
              fontSize: 18,       // 调整字体大小
              color: '#fff',
            },
          },
          color: '#7a8c9f',
          fontSize: 14,
          lineHeight: 30,
        },
        data: [
          {
            value: totalRestoredCircuits.value,
            name: '已恢复线路',
            itemStyle: {
              color: '#0286ff',
            },
          },
          {
            value: totalToBeRestoredCircuits.value,
            name: '待恢复线路',
            itemStyle: {
              color: '#ffd302',
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['42%', '52%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalRestoredCircuits.value,
            name: '已恢复线路',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.4,
            },
          },
          {
            value: totalToBeRestoredCircuits.value,
            name: '待恢复线路',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.4,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['35%', '45%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalRestoredCircuits.value,
            name: '已恢复线路',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.1,
            },
          },
          {
            value: totalToBeRestoredCircuits.value,
            name: '待恢复线路',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.1,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
    ],
  };
  const option4 = {
    legend: {
      orient: 'horizontal',  // 水平排列图例
      show: true,
      bottom: 120,          // 将图例放到图表底部并调整位置（可根据需要调整百分比）
      left: 'center',         // 将图例居中
      itemWidth: 10,          // 图例项的宽度
      itemHeight: 10,         // 图例项的高度
      itemGap: 10,            // 图例项之间的间距
      textStyle: {
        color: '#7a8c9f',
        fontSize: 10,         // 图例字体大小
        lineHeight: 14,
        rich: {
          percent: {
            color: '#fff',
            fontSize: 12,      // 百分比字体大小
          },
        },
      },
      formatter: name => {
        switch (name) {
          case '停电用户总数':
            return '停电用户总数 ' + ' ' + totalBlackoutUsers.value + '户';
          case '已恢复用户数':
            return '已恢复用户数 ' + ' ' + totalRestoredPowerUsers.value + '户';
          default:
            break;
        }
      },
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '60%'],  // 缩小图表的半径
        center: ['50%', '30%'],  // 将图表的中心设置为容器的中心
        hoverAnimation: false,
        z: 10,
        label: {
          position: 'center',
          formatter: () => {
            return '主网停电用户数';
          },
          rich: {
            total: {
              fontSize: 18,       // 调整字体大小
              color: '#fff',
            },
          },
          color: '#7a8c9f',
          fontSize: 14,
          lineHeight: 30,
        },
        data: [
          {
            value: totalBlackoutUsers.value,
            name: '停电用户总数',
            itemStyle: {
              color: '#0286ff',
            },
          },
          {
            value: totalRestoredPowerUsers.value,
            name: '已恢复用户数',
            itemStyle: {
              color: '#ffd302',
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['42%', '52%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalBlackoutUsers.value,
            name: '停电用户总数',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.4,
            },
          },
          {
            value: totalRestoredPowerUsers.value,
            name: '已恢复用户数',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.4,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
      {
        type: 'pie',
        radius: ['35%', '45%'],
        center: ['50%', '30%'],
        hoverAnimation: false,
        label: {
          show: false,
        },
        data: [
          {
            value: totalBlackoutUsers.value,
            name: '停电用户总数',
            itemStyle: {
              color: '#0286ff',
              opacity: 0.1,
            },
          },
          {
            value: totalRestoredPowerUsers.value,
            name: '已恢复用户数',
            itemStyle: {
              color: '#ffd302',
              opacity: 0.1,
            },
          },
        ],
        labelLine: {
          show: false,
        },
      },
    ],
  };
  const myChart1 = echarts.init(echart1.value)
  myChart1.setOption(option1)
  const myChart2 = echarts.init(echart2.value)
  myChart2.setOption(option2)
  const myChart3 = echarts.init(echart3.value)
  myChart3.setOption(option3)
  const myChart4 = echarts.init(echart4.value)
  myChart4.setOption(option4)
  const myChart5 = echarts.init(echart5.value)
  myChart5.setOption(option1)
  const myChart6 = echarts.init(echart6.value)
  myChart6.setOption(option2)
  const myChart7 = echarts.init(echart7.value)
  myChart7.setOption(option3)
  const myChart8 = echarts.init(echart8.value)
  myChart8.setOption(option4)
};

onMounted(async () => {
  await initChart();
});

</script>

<style scoped>
span{
  display: block;
  color: white;
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%);
}


.chart {
  width: 420px;
  height: 250px;
}
</style>
