<template>
  <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ lastTime }}</p>
  <div>
    <div ref="chart" style="width: 100%; height: 300px;"></div>
  </div>
</template>

<script setup>

import 'echarts-wordcloud';
import {defineProps, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useGlobalStore} from "../../store";

import * as echarts from 'echarts';
import 'echarts-wordcloud';
import {getWordCloudLib} from "@/api/system/systemApi.js";

const lastTime = ref(''); // 时间
const chart = ref(null);
const store = useGlobalStore()
const eqid = ref('');
let echartsInstance = null; // 全局变量

const wordCloudData = ref([
  {name: '被子', value: 354},
  {name: '褥子', value: 278},
  {name: '手电筒', value: 123},
  {name: '口罩', value: 435},
  {name: '口罩', value: 738},
  {name: '袜子', value: 255},
  {name: '球衣', value: 210},
  {name: '医生', value: 541},
  {name: '护士', value: 220},
  {name: '人手', value: 526},
  {name: 'B型血', value: 311},
  {name: 'AB型血', value: 220},
  {name: 'O型血', value: 11},
  {name: '摄像机', value: 220},
  {name: '感冒药', value: 324},
  {name: '999感冒灵', value: 178},
  {name: '复方氨醯胶囊', value: 366},
  {name: '发烧药', value: 220},
  {name: '止血药', value: 145},
  {name: '止痛药', value: 282},
  {name: '止痛片', value: 220},
  {name: '大量药品', value: 242},
  {name: '担架', value: 535},
  {name: '绷带', value: 637},
  {name: '阿莫西林', value: 425},
  {name: '止痛药', value: 526},
  {name: '绳子', value: 646},
  {name: '公交车', value: 281},
  {name: '衣服', value: 148},
  {name: 'A型血', value: 113},
  {name: '血浆', value: 88},
  {name: '输血', value: 56},
  {name: '鞋子', value: 220},
  {name: '数据', value: 100}
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
      data: wordCloudData.value
    }]

  }
  option && myChart.setOption(option)

  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });

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
