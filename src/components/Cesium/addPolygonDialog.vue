<template>
  <el-dialog class="dialogDiv" v-model="DialogFormVisible" title="添加标注信息" width="800"
             :close-on-click-modal="false" :destroy-on-close="true" :show-close="false">
    <el-form ref="form" :model="form" label-width="110px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="长度(m)：">
            <el-input v-model="form.length.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="宽度(m)：">
            <el-input v-model="form.width.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="体积(m³)：">
            <el-input v-model="form.volume.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="平均厚度(m)：">
            <el-input v-model="form.averageThickness.value"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="处置队伍：">
            <el-input v-model="form.disposalTeam.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="处置措施：">
            <el-input v-model="form.disposalMeasures.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系人员：">
            <el-input v-model="form.contactPerson.value"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系电话：">
            <el-input v-model="form.contactPhone.value"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="目前状况：">
            <el-checkbox-group v-model="form.currentStabilityStatus.value" :max="1">
              <el-checkbox label="基本稳定" name="currentStabilityStatus" :value="form.currentStabilityStatus.content[0].label"></el-checkbox>
              <el-checkbox label="不稳定" name="currentStabilityStatus" :value="form.currentStabilityStatus.content[1].label"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="人员伤亡：" >
            <el-checkbox-group v-model="form.casualties.value" :max="1">
              <el-checkbox label="无" name="casualties" :value="form.casualties.content[0].label"></el-checkbox>
              <el-checkbox label="有" name="casualties" :value="form.casualties.content[1].label"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="威胁对象：">
        <el-checkbox-group v-model="form.threatenedObjects.value">
          <el-checkbox label="地表建筑" name="threatenedObjects" :value="form.threatenedObjects.content[0].label"></el-checkbox>
          <el-checkbox label="交通路线" name="threatenedObjects" :value="form.threatenedObjects.content[1].label"></el-checkbox>
          <el-checkbox label="通讯电力设施" name="threatenedObjects" :value="form.threatenedObjects.content[2].label"></el-checkbox>
          <el-checkbox label="水库电站" name="threatenedObjects" :value="form.threatenedObjects.content[3].label"></el-checkbox>
          <el-checkbox label="管网工程" name="threatenedObjects" :value="form.threatenedObjects.content[4].label"></el-checkbox>
          <el-checkbox label="其他设施" name="threatenedObjects" :value="form.threatenedObjects.content[5].label"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="先期处置阶段：">
        <el-checkbox-group v-model="form.initialDisposalPhase.value" :max="1">
          <el-checkbox label="暂未处置" name="initialDisposalPhase" :value="form.initialDisposalPhase.content[0].label"></el-checkbox>
          <el-checkbox label="正在处置" name="initialDisposalPhase" :value="form.initialDisposalPhase.content[1].label"></el-checkbox>
          <el-checkbox label="完成处置" name="initialDisposalPhase" :value="form.initialDisposalPhase.content[2].label"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item class="box" label="先期处置过程：">
        <el-row>
          <el-col :span="8">
            <el-date-picker
                v-model="form.initialDisposalStartDate.value"
                type="datetime"
                value-format="x"
                placeholder="开始处置时间"
            >
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <el-date-picker
                v-model="form.initialDisposalEstimatedEndDate.value"
                type="datetime"
                value-format="x"
                placeholder="预计完成处置时间"
            >
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <el-date-picker
                v-model="form.initialDisposalActualEndDate.value"
                type="datetime"
                value-format="x"
                placeholder="实际完成处置时间"
            >
            </el-date-picker>
          </el-col>
        </el-row>

      </el-form-item>
      <el-form-item class="button">
        <el-button type="primary" @click="cancelAddNote">取消</el-button>
        <el-button type="primary" @click="commitAddNote">确认</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>


