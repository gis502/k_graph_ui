<template>
  <div>
    <el-form-item style="padding-top:20px;padding-left:20px;">
      <el-input
          v-model="queryParams"
          placeholder="请输入查询信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
    </el-form-item>

    <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
      <el-table-column label="序号" align="center" width="100">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="applicationType" label="应用类型" align="center" width="200"></el-table-column>
      <el-table-column prop="source" label="来源" align="center" width="200"></el-table-column>
      <el-table-column prop="agreement" label="协议" align="center" width="200"></el-table-column>
      <el-table-column prop="port" label="端口" align="center" width="200"></el-table-column>
      <el-table-column prop="notes" label="备注" align="center" width="200"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleOpen('修改',scope.row)">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%" :show-close="false">
      <el-row>
        <el-col :span="13">
          <el-form-item label="应用类型：">
            <el-input v-model="dialogContent.applicationType" placeholder="请输入应用类型"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="来源：">
            <el-input v-model="dialogContent.source" placeholder="请输入来源"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="协议：">
            <el-input v-model="dialogContent.agreement" placeholder="请输入协议"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="端口：">
            <el-input v-model="dialogContent.port" placeholder="请输入端口"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注：">
            <el-input v-model="dialogContent.notes" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script setup>
import {insert, update, removeById, list} from "@/api/system/security.js";
import {ElMessage, ElMessageBox} from 'element-plus'

let getData = ref([]) // 后端获取的所有数据
let total = ref(12) // 一共多少条数据
let tableData = ref([]) // 表格中显示的数据数组
let currentPage = ref(1) // 当前是第几页
let pageSizes = ref([10, 20]) //选择一页显示多少条数据
let pageSize = ref(10) // 当前一页显示多少条数据
// 新增和修改弹窗相关变量
let dialogTitle = ref("") // 弹窗的标题
let dialogShow = ref(false) // 弹窗的显示与否的属性
let dialogContent = ref({// 弹窗内容
  uuid: "",
  applicationType: "",
  source: "",
  agreement: "",
  port: null,
  notes: ""
})
// 搜索关键词
let queryParams = ref("")

onMounted(() => {
  getList()
})

// 搜索
function handleQuery(){
  let searchKey = queryParams.value.trim();
  // 如果搜索关键字为空，恢复为原始数据
  if (searchKey === "") {
    getList()
    return;
  }
}

// 重置搜索信息
function resetQuery(){
    queryParams.value = '';  // 清空搜索输入框
    getList()  // 重新加载所有数据
}

// 查全部数据
function getList() {
  list().then(res => {
    getData.value = res.data
    total.value = res.data.length
    tableData.value = getPageArr();
  })
}

// 表头样式
function tableHeaderColor() {
  return {
    // 'padding': '10',
    'font-size': '16px'
  }
}

// 表内每行样式
function tableColor({row, column, rowIndex, columnIndex}) {
  if (rowIndex % 2 === 1) {
    return {
      'padding-top': '11px',
      'padding-bottom': '11px',
      'text-align': 'center',
      'font-size': '16px',
    }
  } else {
    return {
      'padding-top': '11px',
      'padding-bottom': '11px',
      'text-align': 'center',
      'font-size': '16px',
    }
  }
}

// 对数据库获取到的标绘图片数组切片
function getPageArr(data = getData.value) {
  let arr = []
  let start = (currentPage.value - 1) * pageSize.value
  let end = currentPage.value * pageSize.value
  if (end > total.value) {
    end = total.value
  }
  for (; start < end; start++) {
    arr.push(data[start])
  }
  return arr
}

//`每页 ${val} 条`
function handleSizeChange(val) {
  pageSize.value = val
  tableData.value = getPageArr()
  // console.log(`每页 ${val} 条`);
}

// `当前页: ${val}`
function handleCurrentChange(val) {
  currentPage.value = val
  tableData.value = getPageArr()
  // console.log(`当前页: ${val}`);
}

// 新增与修改弹窗的取消按钮
function cancel() {
  dialogShow.value = false
  clearDialogContent()
}

// 新增与修改弹窗的确认按钮
function commit() {
  if (dialogTitle.value === "新增") {
    dialogContent.value.uuid = guid()
    insert(dialogContent.value).then(res => {
      dialogShow.value = false
      clearDialogContent()
      getList()
    })
  } else {
    update(dialogContent.value).then(res => {
      dialogShow.value = false
      clearDialogContent()
      getList()
    })
  }
}

// 清空新增与修改弹窗中上次的内容
function clearDialogContent() {
  Object.keys(dialogContent.value).forEach(key => {
    dialogContent.value[key] = ""
  });
}

// 删除此条数据
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    removeById({id: row.uuid}).then(res => {
      console.log(res)
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
      getList()
    })
  }).catch((err) => {
    console.log(err, 345)
  });
}

// 新增与修改的弹窗
function handleOpen(title, row) {
  if (title === "新增") {
    dialogTitle.value = title
  } else {
    dialogTitle.value = title
    dialogContent.value = {...row}
  }
  dialogShow.value = !dialogShow.value
}

// 生成uuid
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
</script>

<style scoped>
.el-pagination {
  margin-top: 5px;
  justify-content: center;
}
</style>