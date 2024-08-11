<template>
    <div>
        <div id="news" v-show="showRightButton">
            <h2 class="sub-title">
                最新事件:
                <span class="title-time">{{ currentEvent }}</span>
                <span class="icon" @click="hideNews">
                <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%; width: 100%">
            </span>
            </h2>

            <div class="sub-main">
                <ul class="sub-ul">
                    <li
                            :class="[i === 0 || i === 1 ? 'high' : '']"
                            v-for="(item, i) in showNews"
                            :key="item.id"
                            style="cursor: pointer"
                            @click="showDetailedNews(item)"
                    >
                        <div v-if="item.img" class="news-img">
                            <img :src="item.img" alt="新闻图片" />
                        </div>
                        <div class="sub-content">
                            <p class="sub-time">{{ item.time }}</p>
                            <p class="sub-text">{{ item.content }}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="showNewsButton" v-show="showLeftButton" @click="showNewsConponent">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
    </div>

</template>

<script>
    import newsData from "@/assets/json/TimeLine/news.json"

    export default {
        name: "news",
        data(){
            return{
                newsData: newsData,
                showNews: [],
                currentEvent: '',
                showRightButton: true,
                showLeftButton: false,

                // ----新闻详情Dialog----
                DialogFormVisible: false,
                showingNews: {
                    id: '',
                    time: '',
                    content: '',
                    img: '',
                },
            }
        },
        props: [
            'currentTime'
        ],
        mounted() {
            this.fetchData()
        },
        watch: {
            currentTime(newVal) {
                this.updateNews(newVal)
            },
        },
        methods:{
            async fetchData() {
                // this.newsData = this.newsData.filter((item,index) => index < 5)
                // console.log("----",this.newsData)
            },
            hideNews(){
                this.showRightButton = false
                this.showLeftButton = true
            },
            showNewsConponent(){
                this.showRightButton = true
                this.showLeftButton = false
            },
            updateNews(currentTime) {
                const activities = this.newsData.filter((activity) => {
                    return (
                        new Date(activity.publish_time) <= currentTime
                    );
                });
                if (activities.length > 1) {
                    let tmp = activities[activities.length - 1];
                    let activity = {
                        id: tmp.id,
                        time: tmp.publish_time,
                        content: tmp.content,
                        img: tmp.image
                    }
                    this.currentEvent = activity.time
                    if (this.showNews.length === 0) {
                        this.showNews.unshift(activity)
                    } else {
                        if (this.showNews[0].id !== activity.id) {
                            this.showNews.unshift(activity)
                            if (this.showNews.length > 5) {
                                this.showNews.splice(-1, 1)
                            }
                        }
                    }
                }
            },
            showDetailedNews(row){
                console.log("row---",row)
                this.showingNews = row
                // this.DialogFormVisible = true
                let bool = true
                this.$emit('detailedNews', row);
                this.$emit('ifShowDialog', bool);
            }
        }
    }
</script>

<style scoped>
    #news {
        width: 250px;
        height: 300px;
        position: absolute;
        padding: 0 5px 5px;
        border-radius: 5px;
        top: 80px;
        right: 10px;
        z-index: 100; /* 更高的层级 */
        background-color: rgba(40, 40, 40, 0.7);
        color: white;
    }
    .sub-title {
        font-family: myFirstFont;
        font-size: .8rem;
        line-height: 1.8rem;
        /*padding: 1rem 0 1rem !important;*/
        color: #ffffff;
        letter-spacing: 0;
        text-align: justify;
        text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
        border-bottom: 0.1rem solid #ffffff;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .title-time{
        font-size: .7rem;
        line-height: 1.8rem;
    }
    .icon{
        margin-right: 10px;
    }
    .icon img {
        max-width: 10px; /* 设置图片最大宽度 */
        max-height: 10px; /* 设置图片最大高度 */
        width: auto; /* 自动调整宽度以保持比例 */
        height: auto; /* 自动调整高度以保持比例 */
    }
    .sub-main{
        margin-top: 5px;
        max-height: 260px;
        overflow-y: auto;
    }
    .sub-ul{
        padding: 0;
        margin: 0;
        font-size: .7rem;
        line-height: 1.8rem;
        overflow-y: auto; /* 当内容超出时显示垂直滚动条 */
        list-style-type: none; /* 去除列表项默认的项目符号 */
    }
    .sub-ul li {
        display: flex;
        align-items: center; /* Center items vertically */
        margin-bottom: 10px; /* Optional: Add some space between items */
        /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
        padding: 10px; /* Optional: Add padding for better spacing */
    }
    .sub-content{
        padding: 0;
        margin: 0;
        line-height: .9rem;
        font-size: .7rem;
        flex: 1;
    }
    .news-img {
        padding-top: 5px;
        padding-left: 0;
        margin-right: 5px;
        text-align: center;
    }
    .news-img img {
        max-width: 60px; /* 设置图片最大宽度 */
        max-height: 60px; /* 设置图片最大高度 */
        width: auto; /* 自动调整宽度以保持比例 */
        height: auto; /* 自动调整高度以保持比例 */
    }
    .sub-time{
        padding: 0;
        line-height: .2rem
    }
    .sub-text{
        display: -webkit-box;
        -webkit-line-clamp: 2; /* 显示前两行 */
        -webkit-box-orient: vertical;
        overflow: hidden; /* 隐藏超出部分 */
        text-overflow: ellipsis; /* 超出部分用省略号表示 */
        line-height: 1.4; /* 行高，调整以适应你的字体 */
        height: 2.8em; /* 高度设置为两行的高度 */
    }
    .detailedNews{
        width: 300px;
        height: 350px;
        position: absolute;
        padding: 0 5px 5px;
        border-radius: 5px;
        top: 80px;
        right: 300px;
        z-index: 100; /* 更高的层级 */
        background-color: rgba(40, 40, 40, 0.7);
        color: white;
    }
    .showNewsButton{
        position: absolute;
        padding: 4px;
        border-radius: 5px;
        top: 80px;
        right: 10px;
        z-index: 100; /* 更高的层级 */
        background-color: rgba(40, 40, 40, 0.7);
        color: white;
        max-width: 20px; /* 设置图片最大宽度 */
        max-height: 20px; /* 设置图片最大高度 */
        width: auto; /* 自动调整宽度以保持比例 */
        height: auto; /* 自动调整高度以保持比例 */
    }
    .detailedNews img{
        max-width: 10px; /* 设置图片最大宽度 */
        max-height: 10px; /* 设置图片最大高度 */
    }
</style>
