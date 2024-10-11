<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-13 class="model1">转移安置信息统计
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <ResettlementGraph :eqid="eqid"/>
      </dv-border-box-13>
      <dv-border-box-13 class="model1">人员伤亡信息统计<br>
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <DisasterStatistics :eqid="eqid"/>
      </dv-border-box-13>
      <dv-border-box-12 class="model2">地震震情灾情信息统计
        <div ref="chart" style="width:100%; height:270px;margin-top: 30px"></div>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage} from "element-plus";
import {getField, getData} from "@/api/system/excel.js";
import {getExcelUploadEarthquake} from "@/api/system/eqlist.js";
import * as echarts from 'echarts';
import DisasterStatistics from "@/components/DisasterStatistics/DisasterStatistics.vue";
import ResettlementGraph from "@/components/DisasterStatistics/ResettlementGraph.vue";


import {defineProps} from 'vue';
import {getTotal} from "../../api/system/statistics";

const props = defineProps({
  newEqId: {
    type: String,
    required: true
  }
});

const eqid = ref('')
watch(() => props.newEqId, (newValue) => {
      if (newValue) {
        eqid.value = newValue
        console.log("儿子中的新 eqId:", eqid.value); // 确认更新后的值
        // 其他处理逻辑
        getTotal(eqid.value).then(res => {
          console.log(res)
          // 得到后端数据开始操作：
          const formattedData = processData(res);
          console.log("处理后的数据", formattedData)
          updateChart(formattedData);
        })
      }
    }
);


const flag = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const requestParams = ref("")


const chart = ref(null);
const options = ref([]);
const tableData = ref([])
const field = ref([])
const files = ref([])//存储当前用户的导表信息
const name = ref([])
const columns = ref([]); // 用于存储表格列配置
const total = ref()
const width = ref([])
const eqlistName = ref('')
const tableNameOptions = ref([])
const eqlists = ref([])
const FieldName = ref([])


/** 监听 */
watch(flag, (newFlag) => {
  const selectedFile = files.value.find(file => file.fileFlag === newFlag);
  if (selectedFile && selectedFile.fileColumn) {
    const fileColumn = JSON.parse(selectedFile.fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys());
    name.value = Array.from(map.values());
    data.value = generateData();
    columns.value = generateColumnConfig();
  }
  // 清空选择
  clearSelection();
  value.value = [];
  // getYaanCasualtiesList();

});


// 格式化数据
const processData = (data) => {
  const areas = ['天全县', '石棉县', '名山区', '雨城区', '荥经县', '汉源县', '芦山县', '宝兴县']; // 所有需要统计的县区
  const result = areas.map(area => {
    const entry = data.find(item => item.affected_area === area);
    return {
      affected_area: area,
      total_aftershocks: entry ? entry.total_aftershocks : 0,
      magnitude_3_3_9: entry ? entry.magnitude_3_3_9 : 0,
      magnitude_4_4_9: entry ? entry.magnitude_4_4_9 : 0,
      magnitude_5_5_9: entry ? entry.magnitude_5_5_9 : 0,
      earthquake_time: entry ? formatTime(entry.earthquake_time) : "无数据"
    };
  });
  return result;

};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 19).replace('T', ' '); // 转换为 "YYYY-MM-DD HH:MM:SS" 格式
};

