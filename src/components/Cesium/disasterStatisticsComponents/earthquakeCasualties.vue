<template>
  <el-carousel trigger="click" height="600px" interval="3000" indicator-position="none">
    <el-carousel-item>
      <span class="update-time1">
          更新时间：{{ updateTime1 }}
      </span>
      <div class="PCChart" ref="PC1Chart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <span class="update-time1">
          更新时间： {{ updateTime2 }}
      </span>
      <div class="panelChart" ref="TR1Chart"></div>
      <span class="update-time2">
          更新时间： {{ updateTime3 }}
      </span>
      <div class="panelChart" ref="EA1Chart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <span class="update-time1">
          更新时间：{{ updateTime1 }}
      </span>
      <div class="PCChart" ref="PC2Chart"></div>
    </el-carousel-item>
    <el-carousel-item>
      <span class="update-time1">
          更新时间： {{ updateTime2 }}
      </span>
      <div class="panelChart" ref="TR2Chart"></div>
      <span class="update-time2">
          更新时间： {{ updateTime3 }}
      </span>
      <div class="panelChart" ref="EA2Chart"></div>
    </el-carousel-item>
  </el-carousel>
</template>

<script>
import * as echarts from "echarts";
import {gettotal as getCasualty} from "@/api/system/casualtystats.js";
import {getTotal as getDisasterStatistics} from "@/api/system/statistics";
import {getTotal as getTransfer} from "@/api/system/relocation";
import img from '@/assets/cirque.png';

