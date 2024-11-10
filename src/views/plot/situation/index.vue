<template>
  <div>
    <div class="eqtitle">
      <span class="eqtitle-text_eqname">{{ this.title.replace("T", " ") }}级地震</span>
    </div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <el-form class="situation_eqTable">
        <el-table :data="tableData" style="width: 100%;margin-bottom: 5px" :stripe="true"
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor">
          <el-table-column label="序号" width="55">
            <template #default="{ row, column, $index }">
              {{ ($index + 1) + (currentPage - 1) * pageSize }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="发震时间" width="160"/>
          <el-table-column prop="earthquakeName" label="位置">
            <template #default="scope">
              <el-popover placement="top" :width="300" trigger="hover" v-if="scope.row.earthquakeName.length>=10">
                <div>{{ scope.row.earthquakeName }}</div>
                <template #reference>
                  <div>
                    <span class="posInfo">
                      {{ scope.row.earthquakeName }}
                    </span>
                  </div>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="magnitude" label="震级" width="55"/>
          <!--        <el-table-column prop="longitude" label="经度" width="70"></el-table-column>-->
          <!--        <el-table-column prop="latitude" label="纬度" width="65"></el-table-column>-->
          <!--        <el-table-column prop="depth" label="深度" width="50"></el-table-column>-->
          <el-table-column label="操作" width="75">
            <template #default="scope">
              <el-button
                size="small"
                @click="plotAdj(scope.row)">查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total">
        </el-pagination>

      </el-form>
      <el-form class="noteContainer">
        <div class="modelAdj">态势标绘工具</div>
        <el-row>
          <el-col :span="13">
            <el-tree class="plotTool" :data="plotTreeData" :props="defaultProps" @node-click="handleNodeClick"
                     accordion></el-tree>
          </el-col>
          <el-col :span="11">
          <span class="plotTreeItem" v-for="(item,index) in plotTreeClassification" @click="treeItemClick(item)">
            <el-tooltip class="plottreetooltip" effect="dark" :content="item.name" placement="top-start">
              <img :src="item.img" width="17%" height="43.3px">
            </el-tooltip>
          </span>
            <!--          <span class="plotTreeItem" v-if="plotTreeClassification.length===0">-->
            <!--            <el-button type="primary" @click="drawP">量算面积</el-button>-->
            <!--            <el-button type="primary" @click="drawN">量算距离</el-button>-->
            <!--            <el-button style="margin: 10px;" type="danger" @click="deletePolygon"-->
            <!--                       v-if="this.showPolygon">删除面</el-button>-->
            <!--            <el-button style="margin: 10px;" type="danger" @click="deletePolyline"-->
            <!--                       v-if="this.showPolyline">删除线</el-button>-->
            <!--           <el-row>-->
            <!--            <br>-->
            <!--            <el-col :span="24">-->
            <!--              <span style="color: white;">距离：</span>-->
            <!--              <span style="color: white;" id="distanceLine">0</span>-->
            <!--              <span style="color: white;"> 米</span>-->
            <!--            </el-col>-->
            <!--          </el-row>-->
            <!--          <el-row>-->
            <!--            <el-col :span="24">-->
            <!--              <span style="color: white;">面积：</span>-->
            <!--              <span style="color: white;" id="area">0</span>-->
            <!--              <span style="color: white;"> 平方米</span>-->
            <!--            </el-col>-->
            <!--          </el-row>-->
            <!--          <el-row>-->
            <!--            <el-col :span="24">-->
            <!--              <span style="color: white;">区域内标绘个数：</span>-->
            <!--              <span style="color: white;" id="ispointIcon">0 </span>-->
            <!--              <span style="color: white;"> 个</span>-->
            <!--            </el-col>-->
            <!--          </el-row>-->
            <!--          </span>-->
          </el-col>
        </el-row>
      </el-form>
      <addMarkCollectionDialog
          :addMarkDialogFormVisible="addMarkDialogFormVisible"
          @wsSendPoint="wsSendPoint"
          @drawPoints="drawPoints"
          @ifPointAnimate="ifPointAnimation"
          @clearMarkDialogForm="resetAddMarkCollection"
      />
      <addPolylineDialog
        :addPolylineDialogFormVisible="addPolylineDialogFormVisible"
        @wsSendPoint="wsSendPoint"
        @clearMarkDialogForm="resetPolyline"
      />
      <addPolygonDialog
        :addPolygonDialogFormVisible="addPolygonDialogFormVisible"
        @wsSendPoint="wsSendPoint"
        @clearMarkDialogForm="resetPolygon"
      />
      <commonPanel
        :visible="popupVisible"
        :position="popupPosition"
        :popupData="popupData"
        :ifedit="true"
        @wsSendPoint="wsSendPoint"
        @closePlotPop="closePlotPop"
      />
      <dataSourcePanel
        :visible="dataSourcePopupVisible"
        :position="dataSourcePopupPosition"
        :popupData="dataSourcePopupData"
      />

      <el-button type="primary" @click="exportCesiumTheme"
                 style="position: absolute;top: 50px;right: 100px;z-index: 100;">导出专题图
      </el-button>

      <el-button type="primary" @click="showSelect('import')"
                 style="position: absolute;top: 100px;right: 100px;z-index: 100;">下载导入标绘数据模板
      </el-button>

      <el-button type="primary" @click="showSelect('export')"
                 style="position: absolute;top: 200px;right: 100px;z-index: 100;">导出当前地震标绘数据
      </el-button>

      <el-upload
        :action="uploadUrl"
        :multiple="false"
        :show-file-list="false"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :headers="this.headers"
        style="position: absolute;top: 150px;right: 100px;z-index: 100;"
      >
        <el-button type="primary" @click="">上传当前地震标绘数据</el-button>
      </el-upload>

      <el-dialog
        v-model="selectVisible"
        width="30%"
        @close="selectVisible=false"
      >
        <template #title>
          <div style="text-align: center;">{{ this.excelPanel }}</div>
        </template>

        <div>
          <div style="display: flex">

            <div style="width: 50%">
              <div>可选择标绘名称</div>
              <el-row>
                <el-tree
                  ref="tree"
                  :data="filteredPlotTreeData"
                  :props="defaultProps"
                  show-checkbox
                  node-key="id"
                  @check-change="handleCheck"
                >
                </el-tree>
              </el-row>
            </div>

            <div>
              <div>已选择标绘名称</div>
              <ul>
                <li v-for="(item, index) in selectedNodes" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

          </div>

          <div style="display: flex">
            <div style="width: 50%">
              <div style="text-align: center;">
                <el-button type="primary" @click="confirmDownload()">确定</el-button>
              </div>
            </div>
            <div style="width: 50%">
              <div style="text-align: center;">
                <el-button type="primary" @click="cancelDownload()">取消</el-button>
              </div>
            </div>
          </div>
        </div>


      </el-dialog>

    </div>
    <!-- Cesium 视图 -->
<!--    <layeredShowPlot :zoomLevel="zoomLevel" :pointsLayer="pointsLayer"/>-->

    <!-- 预览图片的 div -->
    <div v-if="previewImage" class="preview-container">
      <div class="export-image">
        <div class="export-info">
          <p>{{ this.title.replace("T", " ") + "级地震-标绘专题图" }}</p>

        </div>
        <div class="main_coantainer">
          <div class="top_container">
            <div class="box"></div>
            <div class="top"></div>
            <div class="box"></div>
          </div>
          <div class="middow">
            <div class="left"></div>
            <div class="main">
              <img :src="previewImage" alt="导出图片">
            </div>
            <div class="right"></div>
          </div>
          <div class="bottom_container">
            <div class="box"></div>
            <div class="bottom"></div>
            <div class="box"></div>
          </div>
        </div>
        <div
          style="font-size:14px ;padding: 0; width: 100%; margin-top: 0; background-color: white; display: flex; justify-content: space-between; align-items: center; text-align: center;">
          <p style="flex: 1; text-align: left; margin-left: 10px;"></p>
          <p style="flex: 1; text-align: center;">制作时间：{{ pictureCreateTime }}</p>
          <p style="flex: 1; text-align: right; margin-right: 10px;">版本：专业版</p>
        </div>

      </div>
      <div class="preview-buttons">
        <button @click="downloadImage" class="download-button">下载</button>
        <button @click="closePreview" class="cancel-button">取消</button>
      </div>
    </div>

    <div class="legend-container" style="position: absolute;bottom: 0;right: 0;" v-if="showLegend">
      <el-table stripe :row-style="{ height: '30px' }" :cell-style="{ padding: '0px' }" :data="legendPlotData"
                style="width: 100%">
        <el-table-column label="图标" width="50">
          <template v-slot="scope">
            <img :src="scope.row.icon" alt="icon" style="width: 20px; height: 20px;"/>
          </template>
        </el-table-column>
        <el-table-column prop="plotType" label="类型" width="180"></el-table-column>
        <el-table-column prop="count" label="数量" width="50"></el-table-column>
      </el-table>
      <div class="compassContainer" ref="compassContainer"></div>
    </div>

    <div v-if="isShowMessageIcon" style="position: fixed; top: 120px; left: 50%; transform: translate(-50%, -50%); z-index: 9999; display: flex; align-items: center; justify-content: center; width: 200px; height: 50px; background-color: rgba(13, 50, 95, 0.7);border-radius: 10px;">
      <p style="color: #fff; margin: 0;">您正在进行标绘：</p>
      <img :src="this.messageIcon" style="width: 30px; height: 30px;">
    </div>


    <div v-if="loading" class="loading-container">
      <p>正在导出，请稍候...</p>
    </div>

  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {ElMessage} from 'element-plus'
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getExcelPlotInfo, getPlot, getPlotIcon} from '@/api/system/plot'
import {getAllEq, getEqById} from '@/api/system/eqlist'
import {initWebSocket} from '@/cesium/WS.js'
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import addMarkCollectionDialog from "@/components/Cesium/addMarkCollectionDialog"
import addPolylineDialog from "@/components/Cesium/addPolylineDialog.vue"
import addPolygonDialog from '@/components/Cesium/addPolygonDialog'
import commonPanel from "@/components/Cesium/CommonPanel";
import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import Arrow from "@/cesium/drawArrow/drawPlot.js"
import dataSourcePanel from "@/components/Cesium/dataSourcePanel.vue";
import {plotType} from "../../../cesium/plot/plotType.js";
import {downloadPlotExcel} from "../../../api/system/excel.js";
import {getToken} from "../../../utils/auth.js";
import * as XLSX from "xlsx";
import layeredShowPlot from '@/components/Cesium/layeredShowPlot.vue'
import html2canvas from "html2canvas";

