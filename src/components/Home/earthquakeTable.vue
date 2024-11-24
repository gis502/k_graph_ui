<template>
  <div class="list-dialog" style="width: 100%;height: 100%; z-index: 900; ">
    <div class="list-dialog__header" >
      <span >地震列表</span>
    </div>
    <div class="list-dialog__content" style="height: calc(100% - 40px);">
      <div class="table">
        <el-table
            :data="tableData"
            style="width: 100%; margin-bottom: 2px;height: 32vw;"
            :header-cell-style="tableHeaderColor"
            :cell-style="tableColor"
            :row-style="{ height: '37.5px', fontSize: '12px'}"
            @row-click="go">
          <el-table-column
              prop="earthquakeName"
              label="位置"
              min-width="110px"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              label="发震时间"
              align="center"
              min-width="135px"
              show-overflow-tooltip>
            <template v-slot="scope">
              <span>{{ formatTime(scope.row.occurrenceTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="magnitude"
              align="center"
              min-width="70px"
              label="震级(级)">
            <template #default="scope">
              {{ Number(scope.row.magnitude).toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column
              prop="depth"
              align="center"
              min-width="75px"
              label="深度(千米)"
              show-overflow-tooltip>
            <template #default="scope">
              {{scope.row.depth}}
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
  console.log(props.eqData)
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
  'border-width':'1px',
  'border-style':'solid',
  'border-color': '#555555',
  'background-color': '#293038 !important',
  'color': '#fff',
  'text-align': 'center',
  'font-size': '.8rem',
  'padding': '0',
  'margin': '0'
});

const tableColor = ({rowIndex}) => {
  const backgroundColor = rowIndex % 2 === 1 ? '#313a44' : '#304156';
  return {
    'border-width':'1px',
    'border-style':'solid',
    'border-color': '#555555',
    'background-color': backgroundColor,
    'color': '#fff',
    'padding': '0',
    'margin': '0'
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

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
.list-dialog .list-dialog__header {
  height: 41px;
  width: 100%;
  line-height: 41px;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 4px 4px 0 0;
  padding: 0 5px 0 10px;
  position: relative;
  top: 0;
  left: 0;
  background: url(@/assets/images/CommandScreen/右侧列表底图.png) no-repeat;
  background-size: 100% 100%;
}
.list-dialog {
  height: 100%;
  width: 100%;
  background-color: rgb(22, 53, 77,0.9);
  padding: 0!important;
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}
.list-dialog .list-dialog__content {
  height: 100%;
  padding: 11px;
  overflow: auto;
  border-radius: 4px;
}
.table {
  width: 100%;
  height: 98%;
  margin-bottom: 8px;
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
:deep(.el-table--default .cell){
  padding : 0 4px
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -5px;
}
.custom-pagination >>> .el-pagination__total,
.custom-pagination >>> .el-pagination__jump,
.custom-pagination >>> .el-pagination__right-wrapper {
  color: white;
  font-size: 13px;
}
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px;               /* 滚动条的宽度 */
  height: 12px;              /* 滚动条的高度，对水平滚动条有效 */
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
</style>

