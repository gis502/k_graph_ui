import * as Cesium from 'cesium'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import plotCompute from "@/cesium/plot/plotCompute.js";
import {xp} from "@/cesium/drawArrow/algorithm.js";
import {getPlotInfos} from "@/api/system/plot.js";

let timeLine = {
    MiniMapAddMakerPoint(smallViewer, centerPoint) {
        // console.log(smallViewer.entities, "smallViewer.entities")
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
    //--------渲染-------------
    addCenterPoint(item) {
        //点的属性 震中点统用一一个方法
        let img = centerstar
        let labeltext = item.earthquakeName
        if (window.viewer && window.viewer.entities) {
            window.viewer.entities.add({
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
                layer: "震中",
                properties: {...item}
            })
        }
    },
    //图层
    wrapText(context, text, width) {
        var words = text.split(' ');
        var line = '';
        var lines = [];

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > width && line !== '') {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        return lines;
    },
    addDataSourceLayer(datasourcename) {
        if (datasourcename === "pointData") {
            let pointDataSource = null
            if (window.viewer && window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'pointData')) {
                pointDataSource = window.pointDataSource
            } else {
                if (window.viewer && window.viewer.dataSources) {
                    pointDataSource = new Cesium.CustomDataSource("pointData");
                    let dataSourcePromise = window.viewer.dataSources.add(pointDataSource)
                    dataSourcePromise.then(function (pointDataSource) {
                        let pixelRange = 10;
                        let minimumClusterSize = 3;
                        let enabled = true;
                        pointDataSource.clustering.enabled = enabled; //是否聚合
                        pointDataSource.clustering.pixelRange = pixelRange;
                        pointDataSource.clustering.minimumClusterSize = minimumClusterSize;
                        let pinBuilder = new Cesium.PinBuilder();
                        let pin1000 = pinBuilder
                            .fromText("1000+", Cesium.Color.RED, 48)
                            .toDataURL();
                        let pin500 = pinBuilder
                            .fromText("100+", Cesium.Color.RED, 48)
                            .toDataURL();
                        let pin100 = pinBuilder
                            .fromText("100+", Cesium.Color.RED, 48)
                            .toDataURL();
                        let pin50 = pinBuilder
                            .fromText("50+", Cesium.Color.RED, 48)
                            .toDataURL();
                        let pin40 = pinBuilder
                            .fromText("40+", Cesium.Color.ORANGE, 48)
                            .toDataURL();
                        let pin30 = pinBuilder
                            .fromText("30+", Cesium.Color.YELLOW, 48)
                            .toDataURL();
                        let pin20 = pinBuilder
                            .fromText("20+", Cesium.Color.GREEN, 48)
                            .toDataURL();
                        let pin10 = pinBuilder
                            .fromText("10+", Cesium.Color.BLUE, 48)
                            .toDataURL();
                        // let singleDigitPins = new Array(8);
                        let singleDigitPins = new Array(20);
                        for (let i = 0; i < singleDigitPins.length; ++i) {
                            singleDigitPins[i] = pinBuilder
                                .fromText(`${Math.floor(i)}`, Cesium.Color.VIOLET, 48)
                                .toDataURL();
                        }
                        let removeListener

                        function customStyle() {
                            if (Cesium.defined(removeListener)) {
                                removeListener && removeListener();
                                removeListener = undefined;
                            } else {
                                removeListener = pointDataSource.clustering.clusterEvent.addEventListener(
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

                                        if (clusteredEntities.length >= 2000) {
                                            cluster.billboard.image = pin1000;
                                        } else if (clusteredEntities.length >= 1000) {
                                            cluster.billboard.image = pin500;
                                        } else if (clusteredEntities.length >= 200) {
                                            cluster.billboard.image = pin100;
                                        } else if (clusteredEntities.length >= 100) {
                                            cluster.billboard.image = pin50;
                                        } else if (clusteredEntities.length >= 80) {
                                            cluster.billboard.image = pin40;
                                        } else if (clusteredEntities.length >= 60) {
                                            cluster.billboard.image = pin30;
                                        } else if (clusteredEntities.length >= 40) {
                                            cluster.billboard.image = pin20;
                                        } else if (clusteredEntities.length >= 20) {
                                            cluster.billboard.image = pin10;
                                        } else {
                                            cluster.billboard.image =
                                                singleDigitPins[clusteredEntities.length];
                                        }
                                    }
                                    // }
                                );
                            }

                            let pixelRange = pointDataSource.clustering.pixelRange;
                            pointDataSource.clustering.pixelRange = 0;
                            pointDataSource.clustering.pixelRange = pixelRange;
                        }

                        customStyle();
                    })
                    window.pointDataSource = pointDataSource;
                }
            }
            return pointDataSource
        }
        else if (datasourcename === "label") {
            let labeldataSource = null
            if (window.viewer && window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'label')) {
                labeldataSource = window.labeldataSource
            } else {
                if (window.viewer && window.viewer.dataSources) {
                    labeldataSource = new Cesium.CustomDataSource("label");
                    let dataSourcePromise = window.viewer.dataSources.add(labeldataSource)
                    dataSourcePromise.then(function (labeldataSource) {
                        labeldataSource.clustering.enabled = true; // 开启聚合
                        labeldataSource.clustering.pixelRange = 100; // 聚合像素范围
                        labeldataSource.clustering.minimumClusterSize = 1; // 最小聚合大小


                        let removeListener

                        function customStyle() {
                            if (Cesium.defined(removeListener)) {
                                removeListener && removeListener();
                                let removeListener = undefined;
                            } else {
                                let removeListener = labeldataSource.clustering.clusterEvent.addEventListener(
                                    function (clusteredEntities, cluster) {
                                        cluster.label.show = false;
                                        // 创建 Canvas 标签
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');

                                        // 设置字体和布局
                                        const titleFontSize = 19; // 标题字体大小
                                        const contentFontSize = 19; // 内容字体大小
                                        const rowHeight = 30; // 每行高度调整为 30
                                        const padding = 40; // 内边距
                                        const margin = 10; // 外边距
                                        const headerHeight = 50; // 表格标题高度调整为 50
                                        const extraHeight = 50; // 额外增加的背景高度

                                        // 动态计算标题宽度（确保标题适配背景）
                                        const title = '出队情况，伤亡人员统计（标绘）';
                                        context.font = `bold ${titleFontSize}px Arial`;
                                        const titleWidth = context.measureText(title).width + 2 * padding; // 标题宽度

                                        // 红色标绘的文字和操场椭圆
                                        const markText = '应急';
                                        const markFontSize = 22; // 红色文字字体大小
                                        context.font = `bold ${markFontSize}px Arial`;
                                        const markTextWidth = context.measureText(markText).width; // 标绘文字宽度
                                        const markPadding = 10; // 跑道椭圆文字左右的间距
                                        const trackHeight = markFontSize + 14; // 跑道椭圆高度
                                        const trackWidth = markTextWidth + markPadding * 2.5; // 跑道椭圆宽度

                                        // 动态计算 Canvas 的宽度和高度
                                        const canvasWidth = Math.max(titleWidth + 130, 460); // 保证最小宽度为 400
                                        const canvasHeight =
                                            headerHeight + rowHeight * clusteredEntities.length + padding * 2 + extraHeight; // 计算总高度

                                        canvas.width = canvasWidth; // 设置 Canvas 宽度
                                        canvas.height = canvasHeight; // 设置 Canvas 高度

                                        // 加载背景图片
                                        const backgroundImage = new Image();
                                        backgroundImage.src = '/images/背景边框.png'; // 确保路径正确
                                        backgroundImage.onload = function () {
                                            // 背景图片放大比例（例如 1.2 表示放大 20%）
                                            const scaleFactor = 1.6;

                                            // 计算背景图片缩放比例
                                            const imageAspectRatio = backgroundImage.width / backgroundImage.height;
                                            const canvasAspectRatio = canvasWidth / canvasHeight;
                                            let drawWidth, drawHeight, offsetX, offsetY;

                                            if (imageAspectRatio < canvasAspectRatio) {
                                                // 图片更高，以 Canvas 高度为准缩放，并放大
                                                drawHeight = canvasHeight * scaleFactor;
                                                drawWidth = drawHeight * imageAspectRatio;
                                                offsetX = (canvasWidth - drawWidth) / 2; // 水平居中
                                                offsetY = (canvasHeight - drawHeight) / 2; // 垂直居中
                                            } else {
                                                // 图片更宽，以 Canvas 宽度为准缩放，并放大
                                                drawWidth = canvasWidth * scaleFactor;
                                                drawHeight = drawWidth / imageAspectRatio;
                                                offsetX = (canvasWidth - drawWidth) / 2; // 水平居中
                                                offsetY = (canvasHeight - drawHeight) / 2; // 垂直居中
                                            }

                                            // 绘制背景图片（完全显示并放大）
                                            context.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);

                                            // 绘制操场跑道样式的红色椭圆
                                            const trackX = padding - 7; // 椭圆起点 X
                                            const trackY = headerHeight / 2 + padding / 2; // 椭圆起点 Y
                                            const radius = trackHeight / 2; // 椭圆两端的圆弧半径
                                            const straightWidth = trackWidth - 2 * radius; // 椭圆中间的直线长度

                                            context.strokeStyle = '#D77786'; // 红色边框
                                            context.lineWidth = 3; // 加粗椭圆边框
                                            context.beginPath();
                                            // 左侧圆弧
                                            context.arc(trackX + radius, trackY, radius, Math.PI / 2, -Math.PI / 2, false);
                                            // 上方直线
                                            context.lineTo(trackX + radius + straightWidth, trackY - radius);
                                            // 右侧圆弧
                                            context.arc(
                                                trackX + radius + straightWidth,
                                                trackY,
                                                radius,
                                                -Math.PI / 2,
                                                Math.PI / 2,
                                                false
                                            );
                                            // 下方直线
                                            context.lineTo(trackX + radius, trackY + radius);
                                            context.closePath();
                                            context.stroke();

                                            // 绘制红色标绘文字
                                            context.font = `bold ${markFontSize}px Arial`;
                                            context.fillStyle = '#D77786'; // 红色字体
                                            context.textAlign = 'center';
                                            context.textBaseline = 'middle';
                                            context.fillText(markText, trackX + trackWidth / 2, trackY);

                                            // 绘制表格标题文字
                                            context.font = `bold ${titleFontSize}px Arial`; // 标题字体
                                            context.fillStyle = '#ffffff'; // 白色文字
                                            context.textAlign = 'center';
                                            context.textBaseline = 'middle';
                                            context.fillText(
                                                title,
                                                canvasWidth / 2,
                                                headerHeight / 2 + padding / 2
                                            ); // 居中绘制标题

                                            let currentY = headerHeight + padding;
                                            clusteredEntities.forEach((entity, index) => {
                                                const text = entity.labeltext || '无信息';
                                                if (text.length > 10) {
                                                    const words = text.split('');
                                                    let line = '';
                                                    for (let i = 0; i < words.length; i++) {
                                                        if (context.measureText(line + words[i]).width > canvasWidth - 2 * padding) {
                                                            context.font = `${contentFontSize}px Arial`; // 内容字体
                                                            context.fillStyle = '#ffffff'; // 白色字体
                                                            context.textAlign = 'left';
                                                            context.fillText(line, padding, currentY + rowHeight / 2);
                                                            line = words[i];
                                                            currentY += rowHeight;
                                                        } else {
                                                            line += words[i];
                                                        }
                                                    }
                                                    context.font = `${contentFontSize}px Arial`; // 内容字体
                                                    context.fillStyle = '#ffffff'; // 白色字体
                                                    context.textAlign = 'left';
                                                    context.fillText(line, padding, currentY + rowHeight / 2);
                                                } else {
                                                    context.font = `${contentFontSize}px Arial`; // 内容字体
                                                    context.fillStyle = '#ffffff'; // 白色字体
                                                    context.textAlign = 'left';
                                                    context.fillText(text, padding, currentY + rowHeight / 2);
                                                }
                                                currentY += rowHeight;
                                            });

                                            // 将 Canvas 转换为 Billboard 图像
                                            const canvasImage = canvas.toDataURL('image/png');

                                            try {
                                                // 检查 Billboard 是否已初始化
                                                if (cluster.billboard) {
                                                    cluster.billboard.show = true;
                                                    cluster.billboard.image = canvasImage;

                                                    // 调整宽高比例
                                                    cluster.billboard.width = canvasWidth * 0.7;
                                                    cluster.billboard.height = canvasHeight * 0.7;
                                                    cluster.billboard.verticalOrigin =
                                                        Cesium.VerticalOrigin.BOTTOM;

                                                    // 设置 Billboard 高度引用地形
                                                    cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

                                                    // 禁用深度测试，使 Billboard 不会被地形遮挡
                                                    cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                                                    // 设置 Billboard 位置：背景图片右下角对齐标绘图标正上方
                                                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                                                    cluster.billboard.pixelOffset = new Cesium.Cartesian2(
                                                        -(canvasWidth * 0.28), // 调整为右下角更贴近图标
                                                        -(canvasHeight * 0) // 上移贴近图标
                                                    );

                                                    // 隐藏 Cesium 默认的标签
                                                    cluster.label.show = false;
                                                } else {
                                                    cluster.label.show = false;
                                                }
                                            } catch (error) {
                                                // 捕获 Cesium 的内部报错，避免控制台输出
                                                if (error.message && error.message.includes('_textureAtlas')) {
                                                } else {
                                                }
                                            }
                                        };

                                        // 捕获图片加载错误
                                        backgroundImage.onerror = function () {
                                        };
                                    }
                                );
                            }
                        }

                        customStyle();
                    })
                    window.labeldataSource = labeldataSource;
                }
            }
            return labeldataSource
        }
    },

    addMakerPoint(item, type) {
        // console.log(item, "addMakerPoint timeline")
        //点的属性 震中点统用一一个方法
        let labeltext = null
        let img = 'http://localhost:8081' + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime()
        let pointDataSource = this.addDataSourceLayer("pointData")
        if (pointDataSource) {
            if (window.pointDataSource.entities.getById(item.plotId)) {
                window.pointDataSource.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            pointDataSource.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
                // label: {
                //     text: labeltext,
                //     show: true,
                //     font: '14px sans-serif',
                //     fillColor: Cesium.Color.RED,        //字体颜色
                //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                //     outlineWidth: 2,
                //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
                //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                //     pixelOffset: new Cesium.Cartesian2(0, -16),
                // },
                id: item.plotId,
                plottype: item.plotType,
                layer: type,
                properties: {...item}
            })
            // console.log(item.plotId, item.plotType, "item.plotId, item.plotType")
            let plotId = item.plotId
            let plotType = item.plotType

            if (item.plotType === "失踪人员" || item.plotType === "轻伤人员" || item.plotType === "重伤人员" || item.plotType === "危重伤人员" || item.plotType === "死亡人员" || item.plotType === "已出发队伍" || item.plotType === "正在参与队伍" || item.plotType === "待命队伍") {
                getPlotInfos({plotId, plotType}).then(res => {
                    let labeltext = this.labeltext(plotType, res)
                    this.addPointLabel(item, labeltext)
                })
            }
        }
    },
    addPolyline(item, type) {
        console.log(item, "addPolyline timeline")
        if (window.viewer && window.viewer.entities) {

            let material = cesiumPlot.getMaterial(item.plotType, 'http://localhost:8081' + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime())

            let positionsArr = []
            item.geom.coordinates.forEach(e => {
                positionsArr.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
            })
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
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
                    ...item,
                }
            })
        }
    },
    addPolygon(item, type) {
        // console.log(item, "item")
        if (window.viewer && window.viewer.entities) {
            if (item.plotType === "泥石流" || item.plotType === "滑坡" || item.plotType === "地面沉降" || item.plotType === "崩塌" || item.plotType === "地面塌陷") {
                let polygonPoints = []
                item.geom.coordinates[0].forEach(e => {
                    polygonPoints.push(Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0))));
                })
                if (window.viewer.entities.getById(item.plotId)) {
                    // console.log(window.viewer.entities.getById(item.plotId), "window.viewer.entities.getById(item.plotId)")
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
                        hierarchy: new Cesium.PolygonHierarchy(polygonPoints),
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
                        ...item //弹出框
                    }
                });

                const width = 9000;  // 矩形宽度
                const height = 9000; // 矩形高度
                // 获取大多边形的中心点
                const center = plotCompute.getPolygonCenter(polygonPoints);
                // 生成小矩形的四个角点
                const smallRectanglePositions = plotCompute.createContainedRectangle(center, width, height, item.angle, polygonPoints);
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
                    layer: '中心图标',
                    ellipse: {
                        semiMajorAxis: diameter / 2, // 对角线的一半作为半径
                        semiMinorAxis: diameter / 2, // 保证是一个正圆
                        material: new Cesium.ImageMaterialProperty({
                            image: 'http://localhost:8081' + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime(),
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
                        ...item //弹出框
                    }
                });
            }
            else {
                // 1-1 经纬度
                let polygonPoints = []
                item.geom.coordinates[0].forEach(e => {
                    polygonPoints.push(Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0))));
                })

                if (window.viewer.entities.getById(item.plotId)) {
                    // console.log(window.viewer.entities.getById(item.plotId), "window.viewer.entities.getById(item.plotId)")
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
                        hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(polygonPoints), false),
                        material: 'http://localhost:8081' + '/uploads/PlotsPic/' + item.icon + '.png?t=' + new Date().getTime(),
                        // stRotation: Cesium.Math.toRadians(polygon[0].angle),
                        clampToGround: true,
                    },
                    properties: {
                        // pointPosition: this.positions,
                        // linePoint: this.polygonPointEntity,
                        ...item //弹出框
                    }
                });
            }
        }
    },
    addArrow(item, type) {
        if (item.drawtype === 'straight') {
            this.addStraightArrow(item, type)
        } else if (item.drawtype === 'attack') {
            this.addAttackArrow(item, type)
        } else {
            this.addPincerArrow(item, type)
        }
    },
    //---被引用的子方法-箭头---
    addStraightArrow(item, type) {
        if (window.viewer && window.viewer.entities) {
            let arrowPoints = []
            item.geom.coordinates.forEach(e => {
                arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
            })
            var update = function () {
                if (arrowPoints.length < 2) {
                    return null;
                }
                var p1 = arrowPoints[1];
                var p2 = arrowPoints[2];
                var firstPoint = plotCompute.cartesianToLatlng(p1);
                var endPoints = plotCompute.cartesianToLatlng(p2);
                var arrow = [];
                var res = xp.algorithm.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
                var index = JSON.stringify(res).indexOf("null");
                if (index != -1) return [];
                for (var i = 0; i < res.length; i++) {
                    var c3 = new Cesium.Cartesian3(res[i].x, res[i].y, res[i].z);
                    arrow.push(c3);
                }
                return new Cesium.PolygonHierarchy(arrow);
            }
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                })]),
                id: item.plotId,
                polygon: new Cesium.PolygonGraphics({
                    hierarchy: new Cesium.CallbackProperty(update, false),
                    show: true,
                    fill: true,
                    material: Cesium.Color.BLUE  // 蓝色，透明度0.5
                }),
                layer: type,
                properties: {
                    ...item
                }
            })
        }
    },
    addAttackArrow(item, type) {
        if (window.viewer && window.viewer.entities) {
            let arrowPoints = []
            item.geom.coordinates.forEach(e => {
                arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
            })
            var update = function () {
                //计算面
                if (arrowPoints.length < 3) {
                    return null;
                }
                var lnglatArr = [];
                for (var i = 0; i < arrowPoints.length; i++) {
                    var lnglat = plotCompute.cartesianToLatlng(arrowPoints[i]);
                    lnglatArr.push(lnglat)
                }
                var res = xp.algorithm.tailedAttackArrow(lnglatArr);
                var index = JSON.stringify(res.polygonalPoint).indexOf("null");
                var returnData = [];
                if (index == -1) returnData = res.polygonalPoint;
                return new Cesium.PolygonHierarchy(returnData);
            }
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                })]),
                id: item.plotId,
                polygon: new Cesium.PolygonGraphics({
                    hierarchy: new Cesium.CallbackProperty(update, false),
                    show: true,
                    fill: true,
                    material: Cesium.Color.RED
                }),
                layer: type,
                properties: {
                    ...item
                }
            })
        }
    },
    addPincerArrow(item, type) {
        if (window.viewer && window.viewer.entities) {
            let arrowPoints = []
            item.geom.coordinates.forEach(e => {
                arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
            })
            var update = function () {
                //计算面
                if (arrowPoints.length < 3) {
                    return null;
                }
                var lnglatArr = [];
                for (var i = 0; i < arrowPoints.length; i++) {
                    var lnglat = plotCompute.cartesianToLatlng(arrowPoints[i]);
                    lnglatArr.push(lnglat)
                }
                var res = xp.algorithm.doubleArrow(lnglatArr);
                var returnData = [];
                var index = JSON.stringify(res.polygonalPoint).indexOf("null");
                if (index == -1) returnData = res.polygonalPoint;
                return new Cesium.PolygonHierarchy(returnData);
            }
            if (window.viewer.entities.getById(item.plotId)) {
                window.viewer.entities.removeById(item.plotId);  // 删除已存在的多边形实体
            }
            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(new Date(item.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(item.endTime))
                })]),
                id: item.plotId,
                polygon: new Cesium.PolygonGraphics({
                    hierarchy: new Cesium.CallbackProperty(update, false),
                    show: true,
                    fill: true,
                    material: Cesium.Color.YELLOW
                }),
                layer: type,
                properties: {
                    ...item
                }
            })
        }
    },
    //标签（点线面）
    labeltext(plotType, res) {
        // console.log("标签",res)
        let labeltext =res.plotInfo.belongCounty+ res.plotInfo.belongTown+"新增"+plotType
        //人员伤亡类文字：xxx人员xx人
        if (plotType === "轻伤人员" || plotType === "重伤人员" || plotType === "危重伤人员" || plotType === "死亡人员") {
            if (res.plotTypeInfo && res.plotTypeInfo.newCount) {
                labeltext = labeltext + res.plotTypeInfo.newCount + "人"
            }
        }
        //救援队伍 单位,人数人
        if (plotType === "已出发队伍" || plotType === "正在参与队伍" || plotType === "待命队伍") {
            if (res.plotTypeInfo.teamName) {
                labeltext = labeltext + ":" + res.plotTypeInfo.teamName
            }
            if (res.plotTypeInfo.personnelCount) {
                labeltext = labeltext + res.plotTypeInfo.personnelCount + "人"
            }
            if (res.plotTypeInfo.teamName == null && res.plotTypeInfo.personnelCount == 0) {
                labeltext = labeltext + "1队"
            }
        }
        // 是否出现人员伤亡，是否处置（次生灾害）
        if (res.plotTypeInfo && res.plotTypeInfo.casualties) {
            labeltext = labeltext + res.plotTypeInfo.casualties + "人员伤亡"
        }
        // if (res.plotTypeInfo && res.plotTypeInfo.initialDisposalPhase) {
        //     labeltext = labeltext + "," + res.plotTypeInfo.initialDisposalPhase
        // }
        return labeltext
    },
    addPointLabel(data, labeltext) {
        // console.log(data,"data addPointLabel")
        let labeldataSource = this.addDataSourceLayer("label")
        if (labeldataSource) {
            let id = data.plotId + '_label'
            // if()
            if (labeldataSource.entities.getById(id)) {
                labeldataSource.entities.removeById(id);  // 删除已存在的多边形实体
            }
            labeldataSource.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(new Date(data.startTime)),
                    stop: Cesium.JulianDate.fromDate(new Date(data.endTime))
                })]),
                id: data.plotId + '_label',
                plottype: data.plotType,
                layer: "标绘点标签",
                // layers: "聚合标绘点",
                position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
                labeltext: labeltext,
                billboard: {
                    image: 'http://localhost:8081' + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime(),
                    width: 50, // 图片宽度,单位px
                    height: 50, // 图片高度，单位px
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                    scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                    depthTest: false, // 禁止深度测试
                    disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
                },
                properties: {
                    data
                }
            })
            // labeldataSource.entities.add({
            //   id: data.plotId + '_base',
            //   position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
            //   billboard: {
            //     image: '/images/图标外框.png', // 圆形底座图片
            //     width: 110, // 底座宽度
            //     height: 110, // 底座高度
            //     eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            //     scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
            //     depthTest: false, // 禁止深度测试
            //     disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
            //   },
            // });
        }
    },

    //--------删除-------------
    deletePointById(plotId, drawType) {
        if (drawType === "point") {
            let entity = window.pointDataSource.entities.getById(plotId)
            console.log(entity, "delete entity window.pointDataSource")
            if (entity) {
                window.pointDataSource.entities.remove(entity)
            }
        } else {
            let entity = window.viewer.entities.getById(plotId)
            console.log(entity, "delete entity window.viewer")
            if (entity) {
                window.viewer.entities.remove(entity)
            }
            console.log(drawType, entity.properties, entity.properties.plotType._value, "entity.properties.plotType")
            if (drawType === "polygon" && (entity.properties.plotType._value === "泥石流" || entity.properties.plotType._value === "滑坡" || entity.properties.plotType._value === "地面沉降" || entity.properties.plotType._value === "崩塌" || entity.properties.plotType._value === "地面塌陷")) {
                let polygoncenter = window.viewer.entities.getById(plotId + "_polygon")
                // console.log(polygoncenter, window.viewer.entities, "polygonbottom")
                if (polygoncenter) {
                    window.viewer.entities.remove(polygoncenter)
                }
            }
        }
        this.deleteMakerLabel(plotId)
    },


    //--------交互-------
    //标绘点线面显示隐藏
    markerLayerShow(plots){
        this.showAllMakerPoint(plots)
        this.makerLabelsShowPersonAndResouce(plots)
    },
    markerLayerHidden(plots) {
        console.log("markerLayerHidden")
        plots.forEach(item => {
            // console.log(item)
            if (item.drawtype === "point") {
                let entity = window.pointDataSource.entities.getById(item.plotId)
                if (entity) {
                    entity.show = false
                }
            } else {
                let entity = window.viewer.entities.getById(item.plotId)
                if (entity) {
                    entity.show = false
                }
            }
            let entitylabel=window.labeldataSource.entities.getById(item.plotId+'_label')
            if (entitylabel) {
                entitylabel.show = false
            }
        })
    },
    showAllMakerPoint(plots) {
        plots.forEach(item => {
            if (item.drawtype === "point") {
                let entity = window.pointDataSource.entities.getById(item.plotId)
                if (entity) {
                    entity.show = true
                }
            } else {
                let entity = window.viewer.entities.getById(item.plotId)
                if (entity) {
                    entity.show = true
                }
            }

        })
    },
    //标签显示隐藏
    //隐藏所有标签
    markerLabelsHidden(plots) {
        plots.forEach(item => {
            let entity = window.labeldataSource.entities.getById(item.plotId + '_label')
            if (entity) {
                entity.show = false
            }
        })
    },
    //只显示人员伤亡和救援队伍
    makerLabelsShowPersonAndResouce(plots) {
        console.log("makerLabelsShowPersonAndResouce")
        plots.forEach(item => {
            if (item.plotType === "失踪人员" || item.plotType === "轻伤人员" || item.plotType === "重伤人员" || item.plotType === "危重伤人员" || item.plotType === "死亡人员" || item.plotType === "已出发队伍" || item.plotType === "正在参与队伍" || item.plotType === "待命队伍") {
                let entity = window.labeldataSource.entities.getById(item.plotId + '_label')
                // console.log(entity, "entity show")
                if (entity) {
                    entity.show = true
                }
            } else {
                let entity = window.labeldataSource.entities.getById(item.plotId + '_label')
                // console.log(item.plotId, entity, "entity not show")
                if (entity) {
                    entity.show = false
                }
            }
        })
    },
    //删除标签
    deleteMakerLabel(plotId) {
        let entity = window.labeldataSource.entities.getById(plotId + '_label')
        if (entity) {
            window.labeldataSource.entities.remove(entity)
        }
    },

    //闪烁
    blinkMarker(plot) {
        return new Promise((resolve) => {
            let entity = null
            if (plot.drawtype === 'point') {
                entity = window.pointDataSource.entities.getById(plot.plotId);
            } else {
                entity = window.viewer.entities.getById(plot.plotId); // 假设每个点都有一个唯一的id
            }
            if (!entity) {
                console.error("Entity not found:", plot);
                resolve();
                return;
            }
            const interval = 200; // 每次闪烁的时间间隔
            let count = 0;
            const blinkInterval = setInterval(() => {
                entity.show = !entity.show
                count++;
                if (count >= 5) {
                    clearInterval(blinkInterval);
                    entity.show = true;
                    resolve(); // 完成闪烁，继续后续操作
                }
            }, interval);
        });
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
}
export default timeLine;
