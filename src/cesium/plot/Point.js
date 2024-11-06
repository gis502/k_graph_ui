import * as Cesium from 'cesium'
import {getPlotInfos} from "@/api/system/plot.js";
import {plotType as plotTypeDialog} from "@/cesium/plot/plotType.js";
// let intervaladddonghua=null
export default class Point {
    constructor(viewer, store) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        this.store = store
        this.ifAnimate = false
    }

    // 画点的屏幕事件
    initPointHandlder(pointType, img, eqid, bool) {
        this.ifAnimate = bool
        return new Promise((resolve, reject) => {
            let viewer = this.viewer
            let that = this
            that.handler.setInputAction((event) => {
                let pointInfo = {
                    geom: null,
                    elevation: null,
                    icon: null,
                    plotType: null,
                    plotId: null,
                    earthquakeId: eqid
                }
                // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
                let ray = viewer.camera.getPickRay(event.position)
                let position = viewer.scene.globe.pick(ray, viewer.scene)
                // 1-2 坐标系转换
                let cartographic = Cesium.Cartographic.fromCartesian(position)//把笛卡尔坐标转换成制图实例，单位是弧度
                let geom = that.cartographicToGeoJSON(cartographic)
                let elevation = cartographic.height
                // 1-3 点开弹窗中就有经纬度，并且把经纬度图片等信息存入store中
                pointInfo.geom = geom
                pointInfo.elevation = elevation
                pointInfo.icon = img//that.matchIcon(pointType)
                pointInfo.plotType = pointType//that.refenceTypeList[pointType]
                pointInfo.plotId = that.guid()
                that.store.setPointInfo1(pointInfo)
                // 1-4 异步执行完成
                resolve('异步操作完成');
                // 1-5 移除此handler
                that.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        })
    }

    // 画点 //目前不用这个方法画点
    drawPoint(data, bool) {
        console.log("end")
        if (bool) {
            let colorFactor = 1.0;
            const intervalTime = 500; // 切换颜色的时间间隔
            const animationDuration = 10000; // 动画总持续时间（10秒）
            const intervalId = setInterval(() => {
                colorFactor = colorFactor === 1.0 ? 0.5 : 1.0; // 在颜色之间切换
            }, intervalTime);
            // 使用 setTimeout 在动画持续时间结束后清除 interval
            setTimeout(() => {
                clearInterval(intervalId); // 停止颜色切换
            }, animationDuration);
            let coords = data.geom.coordinates
            window.viewer.entities.add({
                id: data.plotId,
                position: Cesium.Cartesian3.fromDegrees(Number(coords[0]), Number(coords[1]), Number(data.elevation)),
                billboard: {
                    image: data.icon,
                    width: 50,
                    height: 50,
                    color: new Cesium.CallbackProperty(() => {
                        return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
                    }, false),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                properties: {
                    data
                }
            });
        } else {
            let id = data.plotId
            let longitude = Number(data.geom.coordinates[0])
            let latitude = Number(data.geom.coordinates[1])
            let height = Number(data.elevation)
            let img = data.icon
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
                    data: data
                }
            })
            // let coords = data.geom.coordinates
            // window.viewer.entities.add({
            //   id: data.plotId ,
            //   position: Cesium.Cartesian3.fromDegrees(Number(coords[0]), Number(coords[1]), Number(data.elevation)),
            //   billboard: {
            //     image: data.icon,
            //     width: 50, // 图片宽度,单位px
            //     height: 50, // 图片高度，单位px
            //     eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            //     color: Cesium.Color.WHITE.withAlpha(1), // 固定颜色
            //     scale: 0.8, // 缩放比例
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
            //     depthTest: false, // 禁止深度测试
            //     disableDepthTestDistance: Number.POSITIVE_INFINITY // 不进行深度测试
            //   },
            //   properties: {
            //     data
            //   }
            // });
        }

    }

    drawPoints(points, bool,stoptime) {
        // 判断 points 是否为数组，不是数组则将它包装为数组
        if (!Array.isArray(points)) {
            let data = {
                longitude: Number(points.geom.coordinates[0]),
                latitude: Number(points.geom.coordinates[1]),
                ...points
            }
            points = data
            points = [points];
        }
        // 是否开新的聚合点图层
        let dataSource = null
        if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'pointData')) {
            dataSource = window.pointDataSource
        }
        else {
            dataSource = new Cesium.CustomDataSource("pointData");
            const dataSourcePromise = window.viewer.dataSources.add(dataSource)
            dataSourcePromise.then(function (dataSource) {
                const pixelRange = 10;
                const minimumClusterSize = 3;
                const enabled = true;
                dataSource.clustering.enabled = enabled; //是否聚合
                dataSource.clustering.pixelRange = pixelRange;
                dataSource.clustering.minimumClusterSize = minimumClusterSize;
                const pinBuilder = new Cesium.PinBuilder();
                const pin1000 = pinBuilder
                    .fromText("1000+", Cesium.Color.RED, 48)
                    .toDataURL();
                const pin500 = pinBuilder
                    .fromText("100+", Cesium.Color.RED, 48)
                    .toDataURL();
                const pin100 = pinBuilder
                    .fromText("100+", Cesium.Color.RED, 48)
                    .toDataURL();
                const pin50 = pinBuilder
                    .fromText("50+", Cesium.Color.RED, 48)
                    .toDataURL();
                const pin40 = pinBuilder
                    .fromText("40+", Cesium.Color.ORANGE, 48)
                    .toDataURL();
                const pin30 = pinBuilder
                    .fromText("30+", Cesium.Color.YELLOW, 48)
                    .toDataURL();
                const pin20 = pinBuilder
                    .fromText("20+", Cesium.Color.GREEN, 48)
                    .toDataURL();
                const pin10 = pinBuilder
                    .fromText("10+", Cesium.Color.BLUE, 48)
                    .toDataURL();
                const singleDigitPins = new Array(8);
                for (let i = 0; i < singleDigitPins.length; ++i) {
                    singleDigitPins[i] = pinBuilder
                        .fromText(`${i + 2}`, Cesium.Color.VIOLET, 48)
                        .toDataURL();
                }
                let removeListener

                function customStyle() {
                    if (Cesium.defined(removeListener)) {
                        removeListener && removeListener();
                        let removeListener = undefined;
                    } else {
                        let removeListener = dataSource.clustering.clusterEvent.addEventListener(
                            function (clusteredEntities, cluster) {
                                cluster.label.show = false;
                                cluster.billboard.show = true;
                                cluster.billboard.id = cluster.label.id;
                                cluster.billboard.verticalOrigin =
                                    Cesium.VerticalOrigin.BOTTOM;

                                // 设置 Billboard 高度引用地形
                                cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

                                // 禁用深度测试，使 Billboard 不会被地形遮挡
                                cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;

                                if (clusteredEntities.length >= 1000) {
                                    cluster.billboard.image = pin1000;
                                } else if (clusteredEntities.length >= 500) {
                                    cluster.billboard.image = pin500;
                                } else if (clusteredEntities.length >= 100) {
                                    cluster.billboard.image = pin100;
                                } else if (clusteredEntities.length >= 50) {
                                    cluster.billboard.image = pin50;
                                } else if (clusteredEntities.length >= 40) {
                                    cluster.billboard.image = pin40;
                                } else if (clusteredEntities.length >= 30) {
                                    cluster.billboard.image = pin30;
                                } else if (clusteredEntities.length >= 20) {
                                    cluster.billboard.image = pin20;
                                } else if (clusteredEntities.length >= 10) {
                                    cluster.billboard.image = pin10;
                                } else {
                                    cluster.billboard.image =
                                        singleDigitPins[clusteredEntities.length - 2];
                                }
                            }
                        );
                    }

                    const pixelRange = dataSource.clustering.pixelRange;
                    dataSource.clustering.pixelRange = 0;
                    dataSource.clustering.pixelRange = pixelRange;
                }

                customStyle();
            })
            window.pointDataSource = dataSource;
        }

