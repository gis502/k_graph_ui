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
      <el-table-column prop="name" label="正射影像名称" width="250" align="center"></el-table-column>
      <el-table-column prop="height" label="正射影像高度" width="200" align="center"></el-table-column>
      <el-table-column prop="createTime" label="添加时间" align="center" width="180"></el-table-column>
      <el-table-column prop="path" label="正射影像路径" width="200" align="center"></el-table-column>
      <el-table-column prop="angle" label="旋转角度" width="180" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleOpen(scope.row)">浏览</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit('修改', scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
              style="width: 100%;">
          </el-date-picker>
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
        createTime: new Date().getTime(), // 初始化为当前时间戳
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
      list().then(response => {
        console.log("查询后端返回的数据:", response.data);
        this.tableData = response.data; // 根据后端返回的数据结构调整
        this.total = response.data.total;   // 获取总数
      });
    },
    formatDate(dateString) {
      if (!dateString) return ''; // 处理空值
      const date = new Date(dateString);
      return date.toLocaleString(); // 以本地时间格式显示
    },
    handleDelete(row) {
      removeById({ uuid: row.uuid }).then(() => {
        this.fetchData();
      });
    },
    handleOpen(row) {
      console.log(row);
      window.open('/orthophotographViewer', "_blank");
    },
    handleEdit(title, row) {
      console.log('按钮被点击了', title, row);
      this.dialogShow = true;
      if (title === "新增") {
        this.dialogTitle = title;
        this.dialogContent = {
          name: '',
          createTime: new Date().getTime(), // 初始化为当前时间戳
          path: '',
          height: '',
          angle: '',
          uuid: ''
        };
      } else {
        this.dialogTitle = title;
        this.dialogContent = { ...row };
        // 如果后端传过来的createTime是ISO字符串，则转换为时间戳
        if (this.dialogContent.createTime) {
          this.dialogContent.createTime = new Date(this.dialogContent.createTime).getTime();
        }
      }
    },
    commit() {
      // 将 createTime 转换为 YYYY:MM:DD HH:MM:SS 格式
      const date = new Date(this.dialogContent.createTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要 +1，确保两位
      const day = String(date.getDate()).padStart(2, '0');        // 确保两位
      const hours = String(date.getHours()).padStart(2, '0');     // 确保两位
      const minutes = String(date.getMinutes()).padStart(2, '0'); // 确保两位
      const seconds = String(date.getSeconds()).padStart(2, '0'); // 确保两位

      // 拼接为 YYYY:MM:DD HH:MM:SS 格式
      this.dialogContent.createTime = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

      if (this.dialogTitle === "新增") {
        console.log("数据:", this.dialogContent);
        insert(this.dialogContent).then(() => {
          this.fetchData();
          this.dialogShow = false;
          this.clearDialogContent();
          console.log("新增完后");
        });
      } else {
        update(this.dialogContent).then(() => {
          this.fetchData();
          this.dialogShow = false;
          this.clearDialogContent();
        });
      }
    },

    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
    },
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = key === 'createTime' ? new Date().getTime() : ''; // 初始化为当前时间戳
      });
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
      }
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.el-pagination {
  margin-top: 10px;
  justify-content: center;
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
