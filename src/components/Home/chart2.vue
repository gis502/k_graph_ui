<template>
  <div>
    <el-carousel :autoplay="false" :interval="5000" :initial-index="initialIndex" style="height: 100%;" indicator-position="none" :key="carouselKey">
      <!-- 余震数量图表 -->
      <el-carousel-item style="height: 100%;">
        <div class="chart-container" style="height: 100%;">
          <div class="public-title">最新地震余震情况统计(次)</div>
          <span
              style="padding-left: 5px; background: linear-gradient(to right, rgb(218, 45, 45) 0%, rgba(254, 254, 254, 0) 90%); color: white; font-size: 13px;">
            更新时间：{{ updateTime }}
          </span>

          <div ref="aftershockChart" class="chart"></div> <!-- 余震数量图表容器 -->
        </div>
      </el-carousel-item>

      <!-- 各区县人口总数表 -->
      <el-carousel-item>
        <div class="chart-container population-chart-container" >
          <div class="public-title">各区县人口总数（万人）</div>
          <span
              style="padding-left: 5px; background: linear-gradient(to right, rgb(218, 45, 45) 0%, rgba(254, 254, 254, 0) 90%); color: white; font-size: 13px;">
            更新时间：{{ populationDataChartUpdateTime }}
          </span>
          <div ref="populationDataChart" class="chart"></div> <!-- 人口数据图表容器 -->
        </div>
      </el-carousel-item>

      <el-carousel-item>
        <div class="chart-container">
          <div class="public-title">隐患点</div>

          <!-- 风险点信息 -->
          <div v-if="riskPointData.length > 0" class="riskPoint" @mouseenter="pauseSlide" @mouseleave="resumeSlide" style="margin-top: -20px">
            <div class="button-top" style="margin-bottom: 5px;">
              <span @click="slideUp" class="white-text">▲</span>
            </div>

            <div class="container" :style="{ transform: `translateY(${translateY.value}px)`, transition: 'transform 0.5s ease' }">
              <el-col>
                <div class="newColCommon">
                  <span class="label">隐患点地点：</span>{{ location || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">隐患点类型：</span>{{ riskPointType || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">与震中距离：</span>{{ distance ? distance + ' 千米' : '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">险情等级：</span>{{ riskLevel || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">稳定性：</span>{{ stability || '暂无数据' }}
                </div>
              </el-col>
            </div>

            <div class="button-bottom" style="margin-top: 5px;">
              <span @click="slideDown" class="white-text">▼</span>
            </div>
          </div>

          <!-- 如果没有数据，显示暂无数据 -->
          <div v-else class="no-data">
            <div>与震中距离：暂无数据</div>
            <div>隐患点地点：暂无数据</div>
            <div>隐患点类型：暂无数据</div>
            <div>险情等级：暂无数据</div>
            <div>稳定性：暂无数据</div>
          </div>
        </div>
      </el-carousel-item>


    </el-carousel>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getAftershockMagnitude, getPopulationData, getRiskPoint } from "@/api/system/statistics.js";

const props = defineProps(['lastEq']);
const aftershockChart = ref(null);
const populationDataChart = ref(null);
const updateTime = ref('');
const populationDataChartUpdateTime = ref('')

// 避难点
const location = ref('');
const riskPointType = ref('');
const distance = ref('');
const riskLevel = ref('');
const stability = ref('');
const translateY = ref(0); // 用于动画
const currentIndex = ref(0); // 当前显示的隐患点索引
const riskPointData = ref([]); // 存储从 API 获取的隐患点数据
const carouselKey = ref(0)
let myAftershockChart = null; // 余震图表实例
let myPopulationDataChart = null; // 人口数据图表实例

// 控制初始展示的索引
const initialIndex = ref(0); // 当前展示的隐患点索引

// 初始化余震图表
const initAftershockChart = () => {
  if (!aftershockChart.value) return; // 检查图表容器是否存在
  myAftershockChart = echarts.init(aftershockChart.value); // 初始化ECharts实例

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '2%', right: '4%', top: '20%', bottom: '30%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['3-3.9级', '4-4.9级', '5-5.9级', '6.0级及以上'],
      axisLabel: {
        color: '#FFFFFF',
        show: true,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff' // 设置 Y 轴标签的颜色为白色
      }
    },
    series: [
      {
        name: '余震数量',
        data: [0, 0, 0, 0],
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const colors = ['#2889ff', '#ffeb2f', '#ffa500', '#ff2f2f'];
            return colors[params.dataIndex];
          }
        },
        label: { show: true, position: 'top', color: '#fff' }
      }
    ]
  };
  myAftershockChart.setOption(option);
};


