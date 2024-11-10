<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain size="mini" @click="handleEdit('新增')">新增</el-button>
      </el-col>
    </el-row>

    <el-table :data="tableData" class="table-center" :stripe="true" :header-cell-style="tableHeaderColor"
              :cell-style="tableColor">
      <el-table-column label="序号" align="center" width="100">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="正射影像名称" width="150" align="center"></el-table-column>
      <el-table-column prop="height" label="正射影像高度" width="200" align="center"></el-table-column>
      <el-table-column prop="createTime" label="添加时间" align="center" width="180"></el-table-column>
      <el-table-column prop="path" label="正射影像路径" width="200" align="center"></el-table-column>
      <el-table-column prop="angle" label="旋转角度" width="180" align="center"></el-table-column>
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

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%" :show-close="false">
      <el-row :gutter="20">
        <el-col :span="6" class="align-right">正射影像名称：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.name" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt10">
        <el-col :span="6" class="align-right">添加时间：</el-col>
        <el-col :span="18">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="x"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt10">
        <el-col :span="6" class="align-right">正射影像路径：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.path" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt10">
        <el-col :span="6" class="align-right">正射影像高度：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.height" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt10">
        <el-col :span="6" class="align-right">旋转角度：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.angle" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="commit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { list, insert, update, removeById } from '@/api/system/orthophotoImage.js';
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "index",
  data() {
    return {
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        name: '',
        createTime: new Date().getTime(), // Current timestamp
        path: '',
        height: '',
        angle: '',
        uuid: ''
      },
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      list().then(res => {
        console.log("查询后端返回的数据:", res.data);
        this.tableData = res.data.map((item, index) => ({
          serialNumber: index + 1,
          uuid: item.uuid,
          name: item.name,
          path: item.path,
          createTime: this.formatDate(item.createTime),  // 格式化日期
          height: item.height,
          angle: item.angle,
        }));
        this.total = res.data.total || 0;
      }).catch((error) => {
        ElMessage.error('数据加载失败，请稍后重试');
      });
    },

// 用来解析日期的函数

    formatDate(dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date)) {
        return dateStr;  // 如果是无效的日期格式，直接返回原始字符串
      }
      return date.toISOString().slice(0, 19).replace('T', ' ');  // 转换为 'yyyy-MM-dd HH:mm:ss'
    },

    getEmptyDialogContent() {
      return {
        name: '',
        createTime: new Date().getTime(), // Current timestamp
        path: '',
        height: '',
        angle: '',
        uuid: ''
      };
    },

    handleEdit(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        this.dialogContent = this.getEmptyDialogContent();
      } else if (title === "修改") {
        this.dialogContent = {
          name: row.name,
          path: row.path,
          createTime: new Date(row.createTime).getTime(), // Ensure it's in timestamp format
          height: row.height,
          angle: row.angle,
          uuid: row.uuid
        };
      }

      this.dialogShow = true;
    },

    handleOpen(title, row) {
      this.handleEdit(title, row);
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

    commit() {
      const modelData = {
        name: this.dialogContent.name,
        path: this.dialogContent.path,
        height: this.dialogContent.height,
        angle: this.dialogContent.angle,
        createTime: new Date(this.dialogContent.createTime).toISOString().slice(0, 19).replace('T', ' '),
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
    },

    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
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
