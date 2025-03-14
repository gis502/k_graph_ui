<template>
  <div>
    <div class="pop">
      <div class="pop_header">
        <h2 class="pop_title">
          应急响应
          <el-button v-show="this.edit" class="custom-add-button" @click="this.showAddPanel=true" type="primary" icon="el-icon-plus">
            添加
          </el-button>

          <span class="time">{{ recordTime }}</span>
        </h2>
      </div>
      <div class="sub-main">
        <ul class="sub-ul">
          <li :class="[i === 0 || i === 1 ? 'high' : '']"
              v-for="(item, i) in responseShow"
          >
            <div class="pop_content">
              <p class="pop_txt"><span>{{ this.timestampToTimeChina(item.responseTime) }}</span></p>
              <p class="pop_txt"><span>{{ item.unit }}</span></p>
              <p class="pop_responseName">
                <span>{{ item.level }}</span>
                <span class="pop_txt">{{ item.status }}</span>
              </p>
              <el-divider class="eldriver"></el-divider>
            </div>
          </li>
        </ul>
      </div>

    </div>


        <div class="videoMonitorWin" v-show="this.showAddPanel">
      <div class="header-div">
        <span>应急响应</span>
      </div>
      <div class="Marking-info-panel">
        <el-form :model="form" label-width="auto" style="max-width: 100%">
          <div class="form-item-wrapper">
            <el-form-item label="响应时间" class="form-item">
              <el-date-picker
                  v-model="form.responseTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="x"
                  size="large">
              </el-date-picker>
            </el-form-item>
          </div>
          <div class="form-item-wrapper">
            <el-form-item label="响应部门" class="form-item">
              <el-input v-model="form.unit"/>
            </el-form-item>
          </div>
          <div class="form-item-wrapper">
            <el-form-item label="响应等级" class="form-item">
              <el-input v-model="form.level"/>
            </el-form-item>
          </div>
          <div class="form-item-wrapper">
            <el-form-item label="响应状态" class="form-item">
              <el-input v-model="form.status"/>
            </el-form-item>
          </div>
          <el-form-item>
            <div class="dialog-footer">
              <el-button type="default" @click="cancel">取消</el-button>
              <el-button type="primary" @click="onSubmit">确认</el-button>
            </div>
          </el-form-item>


        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {getEmergencyResponse, saveEmergencyResponse} from "../../api/system/timeLine.js";
import timeTransfer from "@/cesium/tool/timeTransfer.js";

export default {
  data() {
    return {
      showAddPanel: false,
      EmergencyResponseResponsecontent: [],
      responseShow: [],
      recordTime: timeTransfer.timestampToTimeChina(new Date()),
      form: {
        eqid: '',
        responseTime: '',
        unit: '',
        level: '',
        status: '',
      }
    };
  },
  props: ['currentTime', 'eqid', 'centerPoint','edit'],

  mounted() {
    this.init();
    this.form = {
      eqid: this.eqid,
      responseTime: this.centerPoint.startTime,
      unit: '国务院抗震救灾指挥部办公室',
      // unit: '测试',
      level: '国家地震三级应急响应',
      // level: '测试',
      status: '启动',
    }
  },

  watch: {
    currentTime(newVal) {
      if (newVal) {
        this.updateEmergencyResponse(this.currentTime);
      }
    },
    eqid(newVal) {
    },
    centerPoint(newVal) {
      if (this.centerPoint) {
        this.form.responseTime = this.centerPoint.startTime;
      }
    }
  },
  methods: {
    init() {
      getEmergencyResponse({eqid: this.eqid}).then(res => {
        console.log("getEmergencyResponse", res)
        this.EmergencyResponseResponsecontent = res;
        this.updateEmergencyResponse(this.currentTime);
      });
    },
    async updateEmergencyResponse(currentTime) {
      if (currentTime) {
        this.responseShow = await this.EmergencyResponseResponsecontent.filter(item => {
          return new Date(item.responseTime) <= new Date(timeTransfer.timestampToTime(currentTime));
        });
        this.responseShow.sort((a, b) => {
          return new Date(b.responseTime) - new Date(a.responseTime);
        });
        if (this.responseShow.length > 0) {
          let recordTimetmp = timeTransfer.timestampToTimeChina(this.responseShow[0].responseTime)
          if (recordTimetmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
            this.recordTime = recordTimetmp
          }
        } else {
          let recordTimetmp = timeTransfer.timestampToTimeChina(this.currentTime)
          if (recordTimetmp != "NaN年0NaN月0NaN日 0NaN:0NaN:0NaN") {
            this.recordTime = recordTimetmp
          }
        }
      }
    },

    timestampToTimeChina(time) {
      return timeTransfer.timestampToTimeChina(time)
    },
    cancel() {
      this.showAddPanel = false;
    },
    async onSubmit() {
      let data = this.form
      data.uuod = "1"
      data.responseTime = timeTransfer.timestampToTime(new Date(this.form.responseTime))
      console.log(data, "data")
      saveEmergencyResponse(data).then(response => {
        console.log(response, "saveEmergencyResponse")
        this.EmergencyResponseResponsecontent.unshift(this.form)

        this.updateEmergencyResponse(this.currentTime);
        this.showAddPanel = false; // 关闭表单
      }).catch(error => {
        console.error('Error submitting form:', error);
        // 例如，显示错误消息
        this.$message.error('提交失败');
      });
    }
  },
};
</script>


