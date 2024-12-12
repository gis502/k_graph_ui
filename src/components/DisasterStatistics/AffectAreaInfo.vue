<template>
  <p style="margin: 0;font-size: 16px;color: orangered">图表上传时间：{{ lastTime }}</p>
  <div ref="chart" style="width: 100%; height: 200px;" className="container-left"></div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';
import {getWorkGroupInfo} from "../../api/system/systemApi.js";

import {defineProps} from 'vue';
import {useGlobalStore} from "../../store";

const store = useGlobalStore();
const props = defineProps({
  eqid: {
    type: String,
    required: false,
  },
});

// 这行代码里面的赋值已经不再是neweqid的默认值，这里的作用是为了一开始watch没有监听到eqid值变化的时候给的值
// 防止因为没有eqid的传值而报错，删除或者更换为空值或者其他非正常eqid值都会报错
const neweqid = ref('');
neweqid.value = store.globalEqId


const bxArea = ref(0);  // 宝兴区
const lsArea = ref(0);  // 芦山县
const ycArea = ref(0);  // 雨城区
const msArea = ref(0);  // 名山区
const yjArea = ref(0);  // 荥经县
const tqArea = ref(0);  // 天全县
const smArea = ref(0);  // 石棉县
const hyArea = ref(0);  // 汉源县
const all_aftershocks = ref(0);
const lastTime = ref('');

const updateData = (data,time) => {
  bxArea.value = 0;
  lsArea.value = 0;
  ycArea.value = 0;
  msArea.value = 0;
  yjArea.value = 0;
  tqArea.value = 0;
  smArea.value = 0;
  hyArea.value = 0;
  all_aftershocks.value = 0;
  lastTime.value = '';

  data.forEach(item => {
    switch (item.workgroupname) {
      case '宝兴县':
        bxArea.value = item.workgroupnameinfo;
        break;
      case '芦山县':
        lsArea.value += item.workgroupnameinfo;
        break;
      case '雨城区':
        ycArea.value += item.workgroupnameinfo;
        break;
      case '名山区':
        msArea.value += item.workgroupnameinfo;
        break;
      case '荥经县':
        yjArea.value += item.workgroupnameinfo;
        break;
      case '天全县':
        tqArea.value += item.workgroupnameinfo;
        break;
      case '石棉县':
        smArea.value += item.workgroupnameinfo;
        break;
      case '汉源县':
        hyArea.value += item.workgroupnameinfo;
        break;
    }
    if (time) {
      const formattedTime = formatDate(new Date(time));
      if (!lastTime.value || new Date(time) > new Date(lastTime.value)) {
        lastTime.value = formattedTime;
      }

      console.log("当前时间-》",lastTime)

    }
  });

  echartData.value = [
    {value: bxArea.value, name: '宝兴县', itemStyle: {normal: {color: 'rgba(235,255,2,0.57)'}}},
    {value: lsArea.value, name: '芦山县', itemStyle: {normal: {color: 'rgba(235,255,2,0.99)'}}},
    {value: ycArea.value, name: '雨城区', itemStyle: {normal: {color: 'rgba(248,117,46,0.5)'}}},
    {value: msArea.value, name: '名山区', itemStyle: {normal: {color: 'rgba(255,134,0,0.68)'}}},
    {value: yjArea.value, name: '荥经县', itemStyle: {normal: {color: 'rgb(255,116,0)'}}},
    {value: tqArea.value, name: '天全县', itemStyle: {normal: {color: 'rgba(248,27,27,0.98)'}}},
    {value: smArea.value, name: '石棉县', itemStyle: {normal: {color: 'rgba(255,0,0,0.74)'}}},
    {value: hyArea.value, name: '汉源县', itemStyle: {normal: {color: 'rgba(255,20,20,0.48)'}}},
  ];
}
// 监听传入的 eqid，更新地震信息
watch(() => props.eqid, (newValue) => {
  neweqid.value = newValue;
  fetchEarthquakeData(neweqid.value);
});

// 获取并更新图表数据的函数
const fetchEarthquakeData = (eqid) => {
  getWorkGroupInfo(eqid).then(res => {

    console.log(res)

    updateData(res.data.areaUploadData,res.data.lastTime)
  })
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
        text: '各区统计信息',
        top: "center",
        right: "center",
        textStyle: {
          color: '#f2f2f2',
          fontSize: 20,
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
        itemGap: 5,
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
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  };
  return new Intl.DateTimeFormat('zh-CN', options).format(date).replace(/\//g, '-').replace(',', '');
}

setTimeout(() => {
  fetchEarthquakeData(store.globalEqId)
}, 500)

// 监听 echartData 的变化并重新初始化图表
watch(echartData, () => {
  initChart();
})
// 格式化时间的函数

</script>

<style scoped>
.container-left {
  margin-left: 10px;
}
</style>
