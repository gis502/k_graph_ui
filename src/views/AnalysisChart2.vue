<template>
  <div className="container">
    <div className="chartContainer" ref="chart"></div>
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
  {name: '缅甸地震', value: 1000},
  {name: '6.8级强震', value: 950},
  {name: '浅源地震', value: 900},
  {name: '震中仰光', value: 880},
  {name: '主震', value: 850},
  {name: '余震频发', value: 830},
  {name: '震源深度10km', value: 800},
  {name: '北纬19.5°', value: 780},
  {name: '东经96.0°', value: 760},
  {name: '地震序列', value: 740},

  // === 受灾地区（按影响程度分级）===
  {name: '曼德勒', value: 850},
  {name: '内比都', value: 820},
  {name: '勃固省', value: 800},
  {name: '伊洛瓦底', value: 780},
  {name: '掸邦', value: 760},
  {name: '克钦邦', value: 740},
  {name: '若开邦', value: 720},
  {name: '仰光市区', value: 700},
  {name: '毛淡棉', value: 680},
  {name: '卑谬', value: 660},
  {name: '东枝', value: 640},
  {name: '腊戍', value: 620},
  {name: '实皆', value: 600},
  {name: '密支那', value: 580},
  {name: '丹老群岛', value: 550},

  // === 灾害直接后果（高关注度）===
  {name: '房屋倒塌', value: 900},
  {name: '人员伤亡', value: 880},
  {name: '失踪人员', value: 850},
  {name: '道路中断', value: 830},
  {name: '桥梁损毁', value: 810},
  {name: '山体滑坡', value: 790},
  {name: '电力瘫痪', value: 770},
  {name: '通讯中断', value: 750},
  {name: '水源污染', value: 730},
  {name: '医院超载', value: 710},
  {name: '学校损毁', value: 690},
  {name: '古迹受损', value: 670},
  {name: '工厂停工', value: 650},
  {name: '农田被毁', value: 630},
  {name: '牲畜死亡', value: 610},

  // === 救援与应急响应 ===
  {name: '国际救援队', value: 800},
  {name: '红十字会', value: 780},
  {name: '搜救犬', value: 760},
  {name: '生命探测仪', value: 740},
  {name: '临时避难所', value: 720},
  {name: '救灾物资', value: 700},
  {name: '帐篷发放', value: 680},
  {name: '医疗队', value: 660},
  {name: '直升机转运', value: 640},
  {name: '卫星电话', value: 620},
  {name: '灾民安置', value: 600},
  {name: '心理援助', value: 580},
  {name: '儿童保护', value: 560},
  {name: '应急供水', value: 540},
  {name: '防疫消杀', value: 520},

  // === 地质与科学分析 ===
  {name: '印澳板块', value: 600},
  {name: '欧亚板块', value: 580},
  {name: '俯冲带', value: 560},
  {name: '断裂带活动', value: 540},
  {name: '地震预警', value: 520},
  {name: 'P波检测', value: 500},
  {name: '烈度分布图', value: 480},
  {name: '地质调查', value: 460},
  {name: '次生灾害', value: 440},
  {name: '土壤液化', value: 420},

  // === 国际反应 ===
  {name: '中国援助', value: 700},
  {name: '联合国评估', value: 680},
  {name: '东盟合作', value: 660},
  {name: '日本专家', value: 640},
  {name: '美国USAR', value: 620},
  {name: '欧盟救援', value: 600},
  {name: '印度支援', value: 580},
  {name: '泰国医疗队', value: 560},
  {name: '新加坡物资', value: 540},
  {name: '世界银行拨款', value: 520},

  // === 时间线关键词 ===
  {name: '黄金72小时', value: 600},
  {name: '首日救援', value: 550},
  {name: '灾后重建', value: 500},
  {name: '周年纪念', value: 450},
  {name: '地震演练', value: 400},

  // === 其他补充词汇（按需调整）===
  {name: '志愿者', value: 300},
  {name: '捐款通道', value: 280},
  {name: '社交媒体', value: 260},
  {name: '新闻直播', value: 240},
  {name: '专家解读', value: 220},
  {name: '地震云', value: 200}, // 伪科学词，用于舆情对比
  {name: '祈福', value: 180},
  {name: '烛光悼念', value: 150}
]);
const echartsOption = ref();

