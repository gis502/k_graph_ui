<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">保障安置点供水统计<br>
        <EnsureWaterSupplyResettlementSites :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">集中供水工程受损统计<br>
        <ConcentratedWaterSupplyProjectDamage :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">房屋损毁情况<br/>
        <StatusOfHousingDamage :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import ConcentratedWaterSupplyProjectDamage from "@/components/DisasterStatistics/ConcentratedWaterSupplyProjectDamage.vue";
import EnsureWaterSupplyResettlementSites from "@/components/DisasterStatistics/EnsureWaterSupplyResettlementSites.vue";
import StatusOfHousingDamage from "@/components/DisasterStatistics/StatusOfHousingDamage.vue";
import {defineProps, ref, watch} from "vue";

// 获取父组件的 eqid
const userInputTime = ref('')
// 获取父组件的 eqid
const props = defineProps({
  newEqId:{
    type: String,
    required: true
  },
  userInput:{
    type:[String, Date],
    required: true
  }
});

watch(()=>props.userInput,(newValue) => {
  userInputTime.value = newValue;
})


// 响应式变量
const eqid = ref('');
// 监听 props 的变化
watch(() => props.newEqId, (newValue) => {
  eqid.value = newValue;
  console.log("建筑损毁板块中的 eqId:", eqid.value); // 确认更新后的值
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