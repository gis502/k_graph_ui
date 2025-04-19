<template>
  <div class="big-data-view">
    <!-- Hot Topics and Keyword Cloud Section -->
    <div class="box">
      <div class="box-container">
        <!-- Left: Hot Topics List -->
        <div class="topics-container">
          <div class="tit02 text-b">热门话题榜</div>
          <div class="huati">
            <ul>
              <li v-for="(topic, index) in topics" :key="index">
                <span class="rank">{{ index + 1 }}.</span>
                <span class="topic-name">{{ topic.name }}</span>
                <span class="change" :class="{ 'up': topic.change.startsWith('↑'), 'down': topic.change.startsWith('↓') }">
                  {{ topic.change }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Keyword Cloud -->
        <div class="cloud-container">
          <div class="text-b tit02 cloud-title">关键词 — 云</div>
          <div class="tagcloud" ref="tagcloud">
            <a v-for="(keyword, index) in keywords"
               :key="index"
               :class="keyword.class"
               href="#"
               @mouseenter="handleMouseEnter(index)"
               @mouseleave="handleMouseLeave"
            >
              {{ keyword.text }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 在模板底部添加调试信息 -->
    <div v-if="false" class="debug-info">
      <div v-for="(pos, index) in ballPositions" :key="index">
        球{{ index }}: X={{ Math.round(pos.x) }}, Y={{ Math.round(pos.y) }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  setup() {
    const topics = ref([
      { name: "数据分析", change: "↑2167" },
      { name: "云存储", change: "↑2167" },
      { name: "视觉分析", change: "↓2167" },
      { name: "海量词库", change: "↓2167" },
      { name: "云词典", change: "↓2167" },
    ]);

    const tagcloud = ref(null);


    // 初始化关键词数据
    const keywords = ref([
      { text: "大数据", class: "b01 co01", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "云计算", class: "b02 co02", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "数据分析", class: "b03 co05", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "人工智能", class: "b04 co02", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "机器学习", class: "b03 co05", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "深度学习", class: "b02 co03", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "神经网络", class: "b01 co04", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "数据挖掘", class: "b04 co01", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "自然语言", class: "b03 co02", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
      { text: "计算机视觉", class: "b02 co05", x: 0, y: 0, vx: 0, vy: 0, scale: 1, opacity: 0.8, zIndex: 1, targetX: 0, targetY: 0 },
    ]);

    // 初始化粒子位置和速度
    const initParticles = () => {
      if (!tagcloud.value) return;

      const containerWidth = tagcloud.value.clientWidth;
      const containerHeight = tagcloud.value.clientHeight;

      keywords.value.forEach((particle, index) => {
        // 随机初始位置
        particle.x = Math.random() * (containerWidth - 100);
        particle.y = Math.random() * (containerHeight - 100);

        // 随机初始速度
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;

        // 初始目标位置就是当前位置
        particle.targetX = particle.x;
        particle.targetY = particle.y;
      });
    };

    const hoveredIndex = ref(null);
    const hoverStartTime = ref(0);
    const isAttracting = ref(false);
    const animationFrame = ref(null);


    // 存储每个球的位置信息
    const ballPositions = ref([]);

    // 更新球的位置信息
    const updateBallPositions = () => {
      if (!tagcloud.value) return;

      const containerRect = tagcloud.value.getBoundingClientRect();
      ballPositions.value = keywords.value.map(ball => {
        return {
          x: ball.x + containerRect.left,
          y: ball.y + containerRect.top,
          width: ball.width,
          height: ball.height
        };
      });
    };

    // 更新粒子位置
    const updateParticles = () => {
      if (!tagcloud.value) return;

      const containerWidth = tagcloud.value.clientWidth;
      const containerHeight = tagcloud.value.clientHeight;
      const attractionForce = 0.03; // 吸引力系数
      const repulsionForce = 30;    // 排斥力系数
      const damping = 0.95;         // 阻尼系数
      const attractionDuration = 3000; // 3秒吸引时间

      // 如果有悬停的元素
      if (hoveredIndex.value !== null) {
        const hoveredParticle = keywords.value[hoveredIndex.value];
        const currentTime = Date.now();

        // 如果是刚开始悬停，记录时间
        if (hoverStartTime.value === 0) {
          hoverStartTime.value = currentTime;
          isAttracting.value = true;
        }

        // 计算已经吸引的时间
        const elapsedTime = currentTime - hoverStartTime.value;

        keywords.value.forEach((particle, index) => {
          if (index === hoveredIndex.value) {
            // 悬停的元素保持原位并放大
            particle.targetX = particle.x;
            particle.targetY = particle.y;
            particle.vx = 0;
            particle.vy = 0;
            particle.scale = 1.3; // 放大30%
            particle.opacity = 1;
            particle.zIndex = 10;
          } else if (isAttracting.value && elapsedTime < attractionDuration) {
            // 其他元素在3秒内缓慢靠拢
            const progress = elapsedTime / attractionDuration;
            const easeProgress = Math.sin(progress * Math.PI / 2); // 缓动效果

            // 计算与悬停元素的方向
            const dx = hoveredParticle.x - particle.x;
            const dy = hoveredParticle.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 设置目标位置为悬停元素周围的位置（形成圆形布局）
            const angle = Math.atan2(dy, dx);
            const targetDistance = 150 + (index % 3) * 30; // 不同距离形成层次
            const targetAngle = angle + (index % 5) * 0.2; // 稍微分散角度

            particle.targetX = hoveredParticle.x - Math.cos(targetAngle) * targetDistance;
            particle.targetY = hoveredParticle.y - Math.sin(targetAngle) * targetDistance;

            // 应用缓动效果
            particle.targetX = particle.x + (particle.targetX - particle.x) * easeProgress * 0.1;
            particle.targetY = particle.y + (particle.targetY - particle.y) * easeProgress * 0.1;

            particle.scale = 1 - 0.2 * easeProgress; // 稍微缩小
            particle.opacity = 0.8;
            particle.zIndex = 1;
          } else {
            // 3秒后或不再吸引时恢复随机运动
            isAttracting.value = false;
            if (Math.random() < 0.01) {
              particle.targetX = Math.random() * (containerWidth - 100);
              particle.targetY = Math.random() * (containerHeight - 100);
            }
            particle.scale = 1;
            particle.opacity = 0.8;
            particle.zIndex = 1;
          }
        });

        // 如果超过3秒，停止吸引状态
        if (elapsedTime >= attractionDuration) {
          isAttracting.value = false;
        }
      } else {
        // 没有悬停元素时，恢复随机运动
        hoverStartTime.value = 0;
        isAttracting.value = false;

        keywords.value.forEach((particle, index) => {
          // 随机改变目标位置
          if (Math.random() < 0.01) {
            particle.targetX = Math.random() * (containerWidth - 100);
            particle.targetY = Math.random() * (containerHeight - 100);
          }

          particle.scale = 1;
          particle.opacity = 0.8;
          particle.zIndex = 1;
        });
      }

      // 碰撞检测和响应（保持原有代码）
      for (let i = 0; i < keywords.value.length; i++) {
        for (let j = i + 1; j < keywords.value.length; j++) {
          const p1 = keywords.value[i];
          const p2 = keywords.value[j];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const radius1 = Math.max(p1.width, p1.height) / 2;
          const radius2 = Math.max(p2.width, p2.height) / 2;
          const minDist = radius1 + radius2;

          if (distance < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - distance) * 0.5;

            const fx = Math.cos(angle) * force;
            const fy = Math.sin(angle) * force;

            p1.vx -= fx;
            p1.vy -= fy;
            p2.vx += fx;
            p2.vy += fy;
          }
        }
      }

      // 更新所有粒子的位置
      keywords.value.forEach(particle => {
        // 如果不是悬停的球或者不在吸引状态，才计算移动
        if (!isAttracting.value || hoveredIndex.value === null ||
            keywords.value.indexOf(particle) !== hoveredIndex.value) {
          // 计算朝向目标位置的力
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;

          // 应用力
          particle.vx += dx * 0.01;
          particle.vy += dy * 0.01;

          // 应用阻尼
          particle.vx *= damping;
          particle.vy *= damping;

          // 边界检查
          const radius = Math.max(particle.width, particle.height) / 2;
          if (particle.x < radius) {
            particle.x = radius;
            particle.vx *= -0.5;
          }
          if (particle.x > containerWidth - radius) {
            particle.x = containerWidth - radius;
            particle.vx *= -0.5;
          }
          if (particle.y < radius) {
            particle.y = radius;
            particle.vy *= -0.5;
          }
          if (particle.y > containerHeight - radius) {
            particle.y = containerHeight - radius;
            particle.vy *= -0.5;
          }

          // 更新位置
          particle.x += particle.vx;
          particle.y += particle.vy;
        }
      });

      updateBallPositions();

      animationFrame.value = requestAnimationFrame(updateParticles);
    };

    // 鼠标进入处理
    const handleMouseEnter = (index) => {
      hoveredIndex.value = index;

      // 立即停止被悬停球的运动
      if (keywords.value[index]) {
        keywords.value[index].vx = 0;
        keywords.value[index].vy = 0;
        keywords.value[index].targetX = keywords.value[index].x;
        keywords.value[index].targetY = keywords.value[index].y;
      }
    };

    // 鼠标离开处理
    const handleMouseLeave = () => {
      hoveredIndex.value = null;
      hoverStartTime.value = 0;
      isAttracting.value = false;
    };

    onMounted(() => {
      initParticles();
      animationFrame.value = requestAnimationFrame(updateParticles);

      // 窗口大小改变时重新初始化
      window.addEventListener('resize', initParticles);
    });

    onUnmounted(() => {
      cancelAnimationFrame(animationFrame.value);
      window.removeEventListener('resize', initParticles);
    });

    return {
      topics,
      keywords,
      tagcloud,
      handleMouseEnter,
      handleMouseLeave,
      ballPositions // 暴露位置信息供调试
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}



.big-data-view {
  color: #fff;
  font-family: "微软雅黑";
}

.box {
  margin-bottom: 12px;
  position: relative;
}

.box-container {
  display: flex;
  height: 227px;
  gap: 20px;
}

.topics-container {
  flex: 0 0 41%;
  margin-left: 5%;
  padding: 1px;
  display: flex;
  flex-direction: column;
}

.cloud-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-b {
  color: #07e5ff;
  font-size: 16px;
  margin-bottom: 10px;
}

.cloud-title {
  text-align: center;
}

.tagcloud {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.tagcloud a {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  color: #fff;
  font-weight: bold;
  text-decoration: none;
  border-radius: 50%;
  text-align: center;
  transition: all 0.3s ease;
  will-change: transform, opacity;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
}

.tagcloud a {
  will-change: transform, opacity;
  transform-origin: center center;
  transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28),
  opacity 0.2s ease;
}

.b01 {
  width: 50px;
  height: 50px;
  background: rgba(5, 118, 254, 0.6);
  font-size: 12px;
}

.b02 {
  width: 80px;
  height: 80px;
  background: rgba(238, 255, 65, 0.6);
  font-size: 16px;
}

.b03 {
  width: 60px;
  height: 60px;
  background: rgba(255, 138, 0, 0.6);
  font-size: 14px;
}

.b04 {
  width: 70px;
  height: 70px;
  background: rgba(1, 187, 181, 0.6);
  font-size: 15px;
}

.co01 { color: #fff; }
.co02 { color: #333; }
.co03 { color: #fff; }
.co04 { color: #333; }
.co05 { color: #fff; }

.huati ul {
  list-style: none;
  padding: 0;
}

.huati li {
  display: flex;
  align-items: center;
  margin: 14px 0;
  font-size: 14px;
  line-height: 1.5;
}

.rank {
  margin-right: 8px;
  color: #07e5ff;
  width: 20px;
}

.topic-name {
  flex: 1;
  color: #fff;
}

.change {
  margin-left: 10px;
  font-size: 12px;
  width: 50px;
  text-align: right;
}

.change.up {
  color: #14e144;
}

.change.down {
  color: #ff4d4f;
}

/* 悬停效果 */
.tagcloud a:hover {
  transform: scale(1.2) !important;
  opacity: 1 !important;
  z-index: 100 !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.debug-info {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 10px;
  font-family: monospace;
}
</style>
