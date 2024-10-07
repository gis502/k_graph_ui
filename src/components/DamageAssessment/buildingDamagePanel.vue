<template>
  <div class="economicLossPanel">

    <div class="panelLegend">
      <span>图例（元）</span>
      <ul>
        <li v-for="(item, index) in legendItems" :key="index">
          <span
            :style="{ backgroundColor: `rgba(${convertColor(item.color)}, 1)`, width: '40px', height: '20px' }"></span>
          {{ item.label }}
        </li>
      </ul>
    </div>

    <div class="panelTable">
      <div class="text" style="display: flex; justify-content: space-between; align-items: center;">
        <span>统计表格</span>
        <span style="margin-right: 0">
          <span>地震造成建筑破坏共计约</span>
          <span class="emphasis">{{ total }}平方公里</span>
        </span>

      </div>
      <div class="table">
        <el-table :data="copiedbuildingDamageData" :height="180" :max-height="180" stripe
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor" :row-style="{ height: '46px' }">
          <el-table-column prop="county" label="区县名称" align="center"></el-table-column>
          <el-table-column prop="size" label="建筑破坏 / km²" align="center"></el-table-column>
        </el-table>
      </div>
    </div>

    <div class="panelChart" ref="chart"></div>

  </div>

  <div class="panelEqInfo">
    <span style="color: #409eff;font-size: 18px">{{ selectedTabData.earthquakeName }} {{
        selectedTabData.magnitude
      }}级地震</span>
    <div style="padding: 1px 20px 10px 20px">
      <p>发震时刻：{{ selectedTabData.time }}</p>
      <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
      <p>地震震级：{{ selectedTabData.magnitude }}</p>
      <p>震源深度：{{ selectedTabData.depth }}千米</p>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    buildingDamageData: Array,
    selectedTabData: {},
  },

  data() {
    return {
      copiedbuildingDamageData: [],
      total: 0,
      legendItems: [
        {color: '(232, 236, 248)', label: '< 1km²'},
        {color: '(188, 197, 228)', label: '1~5km²'},
        {color: '(114, 143, 199)', label: '5~10km²'},
        {color: '(84, 127, 195)', label: '10~20km²'},
        {color: '(55, 109, 185)', label: '20~50km²'},
        {color: '(28, 96, 174)', label: '50~100km²'},
        {color: '(0, 84, 165)', label: '> 100km²'},
      ],

      isNoData: false,
    }
  },
  mounted() {
    this.settleData()
  },
  methods: {

    settleData() {
      this.copiedbuildingDamageData = [...this.buildingDamageData];

      this.total = parseFloat(this.copiedbuildingDamageData.reduce((acc, cur) => acc + cur.size, 0).toFixed(2));

      // 提取county:Size对象
      const countySizeMap = this.copiedbuildingDamageData.reduce((acc, cur) => {
        acc[cur.county] = cur.size;
        return acc;
      }, {});

      this.initChart(countySizeMap)
    },

    initChart(countySizeMap) {
      // 获取图表 DOM 元素
      const chartDom = this.$refs.chart;
      const myChart = echarts.init(chartDom);

      // 准备数据
      const counties = Object.keys(countySizeMap);
      const values = Object.values(countySizeMap);

      // 设置图表配置项
      const option = {
        title: {
          text: '建筑破坏',
          left: 'center',
          textStyle: {
            color: '#fff', // 设置标题颜色为白色
          },
        },
        tooltip: {},
        grid: {
          left: '0%',
          right: '0%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: counties,
          name: '区县',
          axisLabel: {
            color: '#fff', // 设置X轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置X轴名称颜色为白色
          },
        },
        yAxis: {
          type: 'value',
          name: '损坏/km²',
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: {
            color: '#fff', // 设置Y轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置Y轴名称颜色为白色
          },
        },
        series: [
          {
            name: '建筑破坏',
            type: 'bar',
            data: values,
            itemStyle: {
              color: '#376db9',
            },
            barWidth: 30,
            barGap: 10,
          },

        ],
      };

      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    },

    convertColor(colorString) {
      return colorString.replace(/[()]/g, '').split(',').map(c => parseInt(c.trim())).join(', ');
    },

    tableHeaderColor() {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#293038 !important',
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
      }
    },
    // 修改table的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 === 1) {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#313a44',
          'color': '#fff',
          'padding': '10',
        }
      } else {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#304156',
          'color': '#fff',
          'padding': '10',
        }
      }
    },
  },
};
</script>

<style scoped>
.economicLossPanel {
  height: 250px;
  width: calc(100% - 333px);
  background-color: rgba(45, 61, 81, 0.8);
  z-index: 1;
}

.panelEqInfo {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 333px;
  height: 250px;
  z-index: 2;
  background-color: rgba(45, 61, 81, 0.8);
  border-left: #000 2px solid;
}

.panelTable {
  float: left;
  width: calc(100% - 450px - 150px);
}

.panelAssessment {
  float: left;
  width: 100px;
  height: 100%;
}

.panelChart {
  float: right;
  width: 450px;
  height: 100%;
}


.panelLegend {
  float: left;
  width: 150px;
  height: 100%;
  padding: 5px 0 0 10px;
}

.panelAssessment, .panelLegend, .panelTable, .panelEqInfo {
  padding: 10px;
  border-right: #000 2px solid;
}

.table {
  margin-top: 10px;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.emphasis {
  font-size: 20px;
  color: orange;
  font-weight: bold;
}

span {
  color: #fff;
  font-size: 14px;
  margin-right: 10px;
}

ul {
  padding: 0;
}

li {
  display: flex;
  margin: 10px 0;
  color: #fff;
  width: 100%;
  height: 20px;
  font-size: 14px;
}

p {
  color: #fff;
}

::v-deep .el-scrollbar__view {
  background-color: #2d3d51;
}


</style>
