<template>
  <div>
    <div class="small-map" v-show="ifShowMiniMap">
      <h2 class="sub-title">
        缩略地图:
        <span class="icon" @click="closeMiniMap">
                <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%; width: 100%">
            </span>
      </h2>
      <div id="smallMapContainer"></div>
    </div>
    <div class="showMiniMapButton" v-show="showLeftButton" @click="openMiniMap" style="margin-top: 10px">
      <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
    </div>
  </div>

</template>

<script>
export default {
  name: "miniMap",
  data(){
    return{
      smallViewer: null,
      showLeftButton: false,
      ifShowMiniMap: true
    }
  },
  mounted(){
  },
  beforeUnmount() {
    console.log("111",window.viewer)
    if (window.viewer){
      let viewer=window.viewer
      let gl=viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl=null
      window.viewer = null;
    }
  },
  methods: {
    closeMiniMap() {
      this.ifShowMiniMap = false
      this.showLeftButton = true
    },
    openMiniMap() {
      this.ifShowMiniMap = true
      this.showLeftButton = false
    },
  }
}
</script>

<style scoped>
.small-map {
  width: 27%;
  height: 34%;
  position: absolute;
  padding: 5px;
  border-radius: 5px;
  top: 56%;
  right: 1%;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

#smallMapContainer {
  width: 100%;
  height: 80%;
  margin-top: 2px;
}

.sub-title {
  font-family: myFirstFont;
  font-size: 1.1rem;
  line-height: 1.4rem;
  /*padding: 1rem 0 1rem !important;*/
  color: #ffffff;
  letter-spacing: 0;
  text-align: justify;
  text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
  border-bottom: 0.1rem solid #ffffff;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  margin-right: 10px;
}

.icon img {
  max-width: 12px; /* 设置图片最大宽度 */
  max-height: 12px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */
}

.showMiniMapButton {
  position: absolute;
  padding: 4px;
  border-radius: 2px;
  top: 390px;
  right: 10px;
  z-index: 110; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
}

.showMiniMapButton img {
  max-width: 20px; /* 设置图片最大宽度 */
  max-height: 20px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */
  justify-content: center;
  align-content: center;
}
</style>
