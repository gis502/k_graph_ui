<template>
  <div
      class="detailedNews"
      v-show="ifShowDialog"
  >
    <div class="close-button" @click="hideDetailedNews">
      &times; <!-- 叉号字符 -->
    </div>

    <div>
      <h2 class="news-title">{{ showingNewsContent.title }}</h2>
      <div class="news-time">
        来源：{{ showingNewsContent.sourceName }}|{{ this.timestampToTime(showingNewsContent.publishTime) }}
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
  padding: 0 5px 5px;
  border-radius: 5px;
  top:20%;
  right: 30%;
  z-index: 30; /* 更高的层级 */
  background-color: rgb(255, 255, 255);
  color: #000000;
}
.close-button {
  position: absolute; /* Position the button absolutely */
  top: 10px; /* Distance from the top */
  right: 10px; /* Distance from the right */
  cursor: pointer; /* Change cursor to pointer */
  font-size: 24px; /* Adjust font size */
  color: #000000; /* Optional: Set color */
}
.news-title {
  font-family: myFirstFont;
  font-size: 1.2rem;
  line-height: 1.9rem;
  /*padding: 1rem 0 1rem !important;*/
  color: #000000;
  letter-spacing: 0;
  //text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
  /*border-bottom: 0.1rem solid #ffffff;*/
  margin: 0;
  padding-top: 5px;
  text-align: center;
}
.news-title-in{
  margin-bottom: 10px;
}
.news-main{
  padding-left: 5px;
  padding-right: 5px;
  max-height: 87%;
  overflow-y: auto;
}
.news-time{
  font-size: .9rem;
  line-height: 1.5rem;
  margin-bottom: 1px;
}
.news-content{
  font-size: .9rem;
  line-height: 1.3rem;
}
.news-img {
  padding-top: 5px;
  text-align: center;
}
.news-img img {
  display: inline-block;
}
</style>
