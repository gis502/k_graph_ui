<template>
  <div class="app-container">
    <el-form-item label="应急避难场所" >
      <el-input
          v-model="queryParams"
          placeholder="请输入避难场所信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
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

    <!--表单-->
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="35%" :show-close="false">
      <el-form ref="form" :model="formData" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="唯一标识:" prop="uniqueIdentifier">
              <el-input v-model="formData.uniqueIdentifier" placeholder="请输入唯一标识" required></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="名称:" prop="name">
              <el-input v-model="formData.name" placeholder="请输入名称" required></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="场所类型名称:" prop="shelterTypeName">
              <el-input v-model="formData.shelterTypeName" placeholder="请输入场所类型名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="地址:" prop="address">
              <el-input v-model="formData.address" placeholder="请输入地址" required></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="面积:" prop="area">
              <el-input v-model.number="formData.area" placeholder="请输入面积" type="number" min="0"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可容纳人数:" prop="capacity">
              <el-input v-model.number="formData.capacity" placeholder="请输入可容纳人数" type="number" min="0"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="级别名称:" prop="levelName">
              <el-input v-model="formData.levelName" placeholder="请输入级别名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="密级:" prop="secretLevel">
              <el-input v-model="formData.secretLevel" placeholder="请输入密级"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人:" prop="personInCharge">
              <el-input v-model="formData.personInCharge" placeholder="请输入负责人" required></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="应急电话:" prop="emergencyPhone">
              <el-input v-model="formData.emergencyPhone" placeholder="请输入应急电话"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="应急手机:" prop="emergencyMobile">
              <el-input v-model="formData.emergencyMobile" placeholder="请输入应急手机"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="投入使用时间:" prop="startTime">
              <el-date-picker
                  v-model="formData.startTime"
                  type="date"
                  placeholder="选择日期"
                  value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="设计使用年限:" prop="designServiceLife">
              <el-input v-model.number="formData.designServiceLife" placeholder="请输入设计使用年限" type="number"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="备注:" prop="remarks">
              <el-input type="textarea" v-model="formData.remarks" placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="经度:" prop="longitude">
              <el-input v-model.number="formData.longitude" placeholder="请输入经度" type="number"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="纬度:" prop="latitude">
              <el-input v-model.number="formData.latitude" placeholder="请输入纬度" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  searchEmergencyShelters,
  sheltersList
} from "../../api/system/emergency.js";
import {addEq, updataEq} from "@/api/system/eqlist.js";

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
        { prop: 'capacity', label: '可容纳人数', width: 150 },
        { prop: 'administrativeDivision', label: '行政区划', width: 200 },
        { prop: 'address', label: '地址', width: 450 },
        { prop: 'personInCharge', label: '负责人', width: 150 },
        // { prop: 'emergencyPhone', label: '应急电话', width: 150 }, 数据库没有一条数据
        { prop: 'emergencyMobile', label: '应急手机', width: 150 },
        { prop: 'affiliatedOrganization', label: '所属机构', width: 140 },
        { prop: 'designServiceLife', label: '设计使用年限', width: 120 },
        { prop: 'dataSourceUnit', label: '数据来源单位', width: 180 },
        { prop: 'longitude', label: '经度', width: 120 },
        { prop: 'latitude', label: '纬度', width: 120 },
        { prop: 'remarks', label: '备注', width: 300 },
        { prop: 'startTime', label: '投入使用时间', width: 140 },
        { prop: 'description', label: '基本情况', width: 150 },
        { prop: 'seismicIntensity', label: '地震烈度', width: 150 },
        { prop: 'shelterTypeName', label: '场所类型名称', width: 120 },
        { prop: 'levelName', label: '级别名称', width: 120 },
        { prop: 'secretLevel', label: '保密级别', width: 120 },
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字

      dialogShow: false,
      dialogTitle: null,
      //表单
      formData: {
        uniqueIdentifier: '',
        name: '',
        shelterTypeName: '',
        area: null,
        capacity: null,
        levelName: '',
        secretLevel: '',
        personInCharge: '',
        emergencyPhone: '',
        emergencyMobile: '',
        startTime: '',
        designServiceLife: null,
        remarks: '',
        longitude: null,
        latitude: null
      },
      rules: {
        uniqueIdentifier: [{ required: true, message: '请输入唯一标识', trigger: 'blur' }],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        personInCharge: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
      }
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
    handleOpen(feature, row) {
      console.log("row------", row);
      this.dialogShow = true; // 确保 dialogShow 设置为 true 以显示弹窗
      this.dialogTitle = feature;
      if (feature === '新增') {
        this.clearDialogContent(); // 清空表单内容
      } else if (feature === '修改') {
        // 根据 row 的内容填充表单
        this.dialogContent = {...row};
      }
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


    //新增或修改
    commit() {
      this.$refs.from.validate((valid) => {
        if (valid) {
          // 发送请求
          // 提交表单逻辑
          console.log("表单验证通过，提交数据");
        } else {
          console.log("表单验证失败，请检查输入！");
          // this.$message.error('表单验证失败，请检查输入！');
        }
      });


      let that = this;
      if (this.dialogTitle === "新增") {
        this.dialogContent.eqid = this.guid();
        // console.log("this.dialogContent.time新增：", this.dialogContent.occurrenceTime);
        addEq(this.dialogContent).then(res => {
          that.getDate();
          that.dialogShow = false;
          this.clearDialogContent();
        });
      } else {
        // console.log("this.dialogContent.time更新：", this.dialogContent.occurrenceTime);
        updataEq(this.dialogContent).then(res => {
          that.getDate();
          that.dialogShow = false;
          this.clearDialogContent();
        });
      }
    },
    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
      this.$refs.from.resetFields(); // 重置表单
      this.$refs.from.clearValidate(); // 清除验证状态
    },



    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
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
