<!--指挥大屏  救援队伍、应急物资、避难场所图层标绘点的弹窗-->
<template>
  <div class="videoMonitorWin" v-if="visiblePanel" :style="styleObject">
    <div class="ponpTitle">{{ this.popupTitle }}</div>
    <div class="ponpTable">


      <el-descriptions :column="2" size="default " border>
        <template v-for="(value, key) in popupPanelData" :key="key">
          <!-- 标绘信息 -->
          <el-descriptions-item >
            <template #label>
              <div class="cell-item">
                {{ keyToChinese(key) }}
              </div>
            </template>
            <div >
              <el-text size="large">
                <span v-if="key === keyMappings.insertTime">{{ formatInsertTime(value) }}</span>
                <span v-else-if="key === keyMappings.longitude"> {{ value || "无数据" }}°E</span>
                <span v-else-if="key === keyMappings.latitude"> {{ value || "无数据" }}°N</span>
                <span v-else>{{ value }}</span>
              </el-text>
            </div>
          </el-descriptions-item>

        </template>


      </el-descriptions>
    </div>
    <!-- 取消注释按钮以启用删除功能 -->
    <!-- <el-button @click="deletePoint" type="danger" icon="el-icon-delete" circle></el-button> -->
  </div>
</template>

<script>

import {toRaw} from 'vue'
import dayjs from 'dayjs'; // 引入dayjs库进行时间格式化

export default {
  data() {
    return {
      visiblePanel: null,
      positionEntity: {x: 0, y: 0},
      popupPanelData: {},  //中文的弹框数据
      popupTitle: '',
      keyMappings: {
        lon: '经度',
        longitude: '经度',
        lat: '纬度',
        latitude: '纬度',
        // 物资表
        county: '县（区）',
        storagePointsCount: '储备库点数量（个）',
        totalItemsCount: '合计总件套数',
        tents: '救灾帐篷（顶）',
        quilts: '棉被（床）',
        otherBlankets: '其他被子（床）',
        cottonClothing: '棉衣裤（套）',
        cottonCoats: '棉大衣（件）',
        otherClothing: '其他衣物（套、件）',
        blankets: '毛毯（床）',
        foldingBeds: '折叠床（张）',
        bunkBeds: '高低床（套）',
        tarpaulins: '彩条布（包）',
        moistureProofPads: '防潮垫（张）',
        generators: '发电机（台）',
        lightingFixtures: '照明灯具（个）',
        lightingSets: '照明灯组（套）',
        flashlights: '手电筒（支）',
        raincoats: '雨衣（件）',
        rainBoots: '雨靴（双）',
        otherEquipment: '其他装备数量（个）',
        address: '地址',
        geom: '位置',
        contactPerson: '联系人',
        contactPhone: '联系电话',
        insertTime: '插入时间',
        other: '其他',
        reliefFamiliesBox: '赈济家庭箱',
        uuid: 'UUID',
        // 装备表
        totalItems: '合计总件套数',
        infraredDetector: '红外探测仪',
        opticalDetector: '光学探测仪(蛇眼)',
        hydraulicExpansionPliers: '液压扩张钳',
        hydraulicCuttingPliers: '液压剪切钳',
        rockDrill: '凿岩机',
        pryBar: '撬棍（把）',
        rebarCutter: '钢筋速断器',
        manualHydraulicJack: '手动液压千斤顶',
        glowStick: '发光棒',
        fuel: '油料（升）',
        tensionWire: '抗拉索',
        rescueRope: '救援绳（米）',
        ropeThrower: '抛绳器',
        foldingLadder: '折叠梯（个）',
        shovelPickHookForkHammer: '锹/镐/钩/叉/锤',
        foldingShovel: '折叠铲（把）',
        whistle: '口哨（个）',
        helmet: '头盔（顶）',
        gloves: '手套（双）',
        lifeline: '救生缆索（米）',
        drainagePump: '排水泵（台）',
        windFireExtinguisher: '风力灭火机（个）',
        shovel: '铁锹（把）',
        lifeJacket: '救生衣（件）',
        lifebuoy: '救生圈（个）',
        warningTape: '警示带（米）',
        walkieTalkie: '对讲机（台）',
        megaphone: '扩音器（个）',
        gong: '锣（个）',
        headlamp: '头灯（个）',
        portableLight: '手提照明灯（个）',
        firstAidKit: '医疗急救箱',
        excavator: '挖掘机',
        loader: '装载机（推土机）',
        waterPump: '抽水泵',
        relayWaterPump: '接力水泵',
        mobileWaterBag: '移动水囊（个）',
        backpackSprayer: '背负式喷水灭火抢',
        chainsaw: '油锯（个）',
        hose: '水带（米）',
        fireTruck: '消防水车',
        insertionTime: '插入时间',
        // 雅安应急队伍表
        affiliatedAgency: '所属机构',
        levelName: '级别名称',
        teamTypeName: '队伍类型名称',
        totalMembers: '总人数',
        establishmentDate: '成立时间',
        mainResponsibilities: '主要职责',
        expertiseDescription: '专长描述',
        emergencyCommunicationMethods: '应急通讯方式',
        preparationTime: '预计准备时间',
        assemblyLocation: '集合出发地点',
        selfTransportation: '自备交通工具',
        personInCharge: '负责人',
        chargePhone: '负责人电话',
        confidentialityName: '密级名称',
        modifierName: '修改人名称',
        qualificationLevel: '资质等级',
        dataSource: '数据来源',
        notes: '备注',
        //   避难场所表
        name: '名称',
        shelterTypeName: '场所类型名称',
        area: '面积',
        capacity: '可容纳人数',
        secretLevel: '保密级别',
        administrativeDivision: '行政区划',
        emergencyPhone: '应急电话',
        emergencyMobile: '应急手机',
        affiliatedOrganization: '所属机构',
        startTime: '投入使用时间',
        designServiceLife: '设计使用年限',
        description: '基本情况',
        seismicIntensity: '抗震设防烈度',
        dataSourceUnit: '数据来源单位',
        remarks: '备注',
        geometry: '位置',

        // 来自历史地震
        type: "震中",
        historyEqTime: '发震时间',
        earthquakeName: '地震名称',
        position: '位置',
        magnitude: '震级',
        depth: '震源深度'
      },
    }
  },
  props: ['popupData', 'position', 'visible'],
  watch: {
    visible() {
      this.visiblePanel = this.visible;
      console.log(this.visiblePanel, 234)
    },
    popupData: {
      deep: true,
      handler() {
        // 转换 popupData,避免嵌套Proxy
        const rawPopupData = toRaw(this.popupData);
        // console.log(rawPopupData, 'data----');
        // 获取 popupTitle表头
        this.popupTitle = rawPopupData.tableName;
        // console.log(this.popupTitle, 'title----');

      // 将 key 转换为中文
        const translatedData = {};
        for (const key in rawPopupData) {
          if (rawPopupData.hasOwnProperty(key) && key !== 'tableName' && key !== 'uuid' && key !== 'uniqueId' && key !== 'type' && key !== 'geom' && key !== 'icon' && key !== 'uniqueIdentifier') {
            if (key === 'insertionTime' || key === 'insertTime') {
              if (rawPopupData[key] !== null) {
                const translatedKey = this.keyMappings[key] || key;
                translatedData[translatedKey] = rawPopupData[key];
              }
            } else {
              const translatedKey = this.keyMappings[key] || key;
              translatedData[translatedKey] = rawPopupData[key];
            }
          }
        }
        this.popupPanelData = translatedData;

        console.log(" this.popupPanelData RouterPannel", this.popupPanelData)


      }
    },
    position() {

      this.positionEntity = this.position;
    },
  },
  computed: {
    // 调整弹框位置
    styleObject() {
      return {
        position: "absolute",
        left: `${this.positionEntity.x}px`,
        top: `${this.positionEntity.y}px`
      };
    },
  },
  methods: {
    keyToChinese(key) {

      return this.keyMappings[key] || key;
    },
    formatInsertTime(value) {

      // 使用dayjs库进行时间格式转换
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    },
    // 删除标注
    deletePoint() {
      this.$emit('closePlotPop');
      this.$emit('wsSendPoint', JSON.stringify({type: "point", operate: "delete", id: window.selectedEntity.id}));
    }
  }
};
</script>

