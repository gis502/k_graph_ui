<template>
  <div class="container" style="height: 780px;width:490px">
    <el-carousel :interval="4000" indicator-position="none" style="height: 780px;width:490px">
      <!--    第一个走马灯-->
      <el-carousel-item style="height: 780px;width:490px">
        <span>更新时间：{{ updateTime1 }}</span>
        <div ref="echart1"  class="chart1" style="height: 780px;width:490px"></div>
      </el-carousel-item>
      <!--    第二个走马灯-->
      <el-carousel-item style="height: 780px;width:490px">
        <span>更新时间：{{ updateTime2 }}</span>
        <div ref="echart2"  class="chart2" style="height: 390px;width:490px"></div>
        <span>更新时间：{{ updateTime3 }}</span>
        <div ref="echart3"  class="chart3" style="height: 390px;width:490px"></div>
      </el-carousel-item>
      <!--    第三个走马灯-->
      <el-carousel-item style="height: 780px;width:490px">
        <span>更新时间：{{ updateTime1 }}</span>
        <div ref="echart4" class="chart1" style="height: 780px;width:490px"></div>
      </el-carousel-item>
      <!--    第四个走马灯-->
      <el-carousel-item style="height: 780px;width:490px">
        <span>更新时间：{{ updateTime2 }}</span>
        <div ref="echart5"  class="chart2" style="height: 390px;width:490px"></div>
        <span>更新时间：{{ updateTime3 }}</span>
        <div ref="echart6"  class="chart3" style="height: 390px;width:490px"></div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import {defineProps, onMounted, ref} from 'vue'
import * as echarts from "echarts";
import {getEquipment} from "../../../api/system/rescueEquipment";
import {getDisasterreLiefMaterials} from "../../../api/system/reliefSupplies";
import {getRescueForces} from "../../../api/system/rescueTeams";

const eqid = ref('');
const props = defineProps({
  eqid:{
    type: String,
    required: true
  },
});
eqid.value = props.eqid

// echarts 实例
const echart1 = ref('');
const echart2 = ref('');
const echart3 = ref('');
const echart4 = ref('');
const echart5 = ref('');
const echart6 = ref('');
const updateTime1 = ref('');
const updateTime2 = ref('');
const updateTime3 = ref('');

// 大型、特种救援装备情况的定义
const latestTime1 = ref('') // 时间
const earthquakeAreaName1 = ref(["抱歉暂无数据"]) //地点
const helicopterCount = ref([]) // 直升机数量
const bridgeBoatCount = ref([]) // 舟桥数量
const wingDroneCount = ref([]) // 翼龙无人机数量

// 救援物资情况的定义
const latestTime2 = ref('') // 时间
const earthquakeAreaName2 = ref(["抱歉暂无数据"]) //地点
const tentsCount = ref([]) // 帐篷数量
const quiltsCount = ref([]) // 棉被数量
const foldingBedsCount = ref([]) // 折叠床数量

// 救援力量情况的定义
const plaCount = ref([]) // 解放军数量
const armedPoliceCount = ref([]) // 武警数量
const militiaCount = ref ([]) // 民兵数量
const fireRescueCount = ref([]) // 消防救援力量数量
const forestFireRescueCount = ref([]) // 森林消防数量
const professionalForcesCount = ref([]) // 专业力量：安能、…
const emergencyProductionSafetyCount = ref([]) // 应急安全生产
const medicalRescueCount = ref([]) // 医疗救援
const transportationCommunicationPowerCount = ref([]) // 交通通信电力等力量
const airRescueCount = ref([]) // 空中救援
const volunteerRescueTeamCount = ref([]) // 志愿抢险队
const earthquakeAreaName3 = ref([]) // 地点
const latestTime3 = ref('')

// echarts配置数据项
const drilldownData1 = ref('') // 下钻图数据源
const yCount = ref([])
const max = ref([])
const maxData = ref()

