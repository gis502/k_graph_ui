<template>
  <div class="casualtyStatistic">
    人员伤亡详情
    <div class="casualtyStatistic-main">
      <el-table :data="statisticInfo" @row-click="flyTo">
        <el-table-column prop="address" label="位置" width="67" align="center"></el-table-column>
        <el-table-column prop="死亡" label="死亡" width="56" align="center" :formatter="formatPeople"></el-table-column>
        <el-table-column prop="失踪" label="失踪" width="56" :formatter="formatPeople"></el-table-column>
        <el-table-column prop="危重伤" label="危重伤" width="65" :formatter="formatPeople"></el-table-column>
        <el-table-column prop="重伤" label="重伤" width="60" :formatter="formatPeople"></el-table-column>
        <el-table-column prop="轻伤" label="轻伤" width="60" :formatter="formatPeople"></el-table-column>
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
    const resInfo=ref([]);
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
          // if (isDataReady.value) {
          //   console.log("zoomLevel:", val);
          //   showStatisticInfo(val)
          // }
          if(!isDataReady.value){
            getRescueActionCasualtiesPlotAndInfo(props.pointsLayer);
          }
          showStatisticInfo(val)
        },
        {immediate: true}
    );
    watch(
        () => props.currentTime,
        (val) => {
          console.log("currentTimeupodate statistic:", val);
          console.log(isDataReady,"isDataReady")
          if(!isDataReady.value){
            getRescueActionCasualtiesPlotAndInfo(props.pointsLayer);
          }
          // if (isDataReady.value) {
            updateTime(val);
          // }
        },
        {
          immediate: true
        }
    );
    function formatPeople(row, column, value) {
      return value + '人';
    }

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
      console.log(filteredPoints,'filteredPoints')
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
      console.log(locationDataArray,'locationDataArray')
      const validLocationData = locationDataArray.filter(item => item !== null);
      resInfo.value=[]
      console.log("resInfo.value000",resInfo.value)
      await Promise.all(validLocationData.map(async data => {

        const {locationInfo, plotId, plotType, longitude, latitude,startTime,endTime} = data;

        resInfo.value.push({...await getPlotInfos({plotId, plotType}),locationInfo:locationInfo});
      }));

      console.log("resInfo.value111",resInfo.value)
      isDataReady.value = true;
      updateTime(props.currentTime)
    }

    function updateTime(currentTime){

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

      let shifdata=[]
      // console.log(resInfo.value,"resInfo.value222"); // 查看筛选结果
      resInfo.value.forEach(item=>{
        let startTime = new Date(item.plotInfo.startTime);
        let current = new Date(currentTime);
        if(startTime <= current){
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
          let entityGroup = group.find(g => g[key] === pointdata.locationInfo[key]);
          if (!entityGroup) {
            entityGroup = {[key]: pointdata.locationInfo[key], data: []};
            group.push(entityGroup);
          }
          entityGroup.data.push({
            plotId,
            plotType,
            longitude,
            latitude,
            plotTypeInfo
          });
        });
      })
      console.log("groupedEntities", groupedEntities)
      const processStats = (entities) => {
        entities.forEach(group => {
          // console.log(group,"group")
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
      console.log("showStatisticInfo",zoomLevel)
      switch (zoomLevel) {
        case '市':
          pushStatisticInfo(groupedEntities.cityEntities, 200000)
          break;
        case '区/县':
          pushStatisticInfo(groupedEntities.districtOrCountyEntities, 40000)
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
      console.log("pushStatisticInfo",entitys, height)
      statisticInfo.value = []
      entitys.forEach(entity => {
        let casualtyStatsTemplate = {
          死亡: 0,
          失踪: 0,
          危重伤: 0,
          重伤: 0,
          轻伤: 0,
          address: '',
          latitude: '',
          longitude:'',
          height: '',
          plotId:'',
        };
        let casualtyStats = entity.casualtyStats;
        let address = entity.city || entity.county || entity.town || entity.address || "地址未知";
        // let position = Cesium.Cartesian3.fromDegrees(entity.data[0].longitude, entity.data[0].latitude);
        // 给定的对象
        let givenCasualtyStats = {
          ...casualtyStats,
          address: address,
          latitude:entity.data[0].latitude,
          longitude:entity.data[0].longitude,
          // position: position,
          height: height,
          plotId:entity.data[0].plotId,
        };
        // 将给定的对象转换为与 casualtyStatsTemplate 相同的属性名称
        let one = Object.keys(casualtyStatsTemplate).reduce((acc, key) => {
          acc[key] = givenCasualtyStats[key] || 0;
          return acc;
        }, {});
        statisticInfo.value.push(one)
        console.log(statisticInfo,"statisticInfo")
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

    function flyTo(row, column, cell, event){
      console.log(row)
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            parseFloat(row.longitude),
            parseFloat(row.latitude),
            parseFloat(row.height)),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        },
        duration: 2 // 飞行动画持续时间（秒）
      });

      if(row.height===2000){

        let entity = window.pointDataSource.entities.getById(row.plotId);

// 透明度变化的时间间隔（毫秒）
        let intervalTime1 = 200;
// 当前透明度因子
        let colorFactor = 1.0;
// 设置定时器，每隔 intervalTime1 毫秒改变一次透明度
        let intervalId1 = setInterval(() => {
          colorFactor = colorFactor === 1.0 ? 0.5 : 1.0;
          // 更新实体的透明度
          entity.billboard.color = Cesium.Color.fromAlpha(Cesium.Color.WHITE, colorFactor);
        }, intervalTime1);

// 停止时间（毫秒）
        let stoptime = 5000; // 例如，2000毫秒后停止变化
        setTimeout(() => {
          clearInterval(intervalId1);
          colorFactor = 1.0;
          // 确保在停止后将透明度设置回 1.0
          entity.billboard.color = Cesium.Color.fromAlpha(Cesium.Color.WHITE, colorFactor);
        }, stoptime);
      }

    }
    return {
      entityGroups,
      toggleEntities,
      getRescueActionCasualtiesPlotAndInfo,
      statisticInfo,
      flyTo,
      formatPeople
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
  top: 34.5%;
  width: 25%;
  height: 21%;
  padding: 10px;
  border-radius: 5px;
  left: 1%;
  z-index: 40;
  background-color: rgb(22, 53, 77, 0.9);
  backdrop-filter: none !important;
  border: 1px solid #008aff70;
  color: #FFFFFF;
}

</style>

