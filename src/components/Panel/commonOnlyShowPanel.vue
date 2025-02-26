<template>
      <div class="videoMonitorWin" :style="styleObject">
          <div class="header-div">
        <span>
          <span>态势标绘信息</span>
        </span>
          </div>
          <div class="Marking-info-panel">
            <el-descriptions :column="2" size="default " border>
              <!-- 标绘名称 -->
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">标绘名称</div>
                </template>
                <div>
                  <el-text size="large">
                    {{ plotInfoNew.plotType || "未命名" }}
                  </el-text>
                </div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    开始时间
                  </div>
                </template>
                <div>
                  <el-text v-if="plotInfoNew.aditStatus" size="large">{{
                      ("" + plotInfoNew.starttime).match('-')
                        ? this.timestampToTime(plotInfoNew.starttime).replace("T", " ")
                        : (plotInfoNew.starttime !== null ? this.timestampToTime(plotInfoNew.starttime).replace("T", " ") : "")
                    }}
                  </el-text>
                  <el-date-picker
                    v-if="!plotInfoNew.aditStatus"
                    v-model="plotInfoNew.starttime"
                    type="datetime"
                    placeholder="选择日期时间"
                    value-format="x"
                    size="large">
                  </el-date-picker>
                </div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    结束时间
                  </div>
                </template>
                <div>
                  <el-text v-if="plotInfoNew.aditStatus" size="large">{{
                      ("" + plotInfoNew.endtime).match('-')
                        ? this.timestampToTime(plotInfoNew.endtime).replace("T", " ")
                        : (plotInfoNew.endtime !== "" ? this.timestampToTime(plotInfoNew.endtime).replace("T", " ") : "")
                    }}
                  </el-text>
                  <el-date-picker
                    v-if="!plotInfoNew.aditStatus"
                    v-model="plotInfoNew.endtime"
                    type="datetime"
                    placeholder="选择日期时间"
                    value-format="x"
                    size="large">
                  </el-date-picker>
                </div>
              </el-descriptions-item>
              <!-- 经纬度显示 -->
              <el-descriptions-item v-if="plotInfoNew.drawtype === 'point'">
                <template #label>
                  <div class="cell-item">经纬度</div>
                </template>
                <div>
                  <el-text size="large">
                    经度: {{ plotInfoNew.longitude || "无数据" }}°E,
                    纬度: {{ plotInfoNew.latitude || "无数据" }}°N
                  </el-text>
                </div>
              </el-descriptions-item>
              <template v-for="(value,key,index) in plotInfoNew.info">
                <el-descriptions-item v-if="value.type ==='text'">
                  <template #label>
                    <div class="cell-item">
                      {{ value.name }}
                    </div>
                  </template>
                  <el-text v-if="plotInfoNew.aditStatus" size="large">{{ value.value }}</el-text>
                  <el-input v-if="!plotInfoNew.aditStatus" v-model="value.value" autocomplete="off" size="large"/>
                </el-descriptions-item>
                <el-descriptions-item v-if="value.type ==='select'">
                  <template #label>
                    <div class="cell-item">
                      {{ value.name }}
                    </div>
                  </template>
                  <el-text v-if="plotInfoNew.aditStatus" size="large">{{ value.value }}</el-text>
                  <el-select v-if="!plotInfoNew.aditStatus" v-model="value.value" placeholder="" size="large">
                    <el-option
                      v-for="item in value.content"
                      :label="item.label"
                      :value="item.label"/>
                  </el-select>
                </el-descriptions-item>
              </template>
            </el-descriptions>
          </div>
        </div>
<!--      </div>-->
</template>
<script>
import {plotType as plotTypeDialog} from '@/cesium/plot/plotType.js'
import {getPlotInfos, addPlotInfo, deletePlotAndInfo, deletePlotInfo, updataPlotInfo} from '@/api/system/plot.js'
import arrow from "@/cesium/drawArrow/drawPlot.js";
import timeTransfer from "@/cesium/tool/timeTransfer.js";

