<template>
  <div id="cesiumContainer" class="situation_cesiumContainer">
<!--    <div v-if="this.FaultZonePopupVisible" :style="styleObject">{{this.FaultZonepopupData}}-->
    <div v-if="this.FaultZonePopupVisible">111111111111111{{this.FaultZonepopupData}}
    </div>
    <!-- 左侧表单 -->
    <div class="eqTable" v-show="isLeftShow">

      <div class="eqListContent" v-if="currentTab === '震害事件'">
        <div style="display: flex">
          <!-- 搜索框 -->
          <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq">
          </el-input>
        </div>
        <!-- 地震列表 -->
        <div class="eqList">
          <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="locateEq(eq)">
            <!-- 圆圈震级 -->
            <div style="width: 60px">
              <div class="eqMagnitude"
                   :style="{ backgroundColor: eq.magnitude >= 4.5 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
                {{ eq.magnitude }}
              </div>
            </div>

            <!-- 地震名称与简要信息 -->
            <div class="eqText" style="width: 320px;">
          <span
            style="width: 320px;color: #409eff; font-size: 15px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;  ">
            {{ timestampToTime(eq.time, 'date') }}{{ eq.position }}{{ eq.magnitude }}级地震
          </span>
              <br/>
              <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ eq.time }}<br/>
            参考位置：{{ eq.position }}<br/>
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
            <h4>地震名称：{{ selectedTabData.position }} {{ selectedTabData.magnitude }}级地震</h4>
            <p>发震时刻：{{ selectedTabData.time }}</p>
            <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
            <p>地震震级：{{ selectedTabData.magnitude }}</p>
            <p>震源深度：{{ selectedTabData.depth }}千米</p>
            <p>参考位置：{{ selectedTabData.position }}</p>
          </div>

          <div style="height: 10px;background-color: #054576"></div>

          <el-divider content-position="left"> 地震专题</el-divider>

          <div class="eqTheme">
            <div class="button themes history" :class="{ active: isHistoryEqPointsShow }"
                 @click="showHistoryEqPoints(this.selectedTabData)"> 历史地震
            </div>
            <div class="button themes history" :class="{ active: isshowFaultZone }"
                 @click=" showFaultZone(this.selectedTabData)"> 断裂带
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
      <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" v-if="isFoldUnfolding" style="height: 60%;width: 60%;">
    </div>
    <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
      <img src="../../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 60%;width: 60%;cursor: pointer">
    </div>

    <!-- 底部面板(考虑代码差异性过大，设计成子组件形式) -->
    <div class="panel">
      <historyEqPanel v-if="isHistoryEqPointsShow"
                      :historyEqData="historyEqData"
                      :selectedTabData="selectedTabData"
                      @hidden="hidden"/>
    </div>

    <div class="button showPanel" v-if="!isHistoryEqPointsShow && isShow"
         @click="isHistoryEqPointsShow=true, isShow=false">
      展开专题详情
    </div>
  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import {getAllEq} from "@/api/system/eqlist";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import historyEqPanel from "../../../components/DamageAssessment/historyEqPanel.vue";
