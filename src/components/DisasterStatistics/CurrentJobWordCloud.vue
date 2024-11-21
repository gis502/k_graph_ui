<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ latestTime }}</p>
  <div>
    <div ref="chart" style="width: 95%; height: 200px; margin-left: 10px; "></div>
  </div>
</template>

<script setup>

import 'echarts-wordcloud';
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useGlobalStore} from "../../store";

import * as echarts from 'echarts';
import 'echarts-wordcloud';
import {getWordCloudLib} from "@/api/system/systemApi.js";

const latestTime = ref(''); // 时间
const chart = ref(null);
const store = useGlobalStore()
const eqid = ref('');
let echartsInstance = null; // 全局变量

// const image = ref('data:image/png;base64,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')

const wordCloudData = ref([
  {name: '词云', value: 100},
  {name: 'Vue', value: 80},
  {name: 'ECharts', value: 60},
  {name: 'JavaScript', value: 50},
  {name: '前端', value: 40},
  {name: '开发', value: 30},
  {name: '可视化', value: 20},
  {name: '数据', value: 10}
])

const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

watch(() => props.eqid, (newValue) => {
  eqid.value = newValue;
  update(eqid.value);
});

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

function update(data) {
  getWordCloudLib(data).then(res => {
    console.log(res)
  })
}

const initChart = () => {
  // 获取 DOM 元素
  const myChart = echarts.init(chart.value);
  // 设置图片
  // const maskImage = new Image()
  // maskImage.src = image.value


  // 配置 ECharts 词云
  const option = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      keepAspect: false,
      //maskImage: maskImage,
      left: 'center',
      top: 'center',
      width: '100%',
      height: '90%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      layoutAnimation: true,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')';
        }
      },
      emphasis: {
        // focus: 'self',
        textStyle: {
          textShadowBlur: 3,
          textShadowColor: '#333'
        }
      },
      //data属性中的value值却大，权重就却大，展示字体就却大
      data: [
        {name: 'Farrah', value: 366},
        {name: "汽车", value: 900},
        {name: "视频", value: 606},

        {name: 'Java', value: 366},
        {name: "Vue", value: 900},
        {name: "Spark", value: 606},

        {name: 'Hive', value: 366},
        {name: "Hadop", value: 900},
        {name: "Mysql", value: 606},

        {name: 'SQLSERVER', value: 366},
        {name: "oracle", value: 900},
        {name: "sqLite", value: 606},

        {name: 'SpringCloud', value: 366},
        {name: "springBoot", value: 900},
        {name: "Spring", value: 606},

        {name: 'SpringMVC', value: 366},
        {name: "mybatis", value: 900},
        {name: "mybatis-plus", value: 606},

        {name: 'Anglar', value: 366},
        {name: "react", value: 900},
        {name: "redis", value: 606},

        {name: '词云', value: 100},
        {name: 'Vue', value: 80},
        {name: 'ECharts', value: 60},
        {name: 'JavaScript', value: 50},
        {name: '前端', value: 40},
        {name: '开发', value: 30},
        {name: '可视化', value: 20},
        {name: '数据', value: 10},

        {name: '哈哈啊哈', value: 100},
        {name: '嘻嘻嘻', value: 80},
        {name: '嗡嗡嗡', value: 60},
        {name: '哇哇哇', value: 50},
        {name: '嗯嗯嗯', value: 40},
        {name: '锵锵锵', value: 30},
        {name: '热热热', value: 20},
        {name: '突突突', value: 10}
      ]
    }]

  }
  option && myChart.setOption(option)


}

onMounted(() => {
  initChart(); // 初始化图表
});

onBeforeUnmount(() => {
  echartsInstance?.dispose(); // 释放实例
});
</script>

<style scoped>
</style>
