<template>
  <div>
    <div class="eqtitle">
      <span class="eqtitle-text_eqname">{{ this.title }}级地震</span>
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
          <el-table-column prop="position" label="位置">
            <template #default="scope">
              <el-popover placement="top" :width="300" trigger="hover" v-if="scope.row.position.length>=10">
                <div>{{ scope.row.position }}</div>
                <template #reference>
                  <div>
                    <span class="posInfo">
                      {{ scope.row.position }}
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
            <el-tree :data="plotTreeData" :props="defaultProps" @node-click="handleNodeClick" accordion></el-tree>
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
          @drawPoint="drawPoint"
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
          @clearMarkDialogForm="resetPolygon"
      />
      <commonPanel
          :visible="popupVisible"
          :position="popupPosition"
          :popupData="popupData"
          @wsSendPoint="wsSendPoint"
          @closePlotPop="closePlotPop"
      />
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {ElMessage} from 'element-plus'
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlot, getPlotIcon} from '@/api/system/plot'
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

export default {
  components: {
    addMarkCollectionDialog, commonPanel, addPolygonDialog, addPolylineDialog
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
              label: 'I类（救援力量类）'
            },
            {
              label: 'II类（救援行动类）'
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
        position: '',
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
  destroyed() {
    this.websock.close()
  },
  methods: {
    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium)
      Arrow.disable();
      Arrow.init(viewer);
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
      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'
    },
    // 初始化ws
    initWebsocket() {
      this.websock = initWebSocket(this.eqid)
      // this.websock.eqid = this.eqid
      // 为什么这样写不生效????
      // this.websock.onmessage = this.wsOnmessage()
      // this.websock.wsAdd = this.wsAdd()
    },
    // 获取本次地震数据库中的数据渲染到地图上
    initPlot(eqid) {
      let that = this
      getPlot({eqid}).then(res => {
        let data = res
        let pointArr = data.filter(e => e.drawtype === 'point')
        // -------------------------------------------
        // pointArr.forEach(item => {
        //   let point = {
        //     eqid: item.eqid,
        //     plotid: item.plotid,
        //     time: item.time,
        //     plottype: item.plottype,
        //     drawtype: item.drawtype,
        //     latitude: item.latitude,
        //     longitude: item.longitude,
        //     height: item.height,
        //     img: item.img,
        //   }
        //   that.drawPoint(point)
        // })
        // ----------------------------------------------
        let points = []
        pointArr.forEach(item => {
          let point = {
            eqid: item.eqid,
            plotid: item.plotid,
            time: item.time,
            plottype: item.plottype,
            drawtype: item.drawtype,
            latitude: item.latitude,
            longitude: item.longitude,
            height: item.height,
            img: item.img,
          }
          points.push(point)
        })
        that.drawPoints(points)
        console.log(window.viewer.dataSources)
        let polylineArr = data.filter(e => e.drawtype === 'polyline')
        cesiumPlot.getDrawPolyline(polylineArr)
        // 处理多边形数据
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};
        polygonArr.forEach(item => {
          if (!polygonMap[item.plotid]) {
            polygonMap[item.plotid] = [];
          }
          polygonMap[item.plotid].push(item);
        });
        Object.keys(polygonMap).forEach(plotid => {
          let polygonData = polygonMap[plotid];
          if (polygonData.length === 4) { // 确保有四个点
            that.getDrawPolygonInfo(polygonData);
            // console.log("数据库数据",polygonData)
          } else {
            console.warn(`多边形 ${plotid} 数据点数量不正确`);
          }
        });
        // that.entityclustering()
      })
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
        let data = res
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};

        polygonArr.forEach(item => {
          if (!polygonMap[item.plotid]) {
            polygonMap[item.plotid] = [];
          }
          polygonMap[item.plotid].push(item);
        });
        Object.keys(polygonMap).forEach(plotid => {
          let polygonData = polygonMap[plotid];
          if (polygonData.length === 4) { // 确保有四个点
            that.getDrawPolygonInfo(polygonData);
            // console.log("数据库数据",polygonData)
          } else {
            console.warn(`多边形 ${plotid} 数据点数量不正确`);
          }
        });
      })
    },
    // 所有entity实体类型点击事件的handler（billboard、polyline、polygon）
    entitiesClickPonpHandler() {
      let that = this
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 1-1 获取点击点的信息（包括）
        let pickedEntity = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedEntity?.id
        if (window.selectedEntity === undefined) {
          this.popupVisible = false
          this.popupData = {}

        }
        // 2-1 判断点击物体是否为点实体（billboard）
        if (Cesium.defined(pickedEntity) && window.selectedEntity !== undefined && window.selectedEntity._billboard !== undefined) {
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

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //LEFT_DOUBLE_CLICK

      // 必须有这个，拖动地图弹窗位置才会跟着移动
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (that.popupVisible && window.selectedEntity) {
          that.updatePopupPosition(); // 更新弹窗的位置
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
        that.plotPicture = res
        // 设置plotTree初始样式
        // that.plotTreeClassification = res.filter(item=>item.type==="I类（次生地质灾害）")
      })
    },
    //--------------------------------------

    // 切换地震，渲染切换地震的标绘
    plotAdj(row) {
      window.viewer.entities.removeAll();
      this.eqid = row.eqid
      this.websock.eqid = this.eqid
      this.initPlot(row.eqid)
      this.title = row.time + row.position + row.magnitude
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
          item.time = that.timestampToTime(resData[i].time)
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        that.getEqData = data
        that.total = resData.length
        that.tableData = that.getPageArr()
        that.eqid = that.tableData[0].eqid
        that.title = that.tableData[0].time + that.tableData[0].position + that.tableData[0].magnitude
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
      })
    },
    // /取地震信息+开始结束当前时间初始化
    getEqInfo(eqid) {
        getEqById({eqid: eqid}).then(res => {
        //震中标绘点

        this.centerPoint = res
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.time)
        this.centerPoint.endtime = new Date(res.time + (7 * 24 * 60 * 60 * 1000 + 1000));

        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        this.eqendTime = new Date(this.eqstartTime.getTime() + ((7 * 24 + 5) * 60 * 60 * 1000));
        this.currentTime = this.eqstartTime

        this.updateMapandVariablebeforInit()

      })
    },
    //更新地图中心视角，更新变量：地震起止时间，渲染点
    updateMapandVariablebeforInit() {
      //加载中心点
      viewer.entities.add({
        // properties: {
        //   type: "震中",
        //   time: this.centerPoint.time,
        //   name: this.centerPoint.position,
        //   lat: this.centerPoint.latitude,
        //   lon: this.centerPoint.longitude,
        //   describe: this.centerPoint.position,
        // },
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
          text: this.centerPoint.position + parseFloat(this.centerPoint.magnitude).toFixed(1) + "级",
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
      console.log(item)
      let that = this
      if (item.plotType === '点图层') {
        this.openPointPop(item.name, item.img)
      } else if (item.name === '直线箭头') {
        Arrow.draw("straightArrow");
      } else if (item.name === '攻击箭头') {
        Arrow.draw("attackArrow");
      } else if (item.name === '钳击箭头') {
        Arrow.draw("pincerArrow");
      } else if (item.plotType === '线图层') {
        new Promise((resolve, reject) => {
          this.drawPolyline(item, resolve)
          this.polylineStatus = cesiumPlot.drawPolylineStatus()
        }).then((res) => {
          let situationPlotData = []// situationplot表中的线数据
          for (let i = 0; i < res.pointPosArr.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(res.pointPosArr[i]);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            let height = Cesium.Math.toDegrees(cartographic.height);
            let plotItem = {
              eqid: that.eqid,
              plotid: res.plotid,
              time: res.timestampArr[i],
              plottype: item.name,
              drawtype: "polyline",
              img: item.img,
              latitude,
              longitude,
              height,
            }
            situationPlotData.push(plotItem)
          }
          that.polylineStatus = cesiumPlot.drawPolylineStatus()
          // let pl = window.viewer.entities.getById(situationPlotData[0].plotid);
          // pl.properties.data = situationPlotData
          // console.log(pl)
          this.openPolylinePop(item.name, situationPlotData)
        })
      } else {
        this.initPolygon(this.eqid)
        new Promise((resolve, reject) => {
          this.drawPolygon(item, resolve)
          this.polygonStatus = cesiumPlot.drawPolygonStatus()
        }).then((res) => {
          // console.log(res1,item)
          let situationPlotData = []// situationplot表中的面数据
          for (let i = 0; i < res.pointPosArr.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(res.pointPosArr[i]);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            let height = Cesium.Math.toDegrees(cartographic.height);
            let plotItem = {
              eqid: res.eqid,
              name: res.name,
              drawtype: "polygon",
              time: res.time,
              plotid: res.plotid,
              img: res.img,
              latitude,
              longitude,
              height,
              angle: res.angle
            }
            situationPlotData.push(plotItem)
          }
          that.polygonStatus = cesiumPlot.drawPolygonStatus()
          this.openPolygonPop(item.name, situationPlotData)
        })
      }
    },

    //--------------点------------------------

    // 打开添加点标绘对话框
    openPointPop(type, img) {
      let that = this
      let cesiumStore = useCesiumStore()
      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus
        // 1-2 提示弹窗
        this.message = ElMessage({
          message: '请点击地图添加标注点',
          type: 'info',
          duration: 0
        })
        // 1-3 生成点标注的handler
        cesiumPlot.initPointHandler(type, img, this.eqid, true).then(res => {
          that.addMarkDialogFormVisible = true
          this.message.close(that.addMarkDialogFormVisible)
        })
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
    drawPoints(pointInfo) {
      cesiumPlot.drawPoints(pointInfo)
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
    openPolylinePop(plottype, situationPlotData) {
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
        cesiumStore.setPolyilneInfo({plottype, situationPlotData})
        that.addPolylineDialogFormVisible = true
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
    openPolygonPop(plottype, situationPlotData) {
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
        cesiumStore.setPolygonInfo({plottype, situationPlotData})
        that.addPolygonDialogFormVisible = true
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
      // console.log(info, "面")
      cesiumPlot.getDrawPolygon(info)
    },
    resetPolygon() {
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

.el-tree {
  background: rgb(38 36 36) !important;
  color: #ffffff !important;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-tree-node:focus > .el-tree-node__content) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0 !important;
}
</style>
