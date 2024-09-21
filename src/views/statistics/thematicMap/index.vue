<template>
  <div>
    <div id="exportContainer">
      <!-- Cesium 地图容器 -->
      <div id="cesiumContainer" class="situation_cesiumContainer"></div>
      <!--  指南针  -->
      <div class="compassContainer"></div>
      <!-- 图例 -->
      <el-form class="noteContainer">
        <div class="legend_item" v-for="(item, index) in legendData" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"></span>{{ item.name }}
        </div>
      </el-form>
      <!-- ECharts 图表容器 -->
      <div v-for="(location, index) in locations" :key="index" class="echarts-container" ref="echartsContainer"
           :id="'echartsContainer' + index"></div>
    </div>

    <!-- 添加一个按钮用于导出 -->
    <button @click="exportCesiumScene" class="export-button">导出场景图片</button>

    <!-- 预览图片的 div -->
    <div v-if="previewImage" class="preview-container">
      <h3 style="color: white">图片预览</h3>
      <img :src="previewImage" class="preview-image" alt="导出预览">
      <div class="preview-buttons">
        <button @click="downloadImage" class="download-button">下载图片</button>
        <button @click="closePreview" class="cancel-button">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';
import * as echarts from 'echarts'; // 确保导入 echarts
import {initCesium} from '@/cesium/tool/initCesium.js';
import {getAllEq} from "@/api/system/eqlist.js";
import html2canvas from "html2canvas";
import yaan from '@/assets/geoJson/yaan.json'
export default {
  data() {
    return {
      viewer: null, // 保存 Cesium Viewer
      legendData: [
        {value: 10, name: '类型A', color: '#ff6d39'},
        {value: 20, name: '类型B', color: '#53a8ff'},
        {value: 30, name: '类型C', color: '#50d693'},
        {value: 40, name: '类型D', color: '#ffc975'},
        {value: 50, name: '类型E', color: '#ff7c88'}
      ],
      locations: [
        {name: '雨城区', longitude: 103.0, latitude: 29.94},
        {name: '名山区', longitude: 103.22, latitude: 30.15},
        {name: '荥经县', longitude: 102.76, latitude: 29.73},
        {name: '汉源县', longitude: 102.71, latitude: 29.38},
        {name: '石棉县', longitude: 102.29, latitude: 29.27},
        {name: '天全县', longitude: 102.58, latitude: 30.11},
        {name: '芦山县', longitude: 103.029, latitude: 30.41},
        {name: '宝兴县', longitude: 102.75, latitude: 30.52}
      ],
      previewImage: null, // 保存预览图片的 URL
      pollingInterval: null, // 保存轮询定时器的引用
    };
  },
  mounted() {
    // 初始化地图
    this.init();
    // 启动轮询获取后端数据
    this.startPolling();
    // 创建多个 ECharts 实例并生成柱状图
    this.createMultipleECharts();
    // 加载雅安边界线
    this.loadYaAnBoundary();
  },
  beforeDestroy() {
    // 在组件销毁时清除轮询
    this.stopPolling();
  },
  methods: {
    // 初始化控件等
    init() {
      this.viewer = initCesium(Cesium);

      this.$nextTick(() => {
        const cesiumContainer = document.getElementById('cesiumContainer');
        if (cesiumContainer) {
          cesiumContainer.setAttribute('id', 'cesiumContainerWithId');
        }
      });

      this.viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权信息
      window.viewer = this.viewer;

      let options = {
        defaultResetView: Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500),
        enableCompass: false,
        enableZoomControls: false,
        enableDistanceLegend: true,
        enableCompassOuterRing: false,
        resetTooltip: "重置视图",
        zoomInTooltip: "放大",
        zoomOutTooltip: "缩小"
      };

      window.navigation = new CesiumNavigation(this.viewer, options);

      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索';
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务';
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务';

      // 禁用所有交互
      // this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    },

    // 启动轮询
    // 每隔5秒获取一次数据
    startPolling() {
      this.pollingInterval = setInterval(() => this.getEq(), 500000);
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },

    //获取数据
    getEq() {
      getAllEq().then(res => {
        console.log("这里是获取的数据", res);
      });
    },

    // 创建多个 ECharts 实例，位置为雅安市各区县
    createMultipleECharts() {
      this.locations.forEach((location, index) => {
        this.createEChartForLocation(location, index);
      });

      // 在每次 Cesium 场景渲染后，更新 ECharts 位置
      this.viewer.scene.postRender.addEventListener(this.syncEChartsWithCesium);
    },

    createEChartForLocation(location, index) {
      const chartContainer = this.$refs.echartsContainer[index];
      // 设置echarts容器的宽度和高度
      chartContainer.style.width = '90px';
      chartContainer.style.height = '90px';
      const chart = echarts.init(chartContainer);

      const option = {
        tooltip: {
          trigger: 'axis', // 修改为 'axis' 以支持柱状图的坐标轴
          show: false,
          formatter: (params) => {
            return `<div style="
      font-size: 14px;
      background-color: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
      width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <strong style="color: #333;">${params[0].name}</strong><br/>
      <div style="color: #555;">
        <span style="font-weight: bold;">Value:</span> ${params[0].value}
      </div>
    </div>`;
          },
        },
        xAxis: {
          type: 'category',
          data: this.legendData.map(item => item.name),
          axisLabel: {
            show: false // 隐藏 x 轴的文字
          },
          axisLine: {
            show: false // 隐藏 x 轴线
          },
          axisTick: {
            show: false // 隐藏刻度线
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏 y 轴的横线
          },
          axisLine: {
            show: false // 隐藏 y 轴线
          },
          axisTick: {
            show: false // 隐藏刻度线
          }
        },
        series: [{
          name: '数据类型',
          type: 'bar',
          data: this.legendData.map(item => item.value),
          itemStyle: {
            color: (params) => this.legendData[params.dataIndex].color
          },
          label: {
            show: true, // 显示数值
            position: 'inside', // 数值显示在柱子内部
            formatter: '{c}', // 显示数值
            color: '#fff', // 数值字体颜色设置为白色
            fontSize: 12
          },
          barCategoryGap: '0%', // 去掉柱子之间的空隙
          barWidth: '100%' // 使每个柱子尽量紧贴
        }]
      };

      chart.setOption(option);
      // 添加鼠标事件，悬浮时显示 tooltip，移开时隐藏 tooltip
      chart.on('mouseover', () => chart.setOption({tooltip: {show: true}}));
      chart.on('mouseout', () => chart.setOption({tooltip: {show: false}}));
    },



    // 同步 ECharts 图表与 Cesium 地图
    syncEChartsWithCesium() {
      this.locations.forEach((location, index) => {
        const position = Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude);
        const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(position);

        if (Cesium.defined(canvasPosition)) {
          const chartContainer = this.$refs.echartsContainer[index];
          chartContainer.style.left = `${canvasPosition.x - chartContainer.offsetWidth / 2}px`;
          chartContainer.style.top = `${canvasPosition.y - chartContainer.offsetHeight / 2}px`;
        }
      });
    },

    // 加载雅安的边界线，并将视角定位到雅安
    loadYaAnBoundary() {
      Cesium.GeoJsonDataSource.load(yaan, {
        stroke: Cesium.Color.RED,
        strokeWidth: 2,
        fill: Cesium.Color.RED.withAlpha(0.1)
      }).then(dataSource => {
        this.viewer.dataSources.add(dataSource);
        this.viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(102.42, 29.895, 360000),
          //PI_OVER_TWO就是二分之PI嘛，就是90度
          orientation: {heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0}
        });

        dataSource.entities.values.forEach(entity => {
          if (entity.polygon) {
            const positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
            entity.polyline = {
              positions: positions,
              width: 4,
              material: Cesium.Color.RED
            };
          }
        });

        // 定义各个区县的坐标（手动调整）
        const districtNames = {
          '雨城区': { lon: 103.04, lat: 29.8 }, // 手动设置雨城区的坐标
          '名山区': { lon: 103.19, lat: 30.05 }, // 手动设置名山区的坐标
          '荥经县': { lon: 102.78, lat: 29.6 },
          '汉源县': { lon: 102.70, lat: 29.25 },
          '石棉县': { lon: 102.29, lat: 29.15 },
          '天全县': { lon: 102.58, lat: 29.98},
          '芦山县': { lon: 102.98, lat: 30.25 },
          '宝兴县': { lon: 102.75, lat: 30.4 }
        };
        Object.keys(districtNames).forEach(district => {
          const { lon, lat } = districtNames[district];
          this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            label: {
              text: district,
              font: '18px Helvetica',
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
          });
        });
      }).catch(error => console.error('加载 GeoJSON 时出错：', error));
    },

    // 导出 Cesium 场景为图片
    async exportCesiumScene() {
      // 1. 确保 Cesium 渲染完成
      await this.waitForCesiumRender();

      // 2. 获取 Cesium 的 Canvas 元素并转换为图片
      const cesiumCanvas = this.viewer.scene.canvas;
      const cesiumImage = cesiumCanvas.toDataURL('image/png');

      // 3. 使用 html2canvas 渲染图例部分
      const noteContainer = document.querySelector('.noteContainer');
      const legendCanvas = await html2canvas(noteContainer, {
        useCORS: true,
        scale: 1,
        backgroundColor: null  // 设置背景为透明
      });

      // 使用 html2canvas 渲染距离标尺
      const distanceLegendContainer = document.querySelector('.distance-legend');
      const distanceLegendCanvas = await html2canvas(distanceLegendContainer, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });

      // 渲染指南针部分
      const compassContainer = document.querySelector('.compassContainer');
      const compassCanvas = await html2canvas(compassContainer, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });

      // 4. 创建最终合成 Canvas 元素
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#exportContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#exportContainer').offsetHeight;
      const finalContext = finalCanvas.getContext('2d');

      // 5. 绘制 Cesium 场景图片到最终 Canvas 上
      const cesiumImg = new Image();
      cesiumImg.src = cesiumImage;
      await new Promise(resolve => cesiumImg.onload = resolve);
      finalContext.drawImage(cesiumImg, 0, 0);

      // 6. 绘制图例到最终 Canvas 上
      finalContext.drawImage(legendCanvas, 10, 245);

      // 7. 绘制距离标尺到最终 Canvas 上
      // 获取最终合成 Canvas 的高度
      const finalCanvasHeight = finalCanvas.height;

      // 将距离比例尺绘制到左下角
      finalContext.drawImage(distanceLegendCanvas, 20, finalCanvasHeight - distanceLegendCanvas.height - 20); // 20px 的边距
      // 绘制指南针到到右上角
      finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);

      // 8. 获取所有 ECharts 图表的 Canvas 元素并渲染
      const echartsCanvasPromises = this.$refs.echartsContainer.map(container =>
          html2canvas(container, {
            useCORS: true,
            scale: 1,
            backgroundColor: null  // 设置背景为透明
          })
      );

      // 9. 等待所有 ECharts 图表渲染完成
      const echartsCanvases = await Promise.all(echartsCanvasPromises);

      // 10. 将所有 ECharts 图表绘制到最终 Canvas 上
      echartsCanvases.forEach((canvas, index) => {
        const container = this.$refs.echartsContainer[index];
        finalContext.drawImage(canvas, container.offsetLeft, container.offsetTop);
      });

      // 11. 将最终合成的 Canvas 转换为图片数据并显示图片预览
      this.previewImage = finalCanvas.toDataURL('image/png');
    },

    // 等待 Cesium 渲染完成
    waitForCesiumRender() {
      return new Promise(resolve => {
        // 请求 Cesium 重新渲染场景
        this.viewer.scene.requestRender();

        // 缩短延迟时间到 100 毫秒，减少等待时间
        setTimeout(resolve, 100);
      });
    },

    // 下载预览图片
    downloadImage() {
      const link = document.createElement('a');
      link.download = 'scene_with_legend.png';
      link.href = this.previewImage;
      link.click();
      this.previewImage = null;
    },

    // 关闭预览窗口
    closePreview() {
      this.previewImage = null;
    },
  }
};
</script>