// ------------------------------------------------------
        let labeldataSource = null
        if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'label')) {
            labeldataSource = window.labeldataSource
        }
        else{
            labeldataSource = new Cesium.CustomDataSource("label");
            const labeldataSourcePromise = window.viewer.dataSources.add(labeldataSource)
            labeldataSourcePromise.then(function (labeldataSource) {
                labeldataSource.clustering.enabled = true; // 开启聚合
                labeldataSource.clustering.pixelRange = 1; // 聚合像素范围
                labeldataSource.clustering.minimumClusterSize = 1; // 最小聚合大小

                let removeListener;

                function customStyle() {
                    if (Cesium.defined(removeListener)) {
                        removeListener();
                        removeListener = undefined;
                    } else {
                        removeListener = labeldataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                            // 显示标签
                            cluster.label.show = true;
                            cluster.label.text = ''; // 初始化标签文本
                            clusteredEntities.forEach((entity, index) => {
                                console.log(entity, "entity");
                                // 假设每个实体都有一个名为'labeltext'的属性，包含要显示的信息
                                cluster.label.text += entity.labeltext.toString();

                                // 如果不是最后一个实体，则添加换行符
                                if (index < clusteredEntities.length - 1) {
                                    cluster.label.text += '\n';
                                }
                            });


                            // 设置标签的其他样式属性
                            // 设置标签的其他样式属性
                            cluster.label.font = '18px Helvetica';
                            cluster.label.fillColor = Cesium.Color.BLACK; // 字体颜色设置为黑色
                            cluster.label.outlineColor = Cesium.Color.BLACK; // 外框颜色设置为白色
                            cluster.label.outlineWidth = 2; // 外框宽度
                            cluster.label.pixelOffset = new Cesium.Cartesian2(0, 0); // 偏移量
                            cluster.label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM; // 垂直原点

                            // 设置标签的背景颜色
                            cluster.label.backgroundColor = Cesium.Color.WHITE; // 背景颜色设置为白色
                            cluster.label.showBackground = true; // 显示背景
                            cluster.label.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                        });
                    }
                }

                customStyle();
            });
            window.labeldataSource = labeldataSource; // 将数据源存储在window对象下
        }





        if (bool) {

            points.forEach(data => {
                var plotId = data.plotId
                var plotType = data.plotType
                let colorFactor = 1.0;
                const intervalTime1 = 200;
                const animationDuration = stoptime;
                const intervalId1 = setInterval(() => {
                    colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
                }, intervalTime1);

                //标签
                getPlotInfos({plotId, plotType}).then(res => {
                    console.log("点击获取", res)
                    console.log("res.plotInfo", res.plotInfo)
                    // console.log("点击获取",res.ployInfo.latitude)
                    // var labeltext = ""
                    var labeltext =plotType
                    // console.log()
                    if (res.plotTypeInfo && res.plotTypeInfo.location) {
                        labeltext = res.plotTypeInfo.location + labeltext
                    }

                    //人员伤亡类文字：新增xxx人员xx人
                    if(plotType==="失踪人员"||plotType==="轻伤人员"||plotType==="重伤人员"||plotType==="危重伤人员"||plotType==="死亡人员"){
                        if(res.plotTypeInfo.newCount){
                            labeltext =labeltext+res.plotTypeInfo.newCount +"人"
                        }
                    }
                    //救援队伍 单位,人数人
                    if(plotType==="已出发队伍"||plotType==="正在参与队伍"||plotType==="待命队伍"){
                        if(res.plotTypeInfo.teamName){
                            labeltext =labeltext+":"+res.plotTypeInfo.teamName
                        }
                        if(res.plotTypeInfo.personnelCount){
                            labeltext =labeltext+res.plotTypeInfo.personnelCount +"人"
                        }
                    }

                    // 是否出现人员伤亡，是否处置（次生灾害）
                    //
                    if(res.plotTypeInfo&&res.plotTypeInfo.casualties) {
                        labeltext =labeltext+res.plotTypeInfo.casualties+"人员伤亡"
                    }
                    if(res.plotTypeInfo&&res.plotTypeInfo.initialDisposalPhase) {
                        labeltext =labeltext+","+res.plotTypeInfo.initialDisposalPhase
                    }



                    if (!viewer.entities.getById(data.plotId)) {

                        var entity = viewer.entities.add({
                            id: data.plotId,
                            plottype: data.plotType,
                            layer: "标绘点",
                            position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
                            labeltext: labeltext,
                            billboard: {
                                image: data.icon,
                                width: 50, // 图片宽度,单位px
                                height: 50, // 图片高度，单位px
                                eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                                color: new Cesium.CallbackProperty(() => {
                                    return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
                                }, false),
                                scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                                depthTest: false, // 禁止深度测试
                                disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
                            },
                            properties: {
                                data
                            }
                        });
                        viewer.scene.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(

                                Number(data.longitude),
                                Number(data.latitude),
                                20000),
                            orientation: {
                                // 指向
                                heading: 6.283185307179581,
                                // 视角
                                pitch: -1.5688168484696687,
                                roll: 0.0
                            },
                            duration : 2 // 飞行动画持续时间（秒）
                        });

                        labeldataSource.entities.add(entity)
                        // -----------------------------------------
                        // 设置动画逻辑

                        // 恢复标会点正常的清晰度
                        setTimeout(() => {
                            clearInterval(intervalId1);
                            colorFactor = 1.0;
                            viewer.entities.remove(entity) //清除动画
                            // if(plotType==="失踪人员"||plotType==="轻伤人员"||plotType==="重伤人员"||plotType==="危重伤人员"||plotType==="死亡人员"||plotType==="已出发队伍"||plotType==="正在参与队伍"||plotType==="待命队伍"){
                            // }
                            // else{
                                labeldataSource.entities.remove(entity);  //清除标签
                            // }
                            // }
                            if (!dataSource.entities.getById(data.plotId)) {
                                // 实体不存在，可以添加
                                dataSource.entities.add(entity)//加到点聚合图层
                            }

                        }, animationDuration);


                    }



     })

            });

        } else {
            points.forEach(data => {
                dataSource.entities.add({
                    id: data.plotId,
                    plottype: data.plotType,
                    layer: "标绘点",
                    position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
                    billboard: {
                        image: data.icon,
                        width: 50,//图片宽度,单位px
                        height: 50,//图片高度，单位px // 会影响point大小，离谱
                        eyeOffset: new Cesium.Cartesian3(0, 0, 0),//与坐标位置的偏移距离
                        color: Cesium.Color.WHITE.withAlpha(1),//颜色
                        scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                        depthTest: false,//禁止深度测试但是没有下面那句有用
                        disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                    },
                    properties: {
                        data
                    }
                })
            })
        }
    }

    deletePoint(point) {
        viewer.entities.remove(point)
    }

    //匹配图标
    matchIcon(type) {
        let list = matchMark() // 封装的marchMark
        return list[type]
    }

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    cartographicToGeoJSON(cartographic) {
        // 将 Cesium.Cartographic 弧度转换为 GeoJSON 所需的度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度

        // 返回 GeoJSON 格式的 Point 对象
        return {
            "type": "Point",
            "coordinates": [lon, lat]
        };
    }
}
