<template>
  <div class="app-container">
    <el-col :span="1.5">
      <el-select>
        <el-option
            v-for="item in selectEqOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-col>
    <el-col :span="1.5">
      <el-select>
        <el-option
            v-for="item in selectTimeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-col>
  </div>
  <div ref="chartRef" style="width: 100%; height: 400px;">

  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import * as echarts from 'echarts';
import {useRoute} from "vue-router";
import {getPicEqData} from "@/api/system/excel.js";

const chartRef = ref(null)
const selectEqOptions = []
const selectTimeOptions = []
const flag = useRoute().params.flag
const eqId = ref()
const time = ref()
const seriesData = ref([]);
onMounted(() => {
  /**获取数据 **/
  getPicEqData(flag, eqId.value, time.value).then(res => {
    const data = res.data;
    seriesData.value = Object.keys(data).map(key => ({
      name: key,
      data: data[key]
    }));
  }).catch(error => {
    console.log(error)
  })

  const chart = echarts.init(chartRef.value);
  const series = seriesData.map((item, index) => ({
    name: item.name,
    type: 'bar',
    label: {
      show: true,
      position: 'top',
      color: '#656565',
      fontWeight: 'bold',
      fontSize: 14,
    },
    barWidth: 20,
    color: generateUniqueGradientColor(index, seriesData.length),
    data: item.data,
  }));

  const option = {
    title: {
      text: '专题图生成',
      left: 'center',
      top: '8%',
      textStyle: {
        color: '#111111',
        fontWeight: 'bold',
        fontSize: 16,
      },
    },
    backgroundColor: '',
    grid: {
      top: '25%',
      bottom: '10%',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let relVal = params[0].name;
        for (let i = 0, l = params.length; i < l; i++) {
          relVal += `<div style="display: flex;justify-content: space-between;">
                      <div style="margin-top: 5px;margin-right: 40px;">
                        ${params[i].marker + params[i].seriesName}
                      </div>
                      <div style="margin-top: 5px;font-weight: bold;">
                        ${params[i].value}人
                      </div>
                    </div>`;
        }
        return relVal;
      },
      axisPointer: {
        type: 'cross',
        label: {
          show: false,
        },
      },
    },
    legend: {
      data: ['入库总数', '以内', '以外'],
      top: '15%',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        inside: true,
        color: '#101010',
        padding: [11, 0, 10, 0],
        align: 'left',
        verticalAlign: 'center',
        fontSize: 14,
      },
    },
    xAxis: {
      data: ['雨城区',
        '名山区',
        '荥经县',
        '汉源县',
        '石棉县',
        '天全县',
        '芦山县',
        ' 宝兴县'],
      type: 'category',
      boundaryGap: true,
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        interval: 0,
        rotate: 0,
        textStyle: {
          show: true,
          color: '#101010',
          fontSize: 12,
        },
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#E8E8E8',
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        textStyle: {
          show: true,
          color: '#656565',
          fontSize: 12,
        },
      },
    },
    series: series
  };

  chart.setOption(option);

  // 窗口大小变化时重新渲染图表
  window.addEventListener('resize', () => {
    chart.resize();
  });
});

/** 生成唯一的渐变颜色/
 * @param index 当前索引
 * @param total 总数
 * @returns {*} 渐变颜色
 */
function generateUniqueGradientColor(index, total) {
  const hue = (index / total) * 360; // 计算色相
  const startColor = `hsl(${hue}, 70%, 50%)`; // 渐变起始颜色
  const endColor = `hsla(${hue}, 70%, 50%, 0)`; // 渐变结束颜色
  return new echarts.graphic.LinearGradient(
      0, 1.2, 0, 0,
      [
        {offset: 1, color: startColor},
        {offset: 0, color: endColor}
      ]
  );
}


</script>

<style scoped>
/* 你可以在这里添加其他样式 */
</style>
