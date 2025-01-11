<template>
  <div class="videoMonitorWin" v-show="visiblePanel" :style="styleObject">
    <div v-if="!showStatus">
      <div class="header-div">
        <span>聚合信息</span>
      </div>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column
            prop="type"
            label="类型"
            width="180">
        </el-table-column>
        <el-table-column
            prop="count"
            label="数量"
            width="180">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visiblePanel: null,
      positionEntity: { x: 0, y: 0 },
      popupPanelData: [],
      showStatus: false,
      data: {},
      tableData: [] // 用于表格展示的数据
    };
  },
  props: ['popupData', 'position', 'visible'],
  watch: {
    visible() {
      this.visiblePanel = this.visible;

    },
    popupData: {
      deep: true,
      handler() {
        this.popupPanelData = this.popupData.filter(item => item.plottype !==undefined);

        if (this.visiblePanel) {
          const drawTypes = this.popupPanelData.map(obj => obj.plottype);
          console.log(drawTypes)
          this.data = drawTypes.reduce((acc, type) => {
            if (acc[type]) {
              acc[type] += 1;
            } else {
              acc[type] = 1;
            }

            return acc;
          }, {});

          this.tableData = Object.entries(this.data).map(([key, value]) => ({
            type: key,
            count: value
          }));
          console.log("data",this.tableData)
        }
      }
    },
    position() {
      this.positionEntity = this.position;
    }
  },
  computed: {
    styleObject() {
      return {
        position: 'absolute',
        left: `${this.positionEntity.x}px`,
        top: `${this.positionEntity.y}px`
      };
    }
  },
  methods: {}
};
</script>

<style scoped>
.videoMonitorWin {
  position: absolute;
  width: 300px;
  padding: 20px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-div {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.el-table {
  margin-top: 10px;
}

.el-table th,
.el-table td {
  text-align: center;
  color: #333;
}

@media (max-width: 768px) {
  .videoMonitorWin {
    width: 100%;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .header-div {
    font-size: 16px;
  }
}
</style>
