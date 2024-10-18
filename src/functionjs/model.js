import * as Cesium from 'cesium'
import {CustomShader} from "cesium";
let tz = ref(0)
let rz = ref(0)
let originRz = 0
let originTz = 0
let opacity = ref(100)
let modelStatus = true
let modelStatusContent = ref("隐藏当前模型")
let modelName = ''

let modelInfo = reactive({
    name: null, path: null, rz: null, tz: null, rze: null, tze: null, time: null, modelid: null
})
/**
 * 监听地形提供器变化
 * 当地形提供器发生变化时，此方法将被触发
 * 根据modelName的值设置不同的高度，并尝试查找地形
 * 如果地形已加载，则使用一组预设高度；如果地形未加载，则使用另一组预设高度
 * 目前，高度设置和查找地形的方法被注释掉，需要在适当时候启用或移除
 */
export function watchTerrainProviderChanged() {
    // console.log("watchTerrainProviderChanged")
    window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
        if (isTerrainLoaded()) {
            changeHeight(modelInfo.tze)
            tz.value = modelInfo.tze
            findModel()
        } else {
            changeHeight(modelInfo.tz)
            tz.value = modelInfo.tz
            findModel()
        }
    });
}

//查看模型
export function goModel(row) {
    console.log(row,"row in js")
    modelInfo.name = row.name
    modelInfo.path = row.path
    modelInfo.tz = row.tz
    modelInfo.rz = row.rz
    modelInfo.time = row.time
    modelInfo.modelid = row.modelid
    modelInfo.tze = row.tze
    modelInfo.rze = row.rze
    selectModel(row.path)
}
//找到模型
export function findModel() {
    if (checkModelLoad()) {
        console.log("checkModelLoad")
        if (window.modelObject instanceof Cesium.Cesium3DTileset) {
            window.viewer.zoomTo(window.modelObject)
        } else if (window.modelObject instanceof Cesium.Model) {
            let origin = new Cesium.Cartesian3(0, 0, 1000)
            Cesium.Matrix4.multiplyByPoint(window.modelObject.modelMatrix, origin, origin)
            window.viewer.camera.zoomTo({
                destination: origin,
                orientation: {
                    // 指向
                    heading: 6.283185307179581,
                    // 视角
                    pitch: -1.5688168484696687,
                    roll: 0.0
                }
            });
        }
    }
}

//坐标轴
export function showArrow(showArrowValue) {
    console.log("showArrow showArrowValue",showArrowValue)
    viewer.entities.removeAll()
    if (!showArrowValue) {
        let origin = window.modelObject.boundingSphere.center
        const localToWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        let localX = new Cesium.Cartesian3(100, 0, 0)
        let localY = new Cesium.Cartesian3(0, 100, 0)
        let localZ = new Cesium.Cartesian3(0, 0, 100)
        let localToWorldX = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, localX, new Cesium.Cartesian3)
        let localToWorldY = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, localY, new Cesium.Cartesian3)
        let localToWorldZ = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, localZ, new Cesium.Cartesian3)
        viewer.entities.add({
            name: "localX",
            position: localToWorldX,
            polyline: {
                positions: [origin, localToWorldX],
                width: 25,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
            },
            label: {
                text: 'X轴 正东方向',
                font: '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9)
            }
        });
        viewer.entities.add({
            name: "localY",
            position: localToWorldY,
            polyline: {
                positions: [origin, localToWorldY],
                width: 25,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
            },
            label: {
                text: 'Y轴 正北方向',
                font: '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9)
            }
        });
        viewer.entities.add({
            name: "localZ",
            position: localToWorldZ,
            polyline: {
                positions: [origin, localToWorldZ],
                width: 25,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW),
            },
            label: {
                text: 'Z轴 垂直地面',
                font: '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9)
            }
        });
    }
}
//隐藏模型
export function hide(modelStatus) {
    if (modelStatus) {
        window.modelObject.show = false
    } else {
        window.modelObject.show = true
    }
}



/**
 * @Description: 调用模型更改函数更改高度
 * @author White Mo
 * @date 2024/3/22
 */
export function changeHeight(_tz) {
    transferModel(window.modelObject, 0, 0, _tz, opacity.value)
}
/**
 * @Description: 调用模型更改函数绕Z轴旋转
 * @author White Mo
 * @date 2024/3/22
 */
export function changeRotationZ(rz) {
    rotationModel(window.modelObject, rz)
}
/**
 * @Description: 调用模型更改函数更改透明度
 * @author White Mo
 * @date 2024/3/22
 */
export function changeOpacity(_opacity) {
    transferModel(window.modelObject, 0, 0, tz.value, _opacity)
}


function selectModel(modelName) {
    remove3dData()
    initModel(modelName)
    // window.viewer.zoomTo(
    //     window.modelObject
    // )
    window.viewer.zoomTo(window.modelObject)
    // modelStatus = true
    // modelStatusContent.value = "隐藏当前模型"
}

