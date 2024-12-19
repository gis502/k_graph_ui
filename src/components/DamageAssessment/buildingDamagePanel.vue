<template>
  <div class="economicLossPanel">

    <div class="panelLegend">
      <span>图例（平方千米）</span>
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
        <span style="margin: 0 auto">
          <span>地震造成建筑破坏共计约</span>
          <span class="emphasis">{{ total }}平方公里</span>
        </span>

      </div>
      <div class="table">
        <el-table :data="copiedbuildingDamageData" :height="180" :max-height="180" stripe
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor" :row-style="{ height: '46px' }">
          <el-table-column prop="county" label="区县名称" align="center"></el-table-column>
          <el-table-column prop="size" label="建筑破坏 / km²" align="center" :formatter="formatSize"></el-table-column>
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
      <p>发震时刻：{{ timestampToTime(this.selectedTabData.occurrenceTime, "fullDateTime") }}</p>
      <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
      <p>地震震级：{{ selectedTabData.magnitude }}</p>
      <p>震源深度：{{ selectedTabData.depth }}千米</p>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import {timestampToTime} from "../../cesium/plot/eqThemes.js";

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
        {color: '(232, 236, 248)', label: '< 0.1km²'},
        {color: '(188, 197, 228)', label: '0.1~0.5km²'},
        {color: '(114, 143, 199)', label: '0.5~1km²'},
        {color: '(84, 127, 195)', label: '1~2km²'},
        {color: '(55, 109, 185)', label: '2~5km²'},
        {color: '(28, 96, 174)', label: '5~10km²'},
        {color: '(0, 84, 165)', label: '> 10km²'},
      ],

      isNoData: false,
    }
  },

  mounted() {
    this.settleData()
    console.log("data:",this.selectedTabData)
  },

  watch: {
    buildingDamageData: {
      handler() {
        this.settleData();
        console.log("dataL:",this.buildingDamageData)
      },
      deep: true,
    },
    selectedTabData: {
      handler() {
        this.settleData();

      },
      deep: true,
    },
  },

  methods: {
    timestampToTime,

    settleData() {
      this.copiedbuildingDamageData = [...this.buildingDamageData];
      console.log("11111")
      console.log(this.copiedbuildingDamageData)

      // 按 size 从大到小排序
      this.copiedbuildingDamageData.sort((a, b) => b.size - a.size);

      this.total = parseFloat(this.copiedbuildingDamageData.reduce((acc, cur) => acc + cur.size, 0).toFixed(2));

      // 提取 county: size 对象
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

      // 将县和对应的值组合为数组，方便排序和筛选
      const countyData = counties.map((county, index) => ({ name: county, value: values[index] }));

      // 按值降序排序，并取前八个
      const topCounties = countyData.sort((a, b) => b.value - a.value).slice(0, 8);

      // 提取前六个的县名和对应值
      const topCountyNames = topCounties.map(item => item.name);
      const topValues = topCounties.map(item => item.value);

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
          left: '2%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: topCountyNames,
          name: '',
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
          max: 10,
          interval: 2,
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
            data: topValues,
            itemStyle: {
              color: '#376db9',
            },
            barWidth: 30,
            barGap: 10,
            label: {
              show: true,
              position: 'top',
              color: '#fff',  // 设置数字的颜色
              fontSize: 12,   // 设置字体大小
            },
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

    formatSize(row, column, cellValue) {
      return parseFloat(cellValue).toFixed(2); // 保留两位小数
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
  width: calc(100% - 500px - 150px);
}

.panelAssessment {
  float: left;
  width: 100px;
  height: 100%;
}

.panelChart {
  float: right;
  width: 500px;
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
