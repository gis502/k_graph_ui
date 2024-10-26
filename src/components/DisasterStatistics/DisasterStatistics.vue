<template>
  <div ref="chart" style="width: 100%; height: 200px;" className="container-left"></div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';
import {ElMessage} from "element-plus";
import {getExcelUploadEarthquake} from "../../api/system/eqlist";
import {getTotal} from "../../api/system/statistics";

import { defineProps } from 'vue';

const props = defineProps({
  eqid: {
    type: String,
    required: false,
  },
});

// 这行代码里面的赋值已经不再是neweqid的默认值，这里的作用是为了一开始watch没有监听到eqid值变化的时候给的值
// 防止因为没有eqid的传值而报错，删除或者更换为空值或者其他非正常eqid值都会报错
const neweqid = ref('be3a5ea4-8dfd-a0a2-2510-21845f17960b'); // 默认 eqid

const total_magnitude_3_3_9 = ref(0);
const total_magnitude_4_4_9 = ref(0);
const total_magnitude_5_5_9 = ref(0);
const all_aftershocks = ref(0);
const latest_time = ref('');

// 监听传入的 eqid，更新地震信息
watch(() => props.eqid, (newValue) => {
  if (newValue) {
    neweqid.value = newValue;
    fetchEarthquakeData(neweqid.value);
  }
});

// 获取并更新图表数据的函数
const fetchEarthquakeData = (eqid) => {
  getTotal(eqid).then(res => {
    total_magnitude_3_3_9.value = 0;
    total_magnitude_4_4_9.value = 0;
    total_magnitude_5_5_9.value = 0;
    all_aftershocks.value = 0;
    latest_time.value = '';

    res.forEach(item => {
      total_magnitude_3_3_9.value += item.magnitude_3_3_9;
      total_magnitude_4_4_9.value += item.magnitude_4_4_9;
      total_magnitude_5_5_9.value += item.magnitude_5_5_9;
      all_aftershocks.value += item.total_aftershocks;

      if (item.submission_deadline) {
        const formattedTime = formatDate(new Date(item.submission_deadline));
        if (!latest_time.value || new Date(item.submission_deadline) > new Date(latest_time.value)) {
          latest_time.value = formattedTime;
        }
      }
    });




    echartData.value = [
      { value: total_magnitude_3_3_9.value, name: '3.0-3.9级', itemStyle: { normal: { color: '#ffeb31' }}},
      { value: total_magnitude_4_4_9.value, name: '4.0-4.9级', itemStyle: { normal: { color: '#ffa602' }}},
      { value: total_magnitude_5_5_9.value, name: '5.0-5.9级', itemStyle: { normal: { color: '#f81b1b' }}},
    ];
  }).catch(() => {
    ElMessage.error("未找到有效的地震信息");
  });
};

// 定义图表数据
const echartData = ref([]);

// 定义图表容器的 ref
const chart = ref(null);
let chartInstance = null;

// 初始化 ECharts 图表
const initChart = () => {
  if (chart.value) {
    if (chartInstance) {
      chartInstance.dispose();
    }
    chartInstance = echarts.init(chart.value);

    const option = {
      title: {
        text: '余震累积',
        top: "center",
        right: "center",
        textStyle: {
          color: '#f2f2f2',
          fontSize: 23,
          align: 'center',
        },
        subtextStyle: {
          fontSize: 25,
          color: ['#ff9d19'],
        },
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        y: '10',
        itemWidth: 20,
        itemHeight: 16,
        textStyle: {
          color: '#fff',
        },
        itemGap: 30,
        data: echartData.value.map((item) => item.name),
      },
      series: [
        {
          type: 'pie',
          radius: ['80%', '65%'],
          hoverAnimation: false,
          label: {
            normal: {
              formatter: (params) => {
                return '{yellow|' + params.name + '}\n{value|' + params.value + '}';
              },
              rich: {
                yellow: {
                  color: '#ffc72b',
                  fontSize: 16,
                  align: 'center',
                },
                value: {
                  color: 'yellow',
                  fontSize: 23,
                  align: 'center',
                  lineHeight: 35,
                }
              },
            },
          },
          labelLine: {
            normal: {
              length: 25,
              length2: 15,
              lineStyle: {
                color: '#fff',
              },
            },
          },
          data: echartData.value,
        },
      ],
    };

    chartInstance.setOption(option);
  } else {
    console.error('chart DOM element is not ready.');
  }
};

// 当组件挂载时初始化图表并加载默认数据
onMounted(() => {
  fetchEarthquakeData(neweqid.value);
  initChart();
});

function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' };
  return new Intl.DateTimeFormat('zh-CN', options).format(date).replace(/\//g, '-').replace(',', '');
}

// 监听 echartData 的变化并重新初始化图表
watch(echartData, () => {
  initChart();
});

// 格式化时间的函数

</script>

<style scoped>
.container-left {
  margin-left: 10px;
}
</style>
