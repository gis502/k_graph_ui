
<template>
<!--  涉及标绘点的图层在父组件 thd处理，其他图层要素在这里-->
  <div>
    <el-checkbox-group v-model="selectedlayers" @change="updateMapLayers" class="grid-container">

      <el-checkbox v-for="item in layeritems" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox>

    </el-checkbox-group>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getEqbyId} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'

import centerstar from "@/assets/icons/TimeLine/震中.png";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import newsDialog from "@/components/TimeLine/newsDialog.vue";
import timeLineEmergencyResponse from "@/components/TimeLine/timeLineEmergencyResponse.vue"
import timeLinePersonnelCasualties from "@/components/TimeLine/timeLinePersonnelCasualties.vue"
import timeLineRescueTeam from "@/components/TimeLine/timeLineRescueTeam.vue"
import MiniMap from "@/components/TimeLine/miniMap.vue";
import News from "@/components/TimeLine/news.vue";
import timeLineLegend from "@/components/TimeLine/timeLineLegend.vue";

//报告产出
import fileUrl from "@/assets/json/TimeLine/2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf"
import commonPanel from "@/components/Cesium/CommonPanel";

import {getPloy} from "@/api/system/plot"
import eqTable from '@/components/Home/eqtable.vue'
import geojsonmap from '@/assets/geoJson/map.json'
import yaan from '@/assets/geoJson/yaan.json'

import picUrl1 from "@/assets/json/TimeLine/芦山县行政区划图.png";
import MapLayerControl from '@/components/TimeLine/MapLayerControl.vue';

export default {
  props: ['isMarkingLayer'],
  watch: {
    isMarkingLayer(newVal) {
      this.isMarkingLayerLocal = newVal;
    },
    viewer(newVal){
      console.log(newVal)
      console.log("window.viewer",window.viewer)
      this.comviewer=newVal
    }
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
      selectedlayers:['标绘点图层'],
      isMarkingLayerLocal: this.isMarkingLayer,
      comviewer:window.viewer,
      regionLayer:null,
    };
  },

  methods: {
    updateMapLayers() {
      //标绘点图层和时间联动，需要父子组件传值
      const hasDrawingLayer = this.selectedlayers.includes('标绘点图层');
      if (hasDrawingLayer) {
        this.$emit('updateMarkingLayer',true); // 通知父组件
        this.$emit('updatePlot');
      } else {
        // this.comviewer.flyTo(dataSource.entities.values)
        this.$emit('updateMarkingLayer', false);
        this.$emit('MarkingLayerRemove');
      }
      // this.removeALL()
      //雅安市行政区划要素图层
      const hasAdminLayer = this.selectedlayers.includes('行政区划要素图层');
      if (hasAdminLayer) {
       this.addYaanImageryDistrict()
      } else {
        this.removeAYaanImageryDistrict()
      }
    },

    addYaanImageryDistrict() {
      if(!this.regionLayer) {


        // console.log("window.viewer",window.viewer)
        // if (!this.comviewer) {
        //   console.error("Viewer未初始化");
        //   return;
        // }
        // else{
        let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
              strokeWidth: 4,
            }
        );

        // console.log("geoPromise",geoPromise)

        geoPromise.then((dataSource) => {
          // console.log(dataSource)
          // 添加 geojson
          this.regionLayer = dataSource;
          this.comviewer.dataSources.add(dataSource);
          console.log(this.comviewer,345)
          // 给定义好的 geojson 的 name 赋值（这里的 dataSource 就是定义好的geojson）
          // dataSource.name = "geojson_map";
          // 视角跳转到 geojson
          // this.comviewer.flyTo(dataSource.entities.values)
        }).catch((error) => {
          console.error("加载GeoJSON数据失败:", error);
        });
        // let labelData =  { lon: 103.003398, lat: 29.981831, name: "雅安市" };
        // let position = Cesium.Cartesian3.fromDegrees(labelData.lon, labelData.lat);
        // let labelEntity = this.comviewer.entities.add(new Cesium.Entity({
        //   position: position,
        //   label: new Cesium.LabelGraphics({
        //     text: labelData.name,
        //     scale: 1,
        //     font: "bolder 50px sans-serif",
        //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        //     fillColor: Cesium.Color.fromCssColorString("#ffffff"),
        //     pixelOffset: new Cesium.Cartesian2(0, -60)
        //   })
        // }));
        // this.labels.push(labelEntity);  // 保存标签实体的引用

        // }
      }
    },
    removeAYaanImageryDistrict() {
      // if (this.districtLayer) {
        // 这里是删除语句（通过 getByName 获取 dataSources，用于删除）。
        // viewer.dataSources.remove(viewer.dataSources.getByName('geojson_map')[0])
        // this.districtLayer = null;
      console.log(this.regionLayer,123)
      console.log(this.comviewer.dataSources)
      this.comviewer.dataSources.remove(this.regionLayer, true); // 第二个参数为 true 表示强制移除
      this.regionLayer = null; // 清空引用
        console.log("图层已移除");
      // }
    },

    //清除所有图层代码 有问题联系SWB
    removeALL(){
      viewer.dataSources.removeAll()
      // this.labels.forEach(label => {
      //   viewer.entities.remove(label);
      // });
      // this.labels = [];  // 清空标签引用数组
      //复位
      // const destination = Cesium.Cartesian3.fromDegrees(103.00, 29.98, 1500);
      // 使用 viewer.camera.flyTo 飞到指定位置
      // viewer.camera.flyTo({
      //   destination: destination,
      //   // orientation: {
      //   //   heading: Cesium.Math.toRadians(0.0),
      //   //   pitch: Cesium.Math.toRadians(-45.0),
      //   //   roll: 0.0
      //   // },
      //   duration: 2.0 // 飞行持续时间（秒）
      // });

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