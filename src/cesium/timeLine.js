import * as Cesium from 'cesium'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import plotCompute from "@/cesium/plot/plotCompute.js";

let timeLine = {
    MiniMapAddMakerPoint(smallViewer, centerPoint) {
        console.log(smallViewer.entities, "smallViewer.entities")
        smallViewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
                parseFloat(centerPoint.longitude),
                parseFloat(centerPoint.latitude),
                parseFloat(0)
            ),
            billboard: {
                image: centerstar,
                width: 40,
                height: 40,
                eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                scale: 0.8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                depthTest: false,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                color: Cesium.Color.WHITE.withAlpha(1),//颜色
            },
            label: {
                text: centerPoint.earthquakeName,
                show: true,
                font: '14px sans-serif',
                fillColor: Cesium.Color.RED,        //字体颜色
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -16),
            },
            id: centerPoint.plotId,
            plottype: centerPoint.plotType,
            layer: "震中"
        })
    },
    fly(lng, lat, height, time) {
        return new Promise((resolve, reject) => {
            window.viewer.scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    parseFloat(lng),
                    parseFloat(lat),
                    height),
                orientation: {
                    // 指向
                    heading: 6.283185307179581,
                    // 视角
                    pitch: -1.5688168484696687,
                    roll: 0.0
                },
                duration: time, // 飞行动画持续时间（秒）
                complete: resolve
            });
        });
    },
    addMakerPoint(item, type) {
        let img = null
        let labeltext = null
        if (item.plotType == "震中") {
            img = centerstar
            labeltext = item.earthquakeName
        } else {
            img = import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime()
        }


        if (window.viewer && window.viewer.entities) {
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    // start: Cesium.JulianDate.fromDate(new Date("2022-06-01T15:57:30")),
                    // stop: Cesium.JulianDate.fromDate(new Date("Sat Jun 11 2022 17:00:08 GMT+0800 (China Standard Time)"))
                    start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                })]),
                position: Cesium.Cartesian3.fromDegrees(
                    parseFloat(item.longitude),
                    parseFloat(item.latitude),
                    parseFloat(item.elevation || 0)
                ),
                billboard: {
                    image: img,
                    width: 40,
                    height: 40,
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    depthTest: false,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                    clampToGround: true,
                },
                label: {
                    text: labeltext,
                    show: true,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.RED,        //字体颜色
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -16),
                },
                id: item.plotId,
                plottype: item.plotType,
                layer: type
            })
        }

    },
    addPolyline(item, type) {
        if (window.viewer && window.viewer.entities) {
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            let material = cesiumPlot.getMaterial(item.plotType, import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime())

            let positionsArr = []
            item.geom.coordinates.forEach(e => {
                positionsArr.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
            })

            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                })]),
                id: item.plotId,
                plottype: item.plotType,
                layer: type,
                polyline: {
                    positions: positionsArr,
                    width: 5,
                    material: material,
                    // material: Cesium.Color.YELLOW,
                    // depthFailMaterial: Cesium.Color.YELLOW,
                    clampToGround: true,
                },
                properties: {
                    data: item,
                }
            })
        }
    },
    addPolygon(item, type) {
        console.log(item,"item")
        if (window.viewer && window.viewer.entities) {
            if (item.plotType === "未搜索区域" || item.plotType === "已搜索区域" || item.plotType === "已营救区域" || item.plotType === "正在营救区域" || item.plotType === "未营救区域") {
                // 1-1 经纬度
                let pointLinePoints = []
                let coords = item.geom.coordinates[0]
                // console.log("coords",coords)
                for (let i = 0; i < coords.length; i++) {
                    let polygonCoords = coords[i]
                    // 转换为Cartesian3坐标
                    let cartographic = Cesium.Cartographic.fromDegrees(
                        parseFloat(polygonCoords[0]),
                        parseFloat(polygonCoords[1]),
                        parseFloat(0)
                    );
                    let cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                    pointLinePoints.push(cartesian);
                    if (window.viewer.entities.getById(item.plotId)) {
                        console.log(window.viewer.entities.getById(item.plotId),"window.viewer.entities.getById(item.plotId)")
                        window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
                    }
                    window.viewer.entities.add({
                        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                            start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                            stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                        })]),
                        id: item.plotId,
                        layer: type,
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(pointLinePoints), false),
                            material: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime(),
                            // stRotation: Cesium.Math.toRadians(polygon[0].angle),
                            clampToGround: true,
                        },
                        properties: {
                            // pointPosition: this.positions,
                            // linePoint: this.polygonPointEntity,
                            data: item //弹出框
                        }
                    });
                }
            }
            else {
                let pointLinePoints = []
                let coords = item.geom.coordinates[0]

                for (let i = 0; i < coords.length; i++) {
                    let polygonCoords = coords[i]
                    // 转换为Cartesian3坐标
                    let cartographic = Cesium.Cartographic.fromDegrees(
                        parseFloat(polygonCoords[0]),
                        parseFloat(polygonCoords[1]),
                        parseFloat(0)
                    );
                    let cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                    pointLinePoints.push(cartesian);
                }
                if (window.viewer.entities.getById(item.plotId)) {
                    console.log(window.viewer.entities.getById(item.plotId),"window.viewer.entities.getById(item.plotId)")
                    window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
                }
                window.viewer.entities.add({
                    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                        start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                        stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                    })]),
                    id: item.plotId,
                    layer: type,
                    polygon: {
                        hierarchy: new Cesium.PolygonHierarchy(pointLinePoints),
                        material: new Cesium.ImageMaterialProperty({
                            color: Cesium.Color.WHITE.withAlpha(0.4),
                        }),
                        clampToGround: true,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                        depthTest: false,//禁止深度测试但是没有下面那句有用
                        disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                    },
                    properties: {
                        // pointPosition: this.positions,
                        // linePoint: this.polygonPointEntity,
                        data: item //弹出框
                    }
                });

                const width = 9000;  // 矩形宽度
                const height = 9000; // 矩形高度
                // 获取大多边形的中心点
                const center = plotCompute.getPolygonCenter(pointLinePoints);
                // 生成小矩形的四个角点
                const smallRectanglePositions = plotCompute.createContainedRectangle(center, width, height, item.angle, pointLinePoints);
                const diameter = Cesium.Cartesian3.distance(smallRectanglePositions[0], smallRectanglePositions[2]);

                if (window.viewer.entities.getById(item.plotId + "_polygon")) {
                    window.viewer.entities.removeById(item.plotId + "_polygon"); // 先删除现有实体
                }
                // 使用对角线作为直径绘制圆形
                window.viewer.entities.add({
                    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                        start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                        stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                    })]),
                    id: item.plotId + "_polygon",
                    position: center, // 圆心为大多边形的中心点
                    layer:'中心图标',
                    ellipse: {
                        semiMajorAxis: diameter / 2, // 对角线的一半作为半径
                        semiMinorAxis: diameter / 2, // 保证是一个正圆
                        material: new Cesium.ImageMaterialProperty({
                            image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime(),
                            repeat: new Cesium.Cartesian2(1.02, 1.0684), // 控制图片的缩放
                            color: Cesium.Color.WHITE.withAlpha(1.0),
                            scale: 0.5 // 调整图片缩放比例
                        }),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                        depthTest: false,//禁止深度测试但是没有下面那句有用
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
                        stRotation: Cesium.Math.toRadians(item.angle), // 图片旋转
                        clampToGround: true
                    },
                    properties: {
                        // pointPosition: this.positions,
                        // linePoint: this.polygonPointEntity,
                        data: item //弹出框
                    }
                });
            }
        }
    },
    addArrow(){},

}
export default timeLine;
