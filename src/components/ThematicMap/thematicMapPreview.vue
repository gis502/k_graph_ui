
<template>
  <div class="preview-container">
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=imgshowURLLocal alt=""/>
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
      imgshowURLLocal:null,
      imgurlFromDateLocal:'',
      imgNameLocal:'',
    }
  },
  props: [
    'imgshowURL','imgurlFromDate','imgName'
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
    }
  },
  mounted() {
    this.imgshowURLLocal=this.imgshowURL
    this.imgshowURLLocal=this.getAssetsFile(this.imgshowURL)
    this.imgurlFromDateLocal= this.imgurlFromDate
    this.imgNameLocal=this.imgName
  },
  methods:{
    getAssetsFile(imgshowURL) {
      console.log(imgshowURL,"333")
      console.log(new URL(imgshowURL, import.meta.url).href,"333")
      return new URL(imgshowURL, import.meta.url).href
      // return new URL("../../../images/ThematicMap/TwoAndThreeDIntegration/NearbySeismicStationsMap.jpg", import.meta.url).href
    },
    async downloadImage() {

      const link = document.createElement('a');
      link.download = this.imgNameLocal+'.jpg';
      console.log(this.imgurlFromDateLocal,"this.imgurlFromDateLocal")
      const imgModule = await import(this.imgurlFromDateLocal);
      console.log(imgModule)

      link.href = imgModule.default;
      link.click();
      this.$emit('ifShowThematicMapDialog', null);
    },
    closePreview() {
      this.$emit('ifShowThematicMapDialog', null);
    },
  }
}
</script>
<style scoped>

.preview-container {
  position: absolute;
  top: 50%;
  left: 49%;
  width: 44%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index:100;

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