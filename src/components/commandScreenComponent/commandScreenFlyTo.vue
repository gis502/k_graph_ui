<template>
<!--   经纬度跳转弹框 -->
<div class="universalPanel">
  <div class="panelTop">
    <h2 class="panelName">经纬度跳转</h2>
  </div>
  <div class="panelContent">
    <div>经度：
      <el-input v-model="positionFlyTo.lon" @keyup.enter="flyToPosition"
      ></el-input>
      °
    </div>
    <div style="margin-left: 10px">纬度：
      <el-input v-model="positionFlyTo.lat"
                @keyup.enter="flyToPosition"></el-input>
      °
    </div>
  </div>
  <div class="panelButton">
    <el-button class="panelButtons" @click="clearPositionPanel">取消</el-button>
    <el-button class="panelButtons" type="primary" @click="flyToPosition">
      跳转
    </el-button>
  </div>
</div>
</template>
<script>
export default {
  data(){
    return{
      positionFlyTo: {
        lon: "", // 经度
        lat: "", // 纬度
      },
    }
  },
  methods:{
    // 飞到目标位置
    flyToPosition() {
      const lon = parseFloat(this.positionFlyTo.lon);
      const lat = parseFloat(this.positionFlyTo.lat);

      if (!isNaN(lon) && !isNaN(lat)) {
        window.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000),
          duration: 2, // 飞行时间
        });
      } else {
        this.$message.error("请输入有效的经度、纬度和高度值！");
      }
    },
    clearPositionPanel() {
      this.positionFlyTo.lon = ''
      this.positionFlyTo.lat = ''
      this.showPositionFlyTo = false
    },
  }
}
</script>
<style>
.universalPanel {
  position: absolute;
  left: 1%;
  bottom: 6%;
  width: 450px;
  border-radius: 5px;
  background: rgb(37 69 86);
  //background: linear-gradient(90deg, rgb(22 105 179 / 9%) 25%, rgb(10 33 75 / 76%) 88%);
  color: #fff;
  z-index: 100;
  top: 110px;
  right: 0;
}
.panelTop {
  top: 0.5%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  margin: 0;
}
.panelContent {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  width: 100%;
  margin-top: 30px;
}
.panelButton {
  padding: 0 0 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.panelButtons {
  width: 30%;
  height: 30px;
}
</style>