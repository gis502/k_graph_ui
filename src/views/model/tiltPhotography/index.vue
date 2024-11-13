<template>
  <div class="app-container">

    <el-form-item label="倾斜摄影管理信息" >
      <el-input
          v-model="queryParams"
          placeholder="请输入倾斜摄影管理信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
    </el-form-item>

    <el-table :data="getPageArr()" class="table-center" :stripe="true" :header-cell-style="tableHeaderColor"
              :cell-style="tableColor">
      <el-table-column prop="serialNumber" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="modelName" label="模型名称" width="200" align="center"></el-table-column>
      <el-table-column prop="modelSize" label="模型大小(GB)" width="150" align="center"></el-table-column>
      <el-table-column prop="addTime" label="添加时间" align="center" width="180"></el-table-column>
      <el-table-column prop="modelPath" label="模型路径" width="250" align="center"></el-table-column>
      <el-table-column prop="modelHeight" label="模型中心高度(米)" align="center"></el-table-column>
      <el-table-column prop="rotationAngle" label="旋转角度(度)" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="handleOpen('修改', scope.row)">
            <el-icon><Edit /></el-icon> 修改
          </el-button>
          <el-button size="mini" type="text" @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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

<!--新增 编辑 弹框-->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogShow"
        width="30vw"
        style="top:20vh"
        >
      <el-form :model="dialogContent" :rules="rules" ref="formRef">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="dialogContent.modelName" placeholder="请输入模型名称"></el-input>
        </el-form-item>
        <el-form-item label="模型大小" prop="modelSize">
          <el-input
              type="number"
              v-model="dialogContent.modelSize"
              placeholder="请输入模型大小(GB)"
          ></el-input>
        </el-form-item>

        <el-form-item label="添加时间" prop="addTime">
          <el-date-picker
              v-model="dialogContent.addTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large" />
        </el-form-item>
        <el-form-item label="模型路径" prop="modelPath">
          <el-input v-model="dialogContent.modelPath" placeholder="请输入模型路径"></el-input>
        </el-form-item>
        <el-form-item label="模型中心高度(米)" prop="modelHeight">
          <el-input v-model="dialogContent.modelHeight" placeholder="请输入模型高度"></el-input>
        </el-form-item>
        <el-form-item label="旋转角度(度)" prop="rotationAngle">
          <el-input v-model="dialogContent.rotationAngle" placeholder="请输入旋转角度"></el-input>
        </el-form-item>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="commit">确 定</el-button>
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
      <el-form :inline="true" :model="dialogContent" ref="formValue">

        <!-- 模型名称 -->
        <el-form-item label="模型名称">
          <el-input v-model="dialogContent.modelName" style="width: 23vw;" placeholder="模型名称" clearable/>
        </el-form-item>

        <!-- 模型大小 -->
        <el-form-item label="模型大小" prop="modelHeight">
          <el-input
              type="number"
              v-model="dialogContent.modelSize"
              style="width: 23vw;"
              placeholder="请输入模型大小"
              clearable
          />
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="addTime">
          <el-date-picker
              v-model="dialogContent.addTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              clearable
          />
        </el-form-item>

        <!-- 模型路径 -->
        <el-form-item label="模型路径" prop="modelPath">
          <el-input
              v-model="dialogContent.modelPath"
              style="width: 23vw;"
              placeholder="请输入模型路径"
              clearable
          />
        </el-form-item>

        <el-form-item label="模型中心高(米)" prop="modelSize">
          <el-input
              type="number"
              v-model="dialogContent.modelHeight"
              style="width: 23vw;"
              placeholder="请输入正摄影像高度"
              clearable
          />
        </el-form-item>

        <!-- 旋转角度 -->
        <el-form-item label="旋转角度(度)" prop="rotationAngle">
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
import { ElButton, ElIcon, ElForm, ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";
import {
  addModel,
  deleteModel, getModelData, getModelTotalData, ObliqueImageryFilterContent,
  queryObliqueImageryData,
  updataModel
} from "@/api/system/tiltPhotography.js";
import {fromEq} from "@/api/system/eqlist.js";

export default {
  name: "index",
  components: { Delete, ElButton, Edit, ElIcon, ElForm },
  data() {
    return {
      filterContent: [], //筛选内容
      tableData: [],     //存储 新增 or 编辑 or 筛选后端返回数据
      queryParams: '',  //搜索框关键字
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      dialogShow: false,
      dialogTitle: null,
      // 新增 编辑 筛选 向后端传的内容
      dialogContent: {
        serialNumber: '',
        modelName: '',
        modelSize: '',
        addTime: '',
        modelPath: '',
        modelHeight: '',
        rotationAngle: '',
        modelid: ''
      },
      queryFormVisible: false,
      rules: {
        modelName: [
          { required: true, message: '请填写模型名称', trigger: 'blur' }
        ],
        modelSize: [
          { message: '请填写模型大小', trigger: 'blur' ,required: false }
        ],
        addModel: [
          { message: '请填写添加时间', trigger: 'blur',required: false  }
        ],
        modelPath: [
          { message: '请填写模型路径', trigger: 'blur' ,required: false }
        ],
        modelHeight: [
          { message: '请填写模型高度', trigger: 'blur' ,required: false }
        ],
        rotationAngle: [
          {  message: '请填写旋转角度', trigger: 'blur' ,required: false }
        ]
      },
    };
  },

  created() {
    this.fetchModelData();
    this.fetchTotalCount(); // 获取总数
  },

  methods: {
    fetchTotalCount() {
      getModelTotalData().then(res => {
        this.total = res;
      });
    },
    fetchModelData() {
      getModelData().then(res => {
        console.log("获取的数据:", res); // 打印获取的数据
        this.tableData = res.map((item, index) => {
          // 打印当前项，检查 time 是否存在
          console.log("当前项:", item); // 打印整个 item，查看是否包含 time 字段
          console.log("当前项的 time:", item.time); // 打印 time 字段

          let formattedAddTime = '';

          // 确保 time 存在且有效
          if (item.hasOwnProperty('time') && item.time) {
            const addTime = new Date(item.time);
            // 确认解析后的 addTime 是否有效
            if (!isNaN(addTime)) {
              // 格式化为 yyyy-MM-dd HH:mm:ss
              formattedAddTime = addTime.toISOString().replace('T', ' ').substring(0, 19);
            } else {
              console.log(`无效的日期: ${item.time}`);
            }
          } else {
            console.log("没有 time 或其值为空:", item); // 如果没有 time 或为空，输出提示
          }

          // 返回处理后的数据对象
          return {
            serialNumber: index + 1,
            modelid: item.uuid,
            modelName: item.name,
            modelPath: item.path,
            addTime: formattedAddTime, // 使用处理后的 addTime
            modelSize: item.modelSize,
            modelHeight: item.rze,
            rotationAngle: item.tze
          };
        });

        // 打印处理后的 tableData
        console.log("处理后的 tableData:", this.tableData);
      }).catch(error => {
        console.error("获取数据失败:", error);
      });


    },
    // 筛选
    onSubmit() {
      // 如果 addTime 存在，转换为 ISO 8601 格式的字符串；如果为空，设置为 null
      const addTimeIso = this.dialogContent.addTime ? new Date(this.dialogContent.addTime).toISOString() : null;

      this.filterContent = {
        modelName: this.dialogContent.modelName || null,
        addTime: addTimeIso,  // 将 addTime 转换为 ISO 8601 格式的字符串或 null
        modelHeight: this.dialogContent.modelHeight || null,
        rotationAngle: this.dialogContent.rotationAngle || null,
        modelPath: this.dialogContent.modelPath || null,
        modelSize: this.dialogContent.modelSize || null
      };

      console.log("filterContent", this.filterContent); // 打印 filterContent

      // 发送请求
      ObliqueImageryFilterContent(this.filterContent).then(res => {
        console.log("ObliqueImageryFilterContent", res);

        // 格式化返回的结果，生成表格数据
        this.tableData = res.data.map((item, index) => {
          let formattedAddTime = '';

          // 格式化 addTime 为 yyyy-MM-dd HH:mm:ss 格式
          if (item.time) {
            const addTime = new Date(item.time); // 将 time 转为 Date 对象
            formattedAddTime = addTime.toISOString().replace('T', ' ').substring(0, 19); // 格式化为 yyyy-MM-dd HH:mm:ss
          }

          return {
            serialNumber: (this.currentPage - 1) * this.pageSize + index + 1,  // 计算序号
            modelid: item.uuid,  // 保持一致
            modelName: item.name,
            modelPath: item.path,
            addTime: formattedAddTime,  // 使用格式化后的时间
            modelSize: item.modelSize,  // 确保使用正确的字段名
            modelHeight: item.rze,
            rotationAngle: item.tze,
          };
        });

        // 更新表格数据和总数
        this.total = res.total;  // 总记录数
        this.tableData = this.getPageArr();  // 获取当前页面数据

        // 隐藏筛选表单
        this.queryFormVisible = false;

        // 清空表单字段
        this.clearFormValue();

        this.fetchModelData();
        this.fetchTotalCount(); // 获取总数

      }).catch(error => {
        console.error("查询失败:", error);
      });
    },

    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },

    // 关闭dialog对话框
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },

    // 搜索框查询
    handleQuery() {
      const searchKey = this.queryParams.trim();  // 获取搜索关键字

      // 调用同一个方法进行查询
      queryObliqueImageryData(searchKey || '')
          .then(res => {
            console.log("获取的数据:", res); // 打印获取的数据

            // 假设 res.data.records 是查询的结果数据，res.data.total 是总记录数
            this.tableData = res.data.map((item, index) => ({
              serialNumber: (this.currentPage - 1) * this.pageSize + index + 1,  // 计算序号
              modelid: item.uuid, // 保持一致
              modelName: item.name,
              modelPath: item.path,
              addTime: item.time,  // 格式化日期
              modelSize: item.modelSize, // 确保使用正确的字段名
              modelHeight: item.rze,
              rotationAngle: item.tze,
            }));

            // 更新分页的总数
            this.total = res.total;  // 假设后端返回 total
          })
          .catch(error => {
            console.error("查询时出现错误:", error);
            ElMessage.error('查询失败，请稍后重试');
          });
    },

    // 删除
    handleDelete(row) {
      ElMessageBox.confirm('确定要删除该条记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            console.log('准备删除的 UUID:', row.modelid);
            deleteModel(row.modelid)
                .then(response => {
                  console.log('响应:', response); // 打印响应
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  ElMessage.success('删除成功');
                })
                .catch((error) => {
                  console.error('删除请求出错:', error);
                  ElMessage.error('删除失败，请重试');
                });
          })
          .catch(() => {
            ElMessage.info('删除操作已取消');
          });
    },

    // 打开 新增or编辑 弹框
    handleOpen(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        // 初始化为空，addTime 设置为当前时间的 ISO 8601 格式
        this.dialogContent = {
          modelName: '',
          modelSize: '',
          addTime: new Date().toISOString(),  // 当前时间的 ISO 格式
          modelPath: '',
          modelHeight: '',
          rotationAngle: '',
          modelid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          modelName: row.modelName,
          modelSize: row.modelSize,
          // 将数据库返回的时间戳（或时间字符串）转为 ISO 8601 格式的字符串
          addTime: new Date(row.addTime).toISOString(),  // 转换为 ISO 格式字符串
          modelPath: row.modelPath,
          modelHeight: row.modelHeight,
          rotationAngle: row.rotationAngle,
          modelid: row.modelid
        };
      }

      this.dialogShow = true;
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.queryObliqueImageryData();
    },

    // 新增 or 编辑 提交按钮
    commit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          // 将 dialogContent.addTime 转换为 ISO 8601 格式的字符串
          const addTimeIso = this.dialogContent.addTime ? new Date(this.dialogContent.addTime).toISOString() : null;

          const modelData = {
            name: this.dialogContent.modelName,
            modelSize: this.dialogContent.modelSize,
            path: this.dialogContent.modelPath,
            rz: 0, // 假设这里是0
            tz: -557, // 假设这里是-557
            rze: this.dialogContent.rotationAngle,
            tze: this.dialogContent.modelHeight,
            time: addTimeIso, // 传递 ISO 8601 格式的字符串
            uuid: this.dialogContent.modelid,
          };
          console.log("提交的模型大小:", modelData); // 调试输出

          if (this.dialogTitle === "新增") {
            addModel(modelData)
                .then(() => {
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  this.dialogShow = false;
                  this.clearDialogContent();
                  ElMessage.success('新增已完成');
                })
                .catch(error => {
                  console.error("新增模型失败:", error);
                });
          } else {
            updataModel(modelData)
                .then(() => {
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  this.dialogShow = false;
                  this.clearDialogContent();
                  ElMessage.success('编辑已完成');    // 提示编辑完成
                })
                .catch(error => {
                  console.error("更新模型失败:", error);
                });
          }
        }
      })
    },

    // 筛选弹框 打开
    openQueryForm() {
      this.queryFormVisible = true;
      // 重置dialog内容，确保每次打开时内容是清空的
      this.dialogContent = {
        modelName: '',
        modelSize: '',
        addTime: '',  // 确保时间为空
        modelPath: '',
        modelHeight: '',
        rotationAngle: '',
        modelid: ''
      };
    },

    clearDialogContent() {
      this.dialogContent = {
        modelName: '',
        modelSize: '',
        addTime: '',
        modelPath: '',
        modelHeight: '',
        rotationAngle: '',
        modelid: ''
      };
    },

    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.queryObliqueImageryData();
    },

    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.queryObliqueImageryData();
    },

    getPageArr() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.tableData.slice(start, start + this.pageSize);
    },

    cancel() {
      this.dialogShow = false;
    }
  },
};
</script>

<style scoped>
.table-center {
  text-align: center;
}
.mb8 {
  margin-bottom: 8px;
}
.pagination {
  justify-content: center; /* 水平居中 */
  margin-top: 20px;
}
</style>
