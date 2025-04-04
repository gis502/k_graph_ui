<template>
  <div class="container">
    <h2><strong>重点关注</strong><sub>Focus on the indicators</sub><b class="logoline"></b><b class="logoline1"></b><b class="logoline2"></b><b class="logoline3"></b><b class="logoline4"></b></h2>
    时间区
    <div class="date-timer">
      <p>
        <strong>{{ hours }}</strong>
        <strong>:</strong>
        <strong>{{ minutes }}</strong>
<!--        <strong class="hide">{{ seconds }}</strong>-->
      </p>
      <em>{{ weekday }}</em>
      <ul>
        <li>{{ year }}</li>
        <li>{{ month }}</li>
        <li>{{ day }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 定义响应式时间变量
const year = ref("");
const month = ref("");
const day = ref("");
const weekday = ref("");
const hours = ref("");
const minutes = ref("");
const seconds = ref("");

// 定时器 ID
let timerId = null;

// 更新时间的方法
const updateTime = () => {
  const today = new Date();
  const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

  year.value = today.getFullYear() + "年";
  month.value = (today.getMonth() + 1) + "月";
  day.value = today.getDate() + "日";
  weekday.value = weekdays[today.getDay() - 1] || "星期日"; // 防止数组越界

  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();

  hours.value = h < 10 ? "0" + h : h;
  minutes.value = m < 10 ? "0" + m : m;
  seconds.value = s < 10 ? "0" + s : s;
};

// 组件挂载后启动定时器
onMounted(() => {
  updateTime(); // 先执行一次
  timerId = setInterval(updateTime, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  clearInterval(timerId);
});
</script>


<style scoped>
.container{height: 88%;
  width: 87%;}
/*时间区*/
.date-timer{ text-align: center; position: absolute; left:165px; top:76px;}
.date-timer strong { display:inline-block; font-family:'electronicFont';font-size:36px; padding-bottom:7px; margin-top:-3px;}
.date-timer em {display: block; }
.date-timer ul {font-family:'electronicFont'; font-size: 12px; margin-top:4px;}
.date-timer ul li { display:inline-block;}

/*淡入*/
.date-timer{ -webkit-animation:fadeInUp 2.2s .2s ease both;}
@-webkit-keyframes fadeInUp{
  0%{opacity:0;
    -webkit-transform:translateY(20px)}
  100%{opacity:1;
    -webkit-transform:translateY(0)}
}


/* 系统LOGO - 主LOGO - 副LOGO - 动画 */
h1 { font-family: "microsoft yahei"; font-size: 18px; text-align: center;  padding: 12px 0 16px 0; display: block; background: url("@/assets/front_page/bg01top.png") center bottom no-repeat;}
h2 { font-size:24px; font-weight: normal;position: absolute; left:60px; top:81px; padding-bottom: 20px; }
h2 sub { position: absolute; left: 5px; bottom: -27px; z-index: 2; display: block;  width: 92px; height: 8px; background: url("@/assets/front_page/logofont.png") 50% 50% no-repeat; text-indent: -500px;}
.logoline { position: absolute; left: 15%; z-index: 2;top: 35px; width: 206px; height:2px; background: url("@/assets/front_page/logoline.png") 50% 50% no-repeat; display: block;}
.logoline1 { position: absolute; z-index: 3; left: -30px; top: -34px; width: 41px; height:29px; background: url("@/assets/front_page/logoline1.png") 50% 50% no-repeat; display: block;}
.logoline2 { position: absolute; z-index: 3; left: 55px; top:58px; width: 152px; height:26px; background: url("@/assets/front_page/logoline2.png") 50% 50% no-repeat; display: block;}
.logoline3 { position: absolute; z-index: 1; left: -10px; top: -41px; width: 121px; height:121px; background: url("@/assets/front_page/logoline3.png") 50% 50% no-repeat; display: block;}
h2 strong { font-weight:normal; z-index: 3; position: absolute; writing-mode: vertical-lr;-webkit-animation-iteration-count: infinite;  -webkit-animation-name: bluePulse; -webkit-animation-duration:2s;}


/*旋转*/
.logoline3{-webkit-animation-duration: 2s; -webkit-animation-iteration-count: infinite;  -webkit-animation-name:forotate ; -webkit-animation-duration: 6000ms; }
@-webkit-keyframes forotate{
  from{
    -webkit-transform:rotate(-360deg);
    opacity: .9;
  }
  to{
    -webkit-transform:rotate(0);
    opacity: 1;
  }
}

</style>
