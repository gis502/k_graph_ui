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
const echartsOption = ref();

const initChart = () => {
  if (!chart.value) return;

  const currentYear = new Date().getFullYear();
  const analysis = {
    "消极": [9, 8, 2, 13, 15, 6, 20, 23, 20, 8, 6],
    "积极": [1, 2, 3, 7, 10, 2, 5, 9, 2, 5, 7],
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
          text: '评论趋势图',
          left: '60px',
          top:'10%',
          textStyle: {
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
            textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
          },
          padding: [0, 0, 10, 0]
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
          // data: ['消极', '积极','中立','未知'],
          data: ['消极', '积极','中立'],
          selectedMode: true, // 启用点击交互
          textStyle: {
            fontSize: 10,
            color: 'rgb(0,253,255,0.6)'
          },
          top: '10%',
          right: '0%'
        },
        grid: {
          top: '25%',
          bottom: 65,
          left: 180,
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
            name: '消极-流光',
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
            name: '积极-流光',
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
            name: '中立-流光',
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
          // {
          //   name: '未知',
          //   type: 'line',
          //   // smooth: true,
          //   symbol: 'circle',
          //   symbolSize: 10,
          //   areaStyle: {
          //     normal: {
          //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          //         offset: 0,
          //         color: 'rgba(255, 99, 71)'
          //       }, {
          //         offset: 0.8,
          //         color: 'rgba(6, 8, 41,.1)'
          //       }], false),
          //       shadowColor: 'rgba(0, 0, 0, 0.1)',
          //       shadowBlur: 10
          //     }
          //   },
          //   itemStyle: {
          //     normal: {
          //       color: '#FF6A4D'
          //     }
          //   },
          //   data: data4
          // },
          // {
          //   name: '未知-流光',
          //   type: 'lines',
          //   coordinateSystem: 'cartesian2d',
          //   zlevel: 1,
          //   smooth: true,
          //   symbol: 'circle',
          //   effect: {
          //     show: true,
          //     smooth: true,
          //     period: 2,
          //     symbolSize: 8
          //   },
          //   lineStyle: {
          //     normal: {
          //       color: '#FF6A4D',
          //       width: 0,
          //       opacity: 0,
          //       curveness: 0,
          //     }
          //   },
          //   data: json4.chart0.lowLine
          // },
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
    bottom: 10px;
    left: 100px;
    width: 100%;
    height: 100%;
  }
}
</style>
