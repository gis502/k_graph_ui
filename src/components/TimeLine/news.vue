<template>
  <div>
    <div id="news">
      <div className="pop_header">
        <h2 className="sub-title-new">
          生命线情况
          <span class="time">{{timestampToTimeChina(props.currentTime) }}</span>
          <!-- <span class="title-time">{{ recordTime }}</span> -->
          <span className="title-time"></span>
        </h2>
        <div className="sub-main">
          <div ref="chart" className="chart" style="width: 100%;height: 24vh"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, onMounted, ref, watch,} from 'vue';
import * as echarts from "echarts";
import 'echarts-gl';
import {getVillages} from "../../api/system/ZhongDuanVillage";
import {getSupplySituationList} from "../../api/system/supplySituation";

let echartsInstance = null;
// 声明 ref 变量，用于 DOM 引用
const chart = ref(null);
const props = defineProps({
  eqid: {
    type: String,
    required: true
  },
  currentTime:{
    type: String,
    required: true
  }
});
const latestTime = ref(''); // 最新时间
const ecData = ref([]);
const currentlyBlackedOutVillages = ref('') ;// 供电
const currentInterruptedVillages = ref('') ;// 通信
const roadBlockVillage = ref('') ;// 道路
const centralizedWaterProjectDamages = ref(''); // 受损数量
const eqid = ref("")

eqid.value = props.eqid;

