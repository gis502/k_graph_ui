<template>
  <div>
    <div ref="chart" style="width: 100%; height: 275px;" class="container-left"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'PowerSupply',
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
          }
        }
      ],
      series: [
        {
          name: '抢通恢复光缆',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#4A90E2' // 设置柱体颜色为蓝色
          },
          data: [120, 132, 101, 134, 90, 230, 210, 100]
        },
        {
          name: '目前待修复光缆',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#005193' // 设置柱体颜色为深蓝色
          },
          data: [220, 182, 191, 234, 290, 330, 310, 150]
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
