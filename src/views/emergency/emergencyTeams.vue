<template>
  <div class="app-container">
    <el-form-item label="应急救援队伍" >
      <el-input
          v-model="queryParams"
          placeholder="请输入救援队伍信息"
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
        <!--            <template #default="scope">-->
        <!--              &lt;!&ndash; 对特定表头，使用Popover显示完整信息 &ndash;&gt;-->
        <!--              <div v-if="header.label === '地址'">-->
        <!--                <el-popover placement="top" :width="200" trigger="hover">-->
        <!--                  <div style="text-align: left">{{ scope.row[header.prop] }}</div>-->
        <!--                  &lt;!&ndash; 定义触发Popover显示的参考元素 &ndash;&gt;-->
        <!--                  <template #reference>-->
        <!--                    <div-->
        <!--                        :style="{ width: header.width + 'px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }"-->
        <!--                    >-->
        <!--                      &lt;!&ndash; 在参考元素内显示截断的字段值 &ndash;&gt;-->
        <!--                      <span class="myNote" style="text-align: left">-->
        <!--                                             {{ scope.row[header.prop] }}-->
        <!--                                         </span>-->
        <!--                    </div>-->
        <!--                  </template>-->
        <!--                </el-popover>-->
        <!--              </div>-->
        <!--              &lt;!&ndash; 对其他表头，直接显示字段值 &ndash;&gt;-->
        <!--              <div v-else>-->
        <!--                {{ scope.row[header.prop] }}-->
        <!--              </div>-->
        <!--            </template>-->
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
import {rescueTeamList, searchEmergencyTeam} from "../../api/system/emergency.js";

export default {
  name: "emergencyTeams",
  data(){
    return {
      rescueTeamData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      currentHeaders: [],
      // ---表头---
      headersArr: [
        // { prop: 'uniqueId', label: '唯一标识', width: 150 },
        { prop: 'levelName', label: '级别名称', width: 230 },
        { prop: 'address', label: '地址', width: 360 },
        { prop: 'totalMembers', label: '总人数', width: 100 },
        { prop: 'personInCharge', label: '负责人', width: 120 },
        { prop: 'chargePhone', label: '负责人电话', width: 150 },
        { prop: 'dataSource', label: '数据来源', width: 160 },
        { prop: 'affiliatedAgency', label: '所属机构', width: 150 },
        { prop: 'teamTypeName', label: '队伍类型名称', width: 150 },
        { prop: 'establishmentDate', label: '成立日期', width: 200 },
        { prop: 'mainResponsibilities', label: '主要职责', width: 150 },
        { prop: 'expertiseDescription', label: '专长描述', width: 150 },
        { prop: 'emergencyCommunicationMethods', label: '应急联系方式', width: 150 },
        { prop: 'preparationTime', label: '预计准备时间', width: 180 },
        { prop: 'assemblyLocation', label: '集合出发地点', width: 150 },
        { prop: 'selfTransportation', label: '自备交通工具', width: 150 },
        { prop: 'longitude', label: '经度', width: 120 },
        { prop: 'latitude', label: '纬度', width: 120 },
        { prop: 'confidentialityName', label: '保密级别', width: 150 },
        { prop: 'modifierName', label: '修改人', width: 150 },
        { prop: 'qualificationLevel', label: '资质级别', width: 150 },
        { prop: 'dataSource', label: '数据来源', width: 150 },
        { prop: 'notes', label: '备注', width: 150 }
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
      rescueTeamList().then(res => {
        this.rescueTeamData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.rescueTeamData
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
      searchEmergencyTeam(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.rescueTeamData = res;  // 更新 rescueTeamData
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
    getPageArr(data = this.rescueTeamData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          // 把“成立日期”字段转化为如：2008-01-01 08:00:00格式  👇
          // data[start].establishmentDate = data[start].establishmentDate ? this.formatDate(data[start].establishmentDate) : null;
          data[start].estimatedPreparationTime = data[start].estimatedPreparationTime ? this.formatDate(data[start].estimatedPreparationTime) : null;
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
