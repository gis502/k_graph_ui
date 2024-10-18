<template>
  <div class="contentsBox">
    <div class="dataBox">
      <div class="dataManage" style="height: auto">
        <el-button size='large' type='primary' style="margin: 10px;" plain icon="Upload" @click="openUpload">上传Excel文件
        </el-button>
        <el-button size='large' type='primary' style="margin: 10px;"
                   @click="downExcel($event)" plain icon="Download">下载上传Excel文件
        </el-button>
        <el-button size='large' type='primary' @click="downloadForm" plain icon="Document">
          下载模板
        </el-button>
        <!-- 上传文件弹框-->
        <el-dialog title="请选择地震"
                   v-model="importDialogVisible"
                   width="35%"
                   center>
          <el-form :model="form1" ref="form" label-width="100px">
            <el-form-item label="地震列表" prop="tableName1">
              <el-select v-model="form1.tableName1" placeholder="请选择地震列表" style="width: 30vw" filterable>
                <el-option
                    v-for="item in tableNameOptions1"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="dialog-footer1">
            <div style="margin-bottom: 30px">
              <el-button @click="importDialogVisible=false">取 消</el-button>
            </div>
            <el-upload
                name="file"
                class="upload-demo"
                :action="uploadUrl"
                :multiple="false"
                :show-file-list="false"
                :on-success="handleSuccess"
                :before-upload="beforeAvatarUpload"
                @change="handleFileChange"
                :headers="this.headers">
              <!-- 隐藏的文件选择按钮 -->

              <el-button type="primary" plain @click="triggerFileInput">选择文件</el-button>
            </el-upload>
            <!--            <el-button type="primary" plain @click="confirmUpload">确定</el-button>-->
          </div>

        </el-dialog>
        <!-- 下载模板弹框-->
        <el-dialog title="请选择表名"
                   v-model="formDialogVisible"
                   width="35%"
                   center
        >
          <el-form :model="form" ref="form" label-width="100px" style="margin-left:30px">
            <el-form-item label="表名" prop="tableName">
              <el-select v-model="form.tableName" placeholder="请选择表名" style="width: 18vw" filterable>
                <el-option
                    v-for="item in tableNameOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="dialog-footer">
            <el-button @click="formDialogVisible=false">取 消</el-button>
            <el-button type="primary" plain @click="downloadFile($event)">确定</el-button>
          </div>

        </el-dialog>

        <el-input
            v-model="inputValue"
            placeholder="请输入查询内容"
            clearable
            @keyup.enter.native="searchDataButton($event)"
            @click.stopPropagation
            style="width: 250px; height: auto;margin-right: 10px;margin-left: 10px;"
        ></el-input>
        <el-button type="primary" @click="searchDataButton($event)" style="">
          <i class="el-icon-search" style="margin-right: 5px;"></i>搜索
        </el-button>
        <div style="margin-left: 1vw; font-size: 20px">
          <el-select v-model="timeValue" placeholder="今日" style="width: 7vw" @change="getExcelUploadByTimeButton">
            <el-option
                v-for="item in timeOptions"
                :key="item.value"
                :label="item.value"
                :value="item.value">
            </el-option>
          </el-select>
          添加数据：{{ addCount }}

          <!--          更新数据：{{ updateCount }}-->
        </div>
      </div>
      <div class="grid-content">
        <el-progress
            :text-color="progressColor"
            :percentage='percent'
            :text-inside='true'
            :stroke-width='20'
        ></el-progress>
      </div>
      <div class="dataContainer">
        <div class="tableStyle">
          <el-table
              :data="paginatedTableData"
              width="100%"
              height="530px"
              ref="table"
              fit
              :disable="true"
              class="data-table"
              border
              element-loading-text="Loading"
              highlight-current-row
              stripe
              :row-style="{ height: '6.5vh' }"
              :cell-style="{ padding: '0px', borderColor: '#C0C0C0' }"
              :header-cell-style="{ borderColor: '#C0C0C0', background: 'rgba(252,218,5,0.22)' }"
          >
            <el-table-column
                label="序号"
                width="100"
                align="center"
                :formatter="typeIndex"
            />
            <el-table-column
                align='center'
                prop='operName'
                label='用户'
            ></el-table-column>
            <el-table-column
                align='center'
                prop='phonenumber'
                label='联系电话'
            ></el-table-column>
            <el-table-column
                align='center'
                prop='deptName'
                label='单位'
            >
            </el-table-column>
            <el-table-column
                align='center'
                prop='operTime'
                width="180"
                label='更新时间'
            >
            </el-table-column>
            <el-table-column
                align='center'
                prop='operParam'
                label='上传表名'
                width="200"
                :formatter='formatMessageTableName'
                :show-overflow-tooltip="true"
            >
            </el-table-column>
            <el-table-column
                align='center'
                prop='jsonResult'
                label='添加数据'
                width="100"
                :formatter='formatMessageAdd'
            >
            </el-table-column>
            <el-table-column
                align='center'
                prop='jsonResult'
                label='结果'
                :formatter='formatMessageUpdate'
            >
            </el-table-column>
