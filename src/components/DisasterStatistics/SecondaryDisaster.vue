<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">堰塞湖雍塞体统计<br>
        <BarrierLakeSituation :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">山洪危险区情况<br>
        <MountainFlood :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">地质灾害情况<br/>
        <GeologicalDisaster :eqid="eqid"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import MountainFlood from "@/components/DisasterStatistics/MountainFlood.vue";
import BarrierLakeSituation from "@/components/DisasterStatistics/BarrierLakeSituation.vue";
import GeologicalDisaster from "@/components/DisasterStatistics/GeologicalDisaster.vue";
import { ref, watch } from "vue";

// 获取父组件的 eqid
const props = defineProps({
  newEqId: {
    type: String,
    required: true
  }
});

// 响应式变量
const eqid = ref('');
// 监听 props 的变化
watch(() => props.newEqId, (newValue) => {
  eqid.value = newValue;
});
</script>


<style scoped>
.style-container {
  width: 100%;
  height: calc(100vh - 50px);
  background-image: url("@/assets/bg1.png");
  background-size: 100% 100%;
  position: absolute;
  padding-right:40px;
}
.container-center {
  width: 100%;
  height: calc(100vh - 90px);
}
.model1 {
  width: 48%;
  height: 40%;
  position: relative;
  text-align: center;
  float: right;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
  padding-top: 10px;
}
.model2 {
  width: 100%;
  height: 50%;
  font-size: 25px;
  position: relative;
  float: left;
  text-align: center;
  color: #FFFFFF;
  padding-top:10px;
}

</style>