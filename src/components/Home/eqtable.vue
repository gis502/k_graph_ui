<template>
  <div class="table">
    <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 5px;height: 17vw"
        :header-cell-style="tableHeaderColor"
        :cell-style="tableColor"
        :row-style="{ height: '37.5px' }"
        @row-click="go">
      <el-table-column
          prop="position"
          label="位置"
          min-width="140px"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          label="发震时间"
          align="center"
          min-width="160px"
          show-overflow-tooltip>
        <template v-slot="scope">
          <span>{{ formatTime(scope.row.time) }}</span>
        </template>
      </el-table-column>
      <el-table-column
          prop="magnitude"
          align="center"
          min-width="56px"
          label="震级">
        <template #default="scope">
          {{ Number(scope.row.magnitude).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column
          prop="depth"
          align="center"
          min-width="56px"
          label="深度"
          show-overflow-tooltip>
        <template #default="scope">
          {{ Number(scope.row.magnitude).toFixed(2) }}
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          pager-count="3"
          :total="total"
          layout="total, prev, pager, next, jumper"
          class="custom-pagination">
      </el-pagination>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';

const props = defineProps(['eqData']);

const total = ref(0);
const pageSize = ref(6);
const currentPage = ref(1);
const getEqData = ref([]);
const tableData = ref([]);

const router = useRouter();

watch(() => props.eqData, () => {
  let list = props.eqData.filter(item => item.magnitude >= 3)
  getEqData.value = list;
  total.value = list.length;
  tableData.value = getPageArr();
});

const go = (row) => {
  const route = router.resolve({path: '/thd', query: {eqid: row.eqid}}).href;
  window.open(route, '_blank');
};

const tableHeaderColor = () => ({
  'border-color': '#293038',
  'background-color': '#293038 !important',
  'color': '#fff',
  'text-align': 'center',
});

const tableColor = ({rowIndex}) => {
  const backgroundColor = rowIndex % 2 === 1 ? '#313a44' : '#304156';
  return {
    'border-color': backgroundColor,
    'background-color': backgroundColor,
    'color': '#fff',
    'padding': '0',
  };
};

const getPageArr = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = Math.min(currentPage.value * pageSize.value, total.value);
  return getEqData.value.slice(start, end);
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  tableData.value = getPageArr();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  tableData.value = getPageArr();
};

const formatTime = (time) => time ? time.replace('T', ' ') : '';
</script>

<style scoped>
.table {
  text-align: center;
}

/*表格页面样式*/
:deep(.el-table__inner-wrapper::before) {
  width: 0
}

:deep(.el-table) {
  --el-table-bg-color : ''
}

:deep(.el-pagination){
  --el-pagination-item-gap : 6px;
}


.pagination-wrapper {
  display: flex;
  justify-content: center;
}

.custom-pagination >>> .el-pagination__total,
.custom-pagination >>> .el-pagination__jump,
.custom-pagination >>> .el-pagination__right-wrapper {
  color: white;
  font-size: 15px;
}


</style>
