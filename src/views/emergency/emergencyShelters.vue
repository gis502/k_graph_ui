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
              show-overflow-tooltip
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
    </div>
</template>

<script>
import {
  searchEmergencyShelters,
  sheltersList
} from "../../api/system/emergency.js";

export default {
  name: "emergencyShelters",
  data(){
    return {
      sheltersData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      // ---表头---
      headersArr: [
        // { prop: 'uniqueId', label: '唯一标识', width: 150 },
        { prop: 'name', label: '名称', width: 280 },
        { prop: 'area', label: '面积', width: 150 },
        { prop: 'capacity', label: '容纳人数', width: 150 },
        { prop: 'administrativeDivision', label: '行政区划', width: 200 },
        { prop: 'address', label: '地址', width: 450 },
        { prop: 'emergencyMobile', label: '应急手机', width: 150 },
        { prop: 'affiliatedOrganization', label: '隶属组织', width: 140 },
        { prop: 'startUsingDate', label: '启用日期', width: 180 },
        { prop: 'designUsageYears', label: '设计使用年限', width: 120 },
        { prop: 'dataSourceUnit', label: '数据来源单位', width: 180 },
        { prop: 'longitude', label: '经度', width: 120 },
        { prop: 'latitude', label: '纬度', width: 120 },
        { prop: 'emergencyPhone', label: '应急电话', width: 120 },
        { prop: 'placeType', label: '地点类型', width: 120 },
        { prop: 'levelName', label: '级别名称', width: 120 },
        { prop: 'secrecyLevel', label: '保密级别', width: 120 },
        { prop: 'basicInformation', label: '基本信息', width: 150 },
        { prop: 'seismicIntensity', label: '地震烈度', width: 150 },
        { prop: 'remarks', label: '备注', width: 300 },
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字
    }
  },
  mounted() {
    this.getDate()
  },
  methods:{
    getDate(){
      sheltersList().then(res => {
        this.sheltersData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.sheltersData
        console.log("-----------------",res[0])
      })
    },
    handleOpen(feature, row){
    },
    handleDelete(row){
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
      searchEmergencyShelters(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.sheltersData = res;  // 更新 sheltersData
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
    getPageArr(data = this.sheltersData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          data[start].startUsingDate = this.formatDate(data[start].startUsingDate);
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
