<template>
  <div>

    <div id="exportContainer">
      <!-- Cesium 地图容器 -->
      <div id="cesiumContainer" class="situation_cesiumContainer"></div>
      <!--  指南针  -->
      <div class="compassContainer" ref="compassContainer"></div>
      <!-- 自定义缩放控件容器 -->
      <div class="zoomContainer" ref="zoomContainer">
        <!-- 放大按钮 -->
        <div class="zoomIn" @click="zoomIn">
          <i class="el-icon-zoom-in">+</i>
        </div>
        <!-- 缩小按钮 -->
        <div class="zoomOut" @click="zoomOut">
          <i class="el-icon-zoom-out">-</i>
        </div>
      </div>
      <!-- 图例 -->
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'EarthquakeCasualties'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <p style="color: white; text-align: left; margin: 5px 0; font-size: 15px;">余震次数累计：</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;font-size: 15px">累积受伤人数：</p>
        <div class="legend_item" v-for="(item, index) in getColorsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <p style="color: white; text-align: left; margin: 5px 0; padding: 0;">转移安置人数：</p>
        <div class="legend_item" v-for="(item, index) in earthquakeCasualtiesLegendData" :key="index">
          <img :src="item.img" class="block-img" alt="icon" style="height: 20px;margin-right: 7px;margin-left: 5px"/>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'TransportationElectricity'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.transportationElectricityLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'BuildingDamageInformation'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.buildingDamageInformationLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'SecondaryDisaster'">



        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>


        <div class="legend_container" style="display: flex; flex-direction: column; gap: 0px;">
          <div class="legend_group" v-for="(legend, legendIndex) in this.secondaryDisasterLegendData"
               :key="legendIndex">

            <p style="color: white; font-weight: bold; margin: 5px 0 ">{{ legend.name }}</p>

            <div class="legend_item1" v-for="(item, itemIndex) in legend.data" :key="itemIndex"
                 style="display: flex; align-items: center; ">
              <span class="block"
                    :style="{
                      backgroundImage: 'url(' + item.img + ')',
                      backgroundSize: 'cover',
                      height: item.height + 'px',
                      width: item.width + 'px',
                      marginRight: '10px',
                      marginLeft:item.marginLeft + 'px',
                      marginBottom: '2px',
                    }">
              </span>
              <span style="color: white;" :style="{marginLeft:item.marginLeft + 'px',}">{{ item.name }}</span>
            </div>
          </div>
        </div>


      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'ResourceStrength'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.resourceStrengthLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'MaterialDonation'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.materialDonationLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <el-form class="noteContainer" v-if="this.selectedComponentKey === 'PublicSentiment'">
        <p style="color: white; text-align: center; margin: 5px 0; font-size: 18px;">图例</p>
        <div class="legend_item" v-for="(item, index) in getEchartsLegendData()" :key="index">
          <span class="block" :style="{ backgroundColor: item.color }"
                style="height:15px;width: 45px;margin-left: 5px"></span>{{ item.name }}
        </div>
        <div class="legend_item" v-for="(item, index) in this.publicSentimentLegendData" :key="index">
  <span class="block"
        :style="{
          backgroundImage: 'url(' + item.img + ')',
          backgroundSize: 'cover',
          height: '30px',
          width: '30px',
          marginLeft: '5px',
        }">
  </span>
          {{ item.name }}
        </div>
      </el-form>
      <!-- ECharts 图表容器 -->
      <div v-for="(location, index) in locations" :key="index" class="echarts-container" ref="echartsContainer"
           :id="'echartsContainer' + index"></div>
    </div>
    <!-- 添加一个按钮用于导出 -->
    <button @click="exportCesiumScene" class="export-button">导出地形专题图</button>
    <button  class="superMap" @click="activeComponent = true">展示灾情专题图</button>
    <!-- 默认隐藏，点击按钮后展示 -->
    <div v-if="activeComponent" class="dialog-overlay">
      <div class="dialog-content">
        <!-- 固定头部 -->
        <div class="dialog-header">
          <span class="dialog-title">图件产出</span>
          <span class="dialog-close" @click="activeComponent = false">×</span>
        </div>

        <!-- 滚动区域（按钮 + 内容） -->
        <div class="dialog-scroll-body">
          <div class="toggle-buttons">
            <!-- 按钮区域 -->
          </div>


          <div v-if="activeTab === 'thematicMap'" class="section">
            <div class="grid-container">
              <div
                  v-for="(item, index) in thematicMapitems"
                  :key="index"
                  class="grid-item"
                  @click="showThematicMapDialog(item)"
              >
                <el-card shadow="hover" class="grid-small">
                  <img :src="item.imgUrl" :alt="item.theme" class="preview-img" />
                  <div class="item-info">
                    <p class="item-title">{{ item.theme }}</p>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


          <!-- 加载中的提示 -->
    <div v-if="loading" class="loading-container">
      <p>正在导出，请稍候...</p>
    </div>
    <!--    两个列表   -->
    <el-row :gutter="10" class="listContainer">
      <el-col :span="1.5">
        <el-select
            v-model="eqlistName"
            placeholder="请选择地震信息"
            size="large"
            style="width: 370px"
            filterable
            @change="handleEqListChange"
        >
          <el-option
              v-for="item in this.tableNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-select
            v-model="selectedComponentKey"
            placeholder="请选择模块"
            size="large"
            @change="handleComponentChange"
            style="width: 220px"
        >
          <el-option
              v-for="option in this.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-col>
      <!-- 动态组件显示 -->
    </el-row>
    <!-- 预览图片的 div -->
    <div v-if="previewImage" class="preview-container">
      <div class="export-image">
        <div class="export-info">
          <p>{{ exportTitle }}</p>
        </div>
        <div class="main_coantainer">
          <div class="top_container">
            <div class="box"></div>
            <div class="top"></div>
            <div class="box"></div>
          </div>
          <div class="middow">
            <div class="left"></div>
            <div class="main">
              <img :src="previewImage" alt="导出图片">
            </div>
            <div class="right"></div>
          </div>
          <div class="bottom_container">
            <div class="box"></div>
            <div class="bottom"></div>
            <div class="box"></div>
          </div>
        </div>
        <div
            style="font-size:14px ;padding: 0; width: 100%; margin-top: 0; background-color: white; display: flex; justify-content: space-between; align-items: center; text-align: center;">
          <p style="flex: 1; text-align: left; margin-left: 10px;"></p>
          <p style="flex: 1; text-align: center;">制作时间：{{ pictureCreateTime }}</p>
          <p style="flex: 1; text-align: right; margin-right: 10px;">版本：专业版</p>
        </div>

      </div>
      <div class="preview-buttons">
        <button @click="downloadImage" class="download-button">下载</button>
        <button @click="closePreview" class="cancel-button">取消</button>
      </div>
    </div>

    <!--灾情专题图展示容器-->

    <!--    <div class="grid-container">-->
    <!--      -->
    <!--    </div>-->

    <!--    <div class="grid-containe">-->
    <!--      <div-->
    <!--          v-for="(item, index) in thematicMapitems"-->
    <!--          :key="index"-->
    <!--          class="grid-item"-->
    <!--          @click="showThematicMapDialog(item)"-->
    <!--      >-->
    <!--        <el-card shadow="hover">-->
    <!--          <img :src="item.imgUrl" :alt="item.theme" class="preview-img"/>-->
    <!--          <div class="item-info">-->
    <!--            <p class="item-title">{{ item.theme }}</p>-->
    <!--          </div>-->
    <!--        </el-card>-->
    <!--      </div>-->
    <!--    </div>-->

    <!--    <thematicMapPreview-->
    <!--        @ifShowThematicMapDialog="ifShowThematicMapDialog"-->
    <!--        :imgshowURL="imgshowURL"-->
    <!--        :imgurlFromDate="imgurlFromDate"-->
    <!--        :imgName="imgName"-->
    <!--        :ifShowMapPreview="ifShowMapPreview"-->
    <!--        :showTypes="showTypes"-->
    <!--        style="width: 40%"-->
    <!--    ></thematicMapPreview>-->

  </div>
</template>

<script>
import * as Cesium from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';
import * as echarts from 'echarts';
import {initCesium} from '@/cesium/tool/initCesium.js';
import {getExcelUploadEarthquake, getExcelUploadEqList, getGeomByEqListId, getGeomById} from "@/api/system/eqlist.js";
import html2canvas from "html2canvas";
import yaan from '@/assets/geoJson/yaan1.json'
import cumulativeTransferredImg from '@/assets/images/cumulativeTransferred.png'
// import cumulativeTransferredImg from '@/assets/images/emergencySheltersLogo.png'
import damagedWaterSupply from '@/assets/images/damagedWaterSupply.png'
import guaranteeWaterSupply from '@/assets/images/guaranteeWaterSupply.png'
import earthQuakeCenterImg from '@/assets/icons/TimeLine/震中.png'
import fimg from '@/assets/icons/TimeLine/前进箭头.png'
import gimg from '@/assets/icons/TimeLine/后退箭头.png'
import himg from '@/assets/icons/TimeLine/暂停.png'
import {getTotal as getAftershock} from "@/api/system/statistics";
import {getCasualty} from "@/api/system/casualtystats" ;
import {getTransferInfo} from "@/api/system/relocation";
import {getPowerSupply} from "@/api/system/powerSupply.js";
import {TianDiTuToken} from "@/cesium/tool/config.js";
import dataSourcePanel from "@/components/Panel/dataSourcePanel.vue";
import {getVillagesName} from "@/api/system/ZhongDuanVillage.js";
import {getHousingSituationList} from "@/api/system/housingSituation.js";
import {getSupplySituationList} from "@/api/system/supplySituation.js";
import {getEnsureWaterSupply} from "@/api/system/supplyWater.js";
import {getSecondaryDisaster} from "@/api/system/mountainFlood.js";
import {getRiskConstructionGeohazards} from "@/api/system/geologicalDisaster.js";
import {getBarrierlakeSituation} from "@/api/system/barrierlakeSituation.js";
import {getRescueForces} from "@/api/system/rescueTeams.js";
import {getDisasterreLiefMaterials} from "@/api/system/reliefSupplies.js";
import {getEquipment} from "@/api/system/rescueEquipment.js";
import {getCharity} from "@/api/system/charitableOrganization.js";
import {getGovernment} from "@/api/system/governmentDepartmentDonations.JS";
import {getRedCrossDonations} from "@/api/system/redCrossDonation.js";
import {getMaterialDonation} from "@/api/system/materialDonation.js";
import {getPublicOpinion} from "@/api/system/publicOpinion.js";
import {getSocialOrder} from "@/api/system/socialOrder.js";
import {getFacility} from "@/api/system/CommunicationFacilityDamageRepairStatus.js";
import {AmapApiLocal, tianditu} from "@/utils/server.js";
import thematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
import {handleOutputData} from "@/cesium/plot/eqThemes.js";

