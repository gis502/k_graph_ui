<template>
  <div>
    <!--    工具-->
<!--    <div class="tool_container">-->
<!--      &lt;!&ndash;      <button @click="openTool('paintBrushTool')">画笔</button>&ndash;&gt;-->
<!--      &lt;!&ndash;      <button @click="clearTool('paintBrushTool')">清除画笔</button>&ndash;&gt;-->
<!--      &lt;!&ndash;      <button class="_btn" type="button" @click="clearMap()">清空所有</button>&ndash;&gt;-->
<!--      <button @click="setMapStyle('black')" class="theme">black</button>-->
<!--      <button @click="setMapStyle('indigo')" class="theme">indigo</button>-->
<!--      <button @click="resetMapStyle" class="theme">恢复默认</button>-->
<!--    </div>-->
    <!--指南针-->
    <div class="compassContainer"></div>

    <!--    地图-->
    <div @contextmenu.prevent    id="emap" class="map_container" > </div>

    <!--信息窗-->
<!--    <InfoWindow-->
<!--        ref="infoWindow"-->
<!--        v-show="showInfoWindow"-->
<!--        :infoWindow="mapConfig.infoWindow"-->
<!--        :data="mapConfig.infoWindowData"-->
<!--        @callback="infoWindowCallback"-->
<!--    ></InfoWindow>-->
  </div>
  <!-- 自制图例 -->
  <div class="legend">

    <div class="row">
      <!-- 左列（最新，红色）-->
      <div class="column">
        <div
            class="line latest"
            v-for="(item, itemIndex) in eqGroups[1].items"
            :key="'latest-' + itemIndex"
        >

          {{ item.label }}<span
            :class="[item.type, {'inactive': !seriesVisibility['latest-' + item.type]}]"
            @click="toggleSeriesVisibility('latest', item.type)"
        ></span>
        </div>
      </div>

      <!-- 右列（历史，黄色）-->
      <div class="column">
        <div
            class="line history"
            v-for="(item, itemIndex) in eqGroups[0].items"
            :key="'history-' + itemIndex"
        >
          {{ item.label }}<span
            :class="[item.type, {'inactive': !seriesVisibility['history-' + item.type]}]"
            @click="toggleSeriesVisibility('history', item.type)"
        ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import red from '@/assets/star.gif';
import yellow from '@/assets/yellow3.png';
import {ref, onMounted, defineProps ,reactive ,watch} from 'vue';
import InfoWindow from './emap/infowindow.vue';
// 信息窗口 在后面
// 用于在组件中定义和接收 props（属性）


// 图例分类
const eqGroups = ref([
  {
    type: 'history',
    items: [
      {type: 'moderate', label: '历史4.5 - 6级'},
      {type: 'major', label: '历史6级以上'}
    ]
  },
  {
    type: 'latest',
    items: [
      {type: 'slight', label: '最新4.5级以下'},
      {type: 'moderate', label: '最新4.5 - 6级'},
      {type: 'major', label: '最新6级以上'}
    ]
  }
]);

// 用于存储系列的可见性状态
const seriesVisibility = ref({
  'history-moderate': true,
  'history-major': true,
  'latest-slight': true,
  'latest-moderate': true,
  'latest-major': true
});