<style scoped>
.noteContainer {
  position: absolute;
  padding: 5px;
  border-radius: 5px;
  top: 40%;
  left: 10px;
  width: 120px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.export-button {
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 20; /* 确保按钮显示在最前面 */
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  cursor: pointer;
}

.export-button:hover {
  background-color: #2980b9;
}

.legend_item {
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 5px;
  color: white;
}

.echarts-container {
  position: absolute;
  width: 150px;
  height: 150px;
  pointer-events: auto; /* 允许鼠标事件 */
  background-color: transparent;
}

.block {
  display: inline-block;
  width: 30%;
  height: 20px;
  margin-right: 7px;
}

.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.compassContainer {
  position: absolute;
  top: 20px; /* 调整为距离顶部的像素 */
  right: 20px; /* 调整为距离右侧的像素 */
  height: 120px;
  width: 160px;
  background: url(@/assets/compass.png) no-repeat center / cover;
  z-index: 20;
}

.markCollection span {
  margin: 5px;
  width: 30px;
  height: 30px;
}

.markCollection span:hover {
  cursor: pointer;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  display: none !important;
}

.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 20px;
  border-radius: 5px;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.download-button,
.cancel-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.download-button:hover,
.cancel-button:hover {
  background-color: #2980b9;
}

/* 确保按钮显示在图片的下方正中央 */
.preview-buttons {
  justify-content: center;
  margin-top: 10px;
}
</style>