export default {

  components: {
    dataSourcePanel,
    thematicMapPreview
  },
  data() {
    return {
      eqIdValue:'',
      activeComponent:false, // 控制显示隐藏
      activeTab: 'thematicMap', // 当前选中的 tab
      // 灾情专题图存放信息
      thematicMapitems: [
        // {
        //   theme: "震后道路损毁情况",
        //   imgUrl: "http://sv25gsrnh.hb-bkt.clouddn.com/T2025042615594251180001_%E9%9C%87%E5%8C%BA%E4%BA%A4%E9%80%9A%E5%9B%BE?e=1745657988&token=mheaTe3xRCkChSjwfueGYzB32yi7yk2sj8pemjvF:QTkDE_QvYlYnQu5pWueGDCLWHN8="
        // },
        // {
        //   theme: "震后建筑物倒塌分析",
        //   imgUrl: ""
        // },
        // {
        //   theme: "震后水灾影响图",
        //   imgUrl: "C:/Users/Smile/Desktop/profile/震区地震动峰值加速度区划图.jpg"
        // },
        // {
        //   theme: "震后疏散路线图",
        //   imgUrl: "https://via.placeholder.com/300x200.png?text=Evacuation+Routes"
        // },
        // {
        //   theme: "震后医疗资源分布",
        //   imgUrl: "https://via.placeholder.com/300x200.png?text=Medical+Resources+Map"
        // }
      ],
      imgshowURL: '',
      imgurlFromDate: '',
      imgName: '',
      ifShowMapPreview: false, // 是否预览专题图
      showTypes: 1,

      viewer: null, // 保存 Cesium Viewer
      pollingInterval: null, // 保存轮询定时器的引用

      //-------echarts所用到的-----------
      echartsInstances: [],
      locations: [
        {name: '雨城区', longitude: 103.0, latitude: 29.87},
        {name: '名山区', longitude: 103.20, latitude: 30.15},
        {name: '荥经县', longitude: 102.77, latitude: 29.71},
        {name: '汉源县', longitude: 102.71, latitude: 29.38},
        {name: '石棉县', longitude: 102.33, latitude: 29.14},
        {name: '天全县', longitude: 102.47, latitude: 30.11},
        {name: '芦山县', longitude: 103.029, latitude: 30.41},
        {name: '宝兴县', longitude: 102.75, latitude: 30.52}
      ],
      //下面是各个模块的echarts图例数据
      //echartsLegendData中data里的
      //name是echarts图例的文字和echarts柱子的xAxis的数据
      //color是图例和echarts柱子的颜色
      //chartType即为图表类型，柱状图还是饼图
      echartsLegendData: [
        {
          name: 'EarthquakeCasualties',
          chartType: 'bar',
          data: [
            {name: '3.0-3.9级', color: '#2c933e'},
            {name: '4.0-4.9级', color: '#53a8ff'},
            {name: '5.0-5.9级', color: '#ff6d39'},
            {name: '6.0级以上', color: '#ff7c88'},
          ]
        },
        {
          name: 'TransportationElectricity',
          chartType: 'pie',
          data: [
            {name: '累计停运变电站(座)', color: '#2c933e'},
            {name: '已恢复变电站(座)', color: '#53a8ff'},
            {name: '抢通恢复基站(个)', color: '#ff6d39'},
            {name: '累计退服基站(个)', color: '#ff7c88'},
          ]
        },
        {
          name: 'BuildingDamageInformation',
          chartType: 'pie',
          data: [
            {name: '目前房屋受损数量', color: '#2c933e'},
            {name: '目前房屋禁用数量', color: '#53a8ff'},
            {name: '目前房屋限用数量', color: '#ff6d39'},
            {name: '目前房屋可用数量', color: '#ff7c88'},
          ]
        },
        {
          name: 'SecondaryDisaster',
          chartType: 'bar',
          data: [
            {name: '疏散数量(个)', color: '#2c933e'},
            // {name: '正在施工点(个)', color: '#53a8ff'},
            {name: '现有风险点(个)', color: '#ff6d39'},
            {name: '警报数量(个)', color: '#ff7c88'},
          ]
        },
        {
          name: 'ResourceStrength',
          chartType: 'pie',
          data: [
            {name: '帐篷(顶)', color: '#2c933e'},
            {name: '棉被(床)', color: '#53a8ff'},
            {name: '折叠床(张)', color: '#ff6d39'},
            // {name: '警报数量', color: '#ff7c88'},
          ]
        },
        {
          name: 'MaterialDonation',
          chartType: 'bar',
          data: [
            {name: '政府部门接收捐赠资金(万元)', color: '#2c933e'},
            {name: '慈善组织接收捐赠资金(万元)', color: '#53a8ff'},
            {name: '红十字会接收捐赠资金(万元)', color: '#ff6d39'},
            // {name: '警报数量', color: '#ff7c88'},
          ]
        },
        {
          name: 'PublicSentiment',
          chartType: 'pie',
          data: [
            {name: '宣传报道(篇)', color: '#2c933e'},
            {name: '舆情风险提示(条)', color: '#53a8ff'},
            {name: '处置负面舆论(条)', color: '#ff6d39'},
          ]
        },
      ],
      //echartsConfigMap中
      //locationKey是后端获取数据方法返回的对应区县名称
      //dataKeys是后端返回数据的名称
      //labels是鼠标悬浮到echarts柱子上label会展示的文字
      echartsConfigMap: {
        EarthquakeCasualties: {
          locationKey: 'affected_area',
          dataKeys: ['magnitude_3_3_9', 'magnitude_4_4_9', 'magnitude_5_5_9', 'magnitude_6'],
          legendName: 'EarthquakeCasualties',
          labels: '余震次数'
        },
        TransportationElectricity: {
          locationKey: 'areaName',
          dataKeys: ['totalOutOfServiceSubstations', 'restoredSubstations', 'restoredBaseStations','totalDisabledBaseStations'],
          legendName: 'TransportationElectricity',
          labels: ['累计停运变电站(座)', '已恢复变电站(座)', '抢通恢复基站(个)','累计退服基站(个)']
        },
        BuildingDamageInformation: {
          locationKey: 'affectedAreaName',
          dataKeys: ['currentlyDamaged', 'currentlyDisabled', 'currentlyRestricted', 'currentlyAvailable'],
          legendName: 'BuildingDamageInformation',
          labels: ['房屋受损数量', '房屋禁用数量', '房屋限用数量', '房屋可用数量']
        },
        SecondaryDisaster: {
          locationKey: 'quakeAreaName',
          dataKeys: ['evacuationCount', 'existingRiskPoints', 'alarmCount'],
          legendName: 'SecondaryDisaster',
          labels: ['疏散数量', '现有风险点数量', '警报数量']
        },
        ResourceStrength: {
          locationKey: 'earthquakeAreaName',
          dataKeys: ['tentsCount', 'quiltsCount', 'foldingBedsCount'],
          legendName: 'ResourceStrength',
          labels: ['帐篷数', '棉被床数', '折叠床数']
        },
        MaterialDonation: {
          locationKey: 'earthquakeAreaName',
          dataKeys: ['governmentDonationAmount', 'charityDonationAmount', 'redCrossDonationAmount'],
          legendName: 'MaterialDonation',
          labels: '接收捐赠资金(万元)'
        },
        PublicSentiment: {
          locationKey: 'earthquakeZoneName',
          dataKeys: ['publicityReport', 'publicOpinionRiskWarning', 'negativeOpinionDisposal'],
          legendName: 'PublicSentiment',
          labels: ['宣传报道(篇)', '舆情风险提示(条)', '处置负面舆论(条)']
        }
      },

      //----------地震选择列表------------
      eqlists: [],
      eqlistName: '',
      eqid: '',
      eqqueueId:'',
      tableNameOptions: [],
      selectedComponentKey: 'EarthquakeCasualties',
      options: [
        {label: '震情伤亡信息专题图', value: 'EarthquakeCasualties'},
        {label: '交通电力通信信息专题图', value: 'TransportationElectricity'},
        {label: '建筑物受损信息专题图', value: 'BuildingDamageInformation'},
        {label: '次生灾害信息专题图', value: 'SecondaryDisaster'},
        {label: '力量物资信息专题图', value: 'ResourceStrength'},
        {label: '资金及物资捐赠专题图', value: 'MaterialDonation'},
        {label: '宣传舆情治安专题图', value: 'PublicSentiment'}
      ],

      //---------板块颜色------------
      dataSource: null,//这个别的也能用
      districtColorsLegendData: [
        {
          name: 'EarthquakeCasualties',
          data: [
            {name: '0-50人', color: '#ffb3b3', range: [0, 50]},// 非常浅的红色
            // {name: '10-20人', color: '#ff6666'},// 浅红色
            // {name: '20-50人', color: '#ff4d4d'},// 略深的红色
            {name: '50-200人', color: '#ff3333', range: [51, 200]},// 中等红色
            // {name: '100-500人', color: '#ff1a1a'},// 深红色
            // {name: '500-1000人', color: '#e60000'},// 更深的红色
            {name: '>200人', color: '#b30000', range: [201, Infinity]},// 深红带棕
            // {name: '>2000人', color: '#800000'}, // 非常深的红色
          ]
        },
      ],
      districtColorsConfigMap: {
        EarthquakeCasualties: {
          locationKey: 'affectedAreaName',
          dataKey: 'affectedPopulation',
          legendName: 'EarthquakeCasualties',
        },
      },

      //-----------导出图片----------------
      previewImage: null, // 保存预览图片的 URL
      loading: false, // 控制加载状态
      exportTitle: '震情伤亡信息专题图',//默认的
      pictureCreateTime: '',
      // 导出图片时经纬度线
      rectangleBounds: [],//按东南西北的顺序存储
      latLonEntities: [], // 用于存储经纬度线实体的数组
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      step: 0.5,
      divBoxCount: 0,
      flexPercentages: [],
      points: [],

      //---------标绘点所用到的------------
      pointsLegendData: [
        {
          name: 'TransportationElectricity',
          data: [
            {name: '目前道路中断村', img: fimg},
            {name: '目前通信中断村', img: gimg},
            {name: '目前主网供电中断村', img: himg},
          ]
        },
      ],
      pointsConfigMap: {
        TransportationElectricity: {
          //村镇名称
          villagesName: ['roadBlockVillagesName', 'currentInterruptedVillagesName', 'currentlyBlackedOutVillagesName'],
          //区县名称
          districtNames: ['affectedAreasRoad', 'affectedAreasPower', 'earthquakeZoneNames'],
          legendName: 'TransportationElectricity',
        }
      },
      earthquakeCasualtiesLegendData: [
        {name: '转移安置人数', img: cumulativeTransferredImg}
      ],
      transportationElectricityLegendData: [
        {name: '应急供电用户数（户）', img: cumulativeTransferredImg}
      ],
      buildingDamageInformationLegendData: [
        {
          img: damagedWaterSupply,
          name: '集中供水工程受损'
        },
        {
          img: guaranteeWaterSupply,
          name: '保障安置点供水'
        },
      ],
      secondaryDisasterLegendData: [
        {
          name: '受威胁群众(户或人)',
          data: [
            {name: '>200人', img: damagedWaterSupply, width: 40, height: 40, range: [201, Infinity],marginLeft: 0},
            {name: '50-200人', img: damagedWaterSupply, width: 30, height: 30, range: [51, 200],marginLeft: 5},
            {name: '0-50人', img: damagedWaterSupply, width: 25, height: 25, range: [0, 50],marginLeft: 7.5},
          ]
        },
        {
          name: '避险转移(户或人)',
          data: [
            {name: '>200人', img: guaranteeWaterSupply, width: 40, height: 40, range: [201, Infinity],marginLeft: 0},
            {name: '50-200人', img: guaranteeWaterSupply, width: 30, height: 30, range: [51, 200],marginLeft: 5},
            {name: '0-50人', img: guaranteeWaterSupply, width: 25, height: 25, range: [0, 50],marginLeft: 7.5},
          ]
        },
      ],
      resourceStrengthLegendData: [
        {name: '直升机', img: cumulativeTransferredImg},
        {name: '翼龙无人机', img: damagedWaterSupply},
        {name: '救援力量人数', img: guaranteeWaterSupply}
      ],
      materialDonationLegendData: [
        {name: '捐赠物资(万件)', img: damagedWaterSupply},
        {name: '药品(箱)', img: guaranteeWaterSupply},
      ],
      publicSentimentLegendData: [
        {name: '接报救助信息(起)', img: damagedWaterSupply},
        {name: '投入警力(人)', img: guaranteeWaterSupply},
      ],
    };
  },
  mounted() {
    // 初始化地图
    this.init();
    // 启动轮询获取后端数据
    this.startPolling();
    // 加载雅安边界线
    this.loadYaAnBoundary();
    // 获取灾情专题图的地图
    // this.outputData();
  },
  beforeDestroy() {
    // 在组件销毁时清除轮询
    this.stopPolling();
  },
  methods: {
    // 初始化控件等
    init() {
      this.viewer = initCesium(Cesium);

      this.$nextTick(() => {
        const cesiumContainer = document.getElementById('cesiumContainer');
        if (cesiumContainer) {
          cesiumContainer.setAttribute('id', 'cesiumContainerWithId');
        }
      });

      this.viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权信息
      window.viewer = this.viewer;

      let options = {
        defaultResetView: Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500),
        enableCompass: false,
        enableZoomControls: false,
        enableDistanceLegend: true,
        enableCompassOuterRing: false,
        resetTooltip: "重置视图",
        zoomInTooltip: "放大",
        zoomOutTooltip: "缩小"
      };


      window.navigation = new CesiumNavigation(this.viewer, options);

      // 锁定相机，正对着地面
      this.viewer.scene.preRender.addEventListener(() => {
        var camera = viewer.scene.camera;
        var currentPitch = camera.pitch;

        // 如果 pitch 不是 -Cesium.Math.PI_OVER_TWO，则将其设置为固定值
        if (currentPitch !== -Cesium.Math.PI_OVER_TWO) {
          viewer.scene.camera.setView({
            orientation: {
              heading: camera.heading,  // 保持当前的 heading
              pitch: -Cesium.Math.PI_OVER_TWO,  // 固定 pitch 为垂直朝下
              roll: camera.roll        // 保持当前的 roll
            }
          });
        }
      });

      // 设置视角的最低高度限制
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5000;
      // 设置视角的最高高度限制
      this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 500000;

      // 禁用中键旋转
      this.viewer.scene.screenSpaceCameraController.enableTilt = false;

      // 禁用双击后的视角锁定功能
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },

    // 启动轮询
    startPolling() {
      this.getEarthquake()
      this.pollingInterval = setInterval(() => this.getEarthquake(), 5000000);
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },

    // 地震列表变化
    handleEqListChange(value) {
      // 获取选择的 eqid
      this.eqid = value;
      this.viewer.entities.removeAll();
      this.getEarthQuakeCenter(value)
      this.outputData(value);
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        this.getPoints(value)
        //获取震源中心的点数据
        this.getDistrictColor(value)
        this.getEcharts(value)
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        //这里代码较为特殊，我在getEcharts里面调用了getPoints
        this.getEcharts(value)
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(value)
        this.getPoints(value)
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        this.getEcharts(value)
        this.addDistrictLabels(this.dataSource)
        this.getPoints(value)
      }
      if (this.selectedComponentKey === 'ResourceStrength') {
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(value)
        this.getPoints(value)
      }
      if (this.selectedComponentKey === 'MaterialDonation') {
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(value)
        this.getPoints(value)
      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(value)
        this.getPoints(value)
      }
    },

    // 切换模块组件
    handleComponentChange(value) {
      //这里是修改exportTitle，导出图片的标题会对应变化
      const selectedOption = this.options.find(option => option.value === this.selectedComponentKey);
      if (selectedOption) {
        this.exportTitle = selectedOption.label; // 设置 exportTitle 为对应的 label
      }
      // 清除当前所有点标绘实体
      this.viewer.entities.removeAll();
      //获取震源中心的点数据
      this.getEarthQuakeCenter(this.eqid)
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        this.getPoints(this.eqid)
        this.getDistrictColor(this.eqid)
        this.getEcharts(this.eqid)
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        //这里代码较为特殊，我在getEcharts里面调用了getPoints
        this.addTrafficLayer();
        this.updateDistrictColors(this.dataSource)
        this.getEcharts(this.eqid)
      } else {
        this.removeImageryLayer('TrafficLayer');
        this.removeImageryLayer('TrafficTxtLayer');
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        this.getEcharts(this.eqid)
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getPoints(this.eqid)
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      }
      if (this.selectedComponentKey === 'ResourceStrength') {
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      }
      if (this.selectedComponentKey === 'MaterialDonation') {
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        this.updateDistrictColors(this.dataSource)
        this.addDistrictLabels(this.dataSource)
        this.getEcharts(this.eqid)
        this.getPoints(this.eqid)
      }
    },

    // 切换组件获取Echarts图例数据
    getEchartsLegendData() {
      const legend = this.echartsLegendData.find(
          legendItem => legendItem.name === this.selectedComponentKey
      );
      return legend ? legend.data : [];
    },

    // 切换组件获取板块颜色数据
    getColorsLegendData() {
      const legend = this.districtColorsLegendData.find(
          legendItem => legendItem.name === this.selectedComponentKey
      );
      return legend ? legend.data : [];
    },

    // 放大方法
    zoomIn() {
      const camera = this.viewer.camera;
      const currentHeight = camera.positionCartographic.height;
      const newHeight = currentHeight * 0.63; // 放大
      if (newHeight > 5000){
        // 获取当前屏幕中心的经纬度
        const center = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
        const longitude = Cesium.Math.toDegrees(center.longitude);
        const latitude = Cesium.Math.toDegrees(center.latitude);
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, newHeight),
          duration: 1.0
        });
      }
    },

    // 缩小方法
    zoomOut() {
      const camera = this.viewer.camera;
      const currentHeight = camera.positionCartographic.height;
      const newHeight = currentHeight * 1.37; // 放大
      if (newHeight < 500000){
        // 获取当前屏幕中心的经纬度
        const center = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
        const longitude = Cesium.Math.toDegrees(center.longitude);
        const latitude = Cesium.Math.toDegrees(center.latitude);
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, newHeight),
          duration: 1.0
        });
      }
    },

    // --------------------------------------------------下面是后端获取数据的方法------------------------------------------

    //获取地震列表数据
    getEarthquake() {
      getExcelUploadEqList().then(res => {
        this.eqlists = res
        if (res.data === null) {
          this.$message.error("地震列表无数据");
        } else {
          // 将 eqlists 映射为包含 label 和 value 的选项数据
          this.tableNameOptions = this.eqlists.map(file => {
            const eqid = file.split(' - ')[0]?.trim();  // 提取 eqid
            const details = file.split(' - ')[1]?.trim(); // 提取详细信息
            return {
              label: details,  // 使用提取的部分作为标签
              value: eqid      // 选择值为 ID
            };
          });
          if (this.tableNameOptions.length > 0) {
            if (!this.eqlistName) {
              // 默认选择地震列表中的第一个
              this.eqlistName = this.tableNameOptions[0].label;
              this.handleEqListChange(this.tableNameOptions[0].value)
              this.eqIdValue=this.tableNameOptions[0].value
            } else {
              // this.handleEqListChange(this.eqlistName)
            }
          }
        }
      });
    },

    //获取震源中心
    getEarthQuakeCenter(eqid) {
      // getGeomById(eqid).then(res => {
      getGeomByEqListId(eqid).then(res => {
        console.log(res)
        this.updateEarthQuakeCenter(res[0])
      })
    },

    //获取echarts展示的数据
    getEcharts(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        getAftershock(eqid).then(res => {
          this.updateMultipleECharts(res)
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        let data = [];  // 初始化空数组存储合并后的数据

        // 辅助函数：查找或创建地震区域条目
        function findOrCreateEntry(data, areaName) {
          let entry = data.find(item => item.areaName === areaName);
          if (!entry) {
            entry = { areaName: areaName }; // 统一使用 areaName 作为字段名
            data.push(entry);
          }
          return entry;
        }

        // 处理电力供应数据
        function processPowerSupply(response) {
          response.forEach(item => {
            const entry = findOrCreateEntry(data, item.affectedArea);  // 使用 affectedArea 作为区域名
            entry.totalOutOfServiceSubstations = item.totalOutOfServiceSubstations || 0; // 累计停运变（发）电站（座）
            entry.restoredSubstations = item.restoredSubstations || 0; // 已恢复变（发）电站（座）
          });
        }

        // 处理通信基站数据
        function processFacility(response) {
          response.forEach(item => {
            const entry = findOrCreateEntry(data, item.earthquakeZoneName);  // 使用 earthquakeZoneName 作为区域名
            entry.totalDisabledBaseStations = item.totalDisabledBaseStations || 0; // 累计退服基站（个）
            entry.restoredBaseStations = item.restoredBaseStations || 0; // 抢通恢复基站（个）
          });
        }

        // 获取数据并处理
        Promise.all([
          getPowerSupply(eqid).then(res =>{
            processPowerSupply(res)
            this.getPoints(res)
          }),
          getFacility(eqid).then(res => processFacility(res))
        ]).then(() => {
          this.updateMultipleECharts(data);
        });
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        getHousingSituationList(eqid).then(res => {
          this.updateMultipleECharts(res);
        })
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        getRiskConstructionGeohazards(eqid).then(res => {
          this.updateMultipleECharts(res);
        })
      }
      if (this.selectedComponentKey === 'ResourceStrength') {
        getDisasterreLiefMaterials(eqid).then(res => {
          this.updateMultipleECharts(res);
        })
      }
      if (this.selectedComponentKey === 'MaterialDonation') {
        let data = [];  // 初始化空数组存储合并后的数据
        // 辅助函数：查找或创建地震区域条目
        function findOrCreateEntry(data, areaName) {
          let entry = data.find(item => item.earthquakeAreaName === areaName);
          if (!entry) {
            entry = {earthquakeAreaName: areaName};
            data.push(entry);
          }
          return entry;
        }

        // 通用的处理函数：将捐赠数据合并到 data 中
        function processDonations(response, donationKey) {
          response.forEach(item => {
            const entry = findOrCreateEntry(data, item.earthquakeAreaName);
            entry[donationKey] = item.donationAmount || 0;  // 动态设置捐赠金额
          });
        }

        // 获取捐赠数据并处理
        Promise.all([
          getGovernment(eqid).then(res => processDonations(res, 'governmentDonationAmount')),
          getCharity(eqid).then(res => processDonations(res, 'charityDonationAmount')),
          getRedCrossDonations(eqid).then(res => processDonations(res, 'redCrossDonationAmount'))
        ]).then(() => {
          this.updateMultipleECharts(data);
        });

      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        getPublicOpinion(eqid).then(res => {
          this.updateMultipleECharts(res)
        })
      }
    },

    //板块颜色
    getDistrictColor(eqid) {
      //获取受灾人数数据
      getCasualty(eqid).then(res => {
        this.updateDistrictColors(this.dataSource, res)
        this.addDistrictLabels(this.dataSource)
      })
    },

    //获取点数据
    getPoints(eqid) {
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        //获取转移安置人数数据
        getTransferInfo(eqid).then(res => {
          this.updatePoints(res)
        })
      }
      if (this.selectedComponentKey === 'TransportationElectricity') {
        // getVillagesName(eqid).then(res => {
        //   console.log('返回中断村镇数据：', res)
        //   const config = this.pointsConfigMap[this.selectedComponentKey];
        //   const legend = this.pointsLegendData.find(legend => legend.name === config.legendName);
        //
        //   if (!legend) return;
        //
        //   // 存储原始村镇名称和拼接后的名称
        //   const villageData = config.villagesName.map((villageKey, index) => {
        //     const villageNames = res[villageKey] || [];
        //     const districtNames = res[config.districtNames[index]] || [];
        //
        //     return villageNames.map((villageName, villageIndex) => {
        //       const districtName = districtNames[villageIndex] || '';
        //       const combinedName = `${districtName}${villageName}`; // 拼接名称
        //       return { combinedName, originalName: villageName }; // 保存原始名称
        //     });
        //   });
        //
        //   // 展平 villageData
        //   const flatVillageData = villageData.flat();
        //
        //   // 查询每个村镇的经纬度，并保留原始名称
        //   this.searchLocations(flatVillageData.map(v => v.combinedName))
        //       .then(locations => {
        //         // 处理每个位置，绑定图标和原始村镇名称
        //         const allLocations = locations.map((location, index) => {
        //           const originalVillageName = flatVillageData[index].originalName; // 获取原始村镇名称
        //
        //           return {
        //             name: originalVillageName, // 使用原始名称
        //             longitude: location.longitude,
        //             latitude: location.latitude,
        //             img: legend.data[Math.floor(index / (flatVillageData.length / legend.data.length))].img, // 绑定对应图标
        //           };
        //         });
        //         // 更新标绘
        //         this.updateMultiplePoints(allLocations);
        //       })
        //       .catch(error => {
        //         console.error('地理编码请求处理错误:', error);
        //       });
        // });
        this.updatePoints(eqid)
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        getSupplySituationList(eqid).then(res => {
          this.updatePoints(res)
        })
        getEnsureWaterSupply(eqid).then(res => {
          this.updatePoints(res)
        })
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        // 定义 dataMap 用于按 affectedArea 合并数据
        const dataMap = {};
        // 获取第一个数据源并合并
        getSecondaryDisaster(eqid).then(res1 => {
          // 检查 res1 是否为数组，若不是则将其包装为数组
          const data1 = Array.isArray(res1) ? res1 : [res1];
          data1.forEach(item => {
            const {affectedArea, evacuation, threatenedPopulation} = item;
            if (!dataMap[affectedArea]) {
              dataMap[affectedArea] = {affectedArea, evacuation: 0, threatenedPopulation: 0};
            }
            dataMap[affectedArea].evacuation += evacuation;
            dataMap[affectedArea].threatenedPopulation += threatenedPopulation;
          });

          getBarrierlakeSituation(eqid).then(res2 => {
            const data2 = Array.isArray(res2) ? res2 : [res2];
            data2.forEach(item => {
              const {affectedArea, evacuation, threatenedPopulation} = item;
              if (!dataMap[affectedArea]) {
                dataMap[affectedArea] = {affectedArea, evacuation: 0, threatenedPopulation: 0};
              }
              dataMap[affectedArea].evacuation += evacuation;
              dataMap[affectedArea].threatenedPopulation += threatenedPopulation;
            });

            const combinedData = Object.values(dataMap);
            this.updatePoints(combinedData);
          });
        });
      }
      if (this.selectedComponentKey === 'ResourceStrength') {
        function getTotalRescueForces(data) {
          // 需要相加的字段列表
          const fieldsToSum = [
            'plaCount',
            'armedPoliceCount',
            'militiaCount',
            'fireRescueCount',
            'forestFireRescueCount',
            'professionalForcesCount',
            'emergencyProductionSafetyCount',
            'medicalRescueCount',
            'transportationCommunicationPowerCount',
            'airRescueCount',
            'volunteerRescueTeamCount',
            'partyMemberCommandoCount'
          ];

          // 遍历并生成新的数据
          return data.map(item => {
            // 使用 reduce 累加需要的字段，默认值为 0，处理可能的 null
            const totalCount = fieldsToSum.reduce((sum, field) => sum + (item[field] || 0), 0);

            // 返回新对象，包含原有字段和计算后的总人数
            return {
              earthquakeAreaName: item.earthquakeAreaName,
              totalCount
            };
          });
        }

        //  直升机，翼龙无人机
        getEquipment(eqid).then(res => {
          this.updatePoints(res)
        })
        //  救援力量所有累积人数
        getRescueForces(eqid).then(res => {
          const newData = getTotalRescueForces(res);
          this.updatePoints(newData)
        })
      }
      if (this.selectedComponentKey === 'MaterialDonation') {
        getMaterialDonation(eqid).then(res => {
          this.updatePoints(res)
        })
      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        getSocialOrder(eqid).then(res => {
          this.updatePoints(res)
        })
      }
    },

    //-----------------------------------------------下面是交通图层的方法-------------------------------------------------

    /**
     * 添加交通图层到地图
     * 该方法首先检查是否已经存在名为'TrafficLayer'的图层，如果不存在，则从天地图服务添加交通图层
     * 同样，如果不存在名为'TrafficTxtLayer'的图层，则添加交通注记图层
     */
    addTrafficLayer() {
      // 获取天地图API令牌
      let token = TianDiTuToken;

      // 检查是否存在'TrafficLayer'图层
      let trafficLayerexists = this.imageryLayersExists('TrafficLayer')
      if (!trafficLayerexists) {
        // 创建并添加交通图层
        let trafficLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              // 天地图交通图层的URL模板
              url:`${tianditu}/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=${token}`,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
            })
        );
        trafficLayer.name = "TrafficLayer"; // 设置名称
      }

      // 检查是否存在'TrafficTxtLayer'图层
      let trafficTxtLayerExists = this.imageryLayersExists('TrafficTxtLayer')
      if (!trafficTxtLayerExists) {
        // 创建并添加交通注记图层
        let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapTileServiceImageryProvider({
              // 天地图交通注记图层的URL模板
              url: `${tianditu}/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=${token}`,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
              show: false, // 初始状态下不显示注记
            })
        )
        traffictxtLayer.name = "TrafficTxtLayer"
      }
    },

    /**
     * 移除指定名称的影像图层
     *
     * 该方法旨在从当前 viewer 的影像图层列表中移除第一个匹配给定图层名称的图层
     * 主要用于动态管理地图上的影像图层，提高地图的可读性和性能
     * @param {string} layerName - 要移除的影像图层的名称
     *        图层名称是在添加图层时指定的，用于唯一标识每个图层
     */
    removeImageryLayer(layerName) {
      // 获取当前 viewer 的所有影像图层
      const layers = window.viewer.imageryLayers;
      // 遍历所有图层，寻找与给定名称匹配的图层
      for (let i = 0; i < layers.length; i++) {
        // 当找到名称匹配的图层时
        if (layers.get(i).name === layerName) {
          // 移除该图层
          layers.remove(layers.get(i));
          // 完成移除后即返回，结束函数执行
          return;
        }
      }
    },

    /**
     * 检查指定名称的图层是否存在于地图中
     *
     * @param {string} layerName - 需要检查的图层名称
     * @return {boolean} - 如果图层存在，则返回true；否则返回false
     */
    imageryLayersExists(layerName) {
      // 获取地图中所有的图层
      const layers = viewer.imageryLayers;
      // 遍历所有图层，检查是否存在指定名称的图层
      for (let i = 0; i < layers.length; i++) {
        if (layers.get(i).name === layerName) {
          // 如果找到指定名称的图层，返回true
          return true;
        }
      }
      // 如果遍历完所有图层后仍未找到指定名称的图层，返回false
      return false;
    },

    //------------------------------------------下面是清除实体的方法------------------------------------------------------

    // 销毁所有已创建的 ECharts 实例
    clearMultipleECharts() {
      // 停止 Cesium 场景渲染后的 ECharts 更新同步
      if (this.syncEChartsWithCesium) {
        this.viewer.scene.postRender.removeEventListener(this.syncEChartsWithCesium);
        this.isPostRenderAdded = false;
      }

      // 遍历每个 ECharts 实例并销毁它们
      this.echartsInstances.forEach(echart => {
        if (echart) {
          echart.dispose();  // 销毁 ECharts 实例，释放资源
        }
      });

      // 清空 ECharts 实例数组
      this.echartsInstances = [];

      // 清空 ECharts 容器
      const chartContainers = this.$refs.echartsContainer;
      if (chartContainers) {
        chartContainers.forEach(container => {
          container.innerHTML = '';  // 移除容器中的所有 ECharts 元素
        });
      }
    },

    // clearTransferPoints() {
    //   // 遍历 transferData 并移除对应的实体
    //   const transferData = [
    //     {name: '宝兴县', count: 120},
    //     {name: '雨城区', count: 95},
    //     {name: '名山区', count: 110},
    //     {name: '荥经县', count: 85},
    //     {name: '汉源县', count: 75},
    //     {name: '石棉县', count: 130},
    //     {name: '天全县', count: 140},
    //     {name: '芦山县', count: 100},
    //   ];
    //
    //   // 遍历 transferData 并根据 name 查找并移除实体
    //   transferData.forEach(item => {
    //     const entity = this.viewer.entities.getById(item.name); // 获取与 name 对应的实体
    //
    //     if (entity) {
    //       this.viewer.entities.remove(entity); // 移除实体
    //     }
    //   });
    // },
    //
    //
    // resetDistrictColors(dataSource) {
    //   // 检查 dataSource 是否存在并且 entities 属性已定义
    //   if (!dataSource || !dataSource.entities) {
    //     console.warn('dataSource or entities is undefined');
    //     return;
    //   }
    //
    //   // 遍历每个实体，将其颜色恢复为默认状态或清除颜色
    //   dataSource.entities.values.forEach(entity => {
    //     // 检查是否存在 polygon 并且已设置了颜色
    //     if (entity.polygon && entity.polygon.material) {
    //       // 这里将颜色重置为 Cesium 默认颜色或透明色
    //       const defaultColor = Cesium.Color.WHITE.withAlpha(0.0);  // 可以根据需求设置默认颜色
    //       entity.polygon.material = new Cesium.ColorMaterialProperty(defaultColor);  // 恢复颜色
    //     }
    //   });
    // },

    //-----------------------------下面主要是标绘点的方法，创建转移安置点，以及震源中心的方法--------------------------------

    async searchLocations(villageList) {
      const positionList = []; // 用于存储所有结果
      const key = '4bf87471d3584b4b83c650b7fcbe67a1'; // 请替换为您的高德API密钥

      for (const village of villageList) {
        const result = await this.fetchLocation(village, key);
        if (result) {
          positionList.push(result);
        } else {
          console.warn(`未找到对应的村镇: ${village}`);
        }
      }

      this.positionList = positionList; // 假设 positionList 是一个用于存储结果的数组
      console.log('所有经纬度:', positionList);
      return positionList; // 返回结果
    },

    async fetchLocation(village, key) {
      const encodedVillage = encodeURIComponent(village);
      const requestString = `${AmapApiLocal}/geocode/geo?address=${encodedVillage}&key=${key}`;

      console.log(`请求 URL: ${requestString}`); // 打印请求的 URL 以便调试

      try {
        const response = await fetch(requestString);
        if (!response.ok) {
          throw new Error(`网络响应错误: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API 返回数据:', data); // 打印 API 返回的数据以便调试

        if (data.geocodes && data.geocodes.length > 0) {
          const geocode = data.geocodes[0];
          if (geocode && geocode.location) {
            const location = geocode.location.split(',');
            return {
              name: village, // 村镇名称
              longitude: Number(location[0]),
              latitude: Number(location[1]),
            };
          }
        } else {
          console.warn(`未找到村镇: ${village}`);
          return null;
        }
      } catch (error) {
        console.error(`地理编码请求错误:`, error);
        return null; // 返回 null 表示请求失败
      }
    },

    updateMultiplePoints(allLocations) {
      // 遍历所有位置点
      allLocations.forEach(location => {
        if (this.selectedComponentKey === 'TransportationElectricity') {
          this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
            billboard: {
              image: location.img,  // 使用图片路径作为图标
              scale: 1.0,  // 固定缩放大小
              height: 40,
              width: 40,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
            },
            label: {
              text: location.name,  // 显示村落名字
              font: '12px sans-serif',
              fillColor: Cesium.Color.BLACK,
              showBackground: false,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              pixelOffset: new Cesium.Cartesian2(0, -15),  // 调整文字偏移
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
            }
          });
        }
      });
    },
    // 更新点标绘函数
    // updateMultiplePoints(locations) {
    //   locations.forEach(location => {
    //     this.viewer.entities.add({
    //       position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
    //       billboard: {
    //         image: location.img,
    //         scale: 0.8,
    //         verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER
    //       },
    //       label: {
    //         text: location.name,
    //         font: 'bold 12px sans-serif',
    //         fillColor: Cesium.Color.BLACK,
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY
    //       }
    //     });
    //   });
    // },

    updatePoints(data) {
      const addLocationEntity = (location, count, img, height, width) => {
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          billboard: {
            image: img,
            scale: 1.0,  // 固定缩放大小
            height: height,
            width: width,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: `${count}`,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,  // 字体颜色
            outlineWidth: 4,  // 较宽的外边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 填充文字并加上轮廓
            showBackground: false,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -15),  // 调整文字偏移
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          }
        });
      };
      if (this.selectedComponentKey === 'EarthquakeCasualties') {
        const locations = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.17},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.35, latitude: 29.35},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.56},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        // 遍历所有的转移位置
        locations.forEach(location => {
          // 在 transferDataFromBackend 中查找对应位置的数据
          const transferItem = data.find(item => item.earthquakeAreaName === location.name);

          // 如果找不到对应的转移数据，设定人数为0
          const count = transferItem ? transferItem.cumulativeTransferred : 0;

          if (count === 0) {
            return;
          }

          // 当人数小于10时，设为10
          const adjustedCount = count < 10 ? 10 : count;
          const scale = Math.log(adjustedCount) / 5;  // 动态计算缩放比例
          const baseFontSize = 12;  // 定义基础字体大小
          const fontSize = Math.max(Math.round(scale * baseFontSize), 13);  // 动态计算字体大小，最小为10
          const imageHeight = 30;  // 假设图标的高度
          const dynamicOffsetY = -(imageHeight * scale / 2) - (fontSize / 2);  // 动态计算Y轴偏移量

          // 添加到 Cesium 实体
          this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
            billboard: {
              image: cumulativeTransferredImg,  // 图标
              scale: scale,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,  // 图标在位置的中心
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  // 水平居中
              eyeOffset: new Cesium.Cartesian3(0, 0, -5000) // 确保标签浮在最上面
            },
            label: {
              text: `${count}`,  // 显示实际人数
              font: `bold ${fontSize}px sans-serif`,  // 动态调整字体大小
              fillColor: Cesium.Color.WHITE,  // 字体颜色
              outlineWidth: 4,  // 较宽的外边框宽度
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 填充文字并加上轮廓
              showBackground: false,  // 不显示背景
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 将文本基线对齐到图标底部
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  // 水平居中
              pixelOffset: new Cesium.Cartesian2(0, dynamicOffsetY),  // 动态调整文本位置
              disableDepthTestDistance: Number.POSITIVE_INFINITY,  // 禁用深度测试，使标签不被遮挡
              eyeOffset: new Cesium.Cartesian3(0, 0, -5000) // 确保标签浮在最上面
            }
          });
        });
      }
      if (this.selectedComponentKey === 'TransportationElectricity'){
        const locations = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.45, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        data.forEach(item => {
          let img = null;
          if (item.emergencyPowerUsers) {
            let location = locations.find(location => location.name === item.affectedArea);
            if (location){
              img = this.transportationElectricityLegendData[0].img
              addLocationEntity(location, item.emergencyPowerUsers, img, 35, 35)
            }
          }
        })
      }
      if (this.selectedComponentKey === 'BuildingDamageInformation') {
        const locations1 = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.45, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        const locations2 = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.30, latitude: 29.31},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        data.forEach(item => {
          let img = null;
          if (item.centralizedWaterProjectDamage) {
            let location = locations1.find(location => location.name === item.earthquakeAreaName);
            img = this.buildingDamageInformationLegendData[0].img
            addLocationEntity(location, item.centralizedWaterProjectDamage, img, 35, 35)
          }
          if (item.waterSupplyPoints) {
            let location = locations2.find(location => location.name === item.earthquakeAreaName);
            img = this.buildingDamageInformationLegendData[1].img
            addLocationEntity(location, item.waterSupplyPoints, img, 35, 35)
          }
        })
      }
      if (this.selectedComponentKey === 'SecondaryDisaster') {
        // 遍历所有数据
        data.forEach(dataItem => {
          let evacuationCount = null;
          let threatenedCount = null;

          // 定义函数来根据 count 查找对应的宽度和高度
          const getSizeByCount = (count, type) => {
            const legend = this.secondaryDisasterLegendData.find(legendItem => legendItem.name === type);
            if (legend) {
              const dataItem = legend.data.find(item => count >= item.range[0] && count <= item.range[1]);
              if (dataItem) {
                return {width: dataItem.width, height: dataItem.height, img: dataItem.img};
              }
            }
            return {width: 35, height: 35}; // 默认宽度和高度
          };

          if (dataItem.evacuation) {
            evacuationCount = dataItem.evacuation;
            const locations = [
              {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
              {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
              {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
              {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
              {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
              {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
              {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
              {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
            ]
            let location = locations.find(loc => loc.name === dataItem.affectedArea);
            const {width, height, img} = getSizeByCount(evacuationCount, '避险转移(户或人)');
            addLocationEntity(location, evacuationCount, img, width, height)
          }
          if (dataItem.threatenedPopulation) {
            threatenedCount = dataItem.threatenedPopulation;
            const locations = [
              {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
              {name: '名山区', longitude: 103.37, latitude: 30.12},  // 向西南偏移
              {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
              {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
              {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
              {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
              {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
              {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
            ]
            let location = locations.find(loc => loc.name === dataItem.affectedArea);
            const {width, height, img} = getSizeByCount(threatenedCount, '受威胁群众(户或人)');
            addLocationEntity(location, threatenedCount, img, height, width)
          }
          // 如果 evacuationCount 和 threatenedCount 都为 null，则跳过当前项
          if (evacuationCount === null && threatenedCount === null) {
            return;
          }
        });
      }
      if (this.selectedComponentKey === 'ResourceStrength') {
        const locations1 = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.28, latitude: 30.26},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.05, latitude: 30.65},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        const locations2 = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.34, latitude: 30.08},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        const locations3 = [
          {name: '雨城区', longitude: 103.03, latitude: 30.16},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.36, latitude: 30.19},  // 向西南偏移
          {name: '荥经县', longitude: 102.40, latitude: 29.77},  // 向东北偏移
          {name: '汉源县', longitude: 102.92, latitude: 29.34},  // 向东偏移
          {name: '石棉县', longitude: 102.14, latitude: 29.39},  // 向东北偏移
          {name: '天全县', longitude: 102.57, latitude: 30.23},  // 向西偏移
          {name: '芦山县', longitude: 102.95, latitude: 30.72},  // 向西偏移
          {name: '宝兴县', longitude: 102.56, latitude: 30.44}   // 向南偏移
        ]
        data.forEach(item => {
          if (item.helicopterCount) {
            let location = locations1.find(location => location.name === item.earthquakeAreaName);
            let img = this.resourceStrengthLegendData[0].img
            addLocationEntity(location, item.helicopterCount, img, 35, 35)
          }
          if (item.wingDroneCount) {
            let location = locations2.find(location => location.name === item.earthquakeAreaName);
            let img = this.resourceStrengthLegendData[1].img
            addLocationEntity(location, item.wingDroneCount, img, 35, 35)
          }
          if (item.totalCount) {
            let location = locations3.find(location => location.name === item.earthquakeAreaName);
            let img = this.resourceStrengthLegendData[2].img
            addLocationEntity(location, item.totalCount, img, 35, 35)
          }
        });
      }
      if (this.selectedComponentKey === 'MaterialDonation') {
        const locations1 = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        const locations2 = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        // 遍历所有数据
        data.forEach(dataItem => {
          let materialDonationCount = null;
          let drugsDonationCount = null;

          if (dataItem.materialDonationCount) {
            materialDonationCount = dataItem.materialDonationCount;
            let location = locations1.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.materialDonationLegendData[0].img
            addLocationEntity(location, materialDonationCount, img, 35, 35)
          }
          if (dataItem.drugsDonationCount) {
            drugsDonationCount = dataItem.drugsDonationCount;
            let location = locations2.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.materialDonationLegendData[1].img
            addLocationEntity(location, drugsDonationCount, img, 35, 35)
          }
          if (materialDonationCount === null && drugsDonationCount === null) {
            return;
          }
        });
      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        const locations1 = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        const locations2 = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        // 遍历所有数据
        data.forEach(dataItem => {
          let materialDonationCount = null;
          let drugsDonationCount = null;

          if (dataItem.materialDonationCount) {
            materialDonationCount = dataItem.materialDonationCount;
            let location = locations1.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.publicSentimentLegendData[0].img
            addLocationEntity(location, materialDonationCount, img, 35, 35)
          }
          if (dataItem.drugsDonationCount) {
            drugsDonationCount = dataItem.drugsDonationCount;
            let location = locations2.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.publicSentimentLegendData[1].img
            addLocationEntity(location, drugsDonationCount, img, 35, 35)
          }
          if (materialDonationCount === null && drugsDonationCount === null) {
            return;
          }
        });
      }
      if (this.selectedComponentKey === 'PublicSentiment') {
        const locations1 = [
          {name: '雨城区', longitude: 103.11, latitude: 29.97},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.31, latitude: 30.22},  // 向西南偏移
          {name: '荥经县', longitude: 102.66, latitude: 29.82},  // 向东北偏移
          {name: '汉源县', longitude: 102.59, latitude: 29.51},  // 向东偏移
          {name: '石棉县', longitude: 102.41, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.67, latitude: 30.14},  // 向西偏移
          {name: '芦山县', longitude: 103.07, latitude: 30.62},  // 向西偏移
          {name: '宝兴县', longitude: 102.61, latitude: 30.61}   // 向南偏移
        ]
        const locations2 = [
          {name: '雨城区', longitude: 103.0, latitude: 30.02},  // 稍微向东北偏移
          {name: '名山区', longitude: 103.34, latitude: 30.12},  // 向西南偏移
          {name: '荥经县', longitude: 102.53, latitude: 29.79},  // 向东北偏移
          {name: '汉源县', longitude: 102.47, latitude: 29.57},  // 向东偏移
          {name: '石棉县', longitude: 102.25, latitude: 29.3},  // 向东北偏移
          {name: '天全县', longitude: 102.75, latitude: 30.03},  // 向西偏移
          {name: '芦山县', longitude: 103.10, latitude: 30.52},  // 向西偏移
          {name: '宝兴县', longitude: 102.70, latitude: 30.75}   // 向南偏移
        ]
        // 遍历所有数据
        data.forEach(dataItem => {
          let reportedRescueCount = null;
          let policeForceCount = null;

          if (dataItem.reportedRescueInfo) {
            reportedRescueCount = dataItem.reportedRescueInfo;
            let location = locations1.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.publicSentimentLegendData[0].img
            addLocationEntity(location, reportedRescueCount, img, 35, 35)
          }
          if (dataItem.policeForce) {
            policeForceCount = dataItem.policeForce;
            let location = locations2.find(loc => loc.name === dataItem.earthquakeAreaName);
            let img = this.publicSentimentLegendData[1].img
            addLocationEntity(location, policeForceCount, img, 35, 35)
          }
          if (reportedRescueCount === null && policeForceCount === null) {
            return;
          }
        });
      }
    },

    updateEarthQuakeCenter(data) {
      // 添加到 Cesium 实体
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(data.geom.coordinates[0], data.geom.coordinates[1]),
        billboard: {
          image: earthQuakeCenterImg, // 图标
          width:40,
          height:40,
          eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10000.0) // 设置图标偏移，让其显示在最上层
        }
      });
    },

    //--------------------------------------------------下面是创建echarts的方法------------------------------------------

    updateMultipleECharts(data) {
      const locations = this.locations;
      const config = this.echartsConfigMap[this.selectedComponentKey];

      if (!config) return; // 若没有配置，跳过

      // 将 data 转换为 Map 以提高查找效率
      const districtMap = new Map(data.map(district => [district[config.locationKey], district]));

      // 这里是将echarts的xAxis的数据和颜色对应上，不会出现x轴和颜色不对应的问题
      let colorMapping = {};
      let categories = [];
      let chartType = ''
      const legend = this.echartsLegendData.find(legend => legend.name === config.legendName);
      if (legend) {
        chartType = legend.chartType;
        legend.data.forEach(item => {
          colorMapping[item.name] = item.color;
          categories.push(item.name);
        });
      }

      //循环遍历，生成图表
      locations.forEach((location, index) => {
        const chartContainer = this.$refs.echartsContainer[index];
        let chartInstance = this.echartsInstances[index];

        // 销毁旧的 ECharts 实例，避免重复渲染
        if (chartInstance) chartInstance.dispose();
        chartInstance = echarts.init(chartContainer);
        this.echartsInstances[index] = chartInstance;

        // 检查是否存在对应地区数据，如果不存在，则不在该区域生成图表
        const districtInfo = districtMap.get(location.name);
        if (!districtInfo) {
          chartInstance.clear();
          return;
        }

        // 获取值并进行过滤
        //确保只保留大于 0 的有效值,当有数据为0时，删除对应的echarts里的柱子
        const values = config.dataKeys.map(key => districtInfo[key] || 0);
        const filteredValues = [];
        const filteredCategories = [];
        categories.forEach((category, index) => {
          if (values[index] > 0) {
            filteredValues.push(values[index]);
            filteredCategories.push(category);
          }
        });

        // 如果该区域数据全部为0，清空图表
        if (filteredValues.length === 0) {
          chartInstance.clear();
          return;
        }

        // 更新图表
        this.updateChart(chartInstance, filteredValues, filteredCategories, colorMapping, config.labels, chartType);
      });

      // 添加 Cesium 场景的 postRender 事件
      if (!this.isPostRenderAdded) {
        this.viewer.scene.postRender.addEventListener(this.syncEChartsWithCesium);
        this.isPostRenderAdded = true;
      }
    },

    // 更新图表
    updateChart(chartInstance, values, categories, colorMapping, labelText, chartType = 'bar') {
      const isBarChart = chartType === 'bar';

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const index = params.dataIndex;
            const displayLabelText = Array.isArray(labelText) ? labelText[index] : labelText;
            return `<div style="font-size: 14px; background-color: rgba(255, 255, 255, 0.95);
                    border: 1px solid #ddd; border-radius: 4px; padding: 10px; width: auto;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    <strong style="color: #333;">${params.name}</strong><br/>
                    <div style="color: #555;"><span style="font-weight: bold;">${displayLabelText}:</span> ${params.value}</div></div>`;
          },
        },
        xAxis: isBarChart ? {
          type: 'category',
          data: categories,
          axisLabel: {show: false},
          axisLine: {show: false},
          axisTick: {show: false}
        } : null,
        yAxis: isBarChart ? {
          show: false,
          type: 'value',
          splitLine: {show: false},
          axisLine: {show: false},
          axisTick: {show: false}
        } : null,
        series: [
          {
            name: '数据类型',
            type: isBarChart ? 'bar' : 'pie',
            data: isBarChart
                ? values
                : values.map((value, i) => ({value, name: categories[i]})),
            itemStyle: {
              color: (params) => colorMapping[params.name] || '#ccc',
            },
            label: {
              show: true,
              position: 'inside',
              formatter: '{c}',  // 显示数值
              color: '#fff',
              fontSize: 12,
            },
            barCategoryGap: isBarChart ? '0%' : undefined,
            barWidth: isBarChart ? '100%' : undefined,
            radius: isBarChart ? undefined : '50%', // 设置为全圆饼图，没有空心区域
          },
        ],
      };

      chartInstance.setOption(option);
    },


    // 同步 ECharts 图表与 Cesium 地图，以保持图表与地图同步
    syncEChartsWithCesium() {
      const chartContainers = this.$refs.echartsContainer;  // 减少 DOM 查询
      if (!chartContainers) {
        console.warn('ECharts containers are not available');
        return;
      }
      //这里一个很重要的一点，requestAnimationFrame 会让echarts跟随地图动的时候不能完全贴合地图动
      //就是会让用户感觉echarts移动的总是慢一拍
      //如果想要更贴合地图
      //可以改为下面注释的syncEChartsWithCesium代码
      requestAnimationFrame(() => {
        // requestAnimationFrame 使得浏览器能够在下一个重绘前执行 JavaScript 代码，这样可以减少计算和渲染的开销，优化性能。
        const locations = this.locations;  // 使用局部变量减少对象查找

        locations.forEach(({longitude, latitude}, index) => {
          const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
          const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(position);

          if (Cesium.defined(canvasPosition)) {
            const chartContainer = chartContainers[index];
            if (chartContainer) {
              chartContainer.style.left = `${canvasPosition.x - chartContainer.offsetWidth / 2}px`;
              chartContainer.style.top = `${canvasPosition.y - chartContainer.offsetHeight / 2}px`;
            }
          }
        });
      });
    },

    //-------------------------------下面是地图 区块边界线 和 地域标签 以及 板块颜色 的设置---------------------------------

    // 设置区块颜色的方法
    updateDistrictColors(dataSource, districtData) {
      if (districtData) {
        const config = this.districtColorsConfigMap[this.selectedComponentKey];
        if (!config) return; // 若没有配置，跳过
        const legend = this.districtColorsLegendData.find(legend => legend.name === config.legendName);

        // 遍历后端传回的数据，判断并更新区块颜色
        dataSource.entities.values.forEach(entity => {
          const districtName = entity.name;
          const districtInfo = districtData.find(d => d[config.locationKey] === districtName);

          // 如果没有找到对应的数据，则将 affectedCount 设为 0
          const affectedCount = districtInfo ? districtInfo[config.dataKey] : 0;

          // 根据数量范围匹配相应的颜色
          const legendItem = legend.data.find(item =>
              affectedCount >= item.range[0] && affectedCount <= item.range[1]
          );

          if (legendItem) {
            const color = Cesium.Color.fromCssColorString(legendItem.color).withAlpha(0.8);
            // 更新区块的填充颜色
            entity.polygon.material = new Cesium.ColorMaterialProperty(color);
          }
        });
      } else if (this.selectedComponentKey === 'BuildingDamageInformation' || this.selectedComponentKey === 'SecondaryDisaster' || this.selectedComponentKey === 'MaterialDonation' || this.selectedComponentKey === 'ResourceStrength' || this.selectedComponentKey === 'PublicSentiment') {
        const colors = [
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
          {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
          {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
          {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
          {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
          {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
          {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
          {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
        ];
        // 遍历数据源的实体，根据名字设置颜色
        dataSource.entities.values.forEach(entity => {
          const entityName = entity.name;
          const colorEntry = colors.find(color => color.name === entityName);

          if (colorEntry) {
            // 更新区块的填充颜色
            entity.polygon.material = new Cesium.ColorMaterialProperty(colorEntry.color);
          }
        });
      } else {
        // 如果没有数据，设置默认颜色
        const defaultColor = Cesium.Color.fromCssColorString('#ffb3b3').withAlpha(0.6);
        dataSource.entities.values.forEach(entity => {
          entity.polygon.material = new Cesium.ColorMaterialProperty(defaultColor);
        });
      }
    },

    // 加载雅安的边界线并设置视角
    loadYaAnBoundary() {
      Cesium.GeoJsonDataSource.load(yaan, {
        stroke: Cesium.Color.RED,  // 边界线颜色
        strokeWidth: 2,            // 边界线宽度
        fill: Cesium.Color.RED.withAlpha(0.1)  // 区域填充颜色（默认）
      }).then(dataSource => {
        // 将 dataSource 存储到组件的实例中，方便其他方法调用
        this.dataSource = dataSource;

        // 将数据源添加到viewer中
        this.viewer.dataSources.add(dataSource);

        // 将视角定位到雅安市的坐标
        this.viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(102.62, 29.895, 360000),
          orientation: {
            heading: 0,
            pitch: -Cesium.Math.PI_OVER_TWO,  // 垂直视角
            roll: 0
          }
        });

        // 为每个区块添加红色边界线
        this.addBoundaryLines(dataSource);

      }).catch(error => {
        console.error('加载 GeoJSON 时出错：', error);  // 捕获并显示错误信息
      });
    },

    // 添加边界线的方法
    addBoundaryLines(dataSource) {
      // 为每个区块添加红色边界线
      dataSource.entities.values.forEach(entity => {
        if (entity.polygon) {
          const positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
          entity.polyline = {
            positions: positions,
            width: 1,
            material: Cesium.Color.RED  // 边界线颜色
          };
        }
      });
    },

    // 添加区县标签的方法
    addDistrictLabels(dataSource) {
      // 定义各个区县的坐标（手动调整）
      const districtNames = {
        '雨城区': {lon: 103.04, lat: 29.74},
        '名山区': {lon: 103.19, lat: 30.05},
        '荥经县': {lon: 102.80, lat: 29.57},
        '汉源县': {lon: 102.70, lat: 29.25},
        '石棉县': {lon: 102.34, lat: 28.99},
        '天全县': {lon: 102.50, lat: 29.95},
        '芦山县': {lon: 102.98, lat: 30.25},
        '宝兴县': {lon: 102.75, lat: 30.4}
      };

      // 添加各区县的名称标签
      Object.keys(districtNames).forEach(district => {
        const {lon, lat} = districtNames[district];
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat),
          label: {
            text: district,
            font: '18px Helvetica',
            fillColor: Cesium.Color.WHITE,  // 字体颜色
            outlineWidth: 4,  // 较宽的外边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 填充文字并加上轮廓
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 标签在位置上方显示
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,  // 标签贴地显示
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000) // 确保标签浮在最上面
          }
        });
      });
    },

    //--------------------------------------------------下面是导出图片用的方法--------------------------------------------

    //导出图片：简单来讲就是分别获取一下对应的元素，把对应的元素绘制到合成Canvas上，最后把Canvas转换成图片，实现截图。
    async exportCesiumScene() {
      // 开始导出时，显示加载动画
      this.loading = true;

      //  1: 禁用 Cesium 相机和 ECharts 图表的交互功能，防止用户在导出时误操作
      const cameraController = this.viewer.scene.screenSpaceCameraController;
      cameraController.enableRotate = false;
      cameraController.enableZoom = false;
      cameraController.enableTranslate = false;

      this.$refs.echartsContainer.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) {
          chart.setOption({
            tooltip: {show: false},
            brush: {toolbox: []},
            silent: true  // 禁用交互
          });
        }
      });

      //  2: 获取地图当前视野范围的经纬度，并加载经纬度线
      this.getLatLonBounds();  // 获取当前视野经纬度范围
      this.addLatLonLines();   // 添加经纬度线
      await this.waitForEntitiesToRender(this.latLonEntities.length);  // 等待经纬度线渲染完成

      try {
        //  3: 等待 Cesium 渲染完成并请求重新渲染
        await this.waitForCesiumRender();
        this.viewer.scene.requestRender();

        //  4: 获取 Cesium 场景的 Canvas 图像
        const cesiumCanvas = this.viewer.scene.canvas;
        const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片

        //  5-7: 分别渲染图例、距离标尺和指南针
        const legendCanvas = await this.renderElementToCanvas('.noteContainer', '图例');
        const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
        const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');

        //  8: 创建一个新的合成 Canvas
        const finalCanvas = this.createFinalCanvas();
        const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

        //  9: 将 Cesium 场景绘制到合成 Canvas 上
        await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);

        //  10-12: 分别绘制图例、距离标尺和指南针到合成 Canvas 上

        // 计算 legendCanvas 的右下角位置，设置 10px 的边距
        const x = finalCanvas.width - legendCanvas.width - 10; // 计算右侧位置
        const y = finalCanvas.height - legendCanvas.height - 10; // 计算底部位置

        // 绘制 legendCanvas 到合成 Canvas 的右下角
        finalContext.drawImage(legendCanvas, x, y);
        finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
        finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);

        // 13: 渲染并绘制所有 ECharts 图表
        const echartsImages = await this.renderAllECharts();
        echartsImages.forEach((img, index) => {
          const container = this.$refs.echartsContainer[index];
          finalContext.drawImage(img, container.offsetLeft, container.offsetTop);  // 绘制 ECharts 图表
        });

        //  14: 将合成后的 Canvas 转换为图片
        this.previewImage = finalCanvas.toDataURL('image/png');

      } catch (error) {
        console.error('导出场景失败:', error);
      } finally {
        this.setPictureCreateTime()
        //  15: 恢复 Cesium 相机交互，并移除经纬度线
        cameraController.enableRotate = true;
        cameraController.enableZoom = true;
        cameraController.enableTranslate = true;


        this.$refs.echartsContainer.forEach(container => {
          const chart = echarts.getInstanceByDom(container);
          if (chart) {
            chart.setOption({
              tooltip: {show: true},
              brush: {toolbox: []},
              silent: false  // 禁用交互
            });
          }
        });
        this.latLonEntities.forEach(entity => {
          this.viewer.entities.remove(entity);  // 移除经纬度线
        });
        this.latLonEntities = [];

        // 分别处理四条边的数据
        const topData = {};
        const sideData = {};
        const bottomData = {};

        // 生成点数据
        this.generatePointsWithPercentage(this.corners.topStart, this.corners.topEnd, topData);
        this.generatePointsWithPercentage(this.corners.leftStart, this.corners.leftEnd, sideData);
        this.generatePointsWithPercentage(this.corners.bottomStart, this.corners.bottomEnd, bottomData);

        // 等待 DOM 渲染完成
        await nextTick();
        // 添加盒子
        const topContainer = document.querySelector('.top');
        const bottomContainer = document.querySelector('.bottom');
        const leftContainer = document.querySelector('.left');
        const rightContainer = document.querySelector('.right');
        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [topContainer].forEach(container => this.addBoxes(container, 'div_t', topData));
        // 为 leftContainer 和 rightContainer 生成盒子（反转顺序，从下往上显示）
        [leftContainer, rightContainer].forEach(container => this.addBoxes(container, 'div_l', sideData, true));
        // 为 topContainer 和 bottomContainer 生成盒子（保持默认顺序）
        [bottomContainer].forEach(container => this.addBoxes(container, 'div_t', bottomData));
        this.loading = false;
      }
    },

    // 将元素渲染为 Canvas
    async renderElementToCanvas(selector, elementName) {
      const element = document.querySelector(selector);
      return await html2canvas(element, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });
    },

    // 创建最终合成的 Canvas
    createFinalCanvas() {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#exportContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#exportContainer').offsetHeight;
      return finalCanvas;
    },

    // 将图像绘制到 Canvas 上
    async drawImageToCanvas(context, imageSrc, x, y) {
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => img.onload = resolve);
      context.drawImage(img, x, y);
    },

    //将当前页面上所有的 ECharts 图表转换为图片，以便在后续的图像合成过程中使用。
    async renderAllECharts() {
      const echartsCanvases = [];

      this.$refs.echartsContainer.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) {
          // 使用 getDataURL 获取图表的图片数据
          const imageDataURL = chart.getDataURL({
            type: 'png',
            pixelRatio: 1,  // 可根据需求调整分辨率
            backgroundColor: 'transparent',
          });

          // 创建一个新的 Image 对象来加载 imageDataURL
          const img = new Image();
          img.src = imageDataURL;

          echartsCanvases.push(
              new Promise((resolve) => {
                img.onload = () => resolve(img);
              })
          );
        }
      });

      // 返回所有 ECharts 图表的图片
      return Promise.all(echartsCanvases);
    },

    // 等待 Cesium 渲染完成
    waitForCesiumRender() {
      return new Promise(resolve => {
        const scene = this.viewer.scene;
        const removeListener = scene.postRender.addEventListener(() => {
          removeListener();
          setTimeout(resolve, 500);  // 增加等待时间确保渲染完成
        });
        scene.requestRender();
      });
    },

    // 设置图片创建时间
    setPictureCreateTime() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份从0开始，需要加1
      const day = date.getDate();

      // 格式化日期为 YYYY年MM月DD日
      this.pictureCreateTime = `${year}年${month}月${day}日`;
    },

    // 下载图片
    downloadImage() {
      // 获取要截取的 DOM 元素
      const elementToCapture = document.querySelector('.export-image');

      // 使用 html2canvas 截图
      html2canvas(elementToCapture, {
        useCORS: true, // 允许跨域请求，确保图片加载
        logging: true, // 打开日志以查看可能的错误
        scale: 2, // 提高图像质量
        backgroundColor: null // 使背景透明
      }).then(canvas => {
        // 将 canvas 转换为图片
        const finalImage = canvas.toDataURL('image/png');

        // 创建下载链接并触发下载
        const link = document.createElement('a');
        link.download = `${this.exportTitle}.png`; // 设置下载文件名
        link.href = finalImage; // 设置图片来源
        link.click(); // 触发下载
      }).catch(error => {
        console.error('Error capturing the screenshot:', error);
      });
    },

    // 关闭预览窗口
    closePreview() {
      this.previewImage = null;
    },

    // 等待所有经纬度线实体完成渲染，并确保 Cesium 渲染循环完成
    waitForEntitiesToRender(entityCount) {
      return new Promise(resolve => {
        const scene = this.viewer.scene;

        // 监听渲染循环是否完成
        const checkEntitiesRendered = () => {
          const isRendered = this.latLonEntities.filter(entity => entity.show).length === entityCount;
          if (isRendered) {
            // 等待 Cesium 完成渲染
            const removePostRender = scene.postRender.addEventListener(() => {
              removePostRender(); // 确保只监听一次
              resolve();          // 确保渲染完成后再 resolve
            });
          } else {
            setTimeout(checkEntitiesRendered, 100); // 每100ms检查一次
          }
        };

        checkEntitiesRendered();
      });
    },

    // 添加经纬度线到 Cesium 场景
    addLatLonLines() {
      const viewer = this.viewer;
      const alpha = 0.7; // 白色透明度

      // 添加经度或纬度线所用的函数
      const addLines = (start, end, constantCoord, isLongitude) => {
        //start 和 end：表示线段的起始和结束位置。对于经度线，start 和 end 是经度的范围；对于纬度线，是纬度的范围。
        for (let coord = start; coord <= end; coord += this.step) {
          const positions = [];

          // 根据是否是经度线，调整另一个坐标的范围
          //isLongitude：指示当前绘制的是经度线（true）还是纬度线（false）。
          for (let varCoord = isLongitude ? this.rectangleBounds[2] : this.rectangleBounds[0];
               varCoord <= (isLongitude ? this.rectangleBounds[3] : this.rectangleBounds[1]);
               varCoord += this.step) {
            if (isLongitude) {
              positions.push(Cesium.Cartesian3.fromDegrees(coord, varCoord)); // 经度线：lon 固定，lat 变化
            } else {
              positions.push(Cesium.Cartesian3.fromDegrees(varCoord, coord)); // 纬度线：lat 固定，lon 变化
            }
          }

          const entity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 1,
              material: Cesium.Color.WHITE.withAlpha(alpha),  // 白色透明度稍高
              clampToGround: true
            }
          });
          this.latLonEntities.push(entity); // 将实体存储到数组中
        }
      };
      // 添加经度线
      addLines(this.rectangleBounds[0], this.rectangleBounds[1], 'longitude', true);
      // 添加纬度线
      addLines(this.rectangleBounds[2], this.rectangleBounds[3], 'latitude', false);
    },

    // 获取地图当前视野范围的最东、最西、最南、最北的经纬度，用于经纬度线的绘制
    getLatLonBounds() {
      const viewer = this.viewer;
      const scene = viewer.scene;
      const canvas = scene.canvas;

      const cameraHeight = this.viewer.camera.positionCartographic.height;
      if (cameraHeight >= 550000) {
        this.step = 2;
      } else if (cameraHeight >= 350000 && cameraHeight < 550000) {
        this.step = 0.7;
      } else if (cameraHeight >= 200000 && cameraHeight < 350000) {
        this.step = 0.5;
      } else if (cameraHeight >= 150000 && cameraHeight < 200000) {
        this.step = 0.4;
      } else if (cameraHeight >= 100000 && cameraHeight < 150000) {
        this.step = 0.3;
      } else if (cameraHeight >= 50000 && cameraHeight < 100000) {
        this.step = 0.2;
      } else if (cameraHeight >= 25000 && cameraHeight < 50000) {
        this.step = 0.1;
      } else if (cameraHeight >= 10000 && cameraHeight < 25000) {
        this.step = 0.05;
      } else if (cameraHeight >= 6000 && cameraHeight < 10000) {
        this.step = 0.02;
      } else if (cameraHeight >= 1500 && cameraHeight < 6000) {
        this.step = 0.01;
      } else if (cameraHeight >= 0 && cameraHeight < 1500) {
        this.step = 0.005;
      }

      // 获取四个角的屏幕坐标
      const topLeft = new Cesium.Cartesian2(0, 0);
      const topRight = new Cesium.Cartesian2(canvas.width, 0);
      const bottomLeft = new Cesium.Cartesian2(0, canvas.height);
      const bottomRight = new Cesium.Cartesian2(canvas.width, canvas.height);

      // 将屏幕坐标转换为地球坐标
      const topLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topLeft));
      const topRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topRight));
      const bottomLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomLeft));
      const bottomRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomRight));

      // 用于生成盒子的参数
      this.corners = {
        topStart: Cesium.Math.toDegrees(topLeftCartographic.longitude),
        topEnd: Cesium.Math.toDegrees(topRightCartographic.longitude),
        leftStart: Cesium.Math.toDegrees(bottomLeftCartographic.latitude),
        leftEnd: Cesium.Math.toDegrees(topLeftCartographic.latitude),
        bottomStart: Cesium.Math.toDegrees(bottomLeftCartographic.longitude),
        bottomEnd: Cesium.Math.toDegrees(bottomRightCartographic.longitude)
      };


      this.rectangleBounds[0] = Math.ceil(this.corners.topStart / this.step) * this.step - this.step;
      this.rectangleBounds[1] = Math.floor(this.corners.topEnd / this.step) * this.step + 2 * this.step;
      this.rectangleBounds[2] = Math.ceil(this.corners.leftStart / this.step) * this.step - this.step;
      this.rectangleBounds[3] = Math.floor(this.corners.leftEnd / this.step) * this.step + 2 * this.step;
    },

    // 生成点和百分比，传入不同的标识符，避免共享同一数据集
    generatePointsWithPercentage(start, end, dataContext) {
      dataContext.points = [];
      dataContext.flexPercentages = [];

      const adjustedStart = Math.ceil(start / this.step) * this.step;
      const adjustedEnd = Math.floor(end / this.step) * this.step;

      // 生成点
      for (let current = adjustedStart; current <= adjustedEnd; current += this.step) {
        const roundedPoint = Number(current.toFixed(3)); // 处理浮点精度问题
        if (!dataContext.points.includes(roundedPoint)) { // 确保唯一性
          dataContext.points.push(roundedPoint);
        }
      }

      // 如果最后一个点不等于 adjustedEnd，手动添加 adjustedEnd
      if (dataContext.points[dataContext.points.length - 1] !== adjustedEnd) {
        const roundedEnd = Number(adjustedEnd.toFixed(2));
        if (!dataContext.points.includes(roundedEnd)) { // 检查是否重复
          dataContext.points.push(roundedEnd);
        }
      }

      const basePercentage = (this.step / (end - start)) * 100;
      dataContext.divBoxCount = dataContext.points.length;
      dataContext.flexPercentages = Array(dataContext.divBoxCount).fill(basePercentage);
      this.calculateCustomValues(
          dataContext.points[0],
          dataContext.points[dataContext.points.length - 1],
          start,
          end,
          dataContext
      );
    },

    // 计算自定义值并保存到特定的数据上下文
    calculateCustomValues(firstPoint, lastPoint, start, end, dataContext) {
      const halfStep = this.step / 2;
      const number1 = end - start;

      const diffFirst = firstPoint - start;
      if (diffFirst > halfStep) {
        const percentageFirst = ((firstPoint - start - halfStep) / number1) * 100;
        dataContext.flexPercentages.unshift(percentageFirst);
        dataContext.points.unshift('');
      } else if (diffFirst < halfStep) {
        const percentage1 = (2 * (firstPoint - start) / number1) * 100;
        const percentage2 = ((halfStep - (firstPoint - start)) / number1) * 100;
        dataContext.flexPercentages.unshift(percentage1);
        dataContext.flexPercentages[1] = percentage2;
        dataContext.points.splice(1, 0, '');
      }

      const diffLast = end - lastPoint;
      if (diffLast > halfStep) {
        const percentageLast = ((end - lastPoint - halfStep) / number1) * 100;
        dataContext.flexPercentages.push(percentageLast);
        dataContext.points.push('');
      } else if (diffLast < halfStep) {
        const percentage1 = ((halfStep - (end - lastPoint)) / number1) * 100;
        const percentage2 = (2 * (end - lastPoint) / number1) * 100;
        dataContext.flexPercentages[dataContext.flexPercentages.length - 1] = percentage1;
        dataContext.flexPercentages.push(percentage2);
        dataContext.points.splice(-1, 0, '');
      }

      dataContext.divBoxCount = dataContext.points.length;
    },

    //动态添加盒子方法
    addBoxes(container, prefix, dataContext, reverse = false) {
      if (!container) return;
      let points = dataContext.points;
      let flexPercentages = dataContext.flexPercentages;

      // 如果需要反转顺序
      if (reverse) {
        points = [...points].reverse();
        flexPercentages = [...flexPercentages].reverse();
      }
      Array.from({length: dataContext.divBoxCount}).forEach((_, i) => {
        const box = document.createElement('div');
        box.className = `${prefix}${i}`;
        // 只对有效的数值进行转换
        if (points[i]) {
          // box.textContent = points[i]
          box.textContent = this.convertToDMS(points[i], reverse);  // 转换为度分秒格式
        } else {
          box.textContent = '';  // 保留空值
        }
        container.appendChild(box);

        // 设置盒子样式
        const boxStyles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black',
          width: '19.47px',
          height: '19.47px',
          fontSize: '10px',
          flex: flexPercentages[i], // 使用反转后的 flexPercentages
          whiteSpace: 'nowrap', // 防止文字换行
        };

        // 如果 reverse 为 true，才旋转 90 度
        if (reverse) {
          boxStyles.transform = 'rotate(-90deg)';
        }

        // 应用样式
        Object.assign(box.style, boxStyles);
      });
    },

    // 将浮点数转换为度分秒格式
    convertToDMS(point, reverse) {
      const absolute = Math.abs(point);
      const degrees = Math.floor(absolute);  // 整数部分为度
      const minutes = Math.floor((absolute - degrees) * 60);  // 小数部分乘以 60 得到分
      const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);  // 小数部分乘以 60 再得到秒

      let direction;

      if (reverse) {
        // 只考虑南北方向
        direction = point >= 0 ? '北' : '南';
      } else {
        // 只考虑东西方向
        direction = point >= 0 ? '东' : '西';
      }

      return `${degrees}°${minutes}'${seconds}"${direction}`;
    },

    //--------------------------------------------------下面是灾情专题图代码部分------------------------------------------

    // 获取灾情专题图的接口
    outputData(value) {
      this.eqid = value;
      this.eqqueueId = this.eqid+'01';
      handleOutputData(this.eqid, this.eqqueueId, null, 'thematicMap').then((res) => {
        console.log(res)
        this.thematicMapitems = res.themeData
        console.log("专题图：")
        console.log(this.thematicMapitems)
      })
      // handleOutputData(this.eqid, this.eqqueueId, null, 'report').then((res) => {
      //   this.reportItems = res.themeData
      //   console.log("报告：", this.reportItems)
      // })
    },

    // 打开展示用户选择的灾情专题图的组件页面，传值
    showThematicMapDialog(item) {
      console.log("专题图item-> ", item)
      // 显示专题图弹框逻辑
      this.ifShowMapPreview = true;
      this.imgName = item.theme;
      this.imgshowURL = item.imgUrl;
    },

    // 专题图弹框逻辑防止无数据报错
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview = val;
      if (!val) {
        this.imgName = "";
        this.imgshowURL = "";
      }
    }
  }
};
</script>

