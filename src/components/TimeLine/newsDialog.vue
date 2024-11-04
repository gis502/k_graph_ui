<template>
  <div
      class="detailedNews"
      v-show="ifShowDialog"
  >
    <div class="close-button" @click="hideDetailedNews">
      &times; <!-- 叉号字符 -->
    </div>

    <div class="news-head">
      <h2 class="news-title">{{ showingNewsContent.title }}</h2>
      <div class="news-time">
        <span class="publish-time">时间：{{ this.timestampToTime(showingNewsContent.publishTime) }}</span>
        <span class="source">来源：{{ showingNewsContent.sourceName }}</span>
      </div>
    </div>
    <div class="news-main">
      <div v-html="formattedNewsContent"></div>
<!--      新闻内容-->
      <div v-if="showingNewsContent.image" class="news-img">
        <img :src="showingNewsContent.image" alt="新闻图片" @error="handleErrorImage" style="max-width: 400px; height: auto;"/>
      </div>
    </div>
  </div>
</template>

<script>
import error from '@/assets/json/TimeLine/errorimg.jpg'
export default {
  name: "newsDialog",
  props: {
    showDetailedNewsDialog: {
      type: Boolean,
      required: true
    },
    showingNewsContent: {
      type: Object,
      required: true
    }
  },
  watch: {
    showingNewsContent(newValue) {
      // console.log("showingNewsContent changed:", newValue);
      this.newsContent=newValue.content
    },
    showDetailedNewsDialog(newValue) {
      // console.log("showDetailedNewsDialog changed:", newValue);
      this.ifShowDialog = this.showDetailedNewsDialog
    }
  },
  computed: {
    formattedNewsContent() {
      this.newsContent='<br />&emsp;&emsp;'+this.newsContent
      // 替换换行符，并在每段的开始添加两个空格的HTML实体来实现缩进
      return this.newsContent.replace(/\r?\n/g, '<br />&emsp;&emsp;');
    }
  },
  data(){
    return{
      error,
      newsContent:'',
      ifShowDialog: false
    }
  },
  mounted() {
  },
  methods:{
    handleErrorImage(event) {
      event.target.src = error // 当图片加载失败时，将其替换为备用图片
    },
    hideDetailedNews(){
      this.ifShowDialog = false
      this.$emit('hideNewsDialog', this.ifShowDialog);
    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
      let year = DateObj.getFullYear()
      let month = DateObj.getMonth() + 1
      let day = DateObj.getDate()
      let hh = DateObj.getHours()
      let mm = DateObj.getMinutes()
      let ss = DateObj.getSeconds()
      month = month > 9 ? month : '0' + month
      day = day > 9 ? day : '0' + day
      hh = hh > 9 ? hh : '0' + hh
      mm = mm > 9 ? mm : '0' + mm
      ss = ss > 9 ? ss : '0' + ss
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
    },
  }
}
</script>

<style scoped>
.detailedNews{
  width: 40%;
  height: 54%;
  position: absolute;
  //padding: 0 5px 5px;
  padding:15px;
  border-radius: 5px;
  top:20%;
  right: 30%;
  z-index: 30; /* 更高的层级 */
  background-color: rgb(22, 53, 77,0.9);
  color: #ffffff;
}
.close-button {
  position: absolute; /* Position the button absolutely */
  top: 10px; /* Distance from the top */
  right: 10px; /* Distance from the right */
  cursor: pointer; /* Change cursor to pointer */
  font-size: 24px; /* Adjust font size */
  color: #ffffff; /* Optional: Set color */
}
.news-title {
  font-family: myFirstFont;
  font-size: 1.2rem;
  font-weight: 900 !important;
  line-height: 1.9rem;
  color: #ffffff;
  letter-spacing: 0;
  margin: 0;
  text-align: center;
  padding-bottom: 12px;
}
.news-title:before {
  content: "";
  width: 11px;
  height: 23px;
  position: relative;
  top: 7px;
  margin: 0 10px;
  display: inline-block;
  background-image: url("@/assets/images/CommandScreen/弹框标题图标.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.news-title:after {
  content: "";
  width: 95%;
  height: 6px;
  position: absolute;
  top: 16%;
  left: 1.5%;
  background-image: url("@/assets/images/CommandScreen/弹框标题分割线.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.news-main{
  padding-left: 5px;
  padding-right: 5px;
  max-height: 85%;
  overflow-y: auto;
  margin-top: 3%;
}
.news-time{
  display: flex;
  justify-content: space-between; /* 平均排列 */
  font-size: 0.9rem;
  line-height: 0.5rem;
  margin-bottom: 1px;
}
.source,
.publish-time {
  flex: 1; /* 每个元素占用相同的空间 */
  text-align: center; /* 中间对齐文本 */
}
.news-head{
  line-height: 1rem;
  //height: 30%;
}
.news-img {
  padding-top: 5px;
  text-align: center;
}
.news-img img {
  display: inline-block;
}
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px;               /* 滚动条的宽度 */
  height: 12px;              /* 滚动条的高度，对水平滚动条有效 */
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 3px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
</style>
