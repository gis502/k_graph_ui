import * as Cesium from 'cesium'
import fault_zone from "@/assets/geoJson/line_fault_zone.json";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan.json";
import {saveIntensityCircle} from "../../api/system/damageassessment.js";

// 雅安行政区加载
export function addYaanLayer() {
  //雅安行政区加载
  let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
    stroke: Cesium.Color.RED,
    fill: Cesium.Color.SKYBLUE.withAlpha(0.1),
    strokeWidth: 4,
  });
  geoPromise.then((dataSource) => {
    window.viewer.dataSources.add(dataSource);
    dataSource.name = 'YaanRegionLayer'; // 给图层取名字,以便删除时找到

    const colors = [
      {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
      {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
      {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
      {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
      {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
      {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
      {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
      {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
      {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
    ];
    dataSource.entities.values.forEach((entity, index) => {
      // console.log("dataSource entity",entity)
      // 根据实体索引依次从颜色数组中取颜色
      const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
      const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
      entity.polygon.material = colorMaterial; // 设置填充颜色
      // console.log("--------", index, "----------------", entity)
    });
    yaan.features.forEach((feature) => {
      let center = feature.properties.center;

      if (center && center.length === 2) {
        let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
        let regionlabel = viewer.entities.add(new Cesium.Entity({
          position: position,
          label: new Cesium.LabelGraphics({
            text: feature.properties.name,
            scale: 1,
            font: '18px Sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            fillColor: Cesium.Color.fromCssColorString("#ffffff"),
            pixelOffset: new Cesium.Cartesian2(0, 0)
          })
        }));
        this.RegionLabels.push(regionlabel)
      }
    })

    //雅安行政区加载 end
  })
}

// 绘制断裂带
export function addFaultZones(centerPoint) {
  const faultZoneLines = [];
  const lonAndlat = [centerPoint.longitude, centerPoint.latitude];

  // 直接解析经纬度
  let lon1 = parseFloat(lonAndlat[0]);
  let lat1 = parseFloat(lonAndlat[1]);

  let radlat1 = (lat1 * Math.PI) / 180.0;

  fault_zone.forEach((item) => {
    // 计算距离逻辑应调整为从断裂带的点到中心点的距离
    const itemLon = parseFloat(item.lonlat[0][0][0]);
    const itemLat = parseFloat(item.lonlat[0][0][1]);
    let radlat2 = (itemLat * Math.PI) / 180.0;
    let a = radlat1 - radlat2;
    let b = (lon1 * Math.PI) / 180.0 - (itemLon * Math.PI) / 180.0;
    let s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radlat1) *
          Math.cos(radlat2) *
          Math.pow(Math.sin(b / 2), 2)
        )
      );
    s = s * 6378.137; // 地球半径

    const num = Math.round(s * 10000) / 10000;

    if (num < 200) {
      faultZoneLines.push(item);
    }
  });

  faultZoneLines.forEach((item) => {
    let positionsArr = [];
    for (var i = 0; i + 1 < item.lonlat[0].length; i++) {
      positionsArr.push(
        parseFloat(item.lonlat[0][i][0]),
        parseFloat(item.lonlat[0][i][1]),
        0
      );
    }

    viewer.entities.add({
      id: item.line,
      polyline: {
        status: 1,
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positionsArr),
        width: 5,
        material: Cesium.Color.RED,
        depthFailMaterial: Cesium.Color.YELLOW,
        clampToGround: true,
      },
      properties: {
        type: "faultZone",
        name: item.name,
      },
      layer: "断裂带",
    });
  });
}

// 绘制历史地震点
export function addHistoryEqPoints(centerPoint, eqData) {
  // 圆圈的大小
  const semiMinorAxis = 50000.0;
  const semiMajorAxis = 50000.0;
  // console.log(eqData)

  // 添加圆圈
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(Number(centerPoint.longitude), Number(centerPoint.latitude)),
    ellipse: {
      semiMinorAxis: semiMinorAxis,
      semiMajorAxis: semiMajorAxis,
      material: Cesium.Color.YELLOW.withAlpha(0.2),
      outline: true,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      fill: true,
      clampToGround: true,
      rotation: 0,
    },
    properties: {
      type: "historyEq"
    },
  });

  const center = Cesium.Cartesian3.fromDegrees(Number(centerPoint.longitude), Number(centerPoint.latitude));

  // 渲染在圆圈内的地震点，并存储原始数据
  eqData.forEach((eq) => {
    if (eq.eqid !== centerPoint.eqid) {
      const position = Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude));

      // 判断是否在椭圆内
      const distance = Cesium.Cartesian3.distance(position, center);
      const radius = Math.max(semiMajorAxis, semiMinorAxis);

      if (distance <= radius) {
        const size = parseFloat(eq.magnitude) >= 6.0 ? 20 : 15; // 震级大于等于6.0为20，其他为15

        viewer.entities.add({
          position: position,
          billboard: {
            image: eqMark,
            width: size,
            height: size,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            show: false,
            showBackground: true,
            text: `${timestampToTime(eq.occurrenceTime, 'date')} ${eq.earthquakeName} ${eq.magnitude}级地震`,
            font: '16px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          properties: {
            tableName: `${timestampToTime(eq.occurrenceTime, 'date')} ${eq.earthquakeName} ${eq.magnitude}级地震`,
            historyEqTime: eq.occurrenceTime.replace('T', ' '),
            position: eq.earthquakeName,
            lon: eq.longitude,
            lat: eq.latitude,
            magnitude: eq.magnitude,
            type: "historyEq"
          },
          layer: "历史地震"
        });
      }
    }
  });
}
//计算烈度圈
export function computeOvalCircles(centerPoint) {

  // 计算椭圆长短轴------------------------------------------------------------------------------------------------------

  let lon = centerPoint.longitude;
  let lat = centerPoint.latitude;

  let longintenArray = []; //长轴烈度
  let shortintenArray = []; //短轴烈度
  let longAxisArray = []; //长轴数组
  let shortAxisArray = []; //短轴数组
  let longAndshort = []; //最终的长短轴数组，单位：千米
  var numi = 0;
  let R = 0 //震源到目标区域的距离，因为只需要震中的烈度，所以令其为零

  //汪素云-四川盆地
  let longAxis = 4.0293 + 1.3003 * centerPoint.magnitude - 3.6404 * Math.log10(R + 10); //长轴的烈度值
  let shortAxis = 2.3816 + 1.3003 * centerPoint.magnitude - 2.8573 * Math.log10(R + 5); //短轴的烈度值

  for (var i = Math.floor(longAxis); i >= 6; i--) {
    // console.log(i)
    if (longAxisArray.length >= 6) {
      break;
    }
    longintenArray.push(i); //长轴烈度

    R =
        // Math.exp(
        //     (2.795+1.600 * centerPoint.magnitude - i) /1.637
        // ) -28.497;
        Math.pow(10,
            (4.0293 + 1.3003 * centerPoint.magnitude - i) / 3.6404
        ) - 10;
    // console.log(R)
    longAxisArray.push(R);
  }
  for (var j = Math.floor(shortAxis); j >= 6; j--) {
    //计算烈度衰减圈的每一圈距离
    //限制最多显示的烈度圈数
    if (shortAxisArray.length >= 6) {
      break;
    }
    shortintenArray.push(j); //短轴烈度
    let R1 =
        // Math.exp(
        //     (1.331+1.218 * centerPoint.magnitude - j) /1.381
        // ) -  8.88;
        Math.pow(10,
            (2.3816 + 1.3003 * centerPoint.magnitude - j) / 2.8573
        ) - 5;
    shortAxisArray.push(R1);
  }

  for (let i = 0; i <= shortAxisArray.length - 1; i++) {
    if (longAxisArray[i] != null && shortAxisArray[i] != null) {
      (function (item, index) {
        var xy = new Array();
        xy[0] = longAxisArray[index] * 1000; //将符合条件每个长轴储存起来
        xy[1] = shortAxisArray[index] * 1000; //将符合条件每个短轴储存起来
        longAndshort[item] = xy;
      })(numi, i);
      numi++;
    }
  }

  // 计算角度------------------------------------------------------------------------------------------------------------
  var angle_list = [];
  for (var i = 0; i < fault_zone.length; i++) {
    var length_list = [];
    for (var line = 0; line < fault_zone[i].lonlat[0].length; line++) { //////算出每一个断裂带的坐标与当前震中坐标的距离（单位：度数）
      length_list.push(Math.sqrt(Math.pow(lon - parseFloat(fault_zone[i].lonlat[0][line][0]), 2) + Math.pow(lat - parseFloat(fault_zone[i].lonlat[0][line][1]), 2)))
    }
    length_list.sort(function (a, b) {
      return a - b
    });
    angle_list.push([i, length_list[0]])
  }
  angle_list.sort(function (a, b) {
    return a[1] - b[1]
  })
  var angle_num = fault_zone[angle_list[0][0]].angle;


  // 绘制烈度圈----------------------------------------------------------------------------------------------------------

  // let colorIntensity = [
  //   "#990000",
  //   "#cc0000",
  //   "#ff0000",
  //   "#ff6600",
  //   "#FF9900",
  //   "#ffcc00",
  // ];

  let intensityLabels = [
    "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "X", "XI", "XII"
  ];
  let intensityLabelsChinese = [
    "六", "七", "八", "九", "十", "十一", "十二"
  ];

  let angle_num_tmp;

  let lastsemiMajorAxis = 0;//震中
  let lastsemiMinorAxis = 0;
  let last_angle_num_tmp = 0; // 椭圆的旋转角度
  let savecircles = []  //存库信息

  for (let i = longAndshort.length - 1; i >= 0; i--) {
    if (longAndshort[i][1] > longAndshort[i][0]) {
      let temp = longAndshort[i][0];
      longAndshort[i][0] = longAndshort[i][1];
      longAndshort[i][1] = temp;
      angle_num_tmp = angle_num + 90;
    } else {
      angle_num_tmp = angle_num;
    }

    // 计算椭圆边界的内部位置
    const semiMajorAxis = longAndshort[i][0];
    const semiMinorAxis = longAndshort[i][1];
    const radius = Math.max(semiMajorAxis, semiMinorAxis) * 0.8; // 标签距离边界的距离
    const offsetAngle = Cesium.Math.toRadians(angle_num_tmp); // 椭圆的旋转角度

    // 计算标签位置
    const offsetX = radius * Math.cos(offsetAngle);
    const offsetY = radius * Math.sin(offsetAngle);

    // 渲染椭圆
    // viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(parseFloat(centerPoint.longitude), parseFloat(centerPoint.latitude), 0),
    //   ellipse: {
    //     semiMinorAxis: semiMinorAxis,
    //     semiMajorAxis: semiMajorAxis,
    //     material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorIntensity[i]).withAlpha(0.5)),
    //     outline: true,
    //     outlineColor: Cesium.Color.fromCssColorString(colorIntensity[i]),
    //     outlineWidth: 9,
    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     fill: true,
    //     clampToGround: true,
    //     rotation: Cesium.Math.toRadians(angle_num_tmp),
    //   },
    //   properties: {
    //     type: 'ovalCircle'  // 设置 type 属性
    //   },
    //   layername: "烈度圈",
    // });

    // 添加显示烈度的标签
    // viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(
    //       parseFloat(centerPoint.longitude) + offsetX / 111320,
    //       parseFloat(centerPoint.latitude) + offsetY / 110540,
    //       0
    //   ),
    //   label: {
    //     //最多画到6度
    //     text: "烈度 : " + intensityLabels[longintenArray[i] - 6] + " (" + intensityLabelsChinese[longintenArray[i] - 6] + "度)",
    //     font: '18px Sans-serif',
    //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //     outlineWidth: 2,
    //     verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //     horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //     show: true,
    //     eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
    //   },
    //   properties: {
    //     type: 'ovalCircle'  // 设置 type 属性
    //   },
    //   layername: "烈度圈",
    // });

    //计算烈度圈进行存储
    savecircles.push(computecircle(semiMajorAxis, semiMinorAxis, angle_num_tmp, longintenArray[i], lastsemiMajorAxis, lastsemiMinorAxis, last_angle_num_tmp,centerPoint))
    //内环
    lastsemiMajorAxis = semiMajorAxis;
    lastsemiMinorAxis = semiMinorAxis;
    last_angle_num_tmp = angle_num_tmp; // 旋转角度
  }
  saveIntensityCircle(savecircles).then(res => {
  })
}
// 绘制烈度圈
export function addOvalCircles(centerPoint) {

  // 计算椭圆长短轴------------------------------------------------------------------------------------------------------

  let lon = centerPoint.longitude;
  let lat = centerPoint.latitude;

  let longintenArray = []; //长轴烈度
  let shortintenArray = []; //短轴烈度
  let longAxisArray = []; //长轴数组
  let shortAxisArray = []; //短轴数组
  let longAndshort = []; //最终的长短轴数组，单位：千米
  var numi = 0;
  let R = 0 //震源到目标区域的距离，因为只需要震中的烈度，所以令其为零

  //汪素云-四川盆地
  let longAxis = 4.0293 + 1.3003 * centerPoint.magnitude - 3.6404 * Math.log10(R + 10); //长轴的烈度值
  let shortAxis = 2.3816 + 1.3003 * centerPoint.magnitude - 2.8573 * Math.log10(R + 5); //短轴的烈度值

  for (var i = Math.floor(longAxis); i >= 6; i--) {
    // console.log(i)
    if (longAxisArray.length >= 6) {
      break;
    }
    longintenArray.push(i); //长轴烈度

    R =
      // Math.exp(
      //     (2.795+1.600 * centerPoint.magnitude - i) /1.637
      // ) -28.497;
      Math.pow(10,
        (4.0293 + 1.3003 * centerPoint.magnitude - i) / 3.6404
      ) - 10;
    // console.log(R)
    longAxisArray.push(R);
  }
  for (var j = Math.floor(shortAxis); j >= 6; j--) {
    //计算烈度衰减圈的每一圈距离
    //限制最多显示的烈度圈数
    if (shortAxisArray.length >= 6) {
      break;
    }
    shortintenArray.push(j); //短轴烈度
    let R1 =
      // Math.exp(
      //     (1.331+1.218 * centerPoint.magnitude - j) /1.381
      // ) -  8.88;
      Math.pow(10,
        (2.3816 + 1.3003 * centerPoint.magnitude - j) / 2.8573
      ) - 5;
    shortAxisArray.push(R1);
  }

  for (let i = 0; i <= shortAxisArray.length - 1; i++) {
    if (longAxisArray[i] != null && shortAxisArray[i] != null) {
      (function (item, index) {
        var xy = new Array();
        xy[0] = longAxisArray[index] * 1000; //将符合条件每个长轴储存起来
        xy[1] = shortAxisArray[index] * 1000; //将符合条件每个短轴储存起来
        longAndshort[item] = xy;
      })(numi, i);
      numi++;
    }
  }

  // 计算角度------------------------------------------------------------------------------------------------------------
  var angle_list = [];
  for (var i = 0; i < fault_zone.length; i++) {
    var length_list = [];
    for (var line = 0; line < fault_zone[i].lonlat[0].length; line++) { //////算出每一个断裂带的坐标与当前震中坐标的距离（单位：度数）
      length_list.push(Math.sqrt(Math.pow(lon - parseFloat(fault_zone[i].lonlat[0][line][0]), 2) + Math.pow(lat - parseFloat(fault_zone[i].lonlat[0][line][1]), 2)))
    }
    length_list.sort(function (a, b) {
      return a - b
    });
    angle_list.push([i, length_list[0]])
  }
  angle_list.sort(function (a, b) {
    return a[1] - b[1]
  })
  var angle_num = fault_zone[angle_list[0][0]].angle;


  // 绘制烈度圈----------------------------------------------------------------------------------------------------------

  let colorIntensity = [
    "#990000",
    "#cc0000",
    "#ff0000",
    "#ff6600",
    "#FF9900",
    "#ffcc00",
  ];

  let intensityLabels = [
    "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "X", "XI", "XII"
  ];
  let intensityLabelsChinese = [
    "六", "七", "八", "九", "十", "十一", "十二"
  ];

  let angle_num_tmp;

  let lastsemiMajorAxis = 0;//震中
  let lastsemiMinorAxis = 0;
  let last_angle_num_tmp = 0; // 椭圆的旋转角度
  let savecircles = []  //存库信息

  for (let i = longAndshort.length - 1; i >= 0; i--) {
    if (longAndshort[i][1] > longAndshort[i][0]) {
      let temp = longAndshort[i][0];
      longAndshort[i][0] = longAndshort[i][1];
      longAndshort[i][1] = temp;
      angle_num_tmp = angle_num + 90;
    } else {
      angle_num_tmp = angle_num;
    }

    // 计算椭圆边界的内部位置
    const semiMajorAxis = longAndshort[i][0];
    const semiMinorAxis = longAndshort[i][1];
    const radius = Math.max(semiMajorAxis, semiMinorAxis) * 0.8; // 标签距离边界的距离
    const offsetAngle = Cesium.Math.toRadians(angle_num_tmp); // 椭圆的旋转角度

    // 计算标签位置
    const offsetX = radius * Math.cos(offsetAngle);
    const offsetY = radius * Math.sin(offsetAngle);

    // 渲染椭圆
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(parseFloat(centerPoint.longitude), parseFloat(centerPoint.latitude), 0),
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorIntensity[i]).withAlpha(0.5)),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(colorIntensity[i]),
        outlineWidth: 9,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        fill: true,
        clampToGround: true,
        rotation: Cesium.Math.toRadians(angle_num_tmp),
      },
      properties: {
        type: 'ovalCircle'  // 设置 type 属性
      },
      layername: "烈度圈",
    });

    // 添加显示烈度的标签
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        parseFloat(centerPoint.longitude) + offsetX / 111320,
        parseFloat(centerPoint.latitude) + offsetY / 110540,
        0
      ),
      label: {
        //最多画到6度
        text: "烈度 : " + intensityLabels[longintenArray[i] - 6] + " (" + intensityLabelsChinese[longintenArray[i] - 6] + "度)",
        font: '18px Sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        show: true,
        eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
      },
      properties: {
        type: 'ovalCircle'  // 设置 type 属性
      },
      layername: "烈度圈",
    });

    //计算烈度圈进行存储
    savecircles.push(computecircle(semiMajorAxis, semiMinorAxis, angle_num_tmp, longintenArray[i], lastsemiMajorAxis, lastsemiMinorAxis, last_angle_num_tmp,centerPoint))
    //内环
    lastsemiMajorAxis = semiMajorAxis;
    lastsemiMinorAxis = semiMinorAxis;
    last_angle_num_tmp = angle_num_tmp; // 旋转角度
  }
  // saveIntensityCircle(savecircles).then(res => {
  // })
}

