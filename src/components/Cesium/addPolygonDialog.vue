<template>
  <el-dialog class="dialogDiv" v-model="DialogFormVisible" title="添加标注信息" width="800"
             :close-on-click-modal="false" :destroy-on-close="true" :show-close="false">
    <el-form ref="form" :model="form" label-width="110px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="长度(m)：">
            <el-input v-model="form.length"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="宽度(m)：">
            <el-input v-model="form.width"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="体积(m³)：">
            <el-input v-model="form.volume"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="平均厚度(m)：">
            <el-input v-model="form.thickness"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="处置队伍：">
            <el-input v-model="form.team"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="处置措施：">
            <el-input v-model="form.measure"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系人员：">
            <el-input v-model="form.contactPerson"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系电话：">
            <el-input v-model="form.contactNumber"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="目前状况：">
            <el-checkbox-group v-model="form.stability" :max="1">
              <el-checkbox label="基本稳定" name="stability"></el-checkbox>
              <el-checkbox label="不稳定" name="stability"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="人员伤亡：" >
            <el-checkbox-group v-model="form.casualties" :max="1">
              <el-checkbox label="无" name="casualties"></el-checkbox>
              <el-checkbox label="有" name="casualties"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="威胁对象：">
        <el-checkbox-group v-model="form.threats">
          <el-checkbox label="地表建筑" name="threats"></el-checkbox>
          <el-checkbox label="交通路线" name="threats"></el-checkbox>
          <el-checkbox label="通讯电力设施" name="threats"></el-checkbox>
          <el-checkbox label="水库电站" name="threats"></el-checkbox>
          <el-checkbox label="管网工程" name="threats"></el-checkbox>
          <el-checkbox label="其他设施" name="threats"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="先期处置阶段：">
        <el-checkbox-group v-model="form.disposalStage" :max="1">
          <el-checkbox label="暂未处置" name="disposalStage"></el-checkbox>
          <el-checkbox label="正在处置" name="disposalStage"></el-checkbox>
          <el-checkbox label="完成处置" name="disposalStage"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item class="box" label="先期处置过程：">
        <el-row>
          <el-col :span="8">
            <el-date-picker
                v-model="form.date1"
                type="datetime"
                placeholder="开始处置时间"
            >
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <el-date-picker
                v-model="form.date2"
                type="datetime"
                placeholder="预计完成处置时间"
            >
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <el-date-picker
                v-model="form.date3"
                type="datetime"
                placeholder="实际完成处置时间"
            >
            </el-date-picker>
          </el-col>
        </el-row>

      </el-form-item>
      <el-form-item class="button">
        <el-button type="primary" @click="commitAddNote">提交</el-button>
        <el-button type="primary" @click="cancelAddNote">取消</el-button>
      </el-form-item>
    </el-form>
    </el-dialog>
</template>

<script>
import cesiumPlot from '@/cesium/plot/cesiumPlot'
export default {
  name: "addPolygonDialog",
  data() {
    return {
      form: {
        length: "",
        width: "",
        volume: "",
        thickness: "",
        team: "",
        measure: "",
        contactPerson: "",
        contactNumber: "",
        stability: [],
        casualties: [],
        threats: [],
        disposalStage: [],
        date1: "",
        date2: "",
        date3: "",
        DialogFormVisible: false,
      },
    };
  },
  props: [
    'popupVisiblePolygon'
  ],
  watch: {
    popupVisiblePolygon() {
      // 1-1 显示弹窗
      this.DialogFormVisible = this.popupVisiblePolygon

    },
  },
  methods: {
    commitAddNote() {
      console.log(this.form);
      cesiumPlot.insertPolygon(this.form)
      // console.log("已完成")
      this.$emit('confirm')
      this.form = []
    },
    // 取消添加标注
    cancelAddNote() {
    this.$emit('confirm')
      this.form = []
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
