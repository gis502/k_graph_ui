<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">当前累计中断情况<br>
        <CumulativeInterruption :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">电力设施损毁及抢修情况<br>
        <PowerSupply :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">道路交通损毁及抢修情况与交通管控情况<br/>
        <RoadDamage :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">通信设施损毁及抢修情况<br/>
        <TrafficSituation :eqid="eqid"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import PowerSupply from "@/components/DisasterStatistics/PowerSupply.vue";
import CumulativeInterruption from "@/components/DisasterStatistics/CumulativeInterruption.vue"
import RoadDamage from "@/components/DisasterStatistics/RoadDamage.vue";
import TrafficSituation from "@/components/DisasterStatistics/TrafficSituation.vue";
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
  console.log("交通模块中的 eqId:", eqid.value); // 确认更新后的值
});
</script>

<style scoped>
.style-container {
  width: 100%;
  height: calc(100vh - 50px);
  background-image: url("@/assets/bg1.png");
  background-size: 100% 100%;
  position: absolute;
  padding-right:4px;
}
.model1 {
  width: 48%;
  height: 40%;
  position: relative;
  text-align: center;
  float: left;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
  padding-top: 10px;
}
.model2 {
  width: 48%;
  height: 50%;
  position: relative;
  text-align: center;
  float: left;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
  padding-top: 10px;
}
.container-center {
  width: 100%;
  height: calc(100vh - 90px);
}
</style>
