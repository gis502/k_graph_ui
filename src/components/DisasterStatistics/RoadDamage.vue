<template>
  <div>
    <div ref="chart" style="width: 100%; height: 275px;" class="container-left"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'RoadDamage',
  props: {
    isRestored: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    let chart = echarts.init(this.$refs.chart);
    this.chart = chart;
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let tooltipContent = '';
          params.forEach(item => {
            tooltipContent += `<span style="display:inline-block;width:10px;height:10px;margin-right:5px;background-color:${item.color};border-radius:50%;"></span>
                               ${item.seriesName}: ${item.value} 公里<br/>`;
          });
          return tooltipContent;
        }
      },
      legend: {
        textStyle: {
          color: '#ffffff' // 设置图例文字颜色为白色
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['雨城区', '名山区', '荥经县', '汉源县', '石棉县', '天全县', '芦山县', '宝兴县'],
          axisLabel: {
            color: '#ffffff' // 设置 X 轴坐标文字颜色为白色
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)', // 设置为浅色
              width: 1 // 设置线宽为1
            }
          },
          axisLabel: {
            color: '#ffffff' // 设置 Y 轴坐标文字颜色为白色
          }
        }
      ],
      series: [
        {
          name: '已抢救道路损毁公里数',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#4A90E2' // 设置柱体颜色为蓝色
          },
          data: [10, 12, 11, 14, 9, 20, 20, 10]
        },
        {
          name: '待抢救道路损毁公里数',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#005193' // 设置柱体颜色为深蓝色
          },
          data: [20, 12, 11, 24, 20, 30, 30]
        }
      ]
    };
    chart.setOption(option);
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
};
</script>

<style scoped>
.container-left {
  /* 自定义样式 */
}
</style>
