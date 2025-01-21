<template>
  <div>
    <div class="small-map">
      <div class="pop_header">
        <h2 class="sub-title">
          缩略地图
        </h2>
        <div id="smallMapContainer"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {initCesium} from "@/cesium/tool/initCesium.js";
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {TianDiTuToken} from "@/cesium/tool/config.js";
import timeLine from "@/cesium/timeLine.js";
import centerstar from "@/assets/icons/TimeLine/震中.png";

export default {
  name: "miniMap",
  data() {
    return {
      smallViewer: null,
      showLeftButton: false,
    };
  },
  props:["viewer","centerPoint"],
  watch:{
    viewer(newVal){
      this.MiniMapAddListen()
    },
    centerPoint(newVal){
      this.MiniMapAddCenterPoint()
      // this.initMiniMap(this.centerPoint)
    }
  },
  mounted() {
    this.initMiniMap()
  },
  beforeUnmount() {
    console.log("111", window.viewer);
    if (window.viewer) {
      let viewer = window.viewer;
      let gl = viewer.scene.context._gl;
      viewer.entities.removeAll();
      viewer.destroy();
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除");
      gl = null;
      window.viewer = null;
    }
  },
  methods: {
    initMiniMap() {
      // 创建缩略图视图器实例
      let smallMapContainer = document.getElementById('smallMapContainer');
      let smallViewer = initCesium(Cesium, smallMapContainer)
      window.smallViewer = smallViewer
      smallViewer._cesiumWidget._creditContainer.style.display = 'none'
      let smallOptions = {}
      smallOptions.enableCompass = false
      smallOptions.enableZoomControls = false
      smallOptions.enableDistanceLegend = false
      smallOptions.enableCompassOuterRing = false
      smallOptions.geocoder = false
      smallOptions.homeButton = false
      smallOptions.sceneModePicker = false
      smallOptions.timeline = false
      smallOptions.navigationHelpButton = false
      smallOptions.animation = false
      smallOptions.infoBox = false
      smallOptions.fullscreenButton = false
      smallOptions.showRenderState = false
      smallOptions.selectionIndicator = false
      smallOptions.baseLayerPicker = false
      // smallOptions.selectedImageryProviderViewModel = viewer.imageryLayers.selectedImageryProviderViewModel
      // smallOptions.selectedTerrainProviderViewModel = viewer.terrainProviderViewModel
      // window.navigation = new CesiumNavigation(smallViewer, smallOptions)
      smallMapContainer.getElementsByClassName('cesium-viewer-toolbar')[0].style.display = 'none';

      smallViewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: "http://59.255.48.160:81/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
            // url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
                TianDiTuToken,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
          })
      );
      smallViewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: "http://59.255.48.160:81/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
            // url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
                TianDiTuToken,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
          })
      );

    },
    MiniMapAddListen(){ // 同步主视图器的相机到缩略图视图器
      function syncCamera() {
        const camera1 = window.viewer.scene.camera;
        let smallPoint = Cesium.Cartesian3.fromRadians(camera1.positionCartographic.longitude, camera1.positionCartographic.latitude, camera1.positionCartographic.height + 2000)
        const camera2 = window.smallViewer.scene.camera;
        camera2.setView({
          destination: smallPoint,
          orientation: {
            heading: camera1.heading,
            pitch: camera1.pitch,
            roll: camera1.roll
          }
        });
      }

      // 监听主视图器的相机变化
      window.viewer.scene.camera.changed.addEventListener(syncCamera);

      // 每帧渲染时同步缩略图视图
      window.viewer.scene.postRender.addEventListener(function () {
        window.smallViewer.scene.requestRender(); // 确保缩略图更新
      });
      // 初始同步
      syncCamera();},
    MiniMapAddCenterPoint(){
      timeLine.MiniMapAddMakerPoint(window.smallViewer, this.centerPoint)
    },
  },
};
</script>


<style scoped>
.small-map {
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
  position: absolute;
  top: 65%;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sub-title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
  width: 93%;
}

#smallMapContainer {
  width: 95%;
  height: 20vh;
  margin-top: 6%;
  margin-left: 2.5%;
}

.showMiniMapButton img {
  max-width: 20px; /* 设置图片最大宽度 */
  max-height: 20px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */
  justify-content: center;
  align-content: center;
}
</style>
