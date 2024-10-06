<template>
  <div class="chart-container">
    <div class="chart-wrapper">
      <div ref="chart1" class="chart" style="width: 100%; height: 210px;"></div>
      <p class="chart-description" style="font-size: 17px; color: white;">变站</p>
    </div>
    <div class="chart-wrapper">
      <div ref="chart2" class="chart" style="width: 100%; height: 210px;"></div>
      <p class="chart-description" style="font-size: 17px; color: white;">跳闸线路</p>
    </div>
    <div class="chart-wrapper">
      <div ref="chart3" class="chart" style="width: 100%; height: 210px;"></div>
      <p class="chart-description" style="font-size: 17px; color: white;">主网停电用户数</p>
    </div>
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
      chart1: null,
      chart2: null,
      chart3: null
    };
  },
  mounted() {
    this.chart1 = echarts.init(this.$refs.chart1);
    this.chart2 = echarts.init(this.$refs.chart2);
    this.chart3 = echarts.init(this.$refs.chart3);

    const option1 = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: {
          color: '#ffffff' // 设置图例文字颜色为白色
        },
      },
      series: [
        {
          name: '电力设施损毁及抢修情况',
          type: 'pie',
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: 1048,
              name: '已恢复变站',
              itemStyle: { color: '#389af4' } // 设置颜色
            },
            {
              value: 735,
              name: '待修复变站',
              itemStyle: { color: '#dfeaff' } // 设置颜色
            }
          ]
        }
      ]
    };

    const option2 = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: {
          color: '#ffffff' // 设置图例文字颜色为白色
        },
      },
      series: [
        {
          name: '电力设施损毁及抢修情况',
          type: 'pie',
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          // #ff8c37", "#ffdcc3
          data: [
            {
              value: 800,
              name: '已恢复线路',
              itemStyle: { color: ' #ff8c37' } // 设置颜色
            },
            {
              value: 600,
              name: '待恢复线路',
              itemStyle: { color: '#ffdcc3' } // 设置颜色
            }
          ]
        }
      ]
    };

    const option3 = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: {
          color: '#ffffff' // 设置图例文字颜色为白色
        },
        padding: [0,0,0,0]
      },
      series: [
        {
          name: '电力设施损毁及抢修情况',
          type: 'pie',
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: 800,
              name: '累计主网停电用户数',
              itemStyle: { color: '#ffc257' } // 设置颜色
            },
            {
              value: 600,
              name: '已恢复主网停电用户数',
              itemStyle: { color: '#ffedcc' } // 设置颜色
            }
          ]
        }
      ]
    };

    this.chart1.setOption(option1);
    this.chart2.setOption(option2);
    this.chart3.setOption(option3);
  },
  beforeDestroy() {
    if (this.chart1) {
      this.chart1.dispose();
    }
    if (this.chart2) {
      this.chart2.dispose();
    }
    if (this.chart3) {
      this.chart3.dispose();
    }
  }
};
</script>

<style scoped>
.chart-container {
  display: flex; /* 使用flexbox布局 */
  justify-content: space-between; /* 在横向上均匀分布 */
}

.chart-wrapper {
  width: 48%; /* 设置包裹器宽度 */
  margin: 5px; /* 添加外边距 */
}

.chart-description {
  text-align: center; /* 居中对齐文字说明 */
  color: white; /* 设置文字颜色为白色 */
  font-size: 17px; /* 字体大小 */
}
</style>
