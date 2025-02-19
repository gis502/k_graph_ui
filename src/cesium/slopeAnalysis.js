import * as Cesium from 'cesium'
import {useCesiumStore} from "@/store/modules/cesium.js";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import * as turf from "@turf/turf";
import { ElMessage } from 'element-plus';
import {
  Cartesian3,
  Cartographic, ClassificationType, Color,
  Math as CesiumMath,
  PolygonHierarchy,
  Rectangle,
  sampleTerrainMostDetailed
} from "cesium";

// 坡面分析图例数据
let slopeStatistics = [
  {
    degree: '< 15°',
    color: '#00FF00',
    proportion: ''
  },
  {
    degree: '15°- 30°',
    color: '#FFFF00',
    proportion: ''
  },
  {
    degree: '30°- 45°',
    color: '#FFCC00',
    proportion: ''
  },
  {
    degree: '45°- 60°',
    color: '#FF7F00',
    proportion: ''
  },
  {
    degree: '> 60°',
    color: '#FF0000',
    proportion: ''
  }
];


let handler = null; // 事件处理器
let isDrawing = false; // 是否允许绘制
let createdEntities = [];  // 用于存储绘制的实体
let contourSource; // 用于保存等高线数据源


/**
 * 坡面分析与绘制监听器
 * @param websock
 */
