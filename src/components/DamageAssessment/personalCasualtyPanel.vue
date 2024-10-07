<template>
  <div class="personalCasualtyPanel">
    <div class="panelLegend">
      <span id="title" style="font-size: 15px; font-weight: bold; margin-bottom: 10px;">图例</span>
      <div class="legend">
        <span class="color" style="background-color: rgb(254, 204, 203); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">1-5人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(255, 177, 167); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">6-10人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(254, 151, 134); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">11-20人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(253, 128, 106); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">21-50人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(245, 101, 75); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">51-100人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(240, 78, 53); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">101-250人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(231, 50, 31); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">251-500人</span>
      </div>
      <div class="legend">
        <span class="color" style="background-color: rgb(218, 0, 0); width: 15px; height: 15px; display: inline-block;"></span>
        <span style="font-size: 15px; margin-left: 10px;">&gt;500人</span>
      </div>
    </div>


    <div class="panelEqInfo">
      <span id="title">地震信息面板</span>
    </div>

<!--  <div style="display: flex; width: calc(100% - 30vw)">-->
<!--    &lt;!&ndash; 评估和图表面板 &ndash;&gt;-->
<!--    <span>测试</span>-->
<!--  </div>-->

    <div class="panelTable">
      <div class="text" style="display: flex;">
        <!--        <div class="hidden button" @click="sendHidden()">—</div>-->
        <span id="title">统计表格</span>
      </div>
      <div class="table">
        <span>本次地震预估伤亡总数：</span>
        <span>{{ personalCasualtyData.PersonalCasualtyNum }}</span>
        <span>人</span>
        <p>
          <span v-if="!personalCasualtyData.yaancasual">雅安市预估伤亡情况：无伤亡人员</span>
        </p>
        <el-table :data="tableData"
                  style="width: 100%"
                  :row-class-name="tableRowClassName"
                  max-height="180px">
          <el-table-column label="地区" prop="name"></el-table-column>
          <el-table-column label="伤亡人数" prop="num"></el-table-column>
        </el-table>
      </div>
  </div>
  </div>
</template>

<script>
export default {
  props: {
    personalCasualtyData: {
      type: Object,
      required: true,
    },
    selectedTabData: Object,
  },
  data() {
    return {
      tableData: [],  // 存储表格数据
    };
  },
  mounted() {
    this.loadTableData();
  },
  watch: {
    // 监听 personalCasualtyData 的变化，当数据变化时重新加载表格数据
    personalCasualtyData: {
      handler() {
        this.loadTableData();
      },
      immediate: true, // 在初始化时立即触发
      deep: true, // 深度监听对象的变化
    },
  },
  methods: {
    loadTableData() {
      if (this.personalCasualtyData && this.personalCasualtyData.yaanitemcasual) {
        this.tableData = this.personalCasualtyData.yaanitemcasual.length
            ? this.personalCasualtyData.yaanitemcasual
            : [{ name: '暂无数据', num: '0' }];
      } else {
        this.tableData = [{ name: '暂无数据', num: '0' }];
      }
    },
    sendHidden() {
      const isPersonalCasualtyPanelShow = false;
      this.$emit('hidden', isPersonalCasualtyPanelShow);
    },
    // 设置表格行样式的类名
    tableRowClassName({ rowIndex }) {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    },
  },
};
</script>

<style lang="less" scoped>
.personalCasualtyPanel {
  height: 250px;
  width: calc(100% - 333px);
  background-color: rgba(45, 61, 81, 0.8);
  z-index: 1;
}
#title {
  font-weight: bold;
  margin-bottom: 10px;
}
.panelEqInfo {
  float: left; /* 使其浮动到左边 */
  display: flex;
}

.panelTable, .panelEqInfo , .panelLegend{
  padding: 10px;
}
.panelLegend {
  padding: 10px;
  display: flex;
  flex-direction: column; /* 垂直排列内部元素 */
  width: calc(100% - 56vw); /* 宽度根据计算结果调整 */
  height: auto; /* 高度根据内容自动调整 */
  border-right: 2px solid #000;
}

.legend {
  display: flex; /* 将颜色块和文本水平排列 */
  align-items: center; /* 颜色块和文本垂直居中对齐 */
  margin: 5px 0;
}

.color {
  width: 15px;
  height: 15px;
  display: inline-block; /* 保持颜色方块的块级显示 */
  border-radius: 2px; /* 可选：如果你想让方块有圆角 */
}

