<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">物资捐赠情况<br>
        <GoodsDonation :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">红十字会系统接收捐赠资金情况<br>
        <RedCrossDonation :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">政府部门接收捐赠资金情况<br/>
        <GovernmentDepartmentDonation :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">慈善组织接收捐赠资金情况<br/>
        <CharitableOrganization :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import {defineProps, ref, watch} from "vue";
import GoodsDonation from "./GoodsDonation";
import RedCrossDonation from "./RedCrossDonation";
import GovernmentDepartmentDonation from "./GovernmentDepartmentDonation";
import CharitableOrganization from "./CharitableOrganization";

const userInputTime = ref('')
// 获取父组件的 eqid
const props = defineProps({
  newEqId:{
    type: String,
    required: true
  },
  userInput:{
    type:[String,Date],
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