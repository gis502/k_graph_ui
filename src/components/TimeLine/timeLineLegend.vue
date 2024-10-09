<template>
  <div class="timelineLegend" :class="{ 'open': activeComponent === 'legend' }">
    <div class="legend-header" @click="toggleLegend">
      <p class="legend-title" :class="{ 'centered': activeComponent === 'legend' }">图例</p>
      <span class="toggle-icon">{{ activeComponent === 'legend' ? '▼' : '▲' }}</span>
    </div>
    <div class="legend-items" v-if="activeComponent === 'legend'">
      <div class="legend-item">
      <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />
      <span class="legend-label">震中</span>
      </div>
      <div v-for="item in getPicData" :key="item.label" class="legend-item">
        <img class="legend-img" :src="item.img" />
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
    <div class="legend-items-close" v-if="activeComponent !== 'legend'">
      <div class="close-item">
        <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />
        <span class="legend-label">震中</span>
      </div>
      <div class="close-item">
        <img class="legend-img" src="@/assets/icons/TimeLine/重伤人员.png" />
        <span class="legend-label">重伤人员</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlotIcon } from "@/api/system/plot.js";


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
  methods: {
    toggleLegend() {
      const newComponent = this.activeComponent === 'legend' ? null : 'legend';
      this.$emit('toggleComponent', newComponent);
    },
    getPlotPicture() {
      let that=this
      getPlotIcon().then(res => {
        that.getPicData = res.data;
      });
    }
  }
};
</script>

<style scoped>
.timelineLegend {
  width: 25%;
  height: 5%;
  left: 1%;
  bottom: 9%;
  padding: 0px;
  position: absolute;
  background-color: rgba(40, 40, 40, 0.7);
  box-sizing: border-box;
  color: white;
  z-index: 20;
  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, bottom 0.3s ease-in-out;
}

.timelineLegend.open {
  width: 25%;
  height: 81%;
  bottom: 9%;
  right: 1%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(40, 40, 40);
}

.legend-header {
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
}

.legend-items-close {
  background-color: #0d325f;
  display: flex;
  flex-wrap: wrap; /* 设置子元素换行 */
  justify-content: space-between; /* 两列均分 */
  align-items: flex-start;
  padding-top: 0;
  background-color: rgba(40, 40, 40, 0.7);
  width: 100%;
}

.close-item {
  display: flex;
  align-items: flex-start;
  width: 50%; /* 每个子元素占父容器的一半 */
  margin-bottom: 10px; /* 调整间距 */
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
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 子项均匀分布 */
  max-height: 93%;
  overflow-y: auto;
  width: 100%;
}

.legend-img {
  max-height: 20px;
  max-width: 20px;
}

.legend-item {
  width: 50%; /* 每个子项占据父容器的一半 */
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-label {
  font-size: 0.9rem;
  text-indent: 0.5em;
}
</style>


<!--<template>-->
<!--  <div class="timeLineLegend" :class="{ 'open': activeComponent === 'legend' }">-->
<!--    <div class="legend-header" @click="toggleLegend">-->
<!--      <p class="legend-title" :class="{ 'centered': activeComponent === 'legend' }">图例</p>-->
<!--      <span class="toggle-icon">{{ activeComponent === 'legend' ? '▼' : '▲' }}</span>-->
<!--    </div>-->
<!--    <div class="legend-items" v-if="activeComponent === 'legend'">-->
<!--      <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />-->
<!--      <span class="legend-label">震中</span>-->
<!--      <div v-for="item in getPicData" :key="item.label" class="legend-item">-->
<!--        <img class="legend-img" :src="item.img" />-->
<!--        <span class="legend-label">{{ item.name }}</span>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="legend-items-close" v-if="activeComponent !== 'legend'">-->
<!--      <div class="close-item">-->
<!--        <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />-->
<!--        <span class="legend-label">震中</span>-->
<!--      </div>-->
<!--      <div class="close-item">-->
<!--        <div data-v-ea51eb17="" class="legend-item"><img data-v-ea51eb17="" class="legend-img" src="data:image/png;base64,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"><span data-v-ea51eb17="" class="legend-label">重伤人员</span></div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { getPlotIcon } from "@/api/system/plot.js";-->


<!--export default {-->
<!--  props: ['activeComponent'],-->
<!--  data() {-->
<!--    return {-->
<!--      getPicData: [],-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.getPlotPicture();-->
<!--  },-->
<!--  methods: {-->
<!--    toggleLegend() {-->
<!--      const newComponent = this.activeComponent === 'legend' ? null : 'legend';-->
<!--      this.$emit('toggleComponent', newComponent);-->
<!--    },-->
<!--    getPlotPicture() {-->
<!--      let that=this-->
<!--      getPlotIcon().then(res => {-->
<!--        that.getPicData = res.data;-->
<!--        // console.log("123",this.getPicData)-->
<!--      });-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.timeLineLegend {-->
<!--  width: 25%;-->
<!--  height: 5%;-->
<!--  left: 1%;-->
<!--  bottom: 9%;-->
<!--  padding: 0px;-->
<!--  position: absolute;-->
<!--  background-color: rgba(40, 40, 40, 0.7);-->
<!--  box-sizing: border-box;-->
<!--  color: white;-->
<!--  z-index: 20;-->
<!--  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, bottom 0.3s ease-in-out;-->
<!--}-->

<!--.timeLineLegend.open {-->
<!--  width: 25%;-->
<!--  height: 81%;-->
<!--  bottom: 9%;-->
<!--  right: 1%;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: center;-->
<!--  background-color: rgba(40, 40, 40);-->
<!--}-->

<!--.legend-header {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--  cursor: pointer;-->
<!--  width: 100%;-->
<!--  bottom:100%;-->
<!--}-->
<!--.legend-items-close {-->
<!--  background-color: #0d325f;-->
<!--  display: flex;-->
<!--  justify-content: flex-start; /* 子元素靠左对齐 */-->
<!--  align-items: flex-start; /* 子元素在交叉轴上的起始位置对齐 */-->
<!--  padding-top: 0px;-->
<!--  background-color: rgba(40, 40, 40, 0.7);-->
<!--  width: 100%;-->
<!--}-->
<!--.close-item{-->
<!--  display: flex;-->
<!--  align-items: flex-start; /* 子元素垂直居中 */-->
<!--  margin-right: 11%; /* 根据需要调整间距 */-->
<!--}-->
<!--.legend-title {-->
<!--  margin-top: 0;-->
<!--  margin-bottom: 10px;-->
<!--  text-align: left;-->
<!--}-->

<!--.legend-title.centered {-->
<!--  text-align: center;-->
<!--}-->

<!--.toggle-icon {-->
<!--  margin-left: 10px;-->
<!--}-->

<!--.legend-items {-->
<!--  max-height: 93%;-->
<!--  overflow-y: auto;-->
<!--  width: 100%;-->
<!--}-->

<!--.legend-img{-->
<!--  max-height: 20px;-->
<!--  max-width: 20px;-->
<!--}-->
<!--.legend-item {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  margin-bottom: 10px;-->
<!--}-->

<!--.legend-label {-->
<!--  font-size: 0.9rem;-->
<!--  text-indent: 0.5em;-->

<!--}-->
<!--</style>-->