export default {
  props: {
    eqid: {
      type: String,
      default: null,
    },
  },
  name: "",
  data() {
    return {
      updateTime1: '',
      updateTime2: '',
      updateTime3: '',
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    /**
     * 缩写：EA-地震震情；TR-转移安置；PC-人员伤亡；
     */
    getData() {
      getCasualty(this.eqid).then(res => {
        this.loadPCData(res)
      })
      getDisasterStatistics(this.eqid).then(res => {
        this.loadEAData(res)
      })
      getTransfer(this.eqid).then(res => {
        this.loadTRData(res)
      })
    },

    // 处理人员伤亡数据
    loadPCData(res) {
      this.updateTime1 = this.calculateUpdateTime(res, 'submissionDeadline');

      // 假设 res 是一个包含多个对象的数组，我们从中提取数据
      const affectedData = res.map(item => ({
        areaName: item.affectedAreaName, // 区县名
        totalInjured: item.totalInjured, // 累计受伤人数
        totalMissing: item.totalMissing, // 累计失联人数
        totalDeceased: item.totalDeceased, // 累计遇难人数
      }));

      // 根据区县名创建 yAxis 的标签
      const areaNames = affectedData.map(item => item.areaName);

      // 将对应的伤亡数据填充到图表的数据数组中
      const totalInjured = affectedData.map(item => item.totalInjured);
      const totalMissing = affectedData.map(item => item.totalMissing);
      const totalDeceased = affectedData.map(item => item.totalDeceased);

      // 调用图表初始化方法
      this.initPCChart(areaNames, totalInjured, totalMissing, totalDeceased);
    },
    initPCChart(areaNames, totalInjured, totalMissing, totalDeceased) {
      // 检查是否有数据和chart DOM
      if (!this.$refs.PC1Chart && !this.$refs.PC2Chart) {
        return;
      }

      // 获取图表 DOM 元素
      const chartDom1 = this.$refs.PC1Chart;
      const chartDom2 = this.$refs.PC2Chart;

      const myChart1 = echarts.init(chartDom1);
      const myChart2 = echarts.init(chartDom2);

      // 设置图表配置项
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '人员伤亡统计',
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
          data: ['累计受伤(人)', '累计失联(人)', '累计遇难(人)'],
          align: 'left',
          right: 50,
          top: 70,
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
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#063374",
              width: 1,
              type: "solid"
            },
          },
          splitLine: {
            lineStyle: {
              color: "#063374",
              type: "dashed"
            }
          }
        }],
        yAxis: [{
          type: 'category',
          data: areaNames, // 使用动态获取的区县名
          axisLine: {
            show: false,
            lineStyle: {
              color: "#063374",
              width: 1,
              type: "solid"
            }
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14
            }
          },
        }],
        series: [{
          name: '累计受伤(人)',
          type: 'bar',
          data: totalInjured, // 动态填充受伤人数
          barWidth: 10,
          barGap: 1,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [{
                offset: 0,
                color: '#00FFB4'
              }, {
                offset: 1,
                color: 'rgba(0, 255, 255, 0.1)',
              }]),
              opacity: 1,
              barBorderRadius: [0, 30, 30, 0],
            }
          }
        }, {
          name: '累计失联(人)',
          type: 'bar',
          data: totalMissing, // 动态填充失联人数
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
        }, {
          name: '累计遇难(人)',
          type: 'bar',
          data: totalDeceased, // 动态填充遇难人数
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
            },
          }
        }]
      };

      // 使用刚指定的配置项和数据显示图表
      myChart1.setOption(option);
      myChart2.setOption(option);
    },

    // 处理转移安置数据
    loadTRData(res) {
      this.initTRChart(res);
    },
    initTRChart(res) {
      // 检查是否有数据和chart DOM
      if (!this.$refs.TR1Chart && !this.$refs.TR2Chart) {
        return;
      }

      this.updateTime2 = this.calculateUpdateTime(res, 'reportingDeadline');

      // 获取图表 DOM 元素
      const chartDom1 = this.$refs.TR1Chart;
      const myChart1 = echarts.init(chartDom1);
      const chartDom2 = this.$refs.TR2Chart;
      const myChart2 = echarts.init(chartDom2);

      // 使用给定的字段名称
      const areaNames = ['应急避难所', '临时安置点', '新增转移', '累计转移'];

      // 初始化数据容器
      const data = {
        '应急避难所': 0,
        '临时安置点': 0,
        '新增转移': 0,
        '累计转移': 0
      };

      // 遍历 res 数据并提取字段
      res.forEach(item => {
        // 累加每个字段的值
        data['应急避难所'] += item.emergencyShelters || 0;
        data['临时安置点'] += item.temporaryShelters || 0;
        data['新增转移'] += item.newlyTransferred || 0;
        data['累计转移'] += item.cumulativeTransferred || 0;
      });

      // 生成柱状图数据
      const barData = areaNames.map(area => data[area]);

      // 配置图表
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '转移安置信息统计',
          textStyle: {
            color: 'rgba(255,255,255,0.9)',
            fontSize: 18,
          },
          left: 'center',
          top: '5%',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17,95,182,0.5)',  // 背景颜色
          textStyle: {
            color: "#fff"  // 文本颜色
          },
          axisPointer: {
            type: 'shadow'  // 鼠标指针样式
          },
          formatter: '{b}<br/>数量: {c}'  // 格式化显示内容，b 是区域名称，c 是数量
        },
        xAxis: {
          type: 'category',
          data: areaNames,
          axisLine: {
            lineStyle: {
              color: '#ddd'  // 轴线颜色
            }
          },
          axisLabel: {
            color: '#fff'  // 轴标签文字颜色
          },
          nameTextStyle: {
            color: '#fff'  // 轴名颜色
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#fff'  // Y 轴标签文字颜色
          },
          nameTextStyle: {
            color: '#fff'  // Y 轴名颜色
          }
        },
        legend: {
          show: false, // 不显示图例
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: barData,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
                {offset: 0, color: '#00FFB4'},  // 渐变色起始颜色
                {offset: 1, color: 'rgba(0, 255, 255, 0.1)'} // 渐变色结束颜色
              ]),
              opacity: 1, // 设置柱子的透明度
              barBorderRadius: [0, 30, 30, 0],  // 设置圆角
            }
          },
          barWidth: 10,  // 柱子宽度
          barGap: 1,     // 柱子之间的间距
          label: {
            show: true,
            position: 'top', // 标签显示在柱子顶部
            color: '#fff',  // 标签文字颜色
            fontSize: 14,  // 标签文字大小
            formatter: '{c}'  // 在柱子顶部显示数量
          }
        }]
      };

      // 使用配置项和数据显示图表
      myChart1.setOption(option);
      myChart2.setOption(option);
    },

    // 处理地震震情数据
    loadEAData(res) {
      this.updateTime3 = this.calculateUpdateTime(res, 'submission_deadline');

      // 初始化一个对象来存储震级的累加值
      let totalMagnitude = {
        '3.3-3.9': 0,
        '4.4-4.9': 0,
        '5.5-5.9': 0,
        '6.0及以上': 0
      };

      // 遍历 `res` 数组，累加每个震级的数据
      res.forEach(item => {
        totalMagnitude['3.3-3.9'] += item.magnitude_3_3_9 || 0;
        totalMagnitude['4.4-4.9'] += item.magnitude_4_4_9 || 0;
        totalMagnitude['5.5-5.9'] += item.magnitude_5_5_9 || 0;
        totalMagnitude['6.0及以上'] += item.magnitude_6 || 0;
      });

      // 将累加的数据传递给 echarts 进行展示
      this.initEAChart(totalMagnitude);
    },
    initEAChart(totalMagnitude) {
      // 震级数据
      const trafficWay = [
        {name: '3.3-3.9', value: totalMagnitude['3.3-3.9']},
        {name: '4.4-4.9', value: totalMagnitude['4.4-4.9']},
        {name: '5.5-5.9', value: totalMagnitude['5.5-5.9']},
        {name: '6.0及以上', value: totalMagnitude['6.0及以上']}
      ];

      const color = ['#00FFFF', '#409B5C', '#006CED', '#FFE000'];  // 震级类别的颜色

      // 数据处理，填充饼状图所需的格式
      let data = [];
      for (let i = 0; i < trafficWay.length; i++) {
        data.push({
          value: trafficWay[i].value,
          name: trafficWay[i].name,
          itemStyle: {
            normal: {
              borderWidth: 5,
              shadowBlur: 20,
              borderColor: color[i],
              shadowColor: color[i]
            }
          }
        }, {
          value: 2,  // 用于展示中间圆形的空白数据
          name: '',
          itemStyle: {
            normal: {
              label: {show: false},
              labelLine: {show: false},
              color: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 0
            }
          }
        });
      }

      // 配置 echarts 饼状图
      const option = {
        backgroundColor: 'transparent',
        color: color,
        title: {
          text: '震级数量',
          top: '45%',
          textAlign: "center",
          left: "49%",
          textStyle: {
            color: '#fff',
            fontSize: 18,
            fontWeight: '400'
          },
        },
        graphic: {
          elements: [{
            type: "image",
            z: 3,
            style: {
              image: img,  // 替换为你想展示的图像
              width: 117,  // 缩小图片宽度
              height: 117  // 缩小图片高度
            },
            left: 'center',
            top: 'center',
            position: [50, 50]
          }]
        },
        tooltip: {
          show: true,
          formatter: function (params) {
            let total = 0;
            for (let i = 0; i < trafficWay.length; i++) {
              total += trafficWay[i].value;
            }
            if (params.name !== '') {
              return params.name + ': ' + params.value + '次'
            } else {
              return '';
            }
          },
          backgroundColor: 'rgba(17,95,182,0.5)',
          textStyle: {
            color: "#fff"
          },
        },
        legend: {
          icon: "circle",
          orient: 'horizontal',
          data: ['3.3-3.9', '4.4-4.9', '5.5-5.9', '6.0及以上'],
          right: 70,  // 调整图例位置
          bottom: 0,  // 提高图例位置
          align: 'right',
          itemWidth: 10,  // 图例项宽度
          itemHeight: 10,  // 图例项高度
          textStyle: {
            color: "#fff",
            fontSize: 12  // 缩小字体
          },
          itemGap: 15  // 缩小图例项间距
        },
        toolbox: {
          show: false
        },
        series: [{
          name: '',
          type: 'pie',
          clockWise: false,
          radius: ['50%', '52%'],  // 缩小饼图半径
          hoverAnimation: false,
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'outside',
                color: '#ddd',
                formatter: function (params) {
                  let total = 0;
                  for (let i = 0; i < trafficWay.length; i++) {
                    total += trafficWay[i].value;
                  }
                  if (params.name !== '') {
                    return params.name + ': ' + params.value + '次';
                  } else {
                    return '';
                  }
                },
                rich: {
                  name: {
                    lineHeight: 12,  // 缩小行高
                    padding: [0, 0, 3, 0]  // 缩小底部间距
                  },
                  percent: {
                    lineHeight: 14,  // 设置为20以减少行高
                    padding: [3, 0, 0, 0]  // 调整顶部间距
                  }
                }
              },
              labelLine: {
                length: 30,  // 缩短标注线长度
                length2: 20,  // 缩短第二段线的长度
                show: true,
                color: '#00FFFF'
              }
            }
          },
          data: data
        }]
      };

      // 获取图表 DOM 元素并使用配置项初始化图表
      if (this.$refs.EA1Chart) {
        const chartDom = this.$refs.EA1Chart;
        const myChart = echarts.init(chartDom);
        myChart.setOption(option);
      }
      if (this.$refs.EA2Chart) {
        const chartDom = this.$refs.EA2Chart;
        const myChart = echarts.init(chartDom);
        myChart.setOption(option);
      }
    },

    tableHeaderColor() {
      return {
        'border': 'none',
        'color': '#409eff',
        'padding': '0',
        'text-align': 'center',
        'background-color': '#ffffff00',
      }
    },
    // 修改table的背景色
    tableColor() {
      return {
        'border': 'none',
        'color': '#fff',
        'padding': '10',
        'background-color': '#ffffff00',
      }
    },

    calculateUpdateTime(res, field) {
      const submissionDeadlines = res.map(item => item[field]).filter(Boolean);
      if (submissionDeadlines.length > 0) {
        const latest = new Date(Math.max(...submissionDeadlines.map(date => new Date(date))));
        return this.formatDate(latest.toISOString().replace('T', ' ').substring(0, 19));
      }
      return null;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');  // 月份从0开始，因此要加1
      const day = d.getDate().toString().padStart(2, '0');
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const seconds = d.getSeconds().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }
  },
};
</script>

<style scoped>
.update-time1 {
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218, 45, 45) 3%, rgba(254, 254, 254, 0) 90%);
  display: inline-block;
  color: white;
}

.update-time2 {
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218, 45, 45) 3%, rgba(254, 254, 254, 0) 90%);
  height: auto; /* 高度可以由内容决定 */
  position: absolute; /* 绝对定位 */
  top: 45%; /* 垂直方向到容器中间 */
  left: 0;
  color: white;
}

.PCChart {
  margin: 0 auto;  /* 水平居中 */
  width: 440px;
  height: 600px;
}

.panelChart {
  margin: 0 auto;  /* 水平居中 */
  width: 440px;
  height: 270px;
}
</style>
