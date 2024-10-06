<template>
  <div class="style-container">
    <div class="container-center">
      <dv-border-box-12 class="model1">当前累计中断情况<br>
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <CumulativeInterruption/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">电力设施损毁及抢修情况<br>
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <PowerSupply/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">道路交通损毁及抢修情况与交通管控情况<br/>
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <RoadDamage/>
      </dv-border-box-12>
      <dv-border-box-12 class="model1">通信设施损毁及抢修情况<br/>
        <p style="margin: 0;font-size: 16px;color: orangered">最新上传时间：{{ time }}</p>
        <TrafficSituation/>
      </dv-border-box-12>
    </div>
  </div>
</template>

<script>
import PowerSupply from "@/components/DisasterStatistics/PowerSupply.vue";
import CumulativeInterruption from "@/components/DisasterStatistics/CumulativeInterruption.vue"
import RoadDamage from "@/components/DisasterStatistics/RoadDamage.vue";
import TrafficSituation from "@/components/DisasterStatistics/TrafficSituation.vue";
import {ref} from "vue";

export default {
  name: "TransportationElectricity",
  data() {
    return {
      time: '2024-09-05 15:30:00'
    }
  },
  methods: {
    toggleTable() {
      this.showTable = !this.showTable;
      // 这里可以添加切换表格的逻辑
    }
  },
  components: { PowerSupply, CumulativeInterruption, RoadDamage, TrafficSituation }
}
</script>

<style scoped>
.model1 {
  width: 48%;
  height: 52%;
  position: relative;
  text-align: center;
  float: left;
  font-size: 20px;
  margin: 10px;
  color: #FFFFFF;
  padding-top: 10px;
}

</style>
