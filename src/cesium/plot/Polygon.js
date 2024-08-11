import * as Cesium from 'cesium'
import {Entity, PolygonHierarchy} from "cesium";
import {insertPlotAndInfo} from '@/api/system/plot.js'

import {ElMessage} from "element-plus";

export default class Polygon {
  constructor(viewer, ws) {
    this.popupVisiblePolygon=false,
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.polygonEntity = null
    this.positions = [];
    this.lastItem = 0
    this.initId = null
    this.tempPositions = [];
    this.ws = ws;
    this.eqid = null;
    this.polygonPointEntity = [];
    this.isDragging = false;
    this.draggedPointIndex = -1;
    this.isEditing = false;
    this.draggedPoint = null; // 当前拖拽的点
    this.vertexHandlers = []; // 存储每个顶点的事件处理器
    this.entityCount = 0; // 实体个数
    this.type = null; // 新增属性，用于存储类型
    this.angle = 0;
    this.centerPoint = null;
    this.beforeDraggedPoint = null;
    this.afterDraggedPoint = null;
    this.ifSquareSelected = false;
    //这是一个判断，当你上次选中面，然后选中点时，需要删除一次实体，但你只能删除一次，不然会导致bug
    this.lastTimeSelected = 1;
    //这也是一个判断，当你点击完面，再点击地图时，如果没有这个判断，会调用面积测绘的逻辑，然后就有bug了
    this.selectMapAfterSquare = false;
    //这是一个判断，当你生成崩塌面后，再量算面积，再选中量算面积的面，再拖拽点，type会强制变为崩塌，所以这里需要一个变量加以判断，防止type变化
    this.selectPointAfterSquare = false;

    //===========下面的定义用于处理选中面时的拖拽逻辑===========
    this.waitingDraggedEntity = '';// 记录选中的实体
    this.waitingDraggedEntityPosition = [];// 记录选中面对应点的位置信息
    this.newDraggedEntityPosition = [];// 记录鼠标移动的位置
    this.diffEntityWithMouse = []// 记录选中实体与鼠标位置信息的差异
    //===========下面是下面的属性用于将面整体拖拽与点拖拽转换的逻辑===========
    this.selectPoint = null;

  }

  activate(name, type, img, eqid) {
    this.name = name;//记录类型
    this.eqid = eqid
    let currentDate = new Date();
    this.initId = this.timestampToTime(currentDate.getTime());
    // this.positions = [];
    this.lastItem = 0;
    this.isDragging = false;
    this.draggedPointIndex = -1;
    this.isEditing = false;
    this.entityCount = 0;
    this.type = type;
    this.img = img;
    if (this.type === "量算面积"){
      this.polygonPointEntity.forEach(pointEntity => {
        this.viewer.entities.remove(pointEntity);
      });
      this.positions = [];
      this.polygonPointEntity = [];
      if (this.polygonEntity){
        viewer.entities.remove(this.polygonEntity);
      }
      this.polygonEntity = null;
    }
    this.removeEventListeners()
    this.addEventListeners();
  }

  timestampToTime(timestamp) {
    let DateObj = new Date(timestamp)
    // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
    let year = DateObj.getFullYear()
    let month = DateObj.getMonth() + 1
    let day = DateObj.getDate()
    let hh = DateObj.getHours()
    let mm = DateObj.getMinutes()
    let ss = DateObj.getSeconds()
    month = month > 9 ? month : '0' + month
    day = day > 9 ? day : '0' + day
    hh = hh > 9 ? hh : '0' + hh
    mm = mm > 9 ? mm : '0' + mm
    ss = ss > 9 ? ss : '0' + ss
    // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
  }

