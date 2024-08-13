<template>
  <div id="cesiumContainer">
    <!--    <el-form class="tool-container">-->
    <!--    写功能按钮部分-->
    <!--    </el-form>-->
    <RouterPanel :visible="popupVisible" :position="popupPosition" :popupData="popupData"/>
    <div id="supplies">
      <el-form class="eqTable">
        <div style="margin-bottom: 10px;">
          <el-input v-model="inputRadius" placeholder="请输入搜查范围/km"
                    style="width: 170px;margin-right: 5px;" clearable>
          </el-input>
          <el-button class="el-button--primary" @click="searchSupply">查找物资</el-button>
          <el-button class="el-button--primary" @click="addDisasterPoint">添加受灾点</el-button>
          <el-button class="el-button--primary" @click="showAllSupplyPoints">{{ showSupply }}</el-button>
          <el-button class="el-button--primary" @click="toggleTable">{{ toolValue }}</el-button>
        </div>

        <el-table v-if="tableVisible" :data="showSuppliesList" style="width: 100%;margin-bottom: 5px;text-align: center"
                  :stripe="true"
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor"
                  :row-style="{height: '40px'}"
                  @row-click="showSupplyPoint">
          <el-table-column prop="county" label="区域" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="address" label="地址" width="320" show-overflow-tooltip></el-table-column>
          <el-table-column prop="contactPerson" label="联系人" width="100"></el-table-column>
          <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
          <el-table-column prop="disasterTentsCount" label="帐篷总数量" width="100"></el-table-column>
          <el-table-column prop="raincoatsCount" label="雨衣总数量" width="100"></el-table-column>
          <el-table-column prop="rainBootsCount" label="雨鞋总数量" width="100"></el-table-column>
          <el-table-column prop="flashlightsCount" label="手电筒总数量" width="130"></el-table-column>

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
        >
        </el-pagination>
      </el-form>
    </div>
  </div>
</template>

<script>

