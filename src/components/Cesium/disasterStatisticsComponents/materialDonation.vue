<template>
  <el-carousel trigger="click" height="570px" interval="3000" indicator-position="none">
    <el-carousel-item>
      <div class="panelChart" ref="MaterialDonationChart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <div class="panelChart" ref="RedCrossDonationsChart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <div class="panelChart" ref="GovernmentDonationsChart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <div class="panelChart" ref="CharityDonationsChart"></div>
    </el-carousel-item>
  </el-carousel>
</template>

<script>
import * as echarts from "echarts";
import { getMaterialDonation } from "@/api/system/materialDonation.js";
import { getRedCrossDonations } from "@/api/system/redCrossDonation.js";
import { getGovernment } from "@/api/system/governmentDepartmentDonations.JS";
import { getCharity } from "@/api/system/charitableOrganization.js";

export default {
  props: {
    eqid: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      chartsData: {
        Material: [],
        RedCross: [],
        Government: [],
        Charity: [],
      },
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    /**
     * 获取不同的数据源
     */
    getData() {
      // 获取物资捐赠数据
      getMaterialDonation(this.eqid).then(res => {
        this.loadData(res, 'MaterialDonation', ['materialDonationCount', 'drugsDonationCount']);
      });
      // 获取红十字会捐赠数据
      getRedCrossDonations(this.eqid).then(res => {
        this.loadData(res, 'RedCrossDonations', ['donationAmount', 'todayAmount']);
      });
      // 获取政府捐赠数据
      getGovernment(this.eqid).then(res => {
        this.loadData(res, 'GovernmentDonations', ['donationAmount', 'todayAmount']);
      });
      // 获取慈善组织捐赠数据
      getCharity(this.eqid).then(res => {
        this.loadData(res, 'CharityDonations', ['donationAmount', 'todayAmount']);
      });
    },

    // 加载和处理捐赠数据
    loadData(res, chartTitle, dataFields) {
      let affectedData = [];
      let legendData = [];
      if (chartTitle === 'MaterialDonation') {
        // 物资捐赠的数据，字段为 materialDonationCount 和 drugsDonationCount
        affectedData = res.map(item => ({
          earthquakeAreaName: item.earthquakeAreaName,
          materialDonationCount: item.materialDonationCount,
          drugsDonationCount: item.drugsDonationCount,
        }));
        legendData = ['累计捐赠物资(万件)', '累计捐赠药品(箱)']
      } else if (chartTitle === 'RedCrossDonations') {
        // 红十字会捐赠的数据，字段为 donationAmount 和 todayAmount
        affectedData = res.map(item => ({
          earthquakeAreaName: item.earthquakeAreaName,
          donationAmount: item.donationAmount,
          todayAmount: item.todayAmount,
        }));
        legendData = ['累计接收捐赠资金(万元)', '当日接收捐赠资金(万元)']
      } else if (chartTitle === 'GovernmentDonations') {
        // 政府捐赠的数据，字段为 donationAmount 和 todayAmount
        affectedData = res.map(item => ({
          earthquakeAreaName: item.earthquakeAreaName,
          donationAmount: item.donationAmount,
          todayAmount: item.todayAmount,
        }));
        legendData = ['累计接收捐赠资金(万元)', '当日接收捐赠资金(万元)']
      } else if (chartTitle === 'CharityDonations') {
        // 慈善组织捐赠的数据，字段为 donationAmount 和 todayAmount
        affectedData = res.map(item => ({
          earthquakeAreaName: item.earthquakeAreaName,
          donationAmount: item.donationAmount,
          todayAmount: item.todayAmount,
        }));
        legendData = ['累计接收捐赠资金(万元)', '当日接收捐赠资金(万元)']
      }

      // 获取所有区县名称
      let areaNames = affectedData.map(item => item.earthquakeAreaName);
      // 获取捐赠数据
      const donationData = affectedData.map(item => item[dataFields[0]]);
      const todayData = affectedData.map(item => item[dataFields[1]]);

      // 将数据存储在 chartsData 中
      this.chartsData[chartTitle.split(" ")[0]] = { areaNames, donationData, todayData };

      // 调用初始化图表方法
      this.initChart(areaNames, donationData, todayData, chartTitle,legendData);
    },

    // 图表初始化方法
    initChart(areaNames, donationData, todayData, chartTitle,legendData) {
      const chartRef = chartTitle.replace(' ', '') + 'Chart'; // 去掉空格并生成 ref 名
      const chartDom = this.$refs[chartRef];

      if (chartTitle === 'MaterialDonation'){
        chartTitle = '物资捐赠情况'
      }
      if (chartTitle === 'RedCrossDonations'){
        chartTitle = '红十字会捐赠情况'
      }
      if (chartTitle === 'GovernmentDonations'){
        chartTitle = '政府捐赠情况'
      }
      if (chartTitle === 'CharityDonations'){
        chartTitle = '慈善组织捐赠情况'
      }

      // 检查是否找到对应的图表 DOM
      if (!chartDom) {
        return;
      }

      const myChart = echarts.init(chartDom);

      const option = {
        backgroundColor: 'transparent',
        title: {
          text: chartTitle,
          textStyle: {
            color: 'rgba(255,255,255,0.9)',
            fontSize: 18,
          },
          left: 'center',
          top: '5%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17,95,182,0.5)',
          textStyle: {
            color: "#fff"
          },
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: legendData, // 或者你可以根据数据字段动态更改
          align: 'left',
          right: 50,
          top: 80,
          textStyle: {
            color: "rgba(255,255,255,0.9)"
          },
          itemWidth: 15,
          itemHeight: 15,
          itemGap: 25,
          icon: 'path://M961.3,130.5c-165.8-0.7-315.7,98.6-379.7,251.6c-64,153-29.4,329.4,87.6,447c117,117.5,293.3,152.9,446.6,89.6C1269,855.5,1369,706,1369.1,540.2C1369.3,314.6,1186.9,131.3,961.3,130.5L961.3,130.5zM961.3,740.5c-106.9,0-193.9-89.9-193.9-200.2c0-110.3,87-200.2,193.9-200.2c106.9,0,194,89.8,194,200.2S1068.1,740.5,961.3,740.5L961.3,740.5z M961.3,740.5'
        },
        grid: {
          top: '20%',
          left: '8%',
          right: '8%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: [{
          type: 'value',
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14
            }
          },
          axisTick: { show: false },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#063374",
              width: 1,
              type: "solid"
            },
          },
          splitLine: { lineStyle: { color: "#063374", type: "dashed" } }
        }],
        yAxis: [{
          type: 'category',
          data: areaNames,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            textStyle: {
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14
            }
          }
        }],
        series: [{
          name: legendData[0],
          type: 'bar',
          data: donationData, // 捐赠数据
          barWidth: 10,
          barGap: 1,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [{
                offset: 0,
                color: '#FEC060'
              }, {
                offset: 1,
                color: 'rgba(254, 192, 96, 0.1)'
              }]),
              opacity: 1,
              barBorderRadius: [0, 30, 30, 0],
            }
          }
        }, {
          name: legendData[1],
          type: 'bar',
          data: todayData, // 今日捐赠数据
          barWidth: 10,
          barGap: 1,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [{
                offset: 0,
                color: '#0291FF'
              }, {
                offset: 1,
                color: 'rgba(12, 135, 230, 0.1)'
              }]),
              opacity: 1,
              barBorderRadius: [0, 30, 30, 0],
            }
          }
        }]
      };

      myChart.setOption(option);
    }
  },
};
</script>

<style scoped>
.panelChart {
  width: 400px;
  height: 630px;
}
</style>
