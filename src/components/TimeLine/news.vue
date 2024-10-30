<template>
  <div>
    <div id="news">
      <h2 class="sub-title-new">
        最新新闻:
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
              <img :src="item.image" alt="新闻图片" @error="handleErrorImage" />
            </div>
            <div v-else class="news-img">
              <img :src="error" alt="新闻图片"/>
            </div>
            <div class="sub-content">
              <p class="sub-time">{{ timestampToTime(item.publishTime) }}</p>
              <p class="sub-text">{{ item.title }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import error from '@/assets/json/TimeLine/errorimg.jpg'
import { getNews } from "../../api/system/timeLine.js";

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
    this.fetchData();
  },
  watch: {
    currentTime(newVal) {
      this.updateNews(newVal);
    },
  },
  methods: {
    handleErrorImage(event) {
      event.target.src = error;
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
        this.showNews = activities.reverse();
        this.recordTime = this.timestampToTime(activities[0].publishTime);
      } else {
        this.showNews = [];
        this.recordTime = this.timestampToTime(currentTime);
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
  },
};
</script>


<style scoped>
#news {
  width: 27%;
  height: 45%;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 12%;
  right: 1%;
  color: #FFFFFF;
  z-index: 20; /* 提高层级 */
  background-color: rgb(22, 53, 77,0.9);
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}

.sub-title-new {
  color: #FFFFFF;
  font-size: 19px;
  font-weight: 550;
  top:-16px;
  position: relative;
}
.sub-title-new:before {
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

.sub-title-new:after {
  content: "";
  width: 90%;
  height: 6px;
  position: absolute;
  bottom: -15px;
  left: 9px;
  background-image: url("@/assets/images/CommandScreen/弹框标题分割线.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.title-time {
  font-size: 16px;
  font-weight: normal;
  color: #ffeb00;
  line-height: 1.8rem;
}

.sub-main {
  margin-top: -14px;
  max-height: 88%;
  overflow-y: auto;
  padding: 0px;
}

.sub-ul {
  padding: 0;
  margin: 0;
  font-size: .9rem;
  line-height: 1rem;
  overflow-y: hidden; /* 当内容超出时隐藏垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: -14px; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.sub-content {
  padding: 0;
  margin: 0;
  font-size: 16px;
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
  width: 120px; /* 自动调整宽度以保持比例 */
  height: 65px; /* 自动调整高度以保持比例 */
}

.sub-time {
  padding: 0;
  line-height: .2rem
}

.sub-text {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 显示前两行 */
  -webkit-box-orient: vertical;
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
  line-height: 1.1; /* 行高，调整以适应你的字体 */
  height: 2.1em; /* 高度设置为两行的高度 */
  left: 10%
}

.showNewsButton {
  position: absolute;
  padding: 4px;
  border-radius: 2px;
  top: 80px;
  right: 10px;
  z-index: 100; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
}

.showNewsButton img {
  max-width: 20px; /* 设置图片最大宽度 */
  max-height: 20px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */
  justify-content: center;
  align-content: center;
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