#title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
}
.panelTable {
  float: right;
  width: calc(100% - 42vw); /* 宽度根据计算结果调整 */
  border-left: #000 2px solid;
}
.hidden {
  height: 30px;
  width: 30px;
  border: #2a2b36 2px solid;
  border-radius: 3px;
  font-weight: bold;
  font-size: 18px;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

span {
  color: #fff;
  font-size: 14px;
}

//表格样式如下
// 最底部表框
/deep/ .el-table__inner-wrapper {
  &::before {
    display: none;
  }
}
// 头部样式
:deep(.el-table__header-wrapper th) {
  background-color: rgba(30, 38, 50, 0.93) !important; /* 修改表头背景色 */
  color: #fff;
  font-size: 14px; /* 调整字体大小 */
  text-align: center; /* 文字居中 */
  //height: 32px !important; /* 行高度 */
}

// 内容行样色
/deep/ .el-table__row {
  background-color: #001936;
  color: #B2C9EE;
  font-size: 14px; /* 调整字体大小 */
  height: 32px; /* 每一行的高度 */
}
// 内容行边框
/deep/ .el-table__cell {
  border: 0 !important;
  line-height: 32px; /* 确保内容在行中垂直居中 */
  padding: 0 10px; /* 调整单元格的内边距以保持整洁 */
  text-align: center; /* 文字居中 */
}
// 自定义斑马线和鼠标移入样式
/deep/ .el-table--enable-row-hover .el-table__body tr:hover:nth-child(even) > td {
  background-color: #0C2442 !important;
}

/deep/ .el-table--enable-row-hover .el-table__body tr:hover:nth-child(odd) > td {
  background-color: #001936 !important;
}

/deep/ .el-table__body tr:nth-child(even) {
  background-color: #0C2442; /* 偶数行（斑马线）的默认背景色 */
}
</style>



<!--<template>-->
<!--  <div class="personalCasualtyPanel">-->
<!--    <div class="panelTable">-->
<!--      <div class="text" style="display: flex;">-->
<!--        <div class="hidden button" @click="sendHidden()">—</div>-->
<!--        <span style="margin-left: 15px">统计表格</span>-->
<!--      </div>-->
<!--      <div class="table">-->
<!--        <span>本次地震预估伤亡总数：</span>-->
<!--        <span>{{ personalCasualtyData.PersonalCasualtyNum }}</span>-->
<!--        <span>人</span>-->
<!--        <p>-->
<!--          <span>雅安市预估伤亡情况：</span>-->
<!--          <span v-if="!personalCasualtyData.yaancasual">无伤亡人员</span>-->
<!--        </p>-->
<!--        <table>-->
<!--          <thead>-->
<!--          <tr>-->
<!--            <th>地区</th>-->
<!--            <th>伤亡人数</th>-->
<!--          </tr>-->
<!--          </thead>-->
<!--          <tbody>-->
<!--          <template v-if="personalCasualtyData.yaancasual">-->
<!--            <template v-for="item in personalCasualtyData.yaanitemcasual" :key="item.id">-->
<!--              <tr>-->
<!--                <td>{{ item.name }}</td>-->
<!--                <td>{{ item.num }}人</td>-->
<!--              </tr>-->
<!--            </template>-->
<!--          </template>-->
<!--          </tbody>-->
<!--        </table>-->
<!--      </div>-->
<!--    </div>-->


<!--    <div style="display: flex; width: calc(100% - 30vw)">-->
<!--      &lt;!&ndash; 评估和图表面板 &ndash;&gt;-->
<!--    </div>-->

<!--    <div class="panelLegend">-->
<!--&lt;!&ndash;      <span>图例</span>&ndash;&gt;-->
<!--&lt;!&ndash;      <div class="legend"><span class="image"><img src="../../assets/images/DamageAssessment/eqMark.png" style="width: 25px;height: 25px;"></span><span style="font-size: 15px;margin-left: 5px">当前地震</span></div>&ndash;&gt;-->
<!--    </div>-->
<!--  </div>-->

<!--  <div class="panelEqInfo">-->
<!--    &lt;!&ndash; 地震信息面板 &ndash;&gt;-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  props: {-->
<!--    personalCasualtyData: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--    selectedTabData: Object,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      PersonalCasualtyNum: 0,  // 预估总伤亡人数-->
<!--      yaancasual: false,  // 是否有雅安市的伤亡情况-->
<!--      yaanitemcasual: [],  // 雅安市各区县伤亡人数列表-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    // 生命周期钩子，可以用于初始化数据-->
<!--  },-->
<!--  methods: {-->
<!--    sendHidden() {-->
<!--      const isPersonalCasualtyPanelShow = false;-->
<!--      this.$emit('hidden', isPersonalCasualtyPanelShow);-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->
<!--<style scoped>-->
<!--.personalCasualtyPanel {-->
<!--  height: 250px;-->
<!--  width: calc(100% - 333px);-->
<!--  background-color: rgba(45, 61, 81, 0.8);-->
<!--  z-index: 1;-->
<!--}-->

<!--.panelEqInfo {-->
<!--  position: absolute;-->
<!--  right: 0;-->
<!--  bottom: 0;-->
<!--  width: 333px;-->
<!--  height: 250px;-->
<!--  z-index: 2;-->
<!--  background-color: rgba(45, 61, 81, 0.8);-->
<!--  border-left: #000 2px solid;-->
<!--}-->

<!--.panelTable, .panelEqInfo {-->
<!--  padding: 10px;-->
<!--  border-right: #000 2px solid;-->
<!--}-->

<!--.table {-->
<!--  overflow-x: auto; /* 使表格可以横向滚动 */-->
<!--  width: 30%;-->
<!--}-->

<!--table {-->
<!--  width: 100%; /* 表格宽度 */-->
<!--  border-collapse: collapse; /* 合并边框 */-->
<!--}-->

<!--th, td {-->
<!--  padding: 10px; /* 单元格内边距 */-->
<!--  text-align: left; /* 左对齐 */-->
<!--  border: 1px solid #fff; /* 边框 */-->
<!--}-->

<!--.hidden {-->
<!--  height: 30px;-->
<!--  width: 30px;-->
<!--  border: #2a2b36 2px solid;-->
<!--  border-radius: 3px;-->
<!--  font-weight: bold;-->
<!--  font-size: 18px;-->
<!--}-->

<!--.button {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  color: #fff;-->
<!--}-->

<!--span {-->
<!--  color: #fff;-->
<!--  font-size: 14px;-->
<!--}-->
<!--</style>-->

