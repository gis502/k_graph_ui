<template>
  <el-select
      v-model="selectedComponentKey"
      placeholder="请选择模块"
      size="large"
      @change="handleComponentChange"
      style="width: 220px"
  >
    <el-option
        v-for="option in this.options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
    />
  </el-select>
  <div height="650px" interval="3000">
    <div
        v-for="(component, key) in componentMap"
        :key="key"
        v-show="selectedComponentKey === key"
    >
      <component :is="component" :eqid="eqid" />
    </div>
  </div>

</template>

<script>
import earthquakeCasualties from  "./disasterStatisticsComponents/earthquakeCasualties.vue"
import transportationElectricity from  "./disasterStatisticsComponents/transportationElectricity.vue"
import buildingDamageInformation from  "./disasterStatisticsComponents/buildingDamageInformation.vue"
import secondaryDisaster from  "./disasterStatisticsComponents/secondaryDisaster.vue"
import resourceStrength from  "./disasterStatisticsComponents/resourceStrength.vue"
import materialDonation from  "./disasterStatisticsComponents/materialDonation.vue"
import publicSentiment from  "./disasterStatisticsComponents/publicSentiment.vue"
export default {
  components: {
    earthquakeCasualties,
    transportationElectricity,
    buildingDamageInformation,
    secondaryDisaster,
    resourceStrength,
    materialDonation,
    publicSentiment
  },
  props: ["currentTime", "currentTime","eqid"],
  name: "",
  data() {
    return {
      selectedComponentKey: 'earthquakeCasualties',
      options: [
        {label: '震情伤亡信息专题图', value: 'earthquakeCasualties'},
        {label: '交通电力通信信息专题图', value: 'transportationElectricity'},
        {label: '建筑物受损信息专题图', value: 'buildingDamageInformation'},
        {label: '次生灾害信息专题图', value: 'secondaryDisaster'},
        {label: '力量物资信息专题图', value: 'resourceStrength'},
        {label: '资金及物资捐赠专题图', value: 'materialDonation'},
        {label: '宣传舆情治安专题图', value: 'publicSentiment'}
      ],
      componentMap: {
        earthquakeCasualties,
        transportationElectricity,
        buildingDamageInformation,
        secondaryDisaster,
        resourceStrength,
        materialDonation,
        publicSentiment
      },
    }
  },
  mounted() {

  },
  methods: {
    // 切换模块组件
    handleComponentChange(value) {
      // You can handle any additional logic here when a component is selected
      console.log(`Selected component: ${this.selectedComponentKey}`);
      // if (this.selectedComponentKey === 'EarthquakeCasualties') {
      //
      // }
      // if (this.selectedComponentKey === 'TransportationElectricity') {
      //
      // }
      // if (this.selectedComponentKey === 'BuildingDamageInformation') {
      //
      // }
      // if (this.selectedComponentKey === 'SecondaryDisaster') {
      //
      // }
      // if (this.selectedComponentKey === 'ResourceStrength') {
      //
      // }
      // if (this.selectedComponentKey === 'MaterialDonation') {
      //
      // }
      // if (this.selectedComponentKey === 'PublicSentiment') {
      //
      // }
    },
  },
};
</script>

<style scoped>

</style>
