<template>
  <div ref="chart1" class="chart1">
    <el-carousel height="300px" indicator-position="none">
      <el-carousel-item v-for="(option, index) in chartOptions" :key="index">
        <div :ref="`chartContainer${index}`" class="chart" :style="{ width: '100%', height: '100%' }"></div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const chart1 = ref(null);
const props = defineProps(['eqData']);
const chartOptions = ref([]);
const chartInstances = ref([]);

const calculateMagnitudeData = (data, years) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;
  const magnitudeCounts = {
    '<3': Array(years + 1).fill(0),
    '3-4.5': Array(years + 1).fill(0),
    '4.5-6': Array(years + 1).fill(0),
    '≥6': Array(years + 1).fill(0),
  };

  data.forEach(item => {
    const year = new Date(item.occurrenceTime).getFullYear();
    const yearIndex = currentYear - year;

    if (year >= startYear && yearIndex >= 0 && yearIndex <= years) {
      if (item.magnitude < 3) {
        magnitudeCounts['<3'][yearIndex]++;
      } else if (item.magnitude < 4.5) {
        magnitudeCounts['3-4.5'][yearIndex]++;
      } else if (item.magnitude < 6) {
        magnitudeCounts['4.5-6'][yearIndex]++;
      } else {
        magnitudeCounts['≥6'][yearIndex]++;
      }
    }
  });

  return magnitudeCounts;
};

