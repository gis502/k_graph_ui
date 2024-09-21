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
            v-model="selectedComponent"
            placeholder="请选择模块"
            size="large"
            style="width: 240px"
        >
          <el-option
              v-for="option in options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-col>
      <!-- 动态组件显示 -->
    </el-row>
    <div class="container-center">
      <component :is="selectedComponent" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage} from "element-plus";
import {getField, getData} from "@/api/system/excel.js";
import {getExcelUploadEarthquake} from "@/api/system/eqlist.js";
import EarthquakeCasualties from "@/components/DisasterStatistics/EarthquakeCasualties.vue";
import ResettlementGraph from "@/components/DisasterStatistics/ResettlementGraph.vue";

const options = [
  {label: '震情伤亡信息可视化', value: EarthquakeCasualties},
  // { label: '交通电力通信信息可视化', value: 'DisasterStatistics' }
]
// 当前选择的组件
const selectedComponent = ref(EarthquakeCasualties)
// 注册组件
const components = {
  EarthquakeCasualties,
  // DisasterStatistics,

}


const flag = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const requestParams = ref("")
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
  }
  // 清空选择
  clearSelection();
  value.value = [];
  getYaanCasualtiesList();

});

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




/** 获取字段 */
const getTableField = () => {
  getField().then(res => {
    files.value = res.data
    if (files.value.length == 0) {
      ElMessage.error("该用户无导表权限")
    }
    flag.value = files.value[0].fileFlag; // 默认选择第一个表
    const fileColumn = JSON.parse(files.value[0].fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys())
    name.value = Array.from(map.values())
    data.value = generateData();
    FieldName.value = name.value.filter(item =>  item === '余震次数累计' || item === '3.0-3.9级' || item === '4.0-4.9级' || item === '5.0-5.9级')
    // 模拟异步请求后赋值给 FieldName

    console.log(FieldName.value)

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
  width: 48%;
  height: 40%;
  position: relative;
  text-align:center ;
  float: right;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
}

.model2 {
  width: 100%;
  height: 50%;
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

