<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <h2 class="pop_title">
          标绘统计
          <span class="time">{{this.timestampToTimeChina(this.currentTime) }}</span>
        </h2></div>
      <div class="pop_content"
           @mouseenter="handleMouseEnter"
           @mouseleave="handleMouseLeave">
        <div class="range">统计范围：{{this.centerPosionName}}</div>
        <div class="num">总计：{{this.dataInTimeAndZoom.length}}个</div>
        <div id="plotsStatisticChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";

//拖拽滚动条数据不更新：
// 原因： Echarts 管理的状态和数据与 Vue 的响应式产生冲突，导致Echarts 无法正常更新而报错。
// 解决：markRaw，取消 VUE 的响应式系统观测 Echarts 的变化更新，让Echarts 自动更新。
import {markRaw} from 'vue'
import {getPlotInfos} from "@/api/system/plot.js";
import axios from "axios";

export default {
  data() {
    return {
      chart: null, // 保存 ECharts 实例
      myChart1Data: [],
      filtdata:[],
      resInfo:[],
      isDataReady:false,
      dataInTimeAndZoom:[],
      centerPosionName:'',
      option:null,
      scrollInterval:null,

    };
  },
  props: ['plots', 'currentTime','zoomLevel','viewCenterCoordinate','isTimerRunning'],
  watch: {
    plots(newVal) {
      this.getRescueActionCasualtiesPlotAndInfo();
    },

    currentTime(newVal) {
      console.log("currentTime watch",newVal)
      if(!this.isDataReady){
        this.getRescueActionCasualtiesPlotAndInfo(newVal);
      }
      this.updateTimeStatistic();
    },
    zoomLevel(newVal) {
      // console.log("zoomLevel watch",newVal)
      // if(!this.isDataReady){
      //   this.getRescueActionCasualtiesPlotAndInfo(newVal);
      // }
      // this.showZoomStatistic()
    },
    viewCenterCoordinate(newVal){
      // console.log("viewCenterCoordinate watch",newVal)
      // if(!this.isDataReady){
      //   this.getRescueActionCasualtiesPlotAndInfo(newVal);
      // }
      // this.showZoomStatistic()
    },
    isTimerRunning(newVal){
      if(newVal===false){
        // console.log("isTimerRunning plotStatistic",newVal)
        this.scroll()
      }
      else{
        this.scrollToStart()
      }
      //true 不滚动
      //fasle 滚动
    }
  },
  mounted() {
    this.initEcharts() //初始化
    // this.updateStatistic()
  },
  methods: {


    //图表操作
    //根据键取值，把值存到数组中 （一个工具函数）
    getArrByKey(data, k) {
      let key = k || "value";
      let res = [];
      if (data) {
        data.forEach(function (t) {
          res.push(t[key]);
        });
      }
      return res;
    },
    initEcharts() {
      //作用域赋值
      let that = this
      //初始化dom元素，和vue数据更新方式冲突，使用markRow取消响应式更新
      let chartDom = document.getElementById("plotsStatisticChart");
      let charttmp = echarts.init(chartDom);
      this.chart = markRaw(charttmp)//获取dom元素
      //数组最大值

      //配置
      this.option = {
        //位置布局
        grid: {
          top: '17%',
          bottom: -15,
          right: 50,
          left: 0,
          containLabel: true
        },
        //x轴
        xAxis: {
          show: false
        },
        //y轴
        yAxis: [{
          triggerEvent: true,
          show: true,
          inverse: true,
          // data: that.getArrByKey(that.myChart1Data, 'name'),
          data: [],
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false,
          },
        },
        ],
        series: [
          //和图例配置相关
          {
            name: '标绘点个数', // 确保这个名称与图例中的 data 属性匹配
            type: 'bar',
            yAxisIndex: 0,
            data: [],
            barWidth: 3,
            itemStyle: {
              color: '#59dbf8',
              barBorderRadius: 30,
              fontSize: 15,
            },
          },
          {
            type: 'bar',
            yAxisIndex: 0,
            data: [],
            barWidth: 3,
            itemStyle: {
              color: '#59dbf8',
              barBorderRadius: 30,
            },
            label: {
              show: true, // 显示标签
              position: 'insideTopLeft', // 横向居中，纵向在顶部
              offset: [0, -18],
              color: '#fff', // 文本颜色
              formatter: function (params) { //格式化标签内容：名称
                // console.log(params,"params")
                return (params.dataIndex + 1) + " " + params.name;
              },
              fontSize: 15, // 字体大小
              padding: [0, 0, -9, 0], // 根据需要调整内边距
            }
          },
          {
            type: "bar",
            barWidth: 3, //调整柱子高度
            xAxisIndex: 0,
            barGap: "-100%",//调整柱子间隔
            data: [],//以最大值作为柱子长度
            itemStyle: {
              normal: {
                color: "rgba(232,240,235,0.26)",  //颜色
                barBorderRadius: 14,
              },
            },
            zlevel: -1,
            // 为使得标签在div里水平居中，使用背景柱子的label，以长度一致的背景柱子确定水平中心
            label: {
              show: true, // 显示标签
              position: 'insideTopRight', // 横向居中，纵向在顶部
              offset: [0, -18],
              color: '#fff', // 文本颜色
              formatter: function (params) { //格式化标签内容：数量
                let findeditem = that.myChart1Data.filter(e => e.name === params.name)
                // 使用数据项的 name 和 value 作为标签内容
                return findeditem[0].value + "个";
              },
              fontSize: 15, // 字体大小
              padding: [0, 0, -9, 0], // 根据需要调整内边距
            }
          },
        ],
        //图例
        legend: {
          show: true, // 显示图例
          orient: 'horizontal', // 图例列表的布局朝向
          left: 'center', // 图例组件离容器右侧的距离
          top: 'top', // 图例组件离容器顶部的距离
          data: ['标绘点个数'], // 图例数据，这里与 series 中的 name 对应
          textStyle: {
            color: '#fff', // 图例文字颜色
            fontSize: 15,
          },
          itemHeight: 5, // 调整图例图标的高度

        },
        //滚动
        dataZoom: [
          //拖拽滚动条滚动
          {
            // 设置滚动条的隐藏或显示
            show: true,
            // 设置类型
            type: "slider",
            // 设置背景颜色
            backgroundColor: "rgb(19, 63, 100)",
            // 设置选中范围的填充颜色
            fillerColor: "rgb(16, 171, 198)",
            // 设置边框颜色
            borderColor: "rgb(19, 63, 100)",
            // 是否显示detail，即拖拽时候显示详细数值信息
            showDetail: false,
            // 数据窗口范围的起始数值
            startValue: 0,
            // 数据窗口范围的结束数值（一页显示多少条数据）
            endValue: 4,
            // 控制哪个轴，如果是number表示控制一个轴，
            // 如果是Array表示控制多个轴。此处控制第二根轴
            yAxisIndex: 0,
            // empty：当前数据窗口外的数据，被设置为空。
            // 即不会影响其他轴的数据范围
            filterMode: "empty",
            // 滚动条高度
            width: 8,
            // 滚动条显示位置
            height: "80%",
            // 距离右边
            right: 30,
            // 控制手柄的尺寸
            handleSize: 0,
            // 是否锁定选择区域（或叫做数据窗口）的大小
            zoomLoxk: true,
            // 组件离容器上侧的距离
            // 如果top的值为'top', 'middle', 'bottom'，组件会根据相应的位置自动对齐
            top: "middle",
          },
          //滚动鼠标滚轮滚动
          {
            // 没有下面这块的话，只能拖动滚动条，
            // 鼠标滚轮在区域内不能控制外部滚动条
            type: "inside",
            // 控制哪个轴，如果是number表示控制一个轴，
            // 如果是Array表示控制多个轴。此处控制第二根轴
            yAxisIndex: 0,
            // 滚轮是否触发缩放
            zoomOnMouseWheel: false,
            // 鼠标移动能否触发平移
            moveOnMouseMove: true,
            // 鼠标滚轮能否触发平移
            moveOnMouseWheel: true,
          },
        ],
        // 视觉映射配置
      };

      //配置
      this.chart.setOption(this.option);
    },
    //取位置
    async getRescueActionCasualtiesPlotAndInfo() {
      console.log("this.plots getRescueActionCasualtiesPlotAndInfo", this.plots)
      if (!this.plots) {
        return;
      }
      const locationDataArray = await Promise.all(this.plots.map(async data => {
        const {plotId, plotType, longitude, latitude, startTime, endTime} = data;
        try {
          const locationInfo = await this.getReverseGeocode(longitude, latitude);
          return {longitude, latitude, plotId, plotType, locationInfo, startTime, endTime};
        } catch (error) {
          console.error(`Failed to get location info for plotId ${plotId}:`, error);
          return null;
        }
      }));
      const validLocationData = locationDataArray.filter(item => item !== null);
      this.resInfo = []
      await Promise.all(validLocationData.map(async data => {
        const {locationInfo, plotId, plotType, longitude, latitude, startTime, endTime} = data;
        this.resInfo.push({
          plotId: plotId,
          plotType: plotType,
          startTime: startTime,
          endTime: endTime,
          locationInfo: locationInfo
        });
      }));
      this.isDataReady = true;
      // console.log("resInfo.value111", this.resInfo)
      this.updateTimeStatistic()
    },
    async getReverseGeocode(lon, lat) {
      try {
        const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
          params: {
            postStr: JSON.stringify({lon, lat, ver: 1}),
            type: 'geocode',
            tk: '80eb284748e84ca6c70468c906f0c889'
          }
        });
        return response.data.result.addressComponent;
      } catch (error) {
        console.error("逆地理编码失败:", error);
        return null;
      }
    },

    updateTimeStatistic() {
      if (!this.currentTime) {
        return;
      }
      this.dataIntime = []
      this.resInfo.forEach(item => {
        let currentDate = new Date(this.currentTime);
        let startDate = new Date(item.startTime);
        let endDate = new Date(item.endTime);
        if (startDate <= currentDate && endDate >= currentDate) {
          this.dataIntime.push(item)
        }
      })
      // console.log("dataIntime",dataIntime)
      this.showZoomStatistic()
    },
    async showZoomStatistic() {
      if (!this.dataIntime) {
        return;
      }
      this.dataInTimeAndZoom = []
      // console.log(this.dataIntime, "this.dataIntime")
      const originalArray = Array.from(this.dataIntime);

      // console.log(this.viewCenterCoordinate,originalArray,"originalArray")
      // if(!this.viewCenterCoordinate.lon){
      //   this.dataInTimeAndZoom=originalArray.filter(data => data.locationInfo.city === '雅安市');
      //   this.centerPosionName='雅安市'
      //   console.log(this.centerPosionName,"this.centerPosionName")
      // }
      // else{
      //   let viewCenterLocation=await this.getReverseGeocode(this.viewCenterCoordinate.lon,this.viewCenterCoordinate.lat)

      // switch (this.zoomLevel) {
      //   case '市':
      //     this.dataInTimeAndZoom=originalArray.filter(data => data.locationInfo.city === '雅安市');
      //     this.centerPosionName='雅安市'
      //     console.log(this.centerPosionName,"this.centerPosionName")
      //     break;
      //   case '区/县':
      //     this.dataInTimeAndZoom=originalArray.filter(data => data.locationInfo.county ===viewCenterLocation.county);
      //     this.centerPosionName=viewCenterLocation.county
      //     console.log(this.centerPosionName,"this.centerPosionName")
      //     break;
      //   case '乡/镇':
      //     this.dataInTimeAndZoom=originalArray.filter(data => data.locationInfo.town === viewCenterLocation.town);
      //     this.centerPosionName=viewCenterLocation.town
      //     console.log(this.centerPosionName,"this.centerPosionName")
      //     break;
      //     // case '村':
      //     //   this.dataInTimeAndZoom=originalArray.filter(data => data.locationInfo.address === viewCenterLocation.address);
      //     //   this.centerPosionName=viewCenterLocation.address
      //     //   break;
      //   default:
      this.dataInTimeAndZoom = originalArray.filter(data => data.locationInfo.city === '雅安市');
      this.centerPosionName = '雅安市'
      console.log(this.centerPosionName, "this.centerPosionName")
      // break;
      // }
      // arr=originalArray.filter(data => data.locationInfo.city === '雅安市');
      // break;
      console.log(this.dataInTimeAndZoom, "arrinZoom")

      // }


      let counts = this.dataInTimeAndZoom.reduce((acc, obj) => {
        console.log(acc, obj, "occ,obj")
        // 如果acc中已经有这个icon值，则增加它的计数
        if (acc[obj.plotType]) {
          acc[obj.plotType].value += 1;
        } else {
          acc[obj.plotType] = {name: obj.plotType, value: 1};
        }
        return acc;
      }, {}); // 初始化一个空对象作为累加器

      // 将结果转换为数组
      this.myChart1Data = Object.values(counts);
      console.log(this.myChart1Data, "this.myChart1Data")
      this.myChart1Data = this.myChart1Data.sort((a, b) => {
        return b.value - a.value
      });
      let maxValue = Math.max(...this.getArrByKey(this.myChart1Data, 'value'));
      let yAxisData = this.getArrByKey(this.myChart1Data, 'name');
      let that = this
      this.chart.setOption({
        yAxis: [{
          data: yAxisData
        }],
        series: [
          {
            data: this.myChart1Data.map(item => item.value)
          },
          {
            data: this.myChart1Data.map(item => item.value),
            itemStyle: {
              color: function (params) {
                // 根据值的大小动态设置颜色
                let value = params.name;
                let top3Values = that.myChart1Data.slice(0, 3).map(item => item.name);
                // return top3Values.includes(value) ? '#ffd15d' : '#59dbf8';
                // 判断当前条形图的名称是否在前三个值中
                if (top3Values.includes(value)) {
                  // 如果在前三个值中，返回渐变色
                  return {
                    type: 'linear',
                    x: 0, // 左
                    y: 0, // 下
                    x2: 1, // 左
                    y2: 1, // 上
                    colorStops: [
                      {
                        offset: 0, // 0% 处的颜色
                        color: '#c09933' // 亮色
                      },
                      {
                        offset: 1, // 100% 处的颜色
                        color: '#fce19a' // 暗色，您可以根据需要调整这个颜色值
                      }
                    ],
                    global: false // 缺省为 false
                  };
                } else {
                  // 如果不在前三个值中，返回单一颜色
                  return {
                    type: 'linear',
                    x: 0, // 左
                    y: 0, // 下
                    x2: 1, // 右
                    y2: 1, // 上
                    colorStops: [
                      {
                        offset: 0, // 0% 处的颜色
                        color: '#35aac5' // 亮色
                      },
                      {
                        offset: 1, // 100% 处的颜色
                        color: '#9ae8fa' // 暗色，您可以根据需要调整这个颜色值
                      }
                    ],
                    global: false // 缺省为 false
                  };
                }
              },
            },
          },
          {
            data: Array(this.myChart1Data.length).fill(maxValue),
          }
        ]
      });
    },
    scrollToStart() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }
      this.chart.setOption({
        dataZoom: [
          //拖拽滚动条滚动
          {
            // 数据窗口范围的起始数值
            startValue: 0,
            // 数据窗口范围的结束数值（一页显示多少条数据）
            endValue: 4,
          },
        ],
      })
    },
    scroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }
      let start = this.option.dataZoom[0].startValue + 1
      let end = this.option.dataZoom[0].endValue + 1
      this.scrollInterval = setInterval(() => {
        // console.log("scrollInterval start end", start, end)
        this.chart.setOption({
          dataZoom: [
            //拖拽滚动条滚动
            {
              // 数据窗口范围的起始数值
              startValue: start,
              // 数据窗口范围的结束数值（一页显示多少条数据）
              endValue: end,
            },
          ],
        })

        if(end==this.myChart1Data.length-1){
          start=0
          end=4
        }
        else{
          start = start + 1
          end = end + 1
        }
      }, 3000);
    },

    handleMouseEnter() {
      // 鼠标悬停时，清除自动滚动的 interval
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }
    },
    handleMouseLeave() {
      if (!this.isTimerRunning){
        // 鼠标移开时，恢复自动滚动的 interval
        this.scroll();
      }

    },
    timestampToTimeChina(timestamp) {
      let DateObj = new Date(timestamp);
      let year = DateObj.getFullYear();
      let month = DateObj.getMonth() + 1;
      let day = DateObj.getDate();
      let hh = DateObj.getHours();
      let mm = DateObj.getMinutes();
      let ss = DateObj.getSeconds();
      month = month > 9 ? month : '0' + month;
      day = day > 9 ? day : '0' + day;
      hh = hh > 9 ? hh : '0' + hh;
      mm = mm > 9 ? mm : '0' + mm;
      ss = ss > 9 ? ss : '0' + ss;
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
    },
  }

};
</script>

<style scoped>
.pop {
  position: absolute;
  width: 100%; /* 调整宽度 */
  height: 19%;
  z-index: 20; /* 提高层级 */
  top: 35%;
}


.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
}

.pop_content {
  left: 7%;
  top: -2%;
  position: relative;
  padding: 0; /* 确保没有内边距 */
  margin: 0; /* 确保没有外边距 */
}

.pop_responseName {
  font-size: 1.1rem;
  line-height: 0.6rem;
  font-weight: bold;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}

.pop_txt {
  line-height: 0.6rem;
  font-size: 1.1rem;
  font-weight: 550;
  color: #ffffff;
}

.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

#plotsStatisticChart {
  width: 100%;
  height: 20vh;
}

.range {
  color: #FFFFFF;
  font-size: 0.9rem;
  left: 1%;
  top: 1%;
}

.num {
  position: absolute;
  color: #FFFFFF;
  font-size: 0.9rem;
  right: 9%;
  top: 1%;
  width: 30%;
}
</style>
