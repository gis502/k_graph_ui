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
        <div class="lonlat newColCommon">
          震中经纬：{{ longitude }},{{ latitude }}
        </div>
      </el-col>
      <el-col>
        <div class="magnitude newColCommon">
          地震震级：{{ magnitude.toFixed(1) }}
        </div>
      </el-col>
      <el-col>
        <div class="depth newColCommon">
          震源深度：{{ depth }}
        </div>
      </el-col>
      <el-col>
        <div class="position newColCommon">
          参考位置：{{ position }}
        </div>
      </el-col>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {BorderBox13 as DvBorderBox13} from '@kjgl77/datav-vue3'

const eqName = ref('四川泸州市泸县3级地震');
const position = ref('四川泸州市泸县');
const time = ref('2024-08-02 00:18:02');
const magnitude = ref(3);
const longitude = ref('105.56');
const latitude = ref('29.24');
const depth = ref('8');
</script>

<style scoped>
.newIn {
  color: #fff;
  width: 100%;
  height: 100%;
}

.newColCommon {
  padding-left: 10px;
}

.eqName {
  margin-left: 10px;
  font-size: 18px;
}
</style>
