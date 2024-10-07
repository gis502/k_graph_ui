<template>
  <div class="personalCasualtyPanel">
    <div class="panelLegend">
      <span id="title">图例</span>
      <ul>
        <li v-for="(item, index) in legendItems" :key="index" :style="{ color: 'white' }">
      <span
          :style="{ backgroundColor: `rgb${item.color}`, width: '40px', height: '20px', display: 'inline-block' }"></span>
          {{ item.label }}
        </li>
      </ul>
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
      legendItems: [
        {color: '(254, 204, 203)', label: '1-5人'},
        {color: '(255, 177, 167)', label: '6-10人'},
        {color: '(254, 151, 134)', label: '11-20人'},
        {color: '(253, 128, 106)', label: '21-50人'},
        {color: '(245, 101, 75)', label: '51-100人'},
        {color: '(240, 78, 53)', label: '101-250人'},
        {color: '(231, 50, 31)', label: '251-500人'},
        {color: '(218, 0, 0)', label: '> 500人'},
      ],
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
    // convertColor(colorString) {
    //   return colorString.replace(/[()]/g, '').split(',').map(c => parseInt(c.trim())).join(', ');
    // },
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
  border-right: 2px solid #000;
  float: left;
  width: 150px;
  height: 100%;
  padding: 5px 0 0 10px;
}
ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

span {
  margin-right: 10px;
  color: #fff;
  font-size: 14px;
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
