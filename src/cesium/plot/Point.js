import * as Cesium from 'cesium'

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
          latitude: null,
          longitude: null,
          height: null,
          img: null,
          plottype: null,
          plotid: null,
          eqid:eqid
        }
        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
        let ray = viewer.camera.getPickRay(event.position)
        let position = viewer.scene.globe.pick(ray, viewer.scene)
        // 1-2 坐标系转换
        let cartographic = Cesium.Cartographic.fromCartesian(position)//把笛卡尔坐标转换成制图实例，单位是弧度
        let lon = Cesium.Math.toDegrees(cartographic.longitude) //把弧度转换成度
        let lat = Cesium.Math.toDegrees((cartographic.latitude))
        let height = cartographic.height
        // 1-3 点开弹窗中就有经纬度，并且把经纬度图片等信息存入store中
        pointInfo.latitude = lat.toFixed(6)
        pointInfo.longitude = lon.toFixed(6)
        pointInfo.height = height
        pointInfo.img = img//that.matchIcon(pointType)
        pointInfo.plottype = pointType//that.refenceTypeList[pointType]
        pointInfo.plotid = that.guid()
        that.store.setPointInfo1(pointInfo)
        // 1-4 异步执行完成
        resolve('异步操作完成');
        // 1-5 移除此handler
        that.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    })
  }
  // 画点
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
      window.viewer.entities.add({
        id: data.plotid,
        position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.height)),
        billboard: {
          image: data.img,
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
      window.viewer.entities.add({
        id: data.plotid,
        position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.height)),
        billboard: {
          image: data.img,
          width: 50, // 图片宽度,单位px
          height: 50, // 图片高度，单位px
          eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
          color: Cesium.Color.WHITE.withAlpha(1), // 固定颜色
          scale: 0.8, // 缩放比例
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
          depthTest: false, // 禁止深度测试
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 不进行深度测试
        },
        properties: {
          data
        }
      });
    }

  }

  drawPoints(points){
    let dataSource = new Cesium.CustomDataSource("pointData")
    points.forEach(data=>{
      dataSource.entities.add({
        id: data.plotid,
        position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.height)),
        billboard: {
          image: data.img,
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
    const dataSourcePromise = window.viewer.dataSources.add(dataSource)
    console.log(dataSourcePromise)
    dataSourcePromise.then(function (dataSource) {
      console.log(dataSource)
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
      const handler = new Cesium.ScreenSpaceEventHandler(
          viewer.scene.canvas
      );
      handler.setInputAction(function (movement) {
        const pickedLabel = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedLabel)) {
          const ids = pickedLabel.id;
          if(ids.length > 1) {
            let PoRay = viewer.camera.getPickRay(ray);
            const car3 = viewer.scene.globe.pick(PoRay, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(car3);
            let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(longitudeString , latitudeString , height / 1.8),
              duration: 1.0
            });
          }
          console.log(pickedLabel)
          // if (Array.isArray(ids)) {
          //     for (let i = 0; i < ids.length; ++i) {
          //         ids[i].billboard.color = Cesium.Color.RED;
          //     }
          // }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
}
