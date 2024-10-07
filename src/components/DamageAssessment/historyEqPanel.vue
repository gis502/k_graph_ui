<template>
  <div class="historyEqPanel">
    <div class="panelTable">
      <div class="text" style="display: flex;">
        <div class="hidden button" @click="sendHidden()">—</div>
        <span style="margin-left: 15px">统计表格</span>
      </div>
      <div class="table">
        <el-table :data="copiedHistoryEqData" :height="180" :max-height="180" stripe
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor" :row-style="{ height: '46px' }">
          <el-table-column prop="occurrenceTime" label="发震时刻" width="100" align="left"></el-table-column>
          <el-table-column prop="magnitude" label="震级" width="52" align="center"></el-table-column>
          <el-table-column prop="depth" label="深度" width="52" align="center"></el-table-column>
          <el-table-column prop="earthquakeName" label="参考位置" width="150" align="left"></el-table-column>
          <el-table-column prop="distance" label="震中距" width="85" align="center"></el-table-column>
        </el-table>
      </div>
    </div>


    <div style="display: flex;width: calc(100% - 30vw)">
      <div class="panelAssessment">
        <span>灾害评估</span>
        <div style="margin-top: 25px"><span>震中</span><span
          style="font-size: 18px;color: #409eff">50</span><span>公里范围内</span></div>
        <ul style="padding: 0 10px;" v-if="isNoHistoryEq === false">
          <li style="display: flex;justify-content: space-between;font-size: 14px">4.5-5.9级地震：<span class="emphasis">{{ type1Eq }}次</span>
          </li>
          <li style="display: flex;justify-content: space-between;font-size: 14px">6.0级以上地震：<span class="emphasis">{{ type2Eq }}次</span>
          </li>
        </ul>
        <span v-else>未发生过地震</span>
      </div>

      <div class="panelChart">
        <span>历史地震(次)</span>
        <div ref="chart" style="width: 350px;height: 160px;margin: 0 auto" v-if="isNoHistoryEq === false"></div>
        <div v-else style="margin-top: 25px;color: #fff">无历史地震</div>
      </div>
    </div>

    <div class="panelLegend">
      <span>图例</span>
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png" style="width: 15px;height: 15px;"></span><span style="font-size: 15px;margin-left: 5px">4.5-5.9级</span></div>
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png" style="width: 20px;height: 20px;"></span><span style="font-size: 15px;margin-left: 5px">6.0级以上</span></div>
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png" style="width: 25px;height: 25px;"></span><span style="font-size: 15px;margin-left: 5px">当前地震</span></div>
    </div>

  </div>

  <div class="panelEqInfo">
    <span style="color: #409eff;font-size: 18px">{{ selectedTabData.position }} {{ selectedTabData.magnitude }}级地震</span>
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
    historyEqData: Array,
    selectedTabData: {},
  },
  data() {
    return {
      copiedHistoryEqData: [],
      isNoHistoryEq: false,
      type1Eq: 0, // 4.5-5.9级地震数量
      type2Eq: 0, // 6.0级以上地震数量
    }
  },
  mounted() {
    this.settleData();
    this.$nextTick(() => {
      this.renderPieChart();
    });
  },
  methods: {
    // ECharts饼状
    renderPieChart() {
      const categories = {
        "4.5 - 5.9级": 0,
        ">= 6.0级": 0,
      };

      this.historyEqData.forEach(eq => {
        const magnitude = parseFloat(eq.magnitude);
        if (magnitude >= 4.5 && magnitude < 6.0) {
          categories["4.5 - 5.9级"] += 1;
        } else if (magnitude >= 6.0) {
          categories[">= 6.0级"] += 1;
        }
      });

      // 判断是否两个级别的数据都为0
      const noData = categories["4.5 - 5.9级"] === 0 && categories[">= 6.0级"] === 0;

      if (!noData) {
        // 计算总数
        const total = categories["4.5 - 5.9级"] + categories[">= 6.0级"];

        // ECharts 饼状图配置
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)', // 显示名称、数值和百分比
          },
          series: [
            {
              type: 'pie',
              radius: '50%',
              data: [
                {
                  value: categories["4.5 - 5.9级"],
                  name: '4.5 - 5.9级',
                  itemStyle: {color: '#FFCC00'}
                },
                {
                  value: categories[">= 6.0级"],
                  name: '>= 6.0级',
                  itemStyle: {color: '#FF0000'}
                },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                formatter: '{b}：{c}次', // 正常状态下的显示
              },
            },
          ],
        };

        // 初始化 ECharts 实例并设置配置
        const chart = echarts.init(this.$refs.chart);
        chart.setOption(option);
      }
    },

    // 计算各历史地震与震中的距离，并加入数组
    settleData() {
      this.copiedHistoryEqData = [...this.historyEqData];

      const selectedLat = parseFloat(this.selectedTabData.latitude);
      const selectedLon = parseFloat(this.selectedTabData.longitude);
      const R = 6371; // 地球半径，单位 km

      const deg2rad = (deg) => deg * (Math.PI / 180);

      this.copiedHistoryEqData = this.copiedHistoryEqData.map(eq => {
        const eqLat = parseFloat(eq.latitude);
        const eqLon = parseFloat(eq.longitude);
        const dLat = deg2rad(eqLat - selectedLat);
        const dLon = deg2rad(eqLon - selectedLon);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(selectedLat)) * Math.cos(deg2rad(eqLat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = (R * c).toFixed(2); // 计算距离并保留两位小数

        return {
          ...eq,
          distance: `${distance} km`, // 将距离加到数据中
        };
      });

      this.historyEqData.forEach(eq => {
        const magnitude = parseFloat(eq.magnitude);
        if (magnitude >= 4.5 && magnitude < 6.0) {
          this.type1Eq += 1;
        } else if (magnitude >= 6.0) {
          this.type2Eq += 1;
        }
      });
      if (this.type1Eq === 0 && this.type2Eq === 0) {
        this.showNoData();
      }

    },

    showNoData() {
      this.isNoHistoryEq = true;
      console.log('No Data')
    },

    sendHidden() {
      const isHistoryEqPointsShow = false;
      this.$emit('hidden', isHistoryEqPointsShow);
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
.historyEqPanel {
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


.legend {
  display: flex;
  margin-left: 60px;
  list-style-type: none;
  padding-left: 0;
}

.image {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  width: 25px;
  height: 25px;
}

.panelAssessment {
  float: left;
  min-width: 200px;
  height: 200px;
}

.panelChart {
  float: left;
  width: calc(100% - 200px);
  padding: 10px;
  height: 200px;
}

.panelLegend {
  float: right;
  display: flex;
  width: calc(100% - 30vw);
  height: 100%;
  padding: 10px;
  border-top: #000 2px solid;
}

.panelTable {
  float: left;
  width: 30vw
}

.panelAssessment, .panelTable, .panelEqInfo {
  padding: 10px;
  border-right: #000 2px solid;
}

.hidden {
  height: 30px;
  width: 30px;
  border: #2a2b36 2px solid;
  border-radius: 3px;
  font-weight: bold;
  font-size: 18px;
  margin-right: 0;
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
  color: orange;
  font-weight: bold;
}

span {
  color: #fff;
  font-size: 14px;
}

li {
  display: flex;
  text-align: center;
  margin: 10px 0;
  color: #fff;
}

p {
  color: #fff;
}

::v-deep .el-scrollbar__view {
  background-color: #2d3d51;
}


</style>