const initChart = async () => {
  const currentYear = new Date().getFullYear();
  const threeYearMagnitudes = calculateMagnitudeData(props.eqData, 3);
  const tenYearMagnitudes = calculateMagnitudeData(props.eqData, 10);

  // 以下是流光折线图的一些配置的
  var data1 = tenYearMagnitudes['<3'];
  var data2 = tenYearMagnitudes['3-4.5'];
  var data3 = tenYearMagnitudes['4.5-6'];
  var data4 = tenYearMagnitudes['≥6'];

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
  // ----------------------------------------------------------------------------------------------

  chartOptions.value = [
    // 流光折现图
    {
      title: {
        text: '近十年历史地震震级',
        textStyle: {
          color: '#15faff',
          fontSize: 20,
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
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        textStyle: {
          fontSize: 12,
          color: 'rgb(0,253,255,0.6)'
        },
        top: '5%',
        right: '5%'
      },
      grid: {
        bottom: 50,
        left: 70,
        right: 50,
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
        name: '<3',
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
          name: '<3',
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
          name: '3-4.5',
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
          name: '3-4.5',
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
          name: '4.5-6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 99, 71, 0.7)'
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
          data: data3
        },
        {
          name: '4.5-6',
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
          data: json3.chart0.lowLine
        },
        {
          name: '≥6',
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
          data: data4
        },
        {
          name: '≥6',
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
          data: json4.chart0.lowLine
        },
      ]
    },
    // 渐变叠状柱图
    {
      title:{
        text: '近三年历史地震震级',
        textStyle: {
          color: '#15faff',
          fontSize: 20,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
      grid: {
        top: 100,
        left: 20,
        right: 20,
        bottom: 20,
        containLabel: true,
      },
      legend: {
        icon: "rect",
        itemWidth: 15,
        itemHeight: 10,
        right: 0,
        top: 50,
        itemGap: 20,
        textStyle: {
          color: "#BCE6FF",
          fontSize: 15
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

            // 使用item.color来显示图例的颜色
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color.colorStops[0].color + '"></span>';
            // 显示图例名称和对应的值
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      xAxis: {
        type: "category",
        data: Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()).reverse(),
        axisLine: {
          lineStyle: {
            color: "rgba(118, 169, 250, .8)",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          color: "#15faff",
          fontSize: 15,
          margin: 5,
        },
      },
      yAxis: {
        type: "value",
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: "#C5E5F9",
          fontSize: 12,
          margin: 5,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(118, 169, 250, .5)",
          },
        },
      },
      series: [
        {
          barWidth: '50%',
          name: "≥6",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFB6C1' },
              { offset: 1, color: 'rgba(255, 182, 193, 0)' },
            ]),
          },
          data: threeYearMagnitudes['≥6'],
        },
        {
          barWidth: '50%',
          name: "4.5-6",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ffbe84' },
              { offset: 1, color: 'rgba(255, 218, 185, 0)' },
            ]),
          },
          data: threeYearMagnitudes['4.5-6'],
        },
        {
          barWidth: '50%',
          name: "3-4.5",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFFACD' },
              { offset: 1, color: 'rgba(255, 250, 205, 0)' },
            ]),
          },
          data: threeYearMagnitudes['3-4.5'],
        },
        {
          barWidth: '50%',
          name: "<3",
          type: "bar",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7FFFD4' },
              { offset: 1, color: 'rgba(127, 255, 212, 0)' },
            ]),
          },
          data: threeYearMagnitudes['<3'],
        },
      ]
    },
    {
      title: {
        text: '近十年历史地震震级',
        textStyle: {
          color: '#15faff',
          fontSize: 20,
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
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        textStyle: {
          fontSize: 12,
          color: 'rgb(0,253,255,0.6)'
        },
        top: '5%',
        right: '5%'
      },
      grid: {
        bottom: 50,
        left: 70,
        right: 50,
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
          name: '<3',
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
          name: '<3',
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
          name: '3-4.5',
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
          name: '3-4.5',
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
          name: '4.5-6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 99, 71, 0.7)'
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
          data: data3
        },
        {
          name: '4.5-6',
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
          data: json3.chart0.lowLine
        },
        {
          name: '≥6',
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
          data: data4
        },
        {
          name: '≥6',
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
          data: json4.chart0.lowLine
        },
      ]
    },
    {
      title:{
        text: '近三年历史地震震级',
        textStyle: {
          color: '#15faff',
          fontSize: 20,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
      grid: {
        top: 100,
        left: 20,
        right: 20,
        bottom: 20,
        containLabel: true,
      },
      legend: {
        icon: "rect",
        itemWidth: 15,
        itemHeight: 10,
        right: 0,
        top: 50,
        itemGap: 20,
        textStyle: {
          color: "#BCE6FF",
          fontSize: 15
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

            // 使用item.color来显示图例的颜色
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color.colorStops[0].color + '"></span>';
            // 显示图例名称和对应的值
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      xAxis: {
        type: "category",
        data: Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()).reverse(),
        axisLine: {
          lineStyle: {
            color: "rgba(118, 169, 250, .8)",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          color: "#15faff",
          fontSize: 15,
          margin: 5,
        },
      },
      yAxis: {
        type: "value",
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: "#C5E5F9",
          fontSize: 12,
          margin: 5,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(118, 169, 250, .5)",
          },
        },
      },
      series: [
        {
          barWidth: '50%',
          name: "≥6",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFB6C1' },
              { offset: 1, color: 'rgba(255, 182, 193, 0)' },
            ]),
          },
          data: threeYearMagnitudes['≥6'],
        },
        {
          barWidth: '50%',
          name: "4.5-6",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ffbe84' },
              { offset: 1, color: 'rgba(255, 218, 185, 0)' },
            ]),
          },
          data: threeYearMagnitudes['4.5-6'],
        },
        {
          barWidth: '50%',
          name: "3-4.5",
          type: "bar",
          barGap: '-100%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFFACD' },
              { offset: 1, color: 'rgba(255, 250, 205, 0)' },
            ]),
          },
          data: threeYearMagnitudes['3-4.5'],
        },
        {
          barWidth: '50%',
          name: "<3",
          type: "bar",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7FFFD4' },
              { offset: 1, color: 'rgba(127, 255, 212, 0)' },
            ]),
          },
          data: threeYearMagnitudes['<3'],
        },
      ]
    },
  ];

  await nextTick();

  chartInstances.value.forEach(instance => instance?.dispose());
  chartInstances.value = [];

  const chartContainers = chart1.value.querySelectorAll('.chart');
  chartContainers.forEach(container => {
    container.innerHTML = '';
  });

  chartOptions.value.forEach((option, index) => {
    const chartContainer = chart1.value.querySelectorAll('.chart')[index];
    if (chartContainer) {
      const chartInstance = echarts.init(chartContainer);
      chartInstance.setOption(option);
      chartInstances.value[index] = chartInstance;
      console.log(`Initialized chart ${index + 1}:`, chartInstance);
    }
  });

  console.log('Current Chart Instances:', chartInstances.value.length);
};

onMounted(async () => {
  await initChart();
});

watch(() => props.eqData, async () => {
  await initChart();
}, { deep: true });
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>