const updateChart = (data) => {
  const xAxisData = data.map(item => item.affected_area);
  const seriesData = [
    data.map(item => item.total_aftershocks),
    data.map(item => item.magnitude_3_3_9),
    data.map(item => item.magnitude_4_4_9),
    data.map(item => item.magnitude_5_5_9)
  ];
  const chartInstance = echarts.init(chart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        // 第一行显示地区名称
        let result = `${params[0].axisValue}<br/>`;

        // 第二行显示截止时间
        const timeIndex = params[0].dataIndex; // 根据 dataIndex 获取对应的时间
        result += `<span style="color: red;">统计截止时间: ${times[timeIndex]}</span><br/>`;

        // 显示系列名和数值
        params.forEach(item => {
          result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
        });

        return result;
      }
    },
    legend: {
      data: FieldName.value,
      align: 'right',
      right: 10,
      textStyle: {
        color: "#fff"
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 35
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    // ...其他配置项
    xAxis: [{
      type: 'category',
      data: xAxisData,
    }],
    series: [
      {
        name: '余震次数累计',
        type: 'bar',
        data: seriesData[0],
        barWidth: 13,
        barGap: 1,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: '#008cff'},
              {offset: 1, color: '#005193'}
            ]),
            opacity: 1
          }
        }
      },
      {
        name: '3.0-3.9级',
        type: 'bar',
        data: seriesData[1],
      },
      {
        name: '4.0-4.9级',
        type: 'bar',
        data: seriesData[2],
      },
      {
        name: '5.0-5.9级',
        type: 'bar',
        data: seriesData[3],
      }
    ],
    // 其他配置项目
    yAxis: [{
      type: 'value',
      axisLabel: {
        // 移除百分比格式化
        // formatter: '{value} %'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#00c7ff",
          width: 1,
          type: "solid"
        }
      },
      splitLine: {
        lineStyle: {
          color: "#063374"
        }
      }
    }],
  };

  chartInstance.setOption(option);
  window.addEventListener('resize', () => {
    chartInstance.resize();
  });
};


const times = [
  '2024-09-05 15:30:00',
  '2024-09-06 18:45:00',
  '2024-09-07 21:00:00',
  '2024-09-08 23:59:59',
  '2024-09-01 00:00:00',
  '2024-09-02 01:30:00',
  '2024-09-03 03:45:00',
  '2024-09-04 12:00:00',
];
const time = ref('2024-09-05 15:30:00')
onMounted(() => {
  getTableField()
  getEarthquake()
})

// 请求人员伤亡表数据
// const getYaanCasualtiesList = async () => {
//   await getData({
//     currentPage: currentPage.value,
//     pageSize: pageSize.value,
//     requestParams: requestParams.value,
//     flag: flag.value
//   }).then(res => {
//     tableData.value = res.data.records
//     console.log(res.data.records)
//     total.value = res.data.total
//   })
//
// }


const generateColumnConfig = () => {
  return field.value.map((fieldName, index) => {
    const label = name.value[index];
    // const width1 = width.value[index]
    return {
      prop: fieldName,
      label: label,
      align: "center",
      // width: width1
    };
  });
};


