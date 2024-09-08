<template>
  <!-- 地图 -->
  <div ref="eMap" class="eMap"></div>
  <!-- 自制图例 -->
  <div class="legend">
    <div v-for="(group, groupIndex) in eqGroups" :key="'group-' + groupIndex">
      <div class="row">
        <div
            class="line"
            v-for="(item, itemIndex) in group.items"
            :key="group.type + '-' + itemIndex"
        >
          <span
              :class="[group.type, item.type, {'inactive': !seriesVisibility[group.type + '-' + item.type]}]"
              @click="toggleSeriesVisibility(group.type, item.type)"
          ></span>{{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import data from '@/assets/geoJson/data.json';
import {getKeyEq, getLatestEq} from "@/api/system/eqlist.js";

// 图例分类
const eqGroups = ref([
  {
    type: 'history',
    items: [
      {type: 'moderate', label: '历史4.5 - 6级地震'},
      {type: 'major', label: '历史6级以上地震'}
    ]
  },
  {
    type: 'latest',
    items: [
      {type: 'slight', label: '最新4.5级以下地震'},
      {type: 'moderate', label: '最新4.5 - 6级地震'},
      {type: 'major', label: '最新6级以上地震'}
    ]
  }
]);

// 用于存储系列的可见性状态
const seriesVisibility = ref({
  'history-moderate': true,
  'history-major': true,
  'latest-slight': true,
  'latest-moderate': true,
  'latest-major': true
});
// 用于存储原始数据
const originalSeriesData = ref({});


const eMap = ref(null);
const historyEqData = ref([]);
const latestEqData = ref([]);
const eMapInstance = ref(null);

onMounted(() => {
  initEmap();
  getMapEq();
});

watch([historyEqData, latestEqData], (newData) => {
  initEmap();
}, {deep: true});

echarts.registerMap('data', data);

const getMapEq = () => {
  getLatestEq().then(res => {
    latestEqData.value = res;
  })
  getKeyEq().then(res => {
    historyEqData.value = res;
  })
};

const initEmap = () => {
  const latestData = latestEqData.value.map(item => ({
    position: item.position,
    magnitude: parseFloat(item.magnitude),
    longitude: item.longitude,
    latitude: item.latitude,
    // 数据库表中time字段院数据为2015-01-03 08:16:20，
    // 但渲染在前端会出现个'T'，
    // 也就变成了2015-01-03T08:16:20，
    // 故以此将其删去
    time: item.time.replace("T", " "),
    depth: item.depth,
  }));

  const historyData = historyEqData.value.map(item => ({
    position: item.position,
    magnitude: parseFloat(item.magnitude),
    longitude: item.longitude,
    latitude: item.latitude,
    time: item.time.replace("T", " "),
    depth: item.depth,
  }));

  // 根据历史与最新、震级分类地震数据
  const latestSlight = latestData.filter(item => item.magnitude < 4.5);
  const latestModerate = latestData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
  const latestMajor = latestData.filter(item => item.magnitude >= 6);
  const historyModerate = historyData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
  const historyMajor = historyData.filter(item => item.magnitude >= 6);

  // ECharts中geo3D数据只有一个时，
  // 出现tooltip无法渲染的情况(Echarts的bug实锤)，
  // 所以添加一个点(包含位置数据)确保其渲染，
  // 还有别的办法吗？
  const defaultPoint = {
    magnitude: 0,
    longitude: 1,
    latitude: 1,
  };

  // 为分类后的数据加上这个点
  const dataGroups = [latestSlight, latestModerate, latestMajor, historyModerate, historyMajor];
  dataGroups.forEach(group => {
    group.push(defaultPoint);
  });

  const eMapElem = eMap.value;
  if (eMapElem) {
    eMapInstance.value = echarts.init(eMapElem);

    // geo3D与map3D是两张地图，
    // 是因为series中需同时渲染红色区域与散点，
    // 为了避免重叠，
    // 故设置其中一张地图show: false，
    // 鼠标中键拖动地图时会改变geo3D的center属性
    const option = {
      // 点的配置
      geo3D: {
        map: 'data',
        boxHeight: 20,
        show: false,
        viewControl: {
          projection: 'orthographic',
          orthographicSize: 95,
          alpha: 44,
          beta: 0,
          autoRotate: false, // Disable auto-rotation
          minAlpha: 44,  // Restrict vertical rotation
          maxAlpha: 44,
          minBeta: 0,    // Restrict horizontal rotation
          maxBeta: 0
        },
        itemStyle: {
          color: '#0c274b',
          borderColor: '#1cccff',
          borderWidth: 1.5,
          borderType: 'solid',
          label: {
            show: true,
            textStyle: {
              color: '#fff',
              fontSize: 14,
              fontWeight: 400,
            },
          },
        },
        emphasis: {
          itemStyle: {
            color: '#3099E2',
          },
          label: {
            show: true,
            textStyle: {
              color: '#fff',
              fontSize: 16,
              fontWeight: 400,
            },
          },
        },
      },
      series: [
        // 地图的配置
        {
          type: 'map3D',
          map: 'data',
          viewControl: {
            projection: 'orthographic',
            orthographicSize: 95,
            alpha: 44,
            beta: 0,
            autoRotate: false, // Disable auto-rotation
            minAlpha: 44,
            maxAlpha: 44,
            minBeta: 0,
            maxBeta: 0,
          },
          itemStyle: {
            color: '#0c274b',
            borderColor: '#1cccff',
            borderWidth: 1.5,
            borderType: 'solid',
            label: {
              show: true,
              textStyle: {
                color: '#fff',
                fontSize: 14,
                fontWeight: 400,
              },
            },
          },
          emphasis: {
            itemStyle: {
              color: '#3099E2',
            },
            label: {
              show: true,
              // 设置文字背景颜色为全透明，
              // 以免图例筛选数据时Echarts内置自动加上了背景颜色
              backgroundColor: 'transparent',
              textStyle: {
                color: '#fff',
                fontSize: 16,
                fontWeight: 400,
              },
            },
          },
          data: [
            {name: '雨城区', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '名山区', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '荥经县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '汉源县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '石棉县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '天全县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '芦山县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
            {name: '宝兴县', itemStyle: {color: '#ea5353'}, emphasis: {itemStyle: {color: '#ef0909'}}},
          ],
        },
        // 根据分类渲染散点
        {
          name: '最新4.5级以下地震',
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          show: true,
          symbol: 'circle',
          zlevel: 10,
          data: latestSlight.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#ed2a2a'},
            symbolSize: 20
          })),
          emphasis: {
            label: {
              show: false,
            },
          },
        },
        {
          name: '最新4.5 - 6级地震',
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          show: true,
          symbol: 'circle',
          zlevel: 1,
          data: latestModerate.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#ed2a2a'},
            symbolSize: 20
          })),
          emphasis: {
            label: {
              show: false,
            },
          },
        },
        {
          name: '最新6级以上地震',
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          show: true,
          symbol: 'circle',
          zlevel: 1,
          data: latestMajor.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#ed2a2a'},
            symbolSize: 20
          })),
          emphasis: {
            label: {
              show: false,
            },
          },
        },
        {
          name: '历史4.5 - 6级地震',
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          show: true,
          symbol: 'circle',
          zlevel: 1,
          data: historyModerate.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#f0a72e'},
            symbolSize: 15
          })),
          emphasis: {
            label: {
              show: false,
            },
          },
        },
        {
          name: '历史6级以上地震',
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          show: false,
          symbol: 'circle',
          zlevel: 1,
          data: historyMajor.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#f0a72e'},
            symbolSize: 20
          })),
          emphasis: {
            label: {
              show: false,
            },
          },
        },
      ],

      // 设置散点高亮时的提示框，
      // 用于展示该地震的 位置、发震时间、震级与震源深度
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const value = params.value;
          if (!value || value.length < 2) {
            return '';
          }
          let item = latestData.find(item =>
              item.longitude === value[0] && item.latitude === value[1]
          ) || historyData.find(item =>
              item.longitude === value[0] && item.latitude === value[1]
          );
          if (item) {
            const result = `
              位置: ${item.position}<br/>
              发震时间: ${item.time}<br/>
              震级: ${item.magnitude}<br/>
              震源深度: ${item.depth}
              `;
            return result;
          }
        },
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: '#fff',
        borderWidth: 1,
        padding: [5, 10],
        textStyle: {
          color: '#fff',
        },
      },
    };

    eMapInstance.value.setOption(option);
  }
};

