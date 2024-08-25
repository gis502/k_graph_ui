<template>
  <div ref="eMap" class="eMap"></div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import data from '@/assets/geoJson/data.json';

onMounted(() => {
  initEmap();
});

echarts.registerMap('data', data);

const eMap = ref(null);

const initEmap = () => {
  const eMapElem = eMap.value;
  const eMapInstance = echarts.init(eMapElem);
  const option = {
    geo3D: {
      map: 'data',
      show: false,
      viewControl: {
        projection: 'orthographic',
        orthographicSize: 105,
        alpha: 45,
        beta: 15,
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
    ],
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
