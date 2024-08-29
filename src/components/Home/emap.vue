<template>
  <div ref="eMap" class="eMap"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import data from '@/assets/geoJson/data.json';
import {getAllEq} from "@/api/system/eqlist.js";

const eMap = ref(null);
const eqdata = ref([]);

onMounted(() => {
  initEmap();
  getEq();
});

watch(eqdata, (newData) => {
  initEmap();
}, { deep: true });

echarts.registerMap('data', data);

const getEq = () => {
  getAllEq().then(res => {
    eqdata.value = res;
  });
};

const initEmap = () => {
  const extractedData = eqdata.value.map(item => ({
    position: item.position,
    magnitude: parseFloat(item.magnitude),
    longitude: item.longitude,
    latitude: item.latitude
  }));

  const blue = extractedData.filter(item => item.magnitude < 3);
  const yellow = extractedData.filter(item => item.magnitude >= 3 && item.magnitude <= 4.5);
  const orange = extractedData.filter(item => item.magnitude > 4.5 && item.magnitude < 6);
  const red = extractedData.filter(item => item.magnitude >= 6);

  const eMapElem = eMap.value;
  const eMapInstance = echarts.init(eMapElem);
  const option = {
    geo3D: {
      map: 'data',
      boxHeight: 4,
      show: false,
      viewControl: {
        projection: 'orthographic',
        orthographicSize: 105,
        alpha: 44,
        beta: 0,
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
      {
        type: 'map3D',
        map: 'data',
        viewControl: {
          projection: 'orthographic',
          orthographicSize: 105,
          alpha: 44,
          beta: 0,
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
      {
        name: '3级以下',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        symbol: 'circle',
        zlevel: 1,
        data: blue.map(item => ({
          name: `Magnitude: ${item.magnitude}`,
          value: [item.longitude, item.latitude, item.magnitude],
          itemStyle: {color: '#2889ff'},
          symbolSize: item.magnitude * 4
        })),
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },

        },
      },
      {
        name: '3 - 4.5级',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        symbol: 'circle',
        zlevel: 1,
        data: yellow.map(item => ({
          name: `Magnitude: ${item.magnitude}`,
          value: [item.longitude, item.latitude, item.magnitude],
          itemStyle: {color: '#ffeb2f'},
          symbolSize: item.magnitude * 4
        })),
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
        },
      },
      {
        name: '4.5 - 6级',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        symbol: 'circle',
        zlevel: 1,
        data: orange.map(item => ({
          name: `Magnitude: ${item.magnitude}`,
          value: [item.longitude, item.latitude, item.magnitude],
          itemStyle: {color: '#ffa500'},
          symbolSize: item.magnitude * 4
        })),
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
        },
      },
      {
        name: '6级以上',
        type: 'scatter3D',
        coordinateSystem: 'geo3D',
        symbol: 'circle',
        zlevel: 1,
        data: red.map(item => ({
          name: `Magnitude: ${item.magnitude}`,
          value: [item.longitude, item.latitude, item.magnitude],
          itemStyle: {color: '#f81919'},
          symbolSize: item.magnitude * 4
        })),
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
        },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const { value } = params;
        const item = extractedData.find(item => item.longitude === value[0] && item.latitude === value[1]);
        return `地点: ${item.position}<br/>震级: ${item.magnitude}`;
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#fff',
      borderWidth: 1,
      padding: [5, 10],
      textStyle: {
        color: '#fff',
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'bottom',
      data: [
        { name: '3级以下', icon: 'circle', itemStyle: { color: '#2889ff' } },
        { name: '3 - 4.5级', icon: 'circle', itemStyle: { color: '#ffeb2f' } },
        { name: '4.5 - 6级', icon: 'circle', itemStyle: { color: '#ffa500' } },
        { name: '6级以上', icon: 'circle', itemStyle: { color: '#f81919' } }
      ],
      textStyle: {
        color: '#fff',
      },
      itemWidth: 20,
      itemHeight: 14,
    },
  };
  eMapInstance.setOption(option);
};

</script>

<style scoped>
.eMap {
  width: 100%;
  height: 100%;
}
</style>
