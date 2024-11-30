<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <!--  小组件  -->
      <!--    <div class="layers">-->
      <!--      <div class="layer" title="雅安市行政区划" @click="toggleYaanLayer"><img src="../../../assets/images/DamageAssessment/yaanRegion.png"></div>-->
      <!--    </div>-->

      <!-- 左侧表单 -->
      <div class="eqTable" v-show="isLeftShow">

        <div class="eqListContent" v-if="currentTab === '震害事件'">
          <div style="display: flex">
            <!-- 搜索框 -->
            <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq" clearable>
            </el-input>
          </div>
          <!-- 地震列表 -->
          <div class="eqList">
            <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="locateEq(eq)">
              <!-- 圆圈震级 -->
              <div style="width: 55px">
                <div class="eqMagnitude"
                     :style="{ backgroundColor: eq.magnitude >= 4.5 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
                  {{ eq.magnitude }}
                </div>
              </div>

              <!-- 地震名称与简要信息 -->
              <div class="eqText">
          <span
            class="eqTitle">
            {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}{{ eq.magnitude }}级地震
          </span>
                <br/>
                <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ this.timestampToTime(eq.occurrenceTime, "fullDateTime") }}<br/>
            参考位置：{{ eq.earthquakeName }}<br/>
            震中经纬：{{ eq.longitude }}°E, {{ eq.latitude }}°N<br/>
            震源深度：{{ eq.depth }}千米
          </span>
              </div>

              <!-- 详情按钮 -->
              <div class="eqTapToInfo" @click="toTab(eq)">详情</div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              small
              layout="total, prev, pager, next"
              :total="filteredEqData.length"
              :page-size="pageSize"
              :current-page.sync="currentPage"
              @current-change="handleCurrentChange"
              style="margin: 0 20px"
            />
          </div>
        </div>

        <!--   指定地震   -->
        <div class="thisEq" v-if="currentTab !== '震害事件' && selectedTabData">
          <div class="eqInfo">
            <div style="height: 30px;display: flex;align-items: center">
              <div class="button return" @click="back()">返回</div>
            </div>
            <div style="height: 10px;background-color: #054576"></div>
            <el-divider content-position="left">
              <!--            <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 15px; width: 15px;">-->
              地震信息
            </el-divider>
            <div style="padding: 1px 20px 10px 20px">
              <!-- 显示选项卡内容 -->
              <h4>地震名称：{{ selectedTabData.earthquakeName }} {{ selectedTabData.magnitude }}级地震</h4>
              <p>发震时刻：{{ this.timestampToTime(selectedTabData.occurrenceTime, "fullDateTime") }}</p>
              <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
              <p>地震震级：{{ selectedTabData.magnitude }}</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 地震专题</el-divider>

            <div class="eqTheme">
              <div class="button themes circle" :class="{ active: isshowOvalCircle }"
                   @click="showOvalCircle()"> 烈度圈
              </div>
              <div class="button themes region" :class="{ active: isshowRegion }"
                   @click="toggleYaanLayer()"> 行政区划
              </div>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 大屏展示</el-divider>

            <div class="eqVisible">
              <div class="button toVisible" @click="navigateToVisualization(this.selectedTabData)"><img
                src="../../../assets/icons/svg/druid.svg" style="height: 25px;width: 25px;">可视化大屏展示
              </div>
            </div>

          </div>
        </div>

      </div>
      <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
           @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
        <img src="../../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
             style="height: 60%;width: 60%;">
      </div>
      <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
        <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
      </div>
    </div>

      <div id="legend" v-show="true"
           style="position: absolute;
           right: 500px;
         z-index:20; bottom: 100px;
         right: 450px; color: #FFFFFF;
         background-color: rgba(0, 0, 0, 0.5);
         padding: 10px; border-radius: 5px;text-align: center;">
          <div v-for="(item, index) in slopeStatistics" :key="index">
              <div style="display: flex; align-items: center; margin-bottom: 5px;">
                  <div
                          :style="{ width: '20px', height: '20px', marginRight: '10px', backgroundColor: item.color }">
                  </div>
                  <span style="width: 80px;text-align: left">{{ item.degree }}</span>
                  <span style="text-align: left">{{ item.proportion }}</span>
              </div>
          </div>
      </div>

      <div style="position: absolute;bottom: 300px;right: 500px;z-index:20;padding: 10px; border-radius: 5px;text-align: center;">
          <el-button @click="drawN">量算</el-button>
      </div>

  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import {getAllEq} from "@/api/system/eqlist";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan.json";
