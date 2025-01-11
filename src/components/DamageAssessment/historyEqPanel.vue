<template>
  <div class="historyEqPanel">
    <div class="panelTable">
      <div class="text" style="display: flex;justify-content: space-between">
        <span style="margin-left: 15px">统计表格</span>
        <div style="display: flex">
          <el-button size="small" @click="clearFilter" v-if="hasFilterPanelValue && !isFilterPanelShow"> 清空筛选 </el-button>
          <el-button size="small" @click="openPanel"> 筛选 </el-button>
        </div>
      </div>
      <div class="table">
        <el-table :data="historyEqData" :height="180" :max-height="180" stripe
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor" :row-style="{ height: '46px' }" @row-click="flyTo">
          <el-table-column prop="occurrenceTime" label="发震时刻" width="100" align="left"></el-table-column>
          <el-table-column prop="earthquakeName" label="参考位置" width="150" align="left"></el-table-column>
          <el-table-column prop="magnitude" label="震级" width="70" align="center"></el-table-column>
          <el-table-column prop="depth" label="深度/km" width="80" align="center"></el-table-column>
          <el-table-column prop="distance" label="震中距/km" align="center"></el-table-column>
        </el-table>
      </div>
    </div>


    <div style="display: flex;width: calc(100% - 30vw)">
      <div class="panelAssessment">
        <span>灾害评估</span>
        <div style="margin-top: 25px"><span>震中</span>
          <el-input class="radiusInput" v-model="radius" size="small" style="width: 55px;margin: 0 10px"
                    @change="settleData(radius, this.historyEqData, this.eqids)"></el-input>
          <span>公里范围内</span></div>
        <ul style="padding: 0 10px;" v-if="isNoHistoryEq === false">
          <li
            style="display: flex;justify-content: space-between;font-size: 14px;text-align: center;margin: 10px 0;color: #fff">
            4.0-5.9级地震：<span class="emphasis">{{
              type1Eq
            }}次</span>
          </li>
          <li
            style="display: flex;justify-content: space-between;font-size: 14px;text-align: center;margin: 10px 0;color: #fff">
            6.0级以上地震：<span class="emphasis">{{
              type2Eq
            }}次</span>
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
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png"
                                                   style="width: 15px;height: 15px;"></span><span
        style="font-size: 15px;margin-left: 5px">4.0-5.9级</span></div>
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png"
                                                   style="width: 20px;height: 20px;"></span><span
        style="font-size: 15px;margin-left: 5px">6.0级以上</span></div>
      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png"
                                                   style="width: 25px;height: 25px;"></span><span
        style="font-size: 15px;margin-left: 5px">当前地震</span></div>
    </div>

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

  <div class="universalPanel" v-if="isFilterPanelShow">
    <div class="panelTop">
      <h2 class="panelName">筛选</h2>
    </div>

    <div class="panelContent">
      <el-form class="panelForm">
        <el-form-item label="地震位置">
          <el-select v-model="filterPanel.countyName" placeholder="请选择雅安区县" style="width: 200px" clearable>
            <el-option
              v-for="item in yaanCounty"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
            v-model="filterPanel.occurrenceTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            style="width: 23vw;"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="地震震级">
          <el-input v-model="filterPanel.minMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="filterPanel.maxMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px;color: #303133">(级)</span>
        </el-form-item>
      </el-form>
    </div>

    <div style="width: 100%;display: flex;justify-content: center;align-items: center">
      <div class="panelButtons">
        <el-button type="primary" @click="query">确定</el-button>
        <el-button type="primary" @click="cancelPanel">取消</el-button>
      </div>
    </div>

  </div>

</template>

<script>
import * as echarts from 'echarts';
import {addHistoryEqPoints} from "../../cesium/plot/eqThemes.js";

