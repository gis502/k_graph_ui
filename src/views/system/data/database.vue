<template>
  <div class="app-container">
    <div style="margin: 0 0 1vh 0">
      <el-input style="width: 10vw;margin-right:1vw ; font-size: 15px" v-model="queryParams.queryValue"
                placeholder="请输入查询的表名或备注"/>
      <el-button type="primary" @click="getList">搜索</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button type="primary" @click="handleBackupAll">一键备份</el-button>
      <span style="float: right;color: red">(系统每天0点自动备份，备份文件保存在云服务器backup文件夹下）</span>
    </div>
    <el-table
        v-loading="loading"
        :data="listTable"
        height="71vh"
        :header-cell-style="tableHeaderColor"
        :cell-style="tableColor"
    >
      <el-table-column label="序号" type="index"
                       align="center" width="60">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (queryParams.pageNum - 1) * queryParams.pageSize }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" key="createTime" prop="createTime">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" key="updateTime" prop="updateTime">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column
          label="表名"
          align="center"
          key="tableName"
          prop="tableName"
          show-overflow-tooltip
      />
      <el-table-column label="备注" align="center" key="tableComment" prop="tableComment" show-overflow-tooltip/>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="text" @click="handleUpdate()">
            <el-icon>
              <Edit/>
            </el-icon>
            修改
          </el-button>
          <el-button type="text" @click="handleDelete()">
            <el-icon>
              <Delete/>
            </el-icon>
            删除
          </el-button>
          <el-button type="text" @click="handleBackup(scope.row.tableName)">
            <el-icon>
              <DocumentCopy/>
            </el-icon>
            备份
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <div style="margin-top: -2vh">
      <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :pageSizes="[10, 20, 50, 100]"
          @pagination="getList"
          class="pagination"
      />
    </div>
    <el-dialog v-model="isBackupDialogVisible" title="备份中" style="top: 25vh" width="500">
      <div style="font-size: 17px">
        <span>正在备份中...</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isBackupDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="isNoPermission" title="提示" style="top: 25vh" min-width="500">
      <div style="font-size: 17px">
        <span>您没有权限使用此功能，如需操作，请联系管理员进行操作。</span>
        <br>
        <span>联系方式：176-222-222-222</span>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: right;">
          <el-button @click="isNoPermission = false" type="primary">关闭</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {ElIcon, ElButton, ElDialog} from 'element-plus';
import {Edit, Delete, DocumentCopy} from '@element-plus/icons-vue';
import {ref} from 'vue'
import {backup, backupAll, getListTable} from "@/api/system/table.js";

const loading = ref(false)
const total = ref(0)
const listTable = ref([])
const isBackupDialogVisible = ref(false)
const isNoPermission = ref(false)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  queryValue: ''
});

onMounted(() => {
  getList();
})

function tableHeaderColor() {
  return {
    // 'padding': '10',
    'font-size': '16px'
  }
}

// 修改table的背景色
function tableColor({row, column, rowIndex, columnIndex}) {
  if (rowIndex % 2 === 1) {
    return {
      'padding-top': '8px',
      'padding-bottom': '8px',
      'text-align': 'center',
      'font-size': '16px',
    }
  } else {
    return {
      'padding-top': '8px',
      'padding-bottom': '8px',
      'text-align': 'center',
      'font-size': '16px',
    }
  }
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
}

const getList = () => {
  loading.value = true;
  getListTable(queryParams.value).then((res) => {
    listTable.value = res.records
    total.value = res.total
    loading.value = false;
  })
}

const handleBackup = (tableName) => {
  isBackupDialogVisible.value = true;
  backup(tableName).then(response => {
    const blob = new Blob([response], {type: response.type});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    link.download = tableName + '.backup';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    console.error("Error during file download:", error);
  }).finally(() => {
    isBackupDialogVisible.value = false;
  });
};

const handleBackupAll = () => {
  backupAll().then(response => {
    isBackupDialogVisible.value = true;
    const blob = new Blob([response], {type: response.type});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    link.download = 'all.backup';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    console.error("文件正在生成中，请稍后再试")
  }).finally(() => {
    isBackupDialogVisible.value = false;
  });
}
const handleUpdate = () => {
  isNoPermission.value = true
}

const handleAdd = () => {
  isNoPermission.value = true
}

const handleDelete = () => {
  isNoPermission.value = true
}
</script>

<style scoped>

</style>

