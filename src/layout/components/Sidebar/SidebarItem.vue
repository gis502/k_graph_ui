<template>
  <div v-if="!item.hidden">
    <!-- 只有一个子菜单时，直接展示 `el-menu-item` -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
          <el-menu-item
              :index="resolvePath(onlyOneChild.path)"
              :class="{ 'active': activeIndex === resolvePath(onlyOneChild.path) }"
          >
            <div class="icon">
              <div class="imageBox">
                <svg-icon :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" style="margin-left: 13px" />
              </div>
            </div>
            <div class="text">{{ onlyOneChild.meta.title }}</div>
          </el-menu-item>
      </app-link>
    </template>

    <!-- 有多个子菜单时，展示 `el-sub-menu` -->
    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <div class="icon">
          <div class="imageBox">
            <svg-icon :icon-class="item.meta && item.meta.icon" />
          </div>
        </div>
        <span class="menu-title">{{ item.meta.title }}</span>
      </template>

      <sidebar-item
          v-for="(child, index) in item.children"
          :key="child.path + index"
          :is-nest="true"
          :item="child"
          :base-path="resolvePath(child.path)"
          class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { isExternal } from "@/utils/validate";
import AppLink from "./Link";
import { getNormalPath } from "@/utils/yaan";
import { useRoute } from "vue-router";

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ""
  }
});

const route = useRoute();
const onlyOneChild = ref({});
const activeIndex = ref(route.path); // 监听当前选中的路径

// 监听路由变化，更新 `activeIndex`
watch(() => route.path, (newPath) => {
  activeIndex.value = newPath;
});

function hasOneShowingChild(children = [], parent) {
  if (!children) {
    children = [];
  }
  const showingChildren = children.filter(item => !item.hidden);

  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0];
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery);
    return { path: getNormalPath(props.basePath + "/" + routePath), query };
  }
  return getNormalPath(props.basePath + "/" + routePath);
}
</script>

