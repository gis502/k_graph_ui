
<template>
<!--  涉及标绘点的图层在父组件 thd处理，其他图层要素在这里-->
  <div>
    <el-checkbox-group v-model="selectedlayers" @change="updateMapLayers" class="grid-container">

      <el-checkbox v-for="item in layeritems" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox>

    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  props: ['isMarkingLayer'],
  watch: {
    isMarkingLayer(newVal) {
      this.isMarkingLayerLocal = newVal;
    },
  },
  data() {
    return {
      layeritems: [
        { id: '0', name: '标绘点图层'},
        { id: '1', name: '自建要素图层服务'},
        { id: '2', name: '行政区划要素图层'},
        { id: '3', name: '人口密度要素图层'},
        { id: '4', name: '交通网络要素图层'},
        { id: '5', name: '避难场所要素图层'},
        { id: '6', name: '救援队伍分布要素图层'},
        { id: '7', name: '应急物资存储要素图层'},
      ],
      selectedlayers:['标绘点图层'],
      isMarkingLayerLocal: this.isMarkingLayer,
    };
  },

  methods: {
    updateMapLayers() {
      //标绘点图层和时间联动，是否现实单独处理
      const hasDrawingLayer = this.selectedlayers.includes('标绘点图层');
      if (hasDrawingLayer) {
        this.$emit('updateMarkingLayer',true); // 通知父组件
        this.$emit('updatePlot');
      } else {
        // this.$emit('isMarkingLayer', false);
        this.$emit('updateMarkingLayer', false);
        this.$emit('MarkingLayerRemove');


      }


    },
  }


};
</script>

<style scoped>

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
}
</style>