import * as Cesium from 'cesium'
import 'cesium/Source/Widgets/widgets.css'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import RouterPanel from '@/components/Cesium/RouterPanel.vue'
import cesiumPlot from '@/cesium/plot/cesiumPlot.js'
import {getEmergency} from "@/api/system/emergency.js";
import disasterReservesLogo from '@/assets/images/disasterReservesLogo.jpg';
import disasterSuppliesLogo from '@/assets/images/disasterSuppliesLogo.png';
import emergencyTeamLogo from '@/assets/images/emergencyTeamLogo.png';


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

      // 资源快速匹配
      showSuppliesList: [],
      selectedSuppliesList: [],
      showIcon: [],
      tableVisible: true, // 显示表格
      toolValue: "隐藏表格",
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
        tel: ""
      },
      inputRadius: "",
      canMarkPoint: false,
      DialogFormVisible: false,
      affectedPoints: [
        {lng: 103.0058, lat: 29.9794, position: 'a'}
      ],
      suppliesList: [],

      //-----------弹窗部分-------------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
    }
  },
  mounted() {
    this.init();
    this.entitiesClickPonpHandler()
    this.initPlot(this.id)
  },
  methods: {
    sortedSuppliesList() {
      // 按照 disasterTentsCount 排序
      this.showSuppliesList = this.showSuppliesList.slice().sort((a, b) => b.disasterTentsCount - a.disasterTentsCount);

    },
    toggleTable() {
      this.tableVisible = !this.tableVisible
      this.toolValue = this.tableVisible ? "隐藏表格" : "显示表格"
    },
    init() {
      let that = this
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权信息
      window.viewer = viewer;
      let options = {};
      options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500, new Cesium.Cartographic);
      options.enableCompass = true;
      options.enableZoomControls = true;
      options.enableDistanceLegend = true;
      options.enableCompassOuterRing = true;
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      window.navigation = new CesiumNavigation(viewer, options);
      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索';
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务';
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务';


      this.clickCount += 1;

      const ellipsoid = viewer.scene.globe.ellipsoid;
      const canvas = viewer.scene.canvas;
      const handler = new Cesium.ScreenSpaceEventHandler(canvas);

      handler.setInputAction((movement) => {
        const cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          const cartographic = ellipsoid.cartesianToCartographic(cartesian);
          this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
          this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);

          if (this.canMarkPoint) {
            this.DialogFormVisible = true
            this.drawSite(this.addSupplyPointCurrently.lat, this.addSupplyPointCurrently.lng,
                this.clickCount, Cesium.Color.RED);
            console.log("已添加标注点")
            this.canMarkPoint = false
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    initPlot() {
      getEmergency().then(res => {
        let disasterReserves = res.disasterReserves; // 提取 disasterReserves 列表
        let disasterSupplies = res.disasterSupplies; // 提取 disasterSupplies 列表
        let emergencyTeam = res.emergencyTeam; // 提取 emergencyTeam 列表
        console.log('获取到的res', res);
        // this.suppliesList = disasterReserves.concat(disasterSupplies)
        // this.showIcon = disasterReserves.concat(disasterSupplies)
        // this.fetSupplyPoints()
        // console.log("this.suppliesList--", this.suppliesList.length);
        // console.log("this.showIcon--", this.showIcon.length);
        this.suppliesList.push(disasterReserves)
        this.suppliesList.push(disasterSupplies)
        this.suppliesList.push(emergencyTeam)

        // 对 disasterReserves 进行处理
        if (Array.isArray(disasterReserves)) {
          let pointArr = disasterReserves.filter(e => e.longitude !== null);
          // 画点
          this.drawPointReserves(pointArr);
        } else {
          console.error("灾备物资数据格式不正确", disasterReserves);
        }

        // 对 disasterSupplies 进行处理
        if (Array.isArray(disasterSupplies)) {
          let pointArr = disasterSupplies.filter(e => e.longitude !== null);
          // 画点
          this.drawPointSupplies(pointArr);
        } else {
          console.error("救灾用品数据格式不正确", disasterSupplies);
        }
        this.fetSupplyPoints()

        // 对 emergencyTeam 进行处理
        if (Array.isArray(emergencyTeam)) {
          let pointArr = emergencyTeam.filter(e => e.longitude !== null);
          // 画点
          this.drawPointEmergencyTeam(pointArr);
        } else {
          console.error("雅安应急队伍数据格式不正确", emergencyTeam);
        }

      });
    },

    drawPointReserves(pointArr) {
      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.id);
        if (existingEntity) {
          console.warn(`id为${element.id}的实体已存在。跳过此实体`);
          return; // 跳过这个实体
        }

        // 检查经度、纬度和高度是否为有效数值
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude)) {
          console.error(`id为${element.id}的实体的坐标无效`, {longitude, latitude});
          return; // 跳过无效坐标的实体
        }
        // 检查经度和纬度是否在合理范围内
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          // console.error(`id为 ${element.id}的实体坐标超出范围`, { longitude, latitude });
          return; // 跳过坐标超出范围的实体
        }

        element.type = "reserves"

        // 如果不存在相同ID的实体，则准备新的实体
        window.viewer.entities.add({
          id: element.id,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
          billboard: {
            image: disasterReservesLogo, // 使用导入的图标路径
            width: 40, // 导入图标的宽度
            height: 40, // 导入图标的长度
            eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            color: Cesium.Color.WHITE.withAlpha(1), // 颜色
            scale: 0.8, // 缩放比例
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
            depthTest: false, // 禁止深度测试
            disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
          },
          properties: {
            tableName: "救灾物资储备",
            county: element.county,
            storagePointsCount: element.storagePointsCount,
            totalKitsCount: element.totalKitsCount,
            disasterTentsCount: element.disasterTentsCount,
            cottonBlanketsCount: element.cottonBlanketsCount,
            otherBlanketsCount: element.otherBlanketsCount,
            cottonClothesCount: element.cottonClothesCount,
            cottonCoatsCount: element.cottonCoatsCount,
            otherClothesCount: element.otherClothesCount,
            woolBlanketsCount: element.woolBlanketsCount,
            foldingBedsCount: element.foldingBedsCount,
            bunkBedsCount: element.bunkBedsCount,
            stripedClothBundlesCount: element.stripedClothBundlesCount,
            moistureMatsCount: element.moistureMatsCount,
            generatorsCount: element.generatorsCount, // 纠正：原代码错误地使用了其他BlanketsCount
            lightingFixturesCount: element.lightingFixturesCount,
            lightingKitsCount: element.lightingKitsCount,
            flashlightsCount: element.flashlightsCount,
            raincoatsCount: element.raincoatsCount,
            rainBootsCount: element.rainBootsCount,
            otherSuppliesCount: element.otherSuppliesCount,
            address: element.address,
            lon: element.longitude,
            lat: element.latitude,
            contactPerson: element.contactPerson,
            contactPhone: element.contactPhone,
            insertTime: element.insertTime
          }
        });
      });
    },
    drawPointSupplies(pointArr) {
      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.id);
        if (existingEntity) {
          console.warn(`id为${element.id}的实体已存在。跳过此实体`);
          return; // 跳过这个实体
        }

        // 检查经度、纬度和高度是否为有效数值
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude)) {
          console.error(`id为${element.id}的实体的坐标无效`, {longitude, latitude});
          return; // 跳过无效坐标的实体
        }
        // 检查经度和纬度是否在合理范围内
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          // console.error(`id为 ${element.id}的实体坐标超出范围`, { longitude, latitude });
          return; // 跳过坐标超出范围的实体
        }

        element.type = "supplies"

        // 如果不存在相同ID的实体，则准备新的实体
        window.viewer.entities.add({
          id: element.id,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
          billboard: {
            image: disasterSuppliesLogo, // 使用导入的图标路径
            width: 40, // 导入图标的宽度
            height: 40, // 导入图标的长度
            eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            color: Cesium.Color.WHITE.withAlpha(1), // 颜色
            scale: 0.8, // 缩放比例
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
            depthTest: false, // 禁止深度测试
            disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
          },
          properties: {
            tableName: "抢险救灾装备",
            id: element.id,
            county: element.county,
            totalItems: element.totalItems,
            infraredDetectors: element.infraredDetectors,
            opticalDetectors: element.opticalDetectors,
            hydraulicSpreaders: element.hydraulicSpreaders,
            hydraulicCutters: element.hydraulicCutters,
            rockDrills: element.rockDrills,
            crowbars: element.crowbars,
            rebarCutters: element.rebarCutters,
            hydraulicJacks: element.hydraulicJacks,
            lightSticks: element.lightSticks,
            fuelLiters: element.fuelLiters,
            tensileRopeMeters: element.tensileRopeMeters,
            rescueRopesMeters: element.rescueRopesMeters,
            ropeThrowers: element.ropeThrowers,
            foldingLadders: element.foldingLadders,
            shovelsPicksHooksForksHammers: element.shovelsPicksHooksForksHammers,
            foldingShovels: element.foldingShovels,
            whistles: element.whistles,
            helmets: element.helmets,
            rainBoots: element.rainBoots,
            gloves: element.gloves,
            lifelinesMeters: element.lifelinesMeters,
            drainagePumps: element.drainagePumps,
            fireBlowers: element.fireBlowers,
            ironShovels: element.ironShovels,
            lifeJackets: element.lifeJackets,
            lifeRings: element.lifeRings,
            warningTapesMeters: element.warningTapesMeters,
            walkieTalkies: element.walkieTalkies,
            megaphones: element.megaphones,
            gongs: element.gongs,
            headlamps: element.headlamps,
            portableLights: element.portableLights,
            medicalKits: element.medicalKits,
            excavators: element.excavators,
            loaders: element.loaders,
            waterPumps: element.waterPumps,
            relayPumps: element.relayPumps,
            mobileWaterBags: element.mobileWaterBags,
            backpackFireSprayers: element.backpackFireSprayers,
            chainsaws: element.chainsaws,
            hosesMeters: element.hosesMeters,
            fireTrucks: element.fireTrucks,
            otherSupplies: element.otherSupplies,
            address: element.address,
            lon: element.longitude,
            lat: element.latitude,
            contactPerson: element.contactPerson,
            contactPhone: element.contactPhone
          }
        });
      });
    },
    drawPointEmergencyTeam(pointArr) {
      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.id);
        if (existingEntity) {
          // console.warn(`id为${element.id}的实体已存在。跳过此实体`);
          return; // 跳过这个实体
        }

        // 检查经度、纬度和高度是否为有效数值
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude)) {
          console.error(`id为${element.id}的实体的坐标无效`, {longitude, latitude});
          return; // 跳过无效坐标的实体
        }
        // 检查经度和纬度是否在合理范围内
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          // console.error(`id为 ${element.id}的实体坐标超出范围`, { longitude, latitude });
          return; // 跳过坐标超出范围的实体
        }

        element.type = "emergencyTeam"

        // 如果不存在相同ID的实体，则准备新的实体
        window.viewer.entities.add({
          id: element.id,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
          billboard: {
            image: emergencyTeamLogo, // 使用导入的图标路径
            width: 40, // 导入图标的宽度
            height: 40, // 导入图标的长度
            eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            color: Cesium.Color.WHITE.withAlpha(1), // 颜色
            scale: 0.8, // 缩放比例
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
            depthTest: false, // 禁止深度测试
            disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
          },
          properties: {
            tableName: "雅安应急队伍",
            id: element.id,
            uniqueId: element.uniqueId,
            organization: element.organization,
            levelName: element.levelName,
            teamTypeName: element.teamTypeName,
            address: element.address,
            totalPersonnel: element.totalPersonnel,
            establishmentDate: element.establishmentDate,
            mainResponsibilities: element.mainResponsibilities,
            expertiseDescription: element.expertiseDescription,
            emergencyContactMethod: element.emergencyContactMethod,
            estimatedPreparationTime: element.estimatedPreparationTime,
            assemblyDepartureLocation: element.assemblyDepartureLocation,
            selfTransportation: element.selfTransportation,
            longitude: element.longitude,
            latitude: element.latitude,
            personInCharge: element.personInCharge,
            personInChargePhone: element.personInChargePhone,
            confidentialityLevel: element.confidentialityLevel,
            modifiedBy: element.modifiedBy,
            qualificationLevel: element.qualificationLevel,
            dataSource: element.dataSource,
            notes: element.notes
          }
        });
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
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, this.selectedEntityHighDiy)
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },

    //-----------附近资源快速匹配----------
    // 绘制点
    drawSite(lat, lng, id, color) {

      let point = {
        id: id,
        position: Cesium.Cartesian3.fromDegrees(parseFloat(lng), parseFloat(lat)),
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
      console.log("------------", this.suppliesList)
      this.selectedSuppliesList = this.suppliesList[0].concat(this.suppliesList[1])
      this.selectedSuppliesList = this.selectedSuppliesList.concat(this.suppliesList[2])
      this.showIcon = this.selectedSuppliesList
      this.total = this.selectedSuppliesList.length
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList)
      // 在数据更新后进行排序
      //  this.sortedSuppliesList();
      console.log("this.showSuppliesList-", this.showSuppliesList)
    },

    showSupplyPoint(row) {
      console.log("点击了：", row.type)
      this.showIcon = []
      this.showIcon.push(row)
      this.removePoints(this.suppliesList[0])
      this.removePoints(this.suppliesList[1])
      this.removePoints(this.suppliesList[2])
      if (this.showIcon[0].type === 'reserves') {
        this.drawPointReserves(this.showIcon)
      } else if (this.showIcon[0].type === 'supplies') {
        this.drawPointSupplies(this.showIcon)
      } else {
        this.drawPointEmergencyTeam(this.showIcon)
      }
    },

    removePoints(entityArr) {
      entityArr.forEach(entity => {
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
      let that = this
      viewer.entities.values.forEach(entity => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon)
      // this.drawPoint(this.suppliesList)
      // if(that.suppliesList[0].type === 'reserves'){
      //
      // }else{
      //     this.drawPointSupplies(that.suppliesList[0])
      //     this.drawPointSupplies(that.suppliesList[1])
      // }
      this.drawPointReserves(that.suppliesList[0])
      this.drawPointSupplies(that.suppliesList[1])
      this.drawPointEmergencyTeam(that.suppliesList[2])

    },

    searchSupply() {
      if (!isNaN(parseFloat(this.inputRadius))) {
        console.log(111)
        let longitude = parseFloat(this.addSupplyPointCurrently.lng);
        let latitude = parseFloat(this.addSupplyPointCurrently.lat);
        const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        this.selectedSuppliesList = [];
        this.suppliesList.forEach((arr, index) => {
          arr.forEach((point) => {
            const pointLongitude = parseFloat(point.longitude);
            const pointLatitude = parseFloat(point.latitude);
            const initialPoint = Cesium.Cartesian3.fromDegrees(pointLongitude, pointLatitude);
            const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000; // 距离以公里为单位
            if (distance < this.inputRadius) {
              this.selectedSuppliesList.push(point);
            }
          })

        });
        this.total = this.selectedSuppliesList.length
        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList)
        this.removePoints(this.showIcon)
        this.showIcon = []
        this.showIcon = this.selectedSuppliesList
        this.showIcon.forEach((item) => {
          let arr = []
          if (item.type === 'reserves') {
            arr.push(item)
            this.drawPointReserves(arr)
          } else if (item.type === 'supplies') {
            arr.push(item)
            this.drawPointSupplies(arr)
          } else {
            arr.push(item)
            this.drawPointEmergencyTeam(arr)
          }
        })
        this.selectPoints()
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
        viewer.entities.values.forEach(entity => {
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
      this.canMarkPoint = true
    },
    getPageArr(arr) {
      let newArr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        newArr.push(arr[start])
      }
      return newArr
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList)
    },
    tableHeaderColor() {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
      }
    },
    // 修改table header的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#313a44',
          'color': '#fff',
          'padding': '0',
          'text-align': 'center'
        }
      } else {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#304156',
          'color': '#fff',
          'padding': '0',
          'text-align': 'center'
        }
      }
    },
  }
}
</script>


<style scoped>
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
  width: 80vw;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
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

/deep/ .el-table--fit .el-table__inner-wrapper:before {
  width: 0%;
}

</style>