/** 获取字段 */
const getTableField = () => {
  getField().then(res => {
    files.value = res.data
    if (files.value.length == 0) {
      ElMessage.error("该用户无导表权限")
    }
    options.value = files.value.map(file => ({
      label: file.fileName,
      value: file.fileFlag,
    }));
    flag.value = files.value[0].fileFlag; // 默认选择第一个表
    const fileColumn = JSON.parse(files.value[0].fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys())
    name.value = Array.from(map.values())
    data.value = generateData();
    columns.value = generateColumnConfig();
    FieldName.value = name.value.filter(item => item === '余震次数累计' || item === '3.0-3.9级' || item === '4.0-4.9级' || item === '5.0-5.9级')
    // 模拟异步请求后赋值给 FieldName
    console.log(FieldName.value)

    // 初始化 ECharts 实例
    const chartInstance = echarts.init(chart.value);
    // ECharts 配置项
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          // 第一行显示地区名称
          let result = `${params[0].axisValue}<br/>`;

          // 第二行显示截止时间
          const timeIndex = params[0].dataIndex; // 根据 dataIndex 获取对应的时间
          result += `<span style="color: red;">统计截止时间: ${times[timeIndex]}</span><br/>`;

          // 显示系列名和数值
          params.forEach(item => {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });

          return result;
        }
      },
      legend: {
        data: FieldName.value,
        align: 'right',
        right: 10,
        textStyle: {
          color: "#fff"
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 35
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: [
          '雨城区',
          '名山区',
          '荥经县',
          '汉源县',
          '石棉县',
          '天全县',
          '芦山县',
          '宝兴县'
        ],
        axisLine: {
          show: true,
          lineStyle: {
            color: "#063374",
            width: 1,
            type: "solid"
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#00c7ff"
          }
        }
      }],
      yAxis: [{
        type: 'value',
        axisLabel: {
          // 移除百分比格式化
          // formatter: '{value} %'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: "#00c7ff",
            width: 1,
            type: "solid"
          }
        },
        splitLine: {
          lineStyle: {
            color: "#063374"
          }
        }
      }],
      series: [
        {
          name: '余震次数累计',
          type: 'bar',
          data: [2, 5, 8, 5, 8, 6, 5, 8, 4, 6],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: '#008cff'},
                {offset: 1, color: '#005193'}
              ]),
              opacity: 1
            }
          }
        },
        {
          name: '3.0-3.9级',
          type: 'bar',
          data: [1, 2, 4, 2, 4, 3, 2, 4, 2, 3],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color: '#ffeb2f',
              // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //   { offset: 0, color: '#00da9c' },
              //   { offset: 1, color: '#007a55' }
              // ]),
              opacity: 1
            }
          }
        },
        {
          name: '4.0-4.9级',
          type: 'bar',
          data: [0, 2, 3, 2, 2, 2, 2, 2, 1, 2],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color: '#ffa500',
              //   new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              // { offset: 0, color: '#c4e300' },
              // { offset: 1, color: '#728400' }
              // ]),
              opacity: 1
            }
          }
        },
        {
          name: '5.0-5.9级',
          type: 'bar',
          data: [1, 1, 1, 1, 2, 1, 1, 2, 1, 1],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color: '#f81919',
              opacity: 1
            }
          }
        }
      ]
    };

    chartInstance.setOption(option);
    window.addEventListener('resize', () => {
      chartInstance.resize();
    });

  })
}
//获取地震列表
const getEarthquake = () => {
  getExcelUploadEarthquake().then(res => {
    eqlists.value = res

    if (res.data === null) {
      ElMessage.error("地震列表无数据")
    }

    tableNameOptions.value = eqlists.value.map(file => ({
      label: file,
      value: file
    }))

    eqlistName.value = tableNameOptions.value[0].label

    console.log(eqlistName.value)
  })
}

const generateData = _ => {
  const data = [];
  // 确保 field 和 name 数组已经填充
  for (let i = 0; i < field.value.length; i++) {
    data.push({
      value: field.value[i],
      desc: name.value[i],
      disabled: false
    });
  }
  return data
}


const data = ref(generateData())
let value = ref([])


const multipleTableRef = ref()
const multipleSelection = ref([])

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const clearSelection = () => {
  multipleTableRef.value?.clearSelection()
}


</script>

<style lang="scss" scoped>
.style-container {
  width: 100%;
  height: calc(100vh - 50px);
  background-image: url("@/assets/bg1.png");
  background-size: 100% 100%;
  position: absolute;
  padding-right: 40px;

}

.container-center {
  width: 100%;
  height: calc(100vh - 90px);
}

.model1 {
  width: 48%;
  height: 40%;
  position: relative;
  text-align: center;
  float: right;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
  padding-top: 10px;
}

.model2 {
  width: 100%;
  height: 50%;
  font-size: 25px;
  position: relative;
  float: left;
  text-align: center;
  color: #FFFFFF;
  padding-top: 10px;
}

::v-deep .el-transfer-panel {
  width: 38%; /* 调整宽度 */
}

::v-deep .el-checkbox__label {
  font-size: 16px;
}

::v-deep .el-transfer {
  font-size: 16px;
}

::v-deep .el-input__inner {
  font-size: 16px;
}

.tableMove {
  overflow-y: auto;
}

</style>

