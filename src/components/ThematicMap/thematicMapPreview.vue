<template>
  <div class="preview-container" v-show="ifShow">
    <!--  <div class="preview-container">-->
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=imgshowURL alt=""/>
    <div class="preview-buttons">
      <button @click="getPdf()">导出为PDF</button>
      <button @click="downloadImage" class="download-button">下载图片</button>
      <button @click="closePreview" class="cancel-button">取消</button>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf';

export default {
  data() {
    return {
      imgshowURLLocal: '',
      imgurlFromDateLocal: '',
      imgNameLocal: '',
      ifShow: false,
    }
  },
  props: [
    'imgshowURL', 'imgurlFromDate', 'imgName',
    'ifShowMapPreview',
  ],
  watch: {
    imgshowURL(newVal) {
      // console.log("newVal",newVal)
      this.imgshowURLLocal = this.getAssetsFile(newVal)
    },
    imgurlFromDate() {
      this.imgurlFromDateLocal = this.imgurlFromDate
    },
    imgName() {
      this.imgNameLocal = this.imgName
    },
    ifShowMapPreview(bool) {
      // console.log("ifShowMapPreview---------",bool)
      this.ifShow = bool
    }
  },
  mounted() {
    this.imgshowURLLocal = this.getAssetsFile(this.imgshowURLLocal)
    this.imgurlFromDateLocal = this.imgurlFromDate
    this.imgNameLocal = this.imgName
  },
  methods: {
    getPdf() {
      // 确保必要的变量已定义
      const title = 'Exported PDF'; // 默认标题
      const pageData = this.imgshowURL; // 目标图片数据 URL
      const imgWidth = 595.28; // A4 宽度
      const imgHeight = imgWidth / 592.28 * (841.89); // 根据宽高比例动态调整
      const pageHeight = imgWidth / 592.28 * 841.89; // A4 页面高度

      // 初始化 jsPDF 实例
      const PDF = new jsPDF('', 'pt', 'a4');

      // 根据图片高度计算是否需要分页
      let leftHeight = imgHeight; // 图片的总高度
      let position = 0; // PDF 内绘制起点位置

      // 开始绘制 PDF
      do {
        // 添加图片到当前页面
        PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);

        // 计算剩余高度与调整绘制位置
        leftHeight -= pageHeight;
        position -= pageHeight;

        // 如果有剩余内容，添加新页面
        if (leftHeight > 0) {
          PDF.addPage();
        }
      } while (leftHeight > 0);

      // 保存 PDF 文件
      PDF.save(`${title}.pdf`);
    },
    getAssetsFile(imgshowURL) {
      return new URL(imgshowURL, import.meta.url).href
    },
    async downloadImage() {

      const link = document.createElement('a');
      link.download = this.imgNameLocal + '.jpg';
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
  left: 49%;
  width: 44%;
  transform: translate(-50%, -50%);
  background-color: rgba(126, 201, 255, 0.44);
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
