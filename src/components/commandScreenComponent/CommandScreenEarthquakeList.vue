<template>
  <div>

    <!-- 顶部标题栏 -->
    <div class="panelTop">
      <h2 class="panelName">地震列表</h2>
    </div>

    <!-- 内容区域 -->
    <div class="panelContent">
      <div class="thd-Table">
        <eqlistTable/>
      </div>
    </div>
  </div>
</template>

<script setup>
import eqlistTable from '@/components/Home/eqlistTable.vue'

</script>

<style scoped lang="less">

.panelTop {
  top: 0.5%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  background-color: rgba(40, 59, 77, 0.8);

  .panelName {
    color: #FFFFFF;
    font-size: 1.1rem;
    font-weight: 550;
    position: relative;
    margin: 0;
    top: 26%;
    left: 7%;
  }
}

.panelContent {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  width: 100%;
  margin-top: 30px;

  :deep(.thd-Table ) {
    top: 8%;
    z-index: 30;
    width: 100%;
    height: 85% !important;
    left: -3%;
    position: absolute;
  }
}

</style>