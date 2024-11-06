<template>
  <div>
    <el-form-item style="padding-top:20px;padding-left:20px;">
      <el-input
          v-model="queryParams"
          placeholder="请输入查询信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"/>
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
    </el-form-item>

    <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor"
              style="width: 100%"
              height="700px"
    >
      <el-table-column label="序号" align="center" width="100">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="url" label="新闻网址" align="center" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="title" label="新闻标题" align="center" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="publishTime" label="发布时间" align="center" width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatDate(scope.row.publishTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="新闻内容" align="center" width="300"
                       show-overflow-tooltip></el-table-column>
      <el-table-column prop="sourceName" label="新闻来源" align="center" width="200"
                       show-overflow-tooltip></el-table-column>
      <el-table-column prop="image" label="新闻封面图片" align="center" width="200"
                       show-overflow-tooltip>
        <template #default="scope">
          <el-image style="width: 100px; height: 50px" :src="scope.row.image"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="sourceLogo" label="来源网站标识" align="center" width="200">
        <template #default="scope">
          <el-image style="width: 100px; height: 50px" :src="scope.row.sourceLogo"></el-image>
        </template>
      </el-table-column>
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
      <el-form ref="ruleFormRef" style="max-width: 600px" :model="dialogContent" :rules="rules" label-width="auto"
               status-icon>
        <el-form-item label="新闻网址：">
          <el-input v-model="dialogContent.url" placeholder="请输入新闻网址"></el-input>
        </el-form-item>
        <el-form-item label="新闻标题：">
          <el-input v-model="dialogContent.title" placeholder="请输入新闻标题"></el-input>
        </el-form-item>
        <el-form-item label="发布时间：">
          <el-date-picker
              v-model="dialogContent.publishTime"
              type="datetime"
              placeholder="选择日期时间"
              align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="新闻内容：">
          <el-input type="textarea"
                    :rows="2"
                    placeholder="请输入新闻内容"
                    v-model="dialogContent.content"></el-input>
        </el-form-item>
        <el-form-item label="新闻来源：">
          <el-input v-model="dialogContent.sourceName" placeholder="请输入新闻来源"></el-input>
        </el-form-item>
        <el-form-item label="新闻封面：" prop="image">
          <el-input v-model="dialogContent.image" v-if="false"></el-input>
          <el-upload
              action="#"
              list-type="picture-card"
              :headers="headers"
              :file-list="fileList"
              :on-change="handlerChange"
              :auto-upload="false"
              :limit="1">
            <el-icon>
              <Plus/>
            </el-icon>
            <template #file="{ file }">
              <img class="el-upload-list__item-thumbnail" :src="file.url">
              <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-delete" @click="deleteUnloadPic()">
                    <el-icon><Delete/></el-icon>
                  </span>
                </span>
              <!--</div>-->
            </template>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogContent.image" alt="">
          </el-dialog>
        </el-form-item>

        <el-form-item label="来源网站标识：" prop="sourceLogo">
          <el-input v-model="dialogContent.sourceLogo" v-if="false"></el-input>
          <el-upload
              action="#"
              list-type="picture-card"
              :headers="headers"
              :file-list="fileListLogo"
              :on-change="handlerChangeCover"
              :auto-upload="false"
              :limit="1">
            <el-icon>
              <Plus/>
            </el-icon>
            <template #fileLogo="{ fileLogo }">
              <img class="el-upload-list__item-thumbnail" :src="fileLogo.url">
              <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-delete" @click="deleteLogoUnloadPic()">
                    <el-icon><Delete/></el-icon>
                  </span>
                </span>
              <!--</div>-->
            </template>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogContent.sourceLogo" alt="">
          </el-dialog>
        </el-form-item>


        <span slot="footer" class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>

  </div>
</template>

<script setup>
import {insert, update, removeById, list} from "@/api/system/security.js";
import {upload, getNewsList, save} from '@/api/system/news.js'
import {ElMessage, ElMessageBox} from 'element-plus'
import {throwError} from "element-plus/es/utils/index";
import {ref} from "vue";

let getData = ref([]) // 后端获取的所有数据
let total = ref(12) // 一共多少条数据
let tableData = ref([]) // 表格中显示的数据数组
let currentPage = ref(1) // 当前是第几页
let pageSize = ref(10) // 当前一页显示多少条数据
let pageSizes = ref([10, 30, 50, 100, 200, 500]) //选择一页显示多少条数据
const requestParams = ref("")
// 新增和修改弹窗相关变量
let dialogTitle = ref("") // 弹窗的标题
let dialogShow = ref(false) // 弹窗的显示与否的属性
let dialogContent = ref({// 弹窗内容
  uuid: "",
  url: "",
  title: "",
  publishTime: "",
  content: "",
  sourceName: "",
  image: "",
  sourceLogo: ""
})
let queryParams = ref("")
let dialogVisible = ref(false)
let disabled = ref(false)
let file = ref({
  name: '',
  url: ''
})

let fileLogo = ref({
  name: '',
  url: ''
})
const fileList = ref([])
const fileListLogo = ref([])
const ruleFormRef = ref()
const rules = reactive({
  newsSource: [
    {required: true, message: '请输入新闻来源', trigger: 'blur'}
  ],
});
const headers = {'Content-Type': 'multipart/form-data'}

onMounted(() => {
  getList()
})

function createFilter(queryString) {
  return (restaurants) => {
    return (restaurants.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
  };
}

// 搜索
function handleQuery() {
  let searchKey = queryParams.value.trim();
  // 如果搜索关键字为空，恢复为原始数据
  if (searchKey === "") {
    getList()
    return;
  }
}

// 重置搜索信息
function resetQuery() {
  queryParams.value = '';  // 清空搜索输入框
  getList()  // 重新加载所有数据
}

// 查全部数据
function getList() {
  getNewsList().then(res => {
    console.log("新闻数据=》 ", res)
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
  console.log(`每页 ${val} 条`);
}

// `当前页: ${val}`
function handleCurrentChange(val) {
  currentPage.value = val
  tableData.value = getPageArr()
  console.log(`当前页: ${val}`);
}

// 新增与修改弹窗的取消按钮
function cancel() {
  dialogShow.value = false
  clearDialogContent()
}

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      commit()
      //关闭弹窗并提示上传成功
      dialogShow.value = !dialogShow.value
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 新增与修改弹窗的确认按钮
function commit() {

  if (dialogTitle.value === "新增") {
    dialogContent.value.uuid = guid()
    let data = JSON.parse(JSON.stringify(dialogContent.value));


    upload({file: file.value.url})
        .then(res => {
          console.log("封面图片上传成功 => ", res)
          //在这个地方将图片地址更换
          data.image = res.url
        })
        .catch(ex => {
          console.log("封面上传失败 => ", ex)
        })
    upload({file: fileLogo.value.url})
        .then(res => {
          console.log("Logo图片上传成功 => ", res)
          //在这个地方将图片地址更换
          data.sourceLogo = res.url
        })
        .catch(ex => {
          console.log("Logo上传失败 => ", ex)
        })
    console.log("待上传的数据：", data)
    save(data).then(res => {
      console.log(res, "插入成功")
    }).catch(ex => {
      console.log(ex, "插入数据失败")
    })


  }
}

// 清空新增与修改弹窗中上次的内容
function clearDialogContent() {
  dialogContent.value = ({
    uuid: "",
    url: "",
    title: "",
    publishTime: "",
    content: "",
    sourceName: "",
    image: "",
    sourceLogo: ""
  })
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

function handlerChange(res) {

  console.log("res:", res)
  if (res.status === 'ready') {
    console.log("准备上传...")
    file.value.url = res.raw
  } else {
    console.log("上传失败：", res)
  }

}

function handlerChangeCover(res, fileList) {
  console.log("res:", res)
  if (res.status === 'ready') {
    console.log("准备上传...")
    fileLogo.value.url = res.raw
  } else {
    console.log("上传失败：", res)
  }
}

function handleError(err, file, fileList) {
  console.log("上传失败：", err)
}

function deleteUnloadPic(file) {
  fileList.value = []
}

function deleteLogoUnloadPic(file) {
  fileListLogo.value = []
}

function formatDate(value) {
  if (!value) return '';
  // 将字符串转换为 Date 对象
  const date = new Date(value);
  // 获取年、月、日、时、分、秒
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() 返回的月份从 0 开始，所以需要 +1
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  // 格式化月、日、时、分、秒，不足两位数的前面补零
  const formatNumber = n => n < 10 ? '0' + n : n;
  // 拼接成最终的格式
  return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`;
}

</script>

<style scoped>
.el-pagination {
  margin-top: 5px;
  justify-content: center;
}
</style>
