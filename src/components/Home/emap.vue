<template>
  <!-- 地图 -->
  <!--指南针-->
  <div class="compassContainer"></div>
  <!--四川地图-->
  <div ref="eMap" class="eMap"></div>

  <!-- 自制图例 -->
  <div class="legend">

    <div class="row">
      <!-- 左列（最新，红色）-->
      <div class="column">
        <div
            class="line latest"
            v-for="(item, itemIndex) in eqGroups[1].items"
            :key="'latest-' + itemIndex"
        >

          {{ item.label }}<span
              :class="[item.type, {'inactive': !seriesVisibility['latest-' + item.type]}]"
              @click="toggleSeriesVisibility('latest', item.type)"
          ></span>
        </div>
      </div>

      <!-- 右列（历史，黄色）-->
      <div class="column">
        <div
            class="line history"
            v-for="(item, itemIndex) in eqGroups[0].items"
            :key="'history-' + itemIndex"
        >
          {{ item.label }}<span
              :class="[item.type, {'inactive': !seriesVisibility['history-' + item.type]}]"
              @click="toggleSeriesVisibility('history', item.type)"
          ></span>
        </div>
      </div>
    </div>
<!--    &lt;!&ndash;    遍历分组&ndash;&gt;-->
<!--    <div v-for="(group, groupIndex) in eqGroups" :key="'group-' + groupIndex">-->
<!--      <div class="row">-->

<!--        <div-->
<!--            class="line"-->
<!--            v-for="(item, itemIndex) in group.items"-->
<!--            :key="group.type + '-' + itemIndex"-->
<!--        >-->
<!--          &lt;!&ndash;点&ndash;&gt;-->
<!--          <span-->
<!--              :class="[group.type, item.type, {'inactive': !seriesVisibility[group.type + '-' + item.type]}]"-->
<!--              @click="toggleSeriesVisibility(group.type, item.type)"-->
<!--          ></span>{{ item.label }}-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import data from '@/assets/geoJson/data.json';
import {getAllEq, getKeyEq, getLatestEq} from "@/api/system/eqlist.js";

const props = defineProps(['eqData']);

