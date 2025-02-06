import * as Cesium from 'cesium'
import {Entity} from "cesium";



// 查询指定范围内的物资点

export function selectPoints(radius, lng, lat) {
  if (!isNaN(parseFloat(radius))) {
    radius = parseFloat(radius) * 1000;

    // 将经纬度转换为 Cartesian3 类型
    const position = Cesium.Cartesian3.fromDegrees(
      parseFloat(lng),
      parseFloat(lat)
    );
    viewer.entities.values.forEach((entity) => {
      if (entity.ellipse) {
        viewer.entities.remove(entity);
      }
    });
    viewer.entities.add({
      position: position,
      ellipse: {
        semiMajorAxis: radius,
        semiMinorAxis: radius,
        material: Cesium.Color.GREEN.withAlpha(0.5),
      },
      customType: "emergencySite"
    });
  }
}

// 通过目标数量匹配物资
export function marchSupplyByCount(array, searchSupplyForm) {
  let tents = 0
  let raincoats = 0
  let rainBoots = 0
  let flashlights = 0
  let flag = false
  let bool1 = searchSupplyForm.tents <= 0
  let bool2 = searchSupplyForm.raincoats <= 0
  let bool3 = searchSupplyForm.rainBoots <= 0
  let bool4 = searchSupplyForm.flashlights <= 0
  let resultArray = []
  array.forEach((ele) => {
    if (ele.tents === 0) {
      bool1 = true
    }
    if (ele.raincoats === 0) {
      bool2 = true
    }
    if (ele.rainBoots === 0) {
      bool3 = true
    }
    if (ele.flashlights === 0) {
      bool4 = true
    }
    if (!bool1 || !bool2 || !bool3 || !bool4) {
      tents += ele.tents;
      raincoats += ele.raincoats;
      rainBoots += ele.rainBoots;
      flashlights += ele.flashlights;
      // console.log("rainBoots=====-----",rainBoots)
      if (tents >= this.searchSupplyForm.tents
        && raincoats >= this.searchSupplyForm.raincoats
        && rainBoots >= this.searchSupplyForm.rainBoots
        && flashlights >= this.searchSupplyForm.flashlights) {
        flag = true;
      }
      resultArray.push(ele)
    }
  });
  // console.log("flag-----------------",flag)
  if (flag) {
    return resultArray
  } else {
    return []
  }
}

//路径规划
export function billboardD(position, img, billBoardId) {
  viewer.entities.add({
    id: billBoardId,
    position: position,
    billboard: {
      image: img,
      // width: 25,//图片宽度,单位px
      // height: 25,//图片高度，单位px // 会影响point大小，离谱
      // eyeOffset: new Cesium.Cartesian3(-1, 1, 0),//与坐标位置的偏移距离
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
      depthTest: false, //禁止深度测试但是没有下面那句有用
      disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
    },
    customType: "emergencySite",
    selfType: "route",
  });
}

export function polylineD(data, propertiesId, uniqueId){
  let arr = [];
  for (let i = 0; i < data.length; i++) {
    let c3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
    // let cartographic = Cesium.Cartographic.fromDegrees(data[i][0],data[i][1])
    // let cartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic)
    arr.push(c3);
  }

  viewer.entities.add({
    id: uniqueId,  // 为每个折线实体指定唯一的 id
    polyline: {
      positions: arr,
      width: 10,
      depthFailMaterial: Cesium.Color.YELLOW,
      clampToGround: true,
    },
    customType: "emergencySite",
    selfType: "route",
    properties: {
      propertiesId,
    },
  });

}

export function polygonD(positions, id) {
  let arr = [];
  for (let i = 0; i < positions.length; i++) {
    let a = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);
    arr.push(a);
  }
  let polygon = new Entity({
    id: id,
    polygon: {
      hierarchy: arr,
      material: new Cesium.Color.fromCssColorString("#FFD700").withAlpha(
        0.2
      ),
      clampToGround: true,
    },
    properties: {},
  });
  viewer.entities.add(polygon);
}

//绘制半径的中心点
export function pointD(position, id) {
  return viewer.entities.add({
    id: id,
    position: position,
    point: {
      pixelSize: 20,
      color: Cesium.Color.RED,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
      depthTest: false, //禁止深度测试但是没有下面那句有用
      disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
    },
  });
}

/** 计算两个坐标的距离，单位米 **/
export function Distance(lng1, lat1, lng2, lat2) {
  //采用Haversine formula算法，高德地图的js计算代码，比较简洁 https://www.cnblogs.com/ggz19/p/7551088.html
  let d = Math.PI / 180;
  let f = lat1 * d,
    h = lat2 * d;
  let i = lng2 * d - lng1 * d;
  let e =
    (1 - Math.cos(h - f) + (1 - Math.cos(i)) * Math.cos(f) * Math.cos(h)) /
    2;
  return 2 * 6378137 * Math.asin(Math.sqrt(e));
}

/** 以坐标点为中心，简单粗略的创建一个指定半径的圆，半径单位米，pointCount为构建圆的坐标点数（比如24个点，点越多越圆，最少3个点），返回构成圆的坐标点数组 **/
export function
CreateSimpleCircle(lng, lat, radius, pointCount) {
  //球面坐标不会算，转换成三角坐标简单点，经度代表值大约：0.01≈1km 0.1≈10km 1≈100km 10≈1000km
  let km = radius / 1000;
  let a = km < 5 ? 0.01 : km < 50 ? 0.1 : km < 500 ? 1 : 10;
  let b = Distance(lng, lat, lng + a, lat);
  let c = Distance(lng, lat, lng, lat + a);
  let rb = (radius / b) * a;
  let rc = (radius / c) * a;
  let arr = [];
  let n = 0,
    step = 360.0 / pointCount,
    N = 360 - step / 2; //注意浮点数±0.000000001的差异
  for (let i = 0; n < N; i++, n += step) {
    let x = lng + rb * Math.cos((n * Math.PI) / 180);
    let y = lat + rc * Math.sin((n * Math.PI) / 180);
    arr[i] = [x, y];
  }
  arr.push([arr[0][0], arr[0][1]]); //闭环
  return arr;
}
export function formatTime(minutes) {
  const hours = Math.floor(minutes / 60); // 计算小时数
  const remainingMinutes = Math.round(minutes % 60); // 计算剩余的分钟数并四舍五入
  return `${hours > 0 ? hours + '小时' : ''}${remainingMinutes}分钟`;
}