function fetchData() {
  getVillages(eqid.value).then(res => {
    const formatDateTime = (dateString) => {
      if (dateString === null) {
        return null;
      }
      return dateString.split('T')[0] + ' ' + dateString.split('T')[1].split('.')[0];
    };
    latestTime.value = formatDateTime(res[0].insertTime);
    latestTime.value = formatDateChina(latestTime.value)
    currentInterruptedVillages.value = res[0].currentInterruptedVillages;
    currentlyBlackedOutVillages.value = res[0].currentlyBlackedOutVillages;
    roadBlockVillage.value = res[0].roadBlockVillage;
  })
  getSupplySituationList(eqid.value).then(res => {
    centralizedWaterProjectDamages.value = res.reduce((sum, item) => sum + item.centralizedWaterProjectDamage, 0);
  })

  setTimeout(()=>{
    update()
    const initChart = () => {
      echartsInstance = echarts.init(chart.value);
      const pieData = ecData.value
//设置图表配置项
      const option = getPie3D(pieData, 0.8)
//设置交互事件 鼠标移入 点击
      bindListen(echartsInstance)

//获取配置项
      function getPie3D(pieData, internalDiameterRatio) {
        let series = [];
        let sumValue = 0;
        let startValue = 0;
        let endValue = 0;
        let legendData = [];
        let legendBfb = [];
        let k = 1 - internalDiameterRatio;
        pieData.sort((a, b) => {
          return b.value - a.value;
        });
        // 为每一个饼图数据，生成一个 series-surface(参数曲面) 配置
        for (let i = 0; i < pieData.length; i++) {
          sumValue += pieData[i].value;
          let seriesItem = {
            //名称
            name:
                typeof pieData[i].name === "undefined"
                    ? `series${i}`
                    : pieData[i].name,
            type: "surface",
            //是否为参数曲面（是）
            parametric: true,
            //曲面图网格线（否）上面一根一根的
            wireframe: {
              show: false,
            },
            pieData: pieData[i],
            pieStatus: {
              selected: false,
              hovered: false,
              k: k,
            },
          };

          //曲面的颜色、不透明度等样式。
          if (typeof pieData[i].itemStyle != "undefined") {
            let itemStyle = {};
            typeof pieData[i].itemStyle.color != "undefined"
                ? (itemStyle.color = pieData[i].itemStyle.color)
                : null;
            typeof pieData[i].itemStyle.opacity != "undefined"
                ? (itemStyle.opacity = pieData[i].itemStyle.opacity)
                : null;
            seriesItem.itemStyle = itemStyle;
          }
          series.push(seriesItem);
        }

        // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
        // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
        legendData = [];
        legendBfb = [];
        for (let i = 0; i < series.length; i++) {
          endValue = startValue + series[i].pieData.value * 1;
          series[i].pieData.startRatio = startValue / sumValue;
          series[i].pieData.endRatio = endValue / sumValue;
          series[i].parametricEquation = getParametricEquation(
              series[i].pieData.startRatio,
              series[i].pieData.endRatio,
              false,
              false,
              k,
              series[i].pieData.value
          );
          startValue = endValue;
          let bfb = fomatFloat(series[i].pieData.value / sumValue, 4);
          legendData.push({
            name: series[i].name,
            value: bfb,
          });
          legendBfb.push({
            name: series[i].name,
            value: bfb,
          });
        }
        //(第二个参数可以设置你这个环形的高低程度)
        let boxHeight = getHeight3D(series, 30); //通过传参设定3d饼/环的高度
        // 准备待返回的配置项，把准备好的 legendData、series 传入。

        let option = {
          title:{
            left: 20,
            top: 10,
            // text:'生命线中断情况',
            text:'',
            textStyle: {
              fontSize: 18,  // 设置标题文本的字体大小
              fontWeight: 'bold',  // 设置字体粗细
              color: '#03d6ff'  // 设置字体颜色
            },
          },
          //图例组件
          legend: {
            data: legendData,
            color: [
              "#F18843",
              "#F6C458",
              "#2CC9FF",
              // "#1050A2",
              "#3BFFFF",
            ],
            //图例列表的布局朝向。
            orient: "vertical",
            right: 20,
            bottom: 60,
            //图例文字每项之间的间隔
            itemGap: 10,
            show: true,
            icon: "circle",
            itemHeight: 10,
            itemWidth: 10,
            textStyle: {
              //图例字体大小
              fontSize: 12,
              color: "#B8DDFF",
              lineHeight: 20,
            },

            //格式化图例文本
            formatter: function (name) {
              var target;
              for (var i = 0, l = pieData.length; i < l; i++) {
                if (pieData[i].name == name) {
                  target = pieData[i].value;
                }
              }
              return `${name}   ${target}`;
            },
          },
          //移动上去提示的文本内容
          tooltip: {
            backgroundColor: "rgba(18, 55, 85, 0.8);",
            borderColor: "transparent",
            formatter: (params) => {
              if (
                  params.seriesName !== "mouseoutSeries" &&
                  params.seriesName !== "pie2d"
              ) {
                let bfb = (
                    (option.series[params.seriesIndex].pieData.endRatio -
                        option.series[params.seriesIndex].pieData.startRatio) *
                    100
                ).toFixed(2);
                const value = option.series[params.seriesIndex].pieData.value;
                return (
                    `<div style='color:rgba(214, 243, 255, 0.9);'>` +
                    `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` +
                    `${params.seriesName}<br/>` +
                    `<span style='margin-right:20px'>${value}</span>` +
                    `<span >${bfb}%</span>` +
                    `</div>`
                );
              }
            },
          },
          //这个可以变形
          xAxis3D: {
            min: -1,
            max: 1,
          },
          yAxis3D: {
            min: -1,
            max: 1,
          },
          zAxis3D: {
            min: -1,
            max: 1,
          },
          //此处是修改样式的重点
          grid3D: {
            show: false,
            boxHeight: boxHeight, //圆环的高度
            //这是饼图的位置
            left: -50,
            top: -30,
            viewControl: {
              //3d效果可以放大、旋转等，请自己去查看官方配置
              alpha: 25, //角度(这个很重要 调节角度的)
              distance: 260, //调整视角到主体的距离，类似调整zoom(这是整体大小)
              rotateSensitivity: 0, //设置为0无法旋转
              zoomSensitivity: 0, //设置为0无法缩放
              panSensitivity: 0, //设置为0无法平移
              autoRotate: true, //自动旋转
              autoRotateSpeed: 40,
            },
          },
          series: series,
        };
        return option;
      };

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
      function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, h) {
        // 计算
        let midRatio = (startRatio + endRatio) / 2;
        let startRadian = startRatio * Math.PI * 2;
        let endRadian = endRatio * Math.PI * 2;
        let midRadian = midRatio * Math.PI * 2;
        // 如果只有一个扇形，则不实现选中效果。
        if (startRatio === 0 && endRatio === 1) {
          isSelected = false;
        }
        // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
        k = typeof k !== "undefined" ? k : 1 / 3;
        // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
        let offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
        let offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;
        // 计算高亮效果的放大比例（未高亮，则比例为 1）
        let hoverRate = isHovered ? 1.05 : 1;
        // 返回曲面参数方程
        return {
          u: {
            min: -Math.PI,
            max: Math.PI * 3,
            step: Math.PI / 32,
          },
          v: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            if (u < startRadian) {
              return (
                  offsetX +
                  Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
              );
            }
            if (u > endRadian) {
              return (
                  offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
              );
            }
            return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
          },
          y: function (u, v) {
            if (u < startRadian) {
              return (
                  offsetY +
                  Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
              );
            }
            if (u > endRadian) {
              return (
                  offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
              );
            }
            return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
          },
          z: function (u, v) {
            if (u < -Math.PI * 0.5) {
              return Math.sin(u);
            }
            if (u > Math.PI * 2.5) {
              return Math.sin(u) * h * 0.1;
            }
            return Math.sin(v) > 0 ? 1 * h * 0.1 : -1;
          },
        };
      };

      //这是一个自定义计算的方法
      function fomatFloat(num, n) {
        var f = parseFloat(num);
        if (isNaN(f)) {
          return false;
        }
        f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); // n 幂
        var s = f.toString();
        var rs = s.indexOf(".");
        //判定如果是整数，增加小数点再补0
        if (rs < 0) {
          rs = s.length;
          s += ".";
        }
        while (s.length <= rs + n) {
          s += "0";
        }
        return s;
      };

//获取3d丙图的最高扇区的高度
      function getHeight3D(series, height) {
        series.sort((a, b) => {
          return b.pieData.value - a.pieData.value;
        });
        return (height * 20) / series[0].pieData.value;
      }

      function bindListen(echartsInstance) {
        let hoveredIndex = "";
        let isDelay = false; // 标志位，控制延时禁用 mouseover

        // 监听 mouseover，停止自动旋转并放大扇形
        echartsInstance.on("mouseover", function (params) {
          if (isDelay) return; // 如果处于延迟状态，跳过当前事件

          // 停止自动旋转
          option.grid3D.viewControl.autoRotate = false;

          if (params.seriesName !== "mouseoutSeries" && params.seriesName !== "pie2d") {
            let isHovered = true;
            let startRatio = option.series[params.seriesIndex].pieData.startRatio;
            let endRatio = option.series[params.seriesIndex].pieData.endRatio;
            let k = option.series[params.seriesIndex].pieStatus.k;

            // 放大当前悬浮的扇形
            option.series[params.seriesIndex].parametricEquation =
                getParametricEquation(startRatio, endRatio, false, isHovered, k, option.series[params.seriesIndex].pieData.value + 5);
            option.series[params.seriesIndex].pieStatus.hovered = isHovered;

            // 记录当前悬浮的扇形
            hoveredIndex = params.seriesIndex;

            console.log("悬浮的", hoveredIndex);

            // 更新图表
            echartsInstance.setOption(option);
          }
        });

        // 监听 mouseout，恢复自动旋转并恢复扇形大小
        echartsInstance.on("mouseout", function () {
          // 恢复自动旋转
          option.grid3D.viewControl.autoRotate = true;

          // 如果有悬浮的扇形，恢复其原始大小
          if (hoveredIndex !== "") {
            console.log("离开了", hoveredIndex);
            let isHovered = false;
            let startRatio = option.series[hoveredIndex].pieData.startRatio;
            let endRatio = option.series[hoveredIndex].pieData.endRatio;
            let k = option.series[hoveredIndex].pieStatus.k;

            // 恢复原大小
            option.series[hoveredIndex].parametricEquation =
                getParametricEquation(startRatio, endRatio, false, isHovered, k, option.series[hoveredIndex].pieData.value);
            option.series[hoveredIndex].pieStatus.hovered = isHovered;

            // 清空当前悬浮的扇形
            hoveredIndex = "";

            // 更新图表
            echartsInstance.setOption(option);
          }

          // 设置延迟，2秒内禁用 mouseover 事件
          isDelay = true;
          setTimeout(function () {
            isDelay = false; // 2秒后恢复 mouseover 事件监听
          }, 2000);
        });
      }

      echartsInstance.setOption(option);
    }
    initChart()
  },1000)
}

