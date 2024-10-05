
<template>
  <div class="preview-container">
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=showtmp alt=""/>
  </div>
</template>

<script>
export default {
  data(){
    return {
      showtmp:'',
    }
  },
  props: [
    'showtmp'
  ],
  watch: {
    showtmp(newVal) {
      console.log("newVal",newVal)
      this.showtmp=this.getAssetsFile(newVal)
    },
  },
  mounted() {
    this.showtmp=this.getAssetsFile(this.showtmp)
  },
  methods:{
    getAssetsFile(showtmp) {
      this.showtmp=new URL(showtmp, import.meta.url).href
    },
  }
}
</script>
<style scoped>

.preview-container {
  position: absolute;
  top: 50%;
  left: 40%;
  width: 55%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

}
.preview-image {
  max-width: 100%;
  height: auto;
}
</style>