<!--            <el-table-column-->
<!--                label='操作'-->
<!--                align='center'-->
<!--            >-->
<!--              <template v-slot="scope">-->
<!--                <el-button-->
<!--                    size='small'-->
<!--                    type='primary'-->
<!--                    @click="openDetailPanel"-->
<!--                >详情-->
<!--                </el-button-->
<!--                >-->
<!--              </template>-->
<!--            </el-table-column>-->
          </el-table>
<!--          <el-dialog-->
<!--              title="详情"-->
<!--              v-model="dialogVisible"-->
<!--              width="75%">-->
<!--            <el-table-->
<!--                table-layout="fixed"-->
<!--                ref="multipleTableRef"-->
<!--                :data="messageData"-->
<!--                height="510px"-->
<!--                class="table tableMove"-->
<!--                fit-->
<!--                :row-style="{ height: '6.3vh' }"-->
<!--            >-->
<!--              <el-table-column-->
<!--                  label="序号"-->
<!--                  width="50"-->
<!--                  align="center"-->
<!--                  :formatter="changeIndex"-->
<!--              />-->
<!--              <el-table-column-->
<!--                  v-for="col in columns"-->
<!--                  :key="col.prop"-->
<!--                  :prop="col.prop"-->
<!--                  :label="col.label"-->
<!--                  :align="col.align"-->
<!--                  :width="col.width"-->
<!--                  :formatter="col.label === '震级' ? formatMagnitude : undefined"-->
<!--              />-->
<!--              />-->
<!--            </el-table>-->
<!--            <span slot="footer" class="dialog-footer2">-->
<!--              <el-button @click="dialogVisible = false">取 消</el-button>-->
<!--              <el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
<!--            </span>-->
<!--          </el-dialog>-->
        </div>

      </div>
    </div>
    <div class="paging-block">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>

import upLoad from "@/components/LoadingMask/upLoad.vue";
import loadingMask from "@/components/LoadingMask/index.vue";
import WebSocketReconnect from "@/api/websocket";
import {getToken} from "@/utils/auth";
import useUserStore from "@/store/modules/user.js";
import {getExcelUploadByTime, getField} from "@/api/system/excel.js";
import {ElMessage} from "element-plus";
import {ref} from "vue";
import {getExcelUploadEarthquake} from "@/api/system/eqlist.js";
import * as XLSX from 'xlsx';


