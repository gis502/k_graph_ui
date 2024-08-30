<template>
  <div class="timeLineLegend" :class="{ 'open': isOpen }">
    <div class="legend-header" @click="toggleLegend">
      <p class="legend-title" :class="{ 'centered': isOpen }">图例</p>
      <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
    </div>
    <div class="legend-items" v-if="isOpen">
<!--      <img style="width: 17%;height: 5%" src="@/assets/icons/TimeLine/震中.png" /> <span class="legend-label">震中</span>-->
      <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" /> <span class="legend-label">震中</span>
      <div v-for="item in getPicData" :key="item.label" class="legend-item">
<!--        <img style="width: 18%;height: 18%" :src="item.img" />-->
        <img class="legend-img" :src="item.img" />
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>


import {getPlotIcon} from "@/api/system/plot.js";

export default {
  data() {
    return {
      isOpen: false,
      // isOpen: true,
      getPicData:[

      ],
    };
  },


  mounted() {
    this.getPlotPicture()
  },
  methods: {
    toggleLegend() {
      this.isOpen = !this.isOpen;
      // if(this.isOpen){
      //   this.getPlotPicture()
      // }
    },
    getPlotPicture(){
      let that = this
      getPlotIcon().then(res => {
        that.getPicData = res
        // console.log("that.getPicData11111111111111111111111111111111111111111111111111111",that.getPicData)
      })
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

.legend-icon {
  font-size: 20px;
  margin-right: 10px;
}

.legend-label {
  font-size: 0.9rem;
  text-indent: 0.5em;

}
</style>