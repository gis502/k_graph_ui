<template>
  <div style="margin-top:20px;margin-left: 10px;">
    <span>
                <!-- 视角跳转的 SVG 图标 -->
                  <svg t="1730573546101" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="2695" width="28" height="28" style="margin-right: 8px;">
                        <path
                            d="M1023.886285 0.170629v223.921795l-248.549211-224.1493 248.549211 0.227505z m-185.814707 347.286381v2.218173c113.013108 69.900911 185.814708 174.610087 185.814707 292.571429 0 210.555876-229.211286 381.298378-512 381.298378-282.731837 0-511.943124-170.742502-511.943123-381.298378 0-113.297489 66.88647-214.59409 172.164408-284.438125V299.851589L505.231764 117.392579l332.839814 182.45901v47.605421zM63.701438 642.246612c0 174.837592 201.114419 317.085092 448.184847 317.085092 247.184181 0 448.241724-142.247501 448.241724-317.085092 0-83.778716-46.752277-159.651633-122.056431-216.357254v283.016219l-333.067319 181.890246-332.839813-181.947123V437.83337c-66.658965 55.340591-108.463008 126.151522-108.463008 204.413242z m183.141524 5.630749l227.78938 132.180404V515.753832L246.842962 383.573428v264.303933z m258.161297-449.606754L277.214879 330.394135l227.78938 132.180404 227.846257-132.180404-227.846257-132.123528z m258.218174 185.302821L535.433053 515.753832v262.768274l227.78938-130.644745V383.573428z"
                            fill="#ffffff" p-id="2696"></path>
                      </svg>
                  <span class="node-text">视角跳转</span>
    </span>

    <el-radio-group v-model="selectedDistrictLocal">
      <el-radio label="回到震中" @change="handleDistrictSelect('回到震中')">
        回到震中
      </el-radio>
      <!-- 额外选项：雅安市 -->
      <el-radio label="雅安市" @change="handleDistrictSelect('雅安市')">
        雅安市
      </el-radio>
      <el-radio
          v-for="district in districts"
          :key="district.adcode"
          :label="district.name"
          @change="handleDistrictSelect(district.name)">
        {{ district.name }}
      </el-radio>
    </el-radio-group>

  </div>
</template>

<script>

import * as Cesium from 'cesium'
import layer from "@/cesium/layer.js";

export default {
  data: function () {
    return {
      selectedDistrictLocal: '', // 用于追踪选中的复选框
      districts: [
        {adcode: 511802, name: "雨城区"},
        {adcode: 511803, name: "名山区"},
        {adcode: 511822, name: "荥经县"},
        {adcode: 511823, name: "汉源县"},
        {adcode: 511824, name: "石棉县"},
        {adcode: 511825, name: "天全县"},
        {adcode: 511826, name: "芦山县"},
        {adcode: 511827, name: "宝兴县"},
      ],
    }
  },
  props:["centerPoint","selectedDistrict"],
  watch:{
    selectedDistrict(){
      // console.log("watch selectedDistrict",this.selectedDistrictLocal,this.selectedDistrict)
      this.selectedDistrictLocal=this.selectedDistrict
    }
  },
  mounted() {
    // console.log("mounted selectedDistrict",this.selectedDistrictLocal,this.selectedDistrict)
    if (this.selectedDistrict) {
      this.selectedDistrictLocal = this.selectedDistrict;
      this.handleDistrictSelect(this.selectedDistrict);
    }
  },
  methods: {
    handleDistrictSelect(districtName) {
      //清除其他实体标签
      layer.removeRegionLayerJump();
      this.$emit('viewJumpSelectedDistrict', districtName);

      // 根据选中的区域进行处理
      if (districtName === '雅安市') {
        layer.addYaanCityDistrict();
      } else if (districtName === '回到震中') {
        this.backcenter();
      } else {
        const district = this.districts.find(d => d.name === districtName);
        if (district) {
          layer.addCountyLayerJump(district);
        }
      }
    },
    backcenter() {
      // 根据经度和纬度创建一个三维坐标点，Z轴设置为120000，以确保视角高度
      const position = Cesium.Cartesian3.fromDegrees(
          parseFloat(this.centerPoint.longitude),
          parseFloat(this.centerPoint.latitude),
          120000,
      );
      // 飞行到计算出的中心点位置
      viewer.camera.flyTo({destination: position,})
    },


  }
}


</script>

<style scoped>
/deep/ .el-radio {
  display: block;
  line-height: 50px;
  white-space: normal;
  margin-right: 200px;
  margin-left: 20px;
}
</style>
