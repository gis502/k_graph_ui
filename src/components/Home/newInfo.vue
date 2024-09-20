<template>
  <div class="newIn">
    <el-col>
      <div class="eqName">
        {{ eqName }}
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        发震时间：{{ time }}
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        震中经纬：东经{{ longitude }}度 北纬{{ latitude }}度
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        地震震级：{{ Number(magnitude).toFixed(1) }}
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        震源深度：{{ Number(depth) }} 千米
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        震中位置：{{ position }}
      </div>
    </el-col>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps(['lastEq']);
const eqName = ref('');
const position = ref('');
const time = ref('');
const magnitude = ref('');
const longitude = ref('');
const latitude = ref('');
const depth = ref('');


watch(() => props.lastEq, () => {
  initNewEq();
});

const initNewEq = () => {
  eqName.value = props.lastEq.position + props.lastEq.magnitude + '级地震';
  time.value = props.lastEq.time.replace('T', ' ');
  magnitude.value = props.lastEq.magnitude;
  longitude.value = props.lastEq.longitude;
  latitude.value = props.lastEq.latitude;
  position.value = props.lastEq.position;
  depth.value = props.lastEq.depth;
}

</script>

<style scoped>
.newIn {
  color: #fff;
  width: 100%;
  height: 100%;
  line-height: 3.4vh;
}

.newColCommon {
  padding-left: 10px;
}

.eqName {
  margin-left: 10px;
  font-size: 18px;
}
</style>