export default {
  data() {
    return {
      positionEntity: {x: 0, y: 0},
      popupPanelData: {}, // 存储这当前标绘点在situationplot表中的信息
      plotInfoNew: {
        starttime: null,
        endtime: null,
        info: null,
        id: null,
        aditStatus: true,
      },
    }
  },
  props: [
    'popupData', 'position'
  ],
  watch: {
    popupData: {
      deep: true,
      handler() {
        this.popupPanelData = this.popupData
        console.log(this.popupPanelData, "this.popupPanelData")
        this.getPlotInfo(this.popupPanelData.plotId, this.popupPanelData.plotType)
      }
    },
    position() {
      this.positionEntity = this.position
    },
  },
  computed: {
    // 调整弹框位置
    styleObject() {
      return {
        positionEntity: "absolute",
        left: `${this.positionEntity.x}px`,
        top: `${this.positionEntity.y}px`
      };
    },
  },
  methods: {
    // 点击标绘点后获取此标绘点的所有标绘信息
    getPlotInfo(plotId, plotType) {
      let that = this;
      // 1. 请求获取标绘点信息
      getPlotInfos({plotId, plotType}).then(res => {
        console.log("点击获取", res)
        // 2. 初始化 item 对象，存储标绘信息
        let item = {
          starttime: null,
          endtime: null,
          info: null,
          uuid: null,
          aditStatus: true,
          plotId: null,
          plotType: null,
          drawtype: null,
          longitude: null,
          latitude: null
        };
        // 3. 处理标绘点的开始和结束时间
        item.starttime = that.timestampToTime(res.plotInfo.startTime);
        item.endtime = res.plotInfo.endTime ? that.timestampToTime(res.plotInfo.endTime) : "";
        item.plotId = plotId;
        item.plotType = plotType;
        item.drawtype = res.plotInfo.drawtype;
        item.longitude = res.plotInfo.geom.coordinates[0] || "无经纬度信息";
        item.latitude = res.plotInfo.geom.coordinates[1] || "无经纬度信息";
        // 4. 初始化类型信息
        let typeInfo = {};

        // 6. 如果 res.plotTypeInfo 存在，则处理类型相关信息
        if (res.plotTypeInfo) {
          for (let key in plotTypeDialog) {
            if (res.plotInfo.plotType === plotTypeDialog[key].name) {
              // 深拷贝 plotTypeDialog 中的对应类型到 typeInfo
              typeInfo = JSON.parse(JSON.stringify(plotTypeDialog[key]));
              break;
            }
          }

          // 7. 将获取到的 plotTypeInfo 值赋给 typeInfo
          for (let key in typeInfo) {
            // 如果 plotTypeInfo 中存在对应字段，则直接赋值
            if (res.plotTypeInfo[key] !== undefined) {
              typeInfo[key].value = res.plotTypeInfo[key];
            }
          }
          // 8. 将处理后的 typeInfo 赋值给 item.info
          item.info = typeInfo;
          // 9. 设置 item.uuid
          item.uuid = res.plotTypeInfo.uuid;
        } else {
          // 如果 res.plotTypeInfo 不存在，只保留基本信息
          item.info = {
            starttime: item.starttime,
            endtime: item.endtime,
            plotType: plotType,
          };
        }
        that.plotInfoNew=item
      });
    },

    // 时间戳转换成日期格式，将时间戳转换成 xx年xx月xx日xx时xx分xx秒格式，
    // 形参timestamp必须时整型时间戳，字符串类型时间戳得到的时NaN。
    timestampToTime(timestamp) {
      return timeTransfer.timestampToTime(timestamp)
    },
    timestampToTimeChinese(timestamp) {
      return timeTransfer.timestampToTimeChina(timestamp)
    },
  }
};
</script>
<style scoped>
.el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
  /*width: 43px!important;*/
}

.eq-videoMonitorWin {
  position: absolute;
  width: 315px;
  padding: 0px;
  z-index: 80;
  box-shadow: 0 4px 8px rgb(60, 215, 255), 0 6px 20px rgb(25, 108, 210);
}

.earthquake-info-panel {
  padding: 0px;
  border-radius: 25px;
  max-width: 100%;
  margin: 0px 0px;
}

.eqbox-card {

}

:deep(.el-card__body) {
  padding: 0px 0px 0px 0px !important;
}

.earthquake-info-table {
  width: 100%;
  background-color: rgb(255, 255, 255);
  color: #000000;
  border-collapse: collapse;
}

.earthquake-info-table th,
.earthquake-info-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #21c9db;
  font-size: 0.8rem;
  font-weight: 550;
}

.cell-item {
  width: 100%;
  text-align: center;
  white-space: nowrap; /* 避免换行 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

.collapseFooter {
  float: right;
  margin-top: 25px;
}

.el-input {
  --el-input-width: 140px !important;
}

.el-select {
  /* 此版本下的select下拉框跟inline属性有bug，当设置inline时，select的宽度会丢失，因此需要手动设置 */
  --el-select-width: 140px !important;
}

.header-div {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.box-card {
  margin-bottom: 5px;
  font-size: 25px;
}

.videoMonitorWin {
  position: absolute;
  width: 800px;
  padding: 20px;
  z-index: 80;
  background-color: rgba(40, 40, 40, 0.7);
  border: 2px solid #18c9dc;
}

.ponpTable td {
  padding: 10px;
}

.info-item :nth-child(1) {
  width: 15%;
  border-color: #293966;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #293966;
  margin-bottom: 2px;
  align-content: center;
}

.info-item :nth-child(2) {
  width: 60%;
  border-color: #4d5469;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #4d5469;
  margin-bottom: 2px;
}


.Marking-info-panel {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 100%;
  margin: 10px 10px;
}

.el-card__header {
  font-weight: 550;
}

.el-descriptions__label {
  font-weight: 550;
}

.clearfix {
  font-size: 1.1rem;
  font-weight: 550;
  background-color: red;
  text-align: center;
  color: #FFFFFF;
  height: 4vh;
  display: flex; /* 使用 Flexbox */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

svg {
  vertical-align: middle; /* 保持文本和图标对齐 */
  margin-right: 0.5rem; /* 图标和文本间距 */
}
</style>