  leftClickEvent(click) {
    if (this.isDragging) return; // 如果在拖动，不执行添加点的逻辑
    let ray = this.viewer.camera.getPickRay(click.position);
    let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    if (this.type === "选中面"){
      this.selectPoint = null;
      //启用面拖拽的功能
      this.enableVertexDragging();
    }else{
      if (position) {
        if (this.type === "标绘面") {
          this.selectPointAfterSquare = false;
          this.centerPoint = null;
          this.centerPoint = position;
          this.beforeDraggedPoint = null;
          this.afterDraggedPoint = null;
          // 移除现有的正方形和相关点实体
          if (this.polygonEntity) {
            this.viewer.entities.remove(this.polygonEntity);
            this.polygonEntity = null;
          }
          this.polygonPointEntity.forEach(pointEntity => {
            this.viewer.entities.remove(pointEntity);
          });
          this.polygonPointEntity = [];
          this.positions = [];
          // 绘制新的正方形
          this.drawSquare(position);
        } else if(this.type === "量算面积" || (this.type !== "量算面积" && this.selectMapAfterSquare)) {
          this.selectPointAfterSquare = true;
          if(this.lastTimeSelected > 0){
            this.polygonPointEntity.forEach(pointEntity => {
              this.viewer.entities.remove(pointEntity);
            });
            this.positions = [];
            this.polygonPointEntity = [];
            if (this.polygonEntity){
              viewer.entities.remove(this.polygonEntity);
            }
            this.polygonEntity = null;
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
            this.lastTimeSelected = 0;
          }

          this.addPoint(position)
        }
      }
    }
  }

  rightClickEvent(click) {
      //这个判断一般是面积测绘的判断，因为标绘的话，一般都大于3个点
      if (this.positions.length < 3) {
        alert('请选择3个以上的点再执行闭合操作命令');
        return;
      }
      // 移除左右点击事件
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      // if (this.type === "标绘面"){
      //   //这里加个这个判定是因为，如果不这样，量算面积，右键完再右键，会调用这个往后端传数据的方法
      //   this.handler.setInputAction((click) => this.rightClickSendEvent(), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      // }
      if (this.type === "标绘面"){
        //这里加个这个判定是因为，如果不这样，量算面积，右键完再右键，会调用这个往后端传数据的方法
        // 右键后显示输入详细信息的弹窗
        this.handler.setInputAction((event) => this.showDetailInputPopup(event), Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
      // else {
      //   let area = this.area(this.positions);
      //   document.getElementById("area").innerHTML = area.toFixed(2);
      //   // 计算实体个数
      //   // this.updateEntityCount();
      //   // 启用顶点拖拽功能
      // }
    this.enableVertexDragging();
    }

  showDetailInputPopup(event) {
    window.showPopup()
// 阻止默认的右键菜单
  }

  rightClickSendEvent(polygonInfo) {
    let info = polygonInfo;
    // 将多边形顶点转换为经纬度
    let uuid = this.guid();
    let posArr = [];
    this.positions.forEach((item, index) => {
      let cartographicPosition = Cesium.Cartographic.fromCartesian(item);
      posArr[index] = {
        lat: Cesium.Math.toDegrees(cartographicPosition.latitude),
        lon: Cesium.Math.toDegrees(cartographicPosition.longitude),
        height: cartographicPosition.height
      };
    });

    let assemblyData = {
      plots: [],
      plotinfo: {
        plotid: uuid,
        starttime: null,
        endtime: null,
        info: info,
        id: this.guid()
      }
    };

    // 组装 plot 数据
    posArr.forEach((pos, index) => {
      assemblyData.plots.push({
        eqid: this.eqid,
        plotid: uuid,  // 整个多边形共用一个UUID
        time: this.initId,
        plottype: this.name,
        drawtype: "polygon",
        latitude: pos.lat,
        longitude: pos.lon,
        height: pos.height,
        img: this.img,
        angle: this.angle
      });
    });

    // 清除事件处理器和点实体
    this.vertexHandlers.forEach((handler) => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
    });
    this.vertexHandlers = [];
    this.polygonPointEntity.forEach((pointEntity) => {
      this.viewer.entities.remove(pointEntity);
    });
    this.polygonPointEntity = [];
    this.enableCameraControls();

    // 移除右键点击事件处理器
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 批量插入所有数据
    insertPlotAndInfo(assemblyData)
        .then((res) => {
          ElMessage({
            message: '所有数据添加成功',
            type: 'success',
          });
        })
        .catch((error) => {
          console.error('数据插入失败:', error);
          ElMessage({
            message: '数据添加失败',
            type: 'error',
          });
        });
    return assemblyData;
  }

  mouseMoveEvent(movement) {
    if (this.isDragging) {
      if (this.type === "选中面" && this.isEditing && this.selectPoint == null){
        // 获取移动点的位置，且将格式转为世界坐标
        let ray = this.viewer.camera.getPickRay(movement.endPosition);
        let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        // 根据鼠标位置以及选中实体与鼠标位置信息的差异计算出移动后的实体位置
        this.newDraggedEntityPosition = this.diffEntityWithMouse.map(item => ({
          x: item.x + position.x,
          y: item.y + position.y,
          z: item.z + position.z
        }));
        // 动态改变面的位置信息
        this.positions = this.newDraggedEntityPosition
        this.polygonPointEntity.forEach((pointEntity, index) => {
          if (this.newDraggedEntityPosition[index]) {
            pointEntity.position._value = this.newDraggedEntityPosition[index];
          }
        });
        this.drawPolygon();
      }
          //==========这里尝试写动态的旋转，但是失败了=================
          // else if(this.type === "崩塌"){
          //     let afterDraggedPoint = this.draggedPoint;
          //     if (this.afterDraggedPoint){
          //         this.dynamicRotation(afterDraggedPoint)
          //     }
      // }
      else {
        let ray = this.viewer.camera.getPickRay(movement.endPosition);
        let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (position) {
          this.positions[this.draggedPointIndex] = position;
          this.updatePointPosition(this.draggedPointIndex, position);
          if (this.positions.length > 2) {
            this.drawPolygon();
          }
          this.afterDraggedPoint = position;
        }
      }
      //这里我觉得先不要WebSocket 发送更新多边形顶点位置，等松开以后再发送，不然一下会发几百次
      // 向 WebSocket 发送更新多边形顶点位置的消息
      // this.ws.send(JSON.stringify({
      //     type: "polygon",
      //     operate: "update",
      //     data: {
      //         id: this.initId,
      //         positions: this.positions
      //     }
      // }));

      // 更新实体个数
      this.updateEntityCount();
    }
  }


//=======================面积计算==================
  //计算三角形面积
  triangleArea(p0, p1, p2) {
    let v0 = Cesium.Cartesian3.subtract(p0, p1, new Cesium.Cartesian3())
    let v1 = Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3())
    let cross = Cesium.Cartesian3.cross(v0, v1, v0);
    return Cesium.Cartesian3.magnitude(cross) * 0.5
  }