<script>
import {useCesiumStore} from "@/store/modules/cesium.js";
import {insertPlotAndInfo} from '@/api/system/plot.js'
import {ElMessage} from "element-plus";
import * as Cesium from 'cesium'
export default {
  name: "addPolygonDialog",
  data() {
    return {
        form: {
            name: "滑坡",
            length: {
              type: "text",
              name: "长度（m）",
              value: ""
            },
            width: {
              type: "text",
              name: "宽度（m）",
              value: ""
            },
            averageThickness: {
              type: "text",
              name: "平均厚度（m）",
              value: ""
            },
            volume: {
              type: "text",
              name: "体积（m³）",
              value: ""
            },
            currentStabilityStatus: {
              type: "select",
              name: "目前稳定状况",
              value: [],
              content: [
                {
                  value: "basicallyStable",
                  label: "基本稳定"
                },
                {
                  value: "unstable",
                  label: "不稳定"
                }
              ]
            },
            casualties: {
              type: "select",
              name: "人员伤亡",
              value: [],
              content: [
                {
                  value: "noCasualties",
                  label: "无"
                },
                {
                  value: "hasCasualties",
                  label: "有"
                }
              ]
            },
            threatenedObjects: {
              type: "select",
              name: "威胁对象",
              value: [],
              content: [
                {
                  value: "surfaceBuildings",
                  label: "地表建筑"
                },
                {
                  value: "transportationRoutes",
                  label: "交通线路"
                },
                {
                  value: "communicationPowerFacilities",
                  label: "通讯电力设施"
                },
                {
                  value: "reservoirPowerStation",
                  label: "水库电站"
                },
                {
                  value: "pipelineEngineering",
                  label: "管网工程"
                },
                {
                  value: "otherFacilities",
                  label: "其他设施"
                }
              ]
            },
            disposalTeam: {
              type: "text",
              name: "处置队伍",
              value: ""
            },
            disposalMeasures: {
              type: "text",
              name: "处置措施",
              value: ""
            },
            initialDisposalPhase: {
              type: "select",
              name: "先期处置阶段",
              value: [],
              content: [
                {
                  value: "notYetProcessed",
                  label: "暂未处置"
                },
                {
                  value: "processing",
                  label: "正在处置"
                },
                {
                  value: "completeDisposal",
                  label: "完成处置"
                }
              ]
            },
            initialDisposalStartDate: {
              type: "text",
              name: "先期处置时间",
              value: ""
            },
            initialDisposalEstimatedEndDate: {
              type: "text",
              name: "预计处置时间",
              value: ""
            },
            initialDisposalActualEndDate: {
              type: "text",
              name: "实际处置时间",
              value: ""
            },
            contactPerson: {
              type: "text",
              name: "联系人员",
              value: ""
            },
            contactPhone: {
              type: "text",
              name: "联系电话",
              value: ""
            }
      },
      DialogFormVisible: false,
      polygonInfo: [],
      formInfo: []
    };
  },
  props: [
    'addPolygonDialogFormVisible'
  ],
  watch: {
    addPolygonDialogFormVisible() {
      // 1-1 显示弹窗
      this.DialogFormVisible = this.addPolygonDialogFormVisible
      // 2-1 获取pinia中存的经纬度、标绘类型等信息以及生成对应类型的dialog
      let cesiumStore = useCesiumStore()
      if(this.addPolygonDialogFormVisible){
        // 2-2 获取pinia中数据
        // this.form = cesiumStore.getPointInfo1()
        this.polygonInfo = cesiumStore.getPolygonInfo()
        console.log(">>>",this.polygonInfo.situationPlotData)
      }
    },
  },

  methods: {
    // 取消添加标注
    cancelAddNote() {
      window.viewer.entities.removeById(this.polygonInfo.situationPlotData[0].plotid)
      // 清空typeInfo信息、starttime、endtime

      this.$emit('clearMarkDialogForm')// 调用父组件中resetPolygon对应的方法，重置标绘信息填写框里的信息
      this.resetFormInfo()
    },
    commitAddNote() {
      let data = this.assembleData(this.form, this.polygonInfo.situationPlotData)
      // 批量插入所有数据
      insertPlotAndInfo(data)
          .then((res) => {
            ElMessage({
              message: '所有数据添加成功',
              type: 'success',
            });
          });
      this.resetFormInfo()
      this.$emit('clearMarkDialogForm')// 调用父组件中resetPolygon对应的方法，重置标绘信息填写框里的信息
      window.document.oncontextmenu = function(){  // 允许默认菜单弹出
        return true;
      }
    },
    // 组装成发送请求的数据形式
    assembleData(data1, data2) {
      let plotInfo = data1
      console.log("标绘点详细",plotInfo)
      // 遍历 form 对象中的所有字段，将数组转换为字符串
      for (let key in plotInfo) {
        if (Array.isArray(plotInfo[key].value)) {
          // 使用逗号拼接数组中的值
          plotInfo[key].value = plotInfo[key].value.join(',');
        }
        // 假设有需要转换时间戳的字段
        if (key === 'initialDisposalStartDate' || key === 'initialDisposalEstimatedEndDate' || key === 'initialDisposalActualEndDate') {
          plotInfo[key].value = this.timestampToTime(plotInfo[key].value);
        }
      }
      let startTime = this.timestampToTime(plotInfo.initialDisposalStartDate.value)
      let endTime = this.timestampToTime(plotInfo.initialDisposalActualEndDate.value)
      // 将多边形顶点转换为经纬度
      let posArr = data2.map((item) => {
      return {
        lat: item.latitude,
        lon: item.longitude,
        height: item.height,
        eqid: item.eqid,
        name: item.name,
        img: item.img,
        angle: item.angle,
        time: item.time,
        plotid: item.plotid
      };
      });
      let assemblyData = {
        plots: [],
        plotinfo: {
          plotid: posArr[0].plotid,
          starttime: startTime,
          endtime: endTime,
          info: plotInfo,
          id: this.guid()
        }
      };
      // 组装 plot 数据
      posArr.forEach((pos, index) => {
        assemblyData.plots.push({
          eqid: pos.eqid,
          plotid: pos.plotid,  // 整个多边形共用一个UUID
          time: pos.time,
          plottype: pos.name,
          drawtype: "polygon",
          latitude: pos.lat,
          longitude: pos.lon,
          height: pos.height,
          img: pos.img,
          angle: pos.angle
        });
      });
      console.log("最终" ,assemblyData)
      return assemblyData;
    },

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
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    resetFormInfo() {
      this.form.name = "滑坡"; // 根据需求重置
      this.form.length.value = "";
      this.form.width.value = "";
      this.form.averageThickness.value = "";
      this.form.volume.value = "";
      this.form.currentStabilityStatus.value = [];
      this.form.casualties.value = [];
      this.form.threatenedObjects.value = [];
      this.form.disposalTeam.value = "";
      this.form.disposalMeasures.value = "";
      this.form.initialDisposalPhase.value = [];
      this.form.initialDisposalStartDate.value = "";
      this.form.initialDisposalEstimatedEndDate.value = "";
      this.form.initialDisposalActualEndDate.value = "";
      this.form.contactPerson.value = "";
      this.form.contactPhone.value = "";
    },
  },

};
</script>

<style scoped >
.dialogDiv {
  position: absolute;
  /*padding: 20px;*/
  /*border-radius: 5px;*/
  /*top:100px;*/
  /*left: 10px;*/
  z-index: 10; /* 更高的层级 */
  /*background-color: rgba(40, 40, 40, 0.7);*/
}
.el-form {
  max-width: 910px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 5px;
}

.button {
  display: flex;
  justify-content: flex-end;
}

.el-form .box .el-input{
  width: 200px;
}

.el-form .el-input{
  width: 120px;
}
</style>