function computecircle(majorAxis, minorAxis, rotationAngle, intensity, lastlong, lastshort, lastrotationAngle, centerPoint) {
  let IntensityCircle = {
    eqid: centerPoint.eqid,
    intensity: intensity,
    geom: '',
  };

  //外环
  // // 将角度转换为弧度
  const rotationAngleRad = rotationAngle * (Math.PI / 180);
  // 计算椭圆的四个顶点
  const outlinepoints = [];
  const angleStep = Math.PI / 2; // 90度的弧度
  // 长轴和短轴的四个方向
  const directions = [
    {angle: rotationAngleRad, type: 'major'},
    {angle: rotationAngleRad + Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad + Math.PI, type: 'major'},
    {angle: rotationAngleRad + 3 * Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad, type: 'major'}, //首位相连，围成环
  ];
  directions.forEach(direction => {
    const angle = direction.angle;
    const type = direction.type;
    let distance = type === 'major' ? majorAxis : minorAxis;

    // 计算经度和纬度的增量
    const deltaX = distance * Math.cos(angle) / 111319.9; // 经度增量，每度约等于111.32公里
    const deltaY = distance * Math.sin(angle) / 110574; // 纬度增量，每度约等于110.57公里
    // console.log(deltaX,deltaY)
    const vertexLongitude = parseFloat(centerPoint.longitude) + deltaX;
    const vertexLatitude = parseFloat(centerPoint.latitude) + deltaY;

    outlinepoints.push({
      longitude: vertexLongitude,
      latitude: vertexLatitude
    });
  });

  //内环
  // 计算椭圆的四个顶点
  const inlinepoints = [];
  // // 将角度转换为弧度
  const rotationAngleRad_in = lastrotationAngle * (Math.PI / 180);
  // 长轴和短轴的四个方向
  const directions_in = [
    {angle: rotationAngleRad_in, type: 'major'},
    {angle: rotationAngleRad_in + Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad_in + Math.PI, type: 'major'},
    {angle: rotationAngleRad_in + 3 * Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad_in, type: 'major'}, //首位相连，围成环
  ];
  if (lastlong != 0) {
    directions_in.forEach(direction => {
      const angle = direction.angle;
      const type = direction.type;
      let distance = type === 'major' ? lastlong : lastshort;
      // 计算经度和纬度的增量
      const deltaX = distance * Math.cos(angle) / 111319.9; // 经度增量，每度约等于111.32公里
      const deltaY = distance * Math.sin(angle) / 110574; // 纬度增量，每度约等于110.57公里
      // console.log(deltaX,deltaY)
      const vertexLongitude = parseFloat(centerPoint.longitude) + deltaX;
      const vertexLatitude = parseFloat(centerPoint.latitude) + deltaY;

      inlinepoints.push({
        longitude: vertexLongitude,
        latitude: vertexLatitude
      });
    });
  }

  IntensityCircle.geom = buildCurvePolygonString(outlinepoints, inlinepoints)
  return IntensityCircle;
}

