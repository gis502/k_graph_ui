<template>
  <div>
    <div id="news">
      <div class="pop_header">
        <h2 class="sub-title-new">
          最新新闻
          <span class="title-time">{{ recordTime }}</span>
        </h2>
        <div class="sub-main">
          <ul class="sub-ul">
            <li :class="[i === 0 || i === 1 ? 'high' : '']"
                v-for="(item, i) in showNews"
                :key="item.id"
                style="cursor: pointer"
                @click="showDetailedNews(item)">
              <div v-if="item.image" class="news-img">
                <img :src="item.image" alt="新闻图片" @error="handleErrorImage"/>
              </div>
              <div v-else class="news-img">
                <img :src="error" alt="新闻图片"/>
              </div>
              <div class="sub-content">
                <p class="sub-time">{{ timestampToTimeDate(item.publishTime) }}</p>
                <p class="sub-source">新闻来源：{{ item.sourceName }}</p>
                <p class="sub-text">{{ item.title }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import error from '@/assets/json/TimeLine/errorimg.jpg'
import {getNews} from "../../api/system/timeLine.js";

export default {
  name: "news",
  data() {
    return {
      error,
      newsData: [],
      showNews: [],
      recordTime: '',
      DialogFormVisible: false,
      showingNews: {
        id: '',
        time: '',
        content: '',
        img: '',
      },
    };
  },
  props: ['currentTime', 'eqid'],
  mounted() {
    this.fetchData()
  },
  watch: {
    currentTime(newVal) {
      this.updateNews(newVal)
    },
  },
  methods: {
    handleErrorImage(event) {
      event.target.src = error // 当图片加载失败时，将其替换为备用图片
    },
    async fetchData() {
      getNews({eqid: this.eqid}).then(res => {
        this.newsData = res;
        this.updateNews(this.currentTime);
      });
    },
    async updateNews(currentTime) {
      const activities = this.newsData.filter((activity) => {
        return new Date(activity.publishTime) <= currentTime;
      });
      if (activities.length > 0) {
        activities.sort((a, b) => {
          if (a.publishTime < b.publishTime) return -1;
          if (a.publishTime > b.publishTime) return 1;
          return 0;
        });
        this.showNews = activities.reverse()
        // console.log(this.showNews)
        this.recordTime = this.timestampToTimeDate(activities[0].publishTime)
      } else {
        this.showNews = []
        this.recordTime = this.timestampToTimeDate(currentTime)
      }
    },
    showDetailedNews(row) {
      this.showingNews = row;
      this.$emit('detailedNews', row);
      this.$emit('ifShowDialog', true);
    },
    timestampToTime(timestamp) {
      const DateObj = new Date(timestamp);
      const year = DateObj.getFullYear();
      const month = (DateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = DateObj.getDate().toString().padStart(2, '0');
      const hh = DateObj.getHours().toString().padStart(2, '0');
      const mm = DateObj.getMinutes().toString().padStart(2, '0');
      const ss = DateObj.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
    },
    timestampToTimeDate(timestamp) {
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
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
    },
  },
};
</script>


<style scoped>
#news {
  width: 100%; /* 调整宽度 */
  z-index: 20; /* 提高层级 */
  position: absolute;
  color: #FFFFFF;
  height: 19%;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sub-title-new {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 26%;
  position: relative;
  left: 7%;
  width: 91%;
}

.title-time {
  right: 0%;
  position: absolute;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.sub-main {
  margin-top: 2%;
  max-height: 24vh;
  left: 1%;
  overflow-y: auto;
  position: relative;
  padding: 0px;
}

.sub-ul {
  padding: 0;
  margin: 0;
  font-size: .6rem;
  line-height: 1rem;
  overflow-y: hidden; /* 当内容超出时隐藏垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: -21px; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.sub-content {
  padding: 0;
  margin: 0;
  font-size: 14px;
  flex: 1;
}

.news-img {
  padding-top: 0px;
  padding-left: 2px;
  margin-right: 5px;
  text-align: center;
}

.news-img img {
  /* 设置图片最大宽度 max-width: 30px;*/
  /* 设置图片最大高度 max-height: 30px;*/
  width: 75px; /* 自动调整宽度以保持比例 */
  height: 62px; /* 自动调整高度以保持比例 */
}

.sub-time {
  padding: 0;
  line-height: .2rem
}

.sub-source {
  font-size: 12px; /* 设置字体大小为16像素 */
  padding: 0;
  line-height: .2rem;
}

.sub-text {
  padding: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 显示前两行 */
  -webkit-box-orient: vertical;
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
  line-height: 1; /* 行高，调整以适应你的字体 */
  height: 2.2em; /* 高度设置为两行的高度 */
  left: 10%
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px; /* 滚动条的宽度 */
  height: 12px; /* 滚动条的高度，对水平滚动条有效 */
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
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
</style>