  //计算多边形面积
  area(positions) {
    let result = 0
    if (!Array.isArray(positions)) {
      // console.log('不是数组');
      return result
    }
    //创建一个geometry
    let geometry = Cesium.CoplanarPolygonGeometry.createGeometry(
        Cesium.CoplanarPolygonGeometry.fromPositions({
          positions: positions,
          vertexFormat: Cesium.VertexFormat.POSITION_ONLY
        })
    )
    if (!geometry) {
      // console.log('不是geometry');
      return result
    }
    //顶点坐标数组p;
    let flatPositions = geometry.attributes.position.values
    //确定geometry的基本体的索引，也就是组成其的三角形的索引，每三个为一组，组成一个三角形
    let indices = geometry.indices
    //计算三角形面积，最后加在一起
    for (let i = 0; i < indices.length; i += 3) {
      let p0 = Cesium.Cartesian3.unpack(
          flatPositions,
          indices[i] * 3,
          new Cesium.Cartesian3()
      )
      let p1 = Cesium.Cartesian3.unpack(
          flatPositions,
          indices[i + 1] * 3,
          new Cesium.Cartesian3()
      )
      let p2 = Cesium.Cartesian3.unpack(
          flatPositions,
          indices[i + 2] * 3,
          new Cesium.Cartesian3()
      )
      result += this.triangleArea(p0, p1, p2)
    }
    return result
  }

