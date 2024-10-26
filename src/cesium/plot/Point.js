import * as Cesium from 'cesium'
import {getPlotInfos} from "@/api/system/plot.js";
import {plotType as plotTypeDialog} from "@/cesium/plot/plotType.js";

export default class Point {
  constructor(viewer, store) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    this.store = store
    this.ifAnimate = false
  }
  // 画点的屏幕事件
  initPointHandlder(pointType,img,eqid, bool) {
    this.ifAnimate = bool
    return new Promise((resolve, reject)=>{
      let viewer = this.viewer
      let that = this
      that.handler.setInputAction((event) => {
        let pointInfo = {
          geom: null,
          elevation: null,
          icon: null,
          plotType: null,
          plotId: null,
          earthquakeId:eqid
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
  drawPoint(data,bool) {
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

  drawPoints(points,bool){
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
    // console.log("------------------------------------------",bool)
    let dataSource = new Cesium.CustomDataSource("pointData");
    // points.forEach(data=>{
    //   dataSource.entities.add({
    //     id: data.plotId,
    //     plottype: data.plotType,
    //     layer: "标绘点",
    //     position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
    //     billboard: {
    //       image: data.icon,
    //       width: 50,//图片宽度,单位px
    //       height: 50,//图片高度，单位px // 会影响point大小，离谱
    //       eyeOffset: new Cesium.Cartesian3(0, 0, 0),//与坐标位置的偏移距离
    //       color: Cesium.Color.WHITE.withAlpha(1),//颜色
    //       scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
    //       heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
    //       depthTest: false,//禁止深度测试但是没有下面那句有用
    //       disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
    //     },
    //     properties: {
    //       data
    //     }
    //   })
    // })

    // 传来bool判断是否要添加动画，若为true则添加
    // if(bool){
    //   points.forEach(data => {
    //     var plotId=data.plotId
    //     var plotType=data.plotType
    //     // getPlotInfos({ plotId, plotType }).then(res => {
    //     //   console.log("点击获取",res)
    //     //   // 2. 初始化 item 对象，存储标绘信息
    //     //   // let item = {
    //     //   //   starttime: null,
    //     //   //   endtime: null,
    //     //   //   info: null,
    //     //   //   uuid: null,
    //     //   //   aditStatus: true,
    //     //   //   plotId: null,
    //     //   //   plotType:null,
    //     //   //   drawtype: null,
    //     //   //   longitude: null,
    //     //   //   latitude: null
    //     //   // };
    //     //   //
    //     //   // // 3. 处理标绘点的开始和结束时间
    //     //   // item.starttime = that.timestampToTime(res.plotInfo.startTime);
    //     //   // item.endtime = res.plotInfo.endTime ? that.timestampToTime(res.plotInfo.endTime) : "";
    //     //   // item.plotId = plotId;
    //     //   // item.plotType = plotType;
    //     //   // item.drawtype = res.plotInfo.drawtype;
    //     //   // item.longitude=res.plotInfo.geom.coordinates[0] || "无经纬度信息";
    //     //   // item.latitude=res.plotInfo.geom.coordinates[1] || "无经纬度信息";
    //     //   // // 4. 初始化类型信息
    //     //   // let typeInfo = {};
    //     //
    //     //   // 6. 如果 res.plotTypeInfo 存在，则处理类型相关信息
    //     //   // if (res.plotTypeInfo) {
    //     //   //   for (let key in plotTypeDialog) {
    //     //   //     if (res.plotInfo.plotType === plotTypeDialog[key].name) {
    //     //   //       // 深拷贝 plotTypeDialog 中的对应类型到 typeInfo
    //     //   //       typeInfo = JSON.parse(JSON.stringify(plotTypeDialog[key]));
    //     //   //       break;
    //     //   //     }
    //     //   //   }
    //     //   //
    //     //   //   // 7. 将获取到的 plotTypeInfo 值赋给 typeInfo
    //     //   //   for (let key in typeInfo) {
    //     //   //     // 如果 plotTypeInfo 中存在对应字段，则直接赋值
    //     //   //     if (res.plotTypeInfo[key] !== undefined) {
    //     //   //       typeInfo[key].value = res.plotTypeInfo[key];
    //     //   //     }
    //     //   //   }
    //     //   //
    //     //   //   // 8. 将处理后的 typeInfo 赋值给 item.info
    //     //   //   item.info = typeInfo;
    //     //   //
    //     //   //   // 9. 设置 item.uuid
    //     //   //   item.uuid = res.plotTypeInfo.uuid;
    //     //   // } else {
    //     //   //   // 如果 res.plotTypeInfo 不存在，只保留基本信息
    //     //   //   item.info = {
    //     //   //     starttime: item.starttime,
    //     //   //     endtime: item.endtime,
    //     //   //     plotType: plotType,
    //     //   //   };
    //     //   // }
    //     //   //
    //     //   // // 10. 将 item 添加到 plotInfoActivities 数组中
    //     //   // that.plotInfoActivities.push(item);
    //     //   //
    //     //   // // 11. 更新 plotInfoNew 为最新的标绘信息
    //     //   // that.plotInfoNew = that.plotInfoActivities[0];
    //     //   // console.log("更新",that.plotInfoNew)
    //     // });
    //
    //
    //     let colorFactor = 1.0;
    //     const intervalTime1 = 200;
    //     // const intervalTime2 = 10;
    //     const animationDuration = 2000;
    //     // let minR = 100;
    //     // let maxR = 100;
    //
    //     // 设置动画逻辑
    //     const intervalId1 = setInterval(() => {
    //       colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
    //     }, intervalTime1);
    //     // const intervalId2 = setInterval(() => {
    //     //   if (minR <= 5000) {
    //     //     minR += 50;
    //     //   } else {
    //     //     minR = 100;
    //     //   }
    //     //   if (maxR <= 5000) {
    //     //     maxR += 50;
    //     //   } else {
    //     //     maxR = 100;
    //     //   }
    //     // }, intervalTime2);
    //     var labeltxt="新增一处"+plotType
    //     // 添加标绘点
    //     var entity=dataSource.entities.add({
    //       id: data.plotId,
    //       plottype: data.plotType,
    //       layer: "标绘点",
    //       position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
    //       label: {
    //         text: labeltxt,
    //         font: '16px sans-serif', // 字体大小
    //         style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 字体样式
    //         fillColor: new Cesium.Color.fromCssColorString("#fbfbfb"), // 字体填充色
    //         outlineWidth: 1,  // 字体外圈线宽度（同样也有颜色可设置）
    //         outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
    //         pixelOffset: new Cesium.Cartesian2(0, -15),  // 中心位置
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY
    //       },
    //       billboard: {
    //         image: data.icon,
    //         width: 50, // 图片宽度,单位px
    //         height: 50, // 图片高度，单位px
    //         eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
    //         color: new Cesium.CallbackProperty(() => {
    //           return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
    //         }, false),
    //         scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
    //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
    //         depthTest: false, // 禁止深度测试
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
    //       },
    //       properties: {
    //         data
    //       }
    //     });
    //     // 添加标绘点对应的椭圆实体
    //     // dataSource.entities.add({
    //     //   id: data.plotId + '_ellipse', // 椭圆唯一id，移除标绘点的时候同时移除椭圆
    //     //   position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
    //     //   name: '圆形',
    //     //   ellipse: {
    //     //     semiMinorAxis: new Cesium.CallbackProperty(() => minR, false),
    //     //     semiMajorAxis: new Cesium.CallbackProperty(() => maxR, false),
    //     //     material: Cesium.Color.fromCssColorString('#ADD8E6').withAlpha(0.5),
    //     //     outlineColor: Cesium.Color.BLUE
    //     //   }
    //     // });
    //     // 恢复标会点正常的清晰度
    //     setTimeout(() => {
    //       clearInterval(intervalId1);
    //       colorFactor = 1.0;
    //       if (entity.label) {
    //         entity.label = undefined;
    //       }
    //     }, animationDuration);
    //     // 动画结束移除椭圆
    //     // setTimeout(() => {
    //     //   clearInterval(intervalId2);
    //     //   dataSource.entities.removeById(data.plotId + '_ellipse');
    //     // }, animationDuration);
    //   });
    // }




    if(bool){
      points.forEach(data => {
        var plotId=data.plotId
        var plotType=data.plotType
        let colorFactor = 1.0;
        const intervalTime1 = 200;
        const animationDuration = 2000;
        getPlotInfos({ plotId, plotType }).then(res => {
          console.log("点击获取",res)
          console.log("res.plotInfo",res.plotInfo)
          // console.log("点击获取",res.ployInfo.latitude)
          var labeltext=""
          if(res.plotTypeInfo&&res.plotTypeInfo.location){
            labeltext=res.plotTypeInfo.location+labeltext
          }
          labeltext=labeltext+"新增一处"+plotType
          if(res.plotInfo){
            labeltext=labeltext +"\n（经度："+res.plotInfo.geom.coordinates[0]+"，"+"维度："+res.plotInfo.geom.coordinates[1]+"）"
          }
          // console.log("labeltxt",labeltxt)
          // 设置动画逻辑
          const intervalId1 = setInterval(() => {
            colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
          }, intervalTime1);
          // 计算标签的初始偏移量
          var initialOffset =new Cesium.Cartesian3(0, 15, 0);
              // 添加标绘点
          var entity=dataSource.entities.add({
            id: data.plotId,
            plottype: data.plotType,
            layer: "标绘点",
            position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
            label: {
              text: labeltext,
              font: '16px sans-serif', // 字体大小
              style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 字体样式
              fillColor: new Cesium.Color.fromCssColorString("#fbfbfb"), // 字体填充色
              outlineWidth: 1,  // 字体外圈线宽度（同样也有颜色可设置）
              outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
              // pixelOffset: new Cesium.Cartesian2(0, -15),  // 中心位置
              eyeOffset: initialOffset, // 与坐标位置的偏移距离
              // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              // backgroundColor:Cesium.Color.AQUA,    //背景颜色
              backgroundColor:new Cesium.Color.fromCssColorString("#696969"),    //背景颜色
              showBackground:true,                //是否显示背景颜色
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
            },
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

          // 恢复标会点正常的清晰度
          setTimeout(() => {
            clearInterval(intervalId1);
            colorFactor = 1.0;
            if (entity.label) {
              // entity.label.eyeOffset =new Cesium.Cartesian3(0, 10000, 0)
              entity.label = undefined;
            }
          }, animationDuration);
        });
      });
    }
    else{
      points.forEach(data=>{
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

    // 存储 dataSource 到对象上，便于后续操作
    window.pointDataSource = dataSource;
    // console.log("window.pointDataSource",window.pointDataSource)
    const dataSourcePromise = window.viewer.dataSources.add(dataSource)
    // console.log(dataSourcePromise)
    dataSourcePromise.then(function (dataSource) {
      // console.log(dataSource)
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
  }
  // 删除点
  deletePoint(point){
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
