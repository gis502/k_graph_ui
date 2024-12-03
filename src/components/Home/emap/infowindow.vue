<template>
  <div class="infowindowClass">
    <div class="windows_close" @click="close" title="关闭信息窗口"></div>
    <div class="_head" style="margin-bottom: 10px">
      <div class="info-item">
        <span style="margin: 6px">{{ position }}</span>
      </div>
    </div>
    <div class="_body">
      <div class="info-item" style="margin-bottom: 3px">
        <span style="margin: 0 6px">发震时间:</span> {{ time }}
      </div>
      <div class="info-item" style="margin-bottom: 3px">
        <span style="margin: 0 6px">地震震级: </span> {{  Number(magnitude).toFixed(1) }} <span style="margin: 0 5px">级</span>
      </div>
      <div class="info-item" style="margin-bottom: 3px">
        <span style="margin: 0 6px">震源深度:</span> {{ depth }}<span style="margin: 0 5px">千米</span>
      </div>
      <div class="info-item" style="margin-bottom: 3px">
        <span style="margin: 0 6px">震中经纬: </span><span>东经</span>{{ Number(latitude).toFixed(2) }}<span>度</span>
        <span style="margin-left:5px">北纬</span>{{ Number(longitude).toFixed(2)  }}<span>度</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    infoWindow: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    position() { return this.data.position || '未知位置'; },
    // time() {
    //   if (!this.data.time) return '未知时间';
    //
    //   const date = new Date(this.data.time);
    //   const year = date.getFullYear();
    //   const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零到两位
    //   const day = String(date.getDate()).padStart(2, '0'); // 补零到两位
    //
    //   return `${year}年${month}月${day}日`;
    // },
    time() {
      if (!this.data.time) return '未知时间';

      const date = new Date(this.data.time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    },
    magnitude() { return this.data.magnitude || '未知震级'; },
    depth() { return this.data.depth || '未知深度'; },
    latitude() { return this.data.latitude || '未知纬度'; },
    longitude() { return this.data.longitude || '未知经度'; }
  },
  methods: {
    close() {
      this.$emit('update:showInfoWindow', false);
      this.infoWindow.closeInfoWindow();
    },
  },
};
</script>

<style lang="scss">
$tooltip-background: rgba(10, 24, 48, 0.9);
$tooltip-border-color: #00a1ff;
$tooltip-text-color: #00a1ff;
$closeColor: #ff4c4c;

.infowindowClass {
  position: absolute;
  width: 340px;
  padding: 20px;
  background-color: $tooltip-background;
  //background-image: url('@/assets/home/弹窗2.png'); /* 添加背景图 */
  //background-size: contain; /* 保证图片完全显示且不被裁剪 */
  //background-position: center; /* 保证图片居中 */
  //background-repeat: no-repeat; /* 防止背景图重复 */

  color: $tooltip-text-color;
  border-radius: 10px;
  border: 2px solid $tooltip-border-color;
  box-shadow: 0 0 15px rgba(0, 161, 255, 0.6);
  text-align: left;
  overflow: hidden;

  transform: scale(0.8); // 将整个框缩小到 80%
  transform-origin: top left; // 保持缩放从左上角开始

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: 2px solid $tooltip-border-color;
    pointer-events: none;
    animation: pulse-border 2s infinite alternate;
  }

  &::before {
    top: -4px;
    left: -4px;
  }

  &::after {
    bottom: -4px;
    right: -4px;
  }

  ._head,
  ._body {
    margin: 5px 0;
  }

  .windows_close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    transform: rotate(45deg);

    &::before,
    &::after {
      content: '';
      position: absolute;
      //background-color: $closeColor;
    }

    &::before {
      width: 12px;
      height: 2px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      width: 2px;
      height: 12px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

@keyframes pulse-border {
  from {
    box-shadow: 0 0 15px rgba(0, 161, 255, 0.8);
  }
  to {
    box-shadow: 0 0 30px rgba(0, 161, 255, 0.4);
  }
}
</style>
