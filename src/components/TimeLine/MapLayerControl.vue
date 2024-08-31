
<template>
<!--  涉及标绘点的图层在父组件 thd处理，其他图层要素在这里-->
  <div>
    <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
      <el-checkbox v-for="item in layeritems" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import yaan from '@/assets/geoJson/yaan.json'
import {TianDiTuToken} from "@/cesium/tool/config";


export default {
  props: ['isMarkingLayer','selectedlayers'],
  watch: {
    isMarkingLayer(newVal) {
      this.isMarkingLayerLocal = newVal;
    },
    selectedlayers(newVal){
      this.selectedlayersLocal=newVal
      // console.log("newVal",newVal)
    },
  },
  data() {
    return {
      layeritems: [
        { id: '0', name: '标绘点图层'},
        { id: '1', name: '自建要素图层服务'},
        { id: '2', name: '行政区划要素图层'},
        { id: '3', name: '人口密度要素图层'},
        { id: '4', name: '交通网络要素图层'},
        { id: '5', name: '避难场所要素图层'},
        { id: '6', name: '救援队伍分布要素图层'},
        { id: '7', name: '应急物资存储要素图层'},
      ],
      selectedlayersLocal:this.selectedlayers,
      isMarkingLayerLocal: this.isMarkingLayer,
    };
  },
  methods: {
    updateMapLayers() {
      this.$emit('handleSelectLayerListChange', this.selectedlayersLocal);
      //标绘点图层
      const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
      if (hasDrawingLayer) {
        this.$emit('updateMarkingLayer',true); // 通知父组件
        this.$emit('updatePlot');
      } else {
        this.$emit('updateMarkingLayer', false);
        this.$emit('MarkingLayerRemove');
      }

      //雅安市行政区划要素图层
      const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
      if (hasYaanRegionLayer) {
       this.addYaanRegion()
      } else {
        this.rmoveonedataSourcesLayer('YaanRegionLayer')
      }

      //交通网络要素图层
      const hastrafficLayer = this.selectedlayersLocal.includes('交通网络要素图层');
      if (hastrafficLayer) {
        this.addTrafficLayer()
      } else {
        this.rmoveoneimageryLayer('TrafficLayer')
        this.rmoveoneimageryLayer('TrafficTxtLayer')
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

    //添加到dtatSourse上的图层
    rmoveonedataSourcesLayer(layerName) {
      window.viewer.dataSources.remove(window.viewer.dataSources.getByName(layerName)[0], true)
    },
    rmoveoneimageryLayer(layerName){
      const layers = viewer.imageryLayers;
      for (let i = 0; i < layers.length; i++) {
        // 检查图层是否具有名称属性
        if (layers.get(i).name === layerName) {
          layers.remove(layers.get(i), true);
          return;
        }
      }
    },


  },



};
</script>

<style scoped>

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
}
</style>