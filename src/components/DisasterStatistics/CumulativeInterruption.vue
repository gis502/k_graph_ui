<template>
  <div ref="chart" style="width: 100%; height: 275px;" class="container-left"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'CumulativeInterruption',
  data() {
    return {
      echartData: [
        {
          value: 43,
          name: '目前道路中断村（个）',
          itemStyle: {
            normal: {
              color: 'black',
            },
          },
        },
        {
          value: 28,
          name: '目前主网供电中断村（个）',
          itemStyle: {
            normal: {
              color: '#ffa500',
            },
          },
        },
        {
          value: 24,
          name: '目前通信中断村（个）',
          itemStyle: {
            normal: {
              color: '#f81919',
            },
          },
        },
      ],
      chartInstance: null,
    };
  },
  mounted() {
    this.initChart();
  },
  watch: {
    echartData: {
      handler() {
        this.initChart();
      },
      deep: true,
    },
  },
  methods: {
    initChart() {
      if (this.$refs.chart) {
        // 销毁之前的实例，防止重复初始化
        if (this.chartInstance) {
          this.chartInstance.dispose();
        }
        // 初始化 ECharts 实例
        this.chartInstance = echarts.init(this.$refs.chart);

        const option = {
          title: {
            text: '中断累计',
            top: 'center',
            right: 'center',
            textStyle: {
              color: '#f2f2f2',
              fontSize: 23,
              align: 'center',
            },
            subtextStyle: {
              fontSize: 25,
              color: ['#ff9d19'],
            },
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            y: '10',
            itemWidth: 20,
            itemHeight: 16,
            textStyle: {
              color: '#fff',
            },
            itemGap: 30,
            data: this.echartData.map((item) => item.name),
          },
          series: [
            {
              type: 'pie',
              itemStyle: {
                normal: {
                  borderWidth: 5,
                },
              },
              radius: ['80%', '65%'],
              hoverAnimation: false,
              label: {
                normal: {
                  formatter: (params) => {
                    return '{yellow|' + params.name + '}\n{value|' + params.value + '}';
                  },
                  rich: {
                    yellow: {
                      color: '#ffc72b',
                      fontSize: 16,
                      align: 'center',
                    },
                    value: {
                      color: 'yellow',
                      fontSize: 23,
                      align: 'center',
                      lineHeight: 35,
                    },
                  },
                },
              },
              labelLine: {
                normal: {
                  length: 25,
                  length2: 15,
                  lineStyle: {
                    color: '#fff',
                  },
                },
              },
              data: this.echartData,
            },
          ],
        };

        this.chartInstance.setOption(option);
      } else {
        console.error('chart DOM element is not ready.');
      }
    },
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  },
};
</script>

<style scoped>
.container-left {
  margin-left: 10px;
}
</style>