export default {
  name: "index",
  components: {loadingMask, upLoad},
  setup() {
    const userStore = useUserStore();
    const name = ref(userStore.name);
    const filename = ref('');
    const uploadUrl = ref(``);
    const websocket = ref(null);
    return {
      name,
      uploadUrl,
      filename,
      websocket,
    }
  },
  data() {
    return {
      uploadFileName:'',
      headers: {
        Authorization: "Bearer " + getToken()
      },
      form: {
        tableName: ''
      },
      form1: {
        tableName1: '',
        eqId:''
      },
      eqlists: [],//地震文件列表
      tableNameOptions: [],
      tableNameOptions1: [],
      timeOptions: [
        {
          value: '今日',
        }, {
          value: '近七天'
        }, {
          value: '近一个月'
        }, {
          value: '近三个月'
        }, {
          value: '近一年'
        }
      ],
      fileList: [],
      tableData: [],
      messageData: [],
      percent: 0,
      importDialogVisible: false,
      formDialogVisible: false,
      dialogVisible: false,
      progressColor: '#001ce1',
      inputValue: '',
      columns: [],
      inputValueParams: '',
      addCount: 0,
      timeValue: '今日',
      updateCount: 0,
      isLoading: false,
      isLoadingMask: false,
      uploadedFile: null,
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      currentPage: 1,
    }
  },
  mounted() {
    this.getTableName()
    this.getExcelUploadByTimeButton()
    this.getEarthquake()
  },
  computed: {
    // 计算当前页的数据
    paginatedTableData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  methods: {
    // 打开上传文件弹窗
    openUpload() {
      this.importDialogVisible = true;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.raw;
      if (file) {
        this.selectedFile = file;
      }
    },
    confirmUpload() {
      this.importDialogVisible = false;
      if (this.selectedFile) {
        const fileUpload = this.$refs.fileUpload;
        fileUpload.uploadFiles = [this.selectedFile]; // 将文件添加到 el-upload 组件
        fileUpload.submit(); // 提交文件上传
      } else {
        this.triggerFileInput();// 如果没有文件，触发文件选择
      }
    },
    resetFileInput() {
      this.selectedFile = null;
      this.$refs.fileInput.value = ''; // 重置文件输入框
    },
    typeIndex(row, column, cellValue, index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },
    searchDataButton(event) {
      event.stopPropagation(); // 阻止事件传播
      this.inputValueParams = this.inputValue.trim()
      this.currentPage = 1
      this.getExcelUploadByTimeButton()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1;// 重置到第一页
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    formatMessageTableName(row, column, cellValue) {
      // 正则表达式匹配第二个双引号中的内容
      const matches = cellValue.match(/"([^"]*?)"/g);
      // 返回第二个匹配项，即表名
      return matches && matches.length >= 2 ? matches[1].replace(/"/g, '') : ''; // 去掉双引号
    },

    //添加数据数量
    formatMessageAdd(row, column, cellValue) {
      if (JSON.parse(cellValue).msg === "操作成功") {
        const length = JSON.parse(cellValue).data.length;
        return length;
      } else {
        return 0;
      }
    },
    //更新数据数量
    formatMessageUpdate(row, column, cellValue) {
      if (JSON.parse(cellValue).msg === "操作成功") {
        return JSON.parse(cellValue).msg;
      } else {
        return "操作失败";
      }
    },
    //随时间变化查询,用于日志查询
    getExcelUploadByTimeButton() {
      getExcelUploadByTime({
        "time": this.timeValue,
        "requestParams": this.inputValueParams,
        "username":this.name
      }).then((res) => {
        this.tableData = res.data
        console.log(res.data)
        this.total = res.data.length
        this.addCount = res.data.reduce((total, log) => {
          const data = JSON.parse(log.jsonResult);
          if (data.msg === "操作成功") {
            return total + data.data.length;
          }
          return total;
        }, 0);

      })
    },
    // 下载上传的Excel
    downExcel(event) {
      event.stopPropagation(); // 阻止事件传播
      if (this.uploadedFile) {
        // 创建一个 URL 对象，用于将文件提供给用户下载
        const url = URL.createObjectURL(this.uploadedFile);
        // 创建一个新的 <a> 元素，设置其 href 属性为文件的 URL，并模拟点击
        const link = document.createElement('a');
        link.href = url;
        link.download = this.uploadedFile.name;
        link.click();
        // 释放 URL 对象
        URL.revokeObjectURL(url);
      } else {
        // 如果没有上传文件，则提示用户上传文件
        this.$message({
          type: 'error',
          message: '请先上传 Excel 文件！'
        });
      }
    },
    //显示表单
    downloadForm() {
      this.formDialogVisible = true
    },
    //获取地震列表
    getEarthquake() {
      getExcelUploadEarthquake().then(res => {
        this.eqlists = res

        if (res.data === null) {
          ElMessage.error("地震列表无数据")
        }
        this.tableNameOptions1 = this.eqlists.map(eq => {
          const eqid = eq.split(' - ')[0]?.trim();
          const details = eq.split(' - ')[1]?.trim();
          // 提取 `-` 后面的部分
          return {
            label: details, // 使用提取的部分作为标签
            value: eqid// 选择值为 ID
          };
        });
        this.form1.tableName1 = this.tableNameOptions1[0].value;
      })
    },
    //查询user对应上的表
    getTableName() {
      getField().then(res => {
        this.files = res.data
        console.log(res.data)
        if (res.data === null) {
          ElMessage.error("该用户无导表权限")
        }
        this.tableNameOptions = this.files.map(file => ({
          label: file.fileName,
          value: file.fileName
        }));
        this.form.tableName = this.tableNameOptions[0].label
      })
    },
    checkFileExists(filePath, callback) {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', filePath, true);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 文件存在
          callback(true);
        } else {
          // 文件不存在
          callback(false);
        }
      };
      xhr.onerror = function () {
        // 网络错误
        callback(false);
      };
      xhr.send();
    },
    downloadFile(event) {
      event.stopPropagation(); // 阻止事件传播

      // 获取表单提交的值
      const tableName = this.form.tableName;

      // 假设所有的文件都存储在 `static` 文件夹中，并且文件名格式为 "表单名称.xlsx"
      const fileName = `${tableName}.xlsx`;

      // 生成文件的完整路径
      const filePath = `/static/${fileName}`;

      this.checkFileExists(filePath, (exists) => {
        if (exists) {
          // 文件存在，创建一个 <a> 元素，设置其 href 属性为文件的路径，并模拟点击下载
          let a = document.createElement('a');
          a.href = filePath;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          // 文件不存在，显示提示
          this.$message({
            type: 'error',
            message: '文件不存在，请检查文件名或联系管理员！'
          });
        }
        this.formDialogVisible = false; // 关闭对话框
      });
    },
    // 上传时验证是否为Excel文件
    beforeAvatarUpload(file) {
      // 从对象数组中提取表名,拿到该用户所有表名
      const validTableNames = this.tableNameOptions.map(option => option.label);
      const type = file.name.split('.')[1];
      // 获取不带扩展名的文件名
      const fileNameWithoutExtension = file.name.slice(0, -(type.length + 1));
      this.filename = fileNameWithoutExtension;
      this.uploadUrl = `http://localhost:8080/excel/importExcel/${this.name}&${this.filename}&${this.form1.tableName1}`;
      const isExcel = (type === "xlsx") || (type === 'xls');
      if (!isExcel) {
        this.$message({
          type: 'error',
          message: '附件格式错误，请重新上传xlsx或xls文件！'
        });
        return false;
      }

      // 解析 Excel 文件，读取第一行数据
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const firstRow = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0]; // 获取第一行数据
        console.log("Excel 第一行数据: ", firstRow);
        this.uploadFileName = firstRow; // 设置上传文件名
        // this.uploadUrl = `http://localhost:8080/excel/importExcel/${this.name}&${this.uploadFileName}&${this.form1.tableName1}`;

        // 对比第一行数据中的第一个单元格是否与表名列表一致
        if (!firstRow && fileNameWithoutExtension.includes(firstRow)) {
          // 表名不匹配，提示错误
          this.$message({
                type: 'error',
                message: `文件的第一行数据与表名不匹配，请检查文件内容！`
              }
          );
          setTimeout( ()=> {
            this.importDialogVisible =false
          },2000)
        } else {
          // 执行上传操作或其他逻辑
          this.isLoading = true;
          if ('WebSocket' in window) {
            this.websocket = new WebSocketReconnect('ws://localhost:8080' + '/WebSocketServerExcel/' + this.name);
          } else {
            alert('该浏览器不支持 WebSocket');
          }
          this.websocket.socket.onmessage = (event) => {
            if (Number.parseInt(event.data)) {
              this.percent = Number.parseInt(event.data);
            }
          };
          this.uploadedFile = file;
        }
      };
      reader.readAsBinaryString(file); //开始读取文件内容
      return isExcel;
    },
    // 上传成功弹窗展示上传结果
    handleSuccess(res, file, fileList) {
      this.isLoading = false
      if (res.code === 500 || res.msg === "上传失败，请检查文件格式"||res.msg === '操作失败') {
        this.$alert('请参考下载模版样式！', '上传失败', {
          confirmButtonText: '确定',
          callback: action => {
            this.getExcelUploadByTimeButton();
            this.importDialogVisible = false; // 关闭弹窗
          }
        });
      }else {
        const account = res.data.length
        // 获取Excel导入结果信息
        this.$alert("导入总数：" + account + " 成功数量：" + res.data.length, {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          callback: action => {
            this.getExcelUploadByTimeButton()
            this.importDialogVisible = false
          }
        });
        setTimeout(()=>{
          this.percent = 0
          this.websocket.close(); // 关闭WebSocket连接
          // 关闭websocket连接
        },500)
      }
    }
  },


}
</script>

