<template>
  <div class="bubble-container">
    <div
        v-for="(bubble, index) in bubbles"
        :key="index"
        class="bubble"
        :style="{
        left: bubble.left + 'px',
        top: bubble.top + 'px',
        width: bubble.width + 'px',
        height: bubble.height + 'px',
        background: bubble.background,
        opacity: bubble.opacity
      }"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bubbles: [
        { left: 20, top: 6, width: 15, height: 15, opacity: 1, background: "linear-gradient(212.35deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 33, width: 29, height: 29, opacity: 1, background: "linear-gradient(222.42deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 74, width: 5, height: 5, opacity: 1, background: "linear-gradient(221.19deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 91, width: 5, height: 5, opacity: 1, background: "linear-gradient(225deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 108, width: 15, height: 15, opacity: 1, background: "linear-gradient(206.57deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 135, width: 29, height: 29, opacity: 1, background: "linear-gradient(209.64deg, rgba(35, 215, 255, 1) 0%, rgba(23, 73, 248, 1) 100%)" },
        { left: 20, top: 176, width: 15, height: 15, opacity: 1, background: "linear-gradient(208.18deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 203, width: 21, height: 21, opacity: 1, background: "linear-gradient(180deg, rgba(35, 212, 255, 1) 0%, rgba(26, 99, 250, 1) 100%)" },
        { left: 20, top: 236, width: 9, height: 9, opacity: 1, background: "linear-gradient(215.54deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 257, width: 9, height: 9, opacity: 1, background: "linear-gradient(213.69deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" },
        { left: 20, top: 278, width: 15, height: 15, opacity: 1, background: "linear-gradient(214.22deg, rgba(227, 35, 255, 1) 0%, rgba(117, 23, 248, 1) 100%)" }
      ]
    };
  }
};
</script>

<style scoped>
.bubble-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: black;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
}
</style>