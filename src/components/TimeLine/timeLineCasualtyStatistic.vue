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
    },
    currentTime: {
      type: String,
      default: ''
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

    // const plotInfo=ref([])
    const resInfo=[]
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
    watch(
        () => props.currentTime,
        (val) => {
          console.log("currentTime:", val);
          if (isDataReady.value) {
            updateTime(val);
          }
        },
        {
          immediate: true
        }
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
      const filteredPoints = pointsLayer
          .filter(data => ["死亡人员", "危重伤人员", "重伤人员", "轻伤人员"].includes(data.plotType))
      ;
      const locationDataArray = await Promise.all(filteredPoints.map(async data => {
        const {plotId, plotType, longitude, latitude,startTime,endTime} = data;

        try {
          const locationInfo = await getReverseGeocode(longitude, latitude);
          return {longitude, latitude, plotId, plotType, locationInfo,startTime,endTime};
        } catch (error) {
          console.error(`Failed to get location info for plotId ${plotId}:`, error);
          return null;
        }
      }));
      const validLocationData = locationDataArray.filter(item => item !== null);
      console.log("validLocationData", validLocationData)
      await Promise.all(validLocationData.map(async data => {
        const {locationInfo, plotId, plotType, longitude, latitude,startTime,endTime} = data;
        resInfo.push({...await getPlotInfos({plotId, plotType}),locationInfo:locationInfo});
      }));

      // console.log("res111",resInfo)
      isDataReady.value = true;
      updateTime(props.currentTime)
    }

    function updateTime(currentTime){

      console.log(resInfo,"resInfo")
      groupedEntities.cityEntities=[]
      groupedEntities.districtOrCountyEntities=[]
      groupedEntities.townshipEntities=[]
      groupedEntities.villageEntities=[]
      const levels = [
        {group: groupedEntities.cityEntities, key: 'city'},
        {group: groupedEntities.districtOrCountyEntities, key: 'county'},
        {group: groupedEntities.townshipEntities, key: 'town'},
        {group: groupedEntities.villageEntities, key: 'address'}
      ];
      // let shifdata=resInfo.filter(data=>{new Date( data.plotInfo.startTime) <=new Date(currentTime)  && new Date(data.plotInfo.endTime) >= new Date(currentTime)})
      //
      // // processStats();
      // // processStats();
      // // processStats();
      // // processStats();
      // console.log(shifdata,"shifdata")

      // let shifdata = resInfo.filter(data => {
      //   let startTime = new Date(data.plotInfo.startTime);
      //   let endTime = new Date(data.plotInfo.endTime);
      //   let current = new Date(currentTime);
      //   console.log(`Checking data: ${startTime} <= ${current} && ${current} <= ${endTime}`);
      //   return startTime <= current && endTime >= current;
      // });
      let shifdata=[]
      resInfo.forEach(item=>{
        let startTime = new Date(item.plotInfo.startTime);
        let endTime = new Date(item.plotInfo.endTime);
        let current = new Date(currentTime);
        console.log(`Checking data: ${startTime} <= ${current} && ${current} <= ${endTime}`);
        if(startTime <= current && endTime >= current){
          shifdata.push(item)
        }
      })
      console.log(shifdata,"shifdata"); // 查看筛选结果


      shifdata.forEach(pointdata=>{
        let plotId=pointdata.plotInfo.plotId

        let plotType=pointdata.plotInfo.plotType
        let longitude=pointdata.plotInfo.longitude
        let latitude=pointdata.plotInfo.latitude
        let plotTypeInfo=pointdata.plotTypeInfo
        levels.forEach(({group, key}) => {
          console.log("group,key",group,key)
          let entityGroup = group.find(g => g[key] === pointdata.locationInfo[key]);
          console.log("entityGroup11",entityGroup)
          // console.log("entityGroup11",entityGroup)
          if (!entityGroup) {

            entityGroup = {[key]: pointdata.locationInfo[key], data: []};
            group.push(entityGroup);
          }
          // if(new Date( data.startTime) <=new Date(currentTime)  && new Date(data.endTime) >= new Date(currentTime)){
          entityGroup.data.push({
            plotId,
            plotType,
            longitude,
            latitude,
            plotTypeInfo
          });
          console.log("entityGroup", entityGroup)
          // }

        });
      })


      console.log("groupedEntities", groupedEntities)
      const processStats = (entities) => {
        // console.log(entitiestmp,"entitiestmp")
        // let entities = entitiestmp
                // .filter(data => ["死亡人员", "危重伤人员", "重伤人员", "轻伤人员"].includes(data.plotType))
            // .filter(data =>new Date( data.startTime) <=new Date(currrentTime)  && new Date(data.endTime) >= new Date(currrentTime));
        ;
        entities.forEach(group => {
          console.log(group,"group")
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

      showStatisticInfo(props.zoomLevel)
    }

    function showStatisticInfo(zoomLevel) {
      statisticInfo.value = []
      switch (zoomLevel) {
        case '市':
          pushStatisticInfo(groupedEntities.cityEntities, 200000)
          break;
        case '区/县':
          pushStatisticInfo(groupedEntities.districtOrCountyEntities, 70000)
          break;
        case '乡/镇':
          pushStatisticInfo(groupedEntities.townshipEntities, 4000)
          break;
        case '村':
          pushStatisticInfo(groupedEntities.villageEntities, 2000)
          break;
        default:
          pushStatisticInfo(groupedEntities.cityEntities, 200000)
          break;
      }
    }


    function pushStatisticInfo(entitys, height) {
      statisticInfo.value = []
      entitys.forEach(entity => {
        let casualtyStatsTemplate = {
          死亡: 0,
          失踪: 0,
          危重伤: 0,
          重伤: 0,
          轻伤: 0,
          address: '',
          position: '',
          height: '',
        };
        let casualtyStats = entity.casualtyStats;
        let address = entity.city || entity.county || entity.town || entity.address || "地址未知";
        let position = Cesium.Cartesian3.fromDegrees(entity.data[0].longitude, entity.data[0].latitude);
        // 给定的对象
        let givenCasualtyStats = {
          ...casualtyStats,
          address: address,
          position: position,
          height: height,
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
