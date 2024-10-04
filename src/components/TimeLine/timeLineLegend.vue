<template>
  <div class="timeLineLegend" :class="{ 'open': activeComponent === 'legend' }">
    <div class="legend-header" @click="toggleLegend">
      <p class="legend-title" :class="{ 'centered': activeComponent === 'legend' }">图例</p>
      <span class="toggle-icon">{{ activeComponent === 'legend' ? '▼' : '▲' }}</span>
    </div>
    <div class="legend-items" v-if="activeComponent === 'legend'">
      <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />
      <span class="legend-label">震中</span>
      <div v-for="item in getPicData" :key="item.label" class="legend-item">
        <img class="legend-img" :src="item.img" />
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlotIcon } from "@/api/system/plot";


export default {
  props: ['activeComponent'],
  data() {
    return {
      getPicData: [],
    };
  },
  mounted() {
    this.getPlotPicture();
  },
  // created() {
  //   this.getPlotPicture();
  // },
  methods: {
    toggleLegend() {
      const newComponent = this.activeComponent === 'legend' ? null : 'legend';
      this.$emit('toggleComponent', newComponent);
    },
    getPlotPicture() {
      console.log("PlotPicture--------------------")
      let that = this
      getPlotIcon().then(res => {
        console.log("PlotPicture--------------------",res)
        // console.log(res)
        that.getPicData = res.data;
        console.log(that.getPicData)
      });
    }
  }
};
</script>



<style scoped>
.timeLineLegend {
  width: 25%;
  height: 5%;
  left: 1%;
  bottom: 9%;
  padding: 12px;
  position: absolute;
  background-color: rgba(40, 40, 40, 0.7);
  box-sizing: border-box;
  color: white;
  z-index: 20;
  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, bottom 0.3s ease-in-out;
}

.timeLineLegend.open {
  width: 23%;
  height: 81%;
  bottom: 9%;
  right: 1%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(40, 40, 40);
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
  bottom:100%;
}

.legend-title {
  margin-top: 0;
  margin-bottom: 10px;
  text-align: left;
}

.legend-title.centered {
  text-align: center;
}

.toggle-icon {
  margin-left: 10px;
}

.legend-items {
  max-height: 93%;
  overflow-y: auto;
  width: 100%;
}

.legend-img{
  max-height: 20px;
  max-width: 20px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-label {
  font-size: 0.9rem;
  text-indent: 0.5em;

}
</style>