<style scoped>

.noteContainer {
  position: absolute;
  padding: 5px;
  border-radius: 5px;
  bottom: 10px; /* 固定在底部 */
  right: 10px; /* 固定在右侧 */
  width: auto; /* 宽度自适应内容 */
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.export-button {
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 20; /* 确保按钮显示在最前面 */
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  cursor: pointer;
}

.export-button:hover {
  background-color: #2980b9;

}

.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
}

.listContainer {
  position: absolute;
  top: 20px;
  left: 230px;
}

.legend_item {
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 5px;
  color: white;
}

.legend_item1 {
  width: 100%;
//height: 26px;
  display: flex;
  align-items: center;
  font-size: 16px;
//margin-bottom: 5px;
  color: white;
}

.echarts-container {
  position: absolute;
  width: 90px;
  height: 90px;
  pointer-events: auto; /* 允许鼠标事件 */
  background-color: transparent;
}

.block {
  display: inline-block;
  width: 30%;
  height: 20px;
  margin-right: 7px;
}

.mainImage {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}


.situation_cesiumContainer {
  height: 100vh  !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.compassContainer {
  position: absolute;
  top: 35px; /* 距离顶部的像素 */
  right: 20px; /* 距离右侧的像素 */
  height: 120px;
  width: 140px;
  background: url(@/assets/compass.png) no-repeat center / cover;
  z-index: 20;
  transform-origin: center; /* 设置旋转中心 */
  transition: transform 0.5s; /* 动画效果 */
}

.markCollection span {
  margin: 5px;
  width: 30px;
  height: 30px;
}

.markCollection span:hover {
  cursor: pointer;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  display: none !important;
}

.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  max-width: 100%;
  vertical-align: top;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}