export default {
  components: { InfoWindow },
  props: ['eqData'],
  setup(props) {
    const showInfoWindow = ref(false);  //信息框
    // const props = defineProps(['eqData']);
    const latestEqData = ref([]);  //最新数据初始化
    const historyEqData = ref([]);  //历史数据初始化


    // 数据分组
    const dataGroups = ref({
      latestSlight: [],
      latestModerate: [],
      latestMajor: [],
      historyModerate: [],
      historyMajor: []
    });

    const mapConfig = ref({
      map: null, //地图容器
      infoWindow: null, //信息窗口
      infoWindowData: {}, //信息窗口数据
      showInfoWindow: false, //信息窗口显示
      paintBrushTool: null, // 画笔工具实例
      isDrawing: false, // 是否正在绘制中
    });

    watch(() => props.eqData, () => {
      latestEqData.value = [props.eqData[0]]; // 只取最新的一个
      historyEqData.value = props.eqData.slice(1); // 剩下的为历史数据

      console.log("2222222222222222222222222222222",latestEqData.value)

      // 处理数据分组
      processData();
      initMap(); // 初始化地图
    });

    const processData = () => {
      //处理最新地震数据，映射成适合 ECharts 使用的格式
      const latestData = latestEqData.value.map(item => ({
        position: item.earthquakeName,
        magnitude: parseFloat(item.magnitude),
        longitude: item.longitude,
        latitude: item.latitude,
        // 数据库表中time字段院数据为2015-01-03 08:16:20，
        // 但渲染在前端会出现个'T'，
        // 也就变成了2015-01-03T08:16:20，
        // 故以此将其删去
        time: item.occurrenceTime.replace("T", " "),
        depth: item.depth,
      }));

      //将历史地震数据 historyEqData 转换为合适的格式。
      const historyData = historyEqData.value.map(item => ({
        position: item.earthquakeName,
        magnitude: parseFloat(item.magnitude),
        longitude: item.longitude,
        latitude: item.latitude,
        time: item.occurrenceTime.replace("T", " "),
        depth: item.depth,
      }));
      // 根据震级分类
      dataGroups.value.latestSlight = latestData.filter(item => item.magnitude < 4.5);
      dataGroups.value.latestModerate = latestData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
      dataGroups.value.latestMajor = latestData.filter(item => item.magnitude >= 6);
      dataGroups.value.historyModerate = historyData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
      dataGroups.value.historyMajor = historyData.filter(item => item.magnitude >= 6);

      console.log("最新4.5级以下地震:", dataGroups.value.latestSlight);
      console.log("最新4.5 - 6级地震:", dataGroups.value.latestModerate);
      console.log("最新6级以上地震:", dataGroups.value.latestMajor);
      console.log("历史4.5 - 6级地震:", dataGroups.value.historyModerate);
      console.log("历史6级以上地震:", dataGroups.value.historyMajor);


    };





    // 初始化地图
    // 将地图挂载到 emap 容器中，并通过 centerAndZoom 设置中心点和缩放级别。
    const initMap = () => {
      processData();
      // 通过 T.Map 创建一个新的天地图实例，并将地图绑定到页面中 ID 为 'emap' 的 DOM 元素上。
      // mapConfig.value.map 是一个可变的 mapConfig 对象，里面存放了地图的实例。
      mapConfig.value.map = new T.Map('emap');
      // 设置地图的中心点和缩放级别。
      mapConfig.value.map.centerAndZoom(new T.LngLat(103.00, 30.00), 6);

      // // 添加地图类型控件
      // const mapTypeControl = new T.Control.MapType();
      // mapConfig.value.map.addControl(mapTypeControl);

      // 设置地图的初始主题为 indigo
      setMapStyle('indigo');

      // // **添加指南针控件**
      // const navigationControl = new T.Control.Navigation();
      // mapConfig.value.map.addControl(navigationControl);

      // 创建比例尺控件对象
      const scale = new T.Control.Scale();
      // 添加比例尺控件
      mapConfig.value.map.addControl(scale);
      // 确认比例尺控件是否添加成功
      console.log('Scale control added:', scale);


      // 初始化画笔工具
      mapConfig.value.paintBrushTool = new T.PolylineTool(mapConfig.value.map, {
        color: 'red', // 线条颜色
        weight: 2,    // 线条宽度
        opacity: 0.8, // 透明度
        keepdrawing: false,
      });

      addMarkers();//标点

      initMapAfter();//加载地图后方法
      // 添加鼠标悬停事件监听
      // mapConfig.value.map.addEventListener('mousemove', onMapMouseMove);
    };

    const initMapAfter = () => {


      // 初始化地图后的操作
    };


    // 启动画笔工具
    const openTool = (toolName) => {
      if (toolName === 'paintBrushTool' && mapConfig.value.paintBrushTool) {
        mapConfig.value.isDrawing = true;
        mapConfig.value.paintBrushTool.open();

        // 监听鼠标事件
        mapConfig.value.map.addEventListener('mousedown', stopEvent);
        mapConfig.value.map.addEventListener('mouseup', handleMouseUp);
      }
    };

    // 停止事件传播
    const stopEvent = (event) => {
      event.stopPropagation();
    };

    // 鼠标松开时的处理
    const handleMouseUp = () => {
      mapConfig.value.isDrawing = false; // 关闭绘制状态
      mapConfig.value.map.removeEventListener('mousedown', stopEvent);
      mapConfig.value.map.removeEventListener('mouseup', handleMouseUp);
    };

    // 清除画笔工具绘制的内容
    const clearTool = (toolName) => {
      if (toolName === 'paintBrushTool' && mapConfig.value.paintBrushTool) {
        mapConfig.value.paintBrushTool.clear(); // 清除已绘制的线条
        mapConfig.value.isDrawing = false;

        // 移除鼠标事件监听
        mapConfig.value.map.removeEventListener('mousedown', stopEvent);
        mapConfig.value.map.removeEventListener('mouseup', handleMouseUp);
      }
    };

    // 标准图层--black/indigo
    const setMapStyle = (style) => {
      if (mapConfig.value.map) {
        mapConfig.value.map.setStyle(style);
      } else {
        console.error("Map instance not initialized.");
      }
    };

    // 标准图层--恢复默认
    const resetMapStyle = () => {
      if (mapConfig.value.map) {
        mapConfig.value.map.removeStyle();
      } else {
        console.error("Map instance not initialized.");
      }
    };


    // 添加标记
    const addMarkers = () => {
      // 清除当前所有标记
      clearMarkers();
      Object.keys(seriesVisibility.value).forEach(key => {
        if (seriesVisibility.value[key]) {
          const [group, type] = key.split('-');
          dataGroups.value[`${group}${capitalize(type)}`].forEach(item => {
            addMarker1(item.longitude, item.latitude, group === 'latest' ? 'red' : 'yellow', getMarkerSize(type));
          });
        }
      });
    };

    const clearMarkers = () => {
      mapConfig.value.map.clearOverLays() // 清除所有覆盖物
      // 这里应该实现清除当前所有标记的逻辑
      // 例如，使用 mapConfig.value.map.removeMarker(marker) 来移除标记
    };

    //
    // 点击图例中的点 在地图上点的展示消失效果
// ECharts中图例(legend)不支持分别定义图形大小，
// 故通过该函数与自制的图例div配合实现legend自带的筛选效果

    const toggleSeriesVisibility = (groupType, itemType) => {
      const key = `${groupType}-${itemType}`;
      seriesVisibility.value[key] = !seriesVisibility.value[key]; // 切换可见性
      addMarkers(); // 根据新的可见性状态更新标记
    };
    const getMarkerSize = type => (type === 'slight' ? 'small' : type === 'moderate' ? 'medium' : 'large');
    const capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    //点呼吸

    let breathingInterval = null;

    const startBreathingEffect = (marker) => {
      let scale = 1;
      let growing = true;

      breathingInterval = setInterval(() => {
        if (growing) {
          scale += 0.05;
          if (scale >= 1.5) growing = false;
        } else {
          scale -= 0.05;
          if (scale <= 1) growing = true;
        }

        marker.getElement().style.transform = `scale(${scale})`;
        marker.getElement().style.opacity = scale === 1.5 ? 1 : 0.8; // 调整透明度
      }, 100);
    };

    const stopBreathingEffect = () => {
      clearInterval(breathingInterval);
    };


    const addMarker1 = (lng, lat, color, size) => {
      let iconUrl;
      let iconSize;

      // 根据类型和大小选择图标样式
      if (color === 'red') {
        iconUrl = red;
        // 启动呼吸效果
        const marker = new T.Marker([lat, lng], { icon: iconUrl });
        startBreathingEffect(marker); // 启动呼吸效果
      } else {
        iconUrl = yellow;
      }

      switch (size) {
        case 'small':
          iconSize = new T.Point(18, 18);
          break;
        case 'medium':
          iconSize = new T.Point(23, 23);
          break;
        case 'large':
          iconSize = new T.Point(28, 28);
          break;
        default:
          iconSize = new T.Point(25, 25);
      }

      // 自定义标记点图标
      const markerObj = {
        icon: new T.Icon({
          iconUrl: iconUrl,
          iconSize: iconSize,
          iconAnchor: new T.Point(iconSize.x / 2, iconSize.y), // 图标中心对准位置
          opacity: 0.1 // 设置透明度
        }),
      };

      // 创建标记并添加到地图
      const marker = new T.Marker(returnLnglat([lng, lat]), markerObj);

      mapConfig.value.map.addOverLay(marker);

      // 添加点击事件处理器
      addClickHandler(marker, { lng, lat });


    };

    onBeforeUnmount(() => {
      stopBreathingEffect(); // 清理呼吸效果
    });

    // 添加点击事件返回
    const addClickHandler = (marker, params) => {
      marker.addEventListener('click', (e) => {
        showInfoWindow.value = true; //信息框
        mapConfig.value.map.panTo(returnLnglat(e.lnglat), 12); //将地图的中心点变换到指定的地理坐标
        markerClick(e, params);
      });
    };


    // 点击时间打开信息窗体
    const markerClick = (e, params) => {
      showInfoWindow.value = true;  //显示信息窗体
      mapConfig.value.infoWindowData = params;  //传递数据

      // 创建信息窗口对象
      mapConfig.value.infoWindow = new T.InfoWindow(
          document.querySelector('#infoWindow'),
          { offset: new T.Point(0, -20), closeButton: false }
      );

      setTimeout(() => {
        mapConfig.value.map.openInfoWindow(mapConfig.value.infoWindow, e.lnglat);  //打开信息窗口
      }, 0);
    };

    // 信息窗口点击回调
    const infoWindowCallback = (data) => {
      console.log('信息窗口点击回调', data);
      closeInfoWindow();// 关闭信息弹窗
    };

    // 关闭信息弹窗
    const closeInfoWindow = () => {
      if (mapConfig.value.infoWindow) {
        mapConfig.value.infoWindow.closeInfoWindow();
      }
    };



    // 清除地图
    const clearMap = (type) => {
      switch (type) {
        case 'marker':
          if (mapConfig.value.marker) {
            mapConfig.value.map.removeOverLay(mapConfig.value.marker) // 移除覆盖物到地图上
            mapConfig.value.marker = null
          }
          break
        default:
          mapConfig.value.map.clearOverLays() // 清除所有覆盖物



          // 清除信息窗口
          if (mapConfig.value.infoWindow) {
            mapConfig.value.infoWindow.closeInfoWindow()
          }
          break
      }
    };

    // 自适应标记覆盖物到合适范围
    const reset = (drawType) => {
      let mapData = '';
      switch (drawType) {
        case 'marker':
          mapData = [mapConfig.value.marker.getLngLat()];
          break;
        case 'markerCluster':
          // 获取所有标记点的经度和纬度坐标
          let allLng = 0;
          let allLat = 0;
          const tempMarkerClusterArr = mapConfig.value.map.getOverlays();
          tempMarkerClusterArr.forEach((element) => {
            allLng += element.or.lng;
            allLat += element.or.lat;
          });

          // 计算中心点的经纬度坐标
          const centerLng = allLng / tempMarkerClusterArr.length;
          const centerLat = allLat / tempMarkerClusterArr.length;

          // 模拟计算有误差，固定写某个经纬度和层级
          mapConfig.value.map.centerAndZoom(returnLnglat([centerLng, centerLat]), 7);
          break;
        default:
          break;
      }

      mapConfig.value.map.setViewport(mapData); // 适应范围
    };

    // 返回天地图经纬度对象
    const returnLnglat = (data) => {
      let x, y = null;
      switch (typeof data) {
        case 'string':
          const lnglat = data.split(',');
          x = lnglat[0];
          y = lnglat[1];
          break;
        case 'object':
          if (data && data.lng) {
            x = data.lng;
            y = data.lat;
          } else {
            x = data[0];
            y = data[1];
          }
          break;
        default:
          break;
      }
      return new T.LngLat(x, y);
    };

    onMounted(() => {
      // if (!mapConfig.value.map) {
      //   initMap();
      // }
    });


    return {

      mapConfig,
      showInfoWindow,  //信息窗
      openTool,  //画笔
      clearTool,  //清除画笔
      setMapStyle,
      reset,
      returnLnglat,
      resetMapStyle,
      clearMap,
      infoWindowCallback,
      eqGroups,
      seriesVisibility,
      toggleSeriesVisibility,
    };
  },
};
</script>
<style lang="scss" scoped>

