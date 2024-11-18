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
      let intervalTime = 500; // 切换颜色的时间间隔
      let animationDuration = 3000; // 动画总持续时间（10秒）
      let intervalId = setInterval(() => {
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
          image: 'http://localhost:8080/uploads/PlotsPic/' + data.icon+ '.png?t=' + new Date().getTime(),
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
      let img = 'http://localhost:8080/uploads/PlotsPic/' + data.icon+ '.png?t=' + new Date().getTime();
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

  drawPoints(points, bool, stoptime) {
    // 判断 points 是否为数组，不是数组则将它包装为数组
    if (!Array.isArray(points)) {
      let data = {}
      if (points.longitude) {
        data = {
          longitude: Number(points.longitude),
          latitude: Number(points.latitude),
          ...points
        }
      } else {
        data = {
          longitude: Number(points.geom.coordinates[0]),
          latitude: Number(points.geom.coordinates[1]),
          ...points
        }
      }

      points = data
      points = [points];
    }
    this.addDataSourceLayer("pointData")
    this.addDataSourceLayer("label")
    points.forEach(data => {
      let plotId = data.plotId
      let plotType = data.plotType
      let colorFactor = 1.0;
      let intervalTime1 = 200;
      // let animationDuration = stoptime;
      //200毫秒闪烁一次
      let intervalId1 = setInterval(() => {
        colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
      }, intervalTime1);

      //标签
      getPlotInfos({plotId, plotType}).then(res => {
        let labeltext = this.labeltext(plotType, res)
        if (bool) {
          if (!viewer.entities.getById(data.plotId)) {
            this.addMakerPointActive(data, stoptime)

            this.addPointToLabel(data, labeltext)
            // this.flyTo(data)

            // 结束但隔断闪烁动效后：
            // 1.移除挂在在viewer下的单个点，
            // 2、将点放入pointData聚合图层下
            // 3、除人员伤亡和救援出队，移除标签文字
            setTimeout(() => {
              let entityDonghua = window.viewer.entities.getById(data.plotId);
              if (entityDonghua) {
                window.viewer.entities.remove(entityDonghua); // 移除点
              }
              if (!window.pointDataSource.entities.getById(data.plotId)) {
                window.pointDataSource.entities.add(entityDonghua)//加到点聚合图层
              }
              if (plotType === "失踪人员" || plotType === "轻伤人员" || plotType === "重伤人员" || plotType === "危重伤人员" || plotType === "死亡人员" || plotType === "已出发队伍" || plotType === "正在参与队伍" || plotType === "待命队伍") {
              } else {
                let entitylabel = window.labeldataSource.entities.getById(data.plotId + "_label");
                if (entitylabel) {
                  window.labeldataSource.entities.remove(entitylabel); // 移除点
                }
              }
            }, stoptime);
          }
        } else {
          this.addPointToPointData(data)
          if (plotType === "失踪人员" || plotType === "轻伤人员" || plotType === "重伤人员" || plotType === "危重伤人员" || plotType === "死亡人员" || plotType === "已出发队伍" || plotType === "正在参与队伍" || plotType === "待命队伍") {
            this.addPointToLabel(data, labeltext)
          }
        }
      })
    });
  }


  deletePoint(point) {
    viewer.entities.remove(point)
  }

  deletePointById(plotId) {
    if (window.pointDataSource) {
      let entityToRemove = window.pointDataSource.entities.getById(plotId);
      if (entityToRemove) {
        window.pointDataSource.entities.remove(entityToRemove); // 移除点
      }
    }
    let entityDonghua = window.viewer.entities.getById(plotId);
    if (entityDonghua) {
      window.viewer.entities.remove(entityDonghua); // 移除点
    }
    if (window.labeldataSource) {
      let entitylabel = window.labeldataSource.entities.getById(plotId + '_label');
      if (entitylabel) {
        window.labeldataSource.entities.remove(entitylabel); // 移除点
      }
    }
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

//---------工具函数 start-----------------
//聚合图层数据源，挂载到windows
  addDataSourceLayer(datasourcename) {
    if (datasourcename === "pointData") {
      let pointDataSource = null
      if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'pointData')) {
        pointDataSource = window.pointDataSource

      } else {
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
          let singleDigitPins = new Array(8);
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
              let removeListener = pointDataSource.clustering.clusterEvent.addEventListener(
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

            let pixelRange = pointDataSource.clustering.pixelRange;
            pointDataSource.clustering.pixelRange = 0;
            pointDataSource.clustering.pixelRange = pixelRange;
          }

          customStyle();
        })
        window.pointDataSource = pointDataSource;
      }
      return pointDataSource
    } else if (datasourcename === "label") {
      let labeldataSource = null
      if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'label')) {
        labeldataSource = window.labeldataSource
      } else {
        labeldataSource = new Cesium.CustomDataSource("label");
        let dataSourcePromise = window.viewer.dataSources.add(labeldataSource)
        dataSourcePromise.then(function (labeldataSource) {
          labeldataSource.clustering.enabled = true; // 开启聚合
          // labeldataSource.clustering.pixelRange = 30; // 聚合像素范围
          labeldataSource.clustering.minimumClusterSize = 1; // 最小聚合大小

          // 监听相机变化事件来动态调整聚合像素范围
          let cameraChangeListener = viewer.camera.changed.addEventListener(function () {
            const cameraHeight = viewer.camera.positionCartographic.height;
            if (cameraHeight < 50000) {
              labeldataSource.clustering.pixelRange = 0; // 近距离时，聚合像素范围小
            } else {
              labeldataSource.clustering.pixelRange = 100; // 远距离时，聚合像素范围大
            }
          });


          let removeListener

          function customStyle() {
            if (Cesium.defined(removeListener)) {
              removeListener && removeListener();
              let removeListener = undefined;
            } else {
              let removeListener = labeldataSource.clustering.clusterEvent.addEventListener(
                  function (clusteredEntities, cluster) {
                    // 创建 Canvas 标签
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    // 设置字体属性（先设置字体，以便测量）
                    context.font = 'bold 18px Arial';
                    const rowHeight = 30; // 每行高度
                    const padding = 20; // 内边距
                    const margin = 10; // 外边距
                    const canvasHeight = Math.max(50, rowHeight * (clusteredEntities.length + 1)) + padding * 6; // 表格信息下移

                    // 测量每行文本的宽度
                    let maxTextWidth = 0;
                    clusteredEntities.forEach(entity => {
                      // 获取每行的文本
                      const text = entity.labeltext || '无信息';
                      const words = text.split(' ');
                      let currentLine = '';
                      words.forEach(word => {
                        let testLine = currentLine + (currentLine ? ' ' : '') + word;
                        let testWidth = context.measureText(testLine).width;

                        // 如果文本行宽度大于最大宽度，则换行
                        if (testWidth > maxTextWidth) {
                          maxTextWidth = testWidth;
                        }
                        currentLine = testLine;
                      });
                    });

                    // 调整 Canvas 宽度以适应最宽的文本
                    const canvasWidth = maxTextWidth + padding * 6; // 留出内边距空间
                    canvas.width = canvasWidth + margin * 2; // 计算总宽度
                    canvas.height = canvasHeight + margin * 2;

                    // 绘制黑色透明背景并加圆角
                    context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 黑色透明背景
                    const borderRadius = 20; // 圆角半径
                    context.beginPath();
                    context.moveTo(margin + borderRadius, margin);
                    context.lineTo(margin + canvasWidth + margin - borderRadius, margin);
                    context.arcTo(margin + canvasWidth + margin, margin, margin + canvasWidth + margin, margin + canvasHeight, borderRadius);
                    context.lineTo(margin + canvasWidth + margin, margin + canvasHeight - borderRadius);
                    context.arcTo(margin + canvasWidth + margin, margin + canvasHeight, margin + canvasWidth + margin - borderRadius, margin + canvasHeight, borderRadius);
                    context.lineTo(margin + borderRadius, margin + canvasHeight);
                    context.arcTo(margin, margin + canvasHeight, margin, margin + canvasHeight - borderRadius, borderRadius);
                    context.lineTo(margin, margin + borderRadius);
                    context.arcTo(margin, margin, margin + borderRadius, margin, borderRadius);
                    context.closePath();
                    context.fill();

                    // 加载本地边框图片
                    const borderImage = new Image();
                    borderImage.src = '/images/背景边框.png'; // 本地图片路径
                    borderImage.onload = function () {
                      // 绘制边框图片
                      context.drawImage(borderImage, margin, margin, canvasWidth, canvasHeight);

                      // 绘制表格头部
                      context.fillStyle = '#333333'; // 深灰背景
                      context.fillRect(margin + padding, margin + padding + 20, canvasWidth - padding * 2, rowHeight); // 表格距离上边框远一些

                      // 绘制头部文字
                      context.fillStyle = '#ffffff'; // 白色字体
                      context.font = 'bold 18px Arial';
                      context.textAlign = 'left';
                      context.textBaseline = 'middle';
                      context.fillText('序号', margin + padding + 10, margin + padding + 20 + rowHeight / 2);
                      context.fillText('信息', margin + padding + 60, margin + padding + 20 + rowHeight / 2); // 文字位置右移

                      // 绘制表格内容
                      clusteredEntities.forEach((entity, index) => {
                        const yPosition = margin + padding + (index + 2) * rowHeight; // 每行的 Y 位置，下移表格信息

                        // 绘制网格线
                        context.strokeStyle = '#ffffff'; // 网格线为白色
                        context.lineWidth = 1;
                        context.beginPath();
                        context.moveTo(margin + padding, yPosition);
                        context.lineTo(margin + padding + canvasWidth - padding * 2, yPosition);
                        context.stroke();

                        // 绘制行数据
                        context.fillStyle = '#ffffff'; // 白色字体
                        context.fillText(`${index + 1}`, margin + padding + 10, yPosition + rowHeight / 2);
                        context.fillText(`${entity.labeltext || '无信息'}`, margin + padding + 60, yPosition + rowHeight / 2); // 文字右移
                      });

                      // 将 Canvas 转换为 Billboard 图像
                      const canvasImage = canvas.toDataURL('image/png');

                      // 设置 Billboard
                      cluster.billboard.show = true;
                      cluster.billboard.image = canvasImage; // 设置背景图像
                      cluster.billboard.width = (canvasWidth + margin * 2) / 2; // 根据需要调整比例
                      cluster.billboard.height = (canvasHeight + margin * 2) / 2;

                      // 设置标签位置在图标上方
                      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                      cluster.billboard.pixelOffset = new Cesium.Cartesian2(0, -(canvasHeight + margin * 2) / 2);

                      // 隐藏 Cesium 默认的标签
                      cluster.label.show = false;
                    };

                    // 处理图片加载失败
                    borderImage.onerror = function () {
                      console.error('Failed to load border image from:', borderImage.src);
                    };
                  }
              );
            }
          }

          customStyle();
        })
        window.labeldataSource = labeldataSource;
      }
      return labeldataSource
    }

  }