<style scoped>
.pop {
  position: absolute;
  width: 100%; /* 调整宽度 */
  height: 19%;
  z-index: 20; /* 提高层级 */
  transition: border 0.3s ease-in-out;
}


.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
}

.custom-add-button {
  margin-left: 5px; /* 调整左边外边距 */
  margin-top: -6px; /* 调整左边外边距 */
  align-items: center;
  justify-content: center;
  padding: 0 6px 0 0px; /* 基础内边距 */
  background-color: #183454 !important; /* 设置背景颜色为白色 */
  color: #FFFFFF !important;
  border-color: #FFFFFF !important; /* 白色边框 */
  height: 25px !important; /* 设置按钮高度 */
  width: 40px !important;
}

.sub-main {
  margin-top: -6%;
  max-height: 10vh;
  left: -2%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 0px;
}


.sub-ul {
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1rem;
  overflow-y: hidden; /* 当内容超出时隐藏垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: -21px; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.pop_content {
  left: 7%;
  top: -2%;
  position: relative;
}

.pop_responseName {
  font-size: 0.9rem;
  line-height: 0.6rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}

.pop_txt {
  line-height: 0.6rem;
  font-size: 0.9rem;
  font-weight: normal;
  color: #ffffff;
}

.time {
  right: 9%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.new-panel {
  position: absolute;
  top: 8%;
  left: 100%;
  width: 176%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  z-index: 50;
}

.data-table {
  width: 100%; /* 表格宽度 */
  border-collapse: collapse; /* 合并边框 */
}

.data-table th, .data-table td {
  background-color: #1e3b4d !important;
  border-color: rgba(131, 190, 222, 0.24);
  padding: 10px; /* 内边距 */
  text-align: center;
  color: #fff;
  font-size: 16px;
}

.data-table th {
  border-width: 1px;
  border-style: solid;
  border-color: rgba(131, 190, 222, 0.24);
  background-color: #1e3b4d !important;
  color: #fff;
  padding: 0;
  text-align: center;
  font-size: 18px;
}

.close-button {
  position: absolute; /* Position the button absolutely */
  top: 0px; /* Distance from the top */
  right: 10px; /* Distance from the right */
  cursor: pointer; /* Change cursor to pointer */
  font-size: 24px; /* Adjust font size */
  color: #ffffff; /* Optional: Set color */
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px; /* 滚动条的宽度 */
  height: 12px; /* 滚动条的高度，对水平滚动条有效 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}

.eldriver {
  width: 250px;
}

.videoMonitorWin {
  position: absolute;
  width: 83%;
  height: 42%;
  top: 20%;
  left: 187%;
  //all: unset; /* 取消继承所有样式 */
  background-color: rgba(40, 40, 40, 0.7);
  border: 2px solid #18c9dc;
}

.header-div {
  color: white;
  display: flex;
  justify-content: center;
  font-size: 128%;
  align-items: center;
  margin-bottom: 1px;
}

.Marking-info-panel {
  padding: 1px 5px;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 100%;
  margin: 0px 10px;
}


.el-form-item {
  margin-top: 10px;
  margin-bottom: 15px; /* 表单项之间的间距 */
}


.el-input,
.el-date-picker {
  width: 100%; /* Set to 100% to take full width of the parent */
  max-width: 400px; /* Optional: set a maximum width */
  box-sizing: border-box; /* Include padding and border in the element's total width */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .videoMonitorWin {
    width: 100%;
    padding: 10px; /* 内边距 */
  }
}

@media (max-width: 480px) {
  .header-div {
    font-size: 16px; /* 标题字体大小 */
  }
}
.dialog-footer{
  margin-left: 140px;
}

</style>