function buildCurvePolygonString(outlinepoints,inlinepoints) {
  let curvePolygonString=''
  // 构建CIRCULARSTRING部分
  let outline = 'CIRCULARSTRING(';
  outlinepoints.forEach((point, index) => {
    outline += `${point.longitude} ${point.latitude}`;
    if (index < outlinepoints.length - 1) {
      outline += ', ';
    }
  });
  outline += ')';
  //最高烈度没有内环
  if(inlinepoints.length==0){
    // 组合成最终的CURVEPOLYGON字符串
    curvePolygonString = `CURVEPOLYGON(${outline})`;
  }
  else{
    let inline = 'CIRCULARSTRING(';
    inlinepoints.forEach((point, index) => {
      inline += `${point.longitude} ${point.latitude}`;
      if (index < inlinepoints.length - 1) {
        inline += ', ';
      }
    });
    inline += ')';
    // 组合成最终的CURVEPOLYGON字符串
    curvePolygonString = `CURVEPOLYGON(${outline}, ${inline})`;
  }
  return curvePolygonString;
}

// 时间戳转换
function timestampToTime(timestamp, format = "full") {
  let dateObj = new Date(timestamp);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  let hh = dateObj.getHours();
  let mm = dateObj.getMinutes();
  let ss = dateObj.getSeconds();

  // 去掉前导零
  month = month > 9 ? month : month.toString().replace(/^0/, "");
  day = day > 9 ? day : day.toString().replace(/^0/, "");
  hh = hh > 9 ? hh : "0" + hh;
  mm = mm > 9 ? mm : "0" + mm;
  ss = ss > 9 ? ss : "0" + ss;

  if (format === "date") {
    // 返回仅日期格式
    return `${year}年${month}月${day}日`;
  } else {
    // 返回完整的日期时间格式
    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
  }
}
