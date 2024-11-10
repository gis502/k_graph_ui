<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain size="mini" @click="handleOpen('新增')">新增</el-button>
      </el-col>
    </el-row>
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


    <el-dialog
        :title="dialogTitle"
        v-model="dialogShow"
        width="30%"
        :show-close="false"
        ref="ruleFormRef">
      <el-form :model="dialogContent" :rules="rules" ref="formRef">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="dialogContent.modelName" placeholder="请输入模型名称"></el-input>
        </el-form-item>
        <el-form-item label="模型大小" prop="modelSize">
          <el-input type="number" v-model="dialogContent.modelSize" placeholder="请输入模型大小"></el-input>
        </el-form-item>

        <el-form-item label="添加时间" prop="addTime">
          <el-date-picker
              v-model="dialogContent.addTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="x"
              size="large" />
        </el-form-item>
        <el-form-item label="模型路径" prop="modelPath">
          <el-input v-model="dialogContent.modelPath" placeholder="请输入模型路径"></el-input>
        </el-form-item>
        <el-form-item label="模型高度" prop="modelHeight">
          <el-input v-model="dialogContent.modelHeight" placeholder="请输入模型高度"></el-input>
        </el-form-item>
        <el-form-item label="旋转角度" prop="rotationAngle">
          <el-input v-model="dialogContent.rotationAngle" placeholder="请输入旋转角度"></el-input>
        </el-form-item>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="commit" :disabled="isSubmitting">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { ElButton, ElIcon, ElForm, ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";
import { addModel, deleteModel, getModelData, getModelTotalData, updataModel } from "@/api/system/tiltPhotography.js";

export default {
  name: "index",
  components: { Delete, ElButton, Edit, ElIcon, ElForm },
  data() {
    return {
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        serialNumber: '',
        modelName: '',
        modelSize: '',
        addTime: new Date().getTime(), // 使用时间戳
        modelPath: '',
        modelHeight: '',
        rotationAngle: '',
        modelid: ''
      },
      rules: {
        modelName: [
          { required: true, message: '请填写模型名称', trigger: 'blur' }
        ],
        modelSize: [
          { required: true, message: '请填写模型大小', trigger: 'blur' }
        ],
        addTime: [
          { required: true, message: '请选择添加时间', trigger: 'blur' }
        ],
        modelPath: [
          { required: true, message: '请填写模型路径', trigger: 'blur' }
        ],
        modelHeight: [
          { required: true, message: '请填写模型高度', trigger: 'blur' }
        ],
        rotationAngle: [
          { required: true, message: '请填写旋转角度', trigger: 'blur' }
        ],
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
        this.tableData = res.map((item, index) => ({
          serialNumber: index + 1,
          modelid: item.uuid, // 保持一致
          modelName: item.name,
          modelPath: item.path,
          addTime: new Date(item.time).toISOString().slice(0, 19).replace('T', ' '),
          modelSize: item.modelSize, // 确保使用正确的字段名
          modelHeight: item.rze,
          rotationAngle: item.tze
        }));
      }).catch(error => {
        console.error("获取数据失败:", error);
      });
    },

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
                  this.fetchTotalCount();
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

    handleOpen(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        this.dialogContent = {
          modelName: '',
          modelSize: '',
          addTime: new Date().getTime(),
          modelPath: '',
          modelHeight: '',
          rotationAngle: '',
          modelid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          modelName: row.modelName,
          modelSize: row.modelSize,
          addTime: new Date(row.addTime).getTime(), // 保持为时间戳格式
          modelPath: row.modelPath,
          modelHeight: row.modelHeight,
          rotationAngle: row.rotationAngle,
          modelid: row.modelid
        };
      }

      this.dialogShow = true;
    },

    commit() {
      const modelData = {
        name: this.dialogContent.modelName,
        modelSize: this.dialogContent.modelSize,
        path: this.dialogContent.modelPath,
        rz: 0, // 假设这里是0
        tz: -557, // 假设这里是0
        rze: this.dialogContent.rotationAngle,
        tze: this.dialogContent.modelHeight,
        time: new Date(this.dialogContent.addTime).toISOString().slice(0, 19).replace('T', ' '), // 转换为字符串格式
        uuid: this.dialogContent.modelid,
      };
      console.log("提交的模型大小:", modelData); // 调试输出

      if (this.dialogTitle === "新增") {
        addModel(modelData)
            .then(() => {
              this.fetchModelData();
              this.fetchTotalCount();
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
              this.fetchTotalCount();
              this.dialogShow = false;
              this.clearDialogContent();
              ElMessage.success('编辑已完成');    // 提示编辑完成
            })
            .catch(error => {
              console.error("更新模型失败:", error);
            });
      }
    },

    clearDialogContent() {
      this.dialogContent = {
        modelName: '',
        modelSize: '',
        addTime: new Date().getTime(),
        modelPath: '',
        modelHeight: '',
        rotationAngle: '',
        modelid: ''
      };
    },

    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchModelData();
    },

    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchModelData();
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