//指南针
.compassContainer {
  position: absolute;
  top: 4vh;
  right: 31vw;
  height: 105px;
  width: 140px;
  background: url(../../assets/compass.png) no-repeat 0 0 / cover;
  z-index: 20;
}

//按钮
.theme {
  color: white;
  background-color: #222;
  font-weight: 500;
  border-radius: 0.5rem;
  font-size: 0.5rem;
  line-height: 2rem;
  cursor: pointer;
  text-align: center;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  border: none;
}

.theme:hover {
  background-color: #333;
}

.theme svg {
  display: inline;
  width: 1rem;
  height: 0.7rem;
  margin-right: 0.75rem;
  color: white;
}

.theme:focus svg {
  animation: spin_357 0.5s linear;
}

@keyframes spin_357 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}




//图例
.breathing-marker {
  animation: breathe 1.5s infinite; /* 1.5秒循环动画 */
}


.legend {
  position: absolute;
  bottom: 0;
  left: 10px;
  z-index: 20;
  background-color: transparent;
  width: 510px;
  height: 70px;
}


/*!*改为左边红右边黄*!*/
.row {
  display: flex;
  justify-content: space-between; /* 左右分列 */
  width: 20%;
}

.line {
  display: flex;
  align-items: center; /* 圆点与文本垂直居中对齐 */
  width: 130px;
  color: white;
  margin-top: 8px; /* 添加间距 */
  font-size: 14px;
}

