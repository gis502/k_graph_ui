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
            v-model="selectedComponentKey"
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
      <el-col :span="1.5">
        <el-date-picker
            v-model="inputValue"
            type="datetime"
            placeholder="请选择查询时间"
            style="width: 240px; height: 40px"
        />
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" @click="handleClick">查询</el-button>
      </el-col>
      <!-- 动态组件显示 -->
    </el-row>
    <div class="container-center">
      <component :is="selectedComponent" :newEqId="newEqId" :userInput="userInput"/>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage} from "element-plus";
import {reactive} from 'vue';
import {getField} from "@/api/system/excel.js";
import {getExcelUploadEarthquake, getExcelUploadEqList} from "@/api/system/eqlist.js";
import EarthquakeCasualties from "@/components/DisasterStatistics/EarthquakeCasualties.vue";
import TransportationElectricity from "@/components/DisasterStatistics/TransportationElectricity.vue" ;
import BuildingDamageInformation from "@/components/DisasterStatistics/BuildingDamageInformation.vue";
import SecondaryDisaster from "@/components/DisasterStatistics/SecondaryDisaster.vue";
import ResourceStrength from "@/components/DisasterStatistics/ResourceStrength.vue";
import MaterialDonation from "@/components/DisasterStatistics/MaterialDonation.vue"
import PublicSentiment from "@/components/DisasterStatistics/PublicSentiment.vue"
import WorkGroupLog from "@/components/DisasterStatistics/WorkGroupLog.vue"


// 查询时间功能
const inputValue = ref('')
const userInput = ref('')

const handleClick = () => {
  userInput.value = inputValue.value;
  inputValue.value = '';
}
// -------------------------------------------------------------------------------------------------------


// 选项数据
const options = [
  {label: '震情伤亡信息可视化', value: 'EarthquakeCasualties'},
  {label: '交通电力通信信息可视化', value: 'TransportationElectricity'},
  {label: '建筑物受损信息可视化', value: 'BuildingDamageInformation'},
  {label: '次生灾害信息可视化',value: 'SecondaryDisaster'},
  {label: '力量物资信息可视化',value: 'ResourceStrength'},
  {label: '资金及物资捐赠可视化', value: 'MaterialDonation'},
  {label: '宣传舆情信息可视化',value: 'PublicSentiment'},
  {label: '工作组每日工作动态可视化',value: 'WorkGroupLog'},
]

// 当前选择的组件标识符
const selectedComponentKey = ref('EarthquakeCasualties')

// 组件映射表
const components = {
  EarthquakeCasualties,
  TransportationElectricity,
  BuildingDamageInformation,
  SecondaryDisaster,
  ResourceStrength,
  MaterialDonation,
  PublicSentiment,
  WorkGroupLog
}

// 动态获取选定的组件
  const selectedComponent = computed(() => {
    return components[selectedComponentKey.value]
})


const flag = ref()
const currentPage = ref(1)
const pageSize = ref(10)
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

const form = reactive({
  tableName: '',
  eqId: ''
});


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
  // getYaanCasualtiesList();
});


import {useGlobalStore} from "../../../store";
const newEqId = computed(() => eqlistName.value);
const store = useGlobalStore();
watch([() => eqlistName.value,() => selectedComponentKey.value], (newValue) => {
  store.setGlobalVariable(newValue[0]); // 更新全局的eqid
  store.setGlobalChange(newValue[1]); // 更新全局的模块变化标识
});

onMounted(() => {
  getTableField()
  getEarthquake()
})


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
    // FieldName.value = name.value.filter(item => item === '余震次数累计' || item === '3.0-3.9级' || item === '4.0-4.9级' || item === '5.0-5.9级')
    // 模拟异步请求后赋值给 FieldName
  })
}

// 时间处理为年 月 日 格式
const formatDate = (dateStr) => {
  if(dateStr){
    const date = new Date(dateStr.replace(' ', 'T')); // 将字符串转换为 Date 对象
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 补充 0，确保是 2 位数
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  }
};

// 获取地震列表
const getEarthquake = () => {
  getExcelUploadEqList().then(res => {

    eqlists.value = res

    eqlists.value = eqlists.value.filter(item => {
      // 提取震级数值
      const magnitude = parseFloat(item.split('震级：')[1]);
      // 检查是否包含"四川省"
      const isSichuan = item.includes('四川');
      // 同时满足两个条件
      return magnitude >= 5.0 && isSichuan;
    });

    console.log(eqlists.value,"这是地震数据")

    if (res.data === null) {
      ElMessage.error("地震列表无数据")
    }
    tableNameOptions.value = eqlists.value.map(file => {

          const eqid = file.split(' - ')[0]?.trim();
          const details = file.split(' - ')[1]?.trim();

          // 对时间进行处理：
          const time = formatDate(details.split(' ')[0] +' ' +details.split(' ')[1]);
          const newDetails = `${time}`+ ' ' +details.split(' ')[2] + ' ' + details.split(' ')[3] + details.split(' ')[4];

          // 提取 `-` 后面的部分
          return {
            label: newDetails, // 使用提取的部分作为标签
            value: eqid// 选择值为 ID
          }
        }
    )

    const earthquakeList = tableNameOptions.value;
    console.log(earthquakeList);

// 查找最新的地震记录
    const latestEarthquake = earthquakeList.reduce((latest, current) => {
      // 提取时间字符串并转换为日期对象
      const currentDate = new Date(current.label.split(' ')[0] + ' ' + current.label.split(' ')[1]);
      return (!latest || currentDate > latest.date) ? { ...current, date: currentDate } : latest;
    }, null);

// 设置默认显示的 eqlistName 值为最新记录的 value
    if (latestEarthquake) {
      eqlistName.value = latestEarthquake.value;
    } else {
      ElMessage.error("未找到指定的地震ID");
      // eqlistName.value = tableNameOptions.value[0].label
    }
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
  height: 100vh;
  background-image: url("@/assets/bg1.png");
  background-size: 100% 100%;
  position: absolute;

}

.container-center {
  width: 100%;
  height: calc(100vh - 90px);
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

.el-button{
  text-align: center;
  line-height: 40px;
  height: 40px;
  font-size: 16px;
  font-weight: 1000;
}
</style>

