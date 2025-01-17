<template>
  <div class="pop-new">
    <div class="pop_header">
      <h2 class="pop_title">基础信息</h2>
    </div>
    <div class="main">
      <el-carousel
          autoplay="3000"
          arrow="always"
          :initial-index="initialIndex"
          indicator-position="none">
        <el-carousel-item>
          <BaseInfoPopulationChart :centerPoint="centerPoint"/>
        </el-carousel-item>
        <el-carousel-item>
          <BaseInfoDistrictTerrain :centerPoint="centerPoint"/>
        </el-carousel-item>
        <el-carousel-item>
          <BaseInfoEconomyChart :centerPoint="centerPoint"/>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
import BaseInfoPopulationChart from "@/components/timeLineComponent/baseInfoPopulationChart.vue";
import BaseInfoDistrictTerrain from "@/components/timeLineComponent/baseInfoDistrictTerrain.vue";
import BaseInfoEconomyChart from "@/components/timeLineComponent/baseInfoEconomyChart.vue";
import {ref} from "vue";
import {ElCarousel, ElCarouselItem} from 'element-plus';

export default {
  components: {
    BaseInfoEconomyChart,
    BaseInfoDistrictTerrain,
    BaseInfoPopulationChart,
    ElCarousel,
    ElCarouselItem
  },
  data: function () {
    return {
      initialIndex: 0,
    }
  },
  props: ['centerPoint'],
  created() {
  },
  mounted() {
  },
  methods: {}
}
</script>

<style scoped>
.pop-new {
  position: absolute;
  top: 51%;
  height: 28%;
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
}

.pop_header {
  top: -2%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  font-family: 'myFirstFont', sans-serif;
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
}

.main {
  width: 100%;
  height: 100%;
  margin-top: -7px;
}
</style>