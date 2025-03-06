<template>
  <div class="right">
    <div class="right-body">
      <div class="right-top public-bg" ref="rightTop">
        <div style="width: 100%; height: auto;">
          <div
              style="position: absolute; top: 18px; left: 115px; display: flex; align-items: center; z-index: 1;"
          >
            <el-input
                size="small"
                style="width: 5vw; font-size: 16px;margin-right: 5px;margin-left: 7px"
                v-model="requestParams"
                @keyup.enter="query()"
            ></el-input>
            <el-button
                size="small"
                style="font-size: 14px;"
                @click="query()"
            >查询</el-button>
            <el-button
                size="small"
                style="font-size: 14px;"
                @click="openQueryFrom()"
            >筛选</el-button>

            <!-- 正式和测试按钮，固定不切换 -->
            <el-button
                size="small"
                :type="activeMode === 'Z' ? 'danger' : 'default'"
                style="font-size: 14px;"
                @click="activeMode = 'Z'"
            >
              真实
            </el-button>
            <el-button
                size="small"
                :type="activeMode === 'Y' || activeMode === 'T' ? 'primary' : 'default'"
                style="font-size: 14px;"
                @click="activeMode = 'Y'"
            >
              测试
            </el-button>
          </div>
        </div>
        <eq-table1 :eq-data="CeShiTableData"/>
      </div>
      <el-dialog v-model="queryFormVisible" title="筛选" width="28vw" style="top:20vh">
        <el-form :inline="true" :model="formValue">
          <el-form-item label="地震位置">
            <el-input v-model="formValue.earthquakeName" style="width: 23vw;" placeholder="地震位置" clearable/>
          </el-form-item>
          <el-form-item label="发震时间">
            <el-date-picker
                v-model="formValue.occurrenceTime"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :shortcuts="shortcuts"
                style="width: 23vw;"
                value-format="x"
            />
          </el-form-item>
          <el-form-item label="地震震级">
            <el-input v-model="formValue.startMagnitude" style="width: 5vw;"/>
            <span style="margin: 0 10px"> 至 </span>
            <el-input v-model="formValue.endMagnitude" style="width: 5vw;"/>
            <span style="margin: 0 10px">(级)</span>
          </el-form-item>
          <el-form-item label="地震深度">
            <el-input v-model="formValue.startDepth" style="width: 5vw"/>
            <span style="margin: 0 10px"> 至 </span>
            <el-input v-model="formValue.endDepth" style="width: 5vw"/>
            <span style="margin: 0 10px">(千米)</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
// import { fromEqList, queryEqList } from '@/api/system/eqlist';
import {fromEq, fromEqList, getAllEq, queryEq, queryEqList} from '@/api/system/eqlist';
import { getEqList } from "@/api/system/damageassessment.js";
import EqTable1 from '@/components/Home/eqtable1.vue';
import Chart1 from '@/components/Home/chart1.vue';

// 先定义组件对象
const CommandScreenEqList = {
  name: 'CommandScreenEqList',
  components: {
    EqTable1,
    Chart1
  },
  setup() {
    // State variables
    const requestParams = ref('');
    const activeMode = ref('Z');
    const tableData = ref([]);
    const EqAll = ref([]);
    const lastValidEqData = ref(null);
    const lastEqData = ref(null);
    const queryFormVisible = ref(false);
    const formValue = ref({
      earthquakeName: '',
      occurrenceTime: '',
      startMagnitude: '',
      endMagnitude: '',
      startDepth: '',
      endDepth: '',
      startDate: '',
      endDate: '',
    });

    // Computed properties
    const CeShiTableData = computed(() => {
      if (activeMode.value === 'Z') {
        return tableData.value.filter(item => item.eqType === 'Z');
      } else if (activeMode.value === 'Y' || activeMode.value === 'T') {
        return tableData.value.filter(item => item.eqType === 'Y' || item.eqType === 'T');
      }
      return tableData.value;
    });

    const MapData = computed(() => {
      let filteredData = tableData.value;

      if (activeMode.value === 'Z') {
        filteredData = filteredData.filter(item => item.eqType === 'Z');
      } else if (activeMode.value === 'Y' || activeMode.value === 'T') {
        filteredData = filteredData.filter(item => item.eqType === 'Y' || item.eqType === 'T');
      }

      // 过滤出年份大于等于2000的地震数据
      return filteredData.filter(item => item.occurrenceTime && new Date(item.occurrenceTime).getFullYear() >= 2000);
    });

    // Watchers to update data
    watch(MapData, (newVal) => {
      if (newVal.length > 0) {
        lastValidEqData.value = newVal[0];  // 存储上一次有值的第一条数据
        lastEqData.value = newVal[0];
      } else {
        lastEqData.value = lastValidEqData.value;  // 为空时回退到存储值
      }
    }, { deep: true, immediate: true });

    watch(CeShiTableData, (newVal) => {
      if (newVal.length > 0) {
        lastValidEqData.value = newVal[0];
        lastEqData.value = newVal[0];
      } else {
        lastEqData.value = lastValidEqData.value;
      }
    }, { deep: true, immediate: true });

    // Methods
    const getEq = () => {
      getEqList().then((res) => {
        EqAll.value = res.data;
        tableData.value = res.data;
        lastEqData.value = tableData.value[0];
      });
    };

    const query = () => {
      console.log(12321)
      if (requestParams.value === '') {
        tableData.value = EqAll.value;
        lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
        return;
      }

      queryEqList({ queryValue: requestParams.value }).then((res) => {
        tableData.value = res;
        lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
      });
    };

    const openQueryFrom = () => {
      queryFormVisible.value = true;
    };

    const onSubmit = () => {
      // 获取表单值并转换时间范围
      const queryParams = {
        earthquakeName: formValue._value.earthquakeName || undefined,
        startTime: formValue._value.startDate || undefined,
        endTime: formValue._value.endDate || undefined,
        startMagnitude: formValue._value.startMagnitude || undefined,
        endMagnitude: formValue._value.endMagnitude || undefined,
        startDepth: formValue._value.startDepth || undefined,
        endDepth: formValue._value.endDepth || undefined,
      };
      fromEqList(queryParams).then((res) => {
        console.log(formValue)
        console.log(queryParams)
        console.log(res)
        tableData.value = res;
        lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
      });
      queryFormVisible.value = false;
    };

    onMounted(() => {
      nextTick(() => {
        getEq();  // 获取初始数据
      });
    });

    // 返回需要在模板中使用的变量和方法
    return {
      requestParams,
      activeMode,
      tableData,
      EqAll,
      CeShiTableData,
      lastEqData,
      queryFormVisible,
      formValue,
      query,
      openQueryFrom,
      onSubmit
    }
  }
}

// 默认导出
export default CommandScreenEqList;
// 具名导出
export { CommandScreenEqList };
</script>

<style scoped>
.panelTop {
  top: 0.5%;
  height: 6.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.panelName {
  color: #FFFFFF;
  font-size: 1.2rem;
  font-weight: 550;
  position: relative;
  top: 32%;
  left: 7%;
}
/* 按钮样式 */
.el-button {
  background: linear-gradient(45deg, #2c3364, #0ff);
  color: #dce9fa;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}
.el-input,
.el-button {
  border-radius: 8px;
  border: none;
}

.el-button {

  background: linear-gradient(45deg, #2c3364, #0ff);
  color: #dce9fa;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
}

.el-input,
.el-button {
  border-radius: 5px;
}


.el-button:hover {
  background-color: #006f8c;
}

</style>