// 图例分类
const eqGroups = ref([
  {
    type: 'history',
    items: [
      {type: 'moderate', label: '历史4.5 - 6级'},
      {type: 'major', label: '历史6级以上'}
    ]
  },
  {
    type: 'latest',
    items: [
      {type: 'slight', label: '最新4.5级以下'},
      {type: 'moderate', label: '最新4.5 - 6级'},
      {type: 'major', label: '最新6级以上'}
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

// 引用，用于存储地图的 DOM 元素或实例
const eMap = ref(null);
// 引用，用于存储历史地震数据的数组
const historyEqData = ref([]);
// 引用，用于存储最新地震数据的数组
const latestEqData = ref([]);
// 引用，用于存储地图的实例对象
const eMapInstance = ref(null);
// 引用，用于设置地图上比例尺的初始长度（单位：像素）
const initialScaleLength = ref(50); // 假设初始长度为 50 像素
// 引用，用于设置地图上比例尺对应的实际距离（单位：公里）
const initialDistance = ref(100); // 对应 100 公里
onMounted(() => {
  initEmap();
});

watch([historyEqData, latestEqData], (newData) => {
  initEmap();
}, {deep: true});

watch(() => props.eqData, () => {
  latestEqData.value = [props.eqData[0]];
  historyEqData.value = props.eqData;
});

echarts.registerMap('data', data);

// const getMapEq = () => {
//   getLatestEq().then(res => {
//     latestEqData.value = res;
//   })
//   getAllEq().then(res => {
//     historyEqData.value = res;
//   })
// };

const initEmap = () => {
  //处理最新地震数据，映射成适合 ECharts 使用的格式
  const latestData = latestEqData.value.map(item => ({
    position: item.earthquakeName,
    magnitude: parseFloat(item.magnitude),
    longitude: item.longitude,
    latitude: item.latitude,
    // 数据库表中time字段院数据为2015-01-03 08:16:20，
    // 但渲染在前端会出现个'T'，
    // 也就变成了2015-01-03T08:16:20，
    // 故以此将其删去
    time: item.occurrenceTime.replace("T", " "),
    depth: item.depth,
  }));

  //将历史地震数据 historyEqData 转换为合适的格式。
  const historyData = historyEqData.value.map(item => ({
    position: item.earthquakeName,
    magnitude: parseFloat(item.magnitude),
    longitude: item.longitude,
    latitude: item.latitude,
    time: item.occurrenceTime.replace("T", " "),
    depth: item.depth,
  }));

  // 根据历史与最新、震级分类地震数据
  const latestSlight = latestData.filter(item => item.magnitude < 4.5);
  const latestModerate = latestData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
  const latestMajor = latestData.filter(item => item.magnitude >= 6);
  const historyModerate = historyData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
  const historyMajor = historyData.filter(item => item.magnitude >= 6);


  // 一个默认点
  // ECharts中geo3D数据只有一个时，
  // 出现tooltip无法渲染的情况(Echarts的bug实锤)，
  // 所以添加一个点(包含位置数据)确保其渲染，
  // 还有别的办法吗？
  const defaultPoint = {
    magnitude: 0,  //震级，默认值设置为 0。
    longitude: 1,  //经度，默认值设置为 1。
    latitude: 1,  //纬度，默认值设置为 1。
  };

  // 为分类后的数据添加默认点
  const dataGroups = [latestSlight, latestModerate, latestMajor, historyModerate, historyMajor];
  dataGroups.forEach(group => {
    group.push(defaultPoint);
  });


  // ECharts 实例初始化
  const eMapElem = eMap.value;
  if (eMapElem) {
    eMapInstance.value = echarts.init(eMapElem);

    // geo3D与map3D是两张地图，
    // 是因为series中需同时渲染红色区域与散点，
    // 为了避免重叠，
    // 故设置其中一张地图show: false，
    // 鼠标中键拖动地图时会改变geo3D的center属性

    // 初始比例尺长度（像素）和实际距离（公里）

    const option = {

      // 点的配置
      geo3D: { // 3D 地理坐标系统配置
        map: 'data', // 使用的数据地图（地图名），你需要确保这个名称对应一个有效的地图配置
        boxHeight: 20, // 设置地图高度（视觉上地图的厚度），单位为像素
        show: false, // 不显示地图背景，设置为 false 隐藏地图底图（只显示散点或其他内容）

        viewControl: { // 控制视角的参数配置
          projection: 'orthographic', // 使用正交投影方式，保证地图不会有透视变形效果
          orthographicSize: 105, // 设置正交投影的大小，值越大地图看起来越小
          alpha: 44, // 设置视角的俯仰角（上下视角角度），范围为 0 - 90 度
          beta: 0, // 设置视角的旋转角度（左右视角角度），正值向右，负值向左
          autoRotate: false, // 禁用自动旋转功能，地图不会自动旋转
          minAlpha: 44, // 最小的俯仰角，锁定为 44 度
          maxAlpha: 44, // 最大的俯仰角，锁定为 44 度（alpha 角度固定）
          minBeta: 0, // 最小的旋转角度，锁定为 0 度
          maxBeta: 0, // 最大的旋转角度，锁定为 0 度（beta 角度固定）
          distance: 100 // 设置视角距离（相机距离地图的距离），值越大，地图看起来越远
        },

        itemStyle: { // 设置地图区域的样式
          color: '#0c274b', // 设置地图区域的颜色（深蓝色）
          borderColor: '#1cccff', // 设置地图边界的颜色（亮蓝色）
          borderWidth: 1.5, // 设置边界线宽度
          borderType: 'solid', // 边界线样式，设置为实线

          label: { // 设置标签样式（地图区域名称）
            show: true, // 显示标签
            textStyle: {
              color: '#fff', // 标签文本颜色设置为白色
              fontSize: 14, // 标签文本的字号
              fontWeight: 400, // 标签字体的粗细，400 为正常粗细
            },
          },
        },

        emphasis: { // 鼠标悬停或高亮时的样式
          itemStyle: {
            color: '#3099E2', // 悬停时地图区域颜色变为亮蓝色
          },
          label: {
            show: true, // 悬停时显示标签
            textStyle: {
              color: '#fff', // 标签文本颜色为白色
              fontSize: 16, // 悬停时标签文本的字号变为 16
              fontWeight: 400, // 标签字体的粗细为正常
            },
          },
        },

      },

      series: [
        // 地图的配置
        {
          type: 'map3D', // 指定类型为 3D 地图
          map: 'data', // 使用的数据地图（地图名），与 geo3D 的 map 名称一致

          viewControl: { // 控制 3D 地图视角的参数配置
            projection: 'orthographic', // 使用正交投影方式，确保地图不会有透视效果
            orthographicSize: 105, // 设置正交投影的大小，值越大地图看起来越小
            alpha: 44, // 设置视角的俯仰角，锁定为 44 度
            beta: 0, // 设置视角的旋转角度，锁定为 0 度（没有左右旋转）
            autoRotate: false, // 禁用自动旋转，地图不会自动旋转
            minAlpha: 44, // 设置俯仰角的最小值，固定为 44 度
            maxAlpha: 44, // 设置俯仰角的最大值，固定为 44 度
            minBeta: 0, // 设置视角左右旋转角度的最小值，锁定为 0 度
            maxBeta: 0, // 设置视角左右旋转角度的最大值，锁定为 0 度
          },

          itemStyle: { // 地图区域的样式
            color: '#0c274b', // 地图区域颜色设置为深蓝色
            borderColor: '#1cccff', // 地图边界颜色为亮蓝色
            borderWidth: 1.5, // 设置边界线宽度为 1.5 像素
            borderType: 'solid', // 边界线样式为实线

            label: { // 地图区域标签的样式
              show: true, // 显示区域标签
              textStyle: {
                color: '#fff', // 标签文本颜色设置为白色
                fontSize: 14, // 标签文本的字体大小为 14
                fontWeight: 400, // 标签字体的粗细为正常（400）
              },
            },
          },


          emphasis: { // 鼠标悬停时的高亮样式
            itemStyle: {
              color: '#3099E2', // 高亮时区域的颜色变为亮蓝色
            },
            label: {
              show: true, // 显示高亮状态下的区域标签
              // 设置文字背景颜色为全透明，
              // 以免图例筛选数据时Echarts内置自动加上了背景颜色
              backgroundColor: 'transparent',
              textStyle: {
                color: '#fff', // 标签文本颜色为白色
                fontSize: 16, // 高亮状态下的标签文本字体大小变为 16
                fontWeight: 400, // 标签字体的粗细保持为正常
              },
            },
          },
          data: [
            {name: '雨城区', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '名山区', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '荥经县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '汉源县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '石棉县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '天全县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '芦山县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
            {name: '宝兴县', itemStyle: {color: '#2f88f9'}, emphasis: {itemStyle: {color: '#006cff'}}},
          ],
        },


        // 根据分类渲染散点的数据配置
        {
          name: '历史4.5 - 6级地震',
          type: 'scatter3D',  // 指定类型为 3D 散点图，用于显示地震点
          coordinateSystem: 'geo3D',  // 使用的坐标系为 3D 地理坐标系
          show: true, // 设置系列是否显示，值为 true 表示显示
          symbol: 'circle',  // 数据点的符号形状，这里设置为圆形
          zlevel: 1,  // 设置该系列图层的层次等级，数值越大，图层越高
          data: historyModerate.map(item => ({
            name: `Magnitude: ${item.magnitude}`,  //为每个地震事件生成一个名称字符串，格式为 Magnitude: X。X 是该事件的震级（item.magnitude）。
            value: [item.longitude, item.latitude],  //[经度, 纬度]定位散点的位置
            itemStyle: {color: '#f0a72e'},  //点颜色
            symbolSize: 15
          })),
          emphasis: {  //悬浮时显示标签
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
          zlevel: 5,
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


        {
          name: '最新4.5级以下地震',
          type: 'scatter3D',   // 指定类型为 3D 散点图，用于显示地震点
          coordinateSystem: 'geo3D',  // 使用的坐标系为 3D 地理坐标系
          show: false,  // 设置系列是否显示，值为 true 表示显示
          symbol: 'circle',  // 数据点的符号形状，这里设置为圆形
          zlevel:10,  // 设置该系列图层的层次等级，数值越大，图层越高
          data: latestSlight.map(item => ({
            name: `Magnitude: ${item.magnitude}`,  //为每个地震事件生成一个名称字符串，格式为 Magnitude: X。X 是该事件的震级（item.magnitude）。
            value: [item.longitude, item.latitude],  //[经度, 纬度]定位散点的位置
            itemStyle: {color: '#ed2a2a'},  //点颜色
            symbolSize: 10, //点大小

          })),
          emphasis: {  //悬浮时显示标签
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
          zlevel: 15,
          data: latestModerate.map(item => ({
            name: `Magnitude: ${item.magnitude}`,
            value: [item.longitude, item.latitude],
            itemStyle: {color: '#ed2a2a'},
            symbolSize: 15
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
          zlevel: 20,
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


      ],


      // 设置散点高亮时的提示框，
      // 用于展示该地震的 位置、发震时间、震级与震源深度
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const value = params.value;   // 获取当前鼠标悬停的项的值（通常是经纬度）
          if (!value || value.length < 2) {
            return '';
          }

          // 查找最新数据或历史数据中与当前经纬度匹配的地震数据项
          let item = latestData.find(item =>
              item.longitude === value[0] && item.latitude === value[1]
          ) || historyData.find(item =>
              item.longitude === value[0] && item.latitude === value[1]
          );
          if (item) {  // 使用模板字符串生成 tooltip 的内容
            const result = `
              位置: ${item.position}<br/>
              发震时间: ${item.time}<br/>
              震级: ${item.magnitude}<br/>
              震源深度: ${item.depth}
              `;
            return result;
          }
        },
        backgroundColor: 'rgba(0,0,0,0.7)',  // 设置 tooltip 的背景色为半透明黑色
        borderColor: '#fff',  // 设置边框颜色为白色
        borderWidth: 1,  // 设置边框宽度为 1
        padding: [5, 10],  // 设置 tooltip 的内边距，上下为 5 像素，左右为 10 像素
        textStyle: {
          color: '#fff',  // 设置文本颜色为白色
        },
      },

    };


    // 加载数据后，让最新的红点持续闪烁
    blinkPoints('最新4.5级以下地震'); // 用你的数据对应的系列名称替换


    //将配置好的选项传递给 ECharts 实例以进行渲染。
    eMapInstance.value.setOption(option);
  }
};

// 点击图例中的点 在地图上点的展示消失效果
// ECharts中图例(legend)不支持分别定义图形大小，
// 故通过该函数与自制的图例div配合实现legend自带的筛选效果
const toggleSeriesVisibility = (groupType, itemType) => {

  // groupType: 一个字符串，表示数据的组类型，可以是 'history'（历史地震数据）或 'latest'（最新地震数据）。
  // itemType: 一个字符串，表示数据的具体类型，例如 'slight'（最新4.5级以下地震）、'moderate'（历史或最新4.5 - 6级地震）和 'major'（历史或最新6级以上地震）。
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

  // 获取系列名称:
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

    // 获取当前的 geo3D 视角设置中的 center 属性，以便在更新时保持视角不变。
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

  // 如果点是可见的，开始闪烁效果
  // if (seriesVisibility.value[seriesKey]) {
  //   blinkPoints(seriesName);
  // }
};

// 实现闪烁效果的函数
const blinkPoints = (seriesName) => {
  let blinkCount = 0; // 计数闪烁次数
  const maxBlinkCount = seriesName === '最新4.5级以下地震' ? Infinity : 4; // 设置闪烁次数
  const blinkInterval = setInterval(() => {
    const currentOption = eMapInstance.value.getOption();
    const seriesData = currentOption.series.find(series => series.name === seriesName);

    if (seriesData && seriesData.data) {
      // 切换点的透明度
      const isVisible = seriesData.data[0]?.itemStyle?.opacity !== 0; // 检查当前点是否可见
      const newOpacity = isVisible ? 0 : 1;

      // 更新点的透明度
      seriesData.data.forEach(point => {
        point.itemStyle = {
          ...point.itemStyle,
          opacity: newOpacity // 切换透明度
        };
      });

      // 更新选项
      eMapInstance.value.setOption({
        series: currentOption.series
      }, false, true); // 合并更新
    }

    // 继续闪烁
    // 如果需要设置闪烁的最大次数，可以取消注释以下代码
    // blinkCount++;
    // if (blinkCount === 4) { // 每次闪烁时切换两次，总共闪烁三次
    //   clearInterval(blinkInterval); // 结束闪烁
    // }
    // 更新闪烁计数
    blinkCount++;
    if (blinkCount === maxBlinkCount) { // 根据条件控制闪烁次数
      clearInterval(blinkInterval); // 结束闪烁
    }
  }, 800); // 每300ms闪烁一次

  // 你可以选择在某个条件下结束闪烁，例如当图例被点击时
  // clearInterval(blinkInterval) //也可以在 toggleSeriesVisibility 中添加
};



// 根据地图当前的视图比例动态调整比例尺长度
const updateScaleBar = () => {
  console.log(eMapInstance.value)
  const viewRect = eMapInstance.value.getModel().getComponent('geo3D').coordinateSystem.getViewRect();
  const scale = viewRect.width / viewRect.height;

  const newDistance = initialDistance.value / scale;
  console.log(newDistance)

}

</script>


<style scoped>
.eMap {
  width: 100%;
  height: 100%;
}

.legend {
  position: absolute;
  bottom: 0;
  left: 20px;
  /*right: 31%;*/
  z-index: 20;
  background-color: transparent;
  width: 510px;
  height: 70px;
}

/*原来*/
/*.row {*/
/*  display: flex;*/
/*  float: right;*/
/*  margin-top: 5px;*/
/*}*/


/*.line {*/
/*  display: flex;*/
/*  align-items: center;*/
/*  width: 141px;*/
/*  color: white;*/
/*}*/


/*两列，没管位置*/
/*.row {*/
/*  display: flex;*/
/*  flex-wrap: wrap; !* 允许换行 *!*/
/*  margin-top: 5px;*/
/*  width: 100%; !* 确保每行占满宽度 *!*/
/*}*/



/*.line {*/
/*  display: flex;*/
/*  align-items: center;*/
/*  width: 50%; !* 每个项目占据父容器的50%，即两列 *!*/
/*  color: white;*/
/*  margin-bottom: 5px; !* 给每行下方添加一些间距 *!*/
/*}*/



/*.history {*/
/*  display: inline-block;*/
/*  z-index: 20;*/
/*  border-radius: 50%;*/
/*  background-color: #f0a72e;*/
/*  margin-right: 10px;*/
/*}*/

/*.latest {*/
/*  display: inline-block;*/
/*  z-index: 20;*/
/*  border-radius: 50%;*/
/*  background-color: #ed2a2a;*/
/*  margin-right: 10px;*/
/*}*/

/*.slight {*/
/*  width: 10px;*/
/*  height: 10px;*/
/*}*/

/*.moderate {*/
/*  width: 15px;*/
/*  height: 15px;*/
/*}*/

/*.major {*/
/*  width: 20px;*/
/*  height: 20px;*/
/*}*/

/* 添加“inactive”类用于设置灰色 */
.inactive {
  background-color: #888; /* 灰色 */
}

.compassContainer {
  position: absolute;
  top: 4vh;
  right: 28vw;
  height: 120px;
  width: 160px;
  background: url(../../assets/compass.png) no-repeat 0 0 / cover;
  z-index: 20;
}


/*!*改为左边红右边黄*!*/
.row {
  display: flex;
  justify-content: space-between; /* 左右分列 */
  width: 64%;
}

.column {
  display: flex;
  flex-direction: column;
}

.line {
  display: flex;
  align-items: center; /* 垂直居中 */
  width: 141px;
  /*justify-content: center; !* 水平居中 *!*/
  color: white;
    /*margin-bottom: 5px; !* 给每行下方添加一些间距 *!*/
  margin-bottom: 5px;
}


.line span {
  display: flex;
  align-items: center; /* 圆点在其父容器中垂直居中 */
  /*display: inline-block; !* 确保点是块级元素 *!*/
  border-radius: 50%; /* 确保点是圆形 */
  margin-right: 10px;
}

.latest span {
  background-color: #ed2a2a; /* 红色 */
}

.history span {
  background-color: #f0a72e; /* 黄色 */
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

.inactive {
  background-color: #888 !important; /* 灰色 */
}


.line {
  display: flex;
  align-items: center; /* 圆点与文本垂直居中对齐 */
  width: 141px;
  color: white;
  margin-top: 5px; /* 添加间距 */
}

.line span {
  display: inline-flex; /* 使用 inline-flex 使得文本与圆点在一行 */
  align-items: center; /* 垂直居中 */
}

.line .slight, .line .moderate, .line .major {
  line-height: 1; /* 调整行高，使文本和圆点对齐 */
}

.line .slight {
  width: 10px; /* 小点的宽度 */
  height: 10px; /* 小点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 7px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.line .moderate {
  width: 15px; /* 中等点的宽度 */
  height: 15px; /* 中等点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 13px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.line .major {
  width: 20px; /* 大点的宽度 */
  height: 20px; /* 大点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 15px;
  margin-right: 13px; /* 圆点和文本之间的间距 */
}


</style>
