<template>
  <div class="thd-listTable">
    <div class="pop" style="width: 100%; height: 100%; z-index: 900;">
      <div class="pop_header">
        <span class="pop_title">图层要素</span>
      </div>
      <div class="list-dialog__content" style="height: calc(100% - 40px);">

        <!-- 图层要素可展开 -->
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <div style="display: flex; align-items: center;">
                <svg t="1730574016632" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="6181" width="28" height="28" style="margin-right: 8px;">
                  <path
                      d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z"
                      p-id="6182" fill="#ffffff"></path>
                </svg>
                <span>图层管理</span>
              </div>
            </template>
            <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
              <el-checkbox
                  v-for="item in layeritems"
                  :key="item.id"
                  :label="item.name"
                  style="margin: 0 0;"
              >
                {{ item.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import emergencyRescueEquipmentLogo from "@/assets/images/EmergencyResourceInformation/disasterReliefSuppliesLogo.jpg";
import rescueTeamsInfoLogo from "@/assets/images/EmergencyResourceInformation/rescueTeamsInfoLogo.png";
import emergencySheltersLogo from "@/assets/images/emergencySheltersLogo.png";
import Cesium from "cesium";

export default {
  data(){
    return{
      layeritems: [
        {id: '0', name: '标绘点图层'},
        {id: '1', name: '行政区划要素图层'},
        {id: '2', name: '人口密度要素图层'},
        {id: '3', name: '交通网络要素图层'},
        {id: '4', name: '避难场所要素图层'},
        {id: '5', name: '救援队伍分布要素图层'},
        {id: '6', name: '应急物资存储要素图层'},
        {id: '7', name: '历史地震要素图层'},
        {id: '8', name: '断裂带要素图层'},
      ],
      selectedlayersLocal: ['标绘点图层'],
      isShowYaanRegionLegend: false, //雅安行政区划图例
    }
  },
  methods:{
    updateMapLayers() {
      // 检查选中的图层中是否包含标绘点图层
      // const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
      // // 如果包含标绘点图层
      // if (hasDrawingLayer) {
      //   // 确认标绘图层变更，参数为true表示已选中
      //   this.handleMarkingLayerChange(true);
      //   // 更新绘图状态
      //   // this.updatePlotOnce(true);
      //   // this.updatePlotOnce(false);
      // } else {
      //   // 确认标绘图层变更，参数为false表示未选中
      //   this.handleMarkingLayerChange(false);
      //   // 移除所有已存在的椭圆圈实体，以避免重复添加
      //   // this.removeEntitiesByType("ovalCircle")
      //   // 移除标绘图层
      //   this.MarkingLayerRemove();
      // }

      // 检查是否选定了雅安行政区划要素图层
      const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
      // 如果选定了行政区划要素图层，则移除其他区域图层并添加雅安行政区划图层
      if (hasYaanRegionLayer) {
        this.removethdRegions();
        this.addYaanRegion();
      } else {
        // 如果未选定行政区划要素图层，则移除其他区域图层和雅安行政区划图层
        this.removethdRegions();
        this.removeDataSourcesLayer('YaanRegionLayer');
      }

      // 检查是否选定了人口密度要素图层
      const hasPopLayer = this.selectedlayersLocal.includes('人口密度要素图层');
      // 如果选定了人口密度要素图层，则添加人口密度图层
      if (hasPopLayer) {
        this.addPopLayer();
      } else {
        // 如果未选定人口密度要素图层，则移除人口密度图层
        this.removeImageryLayer('PopLayer');
      }

      // 检查是否选中了交通网络要素图层
      const hasTrafficLayer = this.selectedlayersLocal.includes('交通网络要素图层');
      // 根据选中情况，添加或移除交通网络要素图层
      if (hasTrafficLayer) {
        this.addTrafficLayer();
      } else {
        this.removeImageryLayer('TrafficLayer');
        this.removeImageryLayer('TrafficTxtLayer');
      }

      // 检查是否选中了应急物资存储要素图层
      const hasReservesLayer = this.selectedlayersLocal.includes('应急物资存储要素图层');
      // 根据选中情况，处理或移除应急物资存储要素图层
      if (hasReservesLayer) {
        this.processPoints(this.disasterReserves, 'reserves', emergencyRescueEquipmentLogo, '应急物资存储');
      } else {
        this.removeEntitiesByType('reserves');
      }

      // 检查是否选定了救援队伍分布要素图层
      const hasEmergencyTeamLayer = this.selectedlayersLocal.includes('救援队伍分布要素图层');
      // 如果选定了救援队伍分布要素图层，则处理救援队伍的点数据
      if (hasEmergencyTeamLayer) {
        this.processPoints(this.emergencyTeam, 'emergencyTeam', rescueTeamsInfoLogo, '救援队伍分布');
      } else {
        // 如果没有选定救援队伍分布要素图层，则移除已有的救援队伍分布实体
        this.removeEntitiesByType('emergencyTeam');
      }

      // 检查是否选定了避难场所要素图层
      const hasEmergencySheltersLayer = this.selectedlayersLocal.includes('避难场所要素图层');
      // 如果选定了避难场所要素图层，则处理避难场所的点数据
      if (hasEmergencySheltersLayer) {
        this.processPoints(this.emergencyShelters, 'emergencyShelters', emergencySheltersLogo, '避难场所');
      } else {
        // 如果没有选定避难场所要素图层，则移除已有的避难场所实体
        this.removeEntitiesByType('emergencyShelters');
      }

      // 检查是否选定了历史地震要素图层
      const hasHistoryEqLayer = this.selectedlayersLocal.includes('历史地震要素图层');
      // 如果选定了历史地震要素图层，则添加历史地震的点数据
      if (hasHistoryEqLayer) {
        this.addHistoryEqPoints();
      } else {
        // 如果没有选定历史地震要素图层，则移除已有的历史地震实体
        this.removeEntitiesByType('historyEq');
      }

      // 判断是否选定了断裂带要素图层
      const hasFaultZoneLayer = this.selectedlayersLocal.includes('断裂带要素图层');
      // 如果选定了断裂带要素图层，则添加断裂带图层
      if (hasFaultZoneLayer) {
        this.addFaultZone();
      } else {
        if (window.duanliedai) {
          // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
          window.viewer.dataSources.remove(window.duanliedai, true);
          // 清空regionLayerJump的引用，以便垃圾回收
          window.duanliedai = null;
          // //console.log("图层已移除");
        }
        // 如果未选定断裂带要素图层，则移除断裂带图层
       this.removeDataSourcesLayer('duanliedai');
      }

      // 判断是否选定了烈度圈要素图层
      const hasOvalCircleLayer = this.selectedlayersLocal.includes('烈度圈要素图层');
      // 如果选定了烈度圈要素图层，则添加烈度圈图层
      if (hasOvalCircleLayer) {
        this.addOvalCircle();
      } else {
        // 如果未选定烈度圈要素图层，则移除烈度圈图层
        this.removeEntitiesByType('ovalCircle');
      }

      //视角转化 如果 只有标绘点或者没有选择图层，视角更近（震中），如果有其他要素图层，视角拉高（雅安市）
      if ((this.selectedlayersLocal.length == 1 && hasDrawingLayer) || this.selectedlayersLocal.length == 0) {
        // 创建一个Cartesian3对象，用于表示相机将要飞往的经纬度位置
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            120000,
        );
        // 使用flyTo方法使相机飞往指定的经纬度位置
        viewer.camera.flyTo({destination: position,})
      } else {
        // 当选中的图层数量不满足上述条件时，执行以下逻辑
        // 创建一个Cartesian3对象，用于表示相机将要飞往的默认经纬度位置
        const position = Cesium.Cartesian3.fromDegrees(
            103.0,
            29.98,
            500000,
        );
        // 使用flyTo方法使相机飞往默认的经纬度位置
        viewer.camera.flyTo({destination: position,})
      }
      //视角跳转 end
    },

    removethdRegions() {
      // 检查是否存在名为regionLayerJump的图层
      if (window.regionLayerJump) {
        // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
        window.viewer.dataSources.remove(window.regionLayerJump, true);
        // 清空regionLayerJump的引用，以便垃圾回收
        window.regionLayerJump = null;
        // //console.log("图层已移除");
      }
      this.isShowYaanRegionLegend = false;
      // 获取图例容器，准备清空其内容
      // const legend = document.getElementById('legend');
      // 循环移除图例容器中的所有子元素
      // while (legend.firstChild) {
      //     legend.removeChild(legend.firstChild);
      // }
      // 遍历标签数组，移除每个标签实体
      this.labels.forEach(label => {
        window.viewer.entities.remove(label);
      });
      // 清空标签引用数组，以便垃圾回收
      this.labels = [];
    },

  }
}
</script>
<style>
.thd-listTable {
  width: 26.5%;
  top: 13%;
  height: 79%;
  z-index: 30;
  right: 0.3%;
  position: absolute;
}

.pop {
  position: absolute;
  width: 100%;
  z-index: 0;
  border-color: #05709d;
  background: rgb(4, 20, 34);
  /*background: rgba(47, 82, 117, 0.3) 88%;*/
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

.pop_header {
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 15%;
  position: relative;
  left: 7%;
}

:deep(.el-collapse-item ) {
}

:deep(.el-checkbox__label ) {
  background-color: rgba(22, 53, 77, 0.9); /* 背景色 */
  color: white; /* 内容文字颜色 */
  font-size: 14px; /* 内容字号 */
  padding: 10px; /* 内容内边距 */
}

:deep(.el-collapse-item__header ) {
  background-color: rgba(41, 68, 89, 0.9); /* 背景色 */
  color: #ffffff; /* 内容文字颜色 */
  font-size: 16px; /* 内容字号 */
  padding: 10px; /* 内容内边距 */
  font-weight: 580;
}

:deep(.el-collapse-item__wrap) {
  background-color: rgba(22, 53, 77, 0.9); /* 背景色 */
  color: #ffffff; /* 内容文字颜色 */
}

:deep(.el-collapse-item__content) {
  padding: 10px;
}
.icon {
  width: 30px;
  height: 30px;
  margin-right: 4px;
  fill: currentColor;
}
/*图层要素选项颜色改为白色*/
.el-checkbox {
  color: #FFFFFF;
}
</style>