// 所有echarts的配置以及数据的获取
const initChart = async () => {
  // 获取数据
  const getData = async () => {
    // 时间格式化函数
    const formatDateChina = (dateStr) => {
      if(dateStr){
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
    function formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (isNaN(date)) return '无效日期'; // 检查日期有效性

      const pad = (num) => (num < 10 ? '0' + num : num); // 补零函数

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1); // 月份从 0 开始
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 大型、特种救援装备情况的数据
    function updateEquipment(data){
      if(data.length === 0){
        earthquakeAreaName1.value = ["抱歉暂无数据"]
        helicopterCount.value = [0]
        bridgeBoatCount.value = [0]
        wingDroneCount.value = [0]
        latestTime1.value = ''
      }else {
        earthquakeAreaName1.value = data.map(item => item.earthquakeAreaName || "抱歉暂无数据")
        helicopterCount.value = data.map(item => item.helicopterCount || 0)
        bridgeBoatCount.value = data.map(item => item.bridgeBoatCount || 0)
        wingDroneCount.value = data.map(item => item.wingDroneCount || 0)
        latestTime1.value = data.reduce((max, item) => {
          return new Date(formatDate(max)) > new Date(formatDate(item.submissionDeadline)) ? max : formatDate(item.submissionDeadline);
        },formatDate(data[0].submissionDeadline)); // 确保初始值
        updateTime2.value = formatDateChina(latestTime1.value)
      }
    };
    const res1 = await getEquipment(eqid.value);
    updateEquipment(res1);


    // 救援物资情况的数据
    function updateDisasterreLiefMaterials(data)  {
      if(data.length === 0){
        earthquakeAreaName2.value = ["抱歉暂无数据"]
        tentsCount.value = [0]
        quiltsCount.value = [0]
        foldingBedsCount.value = [0]
        latestTime2.value = ''
      }else {
        earthquakeAreaName2.value = data.map(item => item.earthquakeAreaName || "抱歉暂无数据")
        tentsCount.value = data.map(item => item.tentsCount || 0)
        quiltsCount.value = data.map(item => item.quiltsCount || 0)
        foldingBedsCount.value = data.map(item => item.foldingBedsCount || 0)
        latestTime2.value = data.reduce((max, item) => {
          return new Date(formatDate(max)) > new Date(formatDate(item.submissionDeadline)) ? max : formatDate(item.submissionDeadline) ;
        },formatDate(data[0].submissionDeadline)); // 确保初始值
        updateTime3.value = formatDateChina(latestTime2.value)
      }
    }
    const res2 = await getDisasterreLiefMaterials(eqid.value);
    updateDisasterreLiefMaterials(res2);


    //  救援力量情况的定义
    function updateRescueForces(data){
      if(data.length === 0){
        earthquakeAreaName.value = ["抱歉暂无数据"]
        plaCount.value = [0]
        armedPoliceCount.value = [0]
        militiaCount.value = [0]
        fireRescueCount.value = [0]
        forestFireRescueCount.value = [0]
        professionalForcesCount.value = [0]
        emergencyProductionSafetyCount.value = [0]
        medicalRescueCount.value = [0]
        transportationCommunicationPowerCount.value = [0]
        airRescueCount.value = [0]
        latestTime.value = ''
        }else {
        earthquakeAreaName3.value = data.map(item => item.earthquakeAreaName || '抱歉无数据');
        plaCount.value = data.map(item => item.plaCount || 0);
        armedPoliceCount.value = data.map(item => item.armedPoliceCount || 0);
        militiaCount.value = data.map(item => item.militiaCount || 0);
        fireRescueCount.value = data.map(item => item.fireRescueCount || 0);
        forestFireRescueCount.value = data.map(item => item.forestFireRescueCount || 0);
        professionalForcesCount.value = data.map(item => item.professionalForcesCount || 0);
        emergencyProductionSafetyCount.value = data.map(item => item.emergencyProductionSafetyCount || 0);
        medicalRescueCount.value = data.map(item => item.medicalRescueCount || 0);
        transportationCommunicationPowerCount.value = data.map(item => item.transportationCommunicationPowerCount || 0);
        airRescueCount.value = data.map(item => item.airRescueCount || 0);
        volunteerRescueTeamCount.value = data.map(item => item.volunteerRescueTeamCount || 0);
        latestTime3.value = data.reduce((max,item)=> {
          return formatDate(max) > formatDate(item.submissionDeadline) ? formatDate(max) : formatDate(item.submissionDeadline)
        },formatDate(data[0].submissionDeadline))
        updateTime1.value = formatDateChina(latestTime3.value)

        yCount.value = data.map(item =>{
          const totalCount = item.plaCount + item.armedPoliceCount + item.militiaCount +
              item.fireRescueCount + item.forestFireRescueCount +
              item.professionalForcesCount + item.emergencyProductionSafetyCount +
              item.medicalRescueCount + item.transportationCommunicationPowerCount +
              item.airRescueCount + item.volunteerRescueTeamCount;

          return {
            value: totalCount,
            groupId: item.earthquakeAreaName,
          }
        })

        let max1 = yCount.value.reduce((maxValue, current) => {
          return current.value > maxValue ? current.value : maxValue;
        }, 0); // 初始值设置为 0
        max1 = Math.ceil(max1 * 1.2)
        for(let i = 0;i<yCount.value.length;i++){
          max.value.push(max1)
        }


        const maxData1 = Math.max(
            ...data.flatMap(item => [
              item.plaCount,
              item.armedPoliceCount,
              item.militiaCount,
              item.fireRescueCount,
              item.forestFireRescueCount,
              item.professionalForcesCount,
              item.emergencyProductionSafetyCount,
              item.medicalRescueCount,
              item.transportationCommunicationPowerCount,
              item.airRescueCount,
              item.volunteerRescueTeamCount
            ])
        );
        maxData.value = Math.ceil(maxData1 * 1.2);



        drilldownData1.value = data.reduce((acc, item) => {
          // 使用地区名称作为 key
          const areaName = item.earthquakeAreaName;
          // 需要转换的数据项
          const rescueData = [
            { name: '解放军', value: item.plaCount },
            { name: '武警', value: item.armedPoliceCount },
            { name: '民兵', value: item.militiaCount },
            { name: '消防救援', value: item.fireRescueCount },
            { name: '森林消防', value: item.forestFireRescueCount },
            { name: '专业力量', value: item.professionalForcesCount },
            { name: '应急安全', value: item.emergencyProductionSafetyCount },
            { name: '医疗救援', value: item.medicalRescueCount },
            { name: '交通通信电力', value: item.transportationCommunicationPowerCount },
            { name: '空中救援', value: item.airRescueCount },
            { name: '志愿抢险队', value: item.volunteerRescueTeamCount },
          ];
          // 根据地区名称创建对应的对象并将数据添加进去
          acc[areaName] = rescueData;
          return acc;
        }, {});
      }
    }
    const res3 = await getRescueForces(eqid.value)
    updateRescueForces(res3)

  }
  await getData();
  // -----------------------------------------------------------------------------------------------------------
  // echarts的配置
  // 两个小echarts配置
  // option1 配置
  let optionData1 = earthquakeAreaName1.value;
  let fwrs1 = helicopterCount.value;
  let xdrs1 = bridgeBoatCount.value;
  let scrs1 = wingDroneCount.value; // 收藏人数数据，替换原来的 zhl 数据
  const option1 =  {
    title: {
      text: "大型、特种救援装备情况", // 标题文本
      left: "center", // 居中显示
      top: "5%", // 距离顶部一定的距离
      textStyle: {
        color: "#fff", // 标题文字颜色
        fontSize: 16, // 标题文字大小
        fontWeight: "bold", // 标题文字粗细
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        lineStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(0, 255, 233,0)",
              },
              {
                offset: 0.5,
                color: "rgba(255, 255, 255,1)",
              },
              {
                offset: 1,
                color: "rgba(0, 255, 233,0)",
              },
            ],
            global: false,
          },
        },
      },
      textStyle: {
        color: "#fff",
      },
      backgroundColor: "rgba(0, 58, 99, 0.8)",
      borderColor: "rgba(0, 58, 99, 0.8)",
      confine: true,
      formatter: `{b}<br>{a}：{c}架<br>{a1}：{c1}座<br>{a2}：{c2}架`, // 修改了 formatter
    },
    legend: {
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 20,
      right: "2%",
      top: "15%", // 将图例放在标题下方
      x: "center", // 居中显示
      textStyle: {
        fontSize: 14,
        color: "#fff",
      },
      data: ["直升机数量", "舟桥数量", "翼龙无人机数量"], // 修改 legend 数据
      selectedMode: false, // 允许通过点击图例显示或隐藏
    },
    grid: {
      top: "30%", // 为了给标题和图例腾出空间
      left: "2%",
      right: "2%",
      bottom: "2%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: optionData1,
      axisLabel: {
        color: "#A4A7AA",
        interval: 0,
        fontSize: 12,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "rgba(127, 214, 255, .4)",
        },
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: "value",
        splitNumber: 5,
        nameTextStyle: {
          color: "#fff",
          fontSize: 12,
          align: "center",
          padding: [0, 20, 5, 0],
        },
        axisLabel: {
          formatter: "{value}",
          color: "rgba(95, 187, 235, 1)",
          textStyle: {
            fontSize: 14,
            color: "#fff",
            lineHeight: 16,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(28, 130, 197, .3)",
            type: "dashed",
          },
        },
      },
    ],
    series: [
      {
        name: "直升机数量",
        type: "bar",
        data: fwrs1,
        barWidth: "15px",
        barGap: "50%",
        itemStyle: {
          normal: {
            borderColor: "#3681FF",
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(15, 51, 82, 1)",
              },
              {
                offset: 1,
                color: "rgba(0, 168, 255, 1)",
              },
            ]),
          },
        },
        label: {
          show: false,
          position: "top",
          fontSize: 12,
          color: "#F5F5F5",
          offset: [0, -5],
          formatter: "{c}",
        },
      },
      {
        name: "舟桥数量",
        type: "bar",
        data: xdrs1,
        barWidth: "15px",
        barGap: "50%",
        itemStyle: {
          normal: {
            borderColor: "rgba(54, 234, 255, 1)",
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(15, 51, 82, 1)",
              },
              {
                offset: 1,
                color: "rgba(21, 219, 203, 1)",
              },
            ]),
          },
        },
        label: {
          show: false,
          position: "top",
          fontSize: 12,
          color: "#F5F5F5",
          offset: [0, -5],
          formatter: "{c}",
        },
      },
      {
        name: "翼龙无人机数量", // 修改名称为 收藏人数
        type: "line",
        yAxisIndex: 0, // 使用左边的 y 轴
        showSymbol: true,
        symbolSize: 8,
        smooth: true,
        symbol: "circle",
        lineStyle: {
          normal: {
            color: "#02D6B0",
          },
        },
        itemStyle: {
          color: "#02D6B0",
          borderColor: "#fff",
          borderWidth: 1,
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "rgba(0, 255, 246, 0.5)",
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 255, 246, 0)",
                  },
                ],
                false
            ),
          },
        },
        data: scrs1, // 使用 收藏人数 数据
      },
    ],
  };

  // option2 配置
  let optionData2 = earthquakeAreaName2.value;
  let fwrs2 = tentsCount.value; // 帐篷数量
  let xdrs2 = quiltsCount.value; // 棉被数量
  let scrs2 = foldingBedsCount.value; // 折叠床数量
  const option2 = {
    title: {
      text: "救援物资情况", // 标题文本
      subtext: "", // 可以根据需要添加副标题
      left: "center", // 居中显示
      top: "5%", // 距离顶部一定的距离
      textStyle: {
        color: "#fff", // 标题文字颜色
        fontSize: 16, // 标题文字大小
        fontWeight: "bold", // 标题文字粗细
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        lineStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(0, 255, 233,0)",
              },
              {
                offset: 0.5,
                color: "rgba(255, 255, 255,1)",
              },
              {
                offset: 1,
                color: "rgba(0, 255, 233,0)",
              },
            ],
            global: false,
          },
        },
      },
      textStyle: {
        color: "#fff",
      },
      backgroundColor: "rgba(0, 58, 99, 0.8)",
      borderColor: "rgba(0, 58, 99, 0.8)",
      confine: true,
      formatter: `{b}<br>{a}：{c}顶<br>{a1}：{c1}床<br>{a2}：{c2}张`, // 修改了 formatter
    },
    legend: {
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 20,
      right: "2%",
      top: "15%", // 将图例放在标题下方
      x: "center", // 居中显示
      textStyle: {
        fontSize: 14,
        color: "#fff",
      },
      data: ["帐篷数量", "棉被数量", "折叠床数量"], // 修改 legend 数据
      selectedMode: false, // 允许通过点击图例显示或隐藏
    },
    grid: {
      top: "30%", // 为了给标题和图例腾出空间
      left: "2%",
      right: "2%",
      bottom: "2%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: optionData2,
      axisLabel: {
        color: "#A4A7AA",
        interval: 0,
        fontSize: 12,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "rgba(127, 214, 255, .4)",
        },
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: "value",
        splitNumber: 5,
        nameTextStyle: {
          color: "#fff",
          fontSize: 12,
          align: "center",
          padding: [0, 20, 5, 0],
        },
        axisLabel: {
          formatter: "{value}",
          color: "rgba(95, 187, 235, 1)",
          textStyle: {
            fontSize: 14,
            color: "#fff",
            lineHeight: 16,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(28, 130, 197, .3)",
            type: "dashed",
          },
        },
      },
    ],
    series: [
      {
        name: "帐篷数量",
        type: "bar",
        data: fwrs2,
        barWidth: "15px",
        barGap: "50%",
        itemStyle: {
          normal: {
            borderColor: "#3681FF",
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(15, 51, 82, 1)",
              },
              {
                offset: 1,
                color: "rgba(0, 168, 255, 1)",
              },
            ]),
          },
        },
        label: {
          show: false,
          position: "top",
          fontSize: 12,
          color: "#F5F5F5",
          offset: [0, -5],
          formatter: "{c}",
        },
      },
      {
        name: "棉被数量",
        type: "bar",
        data: xdrs2,
        barWidth: "15px",
        barGap: "50%",
        itemStyle: {
          normal: {
            borderColor: "rgba(54, 234, 255, 1)",
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(15, 51, 82, 1)",
              },
              {
                offset: 1,
                color: "rgba(21, 219, 203, 1)",
              },
            ]),
          },
        },
        label: {
          show: false,
          position: "top",
          fontSize: 12,
          color: "#F5F5F5",
          offset: [0, -5],
          formatter: "{c}",
        },
      },
      {
        name: "折叠床数量",
        type: "line",
        yAxisIndex: 0, // 使用左边的 y 轴
        showSymbol: true,
        symbolSize: 8,
        smooth: true,
        symbol: "circle",
        lineStyle: {
          normal: {
            color: "#02D6B0",
          },
        },
        itemStyle: {
          color: "#02D6B0",
          borderColor: "#fff",
          borderWidth: 1,
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "rgba(0, 255, 246, 0.5)",
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 255, 246, 0)",
                  },
                ],
                false
            ),
          },
        },
        data: scrs2,
      },
    ],
  }

  // 大的echarts配置
  const myChart1 = echarts.init(echart1.value)
  const option3 = {
    title: {
      text: '救援力量情况',
      x: 'center',
      y: '4%',
      textStyle: {
        color: '#fff',
        fontSize: '22',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        // 过滤掉 "背景" 数据，保留 "救援人数" 和 "区域" 数据
        const filteredParams = params.filter(param => param.seriesName !== '背景');
        let tooltipContent = '';
        filteredParams.forEach(param => {
          // 获取对应的 Y 轴的值 (即区域名称)
          const areaName = param.name; // 对应柱子所在的区域（Y轴）
          // 为每个系列显示对应的图标和内容
          tooltipContent += `
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; margin-right: 8px; background-color: ${param.color};"></span>
            ${areaName} ${param.seriesName}:${param.value}人
          </div>
        `;
        });
        return tooltipContent || '无数据';
      }
    },
    grid: {
      top: '15%',
      right: '3%',
      left: '5%',
      bottom: '12%',
    },
    xAxis: [
      {
        type: 'value', // 改为值轴
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
        axisLabel: {
          margin: 10,
          color: '#e2e9ff',
          textStyle: {
            fontSize: 14,
          },
        },
        splitLine: {
          show: true, // 显示横向分隔线
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.12)', // 设置分隔线颜色
            type: 'dashed', // 设置为虚线
          },
        },
        // 自适应间隔
        minInterval: 1,  // 设置最小间隔
        maxInterval: 1000,  // 设置最大间隔
      },
    ],
    yAxis: [
      {
        type: 'category', // 改为类目轴
        data: earthquakeAreaName3.value,
        axisLabel: {
          color: '#e2e9ff',
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,1)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)',
          },
        },
      },
    ],
    series: [
      {
        name:'救援人数',
        type: 'bar',
        id: 'sales',
        data: yCount.value,
        barWidth: '20px',
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  { offset: 0, color: 'rgba(0,244,255,1)' }, // 0% 处的颜色
                  { offset: 1, color: 'rgba(0,77,167,1)' }, // 100% 处的颜色
                ],
                false
            ),
            barBorderRadius: [30, 30, 30, 30],
            shadowColor: 'rgba(0,160,221,1)',
            shadowBlur: 4,
          },
        },
      },
      {
        name: '背景',
        type: 'bar',
        barWidth: 20,
        barGap: '-100%',
        data: max.value,
        z: -1,
        itemStyle: {
          normal: {
            color: 'rgba(0,255,255,.2)',
            barBorderRadius: 30,
          },
        },
      },
    ],
  };
  // 下钻数据（具体数据）
  const drilldownData = drilldownData1.value;
  // 监听点击事件
  myChart1.on('click', function (event) {
    if (event.data) {
      const groupId = event.data.groupId;
      const subData = drilldownData[groupId];
      if (!subData) {
        return;
      }
      myChart1.setOption({
        xAxis: {
          data: subData.map(item => item.name),
          splitLine: {
            show: true, // 显示横向分隔线
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.12)', // 设置分隔线颜色
              type: 'dashed', // 设置为虚线
            },
          },
        },
        yAxis: {
          data: subData.map(item => item.name), // Y轴变为具体的子类数据
        },
        series: [
          {
            type: 'bar',
            id: 'sales',
            data: subData.map(item => item.value),
            barWidth: '20px',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                    0,
                    0,
                    0,
                    1,
                    [
                      { offset: 0, color: 'rgba(0,244,255,1)' },
                      { offset: 1, color: 'rgba(0,77,167,1)' },
                    ],
                    false
                ),
                barBorderRadius: [30, 30, 30, 30],
                shadowColor: 'rgba(0,160,221,1)',
                shadowBlur: 4,
              },
            },
          },
          {
            name: '背景',
            type: 'bar',
            barWidth: 20,
            barGap: '-100%',
            data: [maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value],
            z: -1,
            itemStyle: {
              normal: {
                color: 'rgba(0,255,255,.2)',
                barBorderRadius: 30,
              },
            },
          },
        ],
        graphic: [
          {
            type: 'text',
            left: 50,
            top: 20,
            style: {
              text: '返回',
              fontSize: 16,
              fontFamily: 'Arial', // 字体类型
              fontWeight: 'bold',  // 字体粗细
              fill: '#00c7ff',
              padding: [10, 20],  // 内边距，格式为：[上下, 左右]
              borderRadius: 10,   // 圆角
              borderColor: '#ffffff', // 边框颜色
              borderWidth: 2,     // 边框宽度
              cursor: 'pointer',  // 鼠标悬停时的样式
              textAlign: 'center', // 水平居中对齐
              verticalAlign: 'middle', // 垂直居中对齐
            },
            onclick: function () {
              myChart1.setOption(option3); // 点击返回按钮，恢复初始视图
            },
          },
        ],
      });
    }
  });
  myChart1.setOption(option3);

  const myChart4 = echarts.init(echart4.value)
  // 监听点击事件
  myChart4.on('click', function (event) {
    if (event.data) {
      const groupId = event.data.groupId;
      const subData = drilldownData[groupId];
      if (!subData) {
        return;
      }
      myChart4.setOption({
        xAxis: {
          data: subData.map(item => item.name),
          splitLine: {
            show: true, // 显示横向分隔线
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.12)', // 设置分隔线颜色
              type: 'dashed', // 设置为虚线
            },
          },
        },
        yAxis: {
          data: subData.map(item => item.name), // Y轴变为具体的子类数据
        },
        series: [
          {
            type: 'bar',
            id: 'sales',
            data: subData.map(item => item.value),
            barWidth: '20px',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                    0,
                    0,
                    0,
                    1,
                    [
                      { offset: 0, color: 'rgba(0,244,255,1)' },
                      { offset: 1, color: 'rgba(0,77,167,1)' },
                    ],
                    false
                ),
                barBorderRadius: [30, 30, 30, 30],
                shadowColor: 'rgba(0,160,221,1)',
                shadowBlur: 4,
              },
            },
          },
          {
            name: '背景',
            type: 'bar',
            barWidth: 20,
            barGap: '-100%',
            data: [maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value,maxData.value],
            z: -1,
            itemStyle: {
              normal: {
                color: 'rgba(0,255,255,.2)',
                barBorderRadius: 30,
              },
            },
          },
        ],
        graphic: [
          {
            type: 'text',
            left: 50,
            top: 20,
            style: {
              text: '返回',
              fontSize: 16,
              fontFamily: 'Arial', // 字体类型
              fontWeight: 'bold',  // 字体粗细
              fill: '#00c7ff',
              padding: [10, 20],  // 内边距，格式为：[上下, 左右]
              borderRadius: 10,   // 圆角
              borderColor: '#ffffff', // 边框颜色
              borderWidth: 2,     // 边框宽度
              cursor: 'pointer',  // 鼠标悬停时的样式
              textAlign: 'center', // 水平居中对齐
              verticalAlign: 'middle', // 垂直居中对齐
            },
            onclick: function () {
              myChart4.setOption(option3); // 点击返回按钮，恢复初始视图
            },
          },
        ],
      });
    }
  });
  myChart4.setOption(option3);

// ------------------------------------------------------------------------------------------------------------------------------------
  // 以下是一个走马灯两个echarts的情况
  const myChart2 = echarts.init(echart2.value)
  myChart2.setOption(option1)
  const myChart3 = echarts.init(echart3.value)
  myChart3.setOption(option2)
  const myChart5 = echarts.init(echart5.value)
  myChart5.setOption(option1)
  const myChart6 = echarts.init(echart6.value)
  myChart6.setOption(option2)
};

onMounted(async () => {
  await initChart();
});
</script>

<style scoped>
span{
  display: block;
  padding-left: 5px;
  background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%);
}
</style>
