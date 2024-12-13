<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'

export default {
  name: "orthophotographViewer",
  mounted() {
    this.init();
  },
  beforeUnmount() {
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
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
      window.viewer = viewer;
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
      this.addOrthophotographViewer()
    },
    addOrthophotographViewer(){

      window.viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'http://localhost:9003/image/wmts/KDeS0ioU/{z}/{x}/{y}',
          }),
          // new Cesium.WebMapServiceImageryProvider({
          //   url: 'http://localhost:9080/geoserver/gwc/service/wms',
          //   layers: 'yaan:DOM',
          //   parameters: {
          //     service: 'WMS',
          //     transparent: true,//背景透明
          //     format: 'image/png',
          //   },
          // })
      );


      window.viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(102.711, 30.02, 1000.0)
      });
    },

  }
}
</script>

<template>
  <div id="cesiumContainer"></div>
</template>

<style scoped>

</style>