<style scoped>
/* 调整字体大小为原来的 70% */
* {
  font-size: 95%;
}



.el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
  /*width: 43px!important;*/
}

.earthquake-info-table th,
.earthquake-info-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #21c9db;
  font-size: 0.8rem;
  font-weight: 550;
}

.cell-item {
  width: 100%;
  text-align: center;
  white-space: nowrap; /* 避免换行 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

.ponpTitle {
  color: white;
  display: flex;
  justify-content: center;
  font-size: 128%;
  align-items: center;
  margin-bottom: 1px;
}

.videoMonitorWin {
  position: absolute;
  width: 600px;
  padding: 2px;
  z-index: 80;
  background-color: rgba(40, 40, 40, 0.7);
  border: 2px solid #18c9dc;
}

.ponpTable td {
  padding: 10px;
}

.info-item :nth-child(1) {
  width: 15%;
  border-color: #293966;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #293966;
  margin-bottom: 2px;
  align-content: center;
}

.info-item :nth-child(2) {
  width: 70%;
  border-color: #4d5469;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #4d5469;
  margin-bottom: 2px;
}
.ponpTable {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 100%;
  margin: 7px 6px;
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto; /* 当内容超出高度时出现滚动条 */
}


.el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
  border: var(--el-descriptions-table-border);
  padding: 7px 7px;
}



svg {
  vertical-align: middle; /* 保持文本和图标对齐 */
  margin-right: 0.5rem; /* 图标和文本间距 */
}

</style>