function remove3dData() {
    window.viewer.scene.primitives.remove(window.modelObject)
    window.modelObject = null
}
/**
 * @Description:初始化加载模型并贴地
 * @author White Mo
 * @date 2024/3/25
 */
function initModel(modelName) {

    let baseURL = import.meta.env.VITE_APP_API_URL

    const customShader = new CustomShader({
        lightingModel: 0
    })

    const tileset = new Cesium.Cesium3DTileset({
        url: baseURL + "/geoserver/www/" + modelName + "/tileset.json",
        loadSiblings: true,
        show: true,
        maximumScreenSpaceError: 64,//默认16，值越大经度越小
        maximumMemoryUsage: 3000,//可用于缓存瓦片的最大GPU内存量（以MB为单位）
        skipLevelOfDetail: true,
        preferLeaves: true,
        customShader: customShader
    });

    //如果遇到url中特殊字符+问题，前往node_modules\cesium\Source\ThirdParty\uri.js修改'%2B': '+'为'%2B': '%2B',禁止将json中的%2B转为+，因为geoserver无法识别+路径
    window.modelObject = tileset
    tileset.zIndex = -1;
    tileset.readyPromise.then(function () {
        window.viewer.scene.primitives.add(window.modelObject);
        console.log("模型已加载")
        if (isTerrainLoaded()) {
            changeHeight(modelInfo.tze)
            tz.value = modelInfo.tze
            findModel()
        } else {
            // tz.value = modelInfo.tz
            // changeHeight(modelInfo.tz)
            // findModel()
            const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);//获取模型高度
            tz.value = 20 - Math.trunc(cartographic.height)//高度取整
            transferModel(tileset, 0, 0, tz.value, 0, 0, 0, 1, 1)//模型贴地
            console.log(tz.value, Math.trunc(cartographic.height), 123)
        }
    })

}

/**
 * @Description: 模型绕垂直地面的Z轴旋转,先将模型平移到地心，然后将局部坐标Z轴与世界坐标Z轴对齐，进行旋转，再恢复原本Z轴朝向，平移回原位置   矩阵乘法顺序为T2R2RR1T1M0
 * @author White Mo
 * @date 2024/3/26
 */
function rotationModel(tileset, rz) {

    if (!checkModelLoad()) {
        return
    }
    const origin = tileset.boundingSphere.center;
    console.log("初始世界坐标", origin)
    const localToWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);//获取到以模型中心为原点,Z轴垂直地表的局部坐标系的变换矩阵，左乘此矩阵可以将局部坐标变换为世界坐标
    const originMatrix = tileset.modelMatrix//贴地变换矩阵或者初始变换矩阵M0
    console.log("当前坐标变换矩阵", localToWorldMatrix)
    const backToEarthCenter = new Cesium.Cartesian3(-origin.x, -origin.y, -origin.z)//回到地心位移量
    let backToEarthCenterMatrix = Cesium.Matrix4.fromTranslation(backToEarthCenter);//回到地心变换矩阵
    Cesium.Matrix4.multiply(backToEarthCenterMatrix, originMatrix, backToEarthCenterMatrix)//贴地变换矩阵左乘回到地心矩阵 T1M0
    console.log("回到地心变换矩阵", backToEarthCenterMatrix)
    // 旋转
    //旋转模型使得Z轴与世界坐标Z轴重合
    let arrowX = new Cesium.Cartesian3(1, 0, 0)
    let arrowY = new Cesium.Cartesian3(0, 1, 0)
    let arrowZ = new Cesium.Cartesian3(0, 0, 1)
    let localArrowX = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, new Cesium.Cartesian3(1, 0, 0), new Cesium.Cartesian3)
    let localArrowY = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, new Cesium.Cartesian3(0, 1, 0), new Cesium.Cartesian3)
    let localArrowZ = Cesium.Matrix4.multiplyByPoint(localToWorldMatrix, new Cesium.Cartesian3(0, 0, 1), new Cesium.Cartesian3)
    let angleToXZ = Cesium.Cartesian3.angleBetween(arrowX, new Cesium.Cartesian3(localArrowZ.x, localArrowZ.y, 0))//局部Z轴在世界坐标系XY平面上投影到X轴角度，即绕Z顺时针旋转这个角度可以到XZ平面上
    let angleToZ = Cesium.Cartesian3.angleBetween(localArrowX, arrowZ)//然后绕Y轴顺时针旋转此角度可使得Z轴与世界坐标系Z轴重合
    const rotationAngleToXZ = Cesium.Matrix3.fromRotationZ(-angleToXZ);//此函数正方向为逆时针
    const rotationAngleToZ = Cesium.Matrix3.fromRotationY(-angleToZ);
    let rotationAngleToZMatrix = Cesium.Matrix3.multiply(rotationAngleToZ, rotationAngleToXZ, new Cesium.Matrix3)
    rotationAngleToZMatrix = Cesium.Matrix4.fromRotationTranslation(rotationAngleToZMatrix)
    Cesium.Matrix4.multiply(rotationAngleToZMatrix, backToEarthCenterMatrix, rotationAngleToZMatrix)//局部轴校正R1T1M0


    // 绕Z轴旋转
    console.log(rz - originRz)
    const rotationZ = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rz - originRz)); // 绕Z轴旋转变换矩阵R
    let rotationMatrix = Cesium.Matrix4.fromRotationTranslation(rotationZ)
    Cesium.Matrix4.multiply(rotationMatrix, rotationAngleToZMatrix, rotationMatrix)//RR1T1M0

    // 旋转模型回到原本朝向
    const rotationAngleLeaveXZ = Cesium.Matrix3.fromRotationZ(angleToXZ);
    const rotationAngleLeaveZ = Cesium.Matrix3.fromRotationY(angleToZ);
    let rotationAngleLeaveZMatrix = Cesium.Matrix3.multiply(rotationAngleLeaveXZ, rotationAngleLeaveZ, new Cesium.Matrix3)
    rotationAngleLeaveZMatrix = Cesium.Matrix4.fromRotationTranslation(rotationAngleLeaveZMatrix)// 局部Z轴回到原本方向
    Cesium.Matrix4.multiply(rotationAngleLeaveZMatrix, rotationMatrix, rotationAngleLeaveZMatrix)//R2RR1T1M0

    //回到原来位置
    const backToOriginMatrix = Cesium.Matrix4.fromTranslation(origin);//从地心回归原位T2
    // 应用变换矩阵

    const lastMatrix = Cesium.Matrix4.multiply(backToOriginMatrix, rotationAngleLeaveZMatrix, new Cesium.Matrix4)//最终矩阵T2R2RR1T1M0

    tileset.modelMatrix = lastMatrix
    console.log("结束世界坐标", tileset.boundingSphere.center)
    originRz = rz

}
/**
 * @Description: 使用矩阵更改模型位置，平移模型
 * @author White Mo
 * @date 2024/3/22
 */
