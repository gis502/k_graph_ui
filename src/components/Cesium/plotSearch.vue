<template>
  <div class="eqTable" v-show="isLeftShow">
    <div class="eqListContent" v-if="currentTab === '震害事件'">
      <div style="display: flex">
<!--        &lt;!&ndash; 选择框 &ndash;&gt;-->
<!--        <el-select-->
<!--            v-model="selectedPlotType"-->
<!--            placeholder="请选择标绘类型"-->
<!--            class="query"-->
<!--            clearable-->
<!--        >-->
<!--          <el-option-->
<!--              v-for="(type, index) in uniquePlotTypes"-->
<!--              :key="index"-->
<!--              :label="type"-->
<!--              :value="type"-->
<!--          ></el-option>-->
<!--        </el-select>-->
        <!-- 搜索框 -->
        <el-input v-model="title" placeholder="请输入搜索内容" class="query" @input="filterEq" clearable>
        </el-input>
      </div>
      <!-- 地震列表 -->
      <div class="eqList">
        <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="locateEq(eq)">
          <!-- 圆圈震级 -->
          <div style="width: 55px">
            <div class="eqMagnitude">
              <img width="30px" height="30px" :src="'http://localhost:8080/uploads/PlotsPic/' +eq.icon+ '.png?t=' + new Date().getTime()" alt="暂无符号">
            </div>
          </div>

          <!--地震名称与简要信息-->
          <div class="eqText">
                        <span
                            class="eqTitle">
                          {{ eq.plotType}}
                        </span>
            <br/>
            <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
                            标绘类型：{{ eq.plotType }}<br/>
<!--                            参考位置：{{ eq.earthquakeName }}<br/>-->
                            标绘经纬：{{ parseFloat(eq.longitude).toFixed(2) }}°E, {{ parseFloat(eq.latitude).toFixed(2) }}°N<br/>
                            标绘高程：{{ eq.elevation }}米
                        </span>
          </div>

          <!-- 详情按钮 -->
<!--          <div class="eqTapToInfo" @click="toTab(eq)">详情</div>-->
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            small
            layout="total, prev, pager, next"
            :total="filteredEqData.length"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            @current-change="handleCurrentChange"
            style="margin: 0 20px"
        />
      </div>
    </div>


    <!--   指定地震   -->
    <div class="thisEq" v-if="currentTab !== '震害事件' && selectedTabData">
      <div class="eqInfo">
        <div style="height: 30px;display: flex;align-items: center">
          <div class="button return" @click="back()">返回</div>
        </div>
        <div style="height: 10px;background-color: #054576"></div>
        <el-divider content-position="left">
          <!--            <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 15px; width: 15px;">-->
          地震信息
        </el-divider>
        <div style="padding: 1px 20px 10px 20px;color: white">
          <!-- 显示选项卡内容 -->
          <h4>地震名称：{{ selectedTabData.earthquakeName }} {{ selectedTabData.magnitude }}级地震</h4>
          <p>发震时刻：{{ selectedTabData.occurrenceTime }}</p>
          <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
          <p>地震震级：{{ selectedTabData.magnitude }}</p>
          <p>震源深度：{{ selectedTabData.depth }}千米</p>
          <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
        </div>

        <div style="height: 10px;background-color: #054576"></div>

        <el-divider content-position="left"> 专题图</el-divider>

        <div style="height: 420px">
          <div class="eqTheme">
            <div class="button themes history"
                 style="width: 120px;"
                 v-for="item in thematicMapData"
                 :key="item.name"
                 @click="previewMap(item)"> {{ item.name }}
            </div>
          </div>
        </div>

        <div style="height: 10px;background-color: #054576"></div>
        <el-divider content-position="left"> 灾情报告</el-divider>
        <div class="eqTheme">
          <div class="button themes history"
               v-for="item in reportData"
               style="width: 120px;"
               @click="exportCesiumScene(item)"
          >{{ item.name }}
          </div>
        </div>
      </div>
    </div>

  </div>
  <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
       @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
    <img src="../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
         style="height: 60%;width: 60%;">
  </div>
  <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
    <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
  </div>
</template>

<script>
import DisasterDamageAssessmentImageData
  from "../../assets/images/ThematicMap/DisasterDamageAssessment/LuShan/DisasterDamageAssessmentImageData.json"
import TwoAndThreeDIntegrationImageData
  from "../../assets/images/ThematicMap/TwoAndThreeDIntegration/LuShan/TwoAndThreeDIntegrationImageData.json"
import {getExcelPlotInfo, getPlot, getPlotIcon} from '@/api/system/plot'
import * as Cesium from "cesium";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan.json";

