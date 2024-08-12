<template>
    <div
            class="detailedNews"
            v-show="ifShowDialog"
    >
        <div class="close-button" @click="hideDetailedNews">
            &times; <!-- 叉号字符 -->
        </div>
        <div>
            <h2 class="news-title">新闻事件</h2>
        </div>
        <div class="news-main">
            <div class="news-time">
                {{ showingNewsContent.time }}
            </div>
            <div class="news-content">
                {{ showingNewsContent.content }}
            </div>
            <div v-if="showingNewsContent.img" class="news-img">
                <img :src="showingNewsContent.img" alt="新闻图片" />
            </div>
        </div>
    </div>
</template>

<script>
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
        // props: [
        //     'showDetailedNewsDialog',
        //     'showingNewsContent'
        // ],
        watch: {
            showingNewsContent(newValue) {
                console.log("showingNewsContent changed:", newValue);
            },
            showDetailedNewsDialog(newValue) {
                console.log("showDetailedNewsDialog changed:", newValue);
                this.ifShowDialog = this.showDetailedNewsDialog
            }
        },
        data(){
            return{
                // showingNewsContent: {
                //     id: '',
                //     time: '',
                //     content: '',
                //     img: '',
                // },
                ifShowDialog: false
            }
        },
        mounted() {
            // console.log("newsDialog----",this.showingNewsContent)

        },
        methods:{
            hideDetailedNews(){
                this.ifShowDialog = false
                let bool = false
                this.$emit('hideNewsDialog', bool);
            },
        }
    }
</script>

<style scoped>
    .detailedNews{
        width: 300px;
        height: 350px;
        position: absolute;
        padding: 0 5px 5px;
        border-radius: 5px;
        top: 80px;
        right: 270px;
        z-index: 100; /* 更高的层级 */
        background-color: rgba(40, 40, 40, 0.7);
        color: white;
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
        line-height: 1.9rem;
        /*padding: 1rem 0 1rem !important;*/
        color: #ffffff;
        letter-spacing: 0;
        text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
        /*border-bottom: 0.1rem solid #ffffff;*/
        margin: 0;
        padding-top: 5px;
        text-align: center;
    }
    .news-main{
        padding-left: 5px;
        padding-right: 5px;
        max-height: 295px;
        overflow-y: auto;
    }
    .news-time{
        font-size: .9rem;
        line-height: 1.5rem;
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
