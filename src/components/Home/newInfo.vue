<template>
  <div class="newIn">
    <el-col>
      <div class="eqName">
        {{ eqName }}{{ Number(magnitude).toFixed(1) }} 级地震
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
        <span>震中经纬：东经{{ Number(longitude).toFixed(2) }}度 北纬{{  Number(latitude).toFixed(2) }}度</span>
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
    <el-col>
      <div class="newColCommon">
        <img src="@/assets/震中位置.png" class="icon" />
        <span>地震类型：{{ earthquakeType }}</span>
      </div>
    </el-col>
<!--    <el-col>-->
<!--      <div class="newColCommon">-->
<!--        <img src="@/assets/震中位置.png" class="icon" />-->
<!--        <span>信息来源：中国地震预警网[试运行]</span>-->
<!--      </div>-->
<!--    </el-col>-->
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
const earthquakeType = ref('');


watch(() => props.lastEq, () => {
  if (props.lastEq) {
    initNewEq();
  }
  console.log("props.lastEq",props.lastEq)
});

const initNewEq = () => {
  console.log("111111111",props.lastEq)
  eqName.value = props.lastEq.earthquakeName;
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
  longitude.value = props.lastEq.longitude || props.lastEq.geom.coordinates[0];
  latitude.value = props.lastEq.latitude || props.lastEq.geom.coordinates[1];
  position.value = props.lastEq.earthquakeName;
  depth.value = props.lastEq.depth;
  earthquakeType.value = props.lastEq.eqType;
  if (earthquakeType.value === 'Z') {
    // 如果值为 Z，设置为“正式地震”
    earthquakeType.value = '真实地震';
  } else if (earthquakeType.value === 'Y' || earthquakeType.value === 'T') {
    // 如果值为 Y 或 T，设置为“测试地址”
    earthquakeType.value = '测试地震';
  }
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
  margin-bottom: -0.6%;
  font-size: 13px;
  font-weight: bold;
  text-align: center;/* 字体水平居中 */
  color: white;
  margin-top: -2.5%;
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

