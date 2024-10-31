<template>
  <div></div> <!-- Cesium 实体不会直接渲染到 DOM 中 -->
</template>

<script>
import * as Cesium from "cesium";
import { getPlotInfos } from "@/api/system/plot.js";
import axios from "axios";
import { ref, watch, onMounted } from "vue";

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

    // 监视 zoomLevel 和 pointsLayer
    watch(
        () => props.pointsLayer,
        (newVal) => {
          console.log("Updated pointsLayer:", newVal);
          getRescueActionCasualtiesPlotAndInfo(newVal);
        },
        { deep: true }
    );

    watch(
        () => props.zoomLevel,
        (val) => {
          if (isDataReady.value) {
            console.log("zoomLevel:", val);
            switch (val) {
              case '市':
                toggleEntities('cityEntities', true);
                toggleEntities('districtOrCountyEntities', false);
                toggleEntities('townshipEntities', false);
                toggleEntities('villageEntities', false);
                break;
              case '区/县':
                toggleEntities('cityEntities', false);
                toggleEntities('districtOrCountyEntities', true);
                toggleEntities('townshipEntities', false);
                toggleEntities('villageEntities', false);
                break;
              case '乡/镇':
                toggleEntities('cityEntities', false);
                toggleEntities('districtOrCountyEntities', false);
                toggleEntities('townshipEntities', true);
                toggleEntities('villageEntities', false);
                break;
              case '村':
                toggleEntities('cityEntities', false);
                toggleEntities('districtOrCountyEntities', false);
                toggleEntities('townshipEntities', false);
                toggleEntities('villageEntities', true);
                break;
              default:
                toggleEntities('cityEntities', false);
                toggleEntities('districtOrCountyEntities', false);
                toggleEntities('townshipEntities', false);
                toggleEntities('villageEntities', false);
            }
          }
        },
        { immediate: true }
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
      const filteredPoints = pointsLayer.filter(data =>
          ["死亡人员", "重伤人员", "轻伤人员", "危重伤人员"].includes(data.plotType)
      );

      const locationDataArray = await Promise.all(filteredPoints.map(async data => {
        const { plotId, plotType, longitude, latitude } = data;

        try {
          const locationInfo = await getReverseGeocode(longitude, latitude);
          return { longitude, latitude, plotId, plotType, locationInfo };
        } catch (error) {
          console.error(`Failed to get location info for plotId ${plotId}:`, error);
          return null;
        }
      }));

      const validLocationData = locationDataArray.filter(item => item !== null);

      const groupedEntities = {
        cityEntities: [],
        districtOrCountyEntities: [],
        townshipEntities: [],
        villageEntities: []
      };

      await Promise.all(validLocationData.map(async data => {
        const { locationInfo, plotId, plotType, longitude, latitude } = data;
        const res = await getPlotInfos({ plotId, plotType });

        const levels = [
          { group: groupedEntities.cityEntities, key: 'city' },
          { group: groupedEntities.districtOrCountyEntities, key: 'county' },
          { group: groupedEntities.townshipEntities, key: 'town' },
          { group: groupedEntities.villageEntities, key: 'address' }
        ];

        levels.forEach(({ group, key }) => {
          let entityGroup = group.find(g => g[key] === locationInfo[key]);
          if (!entityGroup) {
            entityGroup = { [key]: locationInfo[key], data: [] };
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

      renderBillboards(groupedEntities.cityEntities, 'cityEntities');
      renderBillboards(groupedEntities.districtOrCountyEntities, 'districtOrCountyEntities');
      renderBillboards(groupedEntities.townshipEntities, 'townshipEntities');
      renderBillboards(groupedEntities.villageEntities, 'villageEntities');
      console.log("groupedEntities",groupedEntities)
      isDataReady.value = true;
    }
    function createCustomCanvas(textTitle, textContent, labelText, width = 400, height = 200) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // 绘制背景色和边框
      ctx.fillStyle = "rgba(56, 225, 255, 0.3)";
      ctx.strokeStyle = "#38e1ff";
      ctx.lineWidth = 2;
      ctx.fillRect(100, 0, width / 2, height * 0.85);
      ctx.strokeRect(100, 0, width / 2, height * 0.85);

      // 绘制标题区域背景
      ctx.fillStyle = "rgba(76, 222, 249, 0.4)";
      ctx.fillRect(100, 0, width / 2, 30);

      // 绘制标题
      ctx.font = "18px sans-serif"; // 增大标题字体
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("位置："+textContent, width / 2, 15);

      // 绘制地址文字
      ctx.font = "16px sans-serif"; // 增大内容字体
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(textTitle, 130, height * 0.21); // 调整位置

      // 绘制连接线
      ctx.beginPath();
      ctx.moveTo(100, height * 0.85);  // 从左下角开始
      ctx.lineTo(width * 0.1, height);  // 延伸到 canvas 下方的中心点
      ctx.strokeStyle = "#38e1ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 绘制伤亡人员统计
      const lines = labelText.split("\n");
      const lineHeight = 20; // 行高
      const backgroundPadding = 10; // 背景填充

      lines.forEach((line, index) => {
        const yPosition = height * 0.3 + (index * lineHeight); // Y 位置

        // 绘制背景矩形
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 背景颜色
        ctx.fillRect(120, yPosition - backgroundPadding , width / 2 - 30, lineHeight); // 绘制背景矩形

        // 绘制文字
        ctx.fillStyle = "#ffffff"; // 字体颜色
        ctx.fillText(line, 130, yPosition); // 绘制文字
      });

      return canvas;
    }


    function renderBillboards(entities, groupName) {
      entities.forEach(entity => {
        const position = Cesium.Cartesian3.fromDegrees(entity.data[0].longitude, entity.data[0].latitude);
        const casualtyStats = entity.casualtyStats;
        const address = entity.city || entity.county || entity.town || entity.address || "地址未知";
        let labelText = `最新情况:\n`;
        for (const [status, count] of Object.entries(casualtyStats)) {
          labelText += `${status}: ${count}`+`人\n`;
        }
// 创建 Canvas 并生成图像
        const canvas = createCustomCanvas("伤亡情况统计",address, labelText);
        const image = canvas.toDataURL("image/png");
        const cesiumEntity = window.viewer.entities.add({
          position,
          billboard: {
            image: image,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            width: canvas.width,
            height: canvas.height,
            pixelOffset: new Cesium.Cartesian2(160, -20)  // 向右和向上的偏移量
          },
          // label: {
          //   text: labelText,
          //   font: '14px sans-serif',
          //   fillColor: Cesium.Color.YELLOW,
          //   outlineColor: Cesium.Color.BLACK,
          //   outlineWidth: 2,
          //   showBackground: true,
          //   backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
          // },
          show: false
        });
        entityGroups.value[groupName].push(cesiumEntity);
      });
    }

    async function getReverseGeocode(lon, lat) {
      try {
        const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
          params: {
            postStr: JSON.stringify({ lon, lat, ver: 1 }),
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
      getRescueActionCasualtiesPlotAndInfo
    };
  }
};
</script>