// 更新余震图表
const updateAftershockChart = (data) => {
  if (myAftershockChart) {
    myAftershockChart.setOption({
      series: [
        {
          data: [
            data.magnitude_3_3_9 || 0,
            data.magnitude_4_4_9 || 0,
            data.magnitude_5_5_9 || 0,
            0
          ],
        }
      ]
    });
  }
};


// 处理余震数据

const handleAftershockData = () => {
  if (props.lastEq) {
    getAftershockMagnitude(props.lastEq.eqid).then((res) => {
      updateAftershockChart(res); // 更新余震图表
      console.log("getAftershockMagnitude", res);
      updateTime.value = res.submission_deadline; // 更新时间

      // 根据余震数据是否存在决定初始展示的图表
      const hasAftershockData = !!(res.magnitude_3_3_9 || res.magnitude_4_4_9 || res.magnitude_5_5_9);
      console.log("hasAftershockData", hasAftershockData);

      // 设置 initialIndex 的值
      initialIndex.value = hasAftershockData ? 0 : 1;
      console.log("initialIndex 值:", initialIndex.value);

      carouselKey.value++;

      nextTick(() => {

          initAftershockChart()
          initPopulationDataChart()
          updateAftershockChart(res); // 重新初始化余震图表
      });
    });
  } else {
    updateTime.value = new Date().toLocaleString(); // 设置当前时间
    initialIndex.value = 1; // 如果没有lastEq，默认展示静态图
  }
};


// 存储人口数据
const populationData = ref({});

// 处理人口数据
const handlePopulationData = () => {
  getPopulationData().then((res) => {
    console.log("后端返回的人口数据:", res); // 查看实际返回的数据

    // 确保返回数据是有效的，并且 data 字段存在
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 提取 `area` 和 `totalPopulation`
      const xAxisData = res.data.map(item => item.area);  // 存储区域名
      const seriesData = res.data.map(item => item.totalPopulation);  // 存储人口数

      populationData.value = { xAxisData, seriesData }; // 格式化存储数据
      console.log("提取后的数据:", populationData.value);

      populationDataChartUpdateTime.value = res.data[0].updateTime; // 更新时间
      initPopulationDataChart(); // 数据加载完成后初始化图表
    } else {
      console.error("返回的数据格式不正确或数据为空", res);
    }
  }).catch(error => {
    console.error("获取人口数据时出错:", error); // 捕获并处理错误
  });
};


// 初始化人口数据图表
const initPopulationDataChart = () => {
  console.log("人口数据图表容器:", populationDataChart.value); // 调试容器是否存在
  console.log("人口数据:", populationData.value); // 调试人口数据

  if (!populationDataChart.value || !populationData.value) return;

  const { xAxisData, seriesData } = populationData.value; // 解构提取数据

  myPopulationDataChart = echarts.init(populationDataChart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        // 在 tooltip 中为每个数据值前添加颜色圆点，以万人为单位
        return params.map(item => `${item.marker}${item.name}: ${(item.value / 10000).toFixed(2)} 万人`).join('<br/>');
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: '#ffffff', // 设置 X 轴标签的颜色为白色
        formatter: (value) => value.split("").join("\n")
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff',
        formatter: (value) => value / 10000
      }
    },
    series: [{ data: seriesData, type: 'bar' }]
  };

  myPopulationDataChart.setOption(option);
};


// 避难点
// 获取隐患点数据
const handleRiskPoint = () => {
  getRiskPoint(props.lastEq.eqid).then((res) => {
    console.log("handleRiskPoint", res); // 打印整个响应数据

    if (res && res.data && res.data.length > 0) {
      riskPointData.value = res.data; // 将数据存入数组
      updateRiskPointInfo(); // 更新初始隐患点数据
    } else {
      console.warn("没有找到隐患点数据", res.data);
    }
  }).catch((error) => {
    console.error("获取隐患点数据时出错:", error);
  });
};