import {addOvalCircles} from "../../../cesium/plot/eqThemes.js";
import * as turf from '@turf/turf';
import Polyline from "../../../cesium/plot/Polyline.js"
import {
    Rectangle,
    Math as CesiumMath,
    Cartesian3,
    Cartographic,
    sampleTerrainMostDetailed,
    PolygonHierarchy, ClassificationType, Color
} from 'cesium';
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import {useCesiumStore} from "../../../store/modules/cesium.js";


export default {
  components: {
  },

  data() {
    return {
      websock: null,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      getEqData: [],
      filteredEqData: [],
      pagedEqData: [],

      selectedTabData: null,
      selectedEqPoint: null,

      title: "",
      isLeftShow: false,
      isFoldShow: true,
      isFoldUnfolding: false,
      isShow: false,
      isshowOvalCircle: false, //烈度圈显示隐藏

      tabs: [],
      currentTab: '震害事件', // 默认选项卡设置为『震害事件』

      listEqPoints: [], // 列表地震点
      area: null,
      // layerVisible: true, // 图层可见性状态
      isshowRegion: true,//行政区划
      RegionLabels: [],

        polygonPos: [], // 存储包围盒坐标
        slopes: [], // 存储坡度信息
        fxValues: [],
        fyValues: [],
        slopeCounts: [0, 0, 0, 0, 0], // 坡度范围计数
        totalCells: 0, // 总格子数
        clickCount: 0,
        firstClickPosition: null,
        secondClickPosition: null,
        isShowSlopeLegend: false,
        slopeStatistics: [
            {
                degree: '< 15°',
                color: '#00FF00',
                proportion: ''
            },
            {
                degree: '15°- 30°',
                color: '#FFFF00',
                proportion: ''
            },
            {
                degree: '30°- 45°',
                color: '#FFCC00',
                proportion: ''
            },
            {
                degree: '45°- 60°',
                color: '#FF7F00',
                proportion: ''
            },
            {
                degree: '> 60°',
                color: '#FF0000',
                proportion: ''
            }
        ]
    };
  },
  mounted() {
    this.init();
    this.getEq();
    // this.computeSpaceDistance()
    this.addSlopeCanvas()
  },
  beforeUnmount() {
    console.log("111",window.viewer)
    if (window.viewer){
      let viewer=window.viewer
      let gl=viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl=null
      window.viewer = null;
    }
  },
  methods: {
    // 获取地震列表并渲染
    getEq() {
      getAllEq().then((res) => {
        let resData = res.filter((item) => item.magnitude >= 4.5);
        let data = resData.map((item) => ({
          ...item,
          occurrenceTime: this.timestampToTime(item.occurrenceTime, "full"),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));

        this.getEqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
        // console.log("data:", data)
      });
    },

    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
      window.viewer = viewer;
        window.viewer.terrainProvider = Cesium.createWorldTerrain();
        // window.viewer.terrainProvider = viewer.terrainProviderViewModels;
        let options = {};
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.0, 29.98, 500000), // 设置经度、纬度和高度
      });
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
        103.0,
        29.98,
        500000,
        new Cesium.Cartographic()
      );
      options.enableCompass = true;
      options.enableZoomControls = true;
      options.enableDistanceLegend = true;
      options.enableCompassOuterRing = true;
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      window.navigation = new CesiumNavigation(viewer, options);
      document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
        "请输入地名进行搜索";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[0].innerHTML =
        "影像服务";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[1].innerHTML =
        "地形服务";

        // const ellipsoid = viewer.scene.globe.ellipsoid;
        // const canvas = viewer.scene.canvas;
        // let handler = new Cesium.ScreenSpaceEventHandler(canvas);
        //
        // handler.setInputAction((movement) => {
        //     let ray = viewer.camera.getPickRay(movement.position)
        //     let position = viewer.scene.globe.pick(ray, viewer.scene)
        //     let cartographic = Cesium.Cartographic.fromCartesian(position)
        //     let geom = this.cartographicToGeoJSON(cartographic)
        //     let longitude = geom.coordinates[0]
        //     let latitude = geom.coordinates[1]
        //     // console.log("geom----",geom)
        //     // this.drawSite(position)
        //     if (!this.firstClickPosition) {
        //         this.firstClickPosition = { longitude, latitude }
        //         // console.log("第一个点：",position)
        //         this.drawSite(position)
        //     } else if (!this.secondClickPosition) {
        //         this.secondClickPosition = { longitude, latitude }
        //         // console.log("第一个点：",position)
        //         this.drawSite(position)
        //         // 计算矩形的两个角点并打印
        //         this.printRectangleCoordinates(this.firstClickPosition, this.secondClickPosition);
        //         // 重置点击位置
        //         this.firstClickPosition = null;
        //         this.secondClickPosition = null;
        //     }
        // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        let cesiumStore = useCesiumStore()
        cesiumPlot.init(window.viewer, this.websock, cesiumStore)

        this.initMouseEvents();
      // this.initClickForRectangle()
      this.renderQueryEqPoints();
      this.addYaanLayer()
    },

      guid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              let r = Math.random() * 16 | 0,
                  v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
      },

      cartographicToGeoJSON(cartographic) {
          // 将 Cesium.Cartographic 弧度转换为 GeoJSON 所需的度
          let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
          let lat = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度

          // 返回 GeoJSON 格式的 Point 对象
          return {
              "type": "Point",
              "coordinates": [lon, lat]
          };
      },

    addYaanLayer() {
      //雅安行政区加载
      let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
        clampToGround: true, //贴地显示
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
        strokeWidth: 4,
      });
      geoPromise.then((dataSource) => {
        window.viewer.dataSources.add(dataSource);
        dataSource.name = 'YaanRegionLayer'; // 给图层取名字,以便删除时找到

        const colors = [
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
          {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
          {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
          {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
          {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
          {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
          {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
        ];
        dataSource.entities.values.forEach((entity, index) => {
          // console.log("dataSource entity",entity)
          // 根据实体索引依次从颜色数组中取颜色
          const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
          const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
          entity.polygon.material = colorMaterial; // 设置填充颜色
          // console.log("--------", index, "----------------", entity)
        });
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })

        //雅安行政区加载 end
      })
    },

    toggleYaanLayer() {
      // 切换图层显示与隐藏
      let yaanRegionLayer = window.viewer.dataSources.getByName("YaanRegionLayer")[0];
      if (yaanRegionLayer) {
        this.isshowRegion = !this.isshowRegion;
        yaanRegionLayer.show = this.isshowRegion; // 根据 isshowRegion 的值显示或隐藏图层
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
      }
      if (!this.isshowRegion) { //false
        // this.RegionLabels
        this.RegionLabels.forEach(entity => window.viewer.entities.remove(entity));
        this.RegionLabels = []
      }
    },

    // 鼠标事件监听
    initMouseEvents() {
      // 鼠标移动时设置指针样式
      window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = window.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 鼠标点击事件
      window.viewer.screenSpaceEventHandler.setInputAction((click) => {
        const pickedObject = window.viewer.scene.pick(click.position);

        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
           pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        }
        // 如果点击其他位置，隐藏所有地震点的标签
        else {
          this.selectedEqPoint.label._show._value = false;
          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },


      // ------------------------------坡面分析---------------------------
      // 计算矩形的四个角点并打印
      printRectangleCoordinates(firstPoint, secondPoint) {
          const minLon = Math.min(firstPoint.longitude, secondPoint.longitude);
          const maxLon = Math.max(firstPoint.longitude, secondPoint.longitude);
          const minLat = Math.min(firstPoint.latitude, secondPoint.latitude);
          const maxLat = Math.max(firstPoint.latitude, secondPoint.latitude);

          this.addSlopeCanvas(minLon,maxLon,minLat,maxLat)

          // console.log('矩形的经纬度范围：');
          // console.log('西南角: ', minLon, minLat);
          // console.log('东北角: ', maxLon, maxLat);
          // console.log('西北角: ', minLon, maxLat);
          // console.log('东南角: ', maxLon, minLat);
          // console.log('minLon: ', minLon);
          // console.log('maxLon: ', maxLon);
          // console.log('minLat: ', minLat);
          // console.log('maxLat: ', maxLat);

          // 你可以在这里绘制矩形或者进一步处理
      },

      drawSite(clickedPoint) {
          let point = {
              // id: id,
              // position: Cesium.Cartesian3.fromDegrees(
              //     parseFloat(clickedPoint.longitude),
              //     parseFloat(clickedPoint.latitude),
              //     parseFloat(clickedPoint.height)
              // ),
          };
          // this.affectedPoints.push(point);
          if (window.viewer) {
              window.viewer.entities.add({
                  position: clickedPoint,
                  point: {
                      pixelSize: 10,
                      color: Cesium.Color.RED,
                      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                      depthTest: false, // 禁止深度测试
                      disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
                  },
              });
          }
      },

      // addSlopeCanvas(minLon,maxLon,minLat,maxLat) {
      addSlopeCanvas() {
          // 测试区域
          const extent = turf.square([100.64, 28.22, 100.69, 28.27]);
          // const extent = turf.square([minLon, minLat, maxLon, maxLat]);
          // const extent = [minLon, minLat, maxLon, maxLat]
          // 获取包围盒坐标
          const polygonPos = turf.getCoord(extent);
          // const polygonPos = [minLon, minLat, maxLon, maxLat];
          this.polygonPos = polygonPos;

          const rectangle = Rectangle.fromDegrees(...polygonPos);
          // console.log("----------",rectangle)
          const width = 20; // 横向点数
          const height = 20; // 纵向点数
          const positions = [];

          // 格网度数
          const dx = (polygonPos[2] - polygonPos[0]) / width;
          const dy = (polygonPos[3] - polygonPos[1]) / height;

          // 格网距离
          const ddx =
              Cartesian3.distance(
                  Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
                  Cartesian3.fromDegrees(polygonPos[2], polygonPos[1])
              ) / width;
          const ddy =
              Cartesian3.distance(
                  Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
                  Cartesian3.fromDegrees(polygonPos[0], polygonPos[3])
              ) / height;

          console.log("111111")
          for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                  const longitude = CesiumMath.toDegrees(
                      CesiumMath.lerp(rectangle.west, rectangle.east, x / (width - 1))
                  );
                  const latitude = CesiumMath.toDegrees(
                      CesiumMath.lerp(rectangle.north, rectangle.south, y / (height - 1))
                  );

                  // 八连通点
                  positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude)); // w
                  positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude - dy / 2)); // ws
                  positions.push(Cartographic.fromDegrees(longitude, latitude + dy / 2)); // n
                  positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude + dy / 2)); // wn
                  positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude)); // e
                  positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude + dy / 2)); // en
                  positions.push(Cartographic.fromDegrees(longitude, latitude - dy / 2)); // s
                  positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude - dy / 2)); // es

                  // 顶点
                  positions.push(Cartographic.fromDegrees(longitude, latitude)); // mid
              }
          }

          console.log("222222")
          const slopes = [];
          const fxValues = [];
          const fyValues = [];

          // 创建等值线区域
          // let extent = [120, 30, 120.1, 30.1];
          let heightArr = [];
          // 等高线生成效果与控制点是否精细有关
          let pointGrid = turf.pointGrid(extent, 0.001, {
              units: "degrees",
          });

          // console.log(pointGrid.features, "pointGrid.features");
          for (let i = 0; i < pointGrid.features.length; i++) {
              heightArr.push(
                  Cesium.Cartographic.fromDegrees(
                      pointGrid.features[i].geometry.coordinates[0],
                      pointGrid.features[i].geometry.coordinates[1]
                  )
              );
          }

          // console.log(window.viewer.terrainProvider)
          setTimeout(()=>{
              // console.log(viewer._cesiumWidget.terrainProvider,viewer.terrainProvider)
              // sampleTerrainMostDetailed(viewer._cesiumWidget.terrainProvider, positions).then((updatedPositions) => {

              let arr = positions.concat(heightArr)
              sampleTerrainMostDetailed(window.viewer.terrainProvider, arr).then((updatedPositions) => {
                  let slopes = [];
                  let fxValues = [];
                  let fyValues = [];
                  let heightArr = [];
                  let testArr = [];
                  let breaks = [];

                  // 遍历 positions 部分，计算坡度和方向
                  for (let i = 0; i < updatedPositions.length; i += 9) {
                      if (i + 8 >= updatedPositions.length) break; // 防止越界

                      const westHeight = updatedPositions[i + 0].height;
                      const westSouthHeight = updatedPositions[i + 1].height;
                      const northHeight = updatedPositions[i + 2].height;
                      const westNorthHeight = updatedPositions[i + 3].height;
                      const eastHeight = updatedPositions[i + 4].height;
                      const eastNorthHeight = updatedPositions[i + 5].height;
                      const southHeight = updatedPositions[i + 6].height;
                      const eastSouthHeight = updatedPositions[i + 7].height;

                      const fx =
                          (westSouthHeight +
                              2 * southHeight +
                              eastSouthHeight -
                              (westNorthHeight + 2 * northHeight + eastNorthHeight)) /
                          (8 * ddx);
                      const fy =
                          (eastNorthHeight +
                              2 * eastHeight +
                              eastSouthHeight -
                              (westNorthHeight + 2 * westHeight + westSouthHeight)) /
                          (8 * ddy);

                      const slope = Math.atan(Math.sqrt(fx ** 2 + fy ** 2));
                      slopes.push(slope);
                      fxValues.push(fx);
                      fyValues.push(fy);
                  }

                  // 更新材质（假设 createMaterial 是用户自定义的函数）
                  console.log("Slope calculations complete");
                  this.slopes = slopes;
                  this.fxValues = fxValues;
                  this.fyValues = fyValues;
                  this.createMaterial();

                  // 创建 pointGrid 并计算等高线
                  let pointGrid = turf.pointGrid(extent, 0.001, { units: "degrees" });
                  for (let i = positions.length; i < updatedPositions.length; i++) {
                      heightArr.push(updatedPositions[i]); // 收集剩余位置的高度数据
                  }

                  // 将高度数据更新到 pointGrid
                  for (let i = 0; i < pointGrid.features.length; i++) {
                      pointGrid.features[i].properties.height = heightArr[i]?.height || 0;
                      testArr.push(heightArr[i]?.height || 0);
                  }

                  // 计算 breaks
                  testArr.sort((a, b) => a - b);
                  let minHeight = testArr[0];
                  let maxHeight = testArr[testArr.length - 1];
                  let step = (maxHeight - minHeight) / 10;
                  for (let i = 0; i < 10; i++) {
                      breaks.push(minHeight + i * step);
                  }

                  // 使用 turf.js 生成等高线
                  let lines = turf.isolines(pointGrid, breaks, { zProperty: "height" });

                  // 平滑等高线
                  lines.features.forEach((feature) => {
                      let coords = feature.geometry.coordinates;
                      let lineCoords = [];
                      coords.forEach((coord) => {
                          let line = turf.lineString(coord);
                          let curve = turf.bezierSpline(line);
                          lineCoords.push(curve.geometry.coordinates);
                      });
                      feature.geometry.coordinates = lineCoords;
                  });

                  // 加载等高线到 Cesium
                  Cesium.GeoJsonDataSource.load(lines, {
                      stroke: Cesium.Color.RED,
                      strokeWidth: 3,
                      fill: Cesium.Color.RED,
                      extruded: true,
                      clampToGround: true,
                  })
                      .then((contourSource) => {
                          window.viewer.dataSources.add(contourSource);
                          console.log("Contour lines added successfully");
                      })
                      .catch((error) => {
                          console.error("Error loading GeoJSON data:", error);
                      });
              });

          },5000)

      },

      createMaterial() {
          // console.log('坡度计算完成，材质生成逻辑在此实现');
          const canvas = this.toCanvas();
          // console.log("this.slopes-------------",this.slopes)
          console.log("666666")
          const positions = [
              Cartesian3.fromDegrees(this.polygonPos[0], this.polygonPos[1]),
              Cartesian3.fromDegrees(this.polygonPos[0], this.polygonPos[3]),
              Cartesian3.fromDegrees(this.polygonPos[2], this.polygonPos[3]),
              Cartesian3.fromDegrees(this.polygonPos[2], this.polygonPos[1]),
          ];
          window.viewer.entities.add({
              polygon: {
                  hierarchy: new PolygonHierarchy(positions),
                  material: new Cesium.ImageMaterialProperty({
                      image: canvas,
                  }),
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                  depthTest: false,//禁止深度测试但是没有下面那句有用
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
                  classificationType: ClassificationType.BOTH,
              },
          });

          console.log("7777777")
          const position = Cesium.Cartesian3.fromDegrees(
              100.69,
              28.22,
              50000
          );
          viewer.camera.flyTo({destination: position,})
      },

      toCanvas() {
          console.log("444444");
          const w = 20;
          const h = 20;
          const canvas = document.createElement("canvas");
          canvas.width = 2000; // 放大画布以便观察
          canvas.height = 2000;
          this.totalCells = w * h;
          const ctx = canvas.getContext("2d");
          const cellSize = canvas.width / w;

          this.slopeCounts = [0, 0, 0, 0, 0];
          const bitmap = new Uint8ClampedArray(w * h * 4); // 每像素 RGBA

          for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                  const slopeIndex = y * w + x;
                  const slope = this.slopes[slopeIndex];
                  const fx = this.fxValues[slopeIndex]; // x方向坡度分量
                  const fy = this.fyValues[slopeIndex]; // y方向坡度分量

                  let color;
                  let rangeIndex;

                  // 根据坡度范围分配颜色
                  if (slope < Math.PI / 18) {
                      rangeIndex = 0;
                      color = Color.fromCssColorString("#00FF00").withAlpha(0.4); // 浅绿色，透明度增大
                  } else if (slope < Math.PI / 12) {
                      rangeIndex = 1;
                      color = Color.fromCssColorString("#FFFF00").withAlpha(0.4); // 黄色，透明度增大
                  } else if (slope < Math.PI / 6) {
                      rangeIndex = 2;
                      color = Color.fromCssColorString("#FFCC00").withAlpha(0.4); // 橙色，透明度增大
                  } else if (slope < Math.PI / 4) {
                      rangeIndex = 3;
                      color = Color.fromCssColorString("#FF7F00").withAlpha(0.4); // 橘红色，透明度增大
                  } else {
                      rangeIndex = 4;
                      color = Color.fromCssColorString("#FF0000").withAlpha(0.4); // 红色，透明度增大
                  }
                  this.slopeCounts[rangeIndex]++;

                  // 绘制背景颜色
                  ctx.fillStyle = color.toCssColorString();
                  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


                  // 绘制箭头：主线加箭头头部
                  const centerX = x * cellSize + cellSize / 2;
                  const centerY = y * cellSize + cellSize / 2;

                  const arrowLength = cellSize / 2; // 调整箭头长度
                  let norm = Math.sqrt(fx ** 2 + fy ** 2) || 1; // 防止除以 0

                  if(fx * fy > 0){
                      norm = -norm
                  }

                  const directionX = fx / norm; // 反方向，确保箭头指向下坡
                  const directionY = fy / norm;

                  // 起点和终点的偏移量
                  const offsetX = directionX * arrowLength * 0.5;
                  const offsetY = directionY * arrowLength * 0.5;

                  const startX = centerX - offsetX;
                  const startY = centerY - offsetY;
                  const endX = centerX + offsetX;
                  const endY = centerY + offsetY;

                  // 绘制箭头主线
                  ctx.strokeStyle = "yellow"; // 箭头为黄色
                  ctx.lineWidth = 5; // 增加箭头线条宽度
                  ctx.beginPath();
                  ctx.moveTo(startX, startY);
                  ctx.lineTo(endX, endY);
                  ctx.stroke();

                  // 绘制箭头头部（三角形）
                  const arrowHeadSize = 10; // 调整箭头头部大小
                  const headX1 = endX - arrowHeadSize * (directionX - directionY);
                  const headY1 = endY - arrowHeadSize * (directionY + directionX);
                  const headX2 = endX - arrowHeadSize * (directionX + directionY);
                  const headY2 = endY - arrowHeadSize * (directionY - directionX);

                  ctx.beginPath();
                  ctx.moveTo(endX, endY);
                  ctx.lineTo(headX1, headY1);
                  ctx.lineTo(headX2, headY2);
                  ctx.closePath();
                  ctx.fillStyle = "yellow"; // 箭头头部为黄色
                  ctx.fill();
              }
          }

          const slopeRatios = this.slopeCounts.map(count => (count / this.totalCells * 100).toFixed(2) + "%");
          console.log("坡度范围比例：", slopeRatios);
          this.slopeStatistics[0].proportion = slopeRatios[0];
          this.slopeStatistics[1].proportion = slopeRatios[1];
          this.slopeStatistics[2].proportion = slopeRatios[2];
          this.slopeStatistics[3].proportion = slopeRatios[3];
          this.slopeStatistics[4].proportion = slopeRatios[4];

          const imageData = new ImageData(bitmap, w, h);
          ctx.putImageData(imageData, 0, 0); // 直接覆盖
          console.log("555555");
          return canvas;
      },


      // -------------------量算-----------------
      // 画线
      drawN() {
          let result = cesiumPlot.drawActivatePolyline("量算")
          console.log("量算-----结果1：",result)
      },


      computeSpaceDistance(){
          // [100.64, 28.22, 100.69, 28.27]
          const positions = [
              Cesium.Cartesian3.fromDegrees(-75.10, 39.57),
              Cesium.Cartesian3.fromDegrees(-77.10, 38.57)
          ];
          let polyline = new Polyline(window.viewer)
          let distance = polyline.getSpaceDistance(positions);
          console.log("result:",distance)
      },



      // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      this.isshowOvalCircle = false
      // 清空之前的点
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = []; // 重置 listEqPoints

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
              depthTest: false, // 禁止深度测试
              disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
          },
          label: {
            text: this.timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,  // 左侧对齐
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,   // 底部对齐
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: eq.eqid
        });
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);  // 保存实体到 listEqPoints
      });
    },

    locateEq(eq) {
      this.pickEqPoint(eq);
      this.renderQueryEqPoints();

      // 提取地震的经纬度
      const longitude = parseFloat(eq.longitude);
      const latitude = parseFloat(eq.latitude);

      // 设置相机的飞行动作
      window.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000), // 目标位置
        orientation: {
          heading: Cesium.Math.toRadians(0.0), // 朝向 (0度)
          pitch: Cesium.Math.toRadians(-90.0), // 俯仰角 (-45度)
          roll: Cesium.Math.toRadians(0.0) // 翻滚角 (0度)
        },
      });
    },

    toTab(eq) {
      this.currentTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
      if (this.currentTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.getEqData.find(
          eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.currentTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
        }
      }
    },

    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      // console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      viewer.entities.removeAll();
      this.renderQueryEqPoints();
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },

    back() {
      this.currentTab = '震害事件';
      this.selectedTabData = null;
      this.removeData()

      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
          103.0,
          29.98,
          500000
      );
      viewer.camera.flyTo({destination: position,})
    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.getEqData.filter((eq) => {
          const dateStr = this.timestampToTime(eq.occurrenceTime, 'date');
          const positionStr = eq.earthquakeName;
          const magnitudeStr = eq.magnitude;
          return (
            dateStr.includes(this.title) ||
            positionStr.includes(this.title) ||
            magnitudeStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.getEqData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    pickEqPoint(eq) {
      this.listEqPoints.forEach(entity => {
        entity.label._show._value = entity._id === eq.eqid;
        // console.log(entity.label)
      })
    },

    selectEqPoint() {
      // 检查 selectedTabData 是否存在
      if (this.selectedTabData) {
        // 清空 listEqPoints
        this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
        this.listEqPoints = [];

        // 避免选择同一选项卡时重复生成实体导致重叠
        window.viewer.entities.remove(this.selectedEqPoint);

        // 提取 selectedEqPoint
        this.selectedEqPoint = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            Number(this.selectedTabData.longitude),
            Number(this.selectedTabData.latitude)
          ),
          billboard: {
            image: eqMark,
            width: 25,
            height: 25,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: this.timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
              this.selectedTabData.earthquakeName +
              this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true, // 显示 label
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });

        // 渲染 selectedEqPoint
        // console.log("Selected Eq Point:", this.selectedEqPoint);
      } else {
        console.warn("No selectedTabData available");
      }
    },

    removeData() {
      this.removeEntitiesByType("ovalCircle")
      this.isshowOvalCircle = false
    },

    //烈度圈------------------------------------------------------------------
    showOvalCircle() {
      this.isshowOvalCircle = !this.isshowOvalCircle;
      console.log(this.isshowOvalCircle)
      if (this.isshowOvalCircle) {
        addOvalCircles(this.selectedTabData)
      } else {
        this.removeEntitiesByType("ovalCircle")
      }
    },

    //根据类型移除实体
    removeEntitiesByType(type) {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].properties?.type?.getValue() === type) {
          window.viewer.entities.remove(entities[i]);
        }
      }
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}`;
      window.open(path, '_blank');
    },

    // 时间戳转换
    timestampToTime(timestamp, format = "full") {
      let dateObj = new Date(timestamp);
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      let day = dateObj.getDate();
      let hh = dateObj.getHours();
      let mm = dateObj.getMinutes();
      let ss = dateObj.getSeconds();

      // 去掉前导零
      month = month > 9 ? month : month.toString().replace(/^0/, "");
      day = day > 9 ? day : day.toString().replace(/^0/, "");
      hh = hh > 9 ? hh : "0" + hh;
      mm = mm > 9 ? mm : "0" + mm;
      ss = ss > 9 ? ss : "0" + ss;

      if (format === "date") {
        // 返回仅日期格式
        return `${year}年${month}月${day}日`;
      } else if (format === "fullDateTime") {
        return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
      } else {
        // 返回完整的日期时间格式
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
      }
    },


  }
};
</script>

<style scoped lang="less">
.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

// 左侧地震面板
.eqTable {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 333px;
  height: calc(100% - 50px);
  z-index: 3;
  background-color: #2d3d51;
}

// 选项卡
.tab {
  display: flex;
  width: calc(100% - 30px);
  height: 40px;
  background-color: #2d3d51;
  color: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tabItem {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #0d325f;
  height: 40px;
  padding: 0 10px;
  white-space: nowrap;
}

.tabItem.active {
  background-color: #409eff;
}

.closeIcon {
  margin-left: 10px;
  cursor: pointer;
}

// 开关
.fold {
  position: absolute;
  top: 50px;
  right: 323px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 50px;
  background-color: #2d3d51;
  -webkit-border-top-left-radius: 10px;
  -webkit-border-bottom-left-radius: 10px;
  cursor: pointer;
  z-index: 4;
  transition: width 0.3s ease; /* 宽度过渡动画 */
}

.unfold {
  position: absolute;
  top: 50px;
  right: 0;
  width: 30px;
  height: 40px;
  background-color: rgba(48, 65, 86, 0.5);
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

// 搜索框
.query {
  width: calc(100% - 20px);
  margin: 10px;
}

// 地震列表
.eqList {
  position: relative;
  height: calc(85vh - 88px);
  overflow-y: auto;
}

.eqCard {
  display: flex;
  height: 110px;
  border-bottom: #0d325f 2px solid;
  cursor: pointer;
}

.eqCard:hover {
  background-color: #202933;
  transition: all 0.3s;
}

// 圆圈震级
.eqMagnitude {
  display: flex;
  height: 35px;
  width: 35px;
  margin: 10px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
}

// 地震简要文本信息
.eqText {
  padding-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.eqTitle {
  display: inline-block;
  max-width: 260px;
  position: relative;
  transform: translateX(0);
  will-change: transform;
  color: #409eff;
  font-size: 15px;
}

.eqText .eqTitle:hover {
  transform: translateX(-50%);
  transition: transform 5.0s ease;
}

.eqText .eqTitle {
  transition: none;
}

// 详情按钮
.eqTapToInfo {
  position: absolute;
  right: 10px;
  margin-top: 70px;
  width: 60px;
  height: 30px;
  border: #0d325f 1.5px solid;
  border-radius: 5px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.eqTapToInfo:hover {
  border: #2aa4f1 1.5px solid;
  color: #2aa4f1;
  transition: all 0.3s;
}

// 分页容器
.pagination {
  position: absolute;
  bottom: 0;
  width: 333px;
  background-color: #2d3d51;
  border: 2px solid #FFFFFF; /* 白色边框 */
}

::v-deep .pagination .el-pagination__total {
  color: white;
}

// 指定地震面板
.thisEq {
  height: 100%;
  overflow: auto;
}

.eqInfo {

}

.return {
  width: 40px;
  height: 25px;
  border: #fff 1px solid;
  border-radius: 8px;
  font-size: 12px;
  margin-left: auto; /* 使按钮靠右 */
}

.return:hover {
  border-color: #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.eqTheme {
  height: 150px;
  padding-left: 30px;
  margin: 0 auto;
  clear: both;
}

.themes {
  float: left;
  position: relative;
  margin: 5px 15px 15px 0;
  font-size: 15px;
  height: 34%;
  width: 44%;
  border: #fff 1px solid;
  cursor: pointer;
}

.themes:hover {
  background-color: #409eff;
  border: none;
}

.themes.active {
  background-color: #409eff;
  border: none;
}

// 大屏展示
.eqVisible {
  display: flex;
  height: 80px;
  width: 100%;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.toVisible {
  margin-bottom: 0;
  width: 200px;
  height: 50px;
  border: #fff 1px solid;
  border-radius: 25px;
  font-size: 18px;
}

.toVisible:hover {
  color: #409eff;
  border-color: #409eff;
  transition: all 0.3s;
}

// 底部面板
.panel {
  position: absolute;
  width: 100%;
  height: 250px;
  bottom: 0;
  z-index: 2;
}

.showPanel {
  position: absolute;
  left: 10px;
  bottom: 0;
  width: 120px;
  height: 40px;
  background-color: #2d3d51;
  -webkit-border-top-left-radius: 10px;
  -webkit-border-top-right-radius: 10px;
  z-index: 2;
}

.showPanel:hover {
  color: #2aa4f1;
  transition: all 0.3s;
}


::v-deep .el-divider__text.is-left {
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
}

h4, p {
  color: #fff;
}

p {
  font-size: 14px;
}

// 滚动条样式
::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

// 公共按钮，居中与字体颜色
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

span {
  color: #fff;
}


.layers {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 4;
}

.layer {
  width: 25px;
  height: 25px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

::v-deep .el-scrollbar {
  background-color: #2d3d51;
}

::v-deep .el-table__header-wrapper {
  background-color: #2d3d51;
}

::v-deep .el-table__inner-wrapper::before {
  display: none;
}

::v-deep .cesium-baseLayerPicker-dropDown {
  z-index: 1000;
}

::v-deep .compass {
  position: absolute;
  top: 20px;
  left: 20px;
}

::v-deep .navigation-controls {
  position: absolute;
  top: 120px;
  left: 53px;
}

</style>
