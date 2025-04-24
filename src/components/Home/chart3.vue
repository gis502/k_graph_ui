<template>
  <div class="container">
    <div class="chartContainer" ref="chart"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getCloud } from "@/api/system/eqlist.js";

const router = useRouter();
const props = defineProps(['lastEq']);
const eqid = ref('');
const eqqueueId = ref('');
const chart = ref(null);
const echartsInstance = ref(null);
const data = ref([]);

watch(() => props.lastEq, () => {
  if (props.lastEq) {
    initCloud();
  }
  console.log("cloud.lastEq", props.lastEq);
});

const initCloud = () => {
  eqid.value = 'T20250424193518511800';
  eqqueueId.value = 'T2025042419351851180001';
  getCloud(eqid.value)
      .then(res => {
        console.log('查询结果：', res.data);
        try {
          const parsedData = JSON.parse(res.data[0].result);  // 解析 JSON 字符串
          data.value = parsedData;  // 更新响应式数据
          console.log('解析后的数据：', data.value);

          // 确保数据格式正确
          if (!Array.isArray(data.value)) {
            console.error('数据格式不正确');
            return;
          }

          // 重新渲染图表
          nextTick(() => {
            updateChart();
          });
        } catch (error) {
          console.error('解析 JSON 失败：', error);
        }
      })
      .catch(error => {
        console.error('查询失败：', error);
      });
};

const go = (row) => {
  const route = router.resolve({ path: '/thd', query: { eqid: row.eqid, eqqueueId: row.eqqueueId } }).href;
  window.open(route, '_blank');
};

const echartsOption = ref({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  tooltip: {
    show: false,
  },
  series: [
    {
      type: 'wordCloud',
      gridSize: 5,
      sizeRange: [10, 30],
      width: '100%',
      height: '70%',
      textStyle: {
        color: () => {
          const colors = [
            '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB',
            '#2196F3', '#1565C0', '#0D47A1', '#64B5F6', '#90CAF9',
            '#BBDEFB', '#4FC3F7', '#D6EAF8', '#C5E1A5', '#FFE082',
            '#FFECB3', '#FFE082', '#FFECB3', '#FFECB3', '#FFECB3'
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        },
        emphasis: {
          shadowBlur: 10,
          shadowColor: '#333',
          fontWeight: 'bolder',
          fontSize: 'larger',
          textBorderColor: '#fff',
          textBorderWidth: 2,
          textShadowBlur: 10,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffsetX: 2,
          textShadowOffsetY: 2
        }
      },
      left: 'center',
      top: 'center',
      right: null,
      bottom: null,
      data: [],  // 初始为空数组
      shape: 'circle',
    },
  ],
});

const initChart = () => {
  if (!chart.value) return;

  echartsInstance.value = echarts.init(chart.value);
  echartsInstance.value.setOption(echartsOption.value);

  echartsInstance.value.on('click', function (params) {
    const clickedItem = params.data;
    if (clickedItem && clickedItem.eqid && clickedItem.eqqueueId) {
      go(clickedItem);
    } else {
      console.warn('缺少必要参数：eqid 或 eqqueueId');
    }
  });

  window.addEventListener('resize', handleResize);
};

const updateChart = () => {
  if (echartsInstance.value) {
    echartsOption.value.series[0].data = data.value;  // 更新数据
    echartsInstance.value.setOption(echartsOption.value);  // 重新设置选项
  }
};

const handleResize = () => {
  if (echartsInstance.value) {
    echartsInstance.value.resize();
  }
};

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (echartsInstance.value) {
    echartsInstance.value.dispose();
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style scoped lang="less">
.container{
  position: relative;
  height: 100%;
  width: 80%;

  .chartContainer {
    position: absolute;
    bottom: 40px;
    left: 10px;
    width: 100%;
    height: 100%;
  }
}
</style>