// 更新显示的隐患点信息
const updateRiskPointInfo = () => {
  const currentRiskPoint = riskPointData.value[currentIndex.value];

  if (currentRiskPoint) {
    location.value = currentRiskPoint.location;
    riskPointType.value = currentRiskPoint.riskPointType;
    distance.value = currentRiskPoint.distance;
    riskLevel.value = currentRiskPoint.riskLevel;
    stability.value = currentRiskPoint.stability;
  }
};

// 滑动显示下一个隐患点
const slideRiskPoints = () => {
  const totalPoints = riskPointData.value.length;
  if (totalPoints > 0) {
    translateY.value = -(currentIndex.value * 70); // 每个隐患点占用 70px 高度

    // 更新当前隐患点数据
    updateRiskPointInfo();

    // 如果到了最后一条数据，重置为第一条
    if (currentIndex.value === totalPoints - 1) {
      setTimeout(() => {
        currentIndex.value = 0;
        translateY.value = 0;
        updateRiskPointInfo();
      }, 500);
    } else {
      currentIndex.value++;
    }
  }
};

// 控制滚动的定时器
let slideInterval = null;

// 启动轮播
const startSlide = () => {
  slideInterval = setInterval(slideRiskPoints, 4000);
};

// 暂停滚动
const pauseSlide = () => {
  clearInterval(slideInterval);
};

// 恢复滚动
const resumeSlide = () => {
  startSlide();
};

const slideUp = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = riskPointData.value.length - 1; // 到达顶部后回到最后一个
  }
  updateRiskPointInfo();
};

const slideDown = () => {
  if (currentIndex.value < riskPointData.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // 到达底部后回到第一个
  }
  updateRiskPointInfo();
};

// 监听lastEq属性的变化，调用处理余震数据的函数
watch(() => props.lastEq,() => {
  handleAftershockData();
  handleRiskPoint();
});

// 窗口大小调整时重新调整图表大小
const resizeChart = () => {
  if (myAftershockChart) {
    myAftershockChart.resize(); // 调整余震图表大小
  }
  if (myPopulationDataChart) {
    myPopulationDataChart.resize(); // 调整人口数据图表大小
  }
};

// 组件挂载后执行初始化
import { nextTick } from 'vue';

onMounted(async () => {
  await nextTick(); // 等待 DOM 更新
  initAftershockChart(); // 初始化余震图表
  initPopulationDataChart(); // 初始化人口数据图表
  handleAftershockData(); // 处理余震数据
  handlePopulationData(); // 处理人口数据
  window.addEventListener('resize', resizeChart); // 监听窗口大小变化
  resumeSlide();
});

// 组件卸载前移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart); // 移除监听器
  clearInterval(slideInterval); // 组件卸载前清除定时器
});
</script>

<style scoped>

/* 通用图表容器 */
.chart-container {
  position: relative;
  width: 100%;
  height: 400px; /* 明确设置图表高度 */
}

.chart {
  height: 100%; /* 图表占满容器高度 */
  margin-top: -20px; /* 向上调整图表位置 */
}

.population-chart-container {
  width: 100%;
  height: 100%; /* 确保人口图表占满容器 */
  margin-top: -7px;
}

/* 标题样式 */
.public-title {
  position: relative;
  width: calc(100% - 30px);
  height: 30px;
  color: #fff;
  padding-left: 16px;
  line-height: 30px;
  font-size: 15px;
  left: 5px;
}

.public-title:before {
  content: "";
  position: absolute;
  width: 4px;
  height: 20px;
  top: 10px;
  left: 5px;
  background: #2997e4;
  border-radius: 2px;
}

/* 字体样式 */
.newColCommon {
  font-size: 16px;
  line-height: 1.5;
  color: #f5f5f5; /* 近似白色的字体颜色 */
}

/* 标签字体 */
.label {
  font-weight: bold; /* 标签加粗 */
}

/* 风险点容器 */
.riskPoint .container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0; /* Ensure no margin is applied */

}

.button-top {
  text-align: center;
  margin: 5px 0;
}
.button-bottom {
  text-align: center;
}
.white-text {
  color: white;
}
/* 3. 没有数据时的显示样式 */
.no-data {
  margin-top: -80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #ffffff;
  font-size: 16px;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  gap: 15px; /* 增加行与行之间的间距 */

}


.no-data div {
  margin: 5px 0;
}

</style>