<style scoped>
/*分页*/
.paging-block {
  width: 40%;
  margin: 0 auto;
  text-align: center;
  line-height: 40px;
}

/*日志*/
.grid-content {
  padding: 9px;
  min-height: 36px;
  background-color: #b7c8da;
}


.contentsBox {
  margin: 4px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.54);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.91);
  padding-bottom: 5px;
}


.dataBox {
  background-color: rgba(255, 255, 255, 0.73);
}

.dataManage {
  height: 50px;
  line-height: 50px;
  background-color: #bfcbd9;
  align-items: center;
  display: flex;
}

.dataContainer {
  background-color: #ffffff;
  max-width: 100%;
  overflow-y: auto;
  border-radius: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: left;
  gap: 10px; /* 按钮间距 */
  margin-top: 20px; /* 调整顶部外边距以保持对话框内容的间距 */
  margin-left: 160px;
}

.dialog-footer1 {
  display: flex;
  justify-content: left;
  gap: 10px; /* 按钮间距 */
  margin-top: 20px; /* 调整顶部外边距以保持对话框内容的间距 */
  margin-left: 160px;
}

.dialog-footer2 {
  display: flex;
  justify-content: left;
  gap: 10px; /* 按钮间距 */
  margin-top: 20px; /* 调整顶部外边距以保持对话框内容的间距 */
  /*margin-left: 290px;*/
}

/*table样式*/
.tableStyle {
  height: 70vh;
  position: relative;
  max-width: 100%;
  margin-bottom: 20px;
}
:deep(.el-dialog__body) {
  text-align: end;
}
:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 15%;
  position: relative;
  margin: 0 auto;
}

</style>