const initChart = () => {
  if (!chart.value) return;

  const currentYear = new Date().getFullYear();
  const analysis = {
    "消极": [9, 8, 2, 13, 15, 6, 20, 23, 20, 8, 6],
    "积极": [27, 60, 71, 74, 74, 88, 130, 50, 86, 51, 57],
    "中立": [2, 4, 6, 7, 3, 5, 14, 2, 6, 3, 2],
    "未知": [3, 1, 0, 3, 1, 0, 1, 0, 1, 0, 0]
  }

  // 以下是流光折线图的一些配置的
  var data1 = analysis['消极'];
  var data2 = analysis['积极'];
  var data3 = analysis['中立'];
  var data4 = analysis['未知'];

  var json = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data1,
      lowLine: [],
    }
  };
  var json2 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data2,
      lowLine: [],
    }
  };
  var json3 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data3,
      lowLine: [],
    }
  };
  var json4 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data4,
      lowLine: [],
    }
  };

  var zrUtil = echarts.util;
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json.chart0.lowLine.push([{
      coord: [index, json.chart0.low[index]]
    }, {
      coord: [index + 1, json.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json2.chart0.lowLine.push([{
      coord: [index, json2.chart0.low[index]]
    }, {
      coord: [index + 1, json2.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json3.chart0.lowLine.push([{
      coord: [index, json3.chart0.low[index]]
    }, {
      coord: [index + 1, json3.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json4.chart0.lowLine.push([{
      coord: [index, json4.chart0.low[index]]
    }, {
      coord: [index + 1, json4.chart0.low[index + 1]]
    }]);
  });

  echartsOption.value = {
        title: {
          text: '评论分析',
          left: 'left',
          top:'10%',
          textStyle: {
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
            textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
          },
        },
        tooltip: {
          textStyle:{
            color: '#15ecf4'
          },
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#15ecf4'
            }
          },
          backgroundColor: 'rgba(0,0,0,.8)',
          extraCssText: 'box-shadow: 4px 4px 10px rgba(21, 250, 255,.6);',
          formatter: function(params) {
            var result = params[0].name + '年<br>';
            params.forEach(function(item) {
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>';
              // 直接展示数据，并添加单位（次）
              result += item.seriesName + ": " + item.data + " 次<br>";
            });
            return result;
          }
        },
        legend: {
          data: ['消极', '积极', '中立', '未知'],
          textStyle: {
            fontSize: 10,
            color: 'rgb(0,253,255,0.6)'
          },
          top: '10%',
          right: '0%'
        },
        grid: {
          bottom: 65,
          left: 60,
          right: 25,
        },
        xAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: '#15faff',
            },
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true
          },
          data: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()).reverse(),
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#4b4d64'
            }
          },
          axisLabel: {
            formatter: '{value} ',
            textStyle: { //改变刻度字体样式
              color: '#ffffff'
            }
          },
        },
        series: [
          {
            name: '消极',
            type: 'line',
            // smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(255, 204,1, .9)'
                }, {
                  offset: 0.8,
                  color: 'rgba(6, 8, 41,.1)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: '#ffcb00'
              }
            },
            data: data1
          },
          {
            name: '消极',
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            zlevel: 1,
            smooth: true,
            symbol: 'circle',
            effect: {
              show: true,
              smooth: true,
              period: 2,
              symbolSize: 8
            },
            lineStyle: {
              normal: {
                color: '#ffcb00',
                width: 0,
                opacity: 0,
                curveness: 0,
              }
            },
            data: json.chart0.lowLine
          },
          {
            name: '积极',
            type: 'line',
            // smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(21, 250, 255,.9)'
                }, {
                  offset: 0.8,
                  color: 'rgba(6, 8, 41,.1)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: '#15faff'
              }
            },
            data: data2
          },
          {
            name: '积极',
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            zlevel: 1,
            smooth: true,
            symbol: 'circle',
            effect: {
              show: true,
              smooth: true,
              period: 2,
              symbolSize: 8
            },
            lineStyle: {
              normal: {
                color: '#15faff',
                width: 0,
                opacity: 0,
                curveness: 0,
              }
            },
            data: json2.chart0.lowLine
          },
          {
            name: '中立',
            type: 'line',
            // smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgb(255, 160, 122)'
                }, {
                  offset: 0.8,
                  color: 'rgba(6, 8, 41,.1)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: '#FFA07A'
              }
            },
            data: data3
          },
          {
            name: '中立',
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            zlevel: 1,
            smooth: true,
            symbol: 'circle',
            effect: {
              show: true,
              smooth: true,
              period: 2,
              symbolSize: 8
            },
            lineStyle: {
              normal: {
                color: '#FFA07A',
                width: 0,
                opacity: 0,
                curveness: 0,
              }
            },
            data: json3.chart0.lowLine
          },
          {
            name: '未知',
            type: 'line',
            // smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(255, 99, 71)'
                }, {
                  offset: 0.8,
                  color: 'rgba(6, 8, 41,.1)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: '#FF6A4D'
              }
            },
            data: data4
          },
          {
            name: '未知',
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            zlevel: 1,
            smooth: true,
            symbol: 'circle',
            effect: {
              show: true,
              smooth: true,
              period: 2,
              symbolSize: 8
            },
            lineStyle: {
              normal: {
                color: '#FF6A4D',
                width: 0,
                opacity: 0,
                curveness: 0,
              }
            },
            data: json4.chart0.lowLine
          },
        ]
  };

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
const getData = async () => {
  try {
    const res = await getSentimentAnalysisChartData();
    console.log(res, "这个结果是什么")

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
.container {
  position: relative;
  height: 100%;
  width: 80%;

  .title {

  }

  .chartContainer {
    position: absolute;
    bottom: 40px;
    left: 10px;
    width: 100%;
    height: 100%;
  }
}
</style>
