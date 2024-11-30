<template>
  <div class="preview-container" v-show="ifShow">
    <div class="export-image" v-show="showDisplayBorders">
      <div class="export-info">
        <h2>{{ formattedImgName() }}</h2>
      </div>
      <div class="main_coantainer">
        <div class="top_container">
          <div class="box"></div>
          <div class="top"></div>
          <div class="box"></div>
        </div>
        <div class="middow">
          <div class="left"></div>
          <div class="main">
            <img :src="imgshowURL" alt="遥感影像" style="width: 100%;height: 100%">
          </div>
          <div class="right"></div>
        </div>
        <div class="bottom_container">
          <div class="box"></div>
          <div class="bottom"></div>
          <div class="box"></div>
        </div>
      </div>
      <div style="font-size:14px ;padding: 0; width: 100%; margin-top: 0; background-color: white; display: flex; justify-content: space-between; align-items: center; text-align: center;">
        <p style="flex: 1; text-align: left; margin-left: 10px;"></p>
        <p style="flex: 1; text-align: center;">制作时间： {{ pictureCreateTime }} </p>
        <p style="flex: 1; text-align: right; margin-right: 10px;">版本：专业版</p>
      </div>
    </div>
    <div class="export-model-image" v-show="modelsCondition">
      <div class="export-info">
        <h2>{{ formattedImgName() }}</h2>
      </div>
      <div class="main">
        <img :src="imgshowURL" alt="三维模型" style="width: 100%;height: 100%">
      </div>
      <div style="font-size:14px ;padding: 0; width: 100%; margin-top: 0; background-color: white; display: flex; justify-content: space-between; align-items: center; text-align: center;">
        <p style="flex: 1; text-align: left; margin-left: 10px;"></p>
        <p style="flex: 1; text-align: center;">制作时间： {{ pictureCreateTime }} </p>
        <p style="flex: 1; text-align: right; margin-right: 10px;">版本：专业版</p>
      </div>
    </div>
    <div v-show="exportingImagesCondition">
      <img :src="imgshowURL" alt="导出图片" style="width: 100%;height: 100%">
    </div>
    <div class="preview-buttons">
      <button @click="downloadPdf" class="download-button">导出为PDF</button>
      <button @click="downloadImage" class="download-button">下载图片</button>
      <button @click="closePreview" class="cancel-button">取消</button>
    </div>
  </div>
</template>

<script>
import {jsPDF} from 'jspdf';
import html2canvas from "html2canvas";

