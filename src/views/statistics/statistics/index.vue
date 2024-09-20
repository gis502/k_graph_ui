<template>
  <div class="app-container style-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-select
            v-model="eqlistName"
            placeholder="请选择地震信息"
            size="large"
            style="width: 370px"
            filterable
        >
          <el-option
              v-for="item in tableNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-select
            v-model="flag"
            placeholder="请选择上传表名"
            size="large"
            style="width: 240px"
        >
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
    </el-row>
    <div class="container-center">
<!--            <dv-border-box-1 class="model1">地震上传时间信息-->
<!--              <div>da</div>-->
<!--            </dv-border-box-1>-->
<!--            <dv-border-box-7 class="model1"><p style="position:relative; left: -40%">地震统计信息</p>-->
<!--              <div>da</div>-->
<!--            </dv-border-box-7>-->
      <dv-border-box-10 class="model2">灾情上传数据统计
        <div ref="chart" style="width: 100%; height: 400px;margin-top: 50px"></div>
      </dv-border-box-10>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage} from "element-plus";
import {getField, getData} from "@/api/system/excel.js";
import {getExcelUploadEarthquake} from "@/api/system/eqlist.js";
import * as echarts from 'echarts';


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
const widthList = {
  'YaanAftershockStatistics': [300, 200, 100, 100, 200, 120, 100, 100, 100],
  'YaanRelocationResettlementDisasterReliefGroup': [300, 200, 100, 100, 200, 150, 150, 130, 130, 170, 160],
  'YaanCasualties': [300, 200, 100, 100, 200, 130, 120, 120, 120, 120, 120, 120, 120]
}

/** 监听 */
watch(flag, (newFlag) => {
  const selectedFile = files.value.find(file => file.fileFlag === newFlag);
  if (selectedFile && selectedFile.fileColumn) {
    const fileColumn = JSON.parse(selectedFile.fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys());
    name.value = Array.from(map.values());
    width.value = widthList[newFlag]
    data.value = generateData();
    columns.value = generateColumnConfig();
  }
  // 清空选择
  clearSelection();
  value.value = [];
  getYaanCasualtiesList();

});
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
onMounted(() => {
  getTableField()
  getEarthquake()
})

// 请求人员伤亡表数据
const getYaanCasualtiesList = async () => {
  await getData({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    requestParams: requestParams.value,
    flag: flag.value
  }).then(res => {
    tableData.value = res.data.records
    console.log(res.data.records)
    total.value = res.data.total
  })

}


const generateColumnConfig = () => {
  return field.value.map((fieldName, index) => {
    const label = name.value[index];
    const width1 = width.value[index]
    return {
      prop: fieldName,
      label: label,
      align: "center",
      width: width1
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
      value: file.fileFlag
    }));
    flag.value = files.value[0].fileFlag; // 默认选择第一个表
    const fileColumn = JSON.parse(files.value[0].fileColumn);
    console.log(1111)
    console.log(fileColumn)
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys())
    name.value = Array.from(map.values())
    data.value = generateData();
    columns.value = generateColumnConfig();

    console.log(name.value)
    console.log(123)

    FieldName.value = name.value.filter(item =>  item === '余震次数累计' || item === '3.0-3.9级' || item === '4.0-4.9级' || item === '5.0-5.9级')
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
        data:FieldName.value,
        // data:['余震次数累计', '3.0-3.9级','4.0-4.9级','5.0-5.9级'],
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
                { offset: 0, color: '#008cff' },
                { offset: 1, color: '#005193' }
              ]),
              opacity: 1
            }
          }
        },
        {
          name: '3.0-3.9级',
          type: 'bar',
          data: [1,2,4,2,4,3,2,4,2,3],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color:'#ffeb2f',
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
          data: [0,2,3,2,2,2,2,2,1,2],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color:'#ffa500',
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
          data: [1,1,1,1,2,1,1,2,1,1],
          barWidth: 13,
          barGap: 1,
          itemStyle: {
            normal: {
              color:'#f81919',
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
  background-image: url("@/assets/bg.png");
  background-size: 100% 100%;
  position: absolute;

}

.container-center {
  width: 100%;
  height: calc(100vh - 90px);
}

.model1 {
  width: 100%;
  height: 20%;
  position: relative;
  text-align: center;
  float: right;
  font-size: 25px;
  margin: 10px;
  color: #FFFFFF;
}

.model2 {
  width: 100%;
  height: 80%;
  font-size: 25px;
  position: relative;
  float: left;
  text-align: center;
  color: #FFFFFF;
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

