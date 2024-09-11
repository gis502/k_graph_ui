<template>
  <div id="cesiumContainer">
    <!--    <el-form class="tool-container">-->
    <!--    写功能按钮部分-->
    <!--    </el-form>-->
    <RouterPanel
        :visible="popupVisible"
        :position="popupPosition"
        :popupData="popupData"
    />
    <div id="supplies" :class="{ collapsed: !tableVisible }">
      <el-form class="eqTable">
        <div style="margin-bottom: 10px; padding: 10px; width: 100%;">
            <el-menu
                    class="el-menu-demo"
                    mode="horizontal"
                    background-color="#293038"
                    text-color="#fff"
                    active-text-color="#537BB7FF"
                    style="margin: 0;padding: 0"
            >
                <el-menu-item index="1">
                    <el-input
                            style="width: 140px;"
                            v-model="inputRadius"
                            placeholder="请输入查询内容"
                            clearable
                    ></el-input>
                </el-menu-item>
                <el-menu-item index="2" @click="searchSupply" style="width: 90px;">匹配物资</el-menu-item>
                <el-menu-item index="3" @click="search" style="width: 90px;">查找物资</el-menu-item>
                <el-menu-item index="4" @click="addDisasterPoint" style="width: 100px;">添加受灾点</el-menu-item>
                <el-menu-item index="5" @click="showAllSupplyPoints" style="width: 120px;">{{ showSupply }}</el-menu-item>
                <el-menu-item index="6" @click="route" style="width: 90px;">路径规划</el-menu-item>
                <el-menu-item index="7" @click="addArea" style="width: 110px;">添加障碍区域</el-menu-item>
                <el-menu-item index="8" @click="removeAll" style="width: 110px;">清空所有实体</el-menu-item>
                <el-menu-item index="9" @click="removePoint" style="width: 110px;">删除障碍区域</el-menu-item>
                <el-menu-item index="10" @click="removePolyline" style="width: 110px;">删除路径规划</el-menu-item>
                <el-menu-item index="11" @click="toggleTable" style="width: 130px;">{{ toolValue }}</el-menu-item>
            </el-menu>
<!--          <el-input-->
<!--              v-model="inputRadius"-->
<!--              placeholder="请输入搜查范围/km"-->
<!--              style="width: 150px; margin-right: 5px;"-->
<!--              clearable-->
<!--          ></el-input>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="searchSupply" style="width: 80px;">查找物资</el-button>-->
<!--          <el-input-->
<!--                  v-model="inputData"-->
<!--                  placeholder="请输入查询条件"-->
<!--                  style="width: 150px; margin-right: 5px;"-->
<!--                  clearable></el-input>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="search" style="width: 80px;">查询</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="addDisasterPoint" style="width: 80px;">添加受灾点</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="showAllSupplyPoints" style="width: 110px;">{{showSupply }}</el-button>-->
<!--          &lt;!&ndash;add&ndash;&gt;-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="route" style="width: 80px;">路径规划</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="addArea" style="width: 110px;">添加障碍区域</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="removeAll" style="width: 110px;">清空所有实体</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="removePoint" style="width: 110px;">删除障碍区域</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="removePolyline" style="width: 110px;">删除路径规划</el-button>-->
<!--          <el-button class="el-button&#45;&#45;primary" @click="toggleTable" style="width: 110px;">{{toolValue }}</el-button>-->
        </div>

        <el-table
            v-if="tableVisible"
            :data="showSuppliesList"
            style="width: 100%; margin-bottom: 5px; text-align: center"
            :stripe="true"
            :header-cell-style="tableHeaderColor"
            :cell-style="tableColor"
            :row-style="{ height: '40px' }"
            @row-click="showSupplyPoint"
        >
          <el-table-column
              prop="county"
              label="区域"
              width="200"
              show-overflow-tooltip
          ></el-table-column>
          <el-table-column
              prop="address"
              label="地址"
              width="320"
              show-overflow-tooltip
          ></el-table-column>
          <el-table-column
              prop="contactPerson"
              label="联系人"
              width="100"
          ></el-table-column>
          <el-table-column
              prop="contactPhone"
              label="联系电话"
          ></el-table-column>
          <el-table-column
              prop="disasterTentsCount"
              label="帐篷总数量"
              width="100"
          ></el-table-column>
          <el-table-column
              prop="raincoatsCount"
              label="雨衣总数量"
              width="100"
          ></el-table-column>
          <el-table-column
              prop="rainBootsCount"
              label="雨鞋总数量"
              width="100"
          ></el-table-column>
          <el-table-column
              prop="flashlightsCount"
              label="手电筒总数量"
              width="130"
          ></el-table-column>
        </el-table>

        <el-pagination
            v-if="tableVisible"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="total"
            class="pagination1"
            style="padding: 10px"
        >
        </el-pagination>
      </el-form>
    </div>

    <div
        v-if="showTips"
        id="supplies"
        :class="{ collapsed: !tableVisible }"
        style="margin-top: 450px; margin-left: 0%; width: 30%; overflow-y: auto; max-height: 180px;"
        @scroll="onScroll">
      <el-row>
        <el-button @click="walkStyle" :style="selectedWalk">步行</el-button>
        <el-button @click="driveStyle" :style="selectedDrive">驾驶</el-button>
      </el-row>
      <div slot="header" class="clearfix" style="color: white; margin-top: 5%;">
        <div>
          全程约 {{ totalRoute }} 米 {{ RouteWay }} 大概需要 {{ RouteTime }}
        </div>
        <div v-if="visibleGuilde">
          <div v-for="(guilde, index) in RouteGuilde" :key="index">
            {{ guilde.from }} 到 {{ guilde.to }} {{ guilde.dist }} m
          </div>
          <div v-if="loading" class="loading">加载中...</div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Source/Widgets/widgets.css";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import RouterPanel from "@/components/Cesium/RouterPanel.vue";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import {getEmergency} from "@/api/system/emergency.js";
