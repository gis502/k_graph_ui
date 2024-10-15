<template>
  <div>
    <div id="cesiumContainer" v-if="pageStatus">
      <el-form class="tool-container-1">
        <el-row>
          <div class="modelAdj" style="margin-top: 5px">模型调整</div>
          <el-button type="primary" @click="showSelectModel=!showSelectModel">
            <span v-if="showSelectModel">
              隐藏工具
            </span>
            <span v-if="!showSelectModel">
              显示工具
            </span>
          </el-button>
          <el-button type="primary" @click="findModel">找到模型</el-button>
          <el-button type="primary" @click="showArrowModel">{{ showArrowText }}</el-button>
          <!--        <el-button class="el-button--primary" @click="isTerrainLoaded">地形是否加载</el-button>-->
          <el-button type="primary" @click="hideModel">{{ modelStatusContent }}</el-button>
          <!--        <el-button type="primary" @click="openDialog('新增')">新增模型</el-button>-->
          <el-button type="primary" @click="updataPosition">更新位置</el-button>
        </el-row>
      </el-form>
      <el-form class="button-container" v-show="showSelectModel">
        <div class="modelAdj">模型选择</div>
        <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="selectModel(1)">0.4平方公里模型</el-button>-->
        <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="selectModel(2)">7.37平方公里模型</el-button>-->
        <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="home">雅安</el-button>-->
        <el-table :data="tableData" style="width: 100%;margin-bottom: 5px" :header-cell-style="tableHeaderColor"
                  :cell-style="tableColor" @row-click="">
          <el-table-column prop="name" label="模型名称" width="140px">
            <!--          <template #default="scope">-->
            <!--            <el-input v-if="scope.row.show" v-model="modelInfo.name" class="w-50 m-2" placeholder="Please Input"/>-->
            <!--          </template>-->
          </el-table-column>
          <!--          <el-table-column prop="path" label="模型路径" width="80">-->
          <!--          <template #default="scope">-->
          <!--            <el-input v-if="scope.row.show" v-model="modelInfo.path" class="w-50 m-2" placeholder="Please Input"/>-->
          <!--          </template>-->
          <!--          </el-table-column>-->
          <!--        <el-table-column prop="rz" label="旋转角度" width=""></el-table-column>-->
          <el-table-column prop="tz" label="模型中心高度(米)" width="160px"></el-table-column>
          <!--        <el-table-column prop="rze" label="旋转角度（三维）" width=""></el-table-column>-->
          <el-table-column prop="tze" label="模型中心高度(米)" width="160px"></el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <!--          <template #default="scope">-->
            <!--            <el-button v-if="!scope.row.show" type="text" :icon="Edit" @click="updataM(scope.row)">修改</el-button>-->
            <!--            <el-button v-if="!scope.row.show" type="text" :icon="Edit" @click="selectModel(scope.row.path)">查看</el-button>-->
            <!--            <el-button v-if="!scope.row.show" type="text" :icon="Delete" @click="deleteM(scope.row)">删除</el-button>-->
            <!--            <el-button v-if="scope.row.show" type="text" :icon="Edit" @click="updataMCommit(scope.row)">确认</el-button>-->
            <!--          </template>-->
            <template #default="scope">
              <el-button type="text" :icon="Edit" @click="changeModel(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total">
          </el-pagination>
        </div>
      </el-form>
      <el-form class="tool-container" v-show="showSelectModel">
        <el-row>
          <!--        <br>-->
          <span style="color: white">调整高度</span>
          <el-slider
              v-model="tz"
              show-input
              :max="2000"
              :min="-2000"
              :step="10"
              @change="changeHeight(tz)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <!--        <br>-->
          <span style="color: white">绕Z轴旋转模型</span>
          <el-slider
              v-model="rz"
              show-input
              :max="180"
              :min="-180"
              :step="1"
              @change="changeRotationZ(rz)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <!--        <br>-->
          <span style="color: white">调整模型透明度</span>
          <el-slider
              v-model="opacity"
              show-input
              :max="100"
              :min="0"
              :step="1"
              @change="changeOpacity(opacity)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <el-col :span="8">
            <span style="color: white">经度：<span id="longitudeShow"></span>°</span>
          </el-col>
          <el-col :span="8">
            <span style="color: white">纬度：<span id="latitudeShow"></span>°</span>
          </el-col>
          <el-col :span="8">
            <span style="color: white">视角高：<span id="altitudeShow"></span>km</span>
          </el-col>
        </el-row>
      </el-form>

      <!--    <el-dialog v-model="dialogFormVisible" title="新增模型" width="500" :show-close="false">-->
      <!--      <el-form :model="modelInfo">-->
      <!--        <el-form-item label="模型名称">-->
      <!--          <el-input v-model="modelInfo.name" autocomplete="off"/>-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="模型路径">-->
      <!--          <el-input v-model="modelInfo.path" autocomplete="off"/>-->
      <!--        </el-form-item>-->
      <!--      </el-form>-->
      <!--      <template #footer>-->
      <!--        <div class="dialog-footer">-->
      <!--          <el-button @click="closeDialog">Cancel</el-button>-->
      <!--          <el-button type="primary" @click="commitDialog">-->
      <!--            Confirm-->
      <!--          </el-button>-->
      <!--        </div>-->
      <!--      </template>-->
      <!--    </el-dialog>-->

    </div>
    <!--  <div v-if="!pageStatus">-->
    <!--    <tiltTable />-->
    <!--  </div>-->
  </div>

