<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-13 class="model1">各工作组上报信息统计
        <WorkGroupInfo :eqid="eqid"/>
      </dv-border-box-13>

      <dv-border-box-13 class="model1">各受灾区上报信息统计<br>
        <AffectAreaInfo :eqid="eqid"/>
      </dv-border-box-13>



    </div>
  </div>
</template>


<script setup>
import {ref, onMounted} from 'vue';
import {ElMessage} from "element-plus";
import {getField, getData} from "@/api/system/excel.js";
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import AffectAreaInfo from "@/components/DisasterStatistics/AffectAreaInfo.vue";
import WorkGroupInfo from "@/components/DisasterStatistics/WorkGroupInfo.vue";
import ProblemRequireWordCloud from "@/components/DisasterStatistics/ProblemRequireWordCloud.vue";
import CurrentJobWordCloud from "@/components/DisasterStatistics/CurrentJobWordCloud.vue";
import { defineProps } from 'vue';
import {gettotal} from "../../api/system/casualtystats"

const props = defineProps({
  newEqId: {
    type: String,
    required: true
  },
});

const eqid = ref('')

// 尝试导入全局变量：
import {useGlobalStore} from "../../store";
const store = useGlobalStore();
setTimeout(()=>{
  (function (){

  })()
},500)

watch(() => props.newEqId, (newValue) => {
  eqid.value = newValue
  // 其他处理逻辑
  gettotal(eqid.value).then(res =>{
    // 得到后端数据开始操作：
    const areas = res.length > 0 ? res.map(item => item.affectedAreaName) : ["抱歉暂无数据"];
    const totalDeceased = res.length > 0 ? res.map(item => item.totalDeceased) : [0];
    const totalMissing = res.length > 0 ? res.map(item => item.totalMissing) : [0];
    const totalInjured = res.length > 0 ? res.map(item => item.totalInjured) : [0];
    const times = res.length > 0 ? res.map(item => item.submissionDeadline) : ["抱歉暂无数据"];

    // 初始化 ECharts 实例
    const chartInstance = echarts.init(chart.value);
    // 更新图表配置
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
        data: areas, // 使用动态获取的区域数据
        // 其他 xAxis 配置
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
          name: '累计遇难（人）',
          type: 'bar',
          data: totalDeceased, // 使用动态获取的死亡人数
          // 其他系列配置
        },
        {
          name: '累计失联（人）',
          type: 'bar',
          data: totalMissing, // 使用动态获取的失联人数
          // 其他系列配置
        },
        {
          name: '累计受伤（人）',
          type: 'bar',
          data: totalInjured, // 使用动态获取的受伤人数
          // 其他系列配置
        }
      ]
    };

    chartInstance.setOption(option); // 设置更新后的配置
    window.addEventListener('resize', () => {
      chartInstance.resize();
    });
  })
});

const flag = ref()
const currentPage = ref(1 )
const pageSize = ref(10)
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
const multipleTableRef = ref()
const multipleSelection = ref([])
const times = [];

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

onMounted(() => {
  getTableField()
})

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
  padding-right:40px;
}

.container-center {
  width: 100%;
  height: calc(100vh - 90px);
}

.model1 {
  width: 100%;
  height: 50%;
  font-size: 25px;
  position: relative;
  float: left;
  text-align: center;
  color: #FFFFFF;
  padding-top:10px;
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