//标签文字
  labeltext(plotType, res) {
    let labeltext = plotType
    if (res.plotTypeInfo && res.plotTypeInfo.location) {
      labeltext = res.plotTypeInfo.location + labeltext
    }
    //人员伤亡类文字：新增xxx人员xx人
    // if(plotType==="失踪人员"||plotType==="轻伤人员"||plotType==="重伤人员"||plotType==="危重伤人员"||plotType==="死亡人员"){
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
    if (res.plotTypeInfo && res.plotTypeInfo.initialDisposalPhase) {
      labeltext = labeltext + "," + res.plotTypeInfo.initialDisposalPhase
    }
    return labeltext
  }

//单个点动画
  addMakerPointActive(data, stoptime) {
    let intervalTime1 = 200;
    let colorFactor = 1.0;
    let intervalId1 = setInterval(() => {
      colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
    }, intervalTime1);
    viewer.entities.add({
      id: data.plotId,
      plottype: data.plotType,
      layer: "标绘点",
      position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
      // labeltext: labeltext,
      billboard: {
        image: 'http://localhost:8080/uploads/PlotsPic/' + data.icon+ '.png?t=' + new Date().getTime(),
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
    setTimeout(() => {
      clearInterval(intervalId1);
      colorFactor = 1.0;
    }, stoptime);
  }

//pointData聚合图层
  addPointToPointData(data) {
    window.pointDataSource.entities.add({
      id: data.plotId,
      plottype: data.plotType,
      layer: "标绘点",
      position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
      // labeltext: labeltext,
      billboard: {
        image: 'http://localhost:8080/uploads/PlotsPic/' + data.icon+ '.png?t=' + new Date().getTime(),
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
  }

//标签图层
  addPointToLabel(data, labeltext) {
    labeldataSource.entities.add({
      id: data.plotId + '_label',
      plottype: data.plotType,
      layer: "标绘点",
      layers: "聚合标绘点",
      position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
      labeltext: labeltext,
      billboard: {
        image: 'http://localhost:8080/uploads/PlotsPic/' + data.icon+ '.png?t=' + new Date().getTime(),
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
  }

  flyTo(data) {
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
      duration: 2 // 飞行动画持续时间（秒）
    });
  }
}
