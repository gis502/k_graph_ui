<template>
  <div class="content">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane name="first">
        <template #label>
          <el-dropdown @command="handleChangeShowType">
            <span :class="dropdownClass" class="el-dropdown-link">
              文件型<el-icon class="el-icon--right"><arrow-down/></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="tilt">倾斜影像</el-dropdown-item>
                <el-dropdown-item command="ortho">正射影像</el-dropdown-item>
                <el-dropdown-item command="remote">遥感影像</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <!-- 根据 selectedType 显示不同的组件 -->
        <tiltPhotography v-if="selectedType === 'tilt'"/>
        <orthophotoImage v-if="selectedType === 'ortho'"/>
        <remotesensingimage v-if="selectedType === 'remote'"/>
      </el-tab-pane>
      <el-tab-pane label="结构型" name="second">
        <database></database>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import tiltPhotography from '@/views/model/tiltPhotography/index.vue'
import orthophotoImage from '@/views/model/orthophotoImage/index.vue'
import remotesensingimage from '@/views/model/remotesensingimage/index.vue'
import database from '@/views/system/data/database.vue'
import {ArrowDown} from "@element-plus/icons-vue";

const activeName = ref('first')
const selectedType = ref('tilt')

// 计算属性，用于设置文件型选项卡的颜色
const dropdownClass = computed(() => {
  return activeName.value === 'first' ? 'active-tab' : 'inactive-tab'
})

const handleClick = (tab, event) => {
  activeName.value = tab.paneName
}

const handleChangeShowType = (type) => {
  activeName.value = 'first'
  selectedType.value = type;
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

/* 设置文件型选项卡的默认颜色 */
.inactive-tab {
  color: rgb(23, 23, 23) !important; /* 黑色 */
}

/* 设置文件型选项卡激活时的颜色 */
.active-tab {
  color: rgb(0, 123, 255) !important; /* 蓝色 */
}
</style>
