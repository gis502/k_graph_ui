<template>
  <div class="app-container">
    <el-form-item label="遥感影像管理" >
      <el-input
          v-model="queryParams"
          placeholder="请输入遥感影像管理信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleEdit('新增')">新增</el-button>
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
    </el-form-item>

    <el-table :data="tableData" class="table-center" :stripe="true" :header-cell-style="tableHeaderColor"
              :cell-style="tableColor">
      <el-table-column label="序号" align="center" width="100">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="遥感影像名称" width="150" align="center"></el-table-column>
      <el-table-column prop="height" label="遥感影像高度（米）" width="200" align="center"></el-table-column>
      <el-table-column prop="createTime" label="添加时间" align="center" width="180"></el-table-column>
      <el-table-column prop="path" label="遥感影像路径" width="200" align="center"></el-table-column>
      <el-table-column prop="angle" label="旋转角度（度）" width="180" align="center"></el-table-column>
      <el-table-column prop="shootingTime" label="拍摄时间" align="center" width="180"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleOpen('浏览', scope.row)">浏览</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit('修改', scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页按钮-->
    <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    <!--新增 or 编辑 弹框-->
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30vw" >
      <el-form ref="form" :model="dialogContent" :rules="rules">

        <!-- 遥感影像名称 -->
        <el-form-item label="遥感影像名称" prop="name">
          <el-input
              v-model="dialogContent.name"
              placeholder="请输入内容"
          ></el-input>
        </el-form-item>


        <el-form-item label="遥感影像高度" prop="path">
          <el-input
              v-model="dialogContent.height"
              placeholder="请输入内容"
              type="number"
          ></el-input>
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-form-item>

        <!-- 拍摄时间 -->
        <el-form-item label="拍摄时间" prop="shootingTime">
          <el-date-picker
              v-model="dialogContent.shootingTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="遥感影像路径" prop="height">
          <el-input
              v-model="dialogContent.path"
              placeholder="请输入内容"
          ></el-input>
        </el-form-item>

        <!-- 旋转角度 -->
        <el-form-item label="旋转角度" prop="angle">
          <el-input v-model="dialogContent.angle" placeholder="请输入内容" type="number"></el-input>
        </el-form-item>

        <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="commit">确定</el-button>
    </span>
      </el-form>
    </el-dialog>

    <!--    筛选-->
    <el-dialog
        v-model="queryFormVisible"
        title="筛选"
        width="30vw"
        style="top:20vh"
    >
      <el-form :inline="true" :model="dialogContent" ref="formValue" :rules="rules" :show-close="false">
        <!-- 名称 -->
        <el-form-item label="遥感影像名称">
          <el-input v-model="dialogContent.modelName" style="width: 23vw;" placeholder="正射影像名称" clearable />
        </el-form-item>

        <el-form-item label="遥感影像高度" prop="modelHeight">
          <el-input
              type="number"
              v-model="dialogContent.modelHeight"
              style="width: 23vw;"
              placeholder="请输入高度"
              clearable
          />
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 23vw;"
          />
        </el-form-item>

        <!-- 拍摄时间 -->
        <el-form-item label="拍摄时间" prop="shootingTime">
          <el-date-picker
              v-model="dialogContent.shootingTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 23vw;"
          />
        </el-form-item>

        <!-- 路径 -->
        <el-form-item label="遥感影像路径" prop="modelPath">
          <el-input
              v-model="dialogContent.modelPath"
              style="width: 23vw;"
              placeholder="请输入正射影像路径"
              clearable
          />
        </el-form-item>

        <!-- 旋转角度 -->
        <el-form-item label="旋转角度" prop="rotationAngle">
          <el-input
              type="number"
              v-model="dialogContent.rotationAngle"
              style="width: 23vw;"
              placeholder="请输入旋转角度"
              clearable
          />
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="Cancel">取 消</el-button>
        <el-button type="primary" @click="onSubmit">筛 选</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  insert,
  update,
  removeById,
  queryRemoteSensingData,
  RemoteSensingFilterContent,
  list
} from '@/api/system/remotesensingimage.js';
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  name: "index",
  data() {
    return {
      filterContent: [],  // 筛选内容
      tableData: [],  //存储 新增 or 编辑 后端返回数据
      queryParams: '',  // 搜索框关键字
      queryFormVisible: false,
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        name: '',
        createTime: '',
        shootingTime:'',
        path: '',
        height: '',
        angle: '',
        uuid: ''
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        height: [
          { message: '高度必须是数字', trigger: 'blur', required: false }
        ],
        angle: [
          {  message: '角度必须是数字', trigger: 'blur', required: false }
        ]
      }

    }
  },
  created() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      list().then(res => {
        console.log("获取的数据:", res); // 打印获取的数据
        this.tableData = res.data.map((item) => {
          let formattedCreateTime = '';

          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('createTime') && item.createTime) {
            const createTime = new Date(item.createTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(createTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = createTime.getFullYear();
              const month = (createTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = createTime.getDate().toString().padStart(2, '0');
              const hours = createTime.getHours().toString().padStart(2, '0');
              const minutes = createTime.getMinutes().toString().padStart(2, '0');
              const seconds = createTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedCreateTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.createTime}`);
            }
          } else {
            console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }

        let formattedShootingTime = '';
          // 确保 shootingTime 存在且有效
          if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
            const shootingTime = new Date(item.shootingTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(shootingTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = shootingTime.getFullYear();
              const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = shootingTime.getDate().toString().padStart(2, '0');
              const hours = shootingTime.getHours().toString().padStart(2, '0');
              const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
              const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.shootingTime}`);
            }
          } else {
            console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }

          // 仅返回修改后的 createTime
          item.createTime = formattedCreateTime;

          item.shootingTime = formattedShootingTime;

          return item;
        });

        // 打印处理后的 tableData
        console.log("处理后的 tableData:", this.tableData);
      }).catch(error => {
        console.error("获取数据失败:", error);
      });
    },

    // 筛选
    onSubmit() {
      this.filterContent = {
        name: this.dialogContent.modelName || null,
        createTime: this.dialogContent.createTime,
        shootingTime: this.dialogContent.shootingTime,
        height: this.dialogContent.height || null,
        angle: this.dialogContent.rotationAngle || null,
        path: this.dialogContent.modelPath || null,
        uuid: this.dialogContent.uuid || null,
      };
      console.log("filterContent", this.filterContent);
      // 发送请求
      RemoteSensingFilterContent(this.filterContent).then(res => {
        console.log("RemoteSensingFilterContent", res); // 打印返回的响应
        // 假设 res.data 包含查询结果
        const data = res.data || [];
        this.total = res.total || data.length; // 确保获取总数，使用返回的分页信息（假设是 res.total）
        // 格式化数据并更新 tableData
        this.tableData = res.data.map((item) => {
          let formattedCreateTime = '';
          let formattedShootingTime = '';

          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('createTime') && item.createTime) {
            const createTime = new Date(item.createTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(createTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = createTime.getFullYear();
              const month = (createTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = createTime.getDate().toString().padStart(2, '0');
              const hours = createTime.getHours().toString().padStart(2, '0');
              const minutes = createTime.getMinutes().toString().padStart(2, '0');
              const seconds = createTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedCreateTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.createTime}`);
            }
          } else {
            console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }

          // 仅返回修改后的 createTime
          item.createTime = formattedCreateTime;

          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
            const shootingTime = new Date(item.shootingTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(shootingTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = shootingTime.getFullYear();
              const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = shootingTime.getDate().toString().padStart(2, '0');
              const hours = shootingTime.getHours().toString().padStart(2, '0');
              const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
              const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.shootingTime}`);
            }
          } else {
            console.log('没有 shootingTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }
          // 仅返回修改后的 createTime
          item.shootingTime = formattedShootingTime;

          return item;
        });
        // 如果需要分页，调用分页更新方法（如果分页逻辑依赖当前页面和每页数据）
        this.updateTableData();
        // 隐藏筛选表单
        this.queryFormVisible = false;
        // 清空表单字段
        this.clearFormValue();
      }).catch(error => {
        console.error("查询失败:", error);
      });
    },

    // 搜索框
    handleQuery() {
      const searchKey = this.queryParams.trim();  // 获取搜索关键字

      // 调用同一个方法进行查询
      queryRemoteSensingData(searchKey || '')
          .then(res => {

            // 假设 res.data.records 是查询的结果数据，res.data.total 是总记录数
            this.tableData = res.data.map((item, index) => {
              // 格式化 createTime
              let formattedCreateTime = '';
              // 确保 createTime 存在且有效
              if (item.hasOwnProperty('createTime') && item.createTime) {
                const createTime = new Date(item.createTime);

                // 确认解析后的 createTime 是否有效
                if (!isNaN(createTime)) {
                  // 格式化为 yyyy年MM月dd日 HH:mm:ss
                  const year = createTime.getFullYear();
                  const month = (createTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
                  const day = createTime.getDate().toString().padStart(2, '0');
                  const hours = createTime.getHours().toString().padStart(2, '0');
                  const minutes = createTime.getMinutes().toString().padStart(2, '0');
                  const seconds = createTime.getSeconds().toString().padStart(2, '0');

                  // 格式化为需要的格式
                  formattedCreateTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
                } else {
                  console.log(`无效的日期: ${item.createTime}`);
                }
              } else {
                console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
              }

              let formattedShootingTime = '';
              // 确保 createTime 存在且有效
              if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
                const shootingTime = new Date(item.shootingTime);

                // 确认解析后的 createTime 是否有效
                if (!isNaN(shootingTime)) {
                  // 格式化为 yyyy年MM月dd日 HH:mm:ss
                  const year = shootingTime.getFullYear();
                  const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
                  const day = shootingTime.getDate().toString().padStart(2, '0');
                  const hours = shootingTime.getHours().toString().padStart(2, '0');
                  const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
                  const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

                  // 格式化为需要的格式
                  formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
                } else {
                  console.log(`无效的日期: ${item.shootingTime}`);
                }
              } else {
                console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
              }

              return {
                serialNumber: (this.currentPage - 1) * this.pageSize + index + 1,  // 计算序号
                uuid: item.uuid,
                name: item.name,
                height: item.height,
                path: item.path,
                angle: item.angle,
                createTime: formattedCreateTime,  // 格式化日期
                shootingTime: formattedShootingTime,
              };
            });

            // 更新分页的总数
            this.total = res.data.total;  // 假设后端返回 total
          })
          .catch(error => {
            console.error("查询时出现错误:", error);
            ElMessage.error('查询失败，请稍后重试');
          });
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.fetchData();

    },

    getEmptyDialogContent() {
      return {
        name: '',
        createTime: '',
        shootingTime:'',
        path: '',
        height: '',
        angle: '',
        uuid: '',
      };
    },

    handleOpen(row) {
      console.log(row);
      window.open('/orthophotographViewer', "_blank");
    },

    handleEdit(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        this.dialogContent = {
          name: '',
          createTime: new Date().toISOString(),
          shootingTime: new Date().toISOString(),
          path: '',
          height: '',
          angle: '',
          uuid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          name: row.name,
          path: row.path,
          createTime: row.createTime,
          shootingTime: row.createTime,
          height: row.height,
          angle: row.angle,
          uuid: row.uuid
        };
      }

      this.dialogShow = true;
    },



    handleDelete(row) {
      ElMessageBox.confirm('确定要删除该条记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            removeById({ uuid: row.uuid })
                .then(() => {
                  this.fetchData();
                  ElMessage.success('删除成功');
                })
                .catch(() => {
                  ElMessage.error('删除失败，请重试');
                });
          })
          .catch(() => {
            ElMessage.info('删除操作已取消');
          });
    },
    // 新增 or 编辑 提交按钮
    commit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const modelData = {
            name: this.dialogContent.name,
            height: this.dialogContent.height,
            angle: this.dialogContent.angle,
            path: this.dialogContent.path,
            // 如果 createTime 是一个 Date 对象，转换为 ISO 字符串格式
            createTime: this.dialogContent.createTime,
            shootingTime: this.dialogContent.shootingTime,
            uuid: this.dialogContent.uuid,
          };

          const action = this.dialogTitle === '新增' ? insert : update;
          action(modelData).then(() => {
            this.fetchData();
            this.dialogShow = false;
            this.clearDialogContent();
            ElMessage.success(`${this.dialogTitle}成功`);
          }).catch(() => {
            ElMessage.error(`${this.dialogTitle}失败，请重试`);
          });
        } else {
          ElMessage.error('表单验证失败，请检查输入');
          return false;
        }
      });
    },
    // 筛选弹框显示
    openQueryForm() {
      this.queryFormVisible = true;
      this.dialogContent = {
        name: '',
        createTime: '',
        path: '',
        height: '',
        angle: '',
        uuid: '',
        shootingTime: ''
      };
    },
    // 新增弹框关闭
    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
    },

    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },
    // 关闭dialog对话框 筛选
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },

    clearDialogContent() {
      this.dialogContent = this.getEmptyDialogContent();
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchData();
    },

    getPageArr() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.tableData.slice(start, start + this.pageSize);
    },

    tableHeaderColor() {
      return {
        'font-size': '16px'
      };
    },

    tableColor({ rowIndex }) {
      return {
        'padding-top': '10px',
        'padding-bottom': '10px',
        'text-align': 'center',
        'font-size': '16px',
      };
    },
  },
}
</script>


<style scoped>
.table-center .el-table__cell {
  text-align: center;
}

.pagination {
  justify-content: center;
  margin-top: 20px;
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
