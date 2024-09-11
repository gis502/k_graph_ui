<template>
  <div class="container">
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
    <div class="row death">
      <span class="label">遇难人数</span>
      <span class="count">{{ deathCount }}</span>
      <span class="suffix">人</span>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const injuryCount = ref(0);
const missingCount = ref(0);
const deathCount = ref(0);

injuryCount.value = 0;
missingCount.value = 0;
deathCount.value = 0;
</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0 1vh;
}

.row {
  margin: 0.7vh 0;
  height: 8vh;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  padding-left: 20px; /* Move text 10px to the right */
  border-left-width: 0.1vw; /* Add a border on the left */
  border-left-style: solid; /* Style the left border */
  position: relative;
}

.count {
  font-size: 25px; /* Larger font size for the numbers */
  color: rgb(248, 150, 150);
  margin-left: 9vw; /* Pushes count to the right */
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
</style>