.download-button:hover,
.cancel-button:hover {
  background-color: #2980b9;
}

/* 确保按钮显示在图片的下方正中央 */
.preview-buttons {
  justify-content: center;
  margin-top: 10px;
}

.export-info {
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
}

.img_outbox {
  border: 3px solid black;
  padding: 20px;
}


.main_coantainer {
  border: 3px solid black;
  background-color: white;
}

.top_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.middow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  width: 19.47px;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

/* 自定义缩放控件容器 */
.zoomContainer {
  position: absolute;
  top: 30%; /* 中间对齐 */
  right: 20px; /* 紧贴地图右侧 */
  transform: translateY(-50%); /* 纵向居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px; /* 控制按钮间距 */
}

/* 缩放按钮样式 */
.zoomIn, .zoomOut {
  width: 20px; /* 按钮尺增寸加，视觉更舒适 */
  height: 20px;
  text-align: center;
  border: 0.5px solid rgba(240, 240, 240, 0.3); /* 非常细，柔和的边框 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* 更平滑的阴影 */
}

/* 图标样式 */
.zoomIn i, .zoomOut i {
  font-size: 20px; /* 字体稍微加大 */
  font-width: bold;
  color: #ffffff;  /* 灰色文字 */
}

.superMap {
  position: absolute;
  top: 20px;
  left: 120px;
  z-index: 20; /* 确保按钮显示在最前面 */
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  cursor: pointer;
}

