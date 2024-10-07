<template>
  <div ref="chart" style="width: 100%; height: 250px;" className="container-left"></div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';
import {ElMessage} from "element-plus";
import {getExcelUploadEarthquake} from "../../api/system/eqlist";
import {gettotal} from "../../api/system/casualtystats";






import { defineProps } from 'vue';

const props = defineProps({
  eqid: {
    type: String,
    required: true,
  },
});

const neweqid =ref('')

watch(() => props.eqid, (newValue) => {
  neweqid.value = newValue
  console.log("孙子中的新 eqId:", neweqid.value); // 确认更新后的值

  // 获取第一个 eqid 作为参数

  if (neweqid.value) {
    gettotal(neweqid.value).then(res => {
      total_deceased.value = res.totalDeceased;
      total_missing.value = res.totalMissing;
      total_injured.value = res.totalInjured;

      // 更新图表数据
      echartData.value = [
        {
          value: total_deceased.value,
          name: '累计遇难（人）',
          itemStyle: {
            normal: {
              color: 'black',
            },
          },
        },
        {
          value: total_missing.value,
          name: '累计失联（人）',
          itemStyle: {
            normal: {
              color: '#ffa500',
            },
          },
        },
        {
          value: total_injured.value,
          name: '累计受伤（人）',
          itemStyle: {
            normal: {
              color: '#f81919',
            },
          },
        },
      ];
    });
  } else {
    ElMessage.error("未找到有效的 eqid");
  }
});






const total_deceased = ref(0);
const total_missing = ref(0);
const total_injured = ref(0);

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
        text: '受灾人数累积',
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

// 当组件挂载时初始化图表
onMounted(() => {
  getEarthquake();
});

// 监听 echartData 的变化并重新初始化图表
watch(echartData, () => {
  initChart();
});

const eqlistName = ref('')
const tableNameOptions = ref([])
const eqlists = ref([])


// 数据获取函数
const getEarthquake = () => {
  getExcelUploadEarthquake().then(res => {
    eqlists.value = res;
    if (res.data === null) {
      ElMessage.error("地震列表无数据");
    }
    tableNameOptions.value = eqlists.value.map(file => {
      const eqid = file.split(' - ')[0]?.trim();
      const details = file.split(' - ')[1]?.trim();

      return {
        label: details,
        value: eqid
      };
    });


  });
};

</script>

<style scoped>
.container-left {
  margin-left: 10px;
}
</style>
