<template>
  <div class="infowindowClass">
    <div class="windows_close" @click="close" title="关闭信息窗口"></div>
    <div class="_head">信息窗口</div>
    <div class="_body">
      <div class="info-item"><strong>位置:</strong> {{ position }}</div>
      <div class="info-item"><strong>发震时间:</strong> {{ time }}</div>
      <div class="info-item"><strong>震级:</strong> {{ magnitude }}</div>
      <div class="info-item"><strong>震源深度:</strong> {{ depth }}</div>
      <div class="info-item"><strong>经纬度:</strong>{{ latitude }}, {{ longitude }}</div>
    </div>
    <div class="_foot">
      <el-button type="primary" @click="callback">确定</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    props: {

      // 传递数据对象
      data: {
        type: Object,
        default: () => ({}),  // 可以返回一个空对象
      },
      // 信息窗口对象
      infoWindow: {
        type: Object,
        default: () => ({}),  // 可以返回一个空对象
      },
    },

    computed: {
      // 计算属性从 data 中提取信息
      position() { return this.data.position || '未知位置'; },
      time() { return this.data.time || '未知时间'; },
      magnitude() { return this.data.magnitude || '未知震级'; },
      depth() { return this.data.depth || '未知深度'; },
      latitude() { return this.data.latitude || '未知纬度'; },
      longitude() { return this.data.longitude || '未知经度'; }
    },

    methods: {
      // 关闭
      close() {
        this.$emit('update:showInfoWindow', false);
        this.infoWindow.closeInfoWindow();
      },
      // 确认回调
      callback() {
        this.$emit('callback', this.data);
      },
    },
  }
</script>

<style lang="scss">
$tooltip-background: rgba(241, 229, 229, 0.7);
$tooltip-border-color: #fff;
$tooltip-text-color: #fff;


  // $color: red;
  $color: rgba(255, 255, 255, 1);

  // 信息窗口隐藏源码样式
  .tdt-infowindow-content-wrapper,
  .tdt-infowindow-tiptdt-infowindow-content-wrapper {
    color: unset;
    background: transparent;
    box-shadow: unset;
  }
  .tdt-infowindow-content {
    margin: 0;
  }

  .tdt-infowindow-tip-container {
    display: none;
  }

  // 信息窗口隐藏源码样式 - end
  .infowindowClass {
    position: relative;
    // position: absolute;
    // top: 0;
    // left: 0;
    display: flex;
    flex-direction: column;
    width: 300px;
    height: 150px;
    padding: 10px;
    background-color: $tooltip-background;
    border-radius: 10px;
    // zhtips: 三角形
    &::before {
      position: absolute;
      bottom: -9px;
      left: 50%;
      width: 0;
      height: 0;
      content: '';
      border-color: $color transparent transparent transparent;
      border-style: solid;
      border-width: 10px 10px 0 10px;
      transform: translate(-50%, 0);
    }

    ._head {
      padding-bottom: 2px;
    }
    ._body {
      flex: 1;
    }
    ._foot {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  //zhtips: 窗口右上角关闭按钮X
  $closeColor: #333;
  .windows_close {
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
    transform: rotate(45deg);
    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      width: 10px;
      height: 1px;
      content: '';
      background-color: $closeColor;
      transform: translate3d(-50%, -50%, 0);
    }

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      width: 1px;
      height: 10px;
      content: '';
      background-color: $closeColor;
      transform: translate3d(-50%, -50%, 0);
    }
  }
</style>