export default {
  data() {
    return {
      imgshowURLLocal: '',
      imgurlFromDateLocal: '',
      imgNameLocal: '',
      ifShow: false,
      pictureCreateTime: '',
    }
  },
  props: [
    'imgshowURL', 'imgurlFromDate', 'imgName',
    'ifShowMapPreview', 'corners', 'step','showDisplayBorders',
    'modelsCondition', 'exportingImagesCondition','selectedEq'
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
      if (this.showDisplayBorders){
        this.exportImage()
      }
      if(this.modelsCondition){
        this.setPictureCreateTime();
      }
    },
    ifShowMapPreview(bool) {
      this.ifShow = bool
    },

  },
  mounted() {
    this.imgshowURLLocal = this.getAssetsFile(this.imgshowURLLocal)
    this.imgurlFromDateLocal = this.imgurlFromDate
    // this.setImgNameLocal = this.imgName
  },
  methods: {
    // 标题名称
    formattedImgName() {
      console.log("777777777777777")
      console.log(this.selectedEq)
      if (!this.selectedEq) {
        console.error('selectedEqData or earthquakeName is undefined');
        return;
      }
      console.log("-------------------------------------------------")
      let earthquakeName = this.selectedEq.earthquakeName;

      // 如果 earthquakeName 中包含 "市"，去掉 "市" 及其后面的内容
      if (earthquakeName.includes("市")) {
        earthquakeName = earthquakeName.split("市")[0];  // 保留 "市" 前面的部分
      }

      // 如果 earthquakeName 中不包含 "州"，去掉 "州" 及其后面的内容
      if (earthquakeName.includes("州")) {
        earthquakeName = earthquakeName.split("州")[0];  // 保留 "州" 前面的部分
      }

      // 然后拼接 magnitude 和 "级地震震区"
      this.imgNameLocal = `${earthquakeName}${this.selectedEq.magnitude}级地震震区${this.imgName}`;
      return this.imgNameLocal
    },
    downloadPdf() {
      // 判断是否是遥感影像图
      if (this.imgName === "遥感影像图") {
        // 获取要截取的 DOM 元素
        const elementToCapture = document.querySelector('.export-image');

        // 检查 DOM 元素是否存在
        if (!elementToCapture) {
          console.error("无法找到要截取的 DOM 元素");
          return;
        }

        // 使用 html2canvas 截图
        html2canvas(elementToCapture, {
          useCORS: true, // 允许跨域请求
          logging: true, // 打开日志
          scale: 2, // 提高图像质量
          backgroundColor: null // 设置背景透明
        }).then(canvas => {
          // 将 canvas 转换为 Base64 图片数据
          const img = canvas.toDataURL('image/png');

          // 调用生成 PDF 的函数
          this.generatePdf(img);
        }).catch(err => {
          console.error("截图失败：", err);
        });
      }
      if (this.imgName === "三维模型图") {
        // 获取要截取的 DOM 元素
        const elementToCapture = document.querySelector('.export-model-image');

        // 检查 DOM 元素是否存在
        if (!elementToCapture) {
          console.error("无法找到要截取的 DOM 元素");
          return;
        }

        // 使用 html2canvas 截图
        html2canvas(elementToCapture, {
          useCORS: true, // 允许跨域请求
          logging: true, // 打开日志
          scale: 2, // 提高图像质量
          backgroundColor: null // 设置背景透明
        }).then(canvas => {
          // 将 canvas 转换为 Base64 图片数据
          const img = canvas.toDataURL('image/png');

          // 调用生成 PDF 的函数
          this.generatePdf(img);
        }).catch(err => {
          console.error("截图失败：", err);
        });
      }
      else {
        // 如果不是遥感影像图，直接使用现有的图片生成 PDF
        if (!this.imgshowURL) {
          console.error("图片数据为空，无法生成 PDF");
          return;
        }
        // 调用生成 PDF 的函数
        this.generatePdf(this.imgshowURL);
      }
    },

// 独立的生成 PDF 方法
    generatePdf(imageData) {
      // 确定 PDF 文件的动态名称
      const title = this.imgNameLocal || "生成PDF"; // 默认名称为 "生成PDF"

      // 初始化 jsPDF 实例
      const PDF = new jsPDF('', 'pt', 'a4');

      // A4 页面宽度和高度（单位：pt）
      const pdfWidth = 595.28; // A4 宽度
      const pdfHeight = 841.89; // A4 高度

      // 设置边距（单位：pt）
      const margin = 20; // 边距大小

      // 图片的实际宽高
      const img = new Image();
      img.src = imageData;

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
              imageData,
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
      if (this.imgName === "遥感影像图") {
        // 获取要截取的 DOM 元素
        const elementToCapture = document.querySelector('.export-image');

        // 使用 html2canvas 截图
        html2canvas(elementToCapture, {
          useCORS: true, // 允许跨域请求，确保图片加载
          logging: true, // 打开日志以查看可能的错误
          scale: 2, // 提高图像质量
          backgroundColor: null // 使背景透明
        }).then(canvas => {
          // 将 canvas 转换为图片
          const finalImage = canvas.toDataURL('image/png');
          this.setPictureCreateTime()


          // 创建下载链接并触发下载
          const link = document.createElement('a');
          link.download = `${this.imgName}.png`; // 设置下载文件名
          link.href = finalImage; // 设置图片来源
          link.click(); // 触发下载
        }).catch(error => {
          console.error('Error capturing the screenshot:', error);
        });
      }
      if (this.imgName === "三维模型图") {
        // 获取要截取的 DOM 元素
        const elementToCapture = document.querySelector('.export-model-image');

        // 使用 html2canvas 截图
        html2canvas(elementToCapture, {
          useCORS: true, // 允许跨域请求，确保图片加载
          logging: true, // 打开日志以查看可能的错误
          scale: 2, // 提高图像质量
          backgroundColor: null // 使背景透明
        }).then(canvas => {
          // 将 canvas 转换为图片
          const finalImage = canvas.toDataURL('image/png');
          this.setPictureCreateTime()

          // 创建下载链接并触发下载
          const link = document.createElement('a');
          link.download = `${this.imgNameLocal}.png`; // 设置下载文件名
          link.href = finalImage; // 设置图片来源
          link.click(); // 触发下载
        }).catch(error => {
          console.error('Error capturing the screenshot:', error);
        });
      }
      else {
        try {
          const link = document.createElement('a'); // 创建下载链接
          link.download = `${this.imgNameLocal || 'download'}.jpg`; // 设置默认文件名

          // 判断是否为 Base64 数据
          const isBase64 = this.imgurlFromDateLocal.startsWith('data:image');

          if (isBase64) {
            // 如果是 Base64 数据，直接使用
            link.href = this.imgurlFromDateLocal;
          } else if (this.imgurlFromDateLocal.startsWith('http') || this.imgurlFromDateLocal.startsWith('/')) {
            // 如果是 URL，直接赋值
            link.href = this.imgurlFromDateLocal;
          } else {
            // 如果是模块路径，动态导入
            const imgModule = await import(this.imgurlFromDateLocal);
            link.href = imgModule.default;
          }

          link.click(); // 触发下载
        } catch (error) {
          console.error('下载图片失败:', error);
          this.$message && this.$message.error('下载图片失败，请检查图片地址或模块路径是否正确！');
        }
      }
    },
    closePreview() {
      this.$emit('ifShowThematicMapDialog', null);
      this.ifShow = false
    },
    exportImage() {
      // 分别处理四条边的数据
      const topData = {};
      const sideData = {};
      const bottomData = {};
      // 生成点数据
      this.generatePointsWithPercentage(this.corners.topStart, this.corners.topEnd, topData);
      this.generatePointsWithPercentage(this.corners.leftStart, this.corners.leftEnd, sideData);
      this.generatePointsWithPercentage(this.corners.bottomStart, this.corners.bottomEnd, bottomData);
      // 添加盒子
      const topContainer = document.querySelector('.top');
      const bottomContainer = document.querySelector('.bottom');
      const leftContainer = document.querySelector('.left');
      const rightContainer = document.querySelector('.right');
      // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
      [topContainer].forEach(container => this.addBoxes(container, 'div_t', topData));
      // 为 leftContainer 和 rightContainer 生成盒子（反转顺序，从下往上显示）
      [leftContainer, rightContainer].forEach(container => this.addBoxes(container, 'div_l', sideData, true));
      // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
      [bottomContainer].forEach(container => this.addBoxes(container, 'div_t', bottomData));
      this.setPictureCreateTime()
    },

    //动态添加盒子方法
    addBoxes(container, prefix, dataContext, reverse = false) {
      if (!container) return;
      // 清空容器中的已有盒子
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      let points = dataContext.points;
      let flexPercentages = dataContext.flexPercentages;

      // 如果需要反转顺序
      if (reverse) {
        points = [...points].reverse();
        flexPercentages = [...flexPercentages].reverse();
      }
      Array.from({length: dataContext.divBoxCount}).forEach((_, i) => {
        const box = document.createElement('div');
        box.className = `${prefix}${i}`;
        // 只对有效的数值进行转换
        if (points[i]) {
          // box.textContent = points[i]
          box.textContent = this.convertToDMS(points[i], reverse);  // 转换为度分秒格式
        } else {
          box.textContent = '';  // 保留空值
        }
        container.appendChild(box);

        // 设置盒子样式
        const boxStyles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black',
          width: '19.47px',
          height: '19.47px',
          fontSize: '10px',
          flex: flexPercentages[i], // 使用反转后的 flexPercentages
          whiteSpace: 'nowrap', // 防止文字换行
        };

        // 如果 reverse 为 true，才旋转 90 度
        if (reverse) {
          boxStyles.transform = 'rotate(-90deg)';
        }

        // 应用样式
        Object.assign(box.style, boxStyles);
      });
    },

    // 生成点和百分比，传入不同的标识符，避免共享同一数据集
    generatePointsWithPercentage(start, end, dataContext) {
      dataContext.points = [];
      dataContext.flexPercentages = [];

      const adjustedStart = Math.ceil(start / this.step) * this.step;
      const adjustedEnd = Math.floor(end / this.step) * this.step;

      // 生成点
      for (let current = adjustedStart; current <= adjustedEnd; current += this.step) {
        const roundedPoint = Number(current.toFixed(3)); // 处理浮点精度问题
        if (!dataContext.points.includes(roundedPoint)) { // 确保唯一性
          dataContext.points.push(roundedPoint);
        }
      }

      // 如果最后一个点不等于 adjustedEnd，手动添加 adjustedEnd
      if (dataContext.points[dataContext.points.length - 1] !== adjustedEnd) {
        const roundedEnd = Number(adjustedEnd.toFixed(2));
        if (!dataContext.points.includes(roundedEnd)) { // 检查是否重复
          dataContext.points.push(roundedEnd);
        }
      }

      const basePercentage = (this.step / (end - start)) * 100;
      dataContext.divBoxCount = dataContext.points.length;
      dataContext.flexPercentages = Array(dataContext.divBoxCount).fill(basePercentage);
      this.calculateCustomValues(
          dataContext.points[0],
          dataContext.points[dataContext.points.length - 1],
          start,
          end,
          dataContext
      );
    },

    // 将浮点数转换为度分秒格式
    convertToDMS(point, reverse) {
      const absolute = Math.abs(point);
      const degrees = Math.floor(absolute);  // 整数部分为度
      const minutes = Math.floor((absolute - degrees) * 60);  // 小数部分乘以 60 得到分
      const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);  // 小数部分乘以 60 再得到秒

      let direction;

      if (reverse) {
        // 只考虑南北方向
        direction = point >= 0 ? '北' : '南';
      } else {
        // 只考虑东西方向
        direction = point >= 0 ? '东' : '西';
      }

      return `${degrees}°${minutes}'${seconds}"${direction}`;
    },

    // 计算自定义值并保存到特定的数据上下文
    calculateCustomValues(firstPoint, lastPoint, start, end, dataContext) {
      const halfStep = this.step / 2;
      const number1 = end - start;

      const diffFirst = firstPoint - start;
      if (diffFirst > halfStep) {
        const percentageFirst = ((firstPoint - start - halfStep) / number1) * 100;
        dataContext.flexPercentages.unshift(percentageFirst);
        dataContext.points.unshift('');
      } else if (diffFirst < halfStep) {
        const percentage1 = (2 * (firstPoint - start) / number1) * 100;
        const percentage2 = ((halfStep - (firstPoint - start)) / number1) * 100;
        dataContext.flexPercentages.unshift(percentage1);
        dataContext.flexPercentages[1] = percentage2;
        dataContext.points.splice(1, 0, '');
      }

      const diffLast = end - lastPoint;
      if (diffLast > halfStep) {
        const percentageLast = ((end - lastPoint - halfStep) / number1) * 100;
        dataContext.flexPercentages.push(percentageLast);
        dataContext.points.push('');
      } else if (diffLast < halfStep) {
        const percentage1 = ((halfStep - (end - lastPoint)) / number1) * 100;
        const percentage2 = (2 * (end - lastPoint) / number1) * 100;
        dataContext.flexPercentages[dataContext.flexPercentages.length - 1] = percentage1;
        dataContext.flexPercentages.push(percentage2);
        dataContext.points.splice(-1, 0, '');
      }

      dataContext.divBoxCount = dataContext.points.length;
    },

    // 设置图片创建时间
    setPictureCreateTime() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份从0开始，需要加1
      const day = date.getDate();

      // 格式化日期为 YYYY年MM月DD日
      this.pictureCreateTime = `${year}年${month}月${day}日`;
    },
  }
}
</script>
<style scoped>

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.download-button,
.cancel-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.export-info {
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
}

.main_coantainer {
  border: 3px solid black;
  background-color: white;
}

.middow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  width: 19.47px;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
