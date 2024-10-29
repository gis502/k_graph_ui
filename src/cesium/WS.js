import * as Cesium from 'cesium'
import  {StraightArrow, AttackArrow, PincerArrow,} from "@/cesium/drawArrow/arrowClass.js";
import arrow from "@/cesium/drawArrow/drawPlot.js";

let webSocket
let ip = "ws://localhost:8080/ws/"

export function initWebSocket(eqid) {
    const wsuri = ip + eqid;
    if (typeof (WebSocket) == "undefined") {
        console.log("您的浏览器不支持WebSocket");
    } else {
        webSocket = new WebSocket(wsuri);
        webSocket.onmessage = websocketonmessage;
        webSocket.onopen = websocketonopen;
        webSocket.onerror = websocketonerror;
        webSocket.onclose = websocketclose;
        webSocket.eqid = eqid
    }
    return webSocket
}

//连接建立之后执行send方法发送数据
function websocketonopen() {
    // let actions = {"test": "我已在线"};
    // webSocket.send(JSON.stringify(actions));
}

//连接建立失败重连
function websocketonerror() {
    initWebSocket();
}

//关闭
function websocketclose(e) {
    console.log('断开连接', e);
}

function websocketonmessage(e) {
    try {
        console.log(JSON.parse(e.data))
        let markType = JSON.parse(e.data).type
        let markOperate = JSON.parse(e.data).operate // 标绘的（add、delete）
        if (markOperate === "add") {
            if (this.eqid === JSON.parse(e.data).data.plot.earthquakeId) {
                let markData = JSON.parse(e.data).data
                wsAdd(markType, markData)
            }
        } else if (markOperate === "delete") {
            let id = JSON.parse(e.data).id
            console.log(id, 567)
            if (markType === "point") {
                // 其实只有这里有用
                console.log(5629)
                let polygonRemoved = window.viewer.entities.removeById(id);
                let pointDataRemoved = window.viewer.dataSources.getByName('pointData')[0].entities.removeById(id);

                console.log(polygonRemoved, pointDataRemoved);

            } else if (markType === "polyline") {
                let polyline = window.viewer.entities.getById(id)
                let polylinePosition = polyline.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
                polylinePosition.pointPosition.forEach((item, index) => {
                    window.viewer.entities.remove(item)
                })
                window.viewer.entities.remove(polyline)
            } else if (markType === "polygon") {
                let polygon = window.viewer.entities.getById(id)
                let polygonPosition = polygon.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
                polygonPosition.linePoint.forEach((item, index) => {
                    window.viewer.entities.remove(item)
                })
                window.viewer.entities.remove(polygon)
            } else if(markType === "arrow"){
                console.log("arrow------------------")
                arrow.clearById(id)
                let polygonRemoved = window.viewer.entities.removeById(id);
                let pointDataRemoved = window.viewer.dataSources.getByName('pointData')[0].entities.removeById(id);

                console.log(polygonRemoved, pointDataRemoved);
            }
        }
    } catch (err) {
        console.log(err, 'ws中catch到错误');
    }
}