</template>

<script setup>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {Edit, Delete} from '@element-plus/icons-vue'

import {
  addModelApi,
  deleteModel,
  getAllModel,
  updataModel,
  updataModelNoElevation,
  updataModelElevation
} from '@/api/system/model.js'
// import tiltTable from '@/components/Model/tiltModel/tiltTable.vue'
import {ElMessageBox} from 'element-plus';
import {ElMessage} from 'element-plus';
import {CustomShader} from "cesium";

import {
  goModel,
  watchTerrainProviderChanged,
  findModel,
  showArrow,
  hide,
  changeHeight,
  changeRotationZ,
  changeOpacity,
  isTerrainLoaded
} from '../../../functionjs/model.js';

let pageStatus = ref(true)
let tz = ref(0)
let rz = ref(0)
let originRz = 0
let originTz = 0
let opacity = ref(100)
let showArrowValue = false
let showArrowText = ref("显示坐标轴")
let modelStatus = true
let modelStatusContent = ref("隐藏当前模型")
let modelName = ''


//----------------------------model table---------------------------------------
let currentPage = ref(1)
let pageSize = ref(6)
let total = ref(0)
let modelList = []
let tableData = ref([])
//------------------------------dialog对话框--------------------------------------
let title = ref("")
let dialogFormVisible = ref(false)
let modelInfo = reactive({
  name: null, path: null, rz: null, tz: null, rze: null, tze: null, time: null, modelid: null
})
//-------------------------------------------------------------------------------
let showSelectModel = ref(true)
// -----------------------------------------------------------------------------

onMounted(() => {
  init()
  watchTerrainProviderChanged()
  initModelTable()
})

onBeforeUnmount(() => {
  if (window.viewer != null) {
    let viewer = window.viewer
    let gl = viewer.scene.context._gl
    viewer.entities.removeAll()
    // viewer.scene.primitives.removeAll()
    viewer.destroy()
    gl.getExtension("WEBGL_lose_context").loseContext();
    gl = null
    window.viewer = null;
  }
})