import disasterReservesLogo from "@/assets/images/disasterReservesLogo.jpg";
import disasterSuppliesLogo from "@/assets/images/disasterSuppliesLogo.png";
import emergencyTeamLogo from "@/assets/images/emergencyTeamLogo.png";
// import bubbleImg from "@/assets/images/bubbles.png";
// -----
import start from "@/assets/start.svg";
import end from "@/assets/end.svg";
import {Entity} from "cesium";
import {getWay} from "@/api/system/routeplan.js";
import {walk} from "vue/compiler-sfc";
import {searchMaterialData} from "../../api/system/emergency.js";

export default {
  components: {
    RouterPanel,
  },
  name: "index",
  data() {
    return {
      viewer: null,
      pos: [],
      areas: [],
      RouteTime: " ", //全程所需时间
      RouteWay: " ", //行进方式
      showTips: false, //路径弹窗
      totalRoute: "", //全长
      cartime: "", //临时变量
      humantime: "", //临时变量
      visibleGuilde: false, //驾驶时导航显示
      selectedDrive: "",
      selectedWalk: "",
      RouteGuilde: [],
      loading: false,
        selectedMenu: '2-1', // 默认选中“匹配物资”
      // 资源快速匹配
      showSuppliesList: [],
      selectedSuppliesList: [],
      showIcon: [],
      tableVisible: true, // 显示表格
      isCollapsed: false, // 控制是否收缩
      toolValue: "隐藏数据列表",
      showSupply: "显示所有物资点",
      total: 0,
      pageSize: 5,
      currentPage: 1,
      addSupplyPointCurrently: {
        lng: 0,
        lat: 0,
        count: 0,
        position: "",
        type: "",
        tel: "",
      },
      inputRadius: "",
      inputData: '',
      canMarkPoint: false,
      DialogFormVisible: false,
      affectedPoints: [{lng: 103.0058, lat: 29.9794, position: "a"}],
      suppliesList: [],
      //-----------弹窗部分-------------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
    };
  },
  mounted() {
    this.init();
    this.entitiesClickPonpHandler();
    this.initPlot(this.id);
  },
  methods: {
    /** 计算两个坐标的距离，单位米 **/
    Distance(lng1, lat1, lng2, lat2) {
      //采用Haversine formula算法，高德地图的js计算代码，比较简洁 https://www.cnblogs.com/ggz19/p/7551088.html
      let d = Math.PI / 180;
      let f = lat1 * d,
          h = lat2 * d;
      let i = lng2 * d - lng1 * d;
      let e =
          (1 - Math.cos(h - f) + (1 - Math.cos(i)) * Math.cos(f) * Math.cos(h)) /
          2;
      return 2 * 6378137 * Math.asin(Math.sqrt(e));
    },
    sortedSuppliesList() {
      // 按照 disasterTentsCount 排序
      this.showSuppliesList = this.showSuppliesList
          .slice()
          .sort((a, b) => b.disasterTentsCount - a.disasterTentsCount);
    },
    toggleTable() {
      this.tableVisible = !this.tableVisible;
      this.toolValue = this.tableVisible ? "隐藏数据列表" : "显示数据列表";
    },
    init() {
      let that = this;
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息
      window.viewer = viewer;
      let options = {};
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
          103.0,
          29.98,
          1500,
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
      document.getElementsByClassName(
          "cesium-baseLayerPicker-sectionTitle"
      )[0].innerHTML = "影像服务";
      document.getElementsByClassName(
          "cesium-baseLayerPicker-sectionTitle"
      )[1].innerHTML = "地形服务";

      this.clickCount += 1;

      const ellipsoid = viewer.scene.globe.ellipsoid;
      const canvas = viewer.scene.canvas;
      const handler = new Cesium.ScreenSpaceEventHandler(canvas);

      let token = "34d101b55f6166c49c42aed5a7ed345c";
      viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url:
                "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                token,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
          })
      );
      //影像注记
      viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url:
                "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                token,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false,
          })
      );

      handler.setInputAction((movement) => {
        const cartesian = viewer.camera.pickEllipsoid(
            movement.position,
            ellipsoid
        );
        if (cartesian) {
          const cartographic = ellipsoid.cartesianToCartographic(cartesian);
          this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(
              cartographic.latitude
          ).toFixed(5);
          this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(
              cartographic.longitude
          ).toFixed(5);

          if (this.canMarkPoint) {
            this.DialogFormVisible = true;
            this.drawSite(
                this.addSupplyPointCurrently.lat,
                this.addSupplyPointCurrently.lng,
                this.clickCount,
                Cesium.Color.RED
            );
            // console.log("已添加标注点");
            this.canMarkPoint = false;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    initPlot() {
      getEmergency().then(res => {
        let {disasterReserves, disasterSupplies, emergencyTeam} = res;
        // console.log('获取到的res', res);

        this.suppliesList.push(disasterReserves, disasterSupplies, emergencyTeam);

        // 调用 `processPoints` 并传递不同的 `tableName`
        this.processPoints(disasterReserves, 'reserves', disasterReservesLogo, "救灾物资储备");
        this.processPoints(disasterSupplies, 'supplies', disasterSuppliesLogo, "抢险救灾装备");
        this.processPoints(emergencyTeam, 'emergencyTeam', emergencyTeamLogo, "雅安应急队伍");

        this.fetSupplyPoints();
      });
    },

    processPoints(pointArr, type, icon, tableName) {
      if (!Array.isArray(pointArr)) {
        console.error(`${tableName} 数据格式不正确`, pointArr);
        return;
      }

      pointArr = pointArr.filter(e => e.longitude !== null);

      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.id);
        if (existingEntity) {
          console.warn(`id为${element.id}的实体已存在。跳过此实体`);
          return;
        }

        // 检查经度、纬度和高度是否为有效数值
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          console.error(`id为${element.id}的实体的坐标无效或超出范围`, {longitude, latitude});
          return;
        }

        element.type = type;
        element.icon = icon

        // 添加实体
        this.addEntity(element, icon, tableName, longitude, latitude);
      });
    },

    addEntity(element, icon, tableName, longitude, latitude) {
      window.viewer.entities.add({
        id: element.id,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
          image: icon,
          width: 40,
          height: 40,
          eyeOffset: new Cesium.Cartesian3(0, 0, 0),
          color: Cesium.Color.WHITE.withAlpha(1),
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          depthTest: false,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
          tableName: tableName, // 动态传入的表名称
          ...element, // 将element对象展开，自动填充所有属性
          lon: element.longitude,
          lat: element.latitude
        }
      });
    },

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
    entitiesClickPonpHandler() {
      let that = this;
      // 处理点击事件
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 获取点击位置的实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedEntity?.id;

        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;

          // 判断实体类型并处理
          if (entity._billboard) {
            // 获取点击点的经纬度
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);

            // 如果有地形加载，更新高度
            let height = 0;
            if (this.isTerrainLoaded()) {
              height = viewer.scene.globe.getHeight(cartographic);
            }

            // 更新弹窗位置
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

            // that.popupData = entity.properties;

            // 解析 properties 以获取实际的数据
            let properties = {};
            entity.properties.propertyNames.forEach(name => {
              properties[name] = entity.properties[name].getValue();
            });
            that.popupData = properties;
            console.log("entity.properties作为弹窗数据:", that.popupData);

            this.popupVisible = true;
            this.updatePopupPosition();
          } else {
            this.popupVisible = false;
          }

          // 处理面实体
          if (entity._polygon) {
            that.showPolygon = true;
          } else {
            that.showPolygon = false;
          }

          // 处理线实体
          if (entity._polyline) {
            let status = cesiumPlot.drawPolylineStatus();
            that.showPolyline = (status === 0);
          } else {
            that.showPolyline = false;
          }
        } else {
          this.popupVisible = false;
        }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 确保在地图拖动时弹窗位置更新
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (that.popupVisible && window.selectedEntity) {
          that.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //--------------------弹窗----------------------
    // 判断是否有高程
    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          window.viewer.scene,
          this.selectedEntityHighDiy
      );
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x, //+ 20,
          y: canvasPosition.y, //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },

    //-----------附近资源快速匹配----------
    // 绘制点
    drawSite(lat, lng, id, color) {
      let point = {
        id: id,
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(lng),
            parseFloat(lat)
        ),
      };
      this.affectedPoints.push(point);
      if (viewer) {
        viewer.entities.add({
          position: point.position,
          point: {
            pixelSize: 10,
            color: color,
          },
        });
      }
    },

    fetSupplyPoints() {
      console.log("------------", this.suppliesList);
      this.selectedSuppliesList = this.suppliesList[0].concat(
          this.suppliesList[1]
      );
      this.selectedSuppliesList = this.selectedSuppliesList.concat(
          this.suppliesList[2]
      );
      this.showIcon = this.selectedSuppliesList;
      this.total = this.selectedSuppliesList.length;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      // 在数据更新后进行排序
      //  this.sortedSuppliesList();
      console.log("this.showSuppliesList-", this.showSuppliesList);
    },

    showSupplyPoint(row) {
      console.log("点击了：", row);
      this.showIcon = [];
      this.showIcon.push(row);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      if (this.showIcon[0].type === "reserves") {
          this.processPoints(this.showIcon, 'reserves', disasterReservesLogo, "救灾物资储备");
      } else if (this.showIcon[0].type === "supplies") {
          this.processPoints(this.showIcon, 'supplies', disasterSuppliesLogo, "抢险救灾装备");
      } else {
          this.processPoints(this.showIcon, 'emergencyTeam', emergencyTeamLogo, "雅安应急队伍");
      }
    },

    removePoints(entityArr) {
      entityArr.forEach((entity) => {
        // console.log("-----",entity.id)
        let id = entity.id;

        let existingEntity = window.viewer.entities.getById(id);
        if (existingEntity) {
          window.viewer.entities.removeById(id);
        } else {
        }
      });
    },

    showAllSupplyPoints() {
      let that = this;
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.initPlot()
    },

    search(){
        // this.inputData = this.inputRadius.toString()
        searchMaterialData(this.inputData).then(res => {
            console.log("search----------",res)
            this.selectedSuppliesList = res
            this.total = this.selectedSuppliesList.length;
            this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
            this.removePoints(this.suppliesList[0]);
            this.removePoints(this.suppliesList[1]);
            this.removePoints(this.suppliesList[2]);
            this.processPoints(res, 'reserves', disasterReservesLogo, "救灾物资储备");
        })
    },
    searchSupply() {
      if (!isNaN(parseFloat(this.inputRadius))) {
        let longitude = parseFloat(this.addSupplyPointCurrently.lng);
        let latitude = parseFloat(this.addSupplyPointCurrently.lat);
        const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        this.selectedSuppliesList = [];
        this.suppliesList.forEach((arr, index) => {
          arr.forEach((point) => {
            const pointLongitude = parseFloat(point.longitude);
            const pointLatitude = parseFloat(point.latitude);
            const initialPoint = Cesium.Cartesian3.fromDegrees(
                pointLongitude,
                pointLatitude
            );
            const distance =
                Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000; // 距离以公里为单位
            if (distance < this.inputRadius) {
              this.selectedSuppliesList.push(point);
            }
          });
        });
        this.total = this.selectedSuppliesList.length;
        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
        this.removePoints(this.showIcon);
        this.showIcon = [];
        this.showIcon = this.selectedSuppliesList;
          let reservesArr = [];
          let suppliesArr = []
          let emergencyTeamArr = []
        this.showIcon.forEach((item) => {

          if (item.type === "reserves") {
              reservesArr.push(item);
          } else if (item.type === "supplies") {
              suppliesArr.push(item);
          } else {
              emergencyTeamArr.push(item);
          }
        });
          this.processPoints(reservesArr, 'reserves', disasterReservesLogo, "救灾物资储备");
          this.processPoints(suppliesArr, 'supplies', disasterSuppliesLogo, "抢险救灾装备");
          this.processPoints(emergencyTeamArr, 'emergencyTeam', emergencyTeamLogo, "雅安应急队伍");
        this.selectPoints();
      }
    },
    // 查询指定范围内的物资点
    selectPoints() {
      if (!isNaN(parseFloat(this.inputRadius))) {
        // 确保 inputRadius 为数字类型  画圆的单位为m
        const radius = parseFloat(this.inputRadius) * 1000;
        // 将经纬度转换为 Cartesian3 类型
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(this.addSupplyPointCurrently.lng),
            parseFloat(this.addSupplyPointCurrently.lat)
        );
        viewer.entities.values.forEach((entity) => {
          if (entity.ellipse) {
            viewer.entities.remove(entity);
          }
        });
        viewer.entities.add({
          position: position,
          ellipse: {
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            material: Cesium.Color.GREEN.withAlpha(0.5),
          },
        });
      }
    },
    // 添加物资点
    addDisasterPoint() {
      this.canMarkPoint = true;
    },
    getPageArr(arr) {
      let newArr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        newArr.push(arr[start]);
      }
      return newArr;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
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
    // 修改table header的背景色
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
    //- ---------------------
    /** 以坐标点为中心，简单粗略的创建一个指定半径的圆，半径单位米，pointCount为构建圆的坐标点数（比如24个点，点越多越圆，最少3个点），返回构成圆的坐标点数组 **/
    CreateSimpleCircle(lng, lat, radius, pointCount) {
      //球面坐标不会算，转换成三角坐标简单点，经度代表值大约：0.01≈1km 0.1≈10km 1≈100km 10≈1000km
      let km = radius / 1000;
      let a = km < 5 ? 0.01 : km < 50 ? 0.1 : km < 500 ? 1 : 10;
      let b = this.Distance(lng, lat, lng + a, lat);
      let c = this.Distance(lng, lat, lng, lat + a);
      let rb = (radius / b) * a;
      let rc = (radius / c) * a;
      let arr = [];
      let n = 0,
          step = 360.0 / pointCount,
          N = 360 - step / 2; //注意浮点数±0.000000001的差异
      for (let i = 0; n < N; i++, n += step) {
        let x = lng + rb * Math.cos((n * Math.PI) / 180);
        let y = lat + rc * Math.sin((n * Math.PI) / 180);
        arr[i] = [x, y];
      }
      arr.push([arr[0][0], arr[0][1]]); //闭环
      return arr;
    },
    walkStyle() {
      this.visibleGuilde = false;
      this.RouteTime = this.humantime;
      this.RouteWay = "步行";
      this.selectedDrive = "backcolor: red";
      this.selectedWalk = "backcolor: white";
    },
    driveStyle() {
      this.visibleGuilde = true;
      if (this.cartime.includes("0时0分钟")) {
        this.RouteTime = "1分钟";
      } else {
        this.RouteTime = this.cartime;
      }
      this.RouteWay = "驾驶";
    },

    onScroll(event) {
      const container = event.target;
      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight;
      if (bottom && !this.loading) {
        this.loadMoreGuide();
      }
    },
    async loadMoreGuide() {
      this.loading = true;
      try {
        // 调用API获取更多的指南数据
        const newGuides = await this.fetchMoreGuides();
        this.RouteGuilde = [...this.RouteGuilde, ...newGuides];
      } catch (error) {
        console.error('Failed to load more guides', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchMoreGuides() {
      // 实现调用API逻辑
      return []; // 返回新的指南数据
    },
    route() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      let propertiesId = [];
      handler.setInputAction((event) => {
        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        // // 1-2 坐标系转换
        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);

        that.pos.push([lon, lat]);
        let billBoardId = Date.now();
        if (that.pos.length === 1) {
          that.billboardD(position, start, billBoardId);
          propertiesId.push(billBoardId);
        } else {
          that.billboardD(position, end, billBoardId);
          propertiesId.push(billBoardId);
        }
        if (that.pos.length === 2) {
          getWay({pathWay: that.pos, hardAreas: that.areas}).then((res) => {
            that.polylineD(res.path, propertiesId);
            that.pos = [];
            this.cartime = res.carTime;
            this.humantime = res.humanTime;
            this.driveStyle();
            this.walkStyle();
            this.totalRoute = res.distance.substring(0, 6);
            let list = [];
            for (let i = 1; i < res.instructions.length; i++) {
              if (res.instructions[i].name === "")
                res.instructions[i].name = "无名氏路";
              list.push({
                from: res.instructions[i - 1].name,
                to: res.instructions[i].name,
                dist: Math.floor(res.instructions[i - 1].distance),
              });
            }
            this.RouteGuilde = list;
          });
          that.showTips = true;
          //路径规划好后弹出气泡框
          // this.bubbleTips(position);
          // this.initTool(this.viewer.cesiumWidget.container);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //绘制路径的线
    polylineD(data, propertiesId) {
      let arr = [];
      for (let i = 0; i < data.length; i++) {
        let c3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
        // let cartographic = Cesium.Cartographic.fromDegrees(data[i][0],data[i][1])
        // let cartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic)
        arr.push(c3);
      }
      viewer.entities.add({
        polyline: {
          positions: arr,
          width: 10,
          depthFailMaterial: Cesium.Color.YELLOW,
          clampToGround: true,
        },
        properties: {
          propertiesId,
        },
      });
    },
    //绘制障碍物点的面
    polygonD(positions, id) {
      let arr = [];
      for (let i = 0; i < positions.length; i++) {
        let a = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);
        arr.push(a);
      }
      let polygon = new Entity({
        id: id,
        polygon: {
          hierarchy: arr,
          material: new Cesium.Color.fromCssColorString("#FFD700").withAlpha(
              0.2
          ),
          clampToGround: true,
        },
        properties: {},
      });
      viewer.entities.add(polygon);
    },
    //绘制半径的中心点
    pointD(position, id) {
      return viewer.entities.add({
        id: id,
        position: position,
        point: {
          pixelSize: 20,
          color: Cesium.Color.RED,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    //路径规划
    billboardD(position, img, billBoardId) {
      viewer.entities.add({
        id: billBoardId,
        position: position,
        billboard: {
          image: img,
          // width: 25,//图片宽度,单位px
          // height: 25,//图片高度，单位px // 会影响point大小，离谱
          // eyeOffset: new Cesium.Cartesian3(-1, 1, 0),//与坐标位置的偏移距离
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    addArea() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      handler.setInputAction((event) => {
        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        // // 1-2 坐标系转换
        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let ar = that.CreateSimpleCircle(lon, lat, 50, 24);
        that.areas.push({area: ar, name: "area_" + Date.now()});
        let id = "area_" + Date.now();
        that.pointD(position, id);
        that.polygonD(ar, id + "a");
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    removeAll() {
      viewer.entities.removeAll();
      this.areas = [];
    },
    removePoint() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        // let entity = window.selectedEntity = pickedEntity?.id
        let entity = pickedEntity?.id;
        if (Cesium.defined(pickedEntity) && entity._point !== undefined) {
          let id = entity.id;
          that.areas = that.areas.filter((area) => area.name !== id);
          viewer.entities.remove(entity);
          viewer.entities.removeById(id + "a");
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    removePolyline() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        let entity = (window.selectedEntity = pickedEntity?.id);
        if (
            Cesium.defined(pickedEntity) &&
            window.selectedEntity._polyline !== undefined
        ) {
          let propertiesId = entity.properties.propertiesId._value;
          for (let i = 0; i < propertiesId.length; i++) {
            console.log(propertiesId[i], propertiesId[i] + "");
            viewer.entities.removeById(propertiesId[i] + "");
          }
          viewer.entities.remove(entity);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //绑定点击事件
    //    bubbleTips(position) {
    //     if (!viewer) {
    //         console.error("Viewer is not initialized.");
    //         return;
    //     }
    //     // 文字内容
    //     var text = "Citizens Bank Park";
    //     // 添加背景面板
    //     var backgroundPanel = viewer.entities.add({
    //         position: position,
    //         billboard: {
    //             // 使用 CSS 样式的背景图像或在下面的代码中可以选择不同的背景图
    //             image: bubbleImg,
    //             pixelOffset: new Cesium.Cartesian2(0, -80), // 需要根据实际需要调整偏移
    //             width: 200, // 固定宽度或根据内容计算
    //             height: 100, // 固定高度或根据内容计算
    //         },
    //     });

    //     // 添加标签
    //     var label = viewer.entities.add({
    //         position: position,
    //         label: {
    //             text: text,
    //             font: "16pt Arial",
    //             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //             fillColor: Cesium.Color.WHITE,
    //             outlineColor: Cesium.Color.GRAY,
    //             outlineWidth: 2,
    //             verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //             pixelOffset: new Cesium.Cartesian2(0, -30), // 根据背景面板的高度调整标签的位置
    //             showBackground: true,
    //             backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
    //             backgroundPadding: new Cesium.Cartesian2(10, 6)
    //         }
    //     });

    //     // 添加点击事件处理（可选）
    //     viewer.screenSpaceEventHandler.setInputAction(function (click) {
    //         var pick = viewer.scene.pick(click.position);
    //         if (Cesium.defined(pick) && (pick.id === backgroundPanel || pick.id === label)) {
    //             console.log("Label or background panel clicked");
    //         }
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }

    initTool(frameDiv) {
      if (this.isInit) {
        return 0;
      }
      //弹窗容器div
      const rightdiv = document.createElement("DIV");
      rightdiv.className = "tooltipdiv-right";
      rightdiv.style = `
      position:absolute;
      width:200px;
      min-height:100px;
      max-height:300px;
      background:#fff;
      border-radius:4px;
      box-shadow: 2px 4px 5px #888888;
      `;

      //弹窗箭头div
      const arrow = document.createElement("DIV");
      arrow.className = "tooltip-arrow";
      arrow.style = `
      position:absolute;
      left:-24px;
      top:38px;
      width:0;
      height:0;
      border-top: 12px solid transparent;
      border-right: 12px solid #fff;
      border-bottom: 12px solid transparent;
      border-left: 12px solid transparent;`;
      rightdiv.appendChild(arrow);
      //标题div
      const title = document.createElement("DIV");
      title.className = "tooltipdiv-inner";
      title.style = `
      width:100%;
      height:25px;
      line-height:25px;
      text-align:center;
      background:red;
      `;
      rightdiv.appendChild(title);

      //内容div
      const content = document.createElement("DIV");
      content.className = "tooltipdiv-content";
      content.style = `
      width:200px;
      box-sizing:border-box;
      padding:10px 0 10px 10px;
      overflow-y:scroll;
      word-break:break-all;
      `;
      rightdiv.appendChild(content);

      this.addDiv = rightdiv;
      this.addtitle = title;
      this.addcontent = content;
      frameDiv.appendChild(rightdiv);

      this.isInit = true;
    },
  },
};
</script>

<style scoped>
.route-tool-container {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  /*width: 500px;*/
  /*height: 200px;*/
  top: 10px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

#cesiumContainer {
  height: calc(100vh - 50px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#supplies {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  /*width: 500px;*/
  /*height: 200px;*/
  top: 10px;
  left: 10px;
  width: 83vw;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  transition: width 0.3s; /* 平滑过渡效果 */
}

#supplies.collapsed {
  width: 80vw; /* 收缩时的宽度 */
}

.pagination1 {
  width: 40%;
  margin: 0 auto;
  color: white;
}

.pagination1 ::v-deep .el-pagination__total,
.pagination1 ::v-deep .el-pagination__jump {
  color: white; /* 设置“共多少条”和“前往 页”部分的颜色为白色 */
}

.el-table {
  background-color: #ffffff00;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.loading {
  text-align: center;
  margin: 10px;
  color: #999;
}
</style>