import fault_zone from "@/assets/geoJson/line_fault_zone.json";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
// import fault_zone from "@/assets/geoJson/fault_zone.json";
export default {
  components: {
    TimeLinePanel,
    historyEqPanel,
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
      historyEqData: [],
      historyEqPoints: [],

      title: "",
      isLeftShow: true,
      isFoldShow: true,
      isFoldUnfolding: false,
      isHistoryEqPointsShow: false,
      isShow: false,
      //烈度圈
      isshowFaultZone:false,
      FaultZonePopupVisible: false,
      FaultZonePopupPosition: { x: 0, y: 0 },
      FaultZonepopupData: '', // 弹窗内容，传值给子组件


      tabs: [],
      currentTab: '震害事件', // 默认选项卡设置为『震害事件』

      listEqPoints: [], // 列表地震点
      area: null,
      // FaultZonelayer:null,
      faultzonelines:[],
    };
  },
  mounted() {
    this.init();
    this.getEq();
    // // 生成实体点击事件的handler
    // this.entitiesClickPonpHandler()
    // this.watchTerrainProviderChanged()
  },

  methods: {
    // 获取地震列表并渲染
    getEq() {
      getAllEq().then((res) => {
        let resData = res.filter((item) => item.magnitude >= 4.5);
        let data = resData.map((item) => ({
          ...item,
          time: this.timestampToTime(item.time, "full"),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));

        this.getEqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
        console.log("data:", data)
      });
    },

    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
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
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[0].innerHTML =
          "影像服务";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[1].innerHTML =
          "地形服务";

      this.initMouseEvents();
      this.renderQueryEqPoints();
    },

    // 鼠标事件监听
    initMouseEvents() {
      window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = window.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      window.viewer.screenSpaceEventHandler.setInputAction((click) => {
        const pickedObject = window.viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        } else {
          this.selectedEqPoint.label._show._value = false;
          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
          this.historyEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      // 清空之前的点
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = []; // 重置 listEqPoints

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20
          },
          label: {
            text: this.timestampToTime(eq.time, 'date') + eq.position + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,  // 左侧对齐
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,   // 底部对齐
          },
          id: eq.eqid
        });

        this.listEqPoints.push(entity);  // 保存实体到 listEqPoints
      });
    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.getEqData.filter((eq) => {
          const dateStr = this.timestampToTime(eq.time, 'date');
          const positionStr = eq.position;
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
        console.log(entity.label)
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
          },
          label: {
            text: this.timestampToTime(this.selectedTabData.time, 'date') +
                this.selectedTabData.position +
                this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true, // 显示 label
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
          id: this.selectedTabData.id
        });

        // 渲染 selectedEqPoint
        console.log("Selected Eq Point:", this.selectedEqPoint);
      } else {
        console.warn("No selectedTabData available");
      }
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
      this.currentTab = `${eq.position} ${eq.magnitude}级地震`;
      if (this.currentTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.getEqData.find(
            eq => `${eq.position} ${eq.magnitude}级地震` === this.currentTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
        }
      }
    },

    back() {
      this.currentTab = '震害事件';
      this.selectedTabData = null;
    },

    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      viewer.entities.removeAll();
      this.renderQueryEqPoints();
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },

    showHistoryEqPoints(thisEq) {
      this.isHistoryEqPointsShow = !this.isHistoryEqPointsShow; // 切换状态

      if (this.isHistoryEqPointsShow) {

        if (this.area) {
          window.viewer.entities.remove(this.area);
          this.area = null;
        }

        // 添加圆圈
        this.area = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(thisEq.longitude), Number(thisEq.latitude)),
          ellipse: {
            semiMinorAxis: 50000.0,
            semiMajorAxis: 50000.0,
            material: Cesium.Color.YELLOW.withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            fill: true,
            clampToGround: true,
            height: 0,
            extrudedHeight: 0,
            rotation: 0,
          },
        });

        this.historyEqPoints.forEach(point => window.viewer.entities.remove(point));
        this.historyEqPoints = [];
        this.historyEqData = []; // 清空之前的数据

        const center = Cesium.Cartesian3.fromDegrees(Number(thisEq.longitude), Number(thisEq.latitude));

        // 渲染在圆圈内的地震点，并存储原始数据
        this.getEqData.forEach((eq) => {
          if (eq.eqid !== thisEq.eqid) {
            const position = Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude));

            if (this.isPointInEllipse(position, center, 50000.0, 50000.0)) {
              // 根据震级设置不同的图标大小
              const size = parseFloat(eq.magnitude) >= 6.0 ? 20 : 15;

              const point = window.viewer.entities.add({
                position: position,
                billboard: {
                  image: eqMark,
                  width: size,
                  height: size,
                },
                label: {
                  show: false,
                  showBackground: true,
                  text: this.timestampToTime(eq.time, 'date') + eq.position + eq.magnitude + '级地震',
                  font: '16px sans-serif',
                  fillColor: Cesium.Color.WHITE,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                },
              });

              this.historyEqPoints.push(point);
              this.historyEqData.push(eq);  // 存储原始数据
            }
          }
        });
      } else {
        if (this.area) {
          window.viewer.entities.remove(this.area);
          this.area = null;
        }

        this.historyEqPoints.forEach(point => window.viewer.entities.remove(point));
        this.historyEqPoints = [];
        this.historyEqData = []; // 清空数据
      }
    },


    // 判断点是否在椭圆内部的方法
    isPointInEllipse(point, center, semiMinorAxis, semiMajorAxis) {
      // 计算点到中心的距离
      const distance = Cesium.Cartesian3.distance(point, center);

      // 半径取最大值
      const radius = Math.max(semiMajorAxis, semiMinorAxis);

      // 判断点是否在圆内
      return distance <= radius;
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}`;
      window.open(path, '_blank');
    },

    hidden(hidden) {
      this.isHistoryEqPointsShow = hidden;
      this.isShow = true;
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
      } else {
        // 返回完整的日期时间格式
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
      }
    },

    //断裂带--------------------------------------------------------------------------------------
    //两条断裂带之间的距离
    getLonAndLatDistance(lonAndlat) {
      let [coordinate1, coordinate2] = lonAndlat;
      let [lon1, lat1] = [
        parseFloat(coordinate1[0]),
        parseFloat(coordinate1[1]),
      ];
      let [lon2, lat2] = [
        parseFloat(coordinate2[0]),
        parseFloat(coordinate2[1]),
      ];
      let [radlat1, radlat2] = [
        (lat1 * Math.PI) / 180.0,
        (lat2 * Math.PI) / 180.0,
      ];
      let a = radlat1 - radlat2;
      let b = (lon1 * Math.PI) / 180.0 - (lon2 * Math.PI) / 180.0;
      let s =
          2 *
          Math.asin(
              Math.sqrt(
                  Math.pow(Math.sin(a / 2), 2) +
                  Math.cos(radlat1) *
                  Math.cos(radlat2) *
                  Math.pow(Math.sin(b / 2), 2)
              )
          );
      s = s * 6378.137;
      return Math.round(s * 10000) / 10000;
    },
    //断裂带加载
    showFaultZone() {
      this.isshowFaultZone = !this.isshowFaultZone;
      if (this.isshowFaultZone) {
        // let lines = []
        this.faultzonelines = []
        fault_zone.forEach((item) => {
          for (let i = 0; i < item.lonlat[0].length; i++) {
            if (
                this.getLonAndLatDistance([
                  [this.selectedTabData.longitude, this.selectedTabData.latitude],
                  item.lonlat[0][i],
                ]) < 200
            ) {
              this.faultzonelines.push(item);
              break;
            }
          }
        })

        console.log("faultzonelines", this.faultzonelines)

        this.faultzonelines.forEach((item) => {
          let positionsArr = [];
          for (var i = 0; i + 1 < item.lonlat[0].length; i++) {
            positionsArr.push(
                parseFloat(item.lonlat[0][i][0]),
                parseFloat(item.lonlat[0][i][1]),
                0
            );
          }
          // console.log("positionsArr",positionsArr)
          window.viewer.entities.add({
            id: item.line,
            polyline: {
              status: 1,
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(positionsArr),
              width: 5,
              material: Cesium.Color.RED,
              depthFailMaterial: Cesium.Color.YELLOW,
              clampToGround: true,
            },
            properties: {
              name: item.name
            },
            layer: "断裂带"
          })
        })
      } else {
        this.faultzonelines.forEach(item => {
          const entity = viewer.entities.getById(item.line);
          if (entity._layer === "断裂带") {
            viewer.entities.removeById(item.line)
          }
        })
        this.faultzonelines = []
      }
    },
    // 所有entity实体类型点击事件的handler
    // 所有entity实体类型点击事件的handler（billboard、polyline、polygon）
    // entitiesClickPonpHandler() {
    //   let that = this
    //   window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
    //     // 1-1 获取点击点的信息（包括）
    //     let pickedEntity = window.viewer.scene.pick(click.position);
    //     window.selectedEntity = pickedEntity?.id
    //     console.log("window.selectedEntity pickedEntity",pickedEntity)
    //     this.FaultZonePopupVisible = false;
    //     if (Cesium.defined(pickedEntity)) {
    //       console.log("window.selectedEntity pickedEntity111",pickedEntity)
    //       let entity = window.selectedEntity;
    //       if (entity._layer === "断裂带") {
    //         console.log("window.selectedEntity entity",entity)
    //         // 2-2 获取点击点的经纬度
    //         let ray = viewer.camera.getPickRay(click.position)
    //         let position = viewer.scene.globe.pick(ray, viewer.scene)
    //         // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
    //         let cartographic = Cesium.Cartographic.fromCartesian(position);
    //         let latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //         let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    //
    //         // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
    //         let height = 0
    //         that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
    //         // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
    //         if (this.isTerrainLoaded()) {
    //           const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
    //           let l = Cesium.Cartographic.fromCartesian(position)
    //           let lon = Cesium.Math.toDegrees(l.longitude)
    //           let lat = Cesium.Math.toDegrees(l.latitude)
    //           let hei = l.height
    //           let height
    //           // 将笛卡尔坐标转换为地理坐标角度
    //           let cartographic = Cesium.Cartographic.fromCartesian(position);
    //           // 将地理坐标角度换为弧度
    //           let latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //           let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    //           height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
    //           // 将经纬度和高度生成新的笛卡尔坐标
    //           that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
    //           // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
    //         }
    //
    //         this.FaultZonePopupVisible = true; // 显示弹窗
    //         // this.FaultZonePopupPosition = this.selectedEntityPopupPosition; // 更新位置
    //         this.updatePopupPosition(); // 更新弹窗的位置
    //         this.FaultZonePopupData = "1111111111111";
    //       }
    //       else {
    //         this.FaultZonePopupVisible = false; // 隐藏弹窗
    //       }
    //     }
    //   }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //LEFT_DOUBLE_CLICK
    //
    //   // 必须有这个，拖动地图弹窗位置才会跟着移动
    //   window.viewer.screenSpaceEventHandler.setInputAction(movement => {
    //     if (that.FaultZonePopupVisible && window.selectedEntity) {
    //       that.updatePopupPosition(); // 更新弹窗的位置
    //     }
    //   }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // },
    // // 更新弹窗的位置
    // updatePopupPosition() {
    //   // 笛卡尔3转笛卡尔2（屏幕坐标）
    //   const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, this.selectedEntityHighDiy)
    //   if (canvasPosition) {
    //     this.FaultZonePopupPosition = {
    //       x: canvasPosition.x,//+ 20,
    //       y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
    //     };
    //   }
    // },
    //
    // // 调整弹框位置
    // styleObject() {
    //   return {
    //     FaultZonePopupPosition: "absolute",
    //     left: `${this.FaultZonePopupPosition.x}px`,
    //     top: `${this.FaultZonePopupPosition.y}px`
    //   };
    // },
    // // cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
    // // 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
    // isTerrainLoaded() {
    //   let terrainProvider = window.viewer.terrainProvider;
    //   if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
    //     // console.log("地形未加载")
    //     return false;
    //   } else if (Cesium.defined(terrainProvider)) {
    //     // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
    //     // 则表示已经设置了其他地形提供者
    //     // console.log("地形已加载")
    //     return true;
    //   }
    //   // console.log("地形未加载")
    //   return false;
    // },
    // watchTerrainProviderChanged() {
    //   let that = this
    //   window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
    //     this.popupVisible = false // 地形改变时关闭弹窗
    //     let tzs = []
    //     if (that.modelName === 1) {
    //       tzs[0] = 9
    //       tzs[1] = -567
    //     } else {
    //       tzs[0] = 15
    //       tzs[1] = -557
    //     }
    //     if (that.isTerrainLoaded()) {
    //       // that.changeHeight(tzs[0])
    //       // that.tz = tzs[0]
    //       // that.find()
    //     } else {
    //       // that.changeHeight(tzs[1])
    //       // that.tz = tzs[1]
    //       // that.find()
    //     }
    //   });
    // },

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
  width: 333px;
  height: 100%;
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
  left: 323px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 50px;
  background-color: #2d3d51;
  -webkit-border-top-right-radius: 10px;
  -webkit-border-bottom-right-radius: 10px;
  cursor: pointer;
  z-index: 4;
  transition: width 0.3s ease; /* 宽度过渡动画 */
}

.unfold {
  position: absolute;
  width: 30px;
  height: 40px;
  background-color: rgba(48, 65, 86, 0.5);
  cursor: pointer;
  z-index: 2;
}

// 搜索框
.query {
  width: calc(100% - 20px);
  margin: 10px;
}

// 地震列表
.eqList {
  position: relative;
  height: 85vh;
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
  height: 40px;
  width: 40px;
  margin: 10px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

// 地震简要文本信息
.eqText {
  padding-top: 5px;
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
  width: 327px;
  background-color: #2d3d51;
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
}
.return:hover {
  border-color: #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.eqTheme {
  height: 150px;
  padding: 0 30px;
}

.themes {
  margin-top: 20px;
  font-size: 18px;
  height: 50px;
  width: 100px;
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
  right: 10px;
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
</style>
