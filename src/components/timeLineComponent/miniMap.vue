<template>
  <div>
    <div class="small-map">
      <div class="pop_header">
        <h2 class="sub-title">
          缩略地图
        </h2>
        <div id="smallMapContainer"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "miniMap",
  data() {
    return {
      smallViewer: null,
      showLeftButton: false,
    };
  },
  mounted() {
  },
  beforeUnmount() {
    console.log("111", window.viewer);
    if (window.viewer) {
      let viewer = window.viewer;
      let gl = viewer.scene.context._gl;
      viewer.entities.removeAll();
      viewer.destroy();
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除");
      gl = null;
      window.viewer = null;
    }
  },
  methods: {},
};
</script>


<style scoped>
.small-map {
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
  position: absolute;
  top: 65%;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sub-title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
  width: 93%;
}

#smallMapContainer {
  width: 95%;
  height: 20vh;
  margin-top: 6%;
  margin-left: 2.5%;
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
