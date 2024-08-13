<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
      </el-col>
    </el-row>
    <el-table :data="tableData":header-cell-style="tableHeaderColor" :cell-style="tableColor">
      <el-table-column label="序号" width="60">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="time" label="发震时间" width="200"></el-table-column>
      <el-table-column prop="position" label="位置" width="300" ></el-table-column>
      <el-table-column prop="magnitude" label="震级"></el-table-column>
      <el-table-column prop="longitude" label="经度"></el-table-column>
      <el-table-column prop="latitude" label="纬度"></el-table-column>
      <el-table-column prop="depth" label="深度"></el-table-column>
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
      <el-row :gutter="10">
        <el-col :span="6">位置：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.position" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">发震时间：</el-col>
        <el-col :span="18">
          <!--          <el-input v-model="dialogContent.time" placeholder="请输入内容"></el-input>-->
          <el-date-picker
              v-model="dialogContent.time"
              type="datetime"
              placeholder="选择日期时间"
              value-format="x"
              size="large">
          </el-date-picker>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">震级：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.magnitude" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">经度：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.longitude" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">纬度：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.latitude" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">深度：</el-col>
        <el-col :span="18">
          <el-input v-model="dialogContent.depth" placeholder="请输入内容"></el-input>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {addEq, getAllEq, deleteeq, updataEq} from '@/api/system/eqlist'

export default {
  name: "index",
  data() {
    return {
      getEqData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        position: '',
        time: '',
        magnitude: '',
        longitude: '',
        latitude: '',
        depth: '',
        eqid: ''
      },
    }
  },
  mounted() {
    this.getEq()
  },
  methods: {
    getEq() {
      let that = this
      getAllEq().then(res => {
        let resData = res.filter(item=>item.magnitude>=3)
        that.getEqData = resData
        that.total = resData.length
        let data = []
        for (let i = 0; i < res.length; i++) {
          let item = res[i]
          item.time = that.timestampToTime(item.time)
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        that.tableData = this.getPageArr()
      })
    },
    // 删除单条地震
    handleDelete(row) {
      let that = this
      deleteeq({eqid: row.eqid}).then(res => {
        that.getEq()
      })
    },
    // 点击新增或修改打开dialog对话框
    handleOpen(title, row) {
      if (title === "新增") {
        this.dialogTitle = title
        console.log(this.dialogTitle)
      } else {
        this.dialogTitle = title
        this.dialogContent = {...row}
      }
      this.dialogShow = !this.dialogShow
    },
    // 确认提交修改或新增
    commit() {
      let that = this
      if (this.dialogTitle === "新增") {
        this.dialogContent.eqid = this.guid()
        addEq(this.dialogContent).then(res => {
          that.getEq()
          that.dialogShow = false
          this.clearDialogContent()
        })
      } else {
        updataEq(this.dialogContent).then(res => {
          that.getEq()
          that.dialogShow = false
          this.clearDialogContent()
        })
      }
    },
    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
    },
    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
    },
    // 对数据库获取到的标绘图片数组切片
    getPageArr() {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        arr.push(this.getEqData[start])
      }
      return arr
    },
    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.pageSize = val
      this.tableData = this.getPageArr()
      // console.log(`每页 ${val} 条`);
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.getPageArr()
      // console.log(`当前页: ${val}`);
    },
    // 修改table的header的样式
    tableHeaderColor() {
      return {
        // 'border-color': '#293038',
        // 'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        // 'color': '#fff',
        // 'padding': '0',
        'text-align': 'center',
        'font-size': '16px'
      }
    },
    // 修改table 中每行的样式
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          // 'border-color': '#313a44',
          // 'background-color': '#313a44',
          // 'color': '#fff',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'text-align': 'center',
          'font-size': '16px',
        }
      } else {
        return {
          // 'border-color': '#304156',
          // 'background-color': '#304156',
          // 'color': '#fff',
          // 'padding': '0',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'text-align': 'center',
          'font-size': '16px'
        }
      }
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
      let year = DateObj.getFullYear()
      let month = DateObj.getMonth() + 1
      let day = DateObj.getDate()
      let hh = DateObj.getHours()
      let mm = DateObj.getMinutes()
      let ss = DateObj.getSeconds()
      month = month > 9 ? month : '0' + month
      day = day > 9 ? day : '0' + day
      hh = hh > 9 ? hh : '0' + hh
      mm = mm > 9 ? mm : '0' + mm
      ss = ss > 9 ? ss : '0' + ss
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },
  }
}
</script>

<style scoped>
.el-pagination {
  margin-top: 10px;
  justify-content: center;
}
</style>