export default {
  components: {
    dataSourcePanel,
    addMarkCollectionDialog, commonPanel, addPolygonDialog, addPolylineDialog, layeredShowPlot
  },
  data: function () {
    return {
      //-----------标绘部分--------------
      polylineStatus: 0,//0 标绘线未激活状态，1 激活状态
      typeList: null,// 点标注控件根据此数据生成
      refenceTypeList: null,//用来对照弹窗中类型的中文
      message: null, // 添加点标绘的时候的弹窗相关
      addMarkDialogFormVisible: false, // dian标绘信息填写对话框的显示和隐藏
      addPolylineDialogFormVisible: false,// xian标绘信息填写对话框的显示和隐藏
      addPolygonDialogFormVisible: false,// mian标绘信息填写对话框的显示和隐藏
      showMarkCollection: false, // 点标绘控件的显示和隐藏
      openAddStatus: true, // 用来控制添加billboard按钮的状态，点一次后只有添加完点才能再点击
      ifPointAnimate: false, // 说明是否为新标绘的点
      //-----------弹窗部分--------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件

      dataSourcePopupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      dataSourcePopupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      dataSourcePopupData: [], // 弹窗内容，传值给子组件

      //--------------------------------------------------
      showPolygon: false, // y面的删除按钮
      showPolyline: false,// 线的删除按钮
      // ---------------------------------------------------
      plotPicture: [],
      //-------------ws---------------------
      websock: null,
      //-----------------------------------
      plotTreeData: [
        {
          label: '现场救援类',
          children: [
            {
              label: 'I类（救援力量类）',
            },
            {
              label: 'II类（救援行动类）',
            },
          ]
        },
        {
          label: '次生灾害类',
          children: [
            {
              label: 'I类（次生地质灾害）',
            },
            {
              label: 'II类（建筑物破坏类）',
            },
            {
              label: 'III类（交通设施破坏类）',
            },
            {
              label: 'IV类（生命线工程破坏类）',
            },
            {
              label: 'V类（水利工程破坏类）',
            },
            {
              label: 'VI类（安全生产事故类）',
            },
          ]
        },
        {
          label: '应急避难类',
          children: [
            {
              label: 'I类（应急避难功能区类）',
            },
            // {
            //   label: 'II类（应急避难设施设备类）',
            // },
            // {
            //   label: 'III类（应急避难场所类）',
            // },
          ]
        },
        // {
        //   label: '量算工具',
        // }
      ],
      filteredPlotTreeData: [],
      defaultProps: {
        label: 'label',
        children: 'children',
      },
      plotTreeClassification: [],
      //----------------------------------
      total: 0,
      pageSize: 5,
      currentPage: 1,
      getEqData: [],
      tableData: [],
      //----------------------------------
      eqid: '',
      title: '',
      popupVisiblePolygon: false,
      defaultInputValue: '',
      clickEvent: null,// 用于存储点击事件对象
      //----------------------------------
      // 震中点数据结构
      centerPoint: {
        plotid: 'center',
        earthquakeName: '',
        // time:'',
        starttime: '',
        endtime: '',
        magnitude: '',
        longitude: '',
        latitude: '',
        height: '',
        depth: '',
        plottype: '震中'
      },
      //----------------------------------
      renderedPlotIds: new Set(), // 用于存储已经渲染的 plotid
      //----------------------------------
      zoomLevel: '市', // 初始化缩放层级
      pointsLayer: [], //传到子组件
      //----------------------------------
      plotList: [], // 用于指定地震标绘点导出
      selectVisible: false,
      selectedNodes: [], // 用于存储选中的节点信息

      uploadUrl: '',
      headers: {
        Authorization: "Bearer " + getToken()
      },
      fieldMapping: [],
      excelContent: [],
      excelPanel: '',
      // ----------------------------------
      legendTableData: [],
      previewImage: null, // 保存预览图片的 URL
      loading: false, // 控制加载状态
      pictureCreateTime: '',
      // 导出图片时经纬度线
      rectangleBounds: [],//按东南西北的顺序存储
      latLonEntities: [], // 用于存储经纬度线实体的数组
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      topStart: null,
      topEnd: null,
      leftStart: null,
      leftEnd: null,
      step: 0.5,
      divBoxCount: 0,
      flexPercentages: [],
      points: [],
      hasGeneratedPoints: false,
      legendPlotData: [],
      showLegend: false,
      eqInfo: {},
      sheet: [],
      sheetData: {},
      isLoaded: false,
      downloadConfirmed: false,
      isShowMessageIcon: false,
      messageIcon: '',
    };
  },
  mounted() {
    // 初始化地图
    this.init()
    // 生成实体点击事件的handler
    this.entitiesClickPonpHandler()
    this.watchTerrainProviderChanged()
    // 干四件事获取地震列表、获取最新地震的eqid、设置websocket的eqid、渲染已有的标绘
    this.getEq()
    // 获取标绘图片
    this.getPlotPicture()
  },
  beforeUnmount() {
    console.log("111", window.viewer)
    if (window.viewer) {
      Arrow.disable();
      let viewer = window.viewer
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl = null
      window.viewer = null;
    }
  },

  watch: {
    isLoaded(val) {
      if(val && this.downloadConfirmed) {
        this.downloadExcel()
      }
    }
  },

  // unmounted() {
  //   this.websock.close()
  // },
  methods: {

    downloadExcel() {
      const plotBTO = {
        sheets: this.sheet,
        excelContent: this.excelContent
      };

      // console.log("sheet:",sheet)

      downloadPlotExcel(plotBTO).then(res => {
        const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        console.log(this.excelContent)

        const formattedTitle = this.title
          // 删除时间部分，例如 T17:07:10 或 11:07:10
          .replace(/\s?T?\d{2}:\d{2}:\d{2}/, "")
          // 然后将日期部分 2024-05-27 转换为 2024年5月27日
          .replace(/^(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) =>
            `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`
          );

        const excelTitle = this.excelContent.length > 0 ? `${formattedTitle}级地震-标绘数据` : "标绘数据模板";

        console.log("标题：",excelTitle)

        link.setAttribute('download', `${excelTitle}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        this.excelContent = []
        this.selectVisible = false;
        this.selectedNodes = [];
        // 获取当前勾选的节点
        const checkedNodes = this.$refs.tree.getCheckedNodes();

        // 逐个取消勾选
        checkedNodes.forEach(node => {
          this.$refs.tree.setChecked(node, false);
        });
      })
      this.isLoaded = false
      this.downloadConfirmed = false
      this.loading = false
    },
    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium)
      Arrow.disable();
      Arrow.init(viewer);
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
      // 监听相机高度并更新 zoomLevel
      viewer.camera.changed.addEventListener(() => {
        const cameraHeight = viewer.camera.positionCartographic.height
        this.updateZoomLevel(cameraHeight)
      })
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
      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'

    },
    // 初始化ws
    initWebsocket() {
      console.log("this.eqid---------------------", this.eqid)
      this.websock = initWebSocket(this.eqid)
      // this.websock.eqid = this.eqid
      // 为什么这样写不生效????
      // this.websock.onmessage = this.wsOnmessage()
      // this.websock.wsAdd = this.wsAdd()c0a80428-c790-43e4-ac9d-ba682b716900
    },
    // 获取本次地震数据库中的数据渲染到地图上
    initPlot(eqid) {
      this.pointsLayer = []
      let that = this
      getPlot({eqid}).then(res => {
        let data = res

        that.plotList = data
        console.log("数据：", data)

        let pointArr = data.filter(e => e.drawtype === 'point')
        let points = []
        pointArr.forEach(item => {
          if (!that.renderedPlotIds.has(item.plotId)) { // 检查是否已经渲染
            let point = {
              earthquakeId: item.earthquakeId,
              plotId: item.plotId,
              time: item.creationTime.replace("T", " "),
              plotType: item.plotType,
              drawtype: item.drawtype,
              latitude: item.latitude,
              longitude: item.longitude,
              height: item.elevation,
              icon: item.icon,
            }
            points.push(point)
            that.renderedPlotIds.add(item.plotId);
          }
        })
        that.drawPoints(points,false)
        that.pointsLayer = [...points]
        console.log(that.pointsLayer)
        let polylineArr = data.filter(e => e.drawtype === 'polyline');
        console.log("pointArr", pointArr)
        console.log("polylineArr", polylineArr)
        // 过滤掉已经渲染的项
        let unrenderedPolylineArr = polylineArr.filter(item => !that.renderedPlotIds.has(item.plotId));

        // 标记未渲染的项为已渲染
        unrenderedPolylineArr.forEach(item => {
          that.renderedPlotIds.add(item.plotId); // 标记为已渲染
        });

        // 只绘制未渲染的线条
        if (unrenderedPolylineArr.length > 0) {
          cesiumPlot.getDrawPolyline(unrenderedPolylineArr); // 只绘制当前未渲染的线条
        }

        // 处理多边形数据
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};
        polygonArr.forEach(item => {
          if (!polygonMap[item.plotId]) {
            polygonMap[item.plotId] = [];
          }
          polygonMap[item.plotId].push(item);
        });
        Object.keys(polygonMap).forEach(plotId => {
          let polygonData = polygonMap[plotId];
          that.getDrawPolygonInfo(polygonData);
        });
        let straightArr = data.filter(e => e.drawtype === 'straight');
        Arrow.showStraightArrow(straightArr)
        console.log("straightArr----------------", straightArr)

        let attackArr = data.filter(e => e.drawtype === 'attack');
        Arrow.showAttackArrow(attackArr)

        let pincerArr = data.filter(e => e.drawtype === 'pincer');
        Arrow.showPincerArrow(pincerArr)
        // // 长轮询逻辑：等待一段时间后继续请求
        // setTimeout(() => {
        //   fetchData(); // 递归调用以实现长轮询
        // }, 5000); // 设置 5 秒的轮询间隔（可以根据需求调整）
      })
      // const fetchData = () => {
      //   getPlot({eqid}).then(res => {
      //     let data = res
      //     let pointArr = data.filter(e => e.drawtype === 'point')
      //     let points = []
      //     pointArr.forEach(item => {
      //       if (!that.renderedPlotIds.has(item.plotId)) { // 检查是否已经渲染
      //         let point = {
      //           earthquakeId: item.earthquakeId,
      //           plotId: item.plotId,
      //           time: item.creationTime.replace("T"," "),
      //           plotType: item.plotType,
      //           drawtype: item.drawtype,
      //           latitude: item.latitude,
      //           longitude: item.longitude,
      //           height: item.elevation,
      //           icon: item.icon,
      //         }
      //         points.push(point)
      //       }
      //     })
      //
      //     that.drawPoints(points)
      //     let polylineArr = data.filter(e => e.drawtype === 'polyline');
      //
      //     // 过滤掉已经渲染的项
      //     let unrenderedPolylineArr = polylineArr.filter(item => !that.renderedPlotIds.has(item.plotId));
      //
      //     // 标记未渲染的项为已渲染
      //     unrenderedPolylineArr.forEach(item => {
      //       that.renderedPlotIds.add(item.plotId); // 标记为已渲染
      //     });
      //
      //     // 只绘制未渲染的线条
      //     if (unrenderedPolylineArr.length > 0) {
      //       cesiumPlot.getDrawPolyline(unrenderedPolylineArr); // 只绘制当前未渲染的线条
      //     }
      //
      //     let straightArr = data.filter(e => e.drawtype === 'straight');
      //     Arrow.showStraightArrow(straightArr)
      //
      //     let attackArr = data.filter(e => e.drawtype === 'attack');
      //     Arrow.showAttackArrow(attackArr)
      //
      //     let pincerArr = data.filter(e => e.drawtype === 'pincer');
      //     Arrow.showPincerArrow(pincerArr)
      //
      //     // 处理多边形数据
      //     let polygonArr = data.filter(e => e.drawtype === 'polygon');
      //     // console.log('index.polygonArr', polygonArr)
      //     let polygonMap = {};
      //     polygonArr.forEach(item => {
      //       if (!polygonMap[item.plotId]) {
      //         polygonMap[item.plotId] = [];
      //       }
      //       polygonMap[item.plotId].push(item);
      //     });
      //     Object.keys(polygonMap).forEach(plotId => {
      //       let polygonData = polygonMap[plotId];
      //       that.getDrawPolygonInfo(polygonData);
      //     });
      //     // 长轮询逻辑：等待一段时间后继续请求
      //     setTimeout(() => {
      //       fetchData(); // 递归调用以实现长轮询
      //     }, 5000); // 设置 5 秒的轮询间隔（可以根据需求调整）
      //   })
      //   .catch((error) => {
      //     console.error("获取数据失败:", error);
      //     // 如果发生错误，等待一段时间后重新尝试
      //     setTimeout(() => {
      //       fetchData();
      //     }, 10000); // 10 秒后重试
      //   });
      // };
      // // 开始长轮询
      // fetchData();
    },

    showSelect(flag) {
      this.filteredPlotTreeData = this.plotTreeData.map((category) => {
        if (category.children) {
          return {
            ...category,
            children: category.children.filter(
              (child) => child.label !== 'I类（次生地质灾害）'
            ),
          };
        }
        return category;
      });
      this.selectVisible = true
      this.initializeTreeChildren(flag)
      // console.log("数据：",this.excelContent)
    },

    handleCheck() {
      const checkedNodes = this.$refs.tree.getCheckedNodes();

      // 提取所有的最高级和第二级的label
      const highestAndSecondLabels = [];
      this.filteredPlotTreeData.forEach(item => {
        // 添加最高级label
        highestAndSecondLabels.push(item.label);
        // 添加每个子项的label
        if (item.children) {
          item.children.forEach(child => {
            highestAndSecondLabels.push(child.label);
          });
        }
      });

      // 过滤掉最高级和第二级的label
      this.selectedNodes = checkedNodes
        .map(node => node.label)
        // 过滤掉最高级和第二级的 label
        .filter(label => !highestAndSecondLabels.includes(label));
    },

    confirmDownload() {
      this.loading = true
      this.sheet = this.selectedNodes.map(node => {
        // 反向查找键
        const typeKey = Object.keys(plotType).find(key => plotType[key].name === node);
        const fields = [];
        fields.unshift(
          {name: "绘制类型", type: "text"},
          {name: "经度", type: "text"},
          {name: "纬度", type: "text"},
          {name: "高程", type: "text"},
          {name: "角度", type: "text"},
          {name: "开始时间", type: "text"},
          {name: "结束时间", type: "text"}
        );

        if (typeKey) {
          const typeData = plotType[typeKey];
          for (const [key, value] of Object.entries(typeData)) {
            // 仅处理有 content 的字段或 type 为 text 的字段
            const field = {
              name: value.name,
              type: value.type,
            };
            if (value.type !== 'text' && value.content) {
              field.content = value.content;
            }
            fields.push(field);
          }
        }
        fields.splice(7, 1); // 删除第九个元素
        return {
          name: node,
          fields: fields
        };
      });
      this.downloadConfirmed = true

      if(this.isLoaded) {
        this.downloadExcel()
      }
    },

    cancelDownload() {
      this.excelContent = []
      this.selectVisible = false;
      this.selectedNodes = []
      this.isLoaded = false
      this.loading = false

      // 逐个取消勾选
      this.$refs.tree.setCheckedNodes([])
    },

    // 新方法展示与点击节点相关的name字段
    initializeTreeChildren(flag) {
      console.log(flag)
      if (flag === 'export') {

        this.excelPanel = "标绘点数据导出"

        const plotIds = this.plotList.map(plot => plot.plotId);
        const plotTypes = this.plotList.map(plot => plot.plotType);

        getExcelPlotInfo(plotIds, plotTypes).then(res => {
          console.log(res)

          // 提取 excelContent
          const excelContent = res.filter(item => item.plotInfo).map(item => {
            const {plotInfo, plotTypeInfo} = item;

            // 先提取绘制类型
            const drawTypeMap = new Map([
              ["point", "点"],
              ["polyline", "线"],
              ["polygon", "面"]
            ]);

            // 提取 plotTypeInfo 中的字段
            const plotTypeFields = plotInfo.plotType ? Object.values(plotType).find(team => team.name === plotInfo.plotType) : null;
            const filteredPlotTypeInfo = Object.keys(plotTypeFields).filter(key => key !== 'name')
              .reduce((obj, key) => {
                if (plotTypeInfo[key] !== undefined) {
                  obj[plotTypeFields[key].name] = plotTypeInfo[key];
                }
                return obj;
              }, {});

            // 返回提取的字段
            return {
              "绘制类型": drawTypeMap.get(plotInfo.drawtype) || "未知类型",
              "标绘类型": plotInfo.plotType,
              "经度": plotInfo.longitude,
              "纬度": plotInfo.latitude,
              "高程": plotInfo.elevation,
              "角度": plotInfo.angle,
              "开始时间": plotInfo.startTime,
              "结束时间": plotInfo.endTime,
              ...filteredPlotTypeInfo, // 保留 plotTypeInfo 中的字段
            };
          });
          console.log(excelContent)

          // 将数据调整为目标格式
          this.excelContent = excelContent.reduce((acc, item) => {
            const plotName = item["标绘类型"];
            const plotData = {
              "绘制类型": item["绘制类型"],
              "经度": item["经度"],
              "纬度": item["纬度"],
              "高程": item["高程"],
              "角度": item["角度"],
              "开始时间": item["开始时间"],
              "结束时间": item["结束时间"],
              // 将 plotTypeInfo 中的其他字段加入
              ...Object.fromEntries(
                Object.entries(item).filter(([key]) => !["绘制类型", "标绘类型", "经度", "纬度", "高程", "角度", "开始时间", "结束时间"].includes(key))
              )
            };

            // 查找已有的标绘名称对象
            const existingPlot = acc.find(plot => plot[plotName]);

            if (existingPlot) {
              // 如果存在，则将新数据推入数组
              existingPlot[plotName].push(plotData);
            } else {
              // 如果不存在，则新建一个对象
              acc.push({
                [plotName]: [plotData]
              });
            }

            return acc;
          }, []);

          console.log("调整后的数据格式:", this.excelContent);

        });
      } else {
        this.excelPanel = "下载导入标绘模板"
      }

      const excludedNames = [
        "直线箭头",
        "攻击箭头",
        "钳击箭头",
        "限制通行公路",
        "不可通行公路",
        "不可通行铁路",
        "不可用输、配电线路",
        "不可用输气管线",
        "不可用供水管网",
        "未搜索区域",
        "已搜索区域",
        "未营救区域",
        "已营救区域",
        "正在营救区域",
        "泥石流",
        "滑坡",
        "崩塌",
        "地面塌陷",
        "地面沉降"
      ];

      this.filteredPlotTreeData.forEach(rootNode => {
        if (rootNode.children) {
          rootNode.children.forEach(child => {
            let arr = this.plotPicture.filter(item => item.type === child.label);

            // 根据 flag 值决定是否应用过滤
            child.children = arr
              .filter(item => !excludedNames.includes(item.name)) // 过滤掉不需要的名称
              .map(item => ({
                label: item.name,
                uuid: item.uuid,
                children: [] // 初始化为空数组
              }));
          });
        }
      });
      this.loading = false;
      this.isLoaded = true;
    },

    beforeUpload(file) {
      const type = file.name.split('.').pop();
      // 获取不带扩展名的文件名
      const filename = file.name.slice(0, file.name.lastIndexOf('.'));

      console.log(filename)

      const isExcel = (type === "xlsx") || (type === 'xls');

      console.log(type)
      if (!isExcel) {
        this.$message({
          type: 'error',
          message: '附件格式错误，请重新上传xlsx或xls文件！'
        });
        return false;
      }

      // 创建 FileReader 对象来读取 Excel 文件
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});

        // 检查是否正确读取工作簿内容
        // console.log("工作簿内容：", workbook.Sheets);

        this.sheetData = workbook.Sheets

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 获取第一行第一列内容
        const firstCell = worksheet['A1'];
        if (!firstCell && firstCell !== "绘制类型") {
          this.$message({
              type: 'error',
              message: `文件的第一行数据有误，请检查文件内容！`
            }
          );
        }
      };

      reader.readAsArrayBuffer(file);
      this.uploadUrl = `http://localhost:8080/excel/importPlotExcel/${filename}&${this.eqid}`;
      // this.uploadUrl = `http://localhost:8080/excel/importPlotExcel/${filename}&${this.eqid}&${this.fieldMapping}`;
      return true;
    },

    handleSuccess(response) {

      try {
        // 直接处理数据
        this.handleData(response.data.plotIds);
      } catch (error) {
        // 捕获异常并提示错误
        ElMessage({
          message: '不能上传重复数据',
          type: 'error',
          duration: 3000,
        });
      }
    },

    convertToDateTimeString(excelDate) {
      if (!excelDate) return null;
      const date = new Date((excelDate - 25569) * 86400 * 1000);

      // 将小时减去8小时
      date.setHours(date.getHours() - 8);

      // 格式化日期为 "YYYY/MM/DD HH:MM:SS"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    },

    handleData(responseData) {
      // console.log("工作簿内容：", this.sheetData);
      // console.log("响应数据：", responseData);

      const plotIds = responseData;  // 获取 plotIds 数组
      let plotIdIndex = 0;  // 初始化索引来追踪当前 plotId

      const result = Object.keys(this.sheetData).map(sheetName => {
        const sheet = this.sheetData[sheetName];
        const headers = [];
        const rows = [];

        // 提取列标题
        for (const cell in sheet) {
          if (cell[0] !== '!') { // 排除 meta 信息
            const row = cell.match(/\d+/)[0];
            const col = cell.match(/[A-Z]+/)[0];

            if (row === '1') {
              headers.push({col, header: sheet[cell].v});
            }
          }
        }

        // 确定从 H 列开始提取字段
        const startColumnIndex = headers.findIndex(header => header.col === 'H');

        // 提取每一行数据
        for (let i = 2; i <= parseInt(sheet['!ref'].split(':')[1].match(/\d+/)[0]); i++) {
          const rowData = {};
          const plotInfo = {};

          headers.forEach((header, index) => {
            const cellAddress = `${header.col}${i}`;
            if (sheet[cellAddress] && sheet[cellAddress].v !== undefined) {
              let value = sheet[cellAddress].v;

              // 如果是开始时间或结束时间列，转换为精确日期时间格式
              if (header.header === "开始时间" || header.header === "结束时间") {
                value = this.convertToDateTimeString(value);
              }

              rowData[header.header] = value;

              // 从 H 列开始动态填充 plotInfo
              if (index >= startColumnIndex && header.header) { // 只处理从 H 列开始的标题
                plotInfo[header.header] = value;
              }
            }
          });

          // 将 plotInfo 中的字段映射到对应的 plotType 键
          const mappedPlotInfo = {};
          for (const key in plotInfo) {
            for (const teamKey in plotType) {
              const team = plotType[teamKey];
              for (const field in team) {
                if (team[field].name === key) {
                  mappedPlotInfo[field] = plotInfo[key];
                }
              }
            }
          }

          // 仅添加含有有效数据的行
          const hasValidData = Object.values(rowData).some(value => value !== null && value !== undefined && value !== '');
          if (hasValidData) {
            // 获取当前的 plotId，并递增索引
            const plotId = plotIds[plotIdIndex];
            plotIdIndex++;  // 增加索引，确保每行使用不同的 plotId

            const plotIcon = this.plotPicture.find(icon => icon.name === sheetName)?.img;
            rows.push({
              type: "point",
              operate: "add",
              data: {
                plot: {
                  earthquakeId: this.eqid,
                  plotId: plotId,  // 使用从 plotIds 数组中获取的 plotId
                  plotType: sheetName,
                  drawtype: "point",
                  icon: plotIcon,
                  geom: {
                    type: "Point",
                    coordinates: [rowData["经度"], rowData["纬度"]]
                  },
                  elevation: rowData["高程"] || 0,
                  startTime: rowData["开始时间"],
                  endTime: rowData["结束时间"],
                  severity: null,
                  isDeleted: null,
                  creationTime: new Date().toISOString().slice(0, 19)
                },
                plotInfo: Object.keys(mappedPlotInfo).length > 0 ? {...mappedPlotInfo, plotId} : undefined // 只添加非空的 plotInfo
              },
            });
          }
        }

        return rows;
      });

      // 将结果扁平化成单个数组
      const flattenedResult = result.flat();

      // console.log("解析结果：", flattenedResult);

      this.ifPointAnimation(true)

      flattenedResult.forEach(data => {
        this.wsSendPoint(JSON.stringify(data)); // 将 data 转换为 JSON 字符串发送
        this.drawPoints(data.data.plot, true)
      });

      return flattenedResult;
    },

    // =================================================================================================================

    exportCesiumTheme() {

      const targetInfo = Object.keys(this.eqInfo).length === 0 ? this.tableData[0] : this.eqInfo;

      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          parseFloat(targetInfo.longitude),
          parseFloat(targetInfo.latitude),
          70000
        ),
        orientation: {
          heading: 6.283185307179581,
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });

      this.showLegend = true;

      const plotList = this.plotList;

      plotList.forEach(item => {
        const {plotType, icon} = item;

        if (plotType) {
          // 检查 this.legendPlotData 是否已有相同 plotType 的项
          const existingEntry = this.legendPlotData.find(entry => entry.plotType === plotType);

          if (existingEntry) {
            // 如果已有相同 plotType 的项，增加计数
            existingEntry.count += 1;
          } else {
            // 如果没有相同 plotType 的项，添加新项
            this.legendPlotData.push({plotType, count: 1, icon});
          }
        }
      });

      // console.log("标绘数据：",this.legendPlotData);

      setTimeout(() => {
        this.exportCesiumScene()
      }, 3000);
    },

    async exportCesiumScene() {

      // 开始导出时，显示加载动画
      this.loading = true;

      //  1: 禁用 Cesium 相机交互功能，防止用户在导出时误操作
      const cameraController = window.viewer.scene.screenSpaceCameraController;
      cameraController.enableRotate = false;
      cameraController.enableZoom = false;
      cameraController.enableTranslate = false;
      console.log("Cesium相机：", cameraController)

      //  2: 获取地图当前视野范围的经纬度，并加载经纬度线
      this.getLatLonBounds();  // 获取当前视野经纬度范围
      this.addLatLonLines();   // 添加经纬度线
      await this.waitForEntitiesToRender(this.latLonEntities.length);  // 等待经纬度线渲染完成

      try {
        //  3: 等待 Cesium 渲染完成并请求重新渲染
        await this.waitForCesiumRender();
        window.viewer.scene.requestRender();

        //  4: 获取 Cesium 场景的 Canvas 图像
        const cesiumCanvas = window.viewer.scene.canvas;
        const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片

        //  5-7: 分别渲染图例、距离标尺和指南针
        // const legendCanvas = await this.renderElementToCanvas('.noteContainer', '图例');
        const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
        const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');
        const legendCanvas = await this.renderElementToCanvas('.legend-container', '图例');

        //  8: 创建一个新的合成 Canvas
        const finalCanvas = this.createFinalCanvas();
        const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

        //  9: 将 Cesium 场景绘制到合成 Canvas 上
        await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);

        //  10-12: 分别绘制图例、距离标尺和指南针到合成 Canvas 上

        // 绘制 legendCanvas 到合成 Canvas 的右下角
        // finalContext.drawImage(legendCanvas, x, y);
        finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
        finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);
        finalContext.drawImage(legendCanvas, finalCanvas.width - legendCanvas.width, finalCanvas.height - legendCanvas.height)

        //  14: 将合成后的 Canvas 转换为图片
        this.previewImage = finalCanvas.toDataURL('image/png');

      } catch (error) {
        console.error('导出场景失败:', error);
      } finally {
        this.setPictureCreateTime()
        //  15: 恢复 Cesium 相机交互，并移除经纬度线
        cameraController.enableRotate = true;
        cameraController.enableZoom = true;
        cameraController.enableTranslate = true;

        this.latLonEntities.forEach(entity => {
          window.viewer.entities.remove(entity);  // 移除经纬度线
        });
        this.latLonEntities = [];

        this.getScreenCorners()
        // 分别处理四条边的数据
        const topData = {};
        const sideData = {};
        const bottomData = {};

        // 生成点数据
        this.generatePointsWithPercentage(this.corners.topStart, this.corners.topEnd, topData);
        this.generatePointsWithPercentage(this.corners.leftStart, this.corners.leftEnd, sideData);
        this.generatePointsWithPercentage(this.corners.bottomStart, this.corners.bottomEnd, bottomData);

        // 等待 DOM 渲染完成
        await nextTick();
        // 添加盒子
        const topContainer = document.querySelector('.top');
        const bottomContainer = document.querySelector('.bottom');
        const leftContainer = document.querySelector('.left');
        const rightContainer = document.querySelector('.right');

        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [topContainer].forEach(container => this.addBoxes(container, 'div_t', topData));

        // 为 leftContainer 和 rightContainer 生成盒子（反转顺序，从下往上显示）
        [leftContainer, rightContainer].forEach(container => this.addBoxes(container, 'div_l', sideData, true));

        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [bottomContainer].forEach(container => this.addBoxes(container, 'div_t', bottomData));

        this.loading = false;
      }
    },

    // 将元素渲染为 Canvas
    async renderElementToCanvas(selector, elementName) {
      const element = document.querySelector(selector);
      return await html2canvas(element, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });
    },

    // 创建最终合成的 Canvas
    createFinalCanvas() {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#cesiumContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#cesiumContainer').offsetHeight;
      return finalCanvas;
    },

    // 将图像绘制到 Canvas 上
    async drawImageToCanvas(context, imageSrc, x, y) {
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => img.onload = resolve);
      context.drawImage(img, x, y);
    },

    // 获取地图当前视野范围的最东、最西、最南、最北的经纬度，用于经纬度线的绘制
    getLatLonBounds() {
      const viewer = window.viewer;

      // 通过摄像机视角获取视野范围的边界矩形
      const rectangle = viewer.camera.computeViewRectangle();

      if (rectangle) {
        // 获取最西经度（west）、最东经度（east）、最南纬度（south）、最北纬度（north）
        this.rectangleBounds[0] = Math.ceil(Cesium.Math.toDegrees(rectangle.east));//向上取整，东方
        this.rectangleBounds[1] = Math.floor(Cesium.Math.toDegrees(rectangle.south));//南方
        this.rectangleBounds[2] = Math.floor(Cesium.Math.toDegrees(rectangle.west));//向下取整,西方
        this.rectangleBounds[3] = Math.ceil(Cesium.Math.toDegrees(rectangle.north));//北方
      }
    },

    waitForEntitiesToRender(entityCount) {
      return new Promise(resolve => {
        const scene = window.viewer.scene;

        // 监听渲染循环是否完成
        const checkEntitiesRendered = () => {
          const isRendered = this.latLonEntities.filter(entity => entity.show).length === entityCount;
          if (isRendered) {
            // 等待 Cesium 完成渲染
            const removePostRender = scene.postRender.addEventListener(() => {
              removePostRender(); // 确保只监听一次
              resolve();          // 确保渲染完成后再 resolve
            });
          } else {
            setTimeout(checkEntitiesRendered, 100); // 每100ms检查一次
          }
        };

        checkEntitiesRendered();
      });
    },

    // 下载图片
    downloadImage() {
      this.showLegend = false;
      this.legendPlotData = []
      // 获取要截取的 DOM 元素
      const elementToCapture = document.querySelector('.export-image');
      // 使用 html2canvas 截图
      html2canvas(elementToCapture, {
        useCORS: true, // 允许跨域请求，确保图片加载
        logging: true, // 打开日志以查看可能的错误
        scale: 2, // 提高图像质量
        backgroundColor: null // 使背景透明
      }).then(canvas => {
        // 将 canvas 转换为图片
        const finalImage = canvas.toDataURL('image/png');

        // 创建下载链接并触发下载
        const link = document.createElement('a');
        link.download = `${this.title.replace(
          /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
          "$1年$2月$3日")}级地震-标绘专题图.png`; // 设置下载文件名
        link.href = finalImage; // 设置图片来源
        link.click(); // 触发下载
      }).catch(error => {
        console.error('Error capturing the screenshot:', error);
      });
    },

    // 关闭预览窗口
    closePreview() {
      this.previewImage = null;
      this.showLegend = false;
      this.legendPlotData = []
    },


    // 添加经纬度线到 Cesium 场景
    addLatLonLines() {
      const viewer = window.viewer;
      const step = 0.5; // 间隔为 0.5 度
      const alpha = 0.7; // 白色透明度

      // 添加经度或纬度线所用的函数
      const addLines = (start, end, constantCoord, isLongitude) => {
        //start 和 end：表示线段的起始和结束位置。对于经度线，start 和 end 是经度的范围；对于纬度线，是纬度的范围。
        for (let coord = start; coord <= end; coord += step) {
          const positions = [];

          // 根据是否是经度线，调整另一个坐标的范围
          //isLongitude：指示当前绘制的是经度线（true）还是纬度线（false）。
          for (let varCoord = isLongitude ? this.rectangleBounds[1] : this.rectangleBounds[2];
               varCoord <= (isLongitude ? this.rectangleBounds[3] : this.rectangleBounds[0]);
               varCoord += step) {
            if (isLongitude) {
              positions.push(Cesium.Cartesian3.fromDegrees(coord, varCoord)); // 经度线：lon 固定，lat 变化
            } else {
              positions.push(Cesium.Cartesian3.fromDegrees(varCoord, coord)); // 纬度线：lat 固定，lon 变化
            }
          }

          const entity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 1,
              material: Cesium.Color.WHITE.withAlpha(alpha),  // 白色透明度稍高
              clampToGround: true
            }
          });
          this.latLonEntities.push(entity); // 将实体存储到数组中
        }
      };
      // 添加中国区域内的经度线
      addLines(this.rectangleBounds[2], this.rectangleBounds[0], 'longitude', true);

      // 添加中国区域内的纬度线
      addLines(this.rectangleBounds[1], this.rectangleBounds[3], 'latitude', false);
    },

    waitForCesiumRender() {
      return new Promise(resolve => {
        const scene = window.viewer.scene;
        const removeListener = scene.postRender.addEventListener(() => {
          removeListener();
          setTimeout(resolve, 500);  // 增加等待时间确保渲染完成
        });
        scene.requestRender();
      });
    },

    // 设置图片创建时间
    setPictureCreateTime() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份从0开始，需要加1
      const day = date.getDate();

      // 格式化日期为 YYYY年MM月DD日
      this.pictureCreateTime = `${year}年${month}月${day}日`;
    },

    getScreenCorners() {
      const viewer = window.viewer;
      const scene = viewer.scene;
      const canvas = scene.canvas;

      // 获取四个角的屏幕坐标
      const topLeft = new Cesium.Cartesian2(0, 0);
      const topRight = new Cesium.Cartesian2(canvas.width, 0);
      const bottomLeft = new Cesium.Cartesian2(0, canvas.height);
      const bottomRight = new Cesium.Cartesian2(canvas.width, canvas.height);

      // 将屏幕坐标转换为地球坐标
      const topLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topLeft));
      const topRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topRight));
      const bottomLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomLeft));
      const bottomRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomRight));

      // 获取经纬度
      this.corners = {
        topStart: Cesium.Math.toDegrees(topLeftCartographic.longitude),
        topEnd: Cesium.Math.toDegrees(topRightCartographic.longitude),
        leftStart: Cesium.Math.toDegrees(bottomLeftCartographic.latitude),
        leftEnd: Cesium.Math.toDegrees(topLeftCartographic.latitude),
        bottomStart: Cesium.Math.toDegrees(bottomLeftCartographic.longitude),
        bottomEnd: Cesium.Math.toDegrees(bottomRightCartographic.longitude)
      };

      console.log(this.corners);
    },
    // 生成点和百分比，传入不同的标识符，避免共享同一数据集
    generatePointsWithPercentage(start, end, dataContext) {
      dataContext.points = [];
      dataContext.flexPercentages = [];

      const adjustedStart = Math.ceil(start / this.step) * this.step;
      const adjustedEnd = Math.floor(end / this.step) * this.step;

      for (let current = adjustedStart; current <= adjustedEnd; current += this.step) {
        dataContext.points.push(Number(current.toFixed(2)));
      }

      const basePercentage = (this.step / (end - start)) * 100;
      dataContext.divBoxCount = dataContext.points.length;
      dataContext.flexPercentages = Array(dataContext.divBoxCount).fill(basePercentage);

      this.calculateCustomValues(
        dataContext.points[0],
        dataContext.points[dataContext.points.length - 1],
        start,
        end,
        dataContext
      );
    },

    // 计算自定义值并保存到特定的数据上下文
    calculateCustomValues(firstPoint, lastPoint, start, end, dataContext) {
      const halfStep = this.step / 2;
      const number1 = end - start;

      const diffFirst = firstPoint - start;
      if (diffFirst > halfStep) {
        const percentageFirst = ((firstPoint - start - halfStep) / number1) * 100;
        dataContext.flexPercentages.unshift(percentageFirst);
        dataContext.points.unshift('');
      } else if (diffFirst < halfStep) {
        const percentage1 = (2 * (firstPoint - start) / number1) * 100;
        const percentage2 = ((halfStep - (firstPoint - start)) / number1) * 100;
        dataContext.flexPercentages.unshift(percentage1);
        dataContext.flexPercentages[1] = percentage2;
        dataContext.points.splice(1, 0, '');
      }

      const diffLast = end - lastPoint;
      if (diffLast > halfStep) {
        const percentageLast = ((end - lastPoint - halfStep) / number1) * 100;
        dataContext.flexPercentages.push(percentageLast);
        dataContext.points.push('');
      } else if (diffLast < halfStep) {
        const percentage1 = ((halfStep - (end - lastPoint)) / number1) * 100;
        const percentage2 = (2 * (end - lastPoint) / number1) * 100;
        dataContext.flexPercentages[dataContext.flexPercentages.length - 1] = percentage1;
        dataContext.flexPercentages.push(percentage2);
        dataContext.points.splice(-1, 0, '');
      }

      dataContext.divBoxCount = dataContext.points.length;
    },

    addBoxes(container, prefix, dataContext, reverse = false) {
      if (!container) return;
      let points = dataContext.points;
      let flexPercentages = dataContext.flexPercentages;

      // 如果需要反转顺序
      if (reverse) {
        points = [...points].reverse();
        flexPercentages = [...flexPercentages].reverse();
      }
      Array.from({length: dataContext.divBoxCount}).forEach((_, i) => {
        const box = document.createElement('div');
        box.className = `${prefix}${i}`;
        // 只对有效的数值进行转换
        if (points[i]) {
          box.textContent = this.convertToDMS(points[i], reverse);  // 转换为度分秒格式
        } else {
          box.textContent = '';  // 保留空值
        }
        container.appendChild(box);

        // 设置盒子样式
        const boxStyles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black',
          width: '19.47px',
          height: '19.47px',
          fontSize: '10px',
          flex: flexPercentages[i], // 使用反转后的 flexPercentages
          whiteSpace: 'nowrap', // 防止文字换行
        };

        // 如果 reverse 为 true，才旋转 90 度
        if (reverse) {
          boxStyles.transform = 'rotate(-90deg)';
        }

        // 应用样式
        Object.assign(box.style, boxStyles);
      });
    },

    // 将浮点数转换为度分秒格式
    convertToDMS(point, reverse) {
      const absolute = Math.abs(point);
      const degrees = Math.floor(absolute);  // 整数部分为度
      const minutes = Math.floor((absolute - degrees) * 60);  // 小数部分乘以 60 得到分
      const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);  // 小数部分乘以 60 再得到秒

      let direction;

      if (reverse) {
        // 只考虑南北方向
        direction = point >= 0 ? '北' : '南';
      } else {
        // 只考虑东西方向
        direction = point >= 0 ? '东' : '西';
      }

      return `${degrees}°${minutes}'${seconds}"${direction}`;
    },

    // -----------------------------------------------------------------------------------------------------------------

    getCheckedNodes() {
      // 获取所有已选中的节点，包括三级节点
      const checkedNodes = this.$refs.plotTree.getCheckedNodes();
      console.log("Checked nodes:", checkedNodes);
    },

    entityclustering() {
      // window.viewer.dataSource.cl
      let dataSource = new Cesium.CustomDataSource("myData");
      dataSource.entities.add()
      console.log(window.viewer.dataSources.clustering.enabled)
    },
    initPolygon(eqid) {
      let that = this
      getPlot({eqid}).then(res => {
        console.log(res, 8888)
        let data = res
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};

        polygonArr.forEach(item => {
          if (!polygonMap[item.plotId]) {
            polygonMap[item.plotId] = [];
          }
          polygonMap[item.plotId].push(item);
        });
        Object.keys(polygonMap).forEach(plotId => {
          let polygonData = polygonMap[plotId];
          console.log(polygonData, 8889)
          that.getDrawPolygonInfo(polygonData);
        });
      })
    },
    // 所有entity实体类型点击事件的handler（billboard、polyline、polygon）
    entitiesClickPonpHandler() {
      let that = this
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {

        // 如果正在绘制面，直接返回，不处理点击事件
        // console.log(window.isDrawingPolygon)
        if (window.isDrawingPolygon) return;
        // 1-1 获取点击点的信息（包括）


        let pickedEntity = window.viewer.scene.pick(click.position);
        // console.log("pickedEntity",pickedEntity)
        window.selectedEntity = pickedEntity?.id
        // console.log("entity------------------",window.selectedEntity)

        this.dataSourcePopupVisible = false
        if (window.selectedEntity === undefined) {
          this.popupVisible = false
          this.dataSourcePopupVisible = false
          this.popupData = {}
        }

        console.log(window.selectedEntity)

        if (Object.prototype.toString.call(window.selectedEntity) === '[object Array]' && window.selectedEntity[0]._layers !== "聚合标绘点") {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？

          this.updatePopupPosition(); // 更新弹窗的位置
          this.dataSourcePopupData = window.selectedEntity
          this.dataSourcePopupVisible = true
          this.popupVisible = false
        }
        // 2-1 判断点击物体是否为点实体（billboard）
        if (Cesium.defined(pickedEntity) && window.selectedEntity !== undefined && window.selectedEntity._billboard !== undefined) {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换data为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // 2-5 更新弹窗位置
          // that.selectedEntity = window.selectedEntity
          // that.popupData = {
          //   type: window.selectedEntity.properties.type?window.selectedEntity.properties.type.getValue():"",
          //   time: window.selectedEntity.properties.time?window.selectedEntity.properties.time.getValue():"",
          //   name: window.selectedEntity.properties.name?window.selectedEntity.properties.name.getValue():"",
          //   lon: window.selectedEntity.properties.lon?window.selectedEntity.properties.lon.getValue():"",
          //   lat: window.selectedEntity.properties.lat?window.selectedEntity.properties.lat.getValue():"",
          //   describe: window.selectedEntity.properties.describe?window.selectedEntity.properties.describe.getValue():"",
          // };
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}

          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
        } else {
          // this.popupVisible = false; // 隐藏弹窗
          // this.popupData = {}
        }
        // 3-1 选中面时触发
        if (Cesium.defined(pickedEntity) && window.selectedEntity._polygon !== undefined) {
          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}
          console.log("实体：", window.selectedEntity)
          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
          // that.showPolygon = true
          // that.polygonPosition = window.selectedEntity
        } else {
          // this.showPolygon = false
        }
        // 4-1选中线时触发
        if (Cesium.defined(pickedEntity) && window.selectedEntity._polyline !== undefined && window.selectedEntity.properties.data && that.polylineStatus === 0) {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            console.log("虚拟位置")
            const cesiumPosition = window.selectedEntity.position;//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // console.log(window.selectedEntity,123)
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}
          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
          // let status = cesiumPlot.drawPolylineStatus()
          // if (status === 0) {
          //   that.showPolyline = true
          //   // that.polylinePosition = window.selectedEntity
          // }

        } else {
          // this.showPolyline = false
          // this.popupData = {}
        }
        if (Cesium.defined(pickedEntity) && window.selectedEntity._billboard && window.selectedEntity._id === 'center') {
          console.log("1123")
          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换data为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // 2-5 更新弹窗位置
          // that.selectedEntity = window.selectedEntity
          // that.popupData = {
          //   type: window.selectedEntity.properties.type?window.selectedEntity.properties.type.getValue():"",
          //   time: window.selectedEntity.properties.time?window.selectedEntity.properties.time.getValue():"",
          //   name: window.selectedEntity.properties.name?window.selectedEntity.properties.name.getValue():"",
          //   lon: window.selectedEntity.properties.lon?window.selectedEntity.properties.lon.getValue():"",
          //   lat: window.selectedEntity.properties.lat?window.selectedEntity.properties.lat.getValue():"",
          //   describe: window.selectedEntity.properties.describe?window.selectedEntity.properties.describe.getValue():"",
          // };
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}

          this.popupData = window.selectedEntity.properties.centerData ? window.selectedEntity.properties.centerData.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置

        } else {
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //LEFT_DOUBLE_CLICK

      // 必须有这个，拖动地图弹窗位置才会跟着移动
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (window.selectedEntity) {
          that.updatePopupPosition(); // 更新弹窗的位置
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    // 控制标绘时左侧面板是否禁用：传'none'禁用；传'auto'解禁
    toggleEnable(able) {

      const situationEqTableElements = document.querySelectorAll('.situation_eqTable');
      const noteContainerElements = document.querySelectorAll('.noteContainer');

      situationEqTableElements.forEach(element => {
        element.style.pointerEvents = able;
      });

      noteContainerElements.forEach(element => {
        element.style.pointerEvents = able;
      });
    },


    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, this.selectedEntityHighDiy)
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
        this.dataSourcePopupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },
    // 关闭弹窗
    closePlotPop() {
      this.popupVisible = !this.popupVisible
    },
    // 获取标绘图片数据
    getPlotPicture() {
      let that = this
      getPlotIcon().then(res => {
        // console.log(res)
        that.plotPicture = res.data
        // 设置plotTree初始样式
        // that.plotTreeClassification = res.filter(item=>item.type==="I类（次生地质灾害）")
      })
    },
    //--------------------------------------

    // 切换地震，渲染切换地震的标绘
    plotAdj(row) {
      this.eqInfo = row

      console.log("剩余1：", window.pointDataSource.entities)
      window.viewer.entities.removeAll();
      // 从 dataSource 中删除点
      if (window.pointDataSource) {
        window.pointDataSource.entities.removeAll();
        labeldataSource.entities.removeAll()
      }
      if (window.labeldataSource) {
          window.labeldataSource.entities.removeAll();; // 移除点
      }
      // console.log("剩余2：", window.pointDataSource.entities)
      Arrow.drawArr = []
      // console.log("row",row)
      this.eqid = row.eqid
      this.websock.eqid = this.eqid
      this.renderedPlotIds.clear(); // 清空已渲染 ID 集合
      this.initPlot(row.eqid)
      this.title = row.occurrenceTime + row.earthquakeName + row.magnitude
      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(parseFloat(row.longitude), parseFloat(row.latitude), 60000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });
      this.getEqInfo(this.eqid)
    },
    // 获取地震列表、以及最新地震的eqid、并渲染已有的标绘
    getEq() {
      let that = this
      getAllEq().then(res => {
        let resData = res.filter(item => item.magnitude >= 5)
        let data = []
        for (let i = 0; i < resData.length; i++) {
          let item = resData[i]
          item.time = resData[i].occurrenceTime.replace("T", " ")
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        that.getEqData = data
        that.total = resData.length
        that.tableData = that.getPageArr()
        that.eqid = that.tableData[0].eqid
        that.title = that.tableData[0].occurrenceTime.replace("T", " ") + that.tableData[0].earthquakeName + that.tableData[0].magnitude
        window.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(parseFloat(that.tableData[0].longitude), parseFloat(that.tableData[0].latitude), 60000),
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          }
        });
        // 建立WS
        this.initWebsocket()
        // that.websock.eqid = that.eqid
        this.initPlot(that.eqid)
        this.getEqInfo(that.eqid)
        // 初始化标绘所需的viewer、ws、pinia
        let cesiumStore = useCesiumStore()
        cesiumPlot.init(window.viewer, this.websock, cesiumStore)

        console.log("websock:", this.websock)
      })
    },
    // /取地震信息+开始结束当前时间初始化
    getEqInfo(eqid) {
      getEqById({id: eqid}).then(res => {
        //震中标绘点
        console.log("res", res)
        this.centerPoint = res
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.occurrenceTime)
        this.centerPoint.endtime = new Date(res.occurrenceTime + (7 * 24 * 60 * 60 * 1000 + 1000));

        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        this.eqendTime = new Date(this.eqstartTime.getTime() + ((7 * 24 + 5) * 60 * 60 * 1000));
        this.currentTime = this.eqstartTime

        this.updateMapandVariablebeforInit(this.centerPoint)
      })
    },
    //更新地图中心视角，更新变量：地震起止时间，渲染点
    updateMapandVariablebeforInit(data) {
      let centerData = {
        ...data,
        drawtype: data.plotid
      }
      //加载中心点
      viewer.entities.add({
        properties: {
          centerData
        },
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(this.centerPoint.longitude),
          parseFloat(this.centerPoint.latitude),
          parseFloat(this.centerPoint.height || 0)
        ),

        billboard: {
          image: centerstar,
          width: 60,
          height: 60,
          scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 确保 billboard 不被遮挡
        },
        label: {
          text: this.centerPoint.earthquakeName + parseFloat(this.centerPoint.magnitude).toFixed(1) + "级",
          show: true,
          font: '20px sans-serif',
          fillColor: Cesium.Color.RED,        //字体颜色
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小

          disableDepthTestDistance: Number.POSITIVE_INFINITY // 确保 billboard 不被遮挡
        },
        id: this.centerPoint.plotid,
        plottype: "震中",
        layer: "标绘点"
      });
      let that = this
      // that.smallViewer.entities.removeAll();
      // that.smallViewer.entities.add({
      //   position: Cesium.Cartesian3.fromDegrees(
      //       parseFloat(this.centerPoint.longitude),
      //       parseFloat(this.centerPoint.latitude),
      //       parseFloat(this.centerPoint.height || 0)
      //   ),
      //   billboard: {
      //     image: centerstar,
      //     width: 50,
      //     height: 50,
      //   },
      //   label: {
      //     text: this.centerPoint.position,
      //     show: true,
      //     font: '10px sans-serif',
      //     fillColor: Cesium.Color.RED,        //字体颜色
      //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      //     outlineWidth: 2,
      //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      //     pixelOffset: new Cesium.Cartesian2(0, -16),
      //   },
      //   id: this.centerPoint.plotid,
      //   plottype: "震中",
      // });
    },
    // 修改table header的背景色
    tableHeaderColor() {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
        // 'border-left-color': '#323843',
        // 'border-left-width': '1px',
        // 'border-left-style': 'solid',
        // 'border-right-color': '#323843',
        // 'border-right-width': '1px',
        // 'border-right-style': 'solid',
      }
    },
    // 修改table的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 === 1) {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#313a44',
          'color': '#fff',
          'padding': '10',
          'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      } else {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#304156',
          'color': '#fff',
          'padding': '10',
          'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      }
    },
    //数组切片
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
    //--------------tree------------------------

    handleNodeClick(data) {
      if (data.label !== "量算工具") {
        this.plotTreeClassification = []
        let arr = this.plotPicture.filter(item => {
          return item.type === data.label
        })
        this.plotTreeClassification = [...arr]
      } else {
        this.plotTreeClassification = []
      }
    },

    treeItemClick(item) {
      let data = {
        plot: {
          earthquakeId: this.eqid,
          plotId: null,
          drawtype: null,
          icon: null,
          severity: null,
          plotType: null,
          angle: null,
          creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
          elevation: null,
          startTime: null,
          endTime: null,
          isDeleted: false,
          geom: {
            type: "MultiPoint",
            coordinates: null
          }
        },
        plotinfo: null
      }

      let that = this
      // 删除全局视角锁定（解决箭头标绘绘制时双击会聚焦在点上）
      window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
      this.isShowMessageIcon = true
      this.messageIcon = item.img

      if (item.plottype === '点图层') {
        console.log("点图层")
        this.toggleEnable('none')
        this.openPointPop(item.name, item.img)
      } else if (item.name === '直线箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawStraightArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.name === '攻击箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawAttackArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.name === '钳击箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawPincerArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.plottype === '线图层') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          this.drawPolyline(item, resolve)
          this.polylineStatus = cesiumPlot.drawPolylineStatus()
        }).then((res) => {
          // console.log("线的什么时候传的res",res)
          let situationPlotData = []// situationplot表中的线数据
          // 使用封装好的 convertToGeoJsonLineStringAndHeights 方法
          let geom = this.convertToGeoJsonLineStringAndHeights(res.pointPosArr);

          // 创建 plotItem 对象
          let plotItem = {
            earthquakeId: that.eqid,
            plotId: res.plotId,
            time: res.timestampArr[0], // 假设传第一个时间点
            plotType: item.name,
            drawtype: "polyline",
            icon: item.img,
            geom: geom.lineString, // 使用封装好的 GeoJSON LineString，包含高度信息
            elevation: 0 || geom.heights[0], // 如果需要单独传海拔可以进一步处理
          };
          // 添加到数据数组
          situationPlotData.push(plotItem);
          that.polylineStatus = cesiumPlot.drawPolylineStatus()
          // let pl = window.viewer.entities.getById(situationPlotData[0].plotid);
          // pl.properties.data = situationPlotData
          // console.log(pl)
          this.openPolylinePop(item.name, situationPlotData)
        })
      } else {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          this.drawPolygon(item, resolve)
          this.polygonStatus = cesiumPlot.drawPolygonStatus()
        }).then((res) => {
          // console.log("res",res,item)
          // 调用 convertToGeoJsonLineStringAndHeights 方法，将 res.pointPosArr 转换
          let geoJsonData = this.convertToGeoJsonPolygonAndHeights(res.pointPosArr);

          let situationPlotData = []// situationplot表中的面数据
          // 创建一个新的对象，替换 res 中的 pointPosArr

          let plotItem = {
            ...res,  // 保留 res 中其他属性不变
            geom: geoJsonData.Polygon, // 使用转换后的 GeoJSON LineString
            elevation: 0 || geoJsonData.heights[0], // 单独的高度数组
          };
          // 删除 pointPosArr，替换为 geom 和 heights
          delete plotItem.pointPosArr;

          situationPlotData.push(plotItem)
          console.log("situationPlotData", situationPlotData)
          that.polygonStatus = cesiumPlot.drawPolygonStatus()
          this.openPolygonPop(res.plotType, situationPlotData)
        })
      }
    },

    //--------------点------------------------

    // 打开添加点标绘对话框
    // 打开添加点标绘对话框
    openPointPop(type, img) {
      let that = this;
      let cesiumStore = useCesiumStore();

      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus;

        // 1-3 生成点标注的handler
        console.log(111);
        cesiumPlot.initPointHandler(type, img, this.eqid, true).then(res => {
          that.addMarkDialogFormVisible = true;
          this.isShowMessageIcon = false;
          this.messageIcon = '';
          console.log(222);
          this.toggleEnable('auto')
        });
      }
    },
    // 画点
    drawPoint(pointInfo) {
      if (this.ifPointAnimate) {
        cesiumPlot.drawPoint(pointInfo, true)
      } else {
        cesiumPlot.drawPoint(pointInfo)
      }
    },
    drawPoints(pointInfo,bool) {
      cesiumPlot.drawPoints(pointInfo, bool, 5000);
    },
    ifPointAnimation(val) {
      this.ifPointAnimate = val
    },
    // 重置标绘信息填写的绑定数据
    resetAddMarkCollection() {
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同步进行
        cesiumStore.clearData()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addMarkDialogFormVisible = !this.addMarkDialogFormVisible
      })
    },
    // ws发送数据（只有点的是在这里）
    wsSendPoint(data) {
      this.websock.send(data)
    },

    //------------线------------
    openPolylinePop(plotType, situationPlotData) {
      this.toggleEnable('auto')
      //*在这里用promise传的值*/
      let that = this
      let cesiumStore = useCesiumStore()
      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus
        // 1-2 提示弹窗
        // this.message = ElMessage({
        //   message: '请点击地图添加标注点',
        //   type: 'info',
        //   duration: 0
        // })
        cesiumStore.setPolyilneInfo({plotType, situationPlotData})
        that.addPolylineDialogFormVisible = true
        this.isShowMessageIcon = false;
        this.messageIcon = '';

        // 1-3 生成点标注的handler
        // cesiumPlot.initPointHandler(type, img, this.eqid).then(res => {
        //   that.addMarkDialogFormVisible = true
        //   this.message.close(that.addMarkDialogFormVisible)
        // })
      }
    },
    drawPolyline(info, resolve) {
      cesiumPlot.drawActivatePolyline(info.name, info.img, this.eqid, resolve)
    },
    resetPolyline() {
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同步进行
        cesiumStore.clearPolyilneInfo()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addPolylineDialogFormVisible = !this.addPolylineDialogFormVisible
      })
    },
    // 画线
    drawN() {
      cesiumPlot.drawActivatePolyline("量算")
    },
    // 删除线
    deletePolyline() {
      let polyline = window.selectedEntity
      cesiumPlot.deletePolyline(polyline)
      this.showPolyline = false
    },

    //------------面-------------
    openPolygonPop(plotType, situationPlotData) {
      this.toggleEnable('auto')

      let that = this
      let cesiumStore = useCesiumStore()
      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus
        // 1-2 提示弹窗
        // this.message = ElMessage({
        //   message: '请点击地图添加标注点',
        //   type: 'info',
        //   duration: 0
        // })
        // console.log("situationPlotData",plotType,situationPlotData)
        cesiumStore.setPolygonInfo({plotType, situationPlotData})
        console.log("123", situationPlotData)
        that.addPolygonDialogFormVisible = true
        this.isShowMessageIcon = false;
        this.messageIcon = '';
        // 1-3 生成点标注的handler
        // cesiumPlot.initPointHandler(type, img, this.eqid).then(res => {
        //   that.addMarkDialogFormVisible = true
        //   this.message.close(that.addMarkDialogFormVisible)
        // })
      }
    },
    drawPolygon(info, resolve) {
      // console.log(info, "面")
      cesiumPlot.drawActivatePolygon(info.name, info.img, this.eqid, resolve)
    },
    //获取数据库数据绘制面
    getDrawPolygonInfo(info) {
      cesiumPlot.getDrawPolygon(info)
    },
    resetPolygon() {
      window.isDrawingPolygon = false;  // 启用标志位
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同步进行
        cesiumStore.clearPolygonInfo()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addPolygonDialogFormVisible = !this.addPolygonDialogFormVisible
      })
    },
    // 画面
    drawP() {
      cesiumPlot.drawActivatePolygon("量算面积")
    },
    // 删除面
    deletePolygon() {
      let polygon = window.selectedEntity//this.polygonPosition
      cesiumPlot.deletePolygon(polygon)
      this.showPolygon = false
    },
    showPopup() {
      this.popupVisiblePolygon = true;
    },
    // 处理弹窗确认
    handlePopupConfirm() {
      this.popupVisiblePolygon = false;
    },

    //------------------------------------------------------------------------------

    // cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
    // 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
        // 则表示已经设置了其他地形提供者
        // console.log("地形已加载")
        return true;
      }
      // console.log("地形未加载")
      return false;
    },
    watchTerrainProviderChanged() {
      let that = this
      window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
        this.popupVisible = false // 地形改变时关闭弹窗
        let tzs = []
        if (that.modelName === 1) {
          tzs[0] = 9
          tzs[1] = -567
        } else {
          tzs[0] = 15
          tzs[1] = -557
        }
        if (that.isTerrainLoaded()) {
          // that.changeHeight(tzs[0])
          // that.tz = tzs[0]
          // that.find()
        } else {
          // that.changeHeight(tzs[1])
          // that.tz = tzs[1]
          // that.find()
        }
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
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    convertToGeoJsonLineStringAndHeights(pointPosArr) {
      let coordinates = [];
      let heights = [];

      // 遍历 pointPosArr 数组，将 Cartesian 坐标转换为经纬度，并构建坐标数组和高度数组
      pointPosArr.forEach(cartesian => {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let height = cartographic.height; // 高度

        // 将经纬度按 [lon, lat] 形式存入坐标数组
        coordinates.push([longitude, latitude]);

        // 将高度存入高度数组
        heights.push(height);
      });

      // 返回包含 GeoJSON LineString 和高度数组的对象
      return {
        lineString: {
          type: "LineString",
          coordinates: coordinates
        },
        heights: heights // 高度单独返回
      };
    },
    convertToGeoJsonPolygonAndHeights(pointPosArr) {
      let coordinates = [];
      let heights = [];

      // 遍历 pointPosArr 数组，将 Cartesian 坐标转换为经纬度，并构建坐标数组和高度数组
      pointPosArr.forEach(cartesian => {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let height = cartographic.height; // 高度

        // 将经纬度按 [lon, lat] 形式存入坐标数组
        coordinates.push([longitude, latitude]);

        // 将高度存入高度数组
        heights.push(height);
      });

      // 返回包含 GeoJSON LineString 和高度数组的对象
      return {
        Polygon: {
          type: "Polygon",
          coordinates: [coordinates]
        },
        heights: heights // 高度单独返回
      };
    },
    /*获取目前相机所属高度*/
    updateZoomLevel(cameraHeight) {
      // console.log("层级",cameraHeight)
      // 根据相机高度设置 zoomLevel
      if (cameraHeight > 200000) {
        this.zoomLevel = '市'
      } else if (cameraHeight > 70000) {
        this.zoomLevel = '区/县'
      } else if (cameraHeight > 4000) {
        this.zoomLevel = '乡/镇'
      } else {
        this.zoomLevel = '村'
      }
    }
  }
}
</script>

