<template>
  <!-- 涉及标绘点的图层在父组件 thd处理，其他图层要素在这里 -->
  <div>
    <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
      <el-checkbox v-for="item in layeritems" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox>
    </el-checkbox-group>
  </div>

<!--  <RouterPanel :visible="popupVisible" :position="popupPosition" :popupData="popupData" />-->


</template>

<script>
import * as Cesium from 'cesium';
import yaan from '@/assets/geoJson/yaan.json';
import { TianDiTuToken } from "@/cesium/tool/config";
import {getFeaturesLayer} from "@/api/system/emergency.js";
// import RouterPanel from "@/components/Cesium/RouterPanel.vue";
import disasterReservesLogo from '@/assets/images/disasterReservesLogo.jpg';
import emergencyTeamLogo from '@/assets/images/emergencyTeamLogo.png';
import emergencySheltersLogo from '@/assets/images/emergencySheltersLogo.png';


export default {
  // components: {RouterPanel},
  props: ['isMarkingLayer', 'selectedlayers'],
  watch: {
    isMarkingLayer(newVal) {
      this.isMarkingLayerLocal = newVal;
    },
    selectedlayers(newVal) {
      this.selectedlayersLocal = newVal;
    },
  },
  data() {
    return {
      layeritems: [
        { id: '0', name: '标绘点图层' },
        { id: '1', name: '行政区划要素图层' },
        { id: '2', name: '人口密度要素图层' },
        { id: '3', name: '交通网络要素图层' },
        { id: '4', name: '避难场所要素图层' },
        { id: '5', name: '救援队伍分布要素图层' },
        { id: '6', name: '应急物资存储要素图层' },
      ],
      selectedlayersLocal: this.selectedlayers,
      isMarkingLayerLocal: this.isMarkingLayer,
      disasterReserves: [],
      emergencyTeam: [],
      emergencyShelters: [],
      //-----------弹窗部分-------------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
    };
  },
  methods: {
    // 加载数据
    initPlot() {
      getFeaturesLayer().then(res => {
        let { disasterReserves, emergencyTeam ,emergencyShelters } = res;
        this.disasterReserves = disasterReserves;
        this.emergencyTeam = emergencyTeam;
        this.emergencyShelters = emergencyShelters;

        // 根据当前选中的图层显示或隐藏图层
        this.updateMapLayers();
      });
    },

    updateMapLayers() {
      this.$emit('handleSelectLayerListChange', this.selectedlayersLocal);

      // 标绘点图层
      const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
      if (hasDrawingLayer) {
        this.$emit('updateMarkingLayer', true); // 通知父组件
        this.$emit('updatePlot');
      } else {
        this.$emit('updateMarkingLayer', false);
        this.$emit('MarkingLayerRemove');
      }

      // 雅安市行政区划要素图层
      const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
      if (hasYaanRegionLayer) {
        this.$emit('removethdRegions');
        this.addYaanRegion();
      } else {
        this.rmoveonedataSourcesLayer('YaanRegionLayer');
      }

      // 交通网络要素图层
      const hastrafficLayer = this.selectedlayersLocal.includes('交通网络要素图层');
      if (hastrafficLayer) {
        this.addTrafficLayer();
      } else {
        this.rmoveoneimageryLayer('TrafficLayer');
        this.rmoveoneimageryLayer('TrafficTxtLayer');
      }

      // 应急物资存储要素图层
      const hasReservesLayer = this.selectedlayersLocal.includes('应急物资存储要素图层');
      if (hasReservesLayer) {
        this.processPoints(this.disasterReserves, 'reserves', disasterReservesLogo, '应急物资存储');
      } else {
        this.removeEntitiesByType('reserves');
      }

      // 救援队伍分布要素图层
      const hasEmergencyTeamLayer = this.selectedlayersLocal.includes('救援队伍分布要素图层');
      if (hasEmergencyTeamLayer) {
        this.processPoints(this.emergencyTeam, 'emergencyTeam', emergencyTeamLogo, '救援队伍分布');
      } else {
        this.removeEntitiesByType('emergencyTeam');
      }

      // 避难场所要素图层
      const hasEmergencySheltersLayer = this.selectedlayersLocal.includes('避难场所要素图层');
      if (hasEmergencySheltersLayer) {
        this.processPoints(this.emergencyShelters, 'emergencyShelters', emergencySheltersLogo, '避难场所');
      } else {
        this.removeEntitiesByType('emergencyShelters');
      }
    },


    processPoints(pointArr, type, icon, tableName) {
      if (!Array.isArray(pointArr)) {
        console.error(`${tableName} 数据格式不正确`, pointArr);
        return;
      }

      pointArr = pointArr.filter(e => e.longitude !== null);

      pointArr.forEach(element => {
        let existingEntity = window.viewer.entities.getById(element.id);
        if (existingEntity) {
          console.warn(`id为${element.id}的实体已存在。跳过此实体`);
          return;
        }

        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);
        if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          console.error(`id为${element.id}的实体的坐标无效或超出范围`, { longitude, latitude });
          return;
        }

        element.type = type;
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
        },
      });
    },

    removeEntitiesByType(type) {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].properties?.type?.getValue() === type) {
          window.viewer.entities.remove(entities[i]);
        }
      }
    },

    //判断添加imageryLayer的图层是否存在
    imageryLayersExists(layerName){
      const layers = viewer.imageryLayers;
      for (let i = 0; i < layers.length; i++) {
        // 检查图层是否具有名称属性
        if (layers.get(i).name === layerName) {
          return true;
        }
      }
      return false;
    },
    addYaanRegion() {
      if(!window.viewer.dataSources.getByName('YaanRegionLayer')[0]){
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
              strokeWidth: 4,
            }
        );
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          console.log(dataSource)
          //给图层取名字,不取名字删除的时候找不到图层
          dataSource.name='YaanRegionLayer'
        }).catch((error) => {
          console.error("加载GeoJSON数据失败:", error);
        });
      }

    },
    addTrafficLayer(){
      let token=TianDiTuToken;
      let trafficLayerexists=this.imageryLayersExists('TrafficLayer')
      if(!trafficLayerexists){
        let trafficLayer=viewer.imageryLayers.addImageryProvider(
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
        trafficLayer.name = "TrafficLayer"; // 设置名称
      }

      let trafficTxtLayerExists=this.imageryLayersExists('TrafficTxtLayer')
      if(!trafficTxtLayerExists) {
        //影像注记
        let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
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
        )
        traffictxtLayer.name = "TrafficTxtLayer"
      }
    },
    // 添加到 dataSources 的图层
    rmoveonedataSourcesLayer(layerName) {
      let layer = window.viewer.dataSources.getByName(layerName)[0];
      if (layer) {
        window.viewer.dataSources.remove(layer, true);
      }
    },

    rmoveoneimageryLayer(layerName) {
      const layers = viewer.imageryLayers;
      for (let i = 0; i < layers.length; i++) {
        if (layers.get(i).name === layerName) {
          layers.remove(layers.get(i), true);
          return;
        }
      }
    },
  },
  mounted() {
    this.initPlot(); // 初始化加载应急数据
  },
};
</script>


<style scoped>

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
}
/*图层要素选项颜色改为白色*/
.el-checkbox {
  color:#FFFFFF;
}
</style>
