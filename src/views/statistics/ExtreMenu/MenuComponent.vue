<template>
  <div class="iframe-container">
    <!-- 外部页面通过 iframe 内嵌 -->
    <iframe v-if="externalUrl" :src="externalUrl" class="iframe-content"></iframe>
  </div>
</template>

<script>
export default {
  name: "MenuComponent",
  data() {
    return {
      // 外部页面的 URL
      externalUrl: "http://47.92.216.173:8878/" // 请更改为实际可用的 URL
    };
  }
};
</script>

<style scoped>
.iframe-container {
  width: 100%;
  height: calc(100vh - 64px); /* 动态设置高度以适应菜单高度 */
  overflow: hidden;
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
