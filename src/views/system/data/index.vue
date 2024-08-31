<template>
  <div class="content">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="文件型" name="first">
        <tiltPhotography></tiltPhotography>
      </el-tab-pane>
      <el-tab-pane label="结构型" name="second">
        <database></database>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import {ref} from 'vue'
import tiltPhotography from '@/views/model/tiltPhotography/index.vue'
import database from '@/views/system/data/database.vue'
const activeName = ref('first')

const handleClick = (tab, event) => {
  console.log(tab, event)
}
</script>

<style scoped>
.content {
  padding: 0;
  margin: 0;
}

:deep(.el-tabs__header) {
  margin-left: 15px;
  margin-bottom: 0;
}
</style>
