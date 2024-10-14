import * as Cesium from 'cesium'
import {CustomShader} from "cesium";
let tz = ref(0)
let rz = ref(0)
let originRz = 0
let originTz = 0
let opacity = ref(100)
let showArrowValue = false
let showArrowText = ref("显示坐标轴")
let modelStatus = true
let modelStatusContent = ref("隐藏当前模型")
let modelName = ''

let modelInfo = reactive({
    name: null, path: null, rz: null, tz: null, rze: null, tze: null, time: null, modelid: null
})

export function goModel(row) {
    console.log(row,"row")
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

/**
 * 监听地形提供器变化
 * 当地形提供器发生变化时，此方法将被触发
 * 根据modelName的值设置不同的高度，并尝试查找地形
 * 如果地形已加载，则使用一组预设高度；如果地形未加载，则使用另一组预设高度
 * 目前，高度设置和查找地形的方法被注释掉，需要在适当时候启用或移除
 */
export function watchTerrainProviderChanged() {
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
function isTerrainLoaded() {
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

function changeHeight(_tz) {
    transferModel(window.modelObject, 0, 0, _tz, opacity.value)
}

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

