<template>
  <div class="preview-container" v-show="ifShow">
<!--  <div class="preview-container">-->
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=imgshowURL alt=""/>
    <div class="preview-buttons">
      <button @click="downloadImage" class="download-button">下载图片</button>
      <button @click="closePreview" class="cancel-button">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      imgshowURLLocal:'',
      imgurlFromDateLocal:'',
      imgNameLocal:'',
      ifShow: false,
    }
  },
  props: [
    'imgshowURL','imgurlFromDate','imgName',
    'ifShowMapPreview',
  ],
  watch: {
    imgshowURL(newVal) {
      // console.log("newVal",newVal)
      this.imgshowURLLocal=this.getAssetsFile(newVal)
    },
    imgurlFromDate(){
      this.imgurlFromDateLocal= this.imgurlFromDate
    },
    imgName(){
      this.imgNameLocal=this.imgName
    },
    ifShowMapPreview(bool){
      // console.log("ifShowMapPreview---------",bool)
      this.ifShow = bool
    }
  },
  mounted() {
    this.imgshowURLLocal=this.getAssetsFile(this.imgshowURLLocal)
    this.imgurlFromDateLocal= this.imgurlFromDate
    this.imgNameLocal=this.imgName
  },
  methods:{
    getAssetsFile(imgshowURL) {
      return new URL(imgshowURL, import.meta.url).href
    },
    async downloadImage() {

      const link = document.createElement('a');
      link.download = this.imgNameLocal+'.jpg';
      // console.log(this.imgurlFromDateLocal,"this.imgurlFromDateLocal")
      const imgModule = await import(this.imgurlFromDateLocal);
      console.log(imgModule)

      link.href = imgModule.default;
      link.click();
      this.$emit('ifShowThematicMapDialog', null);
    },
    closePreview() {
      this.$emit('ifShowThematicMapDialog', null);
      this.ifShow = false
    },
  }
}
</script>
<style scoped>

.preview-container {
  position: absolute;
  top: 50%;
  left: 40%;
  width: 44%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
    z-index: 30;
}
.preview-image {
  max-width: 100%;
  height: auto;
}
.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
