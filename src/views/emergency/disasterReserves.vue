<template>
  <div class="app-container">
    <el-form-item label="应急物资存储">
      <el-input
          v-model="queryParams"
          placeholder="请输入物资存储信息"
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
        <!--        <template #default="scope">-->
        <!--          &lt;!&ndash; 对特定表头，使用Popover显示完整信息 &ndash;&gt;-->
        <!--          <div v-if="header.label === '地址'">-->
        <!--            <el-popover placement="top" :width="200" trigger="hover">-->
        <!--              <div style="text-align: left">{{ scope.row[header.prop] }}</div>-->
        <!--              &lt;!&ndash; 定义触发Popover显示的参考元素 &ndash;&gt;-->
        <!--              <template #reference>-->
        <!--                <div-->
        <!--                    :style="{ width: header.width + 'px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }"-->
        <!--                >-->
        <!--                  &lt;!&ndash; 在参考元素内显示截断的字段值 &ndash;&gt;-->
        <!--                  <span class="myNote" style="text-align: left">-->
        <!--                                             {{ scope.row[header.prop] }}-->
        <!--                                         </span>-->
        <!--                </div>-->
        <!--              </template>-->
        <!--            </el-popover>-->
        <!--          </div>-->
        <!--          &lt;!&ndash; 对其他表头，直接显示字段值 &ndash;&gt;-->
        <!--          <div v-else>-->
        <!--            {{ scope.row[header.prop] }}-->
        <!--          </div>-->
        <!--        </template>-->
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

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="35%" :show-close="false">
      <el-form ref="from" :model="dialogContent" :rules="rules">
        <el-row>
          <el-col :span="13">
            <el-form-item label="县(区)：" prop="earthquakeName">
              <el-input v-model="dialogContent.county" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="插入时间：" prop="time">
              <el-date-picker
                  v-model="dialogContent.time"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="x"
                  size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="dialogContent.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="dialogContent.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!--        ------------------------------------------------------------------------------------------->


        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="储备库点数量" prop="storagePointsCount">
              <el-input v-model="dialogContent.storagePointsCount" placeholder="请输入数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="合计总件套数" prop="totalItemsCount">
              <el-input v-model="dialogContent.totalItemsCount" placeholder="请输入数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="救灾帐篷" prop="tents">
              <el-input v-model="dialogContent.tents" placeholder="请输入数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="棉被" prop="quilts">
              <el-input v-model="dialogContent.quilts" placeholder="请输入数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="其他被子" prop="otherBlankets">
              <el-input v-model="dialogContent.otherBlankets" placeholder="请输入数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="棉衣裤" prop="cottonClothing">
              <el-input v-model="dialogContent.cottonClothing" placeholder="请输入棉衣裤" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="棉大衣" prop="cottonCoats">
              <el-input v-model="dialogContent.cottonCoats" placeholder="请输入棉大衣" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="其他衣物" prop="otherClothing">
              <el-input v-model="dialogContent.otherClothing" placeholder="请输入其他衣物" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="毛毯" prop="blankets">
              <el-input v-model="dialogContent.blankets" placeholder="请输入毛毯" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="折叠床" prop="foldingBeds">
              <el-input v-model="dialogContent.foldingBeds" placeholder="请输入折叠床" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="高低床" prop="bunkBeds">
              <el-input v-model="dialogContent.bunkBeds" placeholder="请输入高低床" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="彩条布" prop="tarpaulins">
              <el-input v-model="dialogContent.tarpaulins" placeholder="请输入彩条布" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="防潮垫" prop="moistureProofPads">
              <el-input v-model="dialogContent.moistureProofPads" placeholder="请输入防潮垫" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="发电机" prop="generators">
              <el-input v-model="dialogContent.generators" placeholder="请输入发电机" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="照明灯具" prop="lightingFixtures">
              <el-input v-model="dialogContent.lightingFixtures" placeholder="请输入照明灯具" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="照明灯组" prop="lightingSets">
              <el-input v-model="dialogContent.lightingSets" placeholder="请输入照明灯组" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="手电筒" prop="flashlights">
              <el-input v-model="dialogContent.flashlights" placeholder="请输入手电筒" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="雨衣" prop="raincoats">
              <el-input v-model="dialogContent.raincoats" placeholder="请输入雨衣" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="雨靴" prop="rainBoots">
              <el-input v-model="dialogContent.rainBoots" placeholder="请输入雨靴" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="其他装备数量" prop="otherEquipment">
              <el-input v-model="dialogContent.otherEquipment" placeholder="请输入其他装备数量" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="赈济家庭箱" prop="reliefFamiliesBox">
              <el-input v-model="dialogContent.reliefFamiliesBox" placeholder="请输入赈济家庭箱" type="number"/>
            </el-form-item>
          </el-col>
        </el-row>


        <!--        -------------------------------------------------------          -->


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
  addDisasterReserves,updateDisasterReserves,
  delSuppliesReserves, reservesList,
  suppliesReservesList, searchDisasterReserves, searchMaterialData
} from "../../api/system/emergency.js";
import {addEq, updataEq} from "@/api/system/eqlist.js";