  // 删除面
  deletePolygon(polygon) {
    this.angle = 0;
    this.selectPointAfterSquare = 0;
    this.lastTimeSelected = 1;
    this.positions = [];
    this.polygonPointEntity = [];
    this.polygonEntity = null
    // 向 WebSocket 发送删除多边形的消息
    this.ws.send(JSON.stringify({
      type: "polygon",
      operate: "delete",
      id: polygon.id
    }));

    // 获取多边形的顶点坐标
    let polygonPosition = polygon.properties.pointPosition;

    // 移除多边形的顶点和多边形本身
    polygonPosition.forEach((position) => {
      let pointEntity = this.viewer.entities.getById(position.id);
      if (pointEntity) {
        this.viewer.entities.remove(pointEntity);
      }
    });
    this.viewer.entities.remove(polygon);
  }

  //=======================绘制数据库中的面==================
  // 根据数据库中数据绘制面
  getDrawActivatePolygon(polygonArr) {
    // 1-1 根据面的Plotid记录有多少个面
    let onlyPlotid = this.distinguishPolygonId(polygonArr)
    // 1-2根据Plotid来画面
    onlyPlotid.forEach(onlyPlotidItem => {
      // 1-3 把数据库同一Plotid的点数据放入此数组
      let polygon = []
      polygonArr.forEach(polygonElement => {
        if (polygonElement.plotid === onlyPlotidItem) {
          polygon.push(polygonElement)
        }
      })

      // 1-4 pointLinePoints用来存构成面的点实体
      let pointLinePoints = []
      // console.log("交换后:", polygon);
      for (let i = 0; i < polygon.length; i++) {``
        // 转换为Cartesian3坐标
        let cartographic = Cesium.Cartographic.fromDegrees(
            parseFloat(polygon[i].longitude),
            parseFloat(polygon[i].latitude),
            parseFloat(polygon[i].height)
        );

        let cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

        pointLinePoints.push(cartesian);
        // 添加调试输出
        this.viewer.entities.add({
          // id: this.initId + "Point" + this.lastItem,
          //这里的id可能要改一下，有可能会出现id重复的问题，具体还得看看
          position: cartesian,
          point: {
            // color: Cesium.Color.SKYBLUE,
            // pixelSize: 10,
            // outlineColor: Cesium.Color.YELLOW,
            // outlineWidth: 3,
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          }
        });

        this.viewer.entities.add({
          // id: polygon[0].plotid,
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(pointLinePoints), false),
            material: polygon[0].img,
            stRotation: Cesium.Math.toRadians(polygon[0].angle),
            clampToGround: true,
          },
          properties: {
            pointPosition: this.positions,
            linePoint: this.polygonPointEntity,
          }
        });

      }
    })
  }

  // 在重复的drwaid中获取所有面的唯一drwaid
  distinguishPolygonId(polygonArr) {
    let polygonIdArr = []
    polygonArr.forEach(element => {
      if (!polygonIdArr.includes(element.plotid)) {
        polygonIdArr.push(element.plotid)
      }
    })
    // console.log("数据库",polygonIdArr)
    return polygonIdArr
  }


  //======================绘制面方法================

  /*添加事件监听器*/
  addEventListeners() {
    this.handler.setInputAction((click) => this.leftClickEvent(click), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction((click) => this.rightClickEvent(click), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.setInputAction(() => this.leftReleaseEvent(), Cesium.ScreenSpaceEventType.LEFT_UP);
    this.handler.setInputAction((movement) => this.mouseMoveEvent(movement), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  /*去除事件监听器*/
  removeEventListeners() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  leftReleaseEvent() {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedPointIndex = -1;
      if (this.type === "选中面" && this.selectPoint == null){
        this.polygonPointEntity.forEach((pointEntity, index) => {
          if (this.newDraggedEntityPosition[index]) {
            pointEntity.position._value = this.newDraggedEntityPosition[index];
          }
        });
        this.drawPolygon();
        this.waitingDraggedEntityPosition = []; // 清空选中实体的位置信息
        this.newDraggedEntityPosition = null; // 清空鼠标移动的位置
        this.diffEntityWithMouse = []; // 清空选中实体与鼠标位置信息的差异
        this.waitingDraggedEntity = null;
        this.centerPoint = this.getCenter();
        this.type = null;
        this.lastTimeSelected = 1;
      }else if(this.selectPoint){
        if (this.type === "标绘面"){
          this.dynamicRotation(this.draggedPoint._id,this.afterDraggedPoint)
          this.draggedPoint = null;
          this.selectPoint = null;
          this.type = null;
        }else {
          // this.positions[this.draggedPointIndex] = this.draggedPoint.position._value;
          //这里的这个函数没有用到，以后可能会用到，就是websocket上传那里会用到
          // this.updatePointPosition(this.draggedPointIndex, this.draggedPoint.position._value);
          if (this.positions.length > 2) {
            this.drawPolygon();
          }
        }

      }
      this.enableCameraControls()
      // 重新计算面积并显示
      let area = this.area(this.positions);
      // document.getElementById("area").innerHTML = area.toFixed(2);

      // 更新实体个数
      this.updateEntityCount();
    }
  }

  getCenter(){
    let totalX = 0, totalY = 0, totalZ = 0;
    let count = this.polygonPointEntity.length;
    this.polygonPointEntity.forEach(pointEntity => {
      let position = pointEntity.position._value;
      totalX += position.x;
      totalY += position.y;
      totalZ += position.z;
    });

    let centerX = totalX / count;
    let centerY = totalY / count;
    let centerZ = totalZ / count;

    return {x: centerX, y: centerY, z: centerZ};
  }

  //动态旋转正方形函数
  dynamicRotation(id,afterDraggedPoint){
    //这里是移动后拖拽的点 ，可以获取到移动后的点
    //这里要调用那个角度的函数，获取一下要转动的角度
    //然后调用调用函数 计算另外三个顶点的坐标的函数
    // console.log("afterDraggedPoint",afterDraggedPoint)
    if (this.type === "标绘面"){
      let angle = this.calculationAngle(this.centerPoint, afterDraggedPoint)
      let index = this.polygonPointEntity.findIndex(entity => entity._id === id);
      let afterAngles = [angle, angle + 90, angle + 180, angle + 270];
      let rotationAngle = 0;
      if (index === 0){
        rotationAngle = angle - 135
      }else if(index === 1){
        rotationAngle = angle - 225
      }else if(index === 2){
        rotationAngle = angle - 315
      }else {
        rotationAngle = angle - 45
      }
      let vertices = this.calculateSquareVertices(this.centerPoint, id,afterDraggedPoint)
      // console.log("vertices",vertices[0].position)
      // 更新顶点位置
      // 如果数组二当前元素有id
      if (vertices[0].id !== null) {
        // 找到数组一中对应id的元素
        let foundIndex = this.polygonPointEntity.findIndex(item => item._id === vertices[0].id);
        if (foundIndex !== -1) {
          //动态更新正方形点的位置
          this.updateVertexPositions(foundIndex, vertices,rotationAngle);
        }
      }
    }
  }

  //动态更新正方形点的位置
  updateVertexPositions(baseIndex, vertices,angle){
    this.angle = -angle;
    for (let i = 0; i < 4; i++) {
      let currentIndex = (baseIndex + i) % 4;
      this.polygonPointEntity[currentIndex]._position._value = vertices[i].position;
      this.positions[currentIndex] = vertices[i].position;
      this.drawPolygon();
    }
    // console.log("this.polygonPointEntity[2]",this.polygonPointEntity[2])
    // console.log("this.positions",this.positions)
    // console.log("vertices",vertices)
  };

  //更新点的位置
  updatePointPosition(index, position) {
    let pointEntity = this.polygonPointEntity[index];
    if (pointEntity) {
      pointEntity.position = position;
    }
  }
  //添加点实体
  drawPoint(position) {
    return this.viewer.entities.add({
      //这里的id可能要改一下，有可能会出现id重复的问题，具体还得看看
      id: this.timestampToTime(this.initId) + "Point" + this.lastItem,
      position: position,
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      }
    });
  }

  addPoint(position) {
    this.positions.push(position);
    let point = this.drawPoint(position);
    this.polygonPointEntity.push(point);
    this.lastItem++;
    if (this.positions.length > 2) {
      this.drawPolygon();
    }
  }

  //画出面实体
  drawPolygon() {
    if (this.polygonEntity) {
      //这里是如果面实体存在，那么就不重新创建实体，只是修改实体，防止浪费资源
      this.polygonEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.positions), false);
      this.polygonEntity.properties.pointPosition = this.positions;
      this.polygonEntity._polygon._stRotation._value = Cesium.Math.toRadians(this.angle);
    }else {
      this.angle = 0;
      if (this.type === "标绘面"){
        this.imgMaterial = new Cesium.ImageMaterialProperty({
          image: this.img
        });
      }else if(this.type === "量算面积"){
        this.imgMaterial = Cesium.Color.YELLOW.withAlpha(0.5);
      }
      let currentDate = new Date();
      this.polygonEntity = this.viewer.entities.add({
        id: currentDate.getTime(),
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.positions), false),
          material: this.imgMaterial,
          stRotation: Cesium.Math.toRadians(this.angle),
          clampToGround: true,
        },
        properties: {
          pointPosition: this.positions,
          linePoint: this.polygonPointEntity,
        }
      });

    }
  }

  convertToMeters(distanceText) {

    // 正则表达式匹配数值和单位
    let kmMatch = distanceText.match(/(\d+(\.\d+)?)\s?km/i);
    let mMatch = distanceText.match(/(\d+(\.\d+)?)\s?m/i);

    let valueInMeters;

    if (kmMatch) {
      // 如果匹配到 "km"，提取数值并转换为米
      let valueInKm = parseFloat(kmMatch[1]);
      valueInMeters = valueInKm * 1000;
    } else if (mMatch) {
      // 如果匹配到 "m"，提取数值
      valueInMeters = parseFloat(mMatch[1]);
    } else {
      // 如果不匹配任何已知单位，则抛出错误
      throw new Error("Unsupported distance unit");
    }
    return valueInMeters;
  }
  /*绘制面图层*/
  drawSquare(position) {
    // 获取距离图例的长度
    let distanceLegendElement = document.querySelector('.distance-legend-label');

    // let distanceText = distanceLegendElement ? distanceLegendElement.textContent : '5000';
    let distanceText = distanceLegendElement.textContent ;

    // let distanceValue = parseFloat(distanceText);
    let distanceValue = this.convertToMeters(distanceText);

    // 定义正方形的边长（单位：米），根据距离图例的长度进行调整
    // let squareSideLength = isNaN(distanceValue) ? 50 : distanceValue; // 如果距离值不可用，使用默认值 50 米
    let squareSideLength = distanceValue; // 如果距离值不可用，使用默认值 50 米

    // 获取点击位置的经纬度坐标
    let cartographic = Cesium.Cartographic.fromCartesian(position);

    // 计算正方形的四个顶点

    // ================改为了顺时针生成点，因为后面获取旋转后坐标的函数是顺时针生成的

    let northWest = Cesium.Cartesian3.fromRadians(
        cartographic.longitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
        cartographic.latitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
    );
    this.addPoint(northWest)
    let southWest = Cesium.Cartesian3.fromRadians(
        cartographic.longitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
        cartographic.latitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
    );
    this.addPoint(southWest)
    let southEast = Cesium.Cartesian3.fromRadians(
        cartographic.longitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
        cartographic.latitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
    );
    this.addPoint(southEast)
    let northEast = Cesium.Cartesian3.fromRadians(
        cartographic.longitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
        cartographic.latitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
    );
    this.addPoint(northEast)
  }

  /*启用点拖拽功能*/
  enableVertexDragging() {
    if (this.type === "选中面" && this.type !== "量算面积") {
      let that = this;
      // 移除之前的 LEFT_DOWN 事件回调
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.viewer.screenSpaceEventHandler.setInputAction(function(e) {
        // 清空拖动状态和差异数组
        that.newDraggedEntityPosition = [];
        that.diffEntityWithMouse = [];

        // 获取鼠标点击位置
        let ray = viewer.camera.getPickRay(e.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        that.waitingDraggedEntity = viewer.scene.drillPick(e.position, 1)[0];

        if (that.waitingDraggedEntity) {
          // 获取点实例的位置
          that.waitingDraggedEntityPosition = that.waitingDraggedEntity.id._properties._pointPosition._value;

          // 记录选中实体与鼠标位置信息的差异
          that.waitingDraggedEntityPosition.forEach((item) => {
            that.diffEntityWithMouse.push({
              x: item.x - position.x,
              y: item.y - position.y,
              z: item.z - position.z
            });
          });

          // 禁用相机控制，防止在拖动点时地图也被拖动
          that.disableCameraControls();
          that.isDragging = true;
          that.isEditing = true;
          if (that.type !== "量算面积") {
            that.type = "选中面";
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.newDraggedEntityPosition = [];
      this.isDragging = true;
      if (this.selectPointAfterSquare) {
        this.isDragging = false;
      }
    } else {
      // 遍历多边形点实体数组，为每个点实体添加鼠标事件
      // console.log("polygonPointEntity", this.polygonPointEntity)
      this.polygonPointEntity.forEach((pointEntity, index) => {
        pointEntity.point.color = Cesium.Color.RED; // 更改顶点颜色以示区别
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.vertexHandlers.push(handler);

        handler.setInputAction((click) => {
          let pickedObject = this.viewer.scene.pick(click.position);

          if (Cesium.defined(pickedObject) && pickedObject.id === pointEntity) {
            this.isDragging = true;
            this.draggedPointIndex = index;
            this.draggedPoint = pointEntity;
            this.selectPoint = pointEntity;

            if (this.type !== "量算面积") {
              this.type = "标绘面";
            }
            if (this.selectPointAfterSquare) {
              this.type = "量算面积";
            }
            this.beforeDraggedPoint = this.draggedPoint;
            this.disableCameraControls();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      });
    }
  }

  /*计算拖拽后正方形四个点坐标*/
  calculateSquareVertices = (center, id, afterDraggedPoint) => {
    // 将Cartesian3坐标转换为Cartographic坐标
    let centerCartographic = Cesium.Cartographic.fromCartesian(center);
    let draggedPointCartographic = Cesium.Cartographic.fromCartesian(afterDraggedPoint);

    // 创建一个椭球体大地测量对象，用于计算两个地理位置之间的距离
    let geodesic = new Cesium.EllipsoidGeodesic(centerCartographic, draggedPointCartographic);

    // 获取两点之间的表面距离（地表两点曲线距离）
    let distance = 2 * geodesic.surfaceDistance; // 中心点与拖拽点的距离

    // 计算对角线的点（拖拽点的对称点）
    let dx = afterDraggedPoint.x - center.x;
    let dy = afterDraggedPoint.y - center.y;
    let dz = afterDraggedPoint.z - center.z;

    let oppositePoint = new Cesium.Cartesian3(center.x - dx, center.y - dy, center.z - dz);

    // 计算拖拽点到中心点的单位向量
    let draggedVector = new Cesium.Cartesian3(dx, dy, dz);
    let draggedVectorLength = Cesium.Cartesian3.magnitude(draggedVector);
    let unitVector = Cesium.Cartesian3.divideByScalar(draggedVector, draggedVectorLength, new Cesium.Cartesian3());

    // 计算四个顶点的坐标
    let vertices = [
      { id: id, position: afterDraggedPoint },
    ];
    let orthoVector = new Cesium.Cartesian3(-unitVector.y, unitVector.x, 0); // 垂直于 unitVector 的向量

    // 计算剩余两个顶点
    let midPoint1 = new Cesium.Cartesian3(
        center.x + orthoVector.x * distance,
        center.y + orthoVector.y * distance,
        center.z
    );

    let midPoint2 = new Cesium.Cartesian3(
        center.x - orthoVector.x * distance,
        center.y - orthoVector.y * distance,
        center.z
    );


    vertices.push({ id: null, position: midPoint1 });
    vertices.push({ id: null, position: oppositePoint });
    vertices.push({ id: null, position: midPoint2 });

    // 返回计算得到的正方形的四个顶点笛卡尔坐标
    return vertices;
  };

  /*计算选中的唯一点相较于中心点旋转后的角度，始终计算极角，问题（不能动态旋转）*/
  calculationAngle(center, other) {
    // 将笛卡尔坐标转换为地理坐标（经纬度）
    let centerCartographic = Cesium.Cartographic.fromCartesian(center);
    let otherCartographic = Cesium.Cartographic.fromCartesian(other);//拖拽后的点

    // 获取点A和点B的经纬度坐标（单位：度）
    let lonA = centerCartographic.longitude;
    let latA = centerCartographic.latitude;
    let lonB = otherCartographic.longitude;
    let latB = otherCartographic.latitude;

    // 计算AB向量
    let dLon = lonB - lonA;
    let dLat = latB - latA;

    // 计算AB向量的角度
    let angle = Math.atan2(dLat, dLon); // 这里使用 atan2

    // 将弧度转换为角度，并确保角度在0到360度之间
    let angleDegrees = Cesium.Math.toDegrees(angle);
    if (angleDegrees < 0) {
      angleDegrees += 360;
    }

    return angleDegrees; // 确保返回计算结果
  }

  /*更新实体个数*/
  updateEntityCount() {
    let count = 0;
    let posArr = [];

    // 将多边形顶点转换为经纬度
    this.positions.forEach((item, index) => {
      let cartographicPosition = Cesium.Cartographic.fromCartesian(item);
      posArr[index] = [Cesium.Math.toDegrees(cartographicPosition.longitude), Cesium.Math.toDegrees(cartographicPosition.latitude)];
    });

    // 遍历场景中的实体，判断是否在多边形内
    for (let i = 0; i < this.viewer.entities.values.length; i++) {
      if (this.viewer.entities.values[i]._billboard !== undefined) {
        let posCartographicPosition = Cesium.Cartographic.fromCartesian(this.viewer.entities.values[i]._position._value);
        let pos = {
          lon: Cesium.Math.toDegrees(posCartographicPosition.longitude),
          lat: Cesium.Math.toDegrees(posCartographicPosition.latitude)
        };

        if (this.isPointInPolygon(posArr, pos)) {
          count++;
        }
      }
    }

    // 更新显示的实体个数
    document.getElementById("ispointIcon").innerHTML = count;

    // 更新类中的实体个数属性
    this.entityCount = count;
  }

  /*判断点是否在多边形内部*/
  isPointInPolygon(polyPoints, pt) {
    let c = false;
    for (let i = 0, l = polyPoints.length, j = l - 1; i < l; j = i, i++) {
      let spi = polyPoints[i];
      let spj = polyPoints[j];
      if (
          ((spi[1] > pt.lat) !== (spj[1] > pt.lat)) &&
          (pt.lon < (spj[0] - spi[0]) * (pt.lat - spi[1]) / (spj[1] - spi[1]) + spi[0])
      ) {
        c = !c;
      }
    }
    return c;
  }

  /*拖动结束后启用相机控制 */
  enableCameraControls(){
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
    this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    this.viewer.scene.screenSpaceCameraController.enableLook = true;
  }

  /*拖动结束后结束相机控制 */
  disableCameraControls() {
    this.viewer.scene.screenSpaceCameraController.enableRotate = false;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
    this.viewer.scene.screenSpaceCameraController.enableZoom = false;
    this.viewer.scene.screenSpaceCameraController.enableTilt = false;
    this.viewer.scene.screenSpaceCameraController.enableLook = false;
  }

  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

