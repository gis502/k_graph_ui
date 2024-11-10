<template>
  <div class="casualtyStatistic">
    人员伤亡统计
    <div class="casualtyStatistic-main">
      <el-table :data="statisticInfo">
        <el-table-column prop="address" label="位置" width="80" align="center"></el-table-column>
        <el-table-column prop="死亡" label="死亡（人）" width="75" align="center"></el-table-column>
        <el-table-column prop="失踪" label="失踪（人）" width="75"></el-table-column>
        <el-table-column prop="危重伤" label="危重伤（人)" width="75"></el-table-column>
        <el-table-column prop="重伤" label="重伤（人）" width="75"></el-table-column>
        <el-table-column prop="轻伤" label="轻伤（人）" width="75"></el-table-column>
      </el-table>
    </div>
  </div>
</template>


<script>
import * as Cesium from "cesium";
import {getPlotInfos} from "@/api/system/plot.js";
import axios from "axios";
import {ref, watch, onMounted} from "vue";

export default {
  name: "layeredShowPlot",
  props: {
    zoomLevel: {
      type: String,
      default: '市'
    },
    pointsLayer: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const isDataReady = ref(false);
    const entityGroups = ref({
      cityEntities: [],
      districtOrCountyEntities: [],
      townshipEntities: [],
      villageEntities: []
    });
    const labelText = ref('11');
    const statisticInfo = ref([]);
    const groupedEntities = {
      cityEntities: [],
      districtOrCountyEntities: [],
      townshipEntities: [],
      villageEntities: []
    };
    // 监视 zoomLevel 和 pointsLayer
    watch(
        () => props.pointsLayer,
        (newVal) => {
          console.log("Updated pointsLayer:", newVal);
          getRescueActionCasualtiesPlotAndInfo(newVal);
        },
        {deep: true}
    );

    watch(
        () => props.zoomLevel,
        (val) => {
          if (isDataReady.value) {
            console.log("zoomLevel:", val);
            showStatisticInfo(val)

          }
        },
        {immediate: true}
    );

    // 实现 Cesium 实体的切换显示
    function toggleEntities(entityName, show) {
      if (entityGroups.value[entityName] !== undefined) {
        entityGroups.value[entityName].forEach(entity => {
          entity.show = show;
        });
      } else {
        console.error(`Entity ${entityName} is undefined.`);
      }
    }

    async function getRescueActionCasualtiesPlotAndInfo(pointsLayer) {
      console.log("pointsLayer 22", pointsLayer)
      const filteredPoints = pointsLayer.filter(data =>
          ["死亡人员", "危重伤人员", "重伤人员", "轻伤人员"].includes(data.plotType)
      );
      console.log("filteredPoints", filteredPoints)
      const locationDataArray = await Promise.all(filteredPoints.map(async data => {
        const {plotId, plotType, longitude, latitude} = data;

        try {
          const locationInfo = await getReverseGeocode(longitude, latitude);
          return {longitude, latitude, plotId, plotType, locationInfo};
        } catch (error) {
          console.error(`Failed to get location info for plotId ${plotId}:`, error);
          return null;
        }
      }));

      console.log("locationDataArray", locationDataArray)
      const validLocationData = locationDataArray.filter(item => item !== null);
      console.log("validLocationData", validLocationData)


      await Promise.all(validLocationData.map(async data => {
        const {locationInfo, plotId, plotType, longitude, latitude} = data;
        const res = await getPlotInfos({plotId, plotType});

        const levels = [
          {group: groupedEntities.cityEntities, key: 'city'},
          {group: groupedEntities.districtOrCountyEntities, key: 'county'},
          {group: groupedEntities.townshipEntities, key: 'town'},
          {group: groupedEntities.villageEntities, key: 'address'}
        ];

        levels.forEach(({group, key}) => {
          let entityGroup = group.find(g => g[key] === locationInfo[key]);
          if (!entityGroup) {
            entityGroup = {[key]: locationInfo[key], data: []};
            group.push(entityGroup);
          }
          entityGroup.data.push({
            plotId,
            plotType,
            longitude,
            latitude,
            plotTypeInfo: res.plotTypeInfo
          });
        });
      }));

      console.log("groupedEntities", groupedEntities)
      const processStats = (entities) => {
        entities.forEach(group => {
          const casualtyStats = {};
          let totalNewCount = 0;

          group.data.forEach(entry => {
            const status = entry.plotTypeInfo?.casualtyStatus;
            const count = entry.plotTypeInfo?.newCount || 0;

            if (status) {
              casualtyStats[status] = (casualtyStats[status] || 0) + count;
            }
            totalNewCount += count;
          });

          group.casualtyStats = casualtyStats;
          group.totalNewCount = totalNewCount;
        });
      };

      processStats(groupedEntities.cityEntities);
      processStats(groupedEntities.districtOrCountyEntities);
      processStats(groupedEntities.townshipEntities);
      processStats(groupedEntities.villageEntities);
      showStatisticInfo(props.pointsLayer)

      isDataReady.value = true;
    }

    function showStatisticInfo(val) {
      statisticInfo.value = []
      switch (val) {
        case '市':
          pushStatisticInfo(groupedEntities.cityEntities,200000)
          break;
        case '区/县':
          pushStatisticInfo(groupedEntities.districtOrCountyEntities,70000)
          break;
        case '乡/镇':
          pushStatisticInfo(groupedEntities.townshipEntities,4000)
          break;
        case '村':
          pushStatisticInfo(groupedEntities.villageEntities,2000)
          break;
        default:
          pushStatisticInfo(groupedEntities.cityEntities,200000)
          break;
      }
    }


    function pushStatisticInfo(entitys,height) {
      statisticInfo.value = []
      entitys.forEach(entity => {
        let casualtyStatsTemplate = {
          死亡: 0,
          失踪: 0,
          危重伤: 0,
          重伤: 0,
          轻伤: 0,
          address: '',
          position:'',
          height:'',
        };
        let casualtyStats = entity.casualtyStats;
        let address = entity.city || entity.county || entity.town || entity.address || "地址未知";
        let position = Cesium.Cartesian3.fromDegrees(entity.data[0].longitude, entity.data[0].latitude);
        // 给定的对象
        let givenCasualtyStats = {
          ...casualtyStats,
          address: address,
          position:position,
          height:height,
        };
        // 将给定的对象转换为与 casualtyStatsTemplate 相同的属性名称
        let one = Object.keys(casualtyStatsTemplate).reduce((acc, key) => {
          acc[key] = givenCasualtyStats[key] || 0;
          return acc;
        }, {});
        console.log("casualtyStats", casualtyStats);
        statisticInfo.value.push(one)
      })
    }


    async function getReverseGeocode(lon, lat) {
      try {
        const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
          params: {
            postStr: JSON.stringify({lon, lat, ver: 1}),
            type: 'geocode',
            tk: '80eb284748e84ca6c70468c906f0c889'
          }
        });
        return response.data.result.addressComponent;
      } catch (error) {
        console.error("逆地理编码失败:", error);
        return null;
      }
    }

    return {
      entityGroups,
      toggleEntities,
      getRescueActionCasualtiesPlotAndInfo,
      statisticInfo,
    };
  }
}
;
</script>

<style scoped>
.casualtyStatistic {
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  top: 39%;
  width: 27%;
  height: 24%;
  padding: 10px;
  border-radius: 5px;
  right: 1%;
  z-index: 40;
  background-color: rgb(22, 53, 77, 0.9);
  backdrop-filter: none !important;
  border: 1px solid #008aff70;
  color: #FFFFFF;
}

</style>
