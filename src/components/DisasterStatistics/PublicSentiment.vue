<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model2">社会秩序情况<br>
        <SocialOrder :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
      <dv-border-box-12 class="model2">宣传舆论情况<br/>
        <PublicOpinion :eqid="eqid" :userInput="userInputTime"/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script setup>
import {defineProps, ref, watch} from "vue";
import SocialOrder from "./SocialOrder";
import PublicOpinion from "./PublicOpinion";

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
  padding-right:40px;
}

.container-center {
  width: 100%;
  height: calc(100vh - 90px);
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