<template>
  <div class="card-layout">
    <span
        style="position: fixed; padding-left: 0px; margin-top: 4%; font-size: 17px; color: #fff; font-weight: bold;">
      地形地貌
    </span>
    <div class="card-list">
      <div class="top-box">
        <div class="card top-left">
          <p class="top-title">最高海拔</p>
          <p class="top-value">{{ stats.highestAltitude }} <span class="unit">米</span></p>
        </div>
        <div class="card top-right">
          <p class="top-title">最低海拔</p>
          <p class="top-value">{{ stats.minimumAltitude }} <span class="unit">米</span></p>
        </div>
      </div>
      <div class="card center">
        <p class="main-title">{{ stats.countyDistrict }}</p>
      </div>
      <div class="bottom-box">
        <div class="card bottom-left">
          <p class="bottom-title">地貌</p>
          <p class="bottom-value">{{ stats.landform }}</p>
        </div>
        <div class="card bottom-right">
          <p class="bottom-title">地形</p>
          <p class="bottom-value">{{ stats.terrain }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {getDistrictTerrain} from "@/api/system/districtEconomy.js"; //地形、经济
import {defineProps, nextTick, onMounted} from "vue";

const props = defineProps({
  centerPoint: String
});
// 监听 props.centerPoint 的变化
watch(() => props.centerPoint, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchDistrictEconomy()
  }
});

// 卡片数据初定义
const stats = ref({
  highestAltitude: '_', // 最高海拔
  minimumAltitude: '_', // 最低海拔
  countyDistrict: 0, // 区县
  landform: '暂无数据', // 地貌
  terrain: '暂无数据', // 地形
});

//接收卡片信息
const fetchDistrictEconomy = async () => {
  if(props.centerPoint&&props.centerPoint.earthquakeName.slice(-3)){
    try {
      const response = await getDistrictTerrain(props.centerPoint.earthquakeName.slice(-3)); // 根据年份动态获取数据
      console.log(response,"response baseInfoDisTer")
      // 如果找到匹配的区县数据，则填充对应的字段
      stats.value.highestAltitude = response.highestAltitude||'_';
      stats.value.minimumAltitude = response.minimumAltitude||'_';
      stats.value.countyDistrict = response.countyDistrict||0;
      stats.value.landform = response.landform ||'暂无数据';
      stats.value.terrain = response.terrain||'暂无数据';
    }
    catch (error) {
      console.error("获取区县卡片数据失败:", error);
    }
  }
};


onMounted(() => {
  nextTick(() => {
    fetchDistrictEconomy(); // 调用卡片获取数据的方法

    // initCharts(); // 确保 DOM 渲染后初始化图表

    // window.addEventListener('resize', resizeCharts); // 监听窗口大小变化
  });
});

</script>

<style scoped>
.card-layout {
  position: relative;
  background-image: url("@/assets/images/CommandScreen/左下角卡片.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 85%;
  height: 85%;
  left: 3%;
}

.card-list {
  position: relative;
  width: 100%;
  height: 100%;
}

.top-box {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 19%;
  width: 91%;
  left: 3.2%;
}

.card.top-left {
  flex: 1;
  text-align: left;
  margin-right: 3%;
}

.card.top-right {
  flex: 1;
  text-align: right;
  margin-left: 3%;
}

.card.center {
  position: absolute;
  top: 49%;
  left: 48.5%;
  transform: translate(-50%, -50%);
  width: 18%;
  height: 18%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bottom-box {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 15%;
  width: 91%;
  left: 3.2%;
}

.card.bottom-left {
  flex: 1;
  text-align: left;
  margin-right: 11%;
}

.card.bottom-right {
  flex: 1;
  text-align: right;
  margin-left: 3%;
}

.card .top-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.card .bottom-title {
  font-size: 16px;
  color: #fff;
}

.card .top-value {
  font-size: 18px;
  font-weight: bold;
  margin-top: -7px;
  color: #fff;
}

.card .bottom-value {
  font-size: 11px;
  font-weight: bold;
  margin-top: -5px;
  color: rgba(255, 255, 255, 0.7);
}

.card .main-title {
  font-size: 15px;
  font-weight: bold;
  color: #fff;
}

.card .unit {
  font-size: 18px;
  color: #fff;
}
</style>