export default {
  name: "disasterReserves",
  data() {
    return {
      rules: {
        storagePointsCount: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: ['blur', 'change'],}
        ],
        totalItemsCount: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        tents: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        quilts: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        otherBlankets: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        cottonClothing: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        cottonCoats: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        otherClothing: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        blankets: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        foldingBeds: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        bunkBeds: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        tarpaulins: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        moistureProofPads: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        generators: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        lightingFixtures: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        lightingSets: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        flashlights: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        raincoats: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        rainBoots: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        otherEquipment: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
        reliefFamiliesBox: [
          {type: 'number', min: 0, message: '数量必须大于或等于0', trigger: 'blur'}
        ],
      },


      reservesData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      // ---表头---
      headersArr: [
        {prop: 'county', label: "县(区)", width: 160},
        {prop: 'storagePointsCount', label: "储备库点数量(个)", width: 180},
        {prop: 'address', label: "地址", width: 360},
        {prop: 'contactPerson', label: "联系人", width: 100},
        {prop: 'contactPhone', label: "联系电话", width: 180},
        {prop: 'totalItemsCount', label: "合计总件套数", width: 120},
        {prop: 'tents', label: "救灾帐篷(顶)", width: 120},
        {prop: 'quilts', label: "棉被(床)", width: 120},
        {prop: 'otherBlankets', label: "其他被子(床)", width: 120},
        {prop: 'cottonClothing', label: "棉衣裤(套)", width: 120},
        {prop: 'cottonCoats', label: "棉大衣(件)", width: 120},
        {prop: 'otherClothing', label: "其他衣物(套、件)", width: 150},
        {prop: 'blankets', label: "毛毯(床)", width: 120},
        {prop: 'foldingBeds', label: "折叠床(张)", width: 120},
        {prop: 'bunkBeds', label: "高低床(套)", width: 120},
        {prop: 'tarpaulins', label: "彩条布(包)", width: 120},
        {prop: 'moistureProofPads', label: "防潮垫(张)", width: 120},
        {prop: 'generators', label: "发电机(台)", width: 120},
        {prop: 'lightingFixtures', label: "照明灯具(个)", width: 120},
        {prop: 'lightingSets', label: "照明灯组(套)", width: 120},
        {prop: 'flashlights', label: "手电筒(支)", width: 120},
        {prop: 'raincoats', label: "雨衣(件)", width: 120},
        {prop: 'rainBoots', label: "雨靴(双)", width: 120},
        {prop: 'otherEquipment', label: "其他装备数量(个)", width: 150},
        {prop: 'longitude', label: "经度", width: 150},
        {prop: 'latitude', label: "纬度", width: 150},
        {prop: 'insertTime', label: "插入时间", width: 180}
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字
      // ---新增/修改---
      dialogShow: false,
      dialogTitle: null,
      //--表单
      dialogContent: {
        position: '',
        time: Date.now(), // 初始化为当前时间的时间戳
        magnitude: '',
        longitude: '',
        latitude: '',
        depth: '',
        eqid: '',
        county: '',
        storagePointsCount: '',
        totalItemsCount: '',
        tents: '',
        quilts: '',
        otherBlankets: '',
        cottonClothing: '',
        cottonCoats: '',
        otherClothing: '',
        blankets: '',
        foldingBeds: '',
        bunkBeds: '',
        tarpaulins: '',
        moistureProofPads: '',
        generators: '',
        lightingFixtures: '',
        lightingSets: '',
        flashlights: '',
        raincoats: '',
        rainBoots: '',
        otherEquipment: '',
        address: '',
        geom: '',
        contactPerson: '',
        contactPhone: '',
        insertTime: '',
        other: '',
        reliefFamiliesBox: '',
      },
      // dialogContent: {
      //   position: '',
      //   time: '',
      //   magnitude: '',
      //   longitude: '',
      //   latitude: '',
      //   depth: '',
      //   eqid: ''
      // },
    }
  },
  mounted() {
    this.getDate()
  },
  methods: {
    getDate() {
      reservesList().then(res => {
        this.reservesData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.reservesData
        console.log("-----------------", this.reservesData)
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

    handleDelete(row) {
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

// 检查发震时间是否已选择，如果未选择，则设置为当前时间
      if (!this.dialogContent.time) {
        this.dialogContent.time = new Date().toISOString();
      } else {
        // 将 occurrenceTime 转换为 ISO 8601 格式的字符串
        this.dialogContent.time = new Date(this.dialogContent.time).toISOString();
      }

      const { longitude, latitude } = this.dialogContent;
      if (longitude !== '' && latitude !== '') {
        this.dialogContent.geom = `POINT(${longitude} ${latitude})`;
      } else {
        this.dialogContent.geom = '';  // Or handle the case when they are not provided
      }

      let that = this;
      if (this.dialogTitle === "新增") {
        this.dialogContent.eqid = this.guid();
        // 将 occurrenceTime 转换为 ISO 8601 格式的字符串
        this.dialogContent.time = new Date(this.dialogContent.time).toISOString();


        console.log("this.dialogContent新增+++++++++++++++++++：", this.dialogContent);
        addDisasterReserves(this.dialogContent).then(res => {
          that.getDate();
          that.dialogShow = false;
          this.clearDialogContent();
        });
      } else {
        // 将 occurrenceTime 转换为 ISO 8601 格式的字符串
        this.dialogContent.time = new Date(this.dialogContent.time).toISOString();

        // console.log("this.dialogContent.time更新：", this.dialogContent.occurrenceTime);
        updateDisasterReserves(this.dialogContent).then(res => {
          that.getDate();
          that.dialogShow = false;
          this.clearDialogContent();
        });
      }
    },


    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
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


:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 13%;
  position: relative;
  margin: 0 auto;
}

:deep(.el-form-item--default .el-form-item__error) {
  font-size: 14px !important; /* 字体大小 */
  padding-top: 5px !important;
}

.el-input__inner::placeholder {
  font-size: 10px !important; /* 设置 placeholder 字体大小 */
  color: #999; /* 你可以调整 placeholder 的颜色 */
}

.el-input__inner {
  font-size: 12px; /* 设置输入框内字体大小，调整以适应设计需求 */
}

</style>