function transferModel(model, _tx, _ty, _tz, _opacity) {
    if (!checkModelLoad()) {
        return
    }
    console.log("_opacity", _opacity)
    let tx = _tx ? _tx : 0;
    let ty = _ty ? _ty : 0;
    let tz = _tz ? _tz : 0;
    let opacity = _opacity ? _opacity / 100 : 1

    if (model instanceof Cesium.Cesium3DTileset) {
        const origin = model.boundingSphere.center;
        const m = Cesium.Transforms.eastNorthUpToFixedFrame(origin);//获取到以模型中心为原点,Z轴垂直地表的局部坐标系，以矩阵表示
        //平移
        const tempTranslation = new Cesium.Cartesian3(tx, ty, tz);//平移向量
        const offset = Cesium.Matrix4.multiplyByPoint(m, tempTranslation, new Cesium.Cartesian3(0, 0, 0));//将局部坐标中（0，0，0）平移到（tx,ty,tz)后的世界坐标系中终点坐标
        const translation = Cesium.Cartesian3.subtract(offset, origin, new Cesium.Cartesian3());//终点世界坐标减去原点世界坐标得到世界坐标系下平移向量
        model.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        // 透明度
        model.style = new Cesium.Cesium3DTileStyle({
            color: "color('rgba(255,255,255," + opacity + ")')",
        });
    } else if (model instanceof Cesium.Model) {
        let origin = new Cesium.Cartesian3(0, 0, 0)
        Cesium.Matrix4.multiplyByPoint(model.modelMatrix, origin, origin)
        console.log(Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(origin).latitude))
        console.log(Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(origin).longitude))
        console.log(Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(origin).height))
        const m = Cesium.Transforms.eastNorthUpToFixedFrame(origin);//获取到以模型中心为原点,Z轴垂直地表的局部坐标系，以矩阵表示

        //平移
        const tempTranslation = new Cesium.Cartesian3(tx, ty, tz - originTz);//平移向量
        const offset = Cesium.Matrix4.multiplyByPoint(m, tempTranslation, new Cesium.Cartesian3(0, 0, 0));//将局部坐标中（0，0，0）平移到（tx,ty,tz)后的世界坐标系中终点坐标

        const translation = Cesium.Cartesian3.subtract(offset, origin, new Cesium.Cartesian3());//终点世界坐标减去原点世界坐标得到世界坐标系下平移向量
        Cesium.Matrix4.multiply(Cesium.Matrix4.fromTranslation(translation), model.modelMatrix, model.modelMatrix)
        originTz = tz
    }

}
function checkModelLoad() {
    if (window.modelObject)
        return true
    else
        // $confirm('未加载模型', '提示', {
        //   confirmButtonText: '确定',
        //   type: 'warning',
        //   center: true
        // }).then(function () {
        //   rz = 0
        //   originRz = 0
        //   originTz = 0
        //   opacity = 100
        // })
        return false
}

// cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
// 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
export function isTerrainLoaded() {
    let terrainProvider = window.viewer.terrainProvider;
    if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
    } else if (Cesium.defined(terrainProvider)) {
        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
        // 则表示已经设置了其他地形提供者
        // console.log("地形已加载")
        return true;
    }
    // console.log("地形未加载")
    return false;
}