function update() {
  ecData.value = [
    {
      name: "道路中断村（个）", //名称
      value: roadBlockVillage.value, //值
      itemStyle: {
        color: "#F18843",//半透明
      },
    },
    {
      name: "供电中断村（个）",
      value: currentlyBlackedOutVillages.value,
      itemStyle: {
        color: "#F6C458",
      },
    },
    {
      name: "通信中断村（个）",
      value: currentInterruptedVillages.value,
      itemStyle: {
        color: "#2CC9FF",
      },
    },
    {
      name: "供水受损点（处）",
      value: centralizedWaterProjectDamages.value,
      itemStyle: {
        color: "#3BFFFF",
      },
    },
  ]
}
function  timestampToTimeChina(timestamp) {
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
}
const formatDateChina = (dateStr) => {
  if (dateStr) {
    const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  }
};

// 时间戳转为普通日期（格式：YYYY-MM-DD HH:mm:ss）
const timestampToTime = (timestamp) => {
  const DateObj = new Date(timestamp);
  const year = DateObj.getFullYear();
  const month = (DateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = DateObj.getDate().toString().padStart(2, '0');
  const hh = DateObj.getHours().toString().padStart(2, '0');
  const mm = DateObj.getMinutes().toString().padStart(2, '0');
  const ss = DateObj.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
};

// 时间戳转为中文日期（格式：XX年XX月XX日XX时XX分XX秒）
const timestampToTimeDate = (timestamp) => {
  const DateObj = new Date(timestamp);
  const year = DateObj.getFullYear();
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
};

onMounted(() => {
  fetchData();
});

</script>

<style scoped>
#news {
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
  position: absolute;
  color: #FFFFFF;
  height: 19%;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sub-title-new {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
  width: 91%;
}

.title-time {
  right: 0%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.sub-main {
  margin-top: 2%;
  max-height: 24vh;
  left: 1%;
  overflow-y: auto;
  position: relative;
  padding: 0px;
  background-image: url("@/assets/home/底.png");
  background-repeat: no-repeat; /* 防止图片重复 */
  background-position: 53px 70px;
}
.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
</style>
