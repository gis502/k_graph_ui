<template>
  <div>
    <div class="small-map">
      <h2 class="sub-title">
        缩略地图:
      </h2>
      <div id="smallMapContainer"></div>
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
  methods: {
  },
};
</script>


<style scoped>
.small-map {
  width: 27%;
  height: 31%;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 64%;
  right: 1%;
  z-index: 20; /* 提高层级 */
  background-color: rgb(22, 53, 77,0.9);
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}

#smallMapContainer {
  width: 95%;
  height: 80%;
  margin-top: 6%;
  margin-left: 2.5%;
}
.sub-title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top:0.5%;
  margin: 0;
  padding: 0;
  position: relative;
}

.sub-title:before {
  content: "";
  width: 11px;
  height: 23px;
  position: relative;
  top: 7px;
  margin: 0 10px;
  display: inline-block;
  background-image: url("@/assets/images/CommandScreen/弹框标题图标.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sub-title:after {
  content: "";
  width: 90%;
  height: 6px;
  position: absolute;
  top: 130%;
  left: 2%;
  background-image: url("@/assets/images/CommandScreen/弹框标题分割线.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
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