export default {
  props: {
    eqData: Array,
    selectedTabData: {},
  },

  data() {
    return {
      isNoHistoryEq: false,
      radius: 50,
      type1Eq: 0, // 4.0-5.9级地震数量
      type2Eq: 0, // 6.0级以上地震数量
      historyEqData: [],
      eqids: [],
      isFilterPanelShow: false,
      filterPanel: {
        countyName: "",
        occurrenceTime: "",
        minMagnitude: "",
        maxMagnitude: "",
      },
      usingPanel: {},
      yaanCounty: [
        {
          label: "宝兴县",
          value: "宝兴",
        },
        {
          label: "芦山县",
          value: "芦山",
        },
        {
          label: "天全县",
          value: "天全",
        },
        {
          label: "名山区",
          value: "名山",
        },
        {
          label: "雨城区",
          value: "雨城",
        },
        {
          label: "荥经县",
          value: "荥经",
        },
        {
          label: "汉源县",
          value: "汉源",
        },
        {
          label: "石棉县",
          value: "石棉",
        },
      ],
      shortcuts: [
        {
          text: '近一周',
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
          },
        },
        {
          text: '近一个月',
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
          },
        },
        {
          text: '近三个月',
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            return [start, end];
          },
        },
        {
          text: '近一年',
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
            return [start, end];
          },
        },
      ]
    }
  },
  mounted() {
    this.settleData(50, this.eqData);
  },

  computed: {
    hasFilterPanelValue() {
      return Object.values(this.usingPanel).some(value => value !== "" && value !== undefined);
    }
  },

  methods: {
    flyTo(row) {
      console.log(row)
      const eqid = row.eqid;
      const lonAndLat = [Number(row.longitude), Number(row.latitude)];
      this.$emit("flyTo", lonAndLat, eqid);
    },
    // ECharts饼状
    renderPieChart(historyEqData) {
      const categories = {
        "4.0 - 5.9级": 0,
        ">= 6.0级": 0,
      };

      historyEqData.forEach(eq => {
        const magnitude = parseFloat(eq.magnitude);
        if (magnitude >= 4.0 && magnitude < 6.0) {
          categories["4.0 - 5.9级"] += 1;
        } else if (magnitude >= 6.0) {
          categories[">= 6.0级"] += 1;
        }
      });

      // 判断是否两个级别的数据都为0
      const noData = categories["4.0 - 5.9级"] === 0 && categories[">= 6.0级"] === 0;

      if (!noData) {
        // 计算总数
        const total = categories["4.0 - 5.9级"] + categories[">= 6.0级"];

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
                  value: categories["4.0 - 5.9级"],
                  name: '4.0 - 5.9级',
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
        const chart = echarts.init(this.$refs.chart);
        chart.setOption(option);
      }
    },

    // 计算各历史地震与震中的距离，并加入数组
    settleData(radius, data, filteredEqids) {
      this.type1Eq = 0;
      this.type2Eq = 0;

      if(this.eqids.length === 0) {
        this.eqids = this.eqData.map(eq => eq.eqid);
      }

      // 防熊孩机制，乱输入则返回半径50公里范围，其中 Number(this.radius) <= 0 若设置成this.radius <= 0将报错
      if (this.radius === '' || this.radius === null || isNaN(this.radius) || Number(this.radius) <= 0) {
        this.radius = 50;
      }

      const selectedLat = parseFloat(this.selectedTabData.latitude);
      const selectedLon = parseFloat(this.selectedTabData.longitude);
      const R = 6371; // 地球半径，单位 km
      const deg2rad = (deg) => deg * (Math.PI / 180);

      const historyEqData = addHistoryEqPoints(this.selectedTabData, this.eqData, radius, filteredEqids);
      // 对表格作处理
      this.historyEqData = historyEqData.map(eq => {
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
          distance: `${distance}`, // 将距离加到数据中
        };
      });


      // 不对historyEqData作处理

      this.historyEqData.forEach(eq => {
        const magnitude = parseFloat(eq.magnitude);
        if (magnitude >= 4.0 && magnitude < 6.0) {
          this.type1Eq += 1;
        } else if (magnitude >= 6.0) {
          this.type2Eq += 1;
        }
      });

      this.isNoHistoryEq = this.type1Eq === 0 && this.type2Eq === 0;
      this.$nextTick(() => {
        this.renderPieChart(this.historyEqData);
      });

      console.log("数据:",this.historyEqData)

    },

    openPanel() {
      if(Object.values(this.usingPanel).some(value => value !== "" && value !== undefined)){
        this.filterPanel = this.usingPanel
        this.usingPanel = {
          countyName: "",
          occurrenceTime: "",
          minMagnitude: "",
          maxMagnitude: "",
        }
      }
      console.log("面板：",this.filterPanel)
      this.isFilterPanelShow = true;
    },

    cancelPanel() {
      this.isFilterPanelShow = false;
      this.usingPanel = this.filterPanel;
    },

    clearPanel() {
      this.filterPanel = {
        countyName: "",
        occurrenceTime: "",
        minMagnitude: "",
        maxMagnitude: "",
      };
    },

    clearFilter() {
      this.clearPanel()
      this.usingPanel = {
        countyName: "",
        occurrenceTime: "",
        minMagnitude: "",
        maxMagnitude: "",
      }
      this.eqids = []
      this.settleData(this.radius, this.eqData)
    },

    query() {
      this.isFilterPanelShow = false;

      // 设置默认值
      if (this.filterPanel.minMagnitude === '') {
        this.filterPanel.minMagnitude = '3';
      }
      if (this.filterPanel.maxMagnitude === '') {
        this.filterPanel.maxMagnitude = '10';
      }

      // 检查震级范围是否有效
      const minMagnitudeValid = !this.filterPanel.minMagnitude || !isNaN(Number(this.filterPanel.minMagnitude)) && Number(this.filterPanel.minMagnitude) > 0;
      const maxMagnitudeValid = !this.filterPanel.maxMagnitude || !isNaN(Number(this.filterPanel.maxMagnitude)) && Number(this.filterPanel.maxMagnitude) > 0;

      // 判断时间条件
      if (this.filterPanel.occurrenceTime && this.filterPanel.occurrenceTime.length === 2) {
        // 如果 occurrenceTime 不为空，则补全时间段
        if (this.filterPanel.occurrenceTime[0] && this.filterPanel.occurrenceTime[1]) {
          this.filterPanel.occurrenceTime[0] += ' 00:00:00';
          this.filterPanel.occurrenceTime[1] += ' 23:59:59';
        }
      }

      // 如果时间和震级条件都为空，则认为无筛选条件
      if (
        (!this.filterPanel.occurrenceTime || this.filterPanel.occurrenceTime.length !== 2) &&
        !minMagnitudeValid &&
        !maxMagnitudeValid
      ) {
        this.$message({
          message: '请填写至少一个筛选条件',
          type: 'warning',
        });
        return;
      }

      // 触发筛选逻辑
      this.filter(this.filterPanel);

      this.usingPanel = this.filterPanel;
      this.clearPanel()
    },

    filter(filterParams) {
      console.log(filterParams);

      // 将 occurrenceTime 转换为 Date 对象（若时间为空则不使用时间过滤）
      let startTime = null;
      let endTime = null;
      if (filterParams.occurrenceTime && filterParams.occurrenceTime[0] && filterParams.occurrenceTime[1]) {
        [startTime, endTime] = filterParams.occurrenceTime.map(time => new Date(time));
      }

      // 筛选数据
      this.historyEqData = this.eqData.filter(item => {
        // 判断 earthquakeName 是否匹配
        const earthquakeNameMatch = filterParams.countyName
          ? item.earthquakeName.includes(filterParams.countyName)
          : true; // 如果未指定 countyName，则忽略此条件

        // 判断 occurrenceTime 是否在范围内
        const occurrenceTimeMatch = (() => {
          if (!startTime || !endTime) return true; // 如果时间为空，则不过滤时间
          if (!item.occurrenceTime) return false; // 数据中无 occurrenceTime 则不匹配
          const itemTime = new Date(item.occurrenceTime);
          return itemTime >= startTime && itemTime <= endTime;
        })();

        // 判断震级范围是否匹配
        const magnitudeMatch = (() => {
          const magnitude = Number(item.magnitude);
          const minMagnitude = Number(filterParams.minMagnitude);
          const maxMagnitude = Number(filterParams.maxMagnitude);
          if (isNaN(magnitude)) return false; // 如果 magnitude 不是数字，直接返回 false
          if (!this.filterPanel.minMagnitude || !this.filterPanel.maxMagnitude) return true; // 如果最小或最大震级未填写，则忽略此条件
          return magnitude >= minMagnitude && magnitude <= maxMagnitude;
        })();

        return earthquakeNameMatch && occurrenceTimeMatch && magnitudeMatch;
      });

      console.log("筛选后的数据：", this.historyEqData);

      this.eqids = this.historyEqData.map(item => item.eqid);

      this.settleData(this.radius, this.historyEqData, this.eqids)
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

.universalPanel {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  border-radius: 5px;
  background-color: rgba(53, 59, 67, 0.8);
  z-index: 100;
}

.panelTop {
  width: 100%;
  padding: 10px;
  height: 50px;
  border-radius: 5px;
  background-color: rgba(40, 59, 77, 0.8);
}

.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  margin: 0;
}

.panelName:before {
  content: "";
  width: 11px;
  height: 23px;
  position: relative;
  top: 7px;
  margin: 0 10px;
  display: inline-block;
  background-image: url("@/assets/images/CommandScreen/弹框标题图标.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.panelName:after {
  content: "";
  width: 95%;
  height: 6px;
  position: absolute;
  bottom: -15px;
  left: 9px;
  background-image: url("@/assets/images/CommandScreen/弹框标题分割线.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.panelContent {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 30px 0 30px;
  width: 100%;
}

.panelButtons {
  padding: 0 16px 16px 0;
}

.table {
  margin-top: 10px;
}

.emphasis {
  color: orange;
  font-weight: bold;
}

span {
  color: #fff;
  font-size: 14px;
}

p {
  color: #fff;
}

::v-deep .el-scrollbar__view {
  background-color: #2d3d51;
}

::v-deep .radiusInput .el-input__inner {
  color: #409eff;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.el-button {
  border-radius: 10px;
  background: linear-gradient(45deg, #2c3364, #0ff);
  color: #dce9fa;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
  border: none;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
}

::v-deep .panelForm .el-form-item__label {
  color: #FFF;
}

</style>