.line span {
  display: flex;
  align-items: center; /* 圆点在其父容器中垂直居中 */
  /*display: inline-block; !* 确保点是块级元素 *!*/
  border-radius: 50%; /* 确保点是圆形 */
  margin-right: 10px;
}

.latest span {
  background-color: #ed2a2a; /* 红色 */
}

.history span {
  background-color: #f0a72e; /* 黄色 */
}

.inactive {
  background-color: #888 !important; /* 灰色 */
}

.line span {
  display: inline-flex; /* 使用 inline-flex 使得文本与圆点在一行 */
  align-items: center; /* 垂直居中 */
}

.line .slight {
  width: 10px; /* 小点的宽度 */
  height: 10px; /* 小点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 7px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.line .moderate {
  width: 15px; /* 中等点的宽度 */
  height: 15px; /* 中等点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 13px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.major {
  width: 20px; /* 大点的宽度 */
  height: 20px; /* 大点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 15px;
  margin-right: 1px; /* 圆点和文本之间的间距 */
}



// 工具栏
.tool_container {
  padding: 20px;
  ._btn {
    border: none;
    border-radius: 3px;
    padding:8px 12px;
    font-size: 12px;
    line-height: 1;
    background-color: #1890ff;
    color: #fff;

    &:not(:first-of-type) {
      margin-left: 15px;
    }
  }
}
.map_container {
  width: 640px;
  height: 600px;
  margin: 30px auto;
  z-index: 0;
  // 移除默认左下角logo文字  ———— ::v-deep不行的话用/deep/
  ::v-deep .tdt-control-copyright {
    display: none !important;
    opacity: 0 !important;
  }

  //  /deep/ .tdt-control-container {
  //    display: none !important;
  //  }

  // 自定义右键菜单
  ::v-deep #contextMenu {
    position: absolute;
    z-index: 400;
    background: #fff;
    border-radius: 2px;
    .menu-item {
      height: 35px;
      line-height: 35px;
      word-break: break-all;
      padding: 0 10px;
      font-size: 12px;
      min-width: 60px;
      text-align: center;
      white-space: nowrap;
      &:hover {
        background-color: #f3f3ee;
      }
    }
  }
}
</style>