export function toggleSlopeAnalysis(websock) {
  if (handler) {
    // 如果 handler 已经存在，先移除旧的处理器，避免重复绑定
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler = null;  // 清除现有的事件处理器
  }

  let firstClickPosition = null;
  let secondClickPosition = null;
  window.viewer.terrainProvider = Cesium.createWorldTerrain();

  const canvas = viewer.scene.canvas;
  handler = new Cesium.ScreenSpaceEventHandler(canvas);

  // 给用户提示的函数
  const showPrompt = (message) => {
    ElMessage({
      message: message,
      type: 'info',
      duration: 1000,  // 显示 1 秒
    });
  };

  handler.setInputAction((movement) => {
    if (!isDrawing) {
      return;  // 禁止在标记完两个点后继续绘制
    }

    let ray = viewer.camera.getPickRay(movement.position);
    let position = viewer.scene.globe.pick(ray, viewer.scene);
    let cartographic = Cesium.Cartographic.fromCartesian(position);
    let geom = cartographicToGeoJSON(cartographic);
    let longitude = geom.coordinates[0];
    let latitude = geom.coordinates[1];

    // 在每次点击前，给出提示
    if (!firstClickPosition) {
      showPrompt("您已标绘第一个点");
    } else if (!secondClickPosition) {
      showPrompt("您已标绘最后一个点");
    }

    drawSite(position);
    // console.log(position);

    // 第一次点击，记录第一个点
    if (!firstClickPosition) {
      firstClickPosition = {longitude, latitude};
      // console.log("第一个点：", position);
    }
    // 第二次点击，记录第二个点
    else if (!secondClickPosition) {
      secondClickPosition = {longitude, latitude};
      // console.log("第二个点：", position);

      // 计算矩形的两个角点并打印
      printRectangleCoordinates(firstClickPosition, secondClickPosition);

      // 禁止进一步绘制
      isDrawing = false;

      // 重置点击位置
      firstClickPosition = null;
      secondClickPosition = null;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 允许绘制，只能绘制两个点
  isDrawing = true;

  let cesiumStore = useCesiumStore();
  cesiumPlot.init(window.viewer, websock, cesiumStore);
}

/**
 * 清除所有坡面分析的实体与图层
 */
export function deleteSlopeEntities() {
  createdEntities.forEach(entity => {
    if (entity.property && entity.property.type === 'slope') {
      viewer.entities.remove(entity);
    }
  });
  createdEntities = [];

  // console.log(contourSource)
  viewer.dataSources.remove(contourSource); // 删除数据源
  contourSource = null; // 清空数据源引用
}

/**
 * 计算矩形的四个角点并打印
 * @param firstPoint
 * @param secondPoint
 */
function printRectangleCoordinates(firstPoint, secondPoint) {
  // console.log("firstPoint:",firstPoint)
  // console.log("secondPoint:",secondPoint)
  const minLon = Math.min(firstPoint.longitude, secondPoint.longitude);
  const maxLon = Math.max(firstPoint.longitude, secondPoint.longitude);
  const minLat = Math.min(firstPoint.latitude, secondPoint.latitude);
  const maxLat = Math.max(firstPoint.latitude, secondPoint.latitude);

  addSlopeCanvas(minLon,maxLon,minLat,maxLat)

  // console.log('矩形的经纬度范围：');
  // console.log('西南角: ', minLon, minLat);
  // console.log('东北角: ', maxLon, maxLat);
  // console.log('西北角: ', minLon, maxLat);
  // console.log('东南角: ', maxLon, minLat);
  // console.log('minLon: ', minLon);
  // console.log('maxLon: ', maxLon);
  // console.log('minLat: ', minLat);
  // console.log('maxLat: ', maxLat);

}

/**
 * 画对角点用于坡面分析
 * @param clickedPoint
 */
function drawSite(clickedPoint) {
  if (window.viewer) {
    let entity = window.viewer.entities.add({
      position: clickedPoint,
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
        depthTest: false, // 禁止深度测试
        disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
      },
      property: {
        type: 'slope'
      }
    });
    createdEntities.push(entity);
  }
}

/**
 * 添加坡面canvas
 * @param minLon
 * @param maxLon
 * @param minLat
 * @param maxLat
 */
function addSlopeCanvas(minLon, maxLon, minLat, maxLat) {
  // 测试区域
  const extent = [minLon, minLat, maxLon, maxLat]
  // 获取包围盒坐标
  const polygonPos = turf.getCoord(extent);

  const rectangle = Rectangle.fromDegrees(...polygonPos);
  // console.log("----------",rectangle)
  const width = 20; // 横向点数
  const height = 20; // 纵向点数
  const positions = [];

  // 格网度数
  const dx = (polygonPos[2] - polygonPos[0]) / width;
  const dy = (polygonPos[3] - polygonPos[1]) / height;

  // 格网距离
  const ddx =
    Cartesian3.distance(
      Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
      Cartesian3.fromDegrees(polygonPos[2], polygonPos[1])
    ) / width;
  const ddy =
    Cartesian3.distance(
      Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
      Cartesian3.fromDegrees(polygonPos[0], polygonPos[3])
    ) / height;

  // console.log("111111")
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const longitude = CesiumMath.toDegrees(
        CesiumMath.lerp(rectangle.west, rectangle.east, x / (width - 1))
      );
      const latitude = CesiumMath.toDegrees(
        CesiumMath.lerp(rectangle.north, rectangle.south, y / (height - 1))
      );

      // 八连通点
      positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude)); // w
      positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude - dy / 2)); // ws
      positions.push(Cartographic.fromDegrees(longitude, latitude + dy / 2)); // n
      positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude + dy / 2)); // wn
      positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude)); // e
      positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude + dy / 2)); // en
      positions.push(Cartographic.fromDegrees(longitude, latitude - dy / 2)); // s
      positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude - dy / 2)); // es

      // 顶点
      positions.push(Cartographic.fromDegrees(longitude, latitude)); // mid
    }
  }

  // console.log("222222")

  // 创建等值线区域
  // let extent = [120, 30, 120.1, 30.1];
  let heightArr = [];
  // 等高线生成效果与控制点是否精细有关
  let pointGrid = turf.pointGrid(extent, 0.001, {
    units: "degrees",
  });

  // console.log(pointGrid.features, "pointGrid.features");
  for (let i = 0; i < pointGrid.features.length; i++) {
    heightArr.push(
      Cesium.Cartographic.fromDegrees(
        pointGrid.features[i].geometry.coordinates[0],
        pointGrid.features[i].geometry.coordinates[1]
      )
    );
  }

  // console.log(window.viewer.terrainProvider)
  setTimeout(()=>{
    // console.log(viewer._cesiumWidget.terrainProvider,viewer.terrainProvider)
    // sampleTerrainMostDetailed(viewer._cesiumWidget.terrainProvider, positions).then((updatedPositions) => {

    let arr = positions.concat(heightArr)
    sampleTerrainMostDetailed(window.viewer.terrainProvider, arr).then((updatedPositions) => {
      let slopes = [];
      let fxValues = [];
      let fyValues = [];
      let heightArr = [];
      let testArr = [];
      let breaks = [];

      // 遍历 positions 部分，计算坡度和方向
      for (let i = 0; i < updatedPositions.length; i += 9) {
        if (i + 8 >= updatedPositions.length) break; // 防止越界

        const westHeight = updatedPositions[i + 0].height;
        const westSouthHeight = updatedPositions[i + 1].height;
        const northHeight = updatedPositions[i + 2].height;
        const westNorthHeight = updatedPositions[i + 3].height;
        const eastHeight = updatedPositions[i + 4].height;
        const eastNorthHeight = updatedPositions[i + 5].height;
        const southHeight = updatedPositions[i + 6].height;
        const eastSouthHeight = updatedPositions[i + 7].height;

        const fx =
          (westSouthHeight +
            2 * southHeight +
            eastSouthHeight -
            (westNorthHeight + 2 * northHeight + eastNorthHeight)) /
          (8 * ddx);
        const fy =
          (eastNorthHeight +
            2 * eastHeight +
            eastSouthHeight -
            (westNorthHeight + 2 * westHeight + westSouthHeight)) /
          (8 * ddy);

        const slope = Math.atan(Math.sqrt(fx ** 2 + fy ** 2));
        slopes.push(slope);
        fxValues.push(fx);
        fyValues.push(fy);
      }

      // 更新材质（假设 createMaterial 是用户自定义的函数）
      // console.log("Slope calculations complete");
      createMaterial(polygonPos, slopes, fxValues, fyValues);

      // 创建 pointGrid 并计算等高线
      let pointGrid = turf.pointGrid(extent, 0.001, { units: "degrees" });
      for (let i = positions.length; i < updatedPositions.length; i++) {
        heightArr.push(updatedPositions[i]); // 收集剩余位置的高度数据
      }

      // 将高度数据更新到 pointGrid
      for (let i = 0; i < pointGrid.features.length; i++) {
        pointGrid.features[i].properties.height = heightArr[i]?.height || 0;
        testArr.push(heightArr[i]?.height || 0);
      }

      // 计算 breaks
      testArr.sort((a, b) => a - b);
      let minHeight = testArr[0];
      let maxHeight = testArr[testArr.length - 1];
      let step = (maxHeight - minHeight) / 10;
      for (let i = 0; i < 10; i++) {
        breaks.push(minHeight + i * step);
      }

      // 使用 turf.js 生成等高线
      let lines = turf.isolines(pointGrid, breaks, { zProperty: "height" });

      // 平滑等高线
      lines.features.forEach((feature) => {
        let coords = feature.geometry.coordinates;
        let lineCoords = [];
        coords.forEach((coord) => {
          let line = turf.lineString(coord);
          let curve = turf.bezierSpline(line);
          lineCoords.push(curve.geometry.coordinates);
        });
        feature.geometry.coordinates = lineCoords;
      });

      // 加载等高线到 Cesium
      Cesium.GeoJsonDataSource.load(lines, {
        stroke: Cesium.Color.RED,
        strokeWidth: 3,
        fill: Cesium.Color.RED,
        extruded: true,
        clampToGround: true,
      })
        .then((source) => {
          contourSource = source; // 保存数据源
          window.viewer.dataSources.add(contourSource);
          // console.log("Contour lines added successfully");
        })
        .catch((error) => {
          console.error("Error loading GeoJSON data:", error);
        });
    });

  },5000)

}

