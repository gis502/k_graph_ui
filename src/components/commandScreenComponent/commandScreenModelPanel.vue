<template>
  <!-- 三维模型弹框 -->
  <div class="universalPanel">
    <!-- 顶部标题栏 -->
    <div class="panelTop">
      <h2 class="panelName">三维模型</h2>
    </div>
    <!-- 表格内容 -->
    <div class="model-dialog__content">
      <el-table
          :data="modelTableData"
          class="custom-table"
          style="width: 100%; height: 90%;"
          :header-cell-style="tableHeaderColor"
          :cell-style="tableColor"
          :row-style="{ height: '37.5px', fontSize: '13px'}"
      >
        <!-- 模型名称列 -->
        <el-table-column label=" " min-width="20px" show-overflow-tooltip>
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
              <div class="arrow-icon"></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
            prop="name"
            label="模型名称"
            width="auto"
            min-width="130px"
            show-overflow-tooltip
        ></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="auto" align="center" min-width="100px" show-overflow-tooltip>
          <template #default="scope">
            <el-button type="text" :icon="Edit" @click="goModel(scope.row)" class="checkBotton">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="modelCurrentPage"
            :page-size="modelPageSize"
            layout="total, prev, pager, next, jumper"
            :total="ModelTotal"
            class="custom-pagination"
        >
        </el-pagination>
      </div>
    </div>
  </div>

</template>
<script>

import {Edit, Delete} from '@element-plus/icons-vue'
import {
  addModelApi,
  deleteModel,
  getAllModel,
  updataModel,
  updataModelNoElevation,
  updataModelElevation
} from '@/api/system/model.js'
import {
  goModel,
  findModel,
  isTerrainLoaded,
  transferModel,
  rotationModel,
} from '@/cesium/model.js';
import Cesium from "cesium";

export default {
  data(){
    return{
      modelCurrentPage: 1,
      modelPageSize: 15,
      ModelTotal: 0,
      modelTableData: [],
      modelList: [],
      modelInfo: {
        name: null,
        path: null,
        rz: null,
        tz: null,
        rze: null,
        tze: null,
        time: null,
        modelid: null
      },
    }
  },
  mounted(){
    this.initModelTable(); // 初始化模型table数据
  },
  methods:{
    initModelTable() {
      getAllModel().then(res => {
        this.modelList = res
        this.ModelTotal = res.length
        this.modelTableData = this.getPageArr(this.modelList)
      })
    },
    goModel(row) {
      this.modelInfo.name = row.name
      this.modelInfo.path = row.path
      this.modelInfo.tz = row.tz
      this.modelInfo.rz = row.rz
      this.modelInfo.time = row.time
      this.modelInfo.modelid = row.modelid
      this.modelInfo.tze = row.tze
      this.modelInfo.rze = row.rze
      goModel(row)
    },
    /**
     * 检查地形是否已加载
     * cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
     * 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
     * 该方法通过检查当前地形提供者的类型来确定地形是否已经加载
     * 如果地形提供者是椭球地形提供者(EllipsoidTerrainProvider)，则视为地形未加载
     * 如果地形提供者已定义且不是椭球地形提供者，则视为地形已加载
     *
     * @returns {Boolean} 返回地形是否已加载的状态
     */
    isTerrainLoaded() {
      // 获取当前的地形提供者
      let terrainProvider = window.viewer.terrainProvider;
      // 检查地形提供者是否是椭球地形提供者
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // 在控制台输出地形未加载的信息
        // //console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // //console.log("地形已加载")
        return true;
      }
      // //console.log("地形未加载")
      return false;
    },
    getPageArr(data) {
      let arr = []
      let start = (this.modelCurrentPage - 1) * this.modelPageSize
      let end = this.modelCurrentPage * this.modelPageSize
      if (end > this.ModelTotal) {
        end = this.ModelTotal
      }
      for (; start < end; start++) {
        data[start].show = false
        arr.push(data[start])
      }
      return arr
    },
    tableHeaderColor() {
        return {
            "border-width": "1px",
            "border-style": "solid",
            "border-color": "#555555",
            "background-color": "#293038 !important", // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
            color: "#fff",
            padding: "0",
            "text-align": "center",
        };
    },
    tableColor({row, column, rowIndex, columnIndex}) {
        if (rowIndex % 2 == 1) {
            return {
                "border-width": "1px",
                "border-style": "solid",
                "border-color": "#555555",
                "background-color": "#313a44",
                color: "#fff",
                padding: "0",
                "text-align": "center",
            };
        } else {
            return {
                "border-width": "1px",
                "border-style": "solid",
                "border-color": "#555555",
                "background-color": "#304156",
                color: "#fff",
                padding: "0",
                "text-align": "center",
            };
        }
    },
    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.modelPageSize = val
      this.modelTableData = this.getPageArr(this.modelList)
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.modelCurrentPage = val
      this.modelTableData = this.getPageArr(this.modelList)
    },

  }
}
</script>
<style>
.universalPanel {
  position: absolute;
  left: 1%;
  bottom: 6%;
  width: 450px;
  border-radius: 5px;
  background: rgb(37 69 86);
  //background: linear-gradient(90deg, rgb(22 105 179 / 9%) 25%, rgb(10 33 75 / 76%) 88%);
  color: #fff;
  z-index: 100;
  top: 110px;
  right: 0;
}
.panelTop {
  top: 0.5%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  top: 26%;
  left: 7%;
}
.model-dialog__content {
  height: calc(100% - 41px);
  padding: 11px;
  overflow: auto;
  line-height: 41px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
}

:deep(.el-table) {
  --el-table-border: 0;
  background-color: transparent; /* 表格背景透明 */
}

:deep(.el-table--default .cell) {
  padding: 0 4px;
}

:deep(.el-table tr) {
  background: #ffffff00;
  color: #ffffff;
  font-weight: 1000;
  position: relative;
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}
/* 鼠标悬浮在行时显示箭头图标 */
:deep(.el-table tr:hover) .arrow-icon {
  display: block; /* 行 hover 时显示箭头图标 */
}

:deep(.el-table tr:hover) {
  background: linear-gradient(0deg, rgba(38, 166, 221, 0.9) 30%, rgba(230, 247, 255, 1) 100%);
  font-weight: 1000;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  box-shadow: 0 0 8px 2px rgba(48, 140, 255, 1);
}
:deep(.el-table__inner-wrapper::before) {
  width: 0;
}
.custom-table {
  text-align: center;
}
/* 初始隐藏箭头图标 */
.arrow-icon {
  display: none; /* 默认隐藏 */
  width: 18px;
  height: 20px;
  background: url("@/assets/images/arrow.png") no-repeat center;
  background-size: contain;
}

/* 鼠标悬浮在行时显示箭头图标 */
:deep(.el-table tr:hover) .arrow-icon {
  display: block; /* 行 hover 时显示箭头图标 */
}
:deep(.checkBotton) {
  font-size: .8rem !important;
}

</style>