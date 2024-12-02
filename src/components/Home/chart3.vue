<template>
  <div class="container">
    <span
        style="padding-left: 5px;background: linear-gradient(to right, rgb(218,45,45) 3%, rgba(254, 254, 254, 0) 90%); ">
      更新时间：{{ updateTime }}
    </span>
    <div class="row death">
      <span class="label">遇难人数</span>
      <span class="count">{{ deathCount }}</span>
      <span class="suffix">人</span>
    </div>
    <div class="row injury">
      <span class="label">受伤人数</span>
      <span class="count">{{ injuryCount }}</span>
      <span class="suffix">人</span>
    </div>
    <div class="row missing">
      <span class="label">失联人数</span>
      <span class="count">{{ missingCount }}</span>
      <span class="suffix">人</span>
    </div>
    <div class="row affectedPopulation">
      <span class="label">累计受灾人数</span>
      <span class="affected_count">{{ affectedPopulationCount }}</span>
      <span class="suffix">人</span>
    </div>
  </div>
</template>

<script setup>
import {ref, watch } from 'vue';
// import { getCasualtyStats } from '@/api/system/casualtystats.js'; // 引入之前定义的 API 方法
import {gettotal} from '@/api/system/casualtystats.js'
import {getOneData} from"@/api/system/casualtystats.js"
const props = defineProps(['lastEq'])


const injuryCount = ref(0);
const missingCount = ref(0);
const deathCount = ref(0);
const affectedPopulationCount = ref(0);
const updateTime = ref('')
watch(() => props.lastEq, () => {
  if (props.lastEq){
    getOneData(props.lastEq.eqid).then((res) => {
      // 确保返回的结果包含 data 且是数组类型
      if (res && res.data && Array.isArray(res.data)) {
        let totalAffectedPopulation = 0;

        // 遍历返回的所有记录，累加 affectedPopulation
        res.data.forEach((item) => {
          totalAffectedPopulation += item.affectedPopulation || 0;
        });

        // 更新 affectedPopulationCount
        affectedPopulationCount.value = totalAffectedPopulation;

        // 打印调试信息，确保数据正确
        console.log("Returned data:", res.data);
        console.log("Total affected population:", totalAffectedPopulation);
      } else {
        console.error("Invalid response data:", res);
      }
    }).catch((error) => {
      // 捕获请求失败时的错误
      console.error("Error fetching data:", error);
    });

    gettotal(props.lastEq.eqid).then((res) => {

      if (res && Array.isArray(res)) {
        // 初始化计数器
        let totalInjury = 0;
        let totalMissing = 0;
        let totalDeath = 0;

        // 遍历后端返回的数组，累加各个字段的值
        res.forEach((item) => {
          //由于此处处于监听所以对于每次变化的数据都要打印让数据真正被获取到
          console.log("Item:", item);
          console.log("Injury count for this item:", item.injuryCount);
          console.log("Missing count for this item:", item.missingCount);
          console.log("Death count for this item:", item.deathCount);
          console.log("resssssssssssssssssssssssssssssssssssssss",res)
          // 确保 item 中的字段存在，并进行累加
          totalInjury += item.totalInjured || 0;  // 使用 || 以防 item.injuryCount 为 null 或 undefined
          totalMissing += item.totalMissing || 0;
          totalDeath += item.totalDeceased || 0;
        });

        // 更新到前端显示的变量
        injuryCount.value = totalInjury;
        missingCount.value = totalMissing;
        deathCount.value = totalDeath;

        // 更新最新时间
        // 使用可选链和默认值，防止latestInsertTime为undefined时报错
        // 检查时间字段并安全访问
        const firstItem = res[0];
        const submissionDeadlines = res.map(item => item.submissionDeadline).filter(Boolean);
        if (firstItem && firstItem.submissionDeadline) {
          const latestSubmissionDeadline = new Date(Math.max(...submissionDeadlines.map(date => new Date(date))));
          updateTime.value = latestSubmissionDeadline.toISOString().replace('T', ' ').substring(0, 19); // 转换为字符串格式
          updateTime.value = formatDate(updateTime.value);
          console.log(updateTime)
        } else {
          updateTime.value = props.lastEq.occurrenceTime.replace('T', ' ');
          updateTime.value = formatDate( updateTime.value);  // 使用传入的时间字段


        }

      }

// 格式化日期为 "2024年09月14日 09:16:36"
      function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');  // 月份从0开始，因此要加1
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
      }


  //     if (res) {
  //       injuryCount.value = res.injuryCount
  //       missingCount.value = res.missingCount
  //       deathCount.value = res.deathCount
  //       updateTime.value = res.latestInsertTime.replace('T', ' ')
  //     } else {
  //       updateTime.value = props.lastEq.occurrenceTime.replace('T', ' ')
  //     }
    })



  }
});

</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  font-size: 13px;
  padding: 2px 10px;
}

.row {
  margin: 0.65vh 0;
  height: 3.2vh;
  display: flex;
  align-items: center;
  font-size: 13px;
  padding-left: 5px; /* Move text 10px to the right */
  border-left-width: 0.1vw; /* Add a border on the left */
  border-left-style: solid; /* Style the left border */
  position: relative;
}

.count {
  font-size: 25px; /* Larger font size for the numbers */
  color: rgb(248, 150, 150);
  margin-left: 4vw; /* Pushes count to the right */
}

.affected_count {
  font-size: 25px; /* Larger font size for the numbers */
  color: rgb(248, 150, 150);
  margin-left: 2.5vw; /* Pushes count to the right */
}
.suffix {
  margin-left: 10px; /* Space between count and suffix */
}

.injury {
  background: linear-gradient(to right, rgba(142, 7, 7, 0.5) 0%, rgba(254, 254, 254, 0) 70%);
  border-left-color: rgba(251, 71, 71, 0.5); /* Red border */
}

.missing {
  background: linear-gradient(to right, rgba(145, 131, 12, 0.5) 30%, rgba(255, 235, 47, 0) 70%);
  border-left-color: rgba(252, 230, 5, 0.5); /* Yellow border */
}

.death {
  background: linear-gradient(to right, rgba(24, 8, 8, 0.5) 30%, rgba(0, 0, 0, 0) 70%);
  border-left-color: rgba(9, 0, 0, 0.5); /* Black border */
}
.affectedPopulation{
  background: linear-gradient(to right, rgba(13, 72, 129, 0.5) 30%, rgba(0, 0, 0, 0) 70%);
  border-left-color: rgba(20, 135, 227, 0.5);
}
</style>
