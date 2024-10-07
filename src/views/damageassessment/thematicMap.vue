<template>
    <div>
        <div id="cesiumContainer" class="situation_cesiumContainer">

            <!--      地震列表组件-点击列表“详情”显示专题图列表      -->
            <EarthquakeList
                    @imag-selected="onImagSelected"
                    @selectEq="selectEq"
                    :thematicMapClass="thematicMapClass"
            ></EarthquakeList>

            <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
                 @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
                <img src="../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
                     style="height: 60%;width: 60%;">
            </div>
            <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
                <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
            </div>
        </div>
        <!--    准提图预览组件    -->
        <thematicMapPreview
                @ifShowThematicMapDialog="ifShowDialog"
                :imgshowURL="imgshowURL"
                :imgurlFromDate="imgurlFromDate"
                :imgName="imgName"
                :ifShowMapPreview="ifShowMapPreview"
        ></thematicMapPreview>

    </div>
</template>

<script>
    import * as Cesium from "cesium";
    import CesiumNavigation from "cesium-navigation-es6";
    import {initCesium} from "@/cesium/tool/initCesium.js";
    import {getAllEq} from "@/api/system/eqlist";
    import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
    import yaan from "@/assets/geoJson/yaan.json";
    import {addYaanLayer} from "../../cesium/plot/eqThemes.js";
    import EarthquakeList from "../../components/ThematicMap/earthquakeList.vue";
    import ThematicMapPreview from "../../components/ThematicMap/thematicMapPreview.vue";
    export default {
        name: "damageAssessmentThematicMap",
        components:{
            EarthquakeList,
            ThematicMapPreview
        },
        data() {
            return {
                total: 0,
                pageSize: 10,
                currentPage: 1,
                getEqData: [],
                filteredEqData: [],
                pagedEqData: [],

                selectedTabData: null,
                selectedEqPoint: null,
                historyEqData: [],
                historyEqPoints: [],

                title: "",
                isLeftShow: true,
                isFoldShow: true,
                isFoldUnfolding: false,
                isHistoryEqPointsShow: false,
                isShow: false,
                isshowFaultZone: false, //断裂带显示隐藏
                faultzonelines: [], //断裂带线
                isshowOvalCircle: false, //烈度圈显示隐藏
                OvalCirclelayer: [],

                isshowPersonalCasualty: false,
                PersonalCasualtyNum: 0,
                yaancasual: false,
                yaanitemcasual: [],

                tabs: [],
                currentTab: '震害事件', // 默认选项卡设置为『震害事件』

                listEqPoints: [], // 列表地震点
                area: null,
                // layerVisible: true, // 图层可见性状态
                isshowRegion: true,//行政区划
                RegionLabels: [],


                isshowImagetype: false,
                ifShowMapPreview: false, // 是否预览专题图
                previewImage: false, // 保存预览图片的 URL
                previewImagePath: '',
                imgshowURL:null,
                imgurlFromDate: "",
                imgName:'',
                thematicMapClass: 'DisasterDamageAssessment', // 二三维一体化的专题图
            };
        },
        mounted() {
            this.init();
            this.getEq();
        },

        methods: {
            // 获取地震列表并渲染
            getEq() {
                getAllEq().then((res) => {
                    let resData = res.filter((item) => item.magnitude >= 4.5);
                    let data = resData.map((item) => ({
                        ...item,
                        occurrenceTime: this.timestampToTime(item.occurrenceTime, "full"),
                        magnitude: Number(item.magnitude).toFixed(1),
                        latitude: Number(item.latitude).toFixed(2),
                        longitude: Number(item.longitude).toFixed(2),
                    }));

                    this.getEqData = data;
                    this.filteredEqData = data;
                    this.updatePagedEqData();
                    // console.log("data:", data)
                });
            },

            // 初始化控件等
            init() {
                let viewer = initCesium(Cesium);
                viewer._cesiumWidget._creditContainer.style.display = "none";
                window.viewer = viewer;
                let options = {};
                viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(103.0, 29.98, 500000), // 设置经度、纬度和高度
                });
                options.defaultResetView = Cesium.Cartographic.fromDegrees(
                    103.0,
                    29.98,
                    500000,
                    new Cesium.Cartographic()
                );
                options.enableCompass = true;
                options.enableZoomControls = true;
                options.enableDistanceLegend = true;
                options.enableCompassOuterRing = true;
                options.resetTooltip = "重置视图";
                options.zoomInTooltip = "放大";
                options.zoomOutTooltip = "缩小";
                window.navigation = new CesiumNavigation(viewer, options);
                document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
                    "请输入地名进行搜索";
                document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[0].innerHTML =
                    "影像服务";
                document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[1].innerHTML =
                    "地形服务";

                this.initMouseEvents();
                this.renderQueryEqPoints();
                addYaanLayer()
            },

            // 鼠标事件监听
            initMouseEvents() {
                const faultInfoDiv = document.getElementById('faultInfo');

                // 鼠标移动时设置指针样式
                window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
                    const pickedObject = window.viewer.scene.pick(movement.endPosition);
                    if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
                        document.body.style.cursor = 'pointer';
                    } else {
                        document.body.style.cursor = 'default';
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                // 鼠标点击事件
                window.viewer.screenSpaceEventHandler.setInputAction((click) => {
                    const pickedObject = window.viewer.scene.pick(click.position);

                    // 与断裂带名称div绑定
                    if (Cesium.defined(pickedObject) && pickedObject.id.polyline) {
                        // 获取断裂带的 name 属性
                        const faultName = pickedObject.id.properties.name._value;

                        // 获取点击位置的地理坐标 (Cartesian3)
                        const cartesian = viewer.scene.pickPosition(click.position);
                        if (!Cesium.defined(cartesian)) {
                            return;
                        }

                        // 将地理坐标 (Cartesian3) 转换为屏幕坐标 (二维)
                        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);

                        // 显示 div 并将其定位到点击位置
                        faultInfoDiv.innerHTML = `${faultName}`;
                        faultInfoDiv.style.display = 'block';
                        faultInfoDiv.style.left = screenPosition.x + 'px';
                        faultInfoDiv.style.top = screenPosition.y + 'px';

                        // 监听地图变化，动态更新 div 的位置
                        window.viewer.scene.postRender.addEventListener(() => {
                            const updatedScreenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);
                            if (updatedScreenPosition) {
                                faultInfoDiv.style.left = updatedScreenPosition.x + 'px';
                                faultInfoDiv.style.top = updatedScreenPosition.y + 'px';
                            }
                        });

                    }
                    // 判断点击的是不是地震点
                    else if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
                        pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
                    }
                    // 如果点击其他位置，隐藏所有地震点的标签，并关闭 faultInfoDiv
                    else {
                        this.selectedEqPoint.label._show._value = false;
                        this.listEqPoints.forEach(entity => {
                            entity.label._show._value = false;
                        });
                        this.historyEqPoints.forEach(entity => {
                            entity.label._show._value = false;
                        });
                        // 隐藏 faultInfoDiv
                        faultInfoDiv.style.display = 'none';
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },


            // 分页数据更新
            updatePagedEqData() {
                const start = (this.currentPage - 1) * this.pageSize;
                const end = this.currentPage * this.pageSize;
                this.pagedEqData = this.filteredEqData.slice(start, end);
                // console.log("pagedEqData:", this.pagedEqData)

                // 清除之前的点并重新添加
                viewer.entities.removeAll();
                this.renderQueryEqPoints();
            },


            // 地图渲染查询地震点(根据页码、根据搜索框)
            renderQueryEqPoints() {
                // 清空之前的点
                this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
                this.listEqPoints = []; // 重置 listEqPoints

                this.pagedEqData.forEach(eq => {
                    const entity = window.viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
                        billboard: {
                            image: eqMark,
                            width: 20,
                            height: 20,
                            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
                        },
                        label: {
                            text: this.timestampToTime(eq.occurrenceTime, 'date') + eq.position + eq.magnitude + '级地震',
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            showBackground: true,
                            show: false,
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,  // 左侧对齐
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,   // 底部对齐
                            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                        },
                        id: eq.eqid
                    });
                    yaan.features.forEach((feature) => {
                        let center = feature.properties.center;

                        if (center && center.length === 2) {
                            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
                            let regionlabel = viewer.entities.add(new Cesium.Entity({
                                position: position,
                                label: new Cesium.LabelGraphics({
                                    text: feature.properties.name,
                                    scale: 1,
                                    font: '18px Sans-serif',
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    outlineWidth: 2,
                                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                    fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                                    pixelOffset: new Cesium.Cartesian2(0, 0)
                                })
                            }));
                            this.RegionLabels.push(regionlabel)
                        }
                    })
                    this.listEqPoints.push(entity);  // 保存实体到 listEqPoints
                });
            },

            locateEq(eq) {
                this.pickEqPoint(eq);
                this.renderQueryEqPoints();

                // 提取地震的经纬度
                const longitude = parseFloat(eq.longitude);
                const latitude = parseFloat(eq.latitude);

                // 设置相机的飞行动作
                window.viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000), // 目标位置
                    orientation: {
                        heading: Cesium.Math.toRadians(0.0), // 朝向 (0度)
                        pitch: Cesium.Math.toRadians(-90.0), // 俯仰角 (-45度)
                        roll: Cesium.Math.toRadians(0.0) // 翻滚角 (0度)
                    },
                });
            },

            toTab(eq) {
                this.currentTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
                if (this.currentTab !== '震害事件') {

                    // 查找与选项卡名称匹配的地震数据
                    this.selectedTabData = this.getEqData.find(
                        eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.currentTab
                    );
                    // 如果找到对应数据，调用定位函数
                    if (this.selectedTabData) {
                        this.selectEqPoint();
                    }
                }
            },

            // 分页改变事件
            handleCurrentChange(page) {
                this.currentPage = page;
                this.updatePagedEqData();
            },

            back() {
                this.currentTab = '震害事件';
                this.selectedTabData = null;
                this.removeData()
            },

            // 模糊匹配地震时间、位置和震级
            filterEq() {
                if (this.title) {
                    this.filteredEqData = this.getEqData.filter((eq) => {
                        const dateStr = this.timestampToTime(eq.occurrenceTime, 'date');
                        const positionStr = eq.earthquakeName;
                        const magnitudeStr = eq.magnitude;
                        return (
                            dateStr.includes(this.title) ||
                            positionStr.includes(this.title) ||
                            magnitudeStr.includes(this.title)
                        );
                    });
                } else {
                    this.filteredEqData = this.getEqData;
                }
                this.currentPage = 1;
                this.updatePagedEqData();
            },

            pickEqPoint(eq) {
                this.listEqPoints.forEach(entity => {
                    entity.label._show._value = entity._id === eq.eqid;
                    // console.log(entity.label)
                })
            },

            selectEqPoint() {
                // 检查 selectedTabData 是否存在
                if (this.selectedTabData) {
                    // 清空 listEqPoints
                    this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
                    this.listEqPoints = [];

                    // 避免选择同一选项卡时重复生成实体导致重叠
                    window.viewer.entities.remove(this.selectedEqPoint);

                    // 提取 selectedEqPoint
                    this.selectedEqPoint = window.viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(
                            Number(this.selectedTabData.longitude),
                            Number(this.selectedTabData.latitude)
                        ),
                        billboard: {
                            image: eqMark,
                            width: 25,
                            height: 25,
                            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
                        },
                        label: {
                            text: this.timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
                                this.selectedTabData.earthquakeName +
                                this.selectedTabData.magnitude + '级地震',
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            showBackground: true,
                            show: true, // 显示 label
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                        },
                        id: this.selectedTabData.id
                    });

                    // 渲染 selectedEqPoint
                    // console.log("Selected Eq Point:", this.selectedEqPoint);
                } else {
                    console.warn("No selectedTabData available");
                }
            },

            getAssetsFile() {
                this.imgshowURL=new URL(this.imgurlFromDate, import.meta.url).href
            },

            // 地震列表组件传回专题图路径
            onImagSelected(imagData){
                console.log("imagData------------------",imagData)
                this.imgurlFromDate = imagData.path
                this.imgName = imagData.name
                this.ifShowMapPreview = true
                this.getAssetsFile()
            },

            ifShowDialog(val) {
                // console.log("ifShowDialog-----",val)
                this.isshowImagetype = val
                this.ifShowMapPreview = false
            },

            selectEq(eq){
                this.locateEq(eq)
            },

            removeData() {
                this.historyEqPoints = [];
                this.historyEqData = [];
                this.removeEntitiesByType("historyEq")
                this.removeEntitiesByType("faultZone")
                this.removeEntitiesByType("ovalCircle")
                this.isHistoryEqPointsShow = false;
                const faultInfoDiv = document.getElementById('faultInfo');
                faultInfoDiv.style.display = 'none';
            },

            // 跳转至指挥大屏
            navigateToVisualization(thisEq) {
                const path = `/thd?eqid=${thisEq.eqid}`;
                window.open(path, '_blank');
            },

            hidden(hidden) {
                this.isHistoryEqPointsShow = hidden;
                this.isShow = true;
            },

            // 时间戳转换
            timestampToTime(timestamp, format = "full") {
                let dateObj = new Date(timestamp);
                let year = dateObj.getFullYear();
                let month = dateObj.getMonth() + 1;
                let day = dateObj.getDate();
                let hh = dateObj.getHours();
                let mm = dateObj.getMinutes();
                let ss = dateObj.getSeconds();

                // 去掉前导零
                month = month > 9 ? month : month.toString().replace(/^0/, "");
                day = day > 9 ? day : day.toString().replace(/^0/, "");
                hh = hh > 9 ? hh : "0" + hh;
                mm = mm > 9 ? mm : "0" + mm;
                ss = ss > 9 ? ss : "0" + ss;

                if (format === "date") {
                    // 返回仅日期格式
                    return `${year}年${month}月${day}日`;
                } else {
                    // 返回完整的日期时间格式
                    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
                }
            },
            exportCesiumScene(type) {

                if (type == "history") {
                    // this.previewImage ="@/assets/images/DamageAssessment/震区历史地震分布图-专业版-A3-横版.jpg"
                    // this.previewImage ="@/assets/images/DamageAssessment/震区历史地震分布图-专业版-A3-横版.jpg"
                    // console.log("11111111111111111history")
                    // this.previewImage = finalCanvas.toDataURL('震区历史地震分布图-专业版-A3-横版.jpg');
                }
            },


            // 下载图片
            downloadImage() {
                const link = document.createElement('a');
                link.download = '震情伤亡-震情灾情统计表.png';
                link.href = this.previewImage;
                link.click();
                this.previewImage = null;
            },

            // 关闭预览窗口
            closePreview() {
                this.previewImage = null;
            },

        }
    }