/**
 * 生成坡面材质
 * @param polygonPos
 * @param slopes
 * @param fxValues
 * @param fyValues
 */
function createMaterial(polygonPos, slopes, fxValues, fyValues) {
  // console.log('坡度计算完成，材质生成逻辑在此实现');
  const canvas = toCanvas(slopes, fxValues, fyValues);
  // console.log("666666")
  const positions = [
    Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
    Cartesian3.fromDegrees(polygonPos[0], polygonPos[3]),
    Cartesian3.fromDegrees(polygonPos[2], polygonPos[3]),
    Cartesian3.fromDegrees(polygonPos[2], polygonPos[1]),
  ];
  let entity = window.viewer.entities.add({
    polygon: {
      hierarchy: new PolygonHierarchy(positions),
      material: new Cesium.ImageMaterialProperty({
        image: canvas,
      }),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
      depthTest: false,//禁止深度测试但是没有下面那句有用
      disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
      classificationType: ClassificationType.BOTH,
    },
    property: {
      type: 'slope'
    }
  });

  createdEntities.push(entity);
}

/**
 * 处理计算数据
 * @param slopes
 * @param fxValues
 * @param fyValues
 * @returns {HTMLCanvasElement}
 */
function toCanvas(slopes, fxValues, fyValues) {
  // console.log("444444");
  const w = 20;
  const h = 20;
  const canvas = document.createElement("canvas");
  canvas.width = 2000; // 放大画布以便观察
  canvas.height = 2000;
  let totalCells = w * h;
  const ctx = canvas.getContext("2d");
  const cellSize = canvas.width / w;

  let slopeCounts = [0, 0, 0, 0, 0];
  const bitmap = new Uint8ClampedArray(w * h * 4); // 每像素 RGBA

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const slopeIndex = y * w + x;
      const slope = slopes[slopeIndex];
      const fx = fxValues[slopeIndex]; // x方向坡度分量
      const fy = fyValues[slopeIndex]; // y方向坡度分量

      let color;
      let rangeIndex;

      // 根据坡度范围分配颜色
      if (slope < Math.PI / 18) {
        rangeIndex = 0;
        color = Color.fromCssColorString("#00FF00").withAlpha(0.4); // 浅绿色，透明度增大
      } else if (slope < Math.PI / 12) {
        rangeIndex = 1;
        color = Color.fromCssColorString("#FFFF00").withAlpha(0.4); // 黄色，透明度增大
      } else if (slope < Math.PI / 6) {
        rangeIndex = 2;
        color = Color.fromCssColorString("#FFCC00").withAlpha(0.4); // 橙色，透明度增大
      } else if (slope < Math.PI / 4) {
        rangeIndex = 3;
        color = Color.fromCssColorString("#FF7F00").withAlpha(0.4); // 橘红色，透明度增大
      } else {
        rangeIndex = 4;
        color = Color.fromCssColorString("#FF0000").withAlpha(0.4); // 红色，透明度增大
      }
      slopeCounts[rangeIndex]++;

      // 绘制背景颜色
      ctx.fillStyle = color.toCssColorString();
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


      // 绘制箭头：主线加箭头头部
      const centerX = x * cellSize + cellSize / 2;
      const centerY = y * cellSize + cellSize / 2;

      const arrowLength = cellSize / 2; // 调整箭头长度
      let norm = Math.sqrt(fx ** 2 + fy ** 2) || 1; // 防止除以 0

      if(fx * fy > 0){
        norm = -norm
      }

      const directionX = fx / norm; // 反方向，确保箭头指向下坡
      const directionY = fy / norm;

      // 起点和终点的偏移量
      const offsetX = directionX * arrowLength * 0.5;
      const offsetY = directionY * arrowLength * 0.5;

      const startX = centerX - offsetX;
      const startY = centerY - offsetY;
      const endX = centerX + offsetX;
      const endY = centerY + offsetY;

      // 绘制箭头主线
      ctx.strokeStyle = "yellow"; // 箭头为黄色
      ctx.lineWidth = 5; // 增加箭头线条宽度
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 绘制箭头头部（三角形）
      const arrowHeadSize = 10; // 调整箭头头部大小
      const headX1 = endX - arrowHeadSize * (directionX - directionY);
      const headY1 = endY - arrowHeadSize * (directionY + directionX);
      const headX2 = endX - arrowHeadSize * (directionX + directionY);
      const headY2 = endY - arrowHeadSize * (directionY - directionX);

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(headX1, headY1);
      ctx.lineTo(headX2, headY2);
      ctx.closePath();
      ctx.fillStyle = "yellow"; // 箭头头部为黄色
      ctx.fill();
    }
  }

  const slopeRatios = slopeCounts.map(count => (count / totalCells * 100).toFixed(2) + "%");
  // console.log("坡度范围比例：", slopeRatios);
  slopeStatistics[0].proportion = slopeRatios[0];
  slopeStatistics[1].proportion = slopeRatios[1];
  slopeStatistics[2].proportion = slopeRatios[2];
  slopeStatistics[3].proportion = slopeRatios[3];
  slopeStatistics[4].proportion = slopeRatios[4];
  const event = new CustomEvent('slopeStatisticsUpdated', {
    detail: slopeStatistics
  });
  window.dispatchEvent(event);

  const imageData = new ImageData(bitmap, w, h);
  ctx.putImageData(imageData, 0, 0); // 直接覆盖
  // console.log("555555");
  return canvas;
}

/**
 * 将 Cartographic 转换为 GeoJSON Point 对象
 * @param cartographic
 * @returns {{coordinates: number[], type: string}}
 */
function cartographicToGeoJSON(cartographic) {
  // 将 Cesium.Cartographic 弧度转换为 GeoJSON 所需的度
  let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
  let lat = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度

  // 返回 GeoJSON 格式的 Point 对象
  return {
    "type": "Point",
    "coordinates": [lon, lat]
  };
}