.superMap:hover {
  background-color: #2980b9;
}
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-item {
  width: calc(100% - 7px);
}

.dialog-close {
  cursor: pointer;
  font-size: 24px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 items per row */
  gap: 16px; /* Adjust the gap between items */
  width: 100%; /* Ensure the container takes full width */
  height: 100%; /* Ensure the container takes full height */

}

.grid-item {
  position: relative;
  width: 100%;
  padding-top: 100%; /* This ensures the items are square (aspect ratio 1:1) */
}
.grid-small{
  width: 100%;
  height: 50%;
  overflow: hidden;
  background-color: transparent; /* 去掉白底 */;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片显示完整 */
  border-radius: 5px;
}

.item-info {
  padding: 8px;
  text-align: center;
  background-color: transparent; /* 去掉白底 */
  border: none; /* 去掉边框 */
}

.item-title {
  font-size: 14px;
  font-weight: bold;
  background-color: transparent; /* 去掉白底 */
  margin-bottom: 30px;
  margin-top: -10px;

}
.dialog-content {
  background-color: rgba(255, 255, 255, 0.7);
  width: 80%;
  max-width: 1000px;
  height: 80%;
  border-radius: 8px;
  overflow: hidden; /* 关键：避免外部滚动条 */
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: bold;
  /*background-color: rgba(255, 255, 255, 0.8); !* 可选：半透明背景 *!*/
  border-bottom: 2px solid #ccc;
}

.dialog-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}



</style>