</script>

<style scoped lang="less">
  .situation_cesiumContainer {
    height: calc(100vh - 50px) !important;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  // 左侧地震面板
  .eqTable {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 333px;
    height: calc(100% - 50px);
    z-index: 3;
    background-color: #2d3d51;
  }

  // 选项卡
  .tab {
    display: flex;
    width: calc(100% - 30px);
    height: 40px;
    background-color: #2d3d51;
    color: #fff;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .tabItem {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #0d325f;
    height: 40px;
    padding: 0 10px;
    white-space: nowrap;
  }

  .tabItem.active {
    background-color: #409eff;
  }

  .closeIcon {
    margin-left: 10px;
    cursor: pointer;
  }

  // 开关
  .fold {
    position: absolute;
    top: 50px;
    right: 323px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 50px;
    background-color: #2d3d51;
    -webkit-border-top-left-radius: 10px;
    -webkit-border-bottom-left-radius: 10px;
    cursor: pointer;
    z-index: 4;
    transition: width 0.3s ease; /* 宽度过渡动画 */
  }

  .unfold {
    position: absolute;
    top: 50px;
    right: 0;
    width: 30px;
    height: 40px;
    background-color: rgba(48, 65, 86, 0.5);
    cursor: pointer;
    z-index: 2;
    margin: 0;
  }

  // 搜索框
  .query {
    width: calc(100% - 20px);
    margin: 10px;
  }

  // 地震列表
  .eqList {
    position: relative;
    height: 85vh;
    overflow-y: auto;
  }

  .eqCard {
    display: flex;
    height: 110px;
    border-bottom: #0d325f 2px solid;
    cursor: pointer;
  }

  .eqCard:hover {
    background-color: #202933;
    transition: all 0.3s;
  }

  // 圆圈震级
  .eqMagnitude {
    display: flex;
    height: 35px;
    width: 35px;
    margin: 10px;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
  }

  // 地震简要文本信息
  .eqText {
    padding-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }

  .eqTitle {
    display: inline-block;
    max-width: 260px;
    position: relative;
    transform: translateX(0);
    will-change: transform;
    color: #409eff;
    font-size: 15px;
  }

  .eqText .eqTitle:hover {
    transform: translateX(-50%);
    transition: transform 5.0s ease;
  }

  .eqText .eqTitle {
    transition: none;
  }

  // 详情按钮
  .eqTapToInfo {
    position: absolute;
    right: 10px;
    margin-top: 70px;
    width: 60px;
    height: 30px;
    border: #0d325f 1.5px solid;
    border-radius: 5px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .eqTapToInfo:hover {
    border: #2aa4f1 1.5px solid;
    color: #2aa4f1;
    transition: all 0.3s;
  }

  // 分页容器
  .pagination {
    position: absolute;
    bottom: 0;
    width: 327px;
    background-color: #2d3d51;
    border: 2px solid #FFFFFF; /* 白色边框 */
  }

  ::v-deep .pagination .el-pagination__total {
    color: white;
  }

  // 指定地震面板
  .thisEq {
    height: 100%;
    overflow: auto;
  }

  .eqInfo {

  }

  .return {
    width: 40px;
    height: 25px;
    border: #fff 1px solid;
    border-radius: 8px;
    font-size: 12px;
    margin-left: auto; /* 使按钮靠右 */
  }

  .return:hover {
    border-color: #409eff;
    color: #409eff;
    transition: all 0.3s;
  }



  .themes:hover {
    background-color: #409eff;
    border: none;
  }

  .themes.active {
    background-color: #409eff;
    border: none;
  }

  // 大屏展示
  .eqVisible {
    display: flex;
    height: 80px;
    width: 100%;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .toVisible {
    margin-bottom: 0;
    width: 200px;
    height: 50px;
    border: #fff 1px solid;
    border-radius: 25px;
    font-size: 18px;
  }

  .toVisible:hover {
    color: #409eff;
    border-color: #409eff;
    transition: all 0.3s;
  }

  // 底部面板
  .panel {
    position: absolute;
    width: 100%;
    height: 250px;
    bottom: 0;
    z-index: 2;
  }

  .showPanel {
    position: absolute;
    left: 10px;
    bottom: 0;
    width: 120px;
    height: 40px;
    background-color: #2d3d51;
    -webkit-border-top-left-radius: 10px;
    -webkit-border-top-right-radius: 10px;
    z-index: 2;
  }

  .showPanel:hover {
    color: #2aa4f1;
    transition: all 0.3s;
  }


  ::v-deep .el-divider__text.is-left {
    background-color: #2d3d51;
    color: #fff;
    font-size: 20px;
  }

  h4, p {
    color: #fff;
  }

  p {
    font-size: 14px;
  }

  // 滚动条样式
  ::-webkit-scrollbar-thumb {
    background-color: #2980b9;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #3498db;
  }

  ::-webkit-scrollbar-track {
    background-color: #2d3d51;
  }

  // 公共按钮，居中与字体颜色
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  span {
    color: #fff;
  }


  .layers {
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 4;
  }

  .layer {
    width: 25px;
    height: 25px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  ::v-deep .el-scrollbar {
    background-color: #2d3d51;
  }

  ::v-deep .el-table__header-wrapper {
    background-color: #2d3d51;
  }

  ::v-deep .el-table__inner-wrapper::before {
    display: none;
  }

  :deep(.cesium-baseLayerPicker-dropDown-visible) {
    z-index: 100 !important;
    background-color: #2b323a;
  }

  :deep(.cesium-baseLayerPicker-dropDown) {
    right: -5px !important;
  }

  ::v-deep .compass {
    position: absolute;
    top: 20px;
    left: 20px;
  }

  ::v-deep .navigation-controls {
    position: absolute;
    top: 120px;
    left: 53px;
  }

  .PersonalCasualty {
    position: absolute;
    z-index: 20;
    background-color: #2b323a;
    width: 17%;
    height: 50%;
    top: 7.5%;
    right: 22%;
  }

  .preview-container {
    position: absolute;
    top: 50%;
    left: 40%;
    width: 55%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

  }

  .preview-image {
    max-width: 100%;
    height: auto;
  }

  .preview-buttons {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .download-button,
  .cancel-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
  }

  .download-button:hover,
  .cancel-button:hover {
    background-color: #2980b9;
  }

  /* 确保按钮显示在图片的下方正中央 */
  .preview-buttons {
    justify-content: center;
    margin-top: 10px;
  }
</style>
