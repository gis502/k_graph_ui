
<template>
  <div class="preview-container">
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=showtmp alt=""/>
  </div>
</template>

<script>
import PicAndLocal from "@/assets/json/thematicMap/PicNameandLocal.js"
export default {
  data(){
    return {
      showtmp:'',
      type:'',
    }
  },
  props: [
    // 'showtmp',
    'type'
  ],
  watch: {
    // showtmp(newVal) {
    //   console.log("newVal",newVal)
    //   // this.showtmp=this.getAssetsFile(newVal)
    // },
    // type(newVal){
    //   console.log("newVal",newVal)
    //   // this.type=newVal
    //   // this.showtmp=this.getAssetsFile11(newVal)
    //   this.getAssetsFile11()
    //
    // }
    type: {
      handler(newVal){
        console.log("newVal", newVal)
        this.type = newVal
        this.getAssetsFile11(newVal)
      },
      deep:true,
      // immediate: true, // 立即触发一次
    }
  },
  mounted() {
    // this.type=type
    // this.showtmp=this.getAssetsFile(this.showtmp)
    // this.showtmp=this.getAssetsFile11(this.type)
    this.getAssetsFile11()
  },
  methods:{
    // getAssetsFile(showtmp) {
    //   this.showtmp=new URL(showtmp, import.meta.url).href
    // },
    getAssetsFile11() {
      console.log(this.type)
      let tmp
      if (this.type == "history") {
        tmp = PicAndLocal.be3a5ea48dfda0a2251021845f17960b[0].url
      }
      else{
        tmp = PicAndLocal.be3a5ea48dfda0a2251021845f17960b[1].url
      }
      this.showtmp=new URL(tmp, import.meta.url).href
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