// 初始化控件等
function init() {
  let viewer = initCesium(Cesium)
  viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
  window.viewer = viewer
  let options = {}
  // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
  options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500, new Cesium.Cartographic)
  // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
  options.enableCompass = true
  // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
  options.enableZoomControls = true
  // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
  options.enableDistanceLegend = true
  // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
  options.enableCompassOuterRing = true
  options.resetTooltip = "重置视图";
  options.zoomInTooltip = "放大";
  options.zoomOutTooltip = "缩小";
  //新版必须new  CesiumNavigation ,可以查看作者github
  window.navigation = new CesiumNavigation(viewer, options)
  // document.getElementsByClassName('navigation-control-icon-zoom-in')[0].style.color = '#409EFF'
  // document.getElementsByClassName('navigation-control-icon-zoom-out')[0].style.color = '#409EFF'
  document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
  document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
  document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'
  // document.getElementsByClassName('cesium-viewer-cesiumInspectorContainer')[0].style.top = '300px'
  // document.getElementsByClassName('cesium-viewer-cesium3DTilesInspectorContainer')[0].style.top = '600px'
  // 设置鼠标位置经纬度\视角高度实时显示
  let longitudeShow = document.getElementById('longitudeShow');
  let latitudeShow = document.getElementById('latitudeShow');
  let altitudeShow = document.getElementById('altitudeShow');
  let canvas = viewer.scene.canvas;
  //具体事件的实现
  let ellipsoid = viewer.scene.globe.ellipsoid;
  let handler = new Cesium.ScreenSpaceEventHandler(canvas);
  handler.setInputAction(function (movement) {
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    if (cartesian) {
      //将笛卡尔三维坐标转为地图坐标（弧度）
      let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      //将地图坐标（弧度）转为十进制的度数
      let latString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
      let logString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
      // 获取相机的海拔高度作为视角高度/km
      let altiString = (viewer.camera.positionCartographic.height / 1000).toFixed(2);
      longitudeShow.innerHTML = logString;
      latitudeShow.innerHTML = latString;
      altitudeShow.innerHTML = altiString;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
function changeModel(row){
  console.log(row)
  if (isTerrainLoaded()){
    tz.value=row.tze
    rz.value=row.rze
  }else {
    tz.value=row.tz
    rz.value=row.rz
  }

  modelInfo.name = row.name
  modelInfo.path = row.path
  modelInfo.tz = row.tz
  modelInfo.rz = row.rz
  modelInfo.time = row.time
  modelInfo.modelid = row.modelid
  modelInfo.tze = row.tze
  modelInfo.rze = row.rze
  goModel(row)
}
function showArrowModel() {
  showArrow(showArrowValue)
  if (!showArrowValue) {
    showArrowValue = true
    showArrowText.value = "隐藏坐标轴"
  } else {
    showArrowValue = false
    showArrowText.value = "显示坐标轴"
  }
}
function hideModel() {
  hide(modelStatus)
  if (modelStatus) {
    // window.modelObject.show = false
    modelStatus = false
    modelStatusContent.value = '显示当前模型'
  } else {
    // window.modelObject.show = true
    modelStatus = true
    modelStatusContent.value = '隐藏当前模型'
  }
}

// 更新模型位置
function updataPosition() {
  let data = {
    rze: rz.value,
    tze: tz.value,
    modelid: modelInfo.modelid
  }
  if (isTerrainLoaded()) {
    updataModelElevation(data).then(res => {
      ElMessage({
        showClose: true,
        message: '加载地形情况下，更新成功',
        type: 'success',
        duration: 2000,
      })
      initModelTable()
    })
  }

  else {
    updataModelNoElevation(data).then(res => {
      ElMessage({
        showClose: true,
        message: '不加载地形情况下，更新成功',
        type: 'success',
        duration: 2000,
      })
      initModelTable()
    })
  }
}



//-----------------------模型table----------------------------

// 初始化模型table数据
function initModelTable() {
  getAllModel().then(res => {

    modelList = res
    total.value = res.length
    tableData.value = getPageArr(modelList)
    console.log("modelList, tableData", modelList, tableData)
  })
}

// 修改table的header的样式
function tableHeaderColor() {
  return {
    'border-width': '1px',
    'border-style': 'solid',
    'border-color': '#555555',
    'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
    'color': '#fff',
    'padding': '0',
    'text-align': 'center',
    'font-size': '14px'
  }
}

// 修改table 中每行的样式
function tableColor({row, column, rowIndex, columnIndex}) {
  if (rowIndex % 2 == 1) {
    return {
      'border-width': '1px',
      'border-style': 'solid',
      'border-color': '#555555',
      'background-color': '#313a44',
      'color': '#fff',
      'padding': '0',
      'text-align': 'center',
      'font-size': '14px'
    }
  } else {
    return {
      'border-width': '1px',
      'border-style': 'solid',
      'border-color': '#555555',
      'background-color': '#304156',
      'color': '#fff',
      'padding': '0',
      'text-align': 'center',
      'font-size': '14px'
    }
  }
}

//数组切片
function getPageArr(data) {
  let arr = []
  let start = (currentPage.value - 1) * pageSize.value
  let end = currentPage.value * pageSize.value
  if (end > total.value) {
    end = total.value
  }
  for (; start < end; start++) {
    data[start].show = false
    arr.push(data[start])
  }
  return arr
}

//`每页 ${val} 条`
function handleSizeChange(val) {
  pageSize.value = val
  tableData.value = getPageArr(modelList)
  // console.log(`每页 ${val} 条`);
}

// `当前页: ${val}`
function handleCurrentChange(val) {
  currentPage.value = val
  tableData.value = getPageArr(modelList)
  // console.log(`当前页: ${val}`);
}

//----------------------无用法-------------------------------------

// 打开对话框
function openDialog(titleM, row) {
  if (titleM === "新增") {
    title.value = "新增"
    modelInfo.rz = 0
    modelInfo.tz = 0
    modelInfo.time = '1717743010164'
    modelInfo.modelid = Date.now()
  } else {
    modelInfo.rz = 0
    modelInfo.tz = 0
    modelInfo.time = '1717743010164'
    modelInfo.modelid = row.modelid
    modelInfo.name = row.name
    modelInfo.path = row.path
    title.value = "编辑"
  }
  dialogFormVisible.value = true

}

// 关闭对话框
function closeDialog() {
  for (let key in modelInfo) {
    modelInfo[key] = null
  }
  dialogFormVisible.value = false
}

// 确认提交对话框，添加模型
function commitDialog() {
  let data = {
    name: modelInfo.name,
    path: modelInfo.path,
    rz: modelInfo.rz,
    tz: modelInfo.tz,
    rze: modelInfo.rze,
    tze: modelInfo.tze,
    time: modelInfo.time,
    modelid: modelInfo.modelid
  }
  if (title.value === "新增") {
    addModelApi(data).then(res => {
      initModelTable()
      for (let key in modelInfo) {
        modelInfo[key] = null
      }
    })
  }
  // else{
  //   updataModel(data).then(res=>{
  //     initModelTable()
  //     for(let key in modelInfo){
  //       modelInfo[key] = null
  //     }
  //     console.log(res,'编辑')
  //   })
  // }
  dialogFormVisible.value = false
}

// 删除模型
function deleteM(row) {
  deleteModel({modelid: row.modelid}).then(res => {
    initModelTable()
  })
}

// 修改模型
function updataM(row) {
  modelInfo.name = row.name
  modelInfo.path = row.path
  modelInfo.tz = row.tz
  modelInfo.rz = row.rz
  modelInfo.time = row.time
  modelInfo.modelid = row.modelid
  modelInfo.tze = row.tze
  modelInfo.rze = row.rze
  // row.show = !row.show
}

function updataMCommit() {
  let data = {
    name: modelInfo.name,
    path: modelInfo.path,
    rz: modelInfo.rz,
    tz: modelInfo.tz,
    rze: modelInfo.rze,
    tze: modelInfo.tze,
    time: modelInfo.time,
    modelid: modelInfo.modelid
  }
  updataModel(data).then(res => {
    initModelTable()
    for (let key in modelInfo) {
      modelInfo[key] = null
    }
    console.log(res, '编辑')
  })
}

function selectGltfModel() {
  remove3dData()
  tz.value = 0
  originTz = 0

  let cartesian = new Cesium.Cartesian3.fromDegrees(103.00, 29.98, 0.0)
  let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian);

  let model = Cesium.Model.fromGltf({
    url: './peilou/万达.gltf',
    modelMatrix: modelMatrix,
    id: 'wanda',
    minimumPixelSize: 128,
    scale: 1,
  })
  window.modelObject = model
  window.viewer.scene.primitives.add(window.modelObject)
  console.log(window.modelObject)
  window.modelObject.readyPromise.then(function () {

    let origin = new Cesium.Cartesian3(0, 0, 1000)
    Cesium.Matrix4.multiplyByPoint(window.modelObject.modelMatrix, origin, origin)
    window.viewer.camera.zoomTo({
      destination: origin,
      orientation: {
        // 指向
        heading: 6.283185307179581,
        // 视角
        pitch: -1.5688168484696687,
        roll: 0.0
      }
    });
  })

}

function home() {
  remove3dData()
  viewer.camera.setView({
    // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
    // fromDegrees()方法，将经纬度和高程转换为世界坐标
    destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 1500),
    orientation: {
      // 指向
      heading: 6.283185307179581,
      // 视角
      pitch: -1.5688168484696687,
      roll: 0.0
    }
  });
}

</script>

<style scoped>
.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

:deep(.el-pagination__total) {
  color: #FFFFFF;
}

:deep(.el-pagination>.is-last) {
  color: #FFFFFF;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0;
}

.cesium-viewer-navigationContainer {
  display: none !important;
}

.el-tree {
  background: rgb(38 36 36) !important;
  color: #ffffff !important;
}

.el-tree-node__content:hover {
  background-color: rgb(38 36 36) !important;
}

.el-tree-node:focus > .el-tree-node__content {
  background-color: rgb(38 36 36) !important;
}

.plotTreeItem {
  margin: 3px;
}

.plottreetooltip {
  margin: 4px;
}

#cesiumContainer {
  height: calc(100vh - 50px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.markCollection {
  position: absolute;
  padding: 10px;
  top: 630px;
  left: 10px;
  background-color: rgba(40, 40, 40, 0.7);
  z-index: 10; /* 更高的层级 */
}

.markCollection span {
  margin: 5px;
  width: 30px;
  height: 30px;
}

.markCollection span:hover {
  cursor: pointer;
}

.noteContainer {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 368px;
  left: 10px;
  width: 500px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container-1 {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 625px;
  top: 10px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 560px;
  top: 265px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.button-container {
  height: 195px;
  width: 560px;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 65px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.latlon-legend {
  pointer-events: auto;
  position: absolute;
  border-radius: 15px;
  padding-left: 5px;
  padding-right: 5px;
  bottom: 30px;
  height: 30px;
  width: 125px;
  box-sizing: content-box;
}

.modelAdj {
  color: #FFFFFF;
  margin-bottom: 5px;
  margin-right: 10px;
}
</style>
