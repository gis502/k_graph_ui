<template>
  <div class="app-container">
    <el-form-item label="应急物资存储" >
      <el-input
          v-model="queryParams"
          placeholder="请输入物资存储信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <!--      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>-->
    </el-form-item>

    <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
      <el-table-column label="序号" width="60" fixed="left">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <!-- 遍历每个表头，创建表格列 -->
      <el-table-column
          v-for="(header, index) in headersArr"
          :key="index"
          :prop="header.prop"
          :label="header.label"
          :width="header.width"
      >
        <!-- 为表格单元格内容定义默认模板 -->
        <template #default="scope">
          <!-- 对特定表头，使用Popover显示完整信息 -->
          <div v-if="header.label === '地址'">
            <el-popover placement="top" :width="200" trigger="hover">
              <div style="text-align: left">{{ scope.row[header.prop] }}</div>
              <!-- 定义触发Popover显示的参考元素 -->
              <template #reference>
                <div
                    :style="{ width: header.width + 'px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }"
                >
                  <!-- 在参考元素内显示截断的字段值 -->
                  <span class="myNote" style="text-align: left">
                                             {{ scope.row[header.prop] }}
                                         </span>
                </div>
              </template>
            </el-popover>
          </div>
          <!-- 对其他表头，直接显示字段值 -->
          <div v-else>
            {{ scope.row[header.prop] }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleOpen('修改',scope.row)">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        style="justify-content: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%" :show-close="false">
      <!-- 省略部分代码 -->
    </el-dialog>
  </div>
</template>

<script>
import {reservesList, searchDisasterReserves} from "../../api/system/emergency.js";

export default {
  name: "disasterReserves",
  data(){
    return {
      reservesData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      // ---表头---
      headersArr: [
        { prop: 'county', label: "县(区)", width: 160 },
        { prop: 'storagePointsCount', label: "储备库点数量(个)", width: 180 },
        { prop: 'address', label: "地址", width: 360 },
        { prop: 'contactPerson', label: "联系人", width: 100 },
        { prop: 'contactPhone', label: "联系电话", width: 180 },
        { prop: 'totalKitsCount', label: "合计总件套数", width: 120 },
        { prop: 'disasterTentsCount', label: "救灾帐篷(顶)", width: 120 },
        { prop: 'cottonBlanketsCount', label: "棉被(床)", width: 120 },
        { prop: 'otherBlanketsCount', label: "其他被子(床)", width: 120 },
        { prop: 'cottonClothesCount', label: "棉衣裤(套)", width: 120 },
        { prop: 'cottonCoatsCount', label: "棉大衣(件)", width: 120 },
        { prop: 'otherClothesCount', label: "其他衣物(套、件)", width: 150 },
        { prop: 'woolBlanketsCount', label: "毛毯(床)", width: 120 },
        { prop: 'foldingBedsCount', label: "折叠床(张)", width: 120 },
        { prop: 'bunkBedsCount', label: "高低床(套)", width: 120 },
        { prop: 'stripedClothBundlesCount', label: "彩条布(包)", width: 120 },
        { prop: 'moistureMatsCount', label: "防潮垫(张)", width: 120 },
        { prop: 'generatorsCount', label: "发电机(台)", width: 120 },
        { prop: 'lightingFixturesCount', label: "照明灯具(个)", width: 120 },
        { prop: 'lightingKitsCount', label: "照明灯组(套)", width: 120 },
        { prop: 'flashlightsCount', label: "手电筒(支)", width: 120 },
        { prop: 'raincoatsCount', label: "雨衣(件)", width: 120 },
        { prop: 'rainBootsCount', label: "雨靴(双)", width: 120 },
        { prop: 'otherSuppliesCount', label: "其他装备数量(个)", width: 150 },
        { prop: 'longitude', label: "经度", width: 150 },
        { prop: 'latitude', label: "纬度", width: 150 },
        { prop: 'insertTime', label: "插入时间", width: 180 }
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字
      // ---新增/修改---
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
    this.getDate()
  },
  methods:{
    getDate(){
      reservesList().then(res => {
        this.reservesData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.reservesData
        console.log("-----------------",res[0])
      })
    },
    handleOpen(feature, row){
      // console.log("row------",row)
      // this.dialogShow = false
      // this.dialogTitle = feature
    },
    handleDelete(row){
      // delSuppliesReserves(row.uniqueId).then(res => {
      //     console.log("delete--------",res)
      // })
    },
    // 搜索功能
    handleQuery() {
      // 获取搜索关键字
      const searchKey = this.queryParams.trim();

      // 如果搜索关键字为空，恢复为原始数据
      if (searchKey === "") {
        this.getDate();  // 恢复为原始数据
        return;
      }

      // 发送搜索请求
      searchDisasterReserves(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.reservesData = res;  // 更新 reservesData
            this.total = res.length;  // 更新总数
            this.tableData = this.getPageArr(); // 使用更新后的数据进行分页
          })
          .catch(error => {
            console.error("搜索时出现错误:", error);
          });
    },
    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getDate();  // 重新加载所有数据
    },
    getPageArr(data = this.reservesData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          data[start].insertTime = this.formatDate(data[start].insertTime);
          arr.push(data[start]);
        }
      }
      return arr;
    },
    // 将ISO时间格式转为"YYYY-MM-DD HH:MM:SS"
    formatDate(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  }
}
</script>

<style scoped>

</style>
