<template>
  <div id="title" class="pop-dialog new-pannel fadein-down fadein-left" style="z-index: 100; left: 0px; top: 0px;">
    <div class="pop-dialog__content" style="height: 100%;">
      <div class="logo-title">
        <div class="logo-title-content" style="padding: 0 0 15px 0;">
          <p>{{ this.eqyear }}年{{ this.eqmonth }}月{{ this.eqday }}日{{
              this.centerPoint.earthquakeName
            }}{{ Number(this.centerPoint.magnitude).toFixed(1) }}级地震</p></div>
      </div>
      <div class="logo-left-weather">
        <!-- 以下是实时获取时间的代码 -->
        <div class="logo-time-hour">
            <span class="pop-icon">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                    d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                    fill="none" stroke="#BEE1FF" stroke-width="4"></path>
                <path d="M24.0084 12.0001L24.0072 24.0089L32.4866 32.4883" stroke="#BEE1FF" stroke-width="4"
                      stroke-linecap="round"></path>
              </svg>
            </span>
          <span id="current-time">--:--:--</span>
        </div>
        <div class="logo-time-year" id="current-date">----</div>

      </div>
      <div class="logo-right-time">
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "timeLineTitle",
  data: function () {
    return {
      eqyear: '',
      eqmonth: '',
      eqday: '',
    }
  },
  props: ['centerPoint'],
  watch: {
    centerPoint(newVal) {
      this.eqyear = this.centerPoint.startTime.getFullYear()
      this.eqmonth = this.centerPoint.startTime.getMonth() + 1
      this.eqday = this.centerPoint.startTime.getDate()
    },
  },
  mounted() {
    this.startRealTimeClock('current-time', 'current-date');//菜单栏左上角实时获取时间
  },
  methods: {
    startRealTimeClock(timeElementId, dateElementId) {
      function updateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const date = now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'long'
        });
        document.getElementById(timeElementId).textContent = time;
        document.getElementById(dateElementId).textContent = date;
      }
      updateTime();
      setInterval(updateTime, 1000);
    },
  }

}

</script>

<style scoped>
.end-time-info .timelabel span:nth-child(2) {
  margin: 0 5px; /* 分隔符前后的间隔 */
}
.logo-title {
  height: 100%;
  background-image: url(@/assets/images/CommandScreen/菜单底图.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.logo-title-content {
  color: #fff;
  height: 100%;
  margin: auto;
  font-size: 27px;
  font-weight: 700;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  text-align: center; /* 多行文本居中 */
  background-image: url(@/assets/images/CommandScreen/菜单标题.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden; /* 隐藏滚动条 */
}

@media screen and (max-width: 1645px) {
  .logo-title-content {
    width: 100% !important;
    padding-top: 29px !important;
    padding-right: 45px !important;
    font-size: 19px !important;
  }
}

@media screen and (max-width: 1835px) {
  .logo-title-content {
    width: 62% !important;
  }
}

.logo-left-weather {
  color: #fff;
  position: absolute;
  top: 5px;
  left: 9px;
}

.logo-right-time {
  position: absolute;
  top: 18px;
  right: 26px;
}

.logo-time-hour {
  font-size: 19px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0px 2px 6px #123756;
  background: linear-gradient(0deg, #bee1ff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pop-dialog .pop-dialog__content {
  height: 100%;
  overflow: auto;
  background-color: #1d3043;
}

.pop-dialog {
  height: 3.5rem;
}

.pop-icon {
  margin-right: 10px;
  margin-left: 6px;
  vertical-align: middle;
}

.logo-time-year {
  font-size: 14px;
  font-weight: 500;
  color: #cdcdcd;
}


</style>
