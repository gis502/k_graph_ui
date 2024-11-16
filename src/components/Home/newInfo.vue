<template>
  <div class="newIn">
    <el-col>
      <div class="eqName">
        {{ eqName }}
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/时间.png" class="icon" />
        <span>发震时间：{{ time }}</span>
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/经纬度.png" class="icon" />
        <span>震中经纬：东经{{ longitude }}度 北纬{{ latitude }}度</span>
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/震级.png" class="icon" />
        <span>地震震级：{{ Number(magnitude).toFixed(1) }} 级</span>
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/震源深度.png" class="icon" />
        <span>震源深度：{{ Number(depth) }} 千米</span>
      </div>
    </el-col>
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/震中位置.png" class="icon" />
        <span>震中位置：{{ position }}</span>
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
  line-height: 1.7; /* 缩小行高 */
  font-size: 9px; /* 调整整体字体大小 */
  padding: 0 12px; /* 左右保留5px边距，上下无边距 */
}

.eqName {
  margin-bottom: 2px; /* 添加与下方内容的间距 */
  font-size: 13px; /* 调整标题字体大小 */
  font-weight: bold;
  text-align: center; /* 水平居中 */
  color: white;
}

.newColCommon {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  margin: 3px 0; /* 减少行间距 */
  overflow: hidden; /* 防止内容溢出 */
  font-size: 13px;
}

.icon {
  width: 18px; /* 缩小图标宽度 */
  height: 18px; /* 缩小图标高度 */
  margin-right: 5px; /* 减少图标和文字之间的间距 */
}

span {
  flex: 1; /* 文字自动占用剩余空间 */
  white-space: nowrap; /* 避免文字换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
}
</style>

