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
        地震震级：{{ Number(magnitude).toFixed(1) }} 级
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
  eqName.value = props.lastEq.earthquakeName + props.lastEq.magnitude + '级地震';
  // 转换并格式化发震时间
  const date = new Date(props.lastEq.occurrenceTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  time.value = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  magnitude.value = props.lastEq.magnitude;
  longitude.value = props.lastEq.longitude;
  latitude.value = props.lastEq.latitude;
  position.value = props.lastEq.earthquakeName;
  depth.value = props.lastEq.depth;
}

</script>

<style scoped>
.newIn {
  color: #fff;
  width: 100%;
  height: 100%;
  line-height: 2.7vh;
}

.newColCommon {
  padding-left: 10px;
  font-size: 13px;
}

.eqName {
  margin-left: 10px;
  font-size: 14px;
}
</style>