export default {
  name: "plotSearch",
  props: {
    eqid: {
      type: String,
      default: null,
    },
  },
  watch: {
    eqid: {
      immediate: true, // 如果 `eqid` 在初始时就有值，立即调用
      handler(newEqid, oldEqid) {
        if (newEqid !== oldEqid && this.eqid !== null) {
          console.log(`eqid 发生变化：${oldEqid} => ${newEqid}`);
          this.getPlot(newEqid); // 响应最新的 eqid 值
        }
      },
    },
  },
  data() {
    return {
      isFoldShow: true,
      isFoldUnfolding: false,
      isLeftShow: true,
      isHistoryEqPointsShow: false,
      selectPlotData: [],
      selectedPlotType: null, // 选择框绑定的值
      uniquePlotTypes:null,


      currentTab: '震害事件', // 默认选项卡设置为『震害事件』
      // 列表地震
      listEqPoints: [],
      // 行政区划
      RegionLabels: [],
      sichuanRegionLabels: [],
      title: "",
      thematicMapData: [],
      reportData: [],
      disasterDamageAssessmentReport: [
        {
          name: '地震灾害预评估与处置工作报告',
          path: '/ThematicMap/DisasterDamageAssessment/LuShan/workReport.pdf'
        }],
      twoAndThreeDIntegrationReport: [
        {
          name: '灾情简报',
          path: '/ThematicMap/TwoAndThreeDIntegration/LuShan/DisasterBriefing.pdf'
        },
        {
          name: '震区基本情况报告',
          path: '/ThematicMap/TwoAndThreeDIntegration/LuShan/BasicSituationReport.pdf'
        }
      ],
      filteredEqData: [],
      pagedEqData: [],
      getEqData: [],
      selectedTabData: null,

      total: 0,
      pageSize: 10,
      currentPage: 1,
      selectedEqPoint: '',

    }
  },
  mounted() {
    this.fetch()
    this.getPlot(this.eqid)
  },
  methods: {
    // 根据父组件传值来判断调用哪些专题图
    fetch() {
      if (this.thematicMapClass === 'DisasterDamageAssessment') {
        this.thematicMapData = DisasterDamageAssessmentImageData
        this.reportData = this.disasterDamageAssessmentReport
      } else {
        this.thematicMapData = TwoAndThreeDIntegrationImageData
        this.reportData = this.twoAndThreeDIntegrationReport
      }
    },
    exportCesiumScene(item) {
      if (item.path) {
        const link = document.createElement('a');
        link.href = item.path;
        link.download = item.name; // 指定下载的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    getAssetsFile() {
      this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
    },
    // 获取地震列表并渲染
    getPlot(eqid) {
      getPlot({eqid}).then((res) => {
        console.log("log",res)
        this.selectPlotData = res
        this.filteredEqData = res;
        this.uniquePlotTypes = [...new Set(res.map((item) => item.plotType))];
        console.log(this.uniquePlotTypes,"uniquePlotTypes")
        // 提取并去重 plottype 数据
        this.updatePagedEqData();
        // console.log("data:", data)
      });
    },
    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      // viewer.entities.removeAll();
      // this.renderQueryEqPoints();
    },

    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      // this.eqThemes.show.isshowOvalCircle = false

      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = [];

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
            text: this.timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
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
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);
      });
    },


    locateEq(eq) {
        // 提取标绘的经纬度
        const longitude = parseFloat(eq.longitude);
        const latitude = parseFloat(eq.latitude);
      // 飞行动画持续时间（秒）
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            longitude, latitude,
            5000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        },
        duration: 3 // 飞行动画持续时间（秒）
      });

    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.selectPlotData.filter((eq) => {
          console.log("eq",eq)
          // const dateStr = this.timestampToTime(eq.occurrenceTime, 'date');
          const positionStr = eq.plotType;
          const magnitudeStr = eq.magnitude;
          const drawtype = eq.drawtype;
          return (
              drawtype.includes(this.title) ||
              positionStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.selectPlotData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    // 将选中的专题图信息传给父组件
    // previewMap(item) {
    //   this.$emit('imag-selected', item);
    // },

    back() {
      this.currentTab = '震害事件';
      this.selectedTabData = null;
      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
          103.0,
          29.98,
          500000
      );
      viewer.camera.flyTo({destination: position,})

      // this.removeData()
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

    selectEqPoint() {
      if (this.selectedTabData) {

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
            show: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });
      }
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
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
  }
}
</script>

<style scoped>
.eqTable {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 333px;
  height: calc(100% - 50px);
  z-index: 100;
  background-color: #2d3d51;
}

.query {
  width: calc(100% - 20px);
  margin: 10px;
}

.eqList {
  position: relative;
  height: calc(85vh - 88px);
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

.pagination {
  position: absolute;
  bottom: 0;
  width: 333px;
  background-color: #2d3d51;
  border: 2px solid #FFFFFF; /* 白色边框 */
}

::v-deep .pagination .el-pagination__total {
  color: white;
}

.thisEq {
  height: 100%;
  overflow: auto;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
  margin-top: 2px;
  width: 60px;
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

.eqTheme {
  height: 170px;
  padding-left: 40px;
  margin: 0 auto;
  clear: both;
}

.themes {
  float: left;
  position: relative;
  margin: 5px 15px 15px 0;
  font-size: 15px;
  height: 30%;
  width: 28%;
  border: #fff 1px solid;
  cursor: pointer;
}

.themes:hover {
  background-color: #409eff;
  border: none;
}

.themes.active {
  background-color: #409eff;
  border: none;
}

::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

   /*开关*/
.fold {
 position: absolute;
 top: 50px;
 right: 333px;
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
</style>