function wsAdd(type, data) {
    if (type === "point") {
        let id = data.plot.plotId
        let longitude = Number(data.plot.geom.coordinates[0])
        let latitude = Number(data.plot.geom.coordinates[1])
        let height = Number(data.plot.elevation)
        let img = data.plot.icon

        window.viewer.dataSources.getByName('pointData')[0].entities.add({
            id: id,
            layer: "标绘点",
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
            billboard: {
                image: img,
                width: 50,//图片宽度,单位px
                height: 50,//图片高度，单位px // 会影响data大小，离谱
                eyeOffset: new Cesium.Cartesian3(0, 0, 0),//与坐标位置的偏移距离
                color: Cesium.Color.WHITE.withAlpha(1),//颜色
                scale: 0.8,//缩放比例
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                depthTest: false,//禁止深度测试但是没有下面那句有用
                disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
            },
            properties: {
                data: data.plot
            }
        })
        // window.viewer.entities.add({
        //     id: id,
        //     position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        //     billboard: {
        //         image: img,
        //         width: 50,//图片宽度,单位px
        //         height: 50,//图片高度，单位px // 会影响data大小，离谱
        //         eyeOffset: new Cesium.Cartesian3(0, 0, 0),//与坐标位置的偏移距离
        //         color: Cesium.Color.WHITE.withAlpha(1),//颜色
        //         scale: 0.8,//缩放比例
        //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
        //         depthTest: false,//禁止深度测试但是没有下面那句有用
        //         disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
        //     },
        //     properties: {
        //         data:data.plot
        //     }
        // })
    } else if (type === "polyline") {
        // 绘制所需的信息
        let points = data.plot.geom.coordinates
        let plotId = data.plot.plotId
        let elevation = data.plot.elevation
        let type = data.plot.plotType
        let img = data.plot.icon
        let plotType = data.plot.plotType
        // 构成线的所有实体点
        let pointLinePoints = []
        for (let i = 0; i < points.length; i++) {
            let p = window.viewer.entities.add({
                show: false,
                position: new Cesium.Cartesian3(points[i][0], points[i][1], elevation),
                id: plotId + 'point' + (i + 1),
                point: {
                    pixelSize: 1,
                    color: Cesium.Color.RED,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.DARKRED,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                    depthTest: false,//禁止深度测试但是没有下面那句有用
                    disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                },
            });
            pointLinePoints.push(p)
        }
        let material = getMaterial(type, img)
        let linePostion = []
        let linedata = [{
            plotId: plotId,
            plotType: plotType,
            drawtype: "polyline",
        }]
        points.forEach(e => {
            // 线的positions需要数组里的点都是Cartesian3类型
            linePostion.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
        })
        window.viewer.entities.add({
            id: plotId, //+ 'polyline',
            polyline: {
                positions: linePostion,
                width: 5,
                material: material,
                // material: Cesium.Color.YELLOW,
                depthFailMaterial: Cesium.Color.YELLOW,
                clampToGround: true,
            },
            properties: {
                pointPosition: pointLinePoints,
                data: linedata
            }
        })
    } else if (type === "polygon") {
        let polygonArr = [data.plot]
        // 1-1 根据面的Plotid记录有多少个面
        let onlyPlotid = distinguishPolygonId(polygonArr)
        // console.log("onlyPlotid",onlyPlotid)
        // 1-2根据Plotid来画面
        onlyPlotid.forEach(onlyPlotidItem => {
            // 1-3 把数据库同一Plotid的点数据放入此数组
            let polygon = []
            polygonArr.forEach(polygonElement => {
                if (polygonElement.plotId === onlyPlotidItem) {
                    polygon.push(polygonElement)
                }
            })
            // 1-4 pointLinePoints用来存构成面的点实体
            let pointLinePoints = []
            let coords = polygon[0].geom.coordinates[0]
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
                // === 检查并删除已经存在的多边形实体 ===
                let polygonId = onlyPlotidItem;
                if (window.viewer.entities.getById(polygonId)) {
                    window.viewer.entities.removeById(polygonId);  // 删除已存在的多边形实体
                }
                window.viewer.entities.add({
                    id: onlyPlotidItem,
                    polygon: {
                        hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(pointLinePoints), false),
                        material: polygon[0].icon,
                        // stRotation: Cesium.Math.toRadians(polygon[0].angle),
                        clampToGround: true,
                    },
                    properties: {
                        // pointPosition: this.positions,
                        // linePoint: this.polygonPointEntity,
                        data: polygon //弹出框
                    }
                });
            }
        })
    }else if(type === "arrow"){
        console.log(45678)

        let positions = []
        let arrowData = data.plot
        arrowData.objId = arrowData.plotId

        for (let i = 0; i < arrowData.geom.coordinates.length; i++) {
            let cart3 = Cesium.Cartesian3.fromDegrees(arrowData.geom.coordinates[i][0], arrowData.geom.coordinates[i][1]);
            positions.push(cart3);
        }
        if(data.plot.plotType==="攻击箭头"){
            let arrow = AttackArrow
            arrow.prototype.showArrowOnMap(positions,arrowData)
        }else if(data.plot.plotType==="钳击箭头"){
            let arrow = PincerArrow
            arrow.prototype.showArrowOnMap(positions,arrowData)
        }else if(data.plot.plotType==="直线箭头"){
            let arrow = StraightArrow
            arrow.prototype.showArrowOnMap(positions,arrowData)
        }

    }
}

// 选择当前线的material
function getMaterial(type, img) {
    if (type === "量算") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "地裂缝" || type === "可用供水管网" || type === "不可用供水管网") {
        let PICTURELINE = new Cesium.ImageMaterialProperty({
            image: img,
            repeat: new Cesium.Cartesian2(3, 1),
        })
        return PICTURELINE
    }
    if (type === "可通行公路" || type === "限制通行公路" || type === "不可通行公路") {
        let color = null
        if (type === "可通行公路") {
            color = Cesium.Color.fromBytes(158, 202, 181)
        } else if (type === "限制通行公路") {
            color = Cesium.Color.fromBytes(206, 184, 157)
        } else {
            color = Cesium.Color.fromBytes(199, 151, 149)
        }
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: color,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "可通行铁路" || type === "不可通行铁路") {
        let gapColor
        if (type === "可通行铁路") {
            gapColor = Cesium.Color.BLACK
        } else {
            gapColor = Cesium.Color.RED
        }
        let DASHLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.WHITE,
            gapColor: gapColor,
            dashLength: 100
        })
        return DASHLINE
    }
    if (type === "可用输电线路" || type === "不可用输电线路") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "可用输气管线" || type === "不可用输气管线") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
}

function distinguishPolygonId(polygonArr) {
    let polygonIdArr = []
    polygonArr.forEach(element => {
        if (!polygonIdArr.includes(element.plotId)) {
            polygonIdArr.push(element.plotId)
        }
    })
    // console.log("数据库",polygonIdArr)
    return polygonIdArr
}