// ECharts中图例(legend)不支持分别定义图形大小，
// 故通过该函数与自制的图例div配合实现legend自带的筛选效果
const toggleSeriesVisibility = (groupType, itemType) => {
  const seriesNames = {
    history: {
      moderate: '历史4.5 - 6级地震',
      major: '历史6级以上地震'
    },
    latest: {
      slight: '最新4.5级以下地震',
      moderate: '最新4.5 - 6级地震',
      major: '最新6级以上地震'
    }
  };

  const seriesName = seriesNames[groupType][itemType];
  const seriesKey = `${groupType}-${itemType}`;

  // 切换系列的可见性状态
  seriesVisibility.value[seriesKey] = !seriesVisibility.value[seriesKey];

  if (eMapInstance.value) {
    const currentOption = eMapInstance.value.getOption();

    // 初始化原始数据存储
    if (!originalSeriesData.value[seriesName]) {
      originalSeriesData.value[seriesName] = currentOption.series.find(series => series.name === seriesName)?.data || [];
    }

    // 获取当前的 geo3D 视角设置中的 center 属性
    const currentCenter = currentOption.geo3D[0].viewControl.center;

    // 更新系列数据
    const updatedSeries = currentOption.series.map(series => {
      if (series.name === seriesName) {
        series.data = seriesVisibility.value[seriesKey] ? originalSeriesData.value[seriesName] : [];
      }
      // 如果是 map3D 类型的系列，更新其 viewControl.center 属性
      if (series.type === 'map3D') {
        series.viewControl = {
          ...series.viewControl,
          center: currentCenter,
        };
      }
      return series;
    });

    // 更新配置选项
    eMapInstance.value.setOption({
      series: updatedSeries
    }, false, true); // 第三个参数为 true 表示合并更新
  }
};


</script>


<style scoped>
.eMap {
  width: 100%;
  height: 100%;
}

.legend {
  position: absolute;
  bottom: 0;
  right: 31%;
  z-index: 20;
  background-color: transparent;
  width: 510px;
  height: 70px;
}

.row {
  display: flex;
  float: right;
  margin-top: 5px;
}

.line {
  display: flex;
  align-items: center;
  width: 170px;
  color: white;
}

.history {
  display: inline-block;
  z-index: 20;
  border-radius: 50%;
  background-color: #f0a72e;
  margin-right: 10px;
}

.latest {
  display: inline-block;
  z-index: 20;
  border-radius: 50%;
  background-color: #ed2a2a;
  margin-right: 10px;
}

.slight {
  width: 10px;
  height: 10px;
}

.moderate {
  width: 15px;
  height: 15px;
}

.major {
  width: 20px;
  height: 20px;
}

/* 添加“inactive”类用于设置灰色 */
.inactive {
  background-color: #888; /* 灰色 */
}
</style>
