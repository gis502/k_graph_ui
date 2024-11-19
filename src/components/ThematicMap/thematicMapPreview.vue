<template>
  <div class="preview-container" v-show="ifShow">
    <!--  <div class="preview-container">-->
    <h3 style="color: white">图片预览</h3>
    <img class="preview-image" :src=imgshowURL alt=""/>
    <div class="preview-buttons">
      <button @click="downloadPdf" class="download-button">导出为PDF</button>
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
    downloadPdf() {
      if (!this.imgshowURL) {
        console.error("图片数据为空，无法生成 PDF");
        return;
      }

      // 确定 PDF 文件的动态名称
      const title = this.imgName || "生成PDF"; // 动态 PDF 名称，默认为 "ExportedPDF"

      // 图片数据
      const pageData = this.imgshowURL; // Base64 图片数据

      // 初始化 jsPDF 实例
      const PDF = new jsPDF('', 'pt', 'a4');

      // A4 页面宽度和高度（单位：pt）
      const pdfWidth = 595.28; // A4 宽度
      const pdfHeight = 841.89; // A4 高度

      // 设置边距（单位：pt）
      const margin = 20; // 边距大小

      // 图片的实际宽高
      const img = new Image();
      img.src = pageData;

      img.onload = () => {
        const imgWidth = img.width; // 图片原始宽度
        const imgHeight = img.height; // 图片原始高度

        // 计算图片显示在 PDF 中的宽高，保持比例，并预留边距
        const availableWidth = pdfWidth - margin * 2;
        const availableHeight = pdfHeight - margin * 2;

        const ratio = imgWidth / imgHeight;
        let displayWidth = availableWidth;
        let displayHeight = availableWidth / ratio;

        if (displayHeight > availableHeight) {
          displayHeight = availableHeight;
          displayWidth = availableHeight * ratio;
        }

        let leftHeight = imgHeight * (displayWidth / imgWidth); // 按比例调整后的图片总高度
        let position = margin; // 初始绘制位置，包含顶部边距

        do {
          // 添加图片到当前页面
          PDF.addImage(
              pageData,
              'JPEG',
              (pdfWidth - displayWidth) / 2, // 居中显示
              position,
              displayWidth,
              displayHeight
          );

          // 计算剩余高度
          leftHeight -= pdfHeight - margin * 2;
          position = margin - leftHeight; // 更新绘制位置，包含分页

          // 如果图片超出一页，添加新页面
          if (leftHeight > 0) {
            PDF.addPage();
          }
        } while (leftHeight > 0);

        // 保存 PDF 文件
        PDF.save(`${title}.pdf`);
      };
      img.onerror = () => {
        console.error("加载图片失败，无法生成 PDF");
      };
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
