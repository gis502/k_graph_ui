<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">救援物资情况<br>
        <ReliefSupplies :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">大型、特种救援装备情况<br>
        <RescueEquipment :eqid="eqid"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">救援力量情况<br/>
        <RescueTeams :eqid="eqid"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ReliefSupplies from "./ReliefSupplies";
import RescueEquipment from "./RescueEquipment";
import RescueTeams from "./RescueTeams";

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