<style scoped>

.eqtitle {
  background-color: #0d325f;
  width: 100%;
  height: 10%;
}

.eqtitle-text_eqname {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-left: 30px;
}

.posInfo {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.cesium-viewer-navigationContainer {
  display: none !important;
}

.plotTreeItem {
  margin: 3px;
}

.plottreetooltip {
  margin: 4px;
}

.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
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

.situation_eqTable {
  width: 530px;
  height: 310px;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 30px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.noteContainer {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 345px;
  left: 10px;
  width: 530px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 500px;
  top: 90px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.modelAdj {
  color: white;
  margin-bottom: 5px;
}


/* 修改element内置css不生效，则需要加上/deep/ */
/* 分页组件调整 */
.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

/* 树形结构调整 */
:deep(.el-pagination>.is-first) {
  color: #FFFFFF !important;
}

.plotTool {
  background: rgb(38 36 36) !important;
  color: #ffffff !important;
}

:deep(.plotTool .el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.plotTool .el-tree-node:focus > .el-tree-node__content) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0 !important;
}

.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10000;
}

img {
  max-width: 100%;
  vertical-align: top;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.download-button,
.cancel-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.download-button:hover,
.cancel-button:hover {
  background-color: #2980b9;
}

/* 确保按钮显示在图片的下方正中央 */
.preview-buttons {
  justify-content: center;
  margin-top: 10px;
}

.export-info {
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
}

.img_outbox {
  border: 3px solid black;
  padding: 20px;
}


.main_coantainer {
  border: 3px solid black;
  background-color: white;
}

.top_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.middow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  width: 19.47px;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.compassContainer {
  position: absolute;
  top: 20px; /* 距离顶部的像素 */
  right: 20px; /* 距离右侧的像素 */
  height: 120px;
  width: 160px;
  background: url(@/assets/compass.png) no-repeat center / cover;
  z-index: 20;
  transform-origin: center; /* 设置旋转中心 */
  transition: transform 0.5s; /* 动画效果 */
}

.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 10000;
}


</style>
