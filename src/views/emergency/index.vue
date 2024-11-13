<template>
  <div id="cesiumContainer">
    <RouterPanel
        :visible="popupVisible"
        :position="popupPosition"
        :popupData="popupData"
    />
    <div id="supplies" :class="{ collapsed: !tableVisible }" style="width: 93.5%;">
      <el-form class="eqTable">
        <div style="margin-bottom: 10px; padding: 10px; width: 100.6%;">
          <el-menu
              :default-active="activeMenuIndex"
              v-model="activeMenuIndex"
              class="el-menu-demo"
              mode="horizontal"
              background-color="#293038"
              text-color="#fff"
              active-text-color="#409eff"
          >
            <el-sub-menu index="1" >
              <template #title>路径规划</template>
              <el-menu-item index="1-1" @click="route">路径规划</el-menu-item>
              <el-menu-item index="1-2" @click="addArea">添加障碍区域</el-menu-item>
              <el-menu-item index="1-3" @click="removeAll">清空所有实体</el-menu-item>
              <el-menu-item index="1-3" @click="removePoint">删除障碍区域</el-menu-item>
              <el-menu-item index="1-3" @click="removePolyline">删除路径规划</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2" >
              <template #title>救援力量匹配</template>
              <el-menu-item index="2-1" @click="addDisasterPoint">添加受灾点</el-menu-item>
              <el-menu-item index="2-2" @click="searchSupplyDialog = true">物资查询</el-menu-item>
              <el-menu-item index="2-3" @click="searchEmergencyTeamDialog = true">救援力量查询</el-menu-item>
              <el-menu-item index="2-4" @click="marchSupply">物资匹配</el-menu-item>
              <el-menu-item index="2-5" @click="marchRegionsDialog = true">行政区划匹配</el-menu-item>
              <el-menu-item index="2-6" @click="searchSuppliesByRadius">半径查询</el-menu-item>
              <el-menu-item index="2-7" @click="showAllSupplyPoints">{{ showSupply }}</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="3" style="width: 140px;" @click="changeDataList('supplies')">救援物资</el-menu-item>
            <el-menu-item index="4" style="width: 140px;" @click="changeDataList('emergencyTeam')">救援力量</el-menu-item>
            <el-menu-item index="5" style="width: 140px;" @click="changeDataList('reserves')">救灾装备</el-menu-item>
            <el-menu-item index="6" style="width: 140px;" @click="toggleTable">{{ toolValue }}</el-menu-item>
          </el-menu>
        </div>
        <!--     数据列表     -->
        <el-table
            v-if="tableVisible"
            :data="showSuppliesList"
            style="width: 100%; margin-bottom: 5px; text-align: center"
            :stripe="true"
            :header-cell-style="tableHeaderColor"
            :cell-style="tableColor"
            :row-style="{ height: '40px' }"
            @row-click="showSupplyPoint"
        >
          <!--      救援物资      -->
          <el-table-column
              v-if="listField === 'supplies'"
              v-for="column in listFieldsOfSupplies"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              show-overflow-tooltip
          ></el-table-column>
          <!--      救援力量      -->
          <el-table-column
              v-if="listField === 'emergencyTeam'"
              v-for="column in listFieldOfEmergencyTeam"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              show-overflow-tooltip
          ></el-table-column>
          <!--      救灾装备      -->
          <el-table-column
              v-if="listField === 'reserves'"
              v-for="column in listFieldOfReserves"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              show-overflow-tooltip
          ></el-table-column>
        </el-table>
        <el-pagination
            v-if="tableVisible"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="total"
            class="pagination1"
            style="padding: 10px"
        >
        </el-pagination>
        <!--     数据列表end     -->
      </el-form>
    </div>


    <div class="navbar">
      <h2 class="zhts-title">
        <div class="logo">
          <svg t="1731159698197" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4760" width="32" height="32">
            <path d="M749.888 501.952v34.368a150.464 150.464 0 0 1 133.76 149.504v150.464l30.08 40.128a16.704 16.704 0 0 1-13.44 26.752h-85.248a83.584 83.584 0 0 1-163.84 0H566.016a16.704 16.704 0 0 1-13.312-26.752l30.08-40.128v-150.4c0-77.44 58.496-141.248 133.76-149.568v-34.368h33.408z m-235.52-448a64 64 0 0 1 45.696 19.2l232.576 237.056a64 64 0 0 1 18.304 44.8v114.944h-64V374.784h-256V117.952h-320v768h343.424v64h-343.68c-30.464 0-63.744-21.568-63.744-59.008V112.96c0-37.376 33.28-59.008 63.68-59.008h343.744z m249.664 840.192h-61.76a32.768 32.768 0 0 0 61.76 0z m-30.912-297.6c-51.328 0-92.928 41.664-92.928 92.992v134.976l-13.248 17.664h212.416l-13.312-17.664v-134.976c0-51.328-41.6-92.928-92.928-92.928z m-210.176-6.144v64h-256v-64h256z m0-152.448v64h-256v-64h256z m32-278.592v151.424h148.608L554.88 159.36z" fill="#ffffff" fill-opacity=".9" p-id="4761"></path>
          </svg>
          <span class="text">应急资源信息</span>
        </div>
      </h2>
      <div v-for="(menu, index) in menus" :key="index" class="menu-item" @mouseover="showDropdown(index)" @mouseleave="hideDropdown(index)">
        <div class="menu-label">
          <span v-if="menu.icon" v-html="menu.icon"></span>
          {{ menu.name }}
        </div>
        <div v-if="menu.showDropdown && menu.items.length > 0" class="dropdown">
          <div v-for="(item, subIndex) in menu.items" :key="subIndex" class="dropdown-item" @click="handleMenuAction(item.action)">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>



    <div
        v-if="showTips"
        id="supplies"
        :class="{ collapsed: !tableVisible }"
        style="margin-top: 450px; margin-left: 0%; width: 30%; overflow-y: auto; max-height: 180px;"
        @scroll="onScroll">
      <el-row>
        <el-button @click="walkStyle" :style="selectedWalk">步行</el-button>
        <el-button @click="driveStyle" :style="selectedDrive">驾驶</el-button>
      </el-row>
      <div slot="header" class="clearfix" style="color: white; margin-top: 5%;">
        <div>
          全程约 {{ totalRoute }} 米 {{ RouteWay }} 大概需要 {{ RouteTime }}
        </div>
        <div v-if="visibleGuilde">
          <div v-for="(instruction, index) in RouteGuilde" :key="index">
            {{ instruction }}
          </div>
          <div v-if="loading" class="loading">加载中...</div>
        </div>
      </div>
    </div>

    <!--   物资查询dialog   -->
    <el-dialog v-model="searchSupplyDialog" title="物资查询" width="500" class="marchSupply">
      <el-form :model="searchSupplyForm" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域">
              <el-input v-model="searchSupplyForm.county" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址">
              <el-input v-model="searchSupplyForm.address" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="searchSupplyForm.contactPerson" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="searchSupplyForm.contactPhone" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="searchSupplyDialog = false">取消</el-button>
          <el-button type="primary" @click="searchSupply">
            查询
          </el-button>
        </div>
      </template>

    </el-dialog>

    <!--   救援力量查询dialog   -->
    <el-dialog v-model="searchEmergencyTeamDialog" title="救援力量查询" width="200" class="marchSupply">
      <el-form :model="searchEmergencyTeamForm" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="级别名称">
              <el-input v-model="searchEmergencyTeamForm.levelName" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="队伍类型名称">
              <el-input v-model="searchEmergencyTeamForm.teamTypeName" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="队伍人数">
              <el-input
                  v-model="displayTeamTotalMembers"
                  @input="handleTeamTotalMembersInput"
                  autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址">
              <el-input v-model="searchEmergencyTeamForm.address" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input v-model="searchEmergencyTeamForm.personInCharge" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话">
              <el-input v-model="searchEmergencyTeamForm.chargePhone" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="searchEmergencyTeamDialog = false">取消</el-button>
          <el-button type="primary" @click="searchEmergencyTeam">
            查询
          </el-button>
        </div>
      </template>

    </el-dialog>

    <!--   物资匹配dialog   -->
    <el-dialog v-model="marchSupplyDialog" title="物资匹配" width="500" class="marchSupply">
      <el-form :model="searchSupplyForm" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="帐篷">
              <el-input
                  v-model="displayDisasterTentsCount"
                  @input="handleDisasterTentsInput"
                  placeholder="/件"
                  autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手电筒">
              <el-input
                  v-model="displayFlashlightsCount"
                  @input="handleFlashlightsInput"
                  placeholder="/件"
                  autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="雨衣">
              <el-input
                  v-model="displayRaincoatsCount"
                  @input="handleRaincoatsInput"
                  placeholder="/件"
                  autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="雨鞋">
              <el-input
                  v-model="displayRainBootsCount"
                  @input="handleRainBootsInput"
                  placeholder="/双"
                  autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="marchSupplyDialog = false">取消</el-button>
          <el-button type="primary" @click="marchSupplies">
            查询
          </el-button>
        </div>
      </template>

    </el-dialog>

    <!--   半径查询Dialog   -->
    <el-dialog v-model="searchSupplyByRadiusDialog" title="半径查询" width="400" class="marchSupply">
      <el-form :model="searchSupplyForm" label-width="80px">
        <el-form-item label="匹配半径">
          <el-input v-model="displayRadius"
                    @input="handleRadiusInput"
                    placeholder="请输入匹配的半径/km"
                    autocomplete="off"
                    style="width: 180px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="searchSupplyByRadiusDialog = false">取消</el-button>
          <el-button type="primary" @click="marchSuppliesByRadius">
            查询
          </el-button>
        </div>
      </template>

    </el-dialog>

    <el-dialog v-model="marchRegionsDialog" title="行政区划匹配" width="400" class="marchSupply">
      <div class="district-buttons">
        <div v-for="district in districts" :key="district.adcode"
             class="district-button" :class="{ 'selected': selectedRegions.includes(district) }">
          <el-button @click="selectRegions(district)">
            {{ district.name }}
          </el-button>
        </div>

      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="marchRegionsDialog = false">取消</el-button>
          <el-button type="primary" @click="handleDistrictClick">
            查询
          </el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Source/Widgets/widgets.css";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import RouterPanel from "@/components/Cesium/RouterPanel.vue";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import {getEmergency} from "@/api/system/emergency.js";
import emergencyRescueEquipmentLogo from "@/assets/images/EmergencyResourceInformation/emergencyRescueEquipmentLogo.png"; // 抢险救灾设备
import emergencyRescueEquipmentSmallLogo from "@/assets/images/EmergencyResourceInformation/emergencyRescueEquipmentSmallLogo.png"; // 抢险救灾设备
import disasterReliefSuppliesLogo from "@/assets/images/EmergencyResourceInformation/disasterReliefSuppliesLogo.jpg"; // 救灾物资储备
import disasterReliefSuppliesSmallLogo from "@/assets/images/EmergencyResourceInformation/disasterReliefSuppliesSmallLogo.png"; // 救灾物资储备
import rescueTeamsInfoLogo from "@/assets/images/EmergencyResourceInformation/rescueTeamsInfoLogo.png";
import rescueTeamsInfoSmallLogo from "@/assets/images/EmergencyResourceInformation/rescueTeamsInfoSmallLogo.png";
import start from "@/assets/start.svg";
import end from "@/assets/end.svg";
import {Entity} from "cesium";
import {getWay} from "@/api/system/routeplan.js";
import {walk} from "vue/compiler-sfc";
import {gcj02towgs84, wgs84togcj02} from "@/api/tool/wgs_gcj_encrypts.js";
import axios from "axios"
import yaan from "@/assets/geoJson/yaan.json";
import { ElMessageBox, ElMessage } from 'element-plus';
import {marchByRegion, searchEmergencyTeamData, searchMaterialData} from "../../api/system/emergency.js";

export default {
  components: {
    RouterPanel,
  },
  name: "index",
  data() {
    return {
      menus: [
        {
          name: '路径规划',
          icon: `<svg t="1731159828946" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5849" width="32" height="32"><path d="M521.092741 500.408889c0-139.994074-111.540148-253.458963-249.135408-253.458963S22.821926 360.414815 22.821926 500.408889a258.322963 258.322963 0 0 0 14.52563 85.366518c21.973333 62.677333 94.971259 168.571259 218.638222 317.805037 0.839111 0.96237 1.801481 1.92 2.763852 2.768593 8.884148 7.324444 21.968593 6.120296 29.174518-2.768593 123.543704-149.001481 196.304593-254.900148 218.396445-317.330963a255.454815 255.454815 0 0 0 14.772148-85.840592z m-249.135408 84.522667c-45.866667 0-83.086222-37.82163-83.086222-84.522667S226.090667 416 271.957333 416s83.081481 37.82637 83.081482 84.408889c-0.118519 46.701037-37.214815 84.522667-83.081482 84.522667z m432.474074-83.446519c0.602074 0.720593 1.208889 1.322667 1.801482 1.801482 5.883259 4.92563 14.767407 4.081778 19.693037-1.801482 83.081481-100.252444 132.062815-171.448889 146.958222-213.475556a173.302519 173.302519 0 0 0 9.841778-57.870222c0-94.132148-75.036444-170.491259-167.604148-170.491259-92.572444 0-167.604148 76.245333-167.604148 170.491259 0 19.569778 3.242667 39.021037 9.723259 57.391408 14.881185 42.145185 63.872 113.464889 147.190518 213.95437z m10.690371-328.25363c30.852741 0 55.826963 25.453037 55.826963 56.789334 0 31.454815-24.978963 56.907852-55.826963 56.907852-30.857481 0-55.831704-25.453037-55.831704-56.907852-0.004741-31.454815 24.969481-56.789333 55.831704-56.789334z m230.878815 515.915852c-75.278222-28.695704-166.888296-21.371259-200.026074-122.823111h-56.192s-28.340148 98.569481 230.528 174.212741c144.080593 49.943704-75.761778 263.186963-489.623704 112.497778l-48.507259 58.112s246.97837 116.100741 478.577777 32.298666 162.446222-224.881778 85.24326-254.298074z" fill="#ffffff"></path></svg>`,
          items:  [
            { name: '路径规划', action: 'route' },
            { name: '添加障碍区域', action: 'addArea' },
            { name: '清空所有实体', action: 'removeAll' },
            { name: '删除障碍区域', action: 'removePoint' },
            { name: '删除路径规划', action: 'removePolyline' }
          ],
          showDropdown: false,
        },
        {
          name: '救援力量匹配',
          icon: `<svg t="1731159977406" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9427" width="32" height="32"><path d="M811.292444 540.444444c89.429333 0 160.967111 70.826667 160.967112 159.345778 0 29.496889-8.931556 56.035556-23.836445 79.644445l63.658667 62.919111c5.973333 5.916444 11.918222 17.720889 11.918222 29.496889 0 20.679111-17.891556 38.371556-38.741333 38.371555-11.946667 0-20.878222-5.888-29.809778-11.804444l-63.687111-62.919111c-23.836444 14.762667-50.659556 23.608889-80.497778 23.608889-89.400889 0-160.938667-70.826667-160.938667-159.317334 0-88.519111 71.537778-159.345778 160.967111-159.345778zM220.302222 334.506667c26.424889 0 44.032 17.436444 44.032 43.576889 0 26.168889-17.635556 43.605333-44.032 43.605333h-52.906666L96.967111 770.474667h521.102222a202.012444 202.012444 0 0 0 60.757334 87.210666H44.060444c-13.226667 0-26.453333-4.380444-35.271111-17.464889C0 827.164444 0 818.432 0 805.347556l88.120889-435.968c4.408889-21.788444 22.016-34.872889 44.060444-34.872889h88.120889z m587.747556 253.952c-63.374222 0-114.062222 46.961778-114.062222 105.671111 0 58.680889 50.688 105.642667 114.062222 105.642666 63.345778 0 114.062222-46.933333 114.062222-105.642666s-50.716444-105.671111-114.062222-105.671111z m-177.237334-167.310223c55.580444 0 101.432889 40.903111 107.946667 93.696a204.714667 204.714667 0 0 0-35.470222 17.294223v-4.323556c0-39.253333-32.426667-71.111111-72.476445-71.111111H336.298667c-38.428444 0-69.888 29.354667-72.334223 66.446222l-0.170666 4.664889v90.851556H338.488889v-55.125334h36.266667v55.125334h89.514666v-100.807111h36.266667v100.807111h90.624v-55.125334h36.238222v51.484445A198.912 198.912 0 0 0 612.778667 654.222222H227.555556v-126.407111c0-57.059556 45.681778-103.651556 103.139555-106.524444l5.603556-0.142223h294.513777z m-221.354666 80.924445v39.708444h-74.126222V502.044444h74.126222z m427.633778-167.566222c22.044444 0 39.651556 13.084444 44.088888 34.872889l32.426667 160.341333a204.288 204.288 0 0 0-95.488-27.562667l-16.270222-80.469333h-52.878222c-26.424889 0-44.032-17.436444-44.032-43.605333 0-26.168889 17.635556-43.576889 44.032-43.576889h88.120889zM509.383111 85.333333c31.288889 0 61.297778 12.202667 83.427556 33.905778a114.744889 114.744889 0 0 1 34.360889 75.264l0.199111 6.542222v17.806223h33.166222l0.711111 35.384888h-65.962667v9.756445c0 71.480889-49.664 129.422222-111.274666 129.422222-59.818667 0-108.686222-54.897778-111.502223-123.164444l-0.142222-6.257778v-9.784889h-56.888889v-35.555556h24.263111v-17.777777c0.085333-61.838222 49.635556-112.298667 111.928889-115.399111L457.557333 85.333333h51.825778z m48.384 169.073778h-149.703111v9.756445c0 51.911111 33.905778 93.866667 75.377778 93.866666 40.049778 0 72.817778-38.684444 74.296889-88.291555l0.028444-5.575111v-9.756445zM493.795556 120.888889h-20.650667v71.111111h-36.266667v-68.266667a80.412444 80.412444 0 0 0-60.728889 72.419556l-0.170666 4.920889v17.777778h214.954666l0.199111-17.436445a80.156444 80.156444 0 0 0-56.263111-75.946667l-4.835555-1.365333V192H493.795556v-71.111111z" fill="#ffffff"></path></svg>`,
          // items: ['添加受灾点', '物资查询', '救援力量查询', '物资匹配', '行政区划匹配', '半径查询', '显示所有物资点'],
          items:  [
            { name: '添加受灾点', action: 'addDisasterPoint' },
            { name: '物资查询', action: 'searchSupplyDialog = true' },
            { name: '救援力量查询', action: 'searchEmergencyTeamDialog = true' },
            { name: '物资匹配', action: 'marchSupply' },
            { name: '行政区划匹配', action: 'marchRegionsDialog = true' },
            { name: '半径查询', action: 'searchSuppliesByRadius' },
            { name: '显示所有物资点', action: 'showAllSupplyPoints' },
          ],
          showDropdown: false,
        },
        {
          name: '救援物资',
          icon: `<img src="${disasterReliefSuppliesSmallLogo}" width="32" height="32"/>`,
          items: [],
          showDropdown: false,
        },
        { name: '救援力量',
          icon: `<img src="${rescueTeamsInfoSmallLogo}" width="32" height="32"/>`,
          items: [],
          showDropdown: false },
        { name: '救援装备',
          icon: `<img src="${emergencyRescueEquipmentSmallLogo}" width="32" height="32"/>`,
          items: [],
          showDropdown: false },
      ],
      pos: [],
      areas: [],
      RouteTime: " ", //全程所需时间
      RouteWay: " ", //行进方式
      showTips: false, //路径弹窗
      totalRoute: "", //全长
      cartime: "", //临时变量
      humantime: "", //临时变量
      visibleGuilde: false, //驾驶时导航显示
      selectedDrive: "",
      selectedWalk: "",
      RouteGuilde: [],
      loading: false,
      // 资源快速匹配
      showSuppliesList: [],
      selectedSuppliesList: [],
      showIcon: [],
      activeMenuIndex: '3', // 显示的一级菜单 eg.路径规划、物资匹配
      tableVisible: true, // 显示表格
      isCollapsed: false, // 控制是否收缩
      searchSupplyDialog: false, // 物资查询dialog是否显示
      searchEmergencyTeamDialog: false, // 救援力量查询dialog是否显示
      marchSupplyDialog: false, // 物资匹配dialog是否显示
      searchSupplyByRadiusDialog: false,  // 半径匹配dialog是否显示
      searchSupplyResultDialog: false, // 物资匹配结果dialog是否显示
      marchRegionsDialog: false,  //行政区划匹配dialog是否显示
      ifDrawEllipse: false,
      marchSupplyRadius: 0,
      toolValue: "隐藏数据列表",
      showSupply: "显示所有物资点",
      total: 0,
      pageSize: 5,
      currentPage: 1,
      addSupplyPointCurrently: {
        lng: 0,
        lat: 0,
        count: 0,
        position: "",
        type: "",
        tel: "",
      },
      // 物资查询/匹配表单
      searchSupplyForm: {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        tents: 0,
        raincoats: 0,
        rainBoots: 0,
        flashlights: 0,
        radius: 0.0,
      },
      // 救援力量表单
      searchEmergencyTeamForm: {
        levelName: '',
        teamTypeName: '',
        totalMembers: 0,
        address: '',
        personInCharge: '',
        chargePhone: ''
      },
      inputRadius: "",
      inputData: '',
      canMarkPoint: false,
      DialogFormVisible: false,
      affectedPoints: [{lng: 103.0058, lat: 29.9794, position: "a"}],
      // 救援物资字段
      listFieldsOfSupplies: [
        { prop: 'county', label: '区域', width: 200},
        { prop: 'address', label: '地址', width: 320},
        { prop: 'contactPerson', label: '联系人', width: 100},
        { prop: 'contactPhone', label: '联系电话'},
        { prop: 'tents', label: '帐篷总数量', width: 100 },
        { prop: 'raincoats', label: '雨衣总数量', width: 100 },
        { prop: 'rainBoots', label: '雨鞋总数量', width: 100 },
        { prop: 'flashlights', label: '手电筒总数量', width: 130 }
      ],
      // 救灾设备字段
      listFieldOfReserves: [
        { prop: 'county', label: '区域', width: 200},
        { prop: 'address', label: '地址', width: 320},
        { prop: 'contactPerson', label: '联系人', width: 100 },
        { prop: 'contactPhone', label: '联系电话' },
        { prop: 'lifeJacket', label: '救生衣', width: 100 },
        { prop: 'lifebuoy', label: '救生圈', width: 100 },
        { prop: 'walkieTalkie', label: '对讲机', width: 100 },
        { prop: 'portableLight', label: '照明灯', width: 130 }
      ],
      // 救援力量字段
      listFieldOfEmergencyTeam: [
        // { prop: 'county', label: '所属机构', width: 200, tooltip: true },
        { prop: 'levelName', label: '级别名称', width: 250},
        { prop: 'teamTypeName', label: '队伍类型名称', width: 400 },
        { prop: 'totalMembers', label: '队伍人数', width: 120 },
        { prop: 'address', label: '地址', width: 320 },
        { prop: 'personInCharge', label: '负责人'},
        { prop: 'chargePhone', label: '负责人电话', width: 200 },
      ],
      listField: '',  // 判断显示哪个列表
      suppliesList: [],
      supplyList: [],

      labels: [],  // 保存标签实体的引用
      regionLayerJump: null,
      // 行政区划----------------------------
      districts: [
        {adcode: 511802, name: "雨城区"},
        {adcode: 511803, name: "名山区"},
        {adcode: 511822, name: "荥经县"},
        {adcode: 511823, name: "汉源县"},
        {adcode: 511824, name: "石棉县"},
        {adcode: 511825, name: "天全县"},
        {adcode: 511826, name: "芦山县"},
        {adcode: 511827, name: "宝兴县"},
      ],
      selectedRegions: [],
      selectedDataByRegions: {},

      //-----------弹窗部分-------------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
    };
  },
  mounted() {
    this.init();
    this.entitiesClickPonpHandler();
    this.initPlot(this.id);
  },
  beforeUnmount() {
    if (window.viewer){
      let viewer=window.viewer
      let gl=viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl=null
      window.viewer = null;
    }
  },
  computed: {
    // 以下方法确保表单字段数据为0时不显示，初始化时数据不为null，不会报错
    displayDisasterTentsCount: {
      get() {
        return this.searchSupplyForm.tents === 0 ? '' : this.searchSupplyForm.tents;
      },
      set(value) {
        this.searchSupplyForm.tents = value === '' ? 0 : Number(value);
      }
    },
    displayFlashlightsCount: {
      get() {
        return this.searchSupplyForm.flashlights === 0 ? '' : this.searchSupplyForm.flashlights;
      },
      set(value) {
        this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);
      }
    },
    displayRaincoatsCount: {
      get() {
        return this.searchSupplyForm.raincoats === 0 ? '' : this.searchSupplyForm.raincoats;
      },
      set(value) {
        this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);
      }
    },
    displayRainBootsCount: {
      get() {
        return this.searchSupplyForm.rainBoots === 0 ? '' : this.searchSupplyForm.rainBoots;
      },
      set(value) {
        this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);
      }
    },
    displayRadius: {
      get() {
        return this.searchSupplyForm.radius === 0 ? '' : this.searchSupplyForm.radius;
      },
      set(value) {
        this.searchSupplyForm.radius = value === '' ? 0 : value;
      }
    },
    displayTeamTotalMembers: {
      get() {
        return this.searchEmergencyTeamForm.totalMembers === 0 ? '' : this.searchEmergencyTeamForm.totalMembers;
      },
      set(value) {
        this.searchEmergencyTeamForm.totalMembers = value === '' ? 0 : Number(value);
      }
    }
  },
  methods: {
    // 导航栏按钮
    showDropdown(index) {
      this.menus[index].showDropdown = true;
    },
    hideDropdown(index) {
      this.menus[index].showDropdown = false;
    },
    handleMenuAction(action) {
      if (this[action]) {
        this[action](); // 调用对应的方法
      }
    },
    /** 计算两个坐标的距离，单位米 **/
    Distance(lng1, lat1, lng2, lat2) {
      //采用Haversine formula算法，高德地图的js计算代码，比较简洁 https://www.cnblogs.com/ggz19/p/7551088.html
      let d = Math.PI / 180;
      let f = lat1 * d,
          h = lat2 * d;
      let i = lng2 * d - lng1 * d;
      let e =
          (1 - Math.cos(h - f) + (1 - Math.cos(i)) * Math.cos(f) * Math.cos(h)) /
          2;
      return 2 * 6378137 * Math.asin(Math.sqrt(e));
    },
    sortedSuppliesList() {
      // 按照 tents 排序
      this.showSuppliesList = this.showSuppliesList
          .slice()
          .sort((a, b) => b.tents - a.tents);
    },
    toggleTable() {
      this.tableVisible = !this.tableVisible;
      this.toolValue = this.tableVisible ? "隐藏数据列表" : "显示数据列表";
    },
    init() {
      let that = this;
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息
      window.viewer = viewer;
      let options = {};
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
          103.0,
          29.98,
          1500,
          new Cesium.Cartographic()
      );
      options.enableCompass = true;
      options.enableZoomControls = true;
      options.enableDistanceLegend = true;
      options.enableCompassOuterRing = true;
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      window.navigation = new CesiumNavigation(viewer, options);
      document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
          "请输入地名进行搜索";
      document.getElementsByClassName(
          "cesium-baseLayerPicker-sectionTitle"
      )[0].innerHTML = "影像服务";
      document.getElementsByClassName(
          "cesium-baseLayerPicker-sectionTitle"
      )[1].innerHTML = "地形服务";

      this.clickCount += 1;

      const ellipsoid = viewer.scene.globe.ellipsoid;
      const canvas = viewer.scene.canvas;
      const handler = new Cesium.ScreenSpaceEventHandler(canvas);

      let token = "34d101b55f6166c49c42aed5a7ed345c";
      viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url:
                "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                token,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
          })
      );
      //影像注记
      viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url:
                "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                token,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false,
          })
      );

      handler.setInputAction((movement) => {
        const cartesian = viewer.camera.pickEllipsoid(
            movement.position,
            ellipsoid
        );
        if (cartesian) {
          const cartographic = ellipsoid.cartesianToCartographic(cartesian);
          this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(
              cartographic.latitude
          ).toFixed(5);
          this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(
              cartographic.longitude
          ).toFixed(5);

          if (this.canMarkPoint) {
            this.DialogFormVisible = true;
            this.drawSite(
                this.addSupplyPointCurrently.lat,
                this.addSupplyPointCurrently.lng,
                this.clickCount,
                Cesium.Color.RED
            );
            // console.log("已添加标注点");
            this.canMarkPoint = false;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    initPlot() {

      getEmergency().then(res => {
        let {emergencyRescueEquipment, disasterReliefSupplies, rescueTeamsInfo} = res;
        console.log('获取到的res', res);

        this.supplyList = disasterReliefSupplies
        this.suppliesList.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo);

        // 调用 `processPoints` 并传递不同的 `tableName`
        this.processPoints(emergencyRescueEquipment, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
        this.processPoints(disasterReliefSupplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
        this.processPoints(rescueTeamsInfo, 'emergencyTeam', rescueTeamsInfoLogo, "应急救援力量");

        // this.fetSupplyPoints();
        this.listField = 'supplies'
        this.selectedSuppliesList = this.suppliesList[0]
        this.showIcon = this.selectedSuppliesList;
        this.total = this.selectedSuppliesList.length;
        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      });
    },

    processPoints(pointArr, type, icon, tableName) {
      if (!Array.isArray(pointArr)) {
        console.error(`${tableName} 数据格式不正确`, pointArr);
        return;
      }

      pointArr = pointArr.filter(e => e.longitude !== null);

      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.uuid);
        if (existingEntity) {
          console.warn(`id为${element.uuid}的实体已存在。跳过此实体`);
          return;
        }
        // 检查经度、纬度和高度是否为有效数值
        if (isNaN(element.longitude) || isNaN(element.latitude)
            || element.longitude < -180 || element.longitude > 180
            || element.latitude < -90 || element.latitude > 90) {
          console.log(`id为${element.uuid}的实体的坐标无效或超出范围`, element.longitude, element.latitude);
          return;
        }
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);

        element.type = type;
        element.icon = icon

        let bool = type === 'supplies' ? true : false

        // 添加实体
        this.addEntity(element, icon, tableName, longitude, latitude,bool);
      });
    },

    addEntity(element, icon, tableName, longitude, latitude,bool) {
      window.viewer.entities.add({
        uuid: element.uuid,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
          image: icon,
          width: 40,
          height: 40,
          eyeOffset: new Cesium.Cartesian3(0, 0, 0),
          color: Cesium.Color.WHITE.withAlpha(1),
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地
          depthTest: bool ? true : false, // 让 Cesium 正确处理图标的遮挡关系
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
          tableName: tableName, // 动态传入的表名称
          ...element, // 将element对象展开，自动填充所有属性
          longitude: element.longitude,
          latitude: element.latitude
        }
      });
    },

    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
        // 则表示已经设置了其他地形提供者
        // console.log("地形已加载")
        return true;
      }
      // console.log("地形未加载")
      return false;
    },
    entitiesClickPonpHandler() {
      let that = this;
      // 处理点击事件
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 获取点击位置的实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedEntity?.id;

        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;

          // 判断实体类型并处理
          if (entity._billboard) {
            // 获取点击点的经纬度
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);

            // 如果有地形加载，更新高度
            let height = 0;
            if (this.isTerrainLoaded()) {
              height = viewer.scene.globe.getHeight(cartographic);
            }

            // 更新弹窗位置
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

            // that.popupData = entity.properties;

            // 解析 properties 以获取实际的数据
            let properties = {};
            entity.properties.propertyNames.forEach(name => {
              properties[name] = entity.properties[name].getValue();
            });
            that.popupData = properties;
            console.log("entity.properties作为弹窗数据:", that.popupData);

            this.popupVisible = true;
            this.updatePopupPosition();
          } else {
            this.popupVisible = false;
          }

          // 处理面实体
          if (entity._polygon) {
            that.showPolygon = true;
          } else {
            that.showPolygon = false;
          }

          // 处理线实体
          if (entity._polyline) {
            let status = cesiumPlot.drawPolylineStatus();
            that.showPolyline = (status === 0);
          } else {
            that.showPolyline = false;
          }
        } else {
          this.popupVisible = false;
        }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 确保在地图拖动时弹窗位置更新
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (that.popupVisible && window.selectedEntity) {
          that.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //--------------------弹窗----------------------
    // 判断是否有高程
    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          window.viewer.scene,
          this.selectedEntityHighDiy
      );
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x, //+ 20,
          y: canvasPosition.y, //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },

    //-----------附近资源快速匹配----------
    //-----------行政区划匹配-------------

    // 行政区划匹配dialog选中函数
    selectRegions(district){
      const index = this.selectedRegions.indexOf(district);
      if (index === -1) {
        this.selectedRegions = []
        this.selectedRegions.push(district); // 添加选中
      } else {
        this.selectedRegions.splice(index, 1); // 取消选中
      }
    },

    handleDistrictClick() {
      let district = this.selectedRegions[0]
      //清除其他实体标签
      this.removethdRegions()
      this.removeDataSourcesLayer('YaanRegionLayer');
      // this.visible = false;
      // 根据区县代码过滤GeoJSON数据
      let filteredFeatures = yaan.features.filter(feature => {
        return feature.properties.adcode === district.adcode;
      });
      if (filteredFeatures.length > 0) {

        console.log("filteredFeatures---------------------------",filteredFeatures)

        this.removePoints(this.suppliesList[0]);
        this.removePoints(this.suppliesList[1]);
        this.removePoints(this.suppliesList[2]);

        // 创建一个经过过滤的GeoJSON对象，包含过滤后的特性数据
        let filteredGeoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };

        // 使用Cesium的GeoJsonDataSource.load方法加载经过过滤的GeoJSON数据
        // 该方法用于将GeoJSON数据转换为Cesium的数据源，以便在3D地图中显示
        // 在加载时，设置了数据源的样式属性，包括边颜色、填充颜色和边宽度
        let geoPromise = Cesium.GeoJsonDataSource.load(filteredGeoJson, {
          clampToGround: true, //贴地显示
          stroke: Cesium.Color.RED,
          fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
          strokeWidth: 10,
        });

        // 处理地理空间数据的Promise对象
        geoPromise.then(async (dataSource) => {
          // 将数据源添加到观众的数据显示中
          window.viewer.dataSources.add(dataSource);
          // 保存区域图层以便后续使用
          window.regionLayerJump = dataSource

          console.log("filteredFeatures-------------", filteredFeatures[0].geometry.coordinates)
          // 遍历每个过滤后的地理特征
          filteredFeatures.forEach((feature) => {
            // 获取特征的中心点坐标
            let center = feature.properties.center;

            // 检查中心点是否定义且格式正确
            if (center && center.length === 2) {
              // 将地理坐标转换为三维空间中的位置
              let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
              // 创建并添加标签实体到观众的实体集合中
              let labelEntity = viewer.entities.add(new Cesium.Entity({
                position: position,
                label: new Cesium.LabelGraphics({
                  text: district.name,  // 标签文本为区域名称
                  scale: 1,  // 标签缩放比例
                  font: "bolder 50px sans-serif",  // 标签字体样式
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 标签样式为填充和轮廓
                  fillColor: Cesium.Color.fromCssColorString("#ffffff"),  // 标签填充颜色
                  pixelOffset: new Cesium.Cartesian2(0, -60)  // 标签像素偏移量，用于调整位置
                })
              }));
              // 保存标签实体的引用，以便后续管理和操作
              this.labels.push(labelEntity);
            } else {
              // 如果中心点未定义或格式不正确，输出警告信息
              console.warn('中心点未定义或格式不正确:', feature);
            }
          });



          // 飞行到数据源中的实体位置，以便用户查看
          viewer.flyTo(dataSource.entities.values);

          // // 检查标绘点是否在范围内
          // let boundingBox = this.getBoundingBox(filteredFeatures[0].geometry.coordinates[0]);
          // console.log("边界框:", boundingBox);
          //

        }).catch((error) => {
          // 如果加载GeoJSON数据失败，输出错误信息
          console.error("加载GeoJSON数据失败:", error);
        });

        let obj = {
          regionCode: this.selectedRegions[0].adcode
        }
        marchByRegion(obj).then(res => {
          console.log("marchByRegion-----------------------",res)
          let suppliesArr = res.insideDisasterReliefSupplies
          let emergencyTeamArr = res.insideRescueTeamsInfo
          let reservesArr = res.insideEmergencyRescueEquipment
          this.selectedDataByRegions = {suppliesArr,emergencyTeamArr,reservesArr}
          console.log("selectedDataByRegions--------------------",this.selectedDataByRegions)

          this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
          this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
          this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
          this.listField = 'supplies'
          this.changeDataList('supplies')
        })
      } else {
        // console.error("未找到对应的区县:", adcode);
      }
      this.selectedRegions = []
      this.marchRegionsDialog = false
    },

    removethdRegions() {
      // 检查是否存在名为regionLayerJump的图层
      if (window.regionLayerJump) {
        // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
        window.viewer.dataSources.remove(window.regionLayerJump, true);
        // 清空regionLayerJump的引用，以便垃圾回收
        window.regionLayerJump = null;


        // console.log("图层已移除");
      }
      // this.isShowYaanRegionLegend = false;
      // 获取图例容器，准备清空其内容
      // const legend = document.getElementById('legend');
      // 循环移除图例容器中的所有子元素
      // while (legend.firstChild) {
      //     legend.removeChild(legend.firstChild);
      // }
      // 遍历标签数组，移除每个标签实体
      this.labels.forEach(label => {
        window.viewer.entities.remove(label);
      });
      // 清空标签引用数组，以便垃圾回收
      this.labels = [];
    },
    removeDataSourcesLayer(layerName) {
      // 通过图层名称获取数据源对象如果存在，则执行移除操作
      const dataSource = window.viewer.dataSources.getByName(layerName)[0];
      if (dataSource) {
        window.viewer.dataSources.remove(dataSource);
      }
    },

    // 切换数据列表
    changeDataList(param){
      this.selectedSuppliesList = []
      let flag = Object.keys(this.selectedDataByRegions).length === 0 ? false : true

      if(param === 'supplies'){
        this.listField = 'supplies'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.suppliesArr : this.suppliesList[0]
      }else if(param === 'emergencyTeam'){
        this.listField = 'emergencyTeam'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.emergencyTeamArr : this.suppliesList[2]
      }else{
        this.listField = 'reserves'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.reservesArr : this.suppliesList[1]
      }
      this.showIcon = this.selectedSuppliesList;
      this.total = this.selectedSuppliesList.length;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    },

    // 绘制点
    drawSite(lat, lng, id, color) {
      let point = {
        id: id,
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(lng),
            parseFloat(lat)
        ),
      };
      this.affectedPoints.push(point);
      if (viewer) {
        viewer.entities.add({
          position: point.position,
          point: {
            pixelSize: 10,
            color: color,
          },
        });
      }
    },

    // 点击列表某行显示对应标绘点
    showSupplyPoint(row) {
      console.log("点击了：", row);
      this.showIcon = [];
      this.showIcon.push(row);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      if (this.showIcon[0].type === "supplies") {
        this.processPoints(this.showIcon, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      } else if (this.showIcon[0].type === "reserves") {
        this.processPoints(this.showIcon, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      } else {
        this.processPoints(this.showIcon, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      }
    },

    // 移除地图上的标绘点
    removePoints(entityArr) {
      entityArr.forEach((entity) => {
        // console.log("-----", entity);
        let uuid = entity.uuid;
        window.viewer.entities.values.forEach((existingEntity) => {
          if (existingEntity.uuid === uuid) {
            window.viewer.entities.remove(existingEntity);
          }
        });
      });
    },

    // 显示所有标绘点
    showAllSupplyPoints() {
      let that = this;
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removethdRegions()
      this.removeDataSourcesLayer('YaanRegionLayer');
      this.initPlot()
    },

    // 物资查询
    async searchSupply(){
      let that = this;
      this.activeMenuIndex = '2'
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = []
      this.ifDrawEllipse = false
      this.selectedSuppliesList = []
      // 字符串部分到后端查询
      let obj = {
        county: this.searchSupplyForm.county,
        address: this.searchSupplyForm.address,
        contactPerson: this.searchSupplyForm.contactPerson,
        contactPhone: this.searchSupplyForm.contactPhone,
      }
      await searchMaterialData(obj).then(res => {
        // console.log("search----------",res)
        result = res
        this.selectedSuppliesList = result
      })
      this.drawSupplyPoint('searchSupplies')
      this.listField = 'supplies'
      this.activeMenuIndex = '3'
      this.searchSupplyDialog = false
      this.searchSupplyForm = {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        tents: 0,
        raincoats: 0,
        rainBoots: 0,
        flashlights: 0,
        radius: 0.0,
      }
      // console.log("this.activeMenuIndex--------------------------------",this.activeMenuIndex)
    },

    // 救援力量查询
    async searchEmergencyTeam(){
      let that = this;
      this.activeMenuIndex = '2'
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      this.ifDrawEllipse = false
      this.selectedSuppliesList = []
      await searchEmergencyTeamData(this.searchEmergencyTeamForm).then(res => {
        this.selectedSuppliesList = res
        console.log("-------------------",this.selectedSuppliesList)

      })
      this.drawSupplyPoint('searchEmergencyTeam')
      this.listField = 'emergencyTeam'
      this.activeMenuIndex = '4'
      this.searchEmergencyTeamDialog = false
      this.searchEmergencyTeamForm = {
        levelName: '',
        teamTypeName: '',
        totalMembers: 0,
        address: '',
        personInCharge: '',
        chargePhone: ''
      }
    },

    // 物资匹配dialog能打开
    async marchSupply(){
      if(this.addSupplyPointCurrently.lat === 0){
        await ElMessageBox.alert('请先添加受灾点。', '提示', {
          confirmButtonText: '确认',
        });
      }else{
        this.marchSupplyDialog = true
      }
    },
    // 物资匹配
    async marchSupplies(){
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = this.supplyList
      let radiusResult = []
      let countResult = []
      this.selectedSuppliesList = []
      // console.log("result-------------------",result)
      let i = 1.0
      let flag = false
      while (i < 15.0 && !flag){
        radiusResult = await this.marchSupplyByRadius(result,i)
        // console.log("radiusResult-------------------",radiusResult)
        countResult = this.marchSupplyByCount(radiusResult)
        // console.log("countResult-------------------", countResult);
        if(countResult.length > 0){
          flag = true
          this.marchSupplyRadius = i
        }
        i++
      }
      if(flag){
        this.selectedSuppliesList = countResult
        await ElMessageBox.alert(`物资匹配成功！查询半径为 ${i - 1} 公里。`, '提示', {
          confirmButtonText: '确认',
        });
        this.ifDrawEllipse = true
        this.drawSupplyPoint("searchSupplies",this.marchSupplyRadius)
      }else{
        this.selectedSuppliesList = []
        await ElMessageBox.alert('15公里范围内未匹配到合适的物资。', '提示', {
          confirmButtonText: '确认',
        });
      }
      this.marchSupplyDialog = false
    },

    // 半径查询
    async searchSuppliesByRadius(){
      if(this.addSupplyPointCurrently.lat === 0){
        await ElMessageBox.alert('请先添加受灾点。', '提示', {
          confirmButtonText: '确认',
        });
      }else{
        this.searchSupplyByRadiusDialog = true
      }
    },

    // 通过半径匹配物资
    async marchSuppliesByRadius(){
      this.ifDrawEllipse = true
      this.selectedSuppliesList = await this.marchSupplyByRadius(this.supplyList,this.searchSupplyForm.radius)
      this.drawSupplyPoint("searchSupplies",this.searchSupplyForm.radius)
      this.searchSupplyByRadiusDialog = false
    },
    // 半径匹配
    async marchSupplyByRadius(array,radius){
      // 移除现有的点
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = []
      let longitude = parseFloat(this.addSupplyPointCurrently.lng);
      let latitude = parseFloat(this.addSupplyPointCurrently.lat);
      const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      array.forEach((point) => {
        const pointLongitude = parseFloat(point.longitude);
        const pointLatitude = parseFloat(point.latitude);
        const initialPoint = Cesium.Cartesian3.fromDegrees(
            pointLongitude,
            pointLatitude
        );
        // 距离以公里为单位
        const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
        if (distance < radius) {
          result.push(point);
        }
      });
      return result
    },
    // 通过目标数量匹配物资
    marchSupplyByCount(array){
      let tents = 0
      let raincoats = 0
      let rainBoots = 0
      let flashlights = 0
      let flag = false
      let bool1 = this.searchSupplyForm.tents > 0 ? false : true
      let bool2 = this.searchSupplyForm.raincoats > 0 ? false : true
      let bool3 = this.searchSupplyForm.rainBoots > 0 ? false : true
      let bool4 = this.searchSupplyForm.flashlights > 0 ? false : true
      let resultArray = []
      array.forEach((ele) => {
        if(ele.tents === 0){
          bool1 = true
        }
        if(ele.raincoats === 0){
          bool2 = true
        }
        if(ele.rainBoots === 0){
          bool3 = true
        }
        if(ele.flashlights === 0){
          bool4 = true
        }
        if(!bool1 || !bool2 || !bool3 || !bool4){
          tents += ele.tents;
          raincoats += ele.raincoats;
          rainBoots += ele.rainBoots;
          flashlights += ele.flashlights;
          // console.log("rainBoots=====-----",rainBoots)
          if (tents >= this.searchSupplyForm.tents
              && raincoats >= this.searchSupplyForm.raincoats
              && rainBoots >= this.searchSupplyForm.rainBoots
              && flashlights >= this.searchSupplyForm.flashlights) {
            flag = true;
          }
          resultArray.push(ele)
        }
      });
      // console.log("flag-----------------",flag)
      if(flag){
        return resultArray
      }else{
        return []
      }
    },

    drawSupplyPoint(param,radius) {
      this.total = this.selectedSuppliesList.length;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      this.removePoints(this.showIcon);
      this.showIcon = [];
      this.showIcon = this.selectedSuppliesList;
      // console.log("this.selectedSuppliesList---------",this.selectedSuppliesList)
      let reservesArr = []  // 抢险救灾装备
      let suppliesArr = []  // 救灾物资储备
      let emergencyTeamArr = []  // 救援力量
      if(param === 'searchSupplies'){
        this.showIcon.forEach((item) => {
          suppliesArr.push(item)
        })
      }else if(param === 'searchEmergencyTeam'){
        this.showIcon.forEach((item) => {
          emergencyTeamArr.push(item)
        })
      }else if(param === 'searchReserves'){
        this.showIcon.forEach((item) => {
          reservesArr.push(item)
        })
      }
      else{
        this.showIcon.forEach((item) => {
          if (item.type === "reserves") {
            reservesArr.push(item);
          } else if (item.type === "supplies") {
            suppliesArr.push(item);
          } else {
            emergencyTeamArr.push(item);
          }
        });
      }
      this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      if(this.ifDrawEllipse){
        this.selectPoints(radius);
      }
      // }

    },
    // 查询指定范围内的物资点

    selectPoints(radius) {
      if (!isNaN(parseFloat(radius))) {
        radius = parseFloat(radius) * 1000;

        // 将经纬度转换为 Cartesian3 类型
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(this.addSupplyPointCurrently.lng),
            parseFloat(this.addSupplyPointCurrently.lat)
        );
        viewer.entities.values.forEach((entity) => {
          if (entity.ellipse) {
            viewer.entities.remove(entity);
          }
        });
        viewer.entities.add({
          position: position,
          ellipse: {
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            material: Cesium.Color.GREEN.withAlpha(0.5),
          },
        });
      }
    },
    // 添加物资点
    addDisasterPoint() {
      this.canMarkPoint = true;
    },
    // 以下方法确保表单字段数据为0时不显示，且初始化时数据不为null，不会报错
    handleDisasterTentsInput(value) {
      this.searchSupplyForm.tents = value === '' ? 0 : Number(value);
    },
    handleFlashlightsInput(value) {
      this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);
    },
    handleRaincoatsInput(value) {
      this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);
    },
    handleRainBootsInput(value) {
      this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);
    },
    handleRadiusInput(value) {
      this.searchSupplyForm.radius = value;
    },
    handleTeamTotalMembersInput(){
      this.searchEmergencyTeamForm.totalMembers = value
    },
    // ---------------------------------------------------------------------
    getPageArr(arr) {
      let newArr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        newArr.push(arr[start]);
      }
      return newArr;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    },
    tableHeaderColor() {
      return {
        "border-width": "1px",
        "border-style": "solid",
        "border-color": "#555555",
        "background-color": "#293038 !important", // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        color: "#fff",
        padding: "0",
        "text-align": "center",
      };
    },
    // 修改table header的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          "border-width": "1px",
          "border-style": "solid",
          "border-color": "#555555",
          "background-color": "#313a44",
          color: "#fff",
          padding: "0",
          "text-align": "center",
        };
      } else {
        return {
          "border-width": "1px",
          "border-style": "solid",
          "border-color": "#555555",
          "background-color": "#304156",
          color: "#fff",
          padding: "0",
          "text-align": "center",
        };
      }
    },
    //- ---------------------
    /** 以坐标点为中心，简单粗略的创建一个指定半径的圆，半径单位米，pointCount为构建圆的坐标点数（比如24个点，点越多越圆，最少3个点），返回构成圆的坐标点数组 **/
    CreateSimpleCircle(lng, lat, radius, pointCount) {
      //球面坐标不会算，转换成三角坐标简单点，经度代表值大约：0.01≈1km 0.1≈10km 1≈100km 10≈1000km
      let km = radius / 1000;
      let a = km < 5 ? 0.01 : km < 50 ? 0.1 : km < 500 ? 1 : 10;
      let b = this.Distance(lng, lat, lng + a, lat);
      let c = this.Distance(lng, lat, lng, lat + a);
      let rb = (radius / b) * a;
      let rc = (radius / c) * a;
      let arr = [];
      let n = 0,
          step = 360.0 / pointCount,
          N = 360 - step / 2; //注意浮点数±0.000000001的差异
      for (let i = 0; n < N; i++, n += step) {
        let x = lng + rb * Math.cos((n * Math.PI) / 180);
        let y = lat + rc * Math.sin((n * Math.PI) / 180);
        arr[i] = [x, y];
      }
      arr.push([arr[0][0], arr[0][1]]); //闭环
      return arr;
    },
    formatTime(minutes) {
      const hours = Math.floor(minutes / 60); // 计算小时数
      const remainingMinutes = Math.round(minutes % 60); // 计算剩余的分钟数并四舍五入
      return `${hours > 0 ? hours + '小时' : ''}${remainingMinutes}分钟`;
    },
    walkStyle() {
      this.visibleGuilde = false;
      this.RouteTime = this.formatTime(this.humantime);
      this.RouteWay = "步行";
      this.selectedDrive = "backcolor: red";
      this.selectedWalk = "backcolor: white";
    },
    driveStyle() {
      this.visibleGuilde = true;
      if (this.cartime.includes("0时0分钟")) {
        this.RouteTime = "1分钟";
      } else {
        this.RouteTime = this.formatTime(this.cartime);
      }
      this.RouteWay = "驾驶";
    },

    onScroll(event) {
      const container = event.target;
      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight;
      if (bottom && !this.loading) {
        this.loadMoreGuide();
      }
    },
    async loadMoreGuide() {
      this.loading = true;
      try {
        // 调用API获取更多的指南数据
        const newGuides = await this.fetchMoreGuides();
        this.RouteGuilde = [...this.RouteGuilde, ...newGuides];
      } catch (error) {
        console.error('Failed to load more guides', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchMoreGuides() {
      // 实现调用API逻辑
      return []; // 返回新的指南数据
    },
    route() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      let propertiesId = [];
      handler.setInputAction((event) => {
        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        // // 1-2 坐标系转换
        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);

        that.pos.push([lon, lat]);
        let billBoardId = Date.now();
        if (that.pos.length === 1) {
          that.billboardD(position, start, billBoardId);
          propertiesId.push(billBoardId);
        } else {
          that.billboardD(position, end, billBoardId);
          propertiesId.push(billBoardId);
        }
        if (that.pos.length === 2) {
          let path = ""
          let pathName = []
          let pathM = 0

          let from = wgs84togcj02(that.pos[0][0], that.pos[0][1])
          let end = wgs84togcj02(that.pos[1][0], that.pos[1][1])
          let avoidArea = ""
          if (that.areas.length > 0) {
            let area = JSON.parse(JSON.stringify(that.areas))
            for (let i = 0; i < area.length; i++) {
              for (let j = 0; j < area[i].area.length; j += 2) {
                avoidArea += wgs84togcj02(area[i].area[j][0], area[i].area[j][1]) + ";"
              }
              avoidArea += "|"
            }
            avoidArea = avoidArea.substring(0, avoidArea.length - 1);
          }

          axios.get("https://restapi.amap.com/v3/direction/driving?origin=" + from + "&destination=" + end + "&extensions=base&strategy=0&avoidpolygons=" + avoidArea + "&key=7b0b64174ef6951cc6ee669de03e4f59", {}).then(res => {

            pathM += parseInt(res.data.route.paths[0].distance)
            res.data.route.paths[0].steps.map(step => {
                  pathName.push(step.instruction)
                  path += (step.polyline + ";")
                }
            )

            let pathSegments = path.split(";")
                .map(segment =>
                    segment
                        .replace(/"/g, "")  // 去除双引号
                        .split(",")  // 按逗号分割成经纬度数组
                        .map(Number)  // 将字符串转换为数字
                        .filter(seg => !isNaN(seg))  // 去除无效数字
                )
                .filter(segment => segment.length === 2)
                .map(segment => gcj02towgs84(segment[0], segment[1]))
// 在pathSegments数组开头插入起点
            pathSegments.unshift(that.pos[0]);

// 在pathSegments数组结尾添加终点
            pathSegments.push(that.pos[1]);
            that.pos = [];
            that.polylineD(pathSegments, propertiesId);
            this.cartime = (parseFloat(res.data.route.paths[0].duration) / 60).toFixed(2);
            this.humantime = (pathM * 0.7 / 60).toFixed(2);
            this.driveStyle();
            this.walkStyle();
            this.totalRoute = pathM;
            this.RouteGuilde = pathName;
          })

          that.showTips = true;
          //路径规划好后弹出气泡框
          // this.bubbleTips(position);
          // this.initTool(this.viewer.cesiumWidget.container);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //绘制路径的线
    polylineD(data, propertiesId) {
      let arr = [];
      for (let i = 0; i < data.length; i++) {
        let c3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
        // let cartographic = Cesium.Cartographic.fromDegrees(data[i][0],data[i][1])
        // let cartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic)
        arr.push(c3);
      }
      viewer.entities.add({
        polyline: {
          positions: arr,
          width: 10,
          depthFailMaterial: Cesium.Color.YELLOW,
          clampToGround: true,
        },
        properties: {
          propertiesId,
        },
      });
    },
    //绘制障碍物点的面
    polygonD(positions, id) {
      let arr = [];
      for (let i = 0; i < positions.length; i++) {
        let a = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);
        arr.push(a);
      }
      let polygon = new Entity({
        id: id,
        polygon: {
          hierarchy: arr,
          material: new Cesium.Color.fromCssColorString("#FFD700").withAlpha(
              0.2
          ),
          clampToGround: true,
        },
        properties: {},
      });
      viewer.entities.add(polygon);
    },
    //绘制半径的中心点
    pointD(position, id) {
      return viewer.entities.add({
        id: id,
        position: position,
        point: {
          pixelSize: 20,
          color: Cesium.Color.RED,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    //路径规划
    billboardD(position, img, billBoardId) {
      viewer.entities.add({
        id: billBoardId,
        position: position,
        billboard: {
          image: img,
          // width: 25,//图片宽度,单位px
          // height: 25,//图片高度，单位px // 会影响point大小，离谱
          // eyeOffset: new Cesium.Cartesian3(-1, 1, 0),//与坐标位置的偏移距离
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    addArea() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      handler.setInputAction((event) => {
        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        // // 1-2 坐标系转换
        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let ar = that.CreateSimpleCircle(lon, lat, 50, 24);
        that.areas.push({area: ar, name: "area_" + Date.now()});
        let id = "area_" + Date.now();
        that.pointD(position, id);
        that.polygonD(ar, id + "a");
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    removeAll() {
      viewer.entities.removeAll();
      this.areas = [];
    },
    removePoint() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        // let entity = window.selectedEntity = pickedEntity?.id
        let entity = pickedEntity?.id;
        if (Cesium.defined(pickedEntity) && entity._point !== undefined) {
          let id = entity.id;
          that.areas = that.areas.filter((area) => area.name !== id);
          viewer.entities.remove(entity);
          viewer.entities.removeById(id + "a");
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    removePolyline() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        let entity = (window.selectedEntity = pickedEntity?.id);
        if (
            Cesium.defined(pickedEntity) &&
            window.selectedEntity._polyline !== undefined
        ) {
          let propertiesId = entity.properties.propertiesId._value;
          for (let i = 0; i < propertiesId.length; i++) {
            console.log(propertiesId[i], propertiesId[i] + "");
            viewer.entities.removeById(propertiesId[i] + "");
          }
          viewer.entities.remove(entity);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //绑定点击事件
    //    bubbleTips(position) {
    //     if (!viewer) {
    //         console.error("Viewer is not initialized.");
    //         return;
    //     }
    //     // 文字内容
    //     var text = "Citizens Bank Park";
    //     // 添加背景面板
    //     var backgroundPanel = viewer.entities.add({
    //         position: position,
    //         billboard: {
    //             // 使用 CSS 样式的背景图像或在下面的代码中可以选择不同的背景图
    //             image: bubbleImg,
    //             pixelOffset: new Cesium.Cartesian2(0, -80), // 需要根据实际需要调整偏移
    //             width: 200, // 固定宽度或根据内容计算
    //             height: 100, // 固定高度或根据内容计算
    //         },
    //     });

    //     // 添加标签
    //     var label = viewer.entities.add({
    //         position: position,
    //         label: {
    //             text: text,
    //             font: "16pt Arial",
    //             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //             fillColor: Cesium.Color.WHITE,
    //             outlineColor: Cesium.Color.GRAY,
    //             outlineWidth: 2,
    //             verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //             pixelOffset: new Cesium.Cartesian2(0, -30), // 根据背景面板的高度调整标签的位置
    //             showBackground: true,
    //             backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
    //             backgroundPadding: new Cesium.Cartesian2(10, 6)
    //         }
    //     });

    //     // 添加点击事件处理（可选）
    //     viewer.screenSpaceEventHandler.setInputAction(function (click) {
    //         var pick = viewer.scene.pick(click.position);
    //         if (Cesium.defined(pick) && (pick.id === backgroundPanel || pick.id === label)) {
    //             console.log("Label or background panel clicked");
    //         }
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }

    initTool(frameDiv) {
      if (this.isInit) {
        return 0;
      }
      //弹窗容器div
      const rightdiv = document.createElement("DIV");
      rightdiv.className = "tooltipdiv-right";
      rightdiv.style = `
      position:absolute;
      width:200px;
      min-height:100px;
      max-height:300px;
      background:#fff;
      border-radius:4px;
      box-shadow: 2px 4px 5px #888888;
      `;

      //弹窗箭头div
      const arrow = document.createElement("DIV");
      arrow.className = "tooltip-arrow";
      arrow.style = `
      position:absolute;
      left:-24px;
      top:38px;
      width:0;
      height:0;
      border-top: 12px solid transparent;
      border-right: 12px solid #fff;
      border-bottom: 12px solid transparent;
      border-left: 12px solid transparent;`;
      rightdiv.appendChild(arrow);
      //标题div
      const title = document.createElement("DIV");
      title.className = "tooltipdiv-inner";
      title.style = `
      width:100%;
      height:25px;
      line-height:25px;
      text-align:center;
      background:red;
      `;
      rightdiv.appendChild(title);

      //内容div
      const content = document.createElement("DIV");
      content.className = "tooltipdiv-content";
      content.style = `
      width:200px;
      box-sizing:border-box;
      padding:10px 0 10px 10px;
      overflow-y:scroll;
      word-break:break-all;
      `;
      rightdiv.appendChild(content);

      this.addDiv = rightdiv;
      this.addtitle = title;
      this.addcontent = content;
      frameDiv.appendChild(rightdiv);

      this.isInit = true;
    },
  },
};
</script>

<style scoped>
:deep(.cesium-baseLayerPicker-dropDown-visible ){
  transform: translate(0, 0);
  /*天地图换地图优先级最高，避免被物资搜索框遮盖*/
  z-index: 100;
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
:deep(.cesium-viewer-toolbar) {
  display: block;
  /*搜索按钮优先级最高，避免被物资搜索框遮盖*/
  z-index: 100;
  position: absolute;
  top: 5px;
  right: 5px;
}
.el-sub-menu {
  list-style: none;
  margin: 0;
  padding-left: 0;
  /* width: 33%; */
}
.route-tool-container {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  /*width: 500px;*/
  /*height: 200px;*/
  top: 10px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

#cesiumContainer {
  height: calc(100vh - 50px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#supplies {
  position: absolute;
  padding: 15px;
  border-radius: 5px;
  top: 200px;
  left: 10px;
  width: 80vw;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  transition: width 0.3s; /* 平滑过渡效果 */
}

.marchSupply{
  position: absolute;
  z-index: 10;
  justify-content: center;
  align-content: center;
  margin: 0;
  padding: 0;
}

#supplies.collapsed {
  width: 30% !important; /* 收缩时的宽度 */
}

.pagination1 {
  width: 40%;
  margin: 0 auto;
  color: white;
}

.pagination1 ::v-deep .el-pagination__total,
.pagination1 ::v-deep .el-pagination__jump {
  color: white; /* 设置“共多少条”和“前往 页”部分的颜色为白色 */
}

.el-table {
  background-color: #ffffff00;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.loading {
  text-align: center;
  margin: 10px;
  color: #999;
}
.el-menu-item,
.el-submenu__title {
  padding: 0 20px;
}

.el-submenu__title:hover {
  background-color: #444;
}

.el-menu-item:hover {
  background-color: #444;
}
.el-form-item__label {
  text-align: center; /* 标签文字右对齐 */
}
/*行政区划按钮样式*/
.district-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  justify-content: space-between;
}
.district-button {
  flex: 0 0 20%; /* 每行5个按钮 */
  display: flex;
  justify-content: center;
  margin: 4px; /* 调整按钮之间的间距 */
}
.district-button.selected {
  background-color: #5b91c9; /* 选中按钮的背景色 */
  color: white; /* 选中按钮的文字颜色 */
  border: 1.5px solid #5b91c9; /* 增加边框 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 增加阴影效果 */
  transform: scale(1.05); /* 略微放大 */
}



.navbar {
  background: url(@/assets/images/EmergencyResourceInformation/导航栏发光样式.png) no-repeat;
  background-color: #283b4d;
  height: 8%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-size: 30% 100% ;
  z-index: 100;
}
.zhts-title {
  width: 25vw;
  background-size: 100% 100%;
  left: 2%;
  font-weight: 550;
  font-size: 1.8rem;
  position: relative;
  background-repeat: no-repeat;
  color: #fff;
  text-shadow: 0px 3px 6px #1973c0;
  margin-right: 20px;
}
.menu-item {
  position: relative;
  height: 100%;
  display: flex;
  width: 10%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  margin-right: 1rem; /* 每个菜单项之间设置50px的间距 */
}

.menu-label {
  padding: 10px;
}

.menu-item:hover .menu-label {
  color: #00aaff;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: rgba(46, 52, 63, 0.87);;
  //padding: 10px;
  display: flex;
  flex-direction: column;
  z-index: 101; /* 设置高于 cesium-viewer 的 z-index */
}

.dropdown-item {
  color: white;
  padding: .7rem;
  cursor: pointer;
  z-index: 101; /* 设置高于 cesium-viewer 的 z-index */
}

.dropdown-item:hover {
  background-color: #1b95ff;
  //color: #00aaff;
}
</style>



<!--<template>-->
<!--  <div id="cesiumContainer">-->
<!--    <RouterPanel-->
<!--        :visible="popupVisible"-->
<!--        :position="popupPosition"-->
<!--        :popupData="popupData"-->
<!--    />-->
<!--    <div id="supplies" :class="{ collapsed: !tableVisible }" style="width: 93.5%;">-->
<!--      <el-form class="eqTable">-->
<!--        <div style="margin-bottom: 10px; padding: 10px; width: 100.6%;">-->
<!--            <el-menu-->
<!--                    :default-active="activeMenuIndex"-->
<!--                    v-model="activeMenuIndex"-->
<!--                    class="el-menu-demo"-->
<!--                    mode="horizontal"-->
<!--                    background-color="#293038"-->
<!--                    text-color="#fff"-->
<!--                    active-text-color="#409eff"-->
<!--            >-->
<!--                <el-sub-menu index="1" >-->
<!--                    <template #title>路径规划</template>-->
<!--                    <el-menu-item index="1-1" @click="route">路径规划</el-menu-item>-->
<!--                    <el-menu-item index="1-2" @click="addArea">添加障碍区域</el-menu-item>-->
<!--                    <el-menu-item index="1-3" @click="removeAll">清空所有实体</el-menu-item>-->
<!--                    <el-menu-item index="1-3" @click="removePoint">删除障碍区域</el-menu-item>-->
<!--                    <el-menu-item index="1-3" @click="removePolyline">删除路径规划</el-menu-item>-->
<!--                </el-sub-menu>-->
<!--                <el-sub-menu index="2" >-->
<!--                    <template #title>救援力量匹配</template>-->
<!--                    <el-menu-item index="2-1" @click="addDisasterPoint">添加受灾点</el-menu-item>-->
<!--                    <el-menu-item index="2-2" @click="searchSupplyDialog = true">物资查询</el-menu-item>-->
<!--                    <el-menu-item index="2-3" @click="searchEmergencyTeamDialog = true">救援力量查询</el-menu-item>-->
<!--                    <el-menu-item index="2-4" @click="marchSupply">物资匹配</el-menu-item>-->
<!--                    <el-menu-item index="2-5" @click="marchRegionsDialog = true">行政区划匹配</el-menu-item>-->
<!--                    <el-menu-item index="2-6" @click="searchSuppliesByRadius">半径查询</el-menu-item>-->
<!--                    <el-menu-item index="2-7" @click="showAllSupplyPoints">{{ showSupply }}</el-menu-item>-->
<!--                </el-sub-menu>-->
<!--                <el-menu-item index="3" style="width: 140px;" @click="changeDataList('supplies')">救援物资</el-menu-item>-->
<!--                <el-menu-item index="4" style="width: 140px;" @click="changeDataList('emergencyTeam')">救援力量</el-menu-item>-->
<!--                <el-menu-item index="5" style="width: 140px;" @click="changeDataList('reserves')">救灾装备</el-menu-item>-->
<!--                <el-menu-item index="6" style="width: 140px;" @click="toggleTable">{{ toolValue }}</el-menu-item>-->
<!--            </el-menu>-->
<!--        </div>-->
<!--        &lt;!&ndash;     数据列表     &ndash;&gt;-->
<!--        <el-table-->
<!--            v-if="tableVisible"-->
<!--            :data="showSuppliesList"-->
<!--            style="width: 100%; margin-bottom: 5px; text-align: center"-->
<!--            :stripe="true"-->
<!--            :header-cell-style="tableHeaderColor"-->
<!--            :cell-style="tableColor"-->
<!--            :row-style="{ height: '40px' }"-->
<!--            @row-click="showSupplyPoint"-->
<!--        >-->
<!--            &lt;!&ndash;      救援物资      &ndash;&gt;-->
<!--            <el-table-column-->
<!--                    v-if="listField === 'supplies'"-->
<!--                    v-for="column in listFieldsOfSupplies"-->
<!--                    :key="column.prop"-->
<!--                    :prop="column.prop"-->
<!--                    :label="column.label"-->
<!--                    :width="column.width"-->
<!--                    show-overflow-tooltip-->
<!--            ></el-table-column>-->
<!--            &lt;!&ndash;      救援力量      &ndash;&gt;-->
<!--            <el-table-column-->
<!--                    v-if="listField === 'emergencyTeam'"-->
<!--                    v-for="column in listFieldOfEmergencyTeam"-->
<!--                    :key="column.prop"-->
<!--                    :prop="column.prop"-->
<!--                    :label="column.label"-->
<!--                    :width="column.width"-->
<!--                    show-overflow-tooltip-->
<!--            ></el-table-column>-->
<!--            &lt;!&ndash;      救灾装备      &ndash;&gt;-->
<!--            <el-table-column-->
<!--                    v-if="listField === 'reserves'"-->
<!--                    v-for="column in listFieldOfReserves"-->
<!--                    :key="column.prop"-->
<!--                    :prop="column.prop"-->
<!--                    :label="column.label"-->
<!--                    :width="column.width"-->
<!--                    show-overflow-tooltip-->
<!--            ></el-table-column>-->
<!--        </el-table>-->
<!--        <el-pagination-->
<!--            v-if="tableVisible"-->
<!--            @size-change="handleSizeChange"-->
<!--            @current-change="handleCurrentChange"-->
<!--            :current-page="currentPage"-->
<!--            :page-size="pageSize"-->
<!--            layout="total, prev, pager, next, jumper"-->
<!--            :total="total"-->
<!--            class="pagination1"-->
<!--            style="padding: 10px"-->
<!--        >-->
<!--        </el-pagination>-->
<!--        &lt;!&ndash;     数据列表end     &ndash;&gt;-->
<!--      </el-form>-->
<!--    </div>-->

<!--    <div-->
<!--        v-if="showTips"-->
<!--        id="supplies"-->
<!--        :class="{ collapsed: !tableVisible }"-->
<!--        style="margin-top: 450px; margin-left: 0%; width: 30%; overflow-y: auto; max-height: 180px;"-->
<!--        @scroll="onScroll">-->
<!--      <el-row>-->
<!--        <el-button @click="walkStyle" :style="selectedWalk">步行</el-button>-->
<!--        <el-button @click="driveStyle" :style="selectedDrive">驾驶</el-button>-->
<!--      </el-row>-->
<!--      <div slot="header" class="clearfix" style="color: white; margin-top: 5%;">-->
<!--        <div>-->
<!--          全程约 {{ totalRoute }} 米 {{ RouteWay }} 大概需要 {{ RouteTime }}-->
<!--        </div>-->
<!--        <div v-if="visibleGuilde">-->
<!--          <div v-for="(instruction, index) in RouteGuilde" :key="index">-->
<!--            {{ instruction }}-->
<!--          </div>-->
<!--          <div v-if="loading" class="loading">加载中...</div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash;   物资查询dialog   &ndash;&gt;-->
<!--    <el-dialog v-model="searchSupplyDialog" title="物资查询" width="500" class="marchSupply">-->
<!--        <el-form :model="searchSupplyForm" label-width="80px">-->
<!--            <el-row>-->
<!--                <el-col :span="12">-->
<!--                    <el-form-item label="区域">-->
<!--                        <el-input v-model="searchSupplyForm.county" autocomplete="off" />-->
<!--                    </el-form-item>-->
<!--                </el-col>-->
<!--                <el-col :span="12">-->
<!--                    <el-form-item label="地址">-->
<!--                        <el-input v-model="searchSupplyForm.address" autocomplete="off" />-->
<!--                    </el-form-item>-->
<!--                </el-col>-->
<!--            </el-row>-->
<!--            <el-row>-->
<!--                <el-col :span="12">-->
<!--                    <el-form-item label="联系人">-->
<!--                        <el-input v-model="searchSupplyForm.contactPerson" autocomplete="off" />-->
<!--                    </el-form-item>-->
<!--                </el-col>-->
<!--                <el-col :span="12">-->
<!--                    <el-form-item label="联系电话">-->
<!--                        <el-input v-model="searchSupplyForm.contactPhone" autocomplete="off" />-->
<!--                    </el-form-item>-->
<!--                </el-col>-->
<!--            </el-row>-->
<!--        </el-form>-->
<!--        <template #footer>-->
<!--            <div class="dialog-footer">-->
<!--                <el-button @click="searchSupplyDialog = false">取消</el-button>-->
<!--                <el-button type="primary" @click="searchSupply">-->
<!--                    查询-->
<!--                </el-button>-->
<!--            </div>-->
<!--        </template>-->

<!--    </el-dialog>-->

<!--      &lt;!&ndash;   救援力量查询dialog   &ndash;&gt;-->
<!--      <el-dialog v-model="searchEmergencyTeamDialog" title="救援力量查询" width="200" class="marchSupply">-->
<!--          <el-form :model="searchEmergencyTeamForm" label-width="120px">-->
<!--              <el-row>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="级别名称">-->
<!--                          <el-input v-model="searchEmergencyTeamForm.levelName" autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="队伍类型名称">-->
<!--                          <el-input v-model="searchEmergencyTeamForm.teamTypeName" autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--              </el-row>-->
<!--              <el-row>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="队伍人数">-->
<!--                          <el-input-->
<!--                                  v-model="displayTeamTotalMembers"-->
<!--                                  @input="handleTeamTotalMembersInput"-->
<!--                                  autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="地址">-->
<!--                          <el-input v-model="searchEmergencyTeamForm.address" autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--              </el-row>-->
<!--              <el-row>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="负责人">-->
<!--                          <el-input v-model="searchEmergencyTeamForm.personInCharge" autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="负责人电话">-->
<!--                          <el-input v-model="searchEmergencyTeamForm.chargePhone" autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--              </el-row>-->
<!--          </el-form>-->
<!--          <template #footer>-->
<!--              <div class="dialog-footer">-->
<!--                  <el-button @click="searchEmergencyTeamDialog = false">取消</el-button>-->
<!--                  <el-button type="primary" @click="searchEmergencyTeam">-->
<!--                      查询-->
<!--                  </el-button>-->
<!--              </div>-->
<!--          </template>-->

<!--      </el-dialog>-->

<!--    &lt;!&ndash;   物资匹配dialog   &ndash;&gt;-->
<!--    <el-dialog v-model="marchSupplyDialog" title="物资匹配" width="500" class="marchSupply">-->
<!--          <el-form :model="searchSupplyForm" label-width="80px">-->
<!--              <el-row>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="帐篷">-->
<!--                          <el-input-->
<!--                                  v-model="displayDisasterTentsCount"-->
<!--                                  @input="handleDisasterTentsInput"-->
<!--                                  placeholder="/件"-->
<!--                                  autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="手电筒">-->
<!--                          <el-input-->
<!--                                  v-model="displayFlashlightsCount"-->
<!--                                  @input="handleFlashlightsInput"-->
<!--                                  placeholder="/件"-->
<!--                                  autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--              </el-row>-->
<!--              <el-row>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="雨衣">-->
<!--                          <el-input-->
<!--                                  v-model="displayRaincoatsCount"-->
<!--                                  @input="handleRaincoatsInput"-->
<!--                                  placeholder="/件"-->
<!--                                  autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--                  <el-col :span="12">-->
<!--                      <el-form-item label="雨鞋">-->
<!--                          <el-input-->
<!--                                  v-model="displayRainBootsCount"-->
<!--                                  @input="handleRainBootsInput"-->
<!--                                  placeholder="/双"-->
<!--                                  autocomplete="off" />-->
<!--                      </el-form-item>-->
<!--                  </el-col>-->
<!--              </el-row>-->
<!--          </el-form>-->
<!--          <template #footer>-->
<!--              <div class="dialog-footer">-->
<!--                  <el-button @click="marchSupplyDialog = false">取消</el-button>-->
<!--                  <el-button type="primary" @click="marchSupplies">-->
<!--                      查询-->
<!--                  </el-button>-->
<!--              </div>-->
<!--          </template>-->

<!--      </el-dialog>-->

<!--        &lt;!&ndash;   半径查询Dialog   &ndash;&gt;-->
<!--      <el-dialog v-model="searchSupplyByRadiusDialog" title="半径查询" width="400" class="marchSupply">-->
<!--          <el-form :model="searchSupplyForm" label-width="80px">-->
<!--              <el-form-item label="匹配半径">-->
<!--                  <el-input v-model="displayRadius"-->
<!--                            @input="handleRadiusInput"-->
<!--                            placeholder="请输入匹配的半径/km"-->
<!--                            autocomplete="off"-->
<!--                            style="width: 180px;" />-->
<!--              </el-form-item>-->
<!--          </el-form>-->
<!--          <template #footer>-->
<!--              <div class="dialog-footer">-->
<!--                  <el-button @click="searchSupplyByRadiusDialog = false">取消</el-button>-->
<!--                  <el-button type="primary" @click="marchSuppliesByRadius">-->
<!--                      查询-->
<!--                  </el-button>-->
<!--              </div>-->
<!--          </template>-->

<!--      </el-dialog>-->

<!--      <el-dialog v-model="marchRegionsDialog" title="行政区划匹配" width="400" class="marchSupply">-->
<!--          <div class="district-buttons">-->
<!--              <div v-for="district in districts" :key="district.adcode"-->
<!--                   class="district-button" :class="{ 'selected': selectedRegions.includes(district) }">-->
<!--                  <el-button @click="selectRegions(district)">-->
<!--                      {{ district.name }}-->
<!--                  </el-button>-->
<!--              </div>-->

<!--          </div>-->
<!--          <template #footer>-->
<!--              <div class="dialog-footer">-->
<!--                  <el-button @click="marchRegionsDialog = false">取消</el-button>-->
<!--                  <el-button type="primary" @click="handleDistrictClick">-->
<!--                      查询-->
<!--                  </el-button>-->
<!--              </div>-->
<!--          </template>-->
<!--      </el-dialog>-->


<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import * as Cesium from "cesium";-->
<!--import "cesium/Source/Widgets/widgets.css";-->
<!--import CesiumNavigation from "cesium-navigation-es6";-->
<!--import {initCesium} from "@/cesium/tool/initCesium.js";-->
<!--import RouterPanel from "@/components/Cesium/RouterPanel.vue";-->
<!--import cesiumPlot from "@/cesium/plot/cesiumPlot.js";-->
<!--import {getEmergency} from "@/api/system/emergency.js";-->
<!--import emergencyRescueEquipmentLogo from "@/assets/images/emergencyRescueEquipmentLogo.png"; // 抢险救灾设备-->
<!--import disasterReliefSuppliesLogo from "@/assets/images/disasterReliefSuppliesLogo.jpg"; // 救灾物资储备-->
<!--import rescueTeamsInfoLogo from "@/assets/images/rescueTeamsInfoLogo.png";-->
<!--import start from "@/assets/start.svg";-->
<!--import end from "@/assets/end.svg";-->
<!--import {Entity} from "cesium";-->
<!--import {getWay} from "@/api/system/routeplan.js";-->
<!--import {walk} from "vue/compiler-sfc";-->
<!--import {gcj02towgs84, wgs84togcj02} from "@/api/tool/wgs_gcj_encrypts.js";-->
<!--import axios from "axios"-->
<!--import yaan from "@/assets/geoJson/yaan.json";-->
<!--import { ElMessageBox, ElMessage } from 'element-plus';-->
<!--import {marchByRegion, searchEmergencyTeamData, searchMaterialData} from "../../api/system/emergency.js";-->

<!--export default {-->
<!--  components: {-->
<!--    RouterPanel,-->
<!--  },-->
<!--  name: "index",-->
<!--  data() {-->
<!--    return {-->
<!--      pos: [],-->
<!--      areas: [],-->
<!--      RouteTime: " ", //全程所需时间-->
<!--      RouteWay: " ", //行进方式-->
<!--      showTips: false, //路径弹窗-->
<!--      totalRoute: "", //全长-->
<!--      cartime: "", //临时变量-->
<!--      humantime: "", //临时变量-->
<!--      visibleGuilde: false, //驾驶时导航显示-->
<!--      selectedDrive: "",-->
<!--      selectedWalk: "",-->
<!--      RouteGuilde: [],-->
<!--      loading: false,-->
<!--      // 资源快速匹配-->
<!--      showSuppliesList: [],-->
<!--      selectedSuppliesList: [],-->
<!--      showIcon: [],-->
<!--      activeMenuIndex: '3', // 显示的一级菜单 eg.路径规划、物资匹配-->
<!--      tableVisible: true, // 显示表格-->
<!--      isCollapsed: false, // 控制是否收缩-->
<!--      searchSupplyDialog: false, // 物资查询dialog是否显示-->
<!--      searchEmergencyTeamDialog: false, // 救援力量查询dialog是否显示-->
<!--      marchSupplyDialog: false, // 物资匹配dialog是否显示-->
<!--      searchSupplyByRadiusDialog: false,  // 半径匹配dialog是否显示-->
<!--      searchSupplyResultDialog: false, // 物资匹配结果dialog是否显示-->
<!--      marchRegionsDialog: false,  //行政区划匹配dialog是否显示-->
<!--      ifDrawEllipse: false,-->
<!--      marchSupplyRadius: 0,-->
<!--      toolValue: "隐藏数据列表",-->
<!--      showSupply: "显示所有物资点",-->
<!--      total: 0,-->
<!--      pageSize: 5,-->
<!--      currentPage: 1,-->
<!--      addSupplyPointCurrently: {-->
<!--        lng: 0,-->
<!--        lat: 0,-->
<!--        count: 0,-->
<!--        position: "",-->
<!--        type: "",-->
<!--        tel: "",-->
<!--      },-->
<!--        // 物资查询/匹配表单-->
<!--      searchSupplyForm: {-->
<!--        county: "",-->
<!--        address: "",-->
<!--        contactPerson: "",-->
<!--        contactPhone: "",-->
<!--        tents: 0,-->
<!--        raincoats: 0,-->
<!--        rainBoots: 0,-->
<!--        flashlights: 0,-->
<!--        radius: 0.0,-->
<!--      },-->
<!--        // 救援力量表单-->
<!--      searchEmergencyTeamForm: {-->
<!--          levelName: '',-->
<!--          teamTypeName: '',-->
<!--          totalMembers: 0,-->
<!--          address: '',-->
<!--          personInCharge: '',-->
<!--          chargePhone: ''-->
<!--      },-->
<!--      inputRadius: "",-->
<!--      inputData: '',-->
<!--      canMarkPoint: false,-->
<!--      DialogFormVisible: false,-->
<!--      affectedPoints: [{lng: 103.0058, lat: 29.9794, position: "a"}],-->
<!--        // 救援物资字段-->
<!--      listFieldsOfSupplies: [-->
<!--          { prop: 'county', label: '区域', width: 200},-->
<!--          { prop: 'address', label: '地址', width: 320},-->
<!--          { prop: 'contactPerson', label: '联系人', width: 100},-->
<!--          { prop: 'contactPhone', label: '联系电话'},-->
<!--          { prop: 'tents', label: '帐篷总数量', width: 100 },-->
<!--          { prop: 'raincoats', label: '雨衣总数量', width: 100 },-->
<!--          { prop: 'rainBoots', label: '雨鞋总数量', width: 100 },-->
<!--          { prop: 'flashlights', label: '手电筒总数量', width: 130 }-->
<!--      ],-->
<!--        // 救灾设备字段-->
<!--      listFieldOfReserves: [-->
<!--          { prop: 'county', label: '区域', width: 200},-->
<!--          { prop: 'address', label: '地址', width: 320},-->
<!--          { prop: 'contactPerson', label: '联系人', width: 100 },-->
<!--          { prop: 'contactPhone', label: '联系电话' },-->
<!--          { prop: 'lifeJacket', label: '救生衣', width: 100 },-->
<!--          { prop: 'lifebuoy', label: '救生圈', width: 100 },-->
<!--          { prop: 'walkieTalkie', label: '对讲机', width: 100 },-->
<!--          { prop: 'portableLight', label: '照明灯', width: 130 }-->
<!--      ],-->
<!--        // 救援力量字段-->
<!--      listFieldOfEmergencyTeam: [-->
<!--          // { prop: 'county', label: '所属机构', width: 200, tooltip: true },-->
<!--          { prop: 'levelName', label: '级别名称', width: 250},-->
<!--          { prop: 'teamTypeName', label: '队伍类型名称', width: 400 },-->
<!--          { prop: 'totalMembers', label: '队伍人数', width: 120 },-->
<!--          { prop: 'address', label: '地址', width: 320 },-->
<!--          { prop: 'personInCharge', label: '负责人'},-->
<!--          { prop: 'chargePhone', label: '负责人电话', width: 200 },-->
<!--      ],-->
<!--      listField: '',  // 判断显示哪个列表-->
<!--      suppliesList: [],-->
<!--      supplyList: [],-->

<!--        labels: [],  // 保存标签实体的引用-->
<!--        regionLayerJump: null,-->
<!--        // 行政区划&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--        districts: [-->
<!--            {adcode: 511802, name: "雨城区"},-->
<!--            {adcode: 511803, name: "名山区"},-->
<!--            {adcode: 511822, name: "荥经县"},-->
<!--            {adcode: 511823, name: "汉源县"},-->
<!--            {adcode: 511824, name: "石棉县"},-->
<!--            {adcode: 511825, name: "天全县"},-->
<!--            {adcode: 511826, name: "芦山县"},-->
<!--            {adcode: 511827, name: "宝兴县"},-->
<!--        ],-->
<!--        selectedRegions: [],-->
<!--        selectedDataByRegions: {},-->

<!--      //-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;弹窗部分-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--      selectedEntityHighDiy: null,-->
<!--      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件-->
<!--      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件-->
<!--      popupData: {}, // 弹窗内容，传值给子组件-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.init();-->
<!--    this.entitiesClickPonpHandler();-->
<!--    this.initPlot(this.id);-->
<!--  },-->
<!--  beforeUnmount() {-->
<!--    if (window.viewer){-->
<!--      let viewer=window.viewer-->
<!--      let gl=viewer.scene.context._gl-->
<!--      viewer.entities.removeAll()-->
<!--      // viewer.scene.primitives.removeAll()-->
<!--      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中-->
<!--      viewer.destroy()-->
<!--      gl.getExtension("WEBGL_lose_context").loseContext();-->
<!--      console.log("webglcontext 已清除")-->
<!--      gl=null-->
<!--      window.viewer = null;-->
<!--    }-->
<!--  },-->
<!--  computed: {-->
<!--        // 以下方法确保表单字段数据为0时不显示，初始化时数据不为null，不会报错-->
<!--        displayDisasterTentsCount: {-->
<!--            get() {-->
<!--                return this.searchSupplyForm.tents === 0 ? '' : this.searchSupplyForm.tents;-->
<!--            },-->
<!--            set(value) {-->
<!--                this.searchSupplyForm.tents = value === '' ? 0 : Number(value);-->
<!--            }-->
<!--        },-->
<!--        displayFlashlightsCount: {-->
<!--            get() {-->
<!--                return this.searchSupplyForm.flashlights === 0 ? '' : this.searchSupplyForm.flashlights;-->
<!--            },-->
<!--            set(value) {-->
<!--                this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);-->
<!--            }-->
<!--        },-->
<!--        displayRaincoatsCount: {-->
<!--            get() {-->
<!--                return this.searchSupplyForm.raincoats === 0 ? '' : this.searchSupplyForm.raincoats;-->
<!--            },-->
<!--            set(value) {-->
<!--                this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);-->
<!--            }-->
<!--        },-->
<!--        displayRainBootsCount: {-->
<!--            get() {-->
<!--                return this.searchSupplyForm.rainBoots === 0 ? '' : this.searchSupplyForm.rainBoots;-->
<!--            },-->
<!--            set(value) {-->
<!--                this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);-->
<!--            }-->
<!--        },-->
<!--        displayRadius: {-->
<!--            get() {-->
<!--                return this.searchSupplyForm.radius === 0 ? '' : this.searchSupplyForm.radius;-->
<!--            },-->
<!--            set(value) {-->
<!--                this.searchSupplyForm.radius = value === '' ? 0 : value;-->
<!--            }-->
<!--        },-->
<!--      displayTeamTotalMembers: {-->
<!--          get() {-->
<!--              return this.searchEmergencyTeamForm.totalMembers === 0 ? '' : this.searchEmergencyTeamForm.totalMembers;-->
<!--          },-->
<!--          set(value) {-->
<!--              this.searchEmergencyTeamForm.totalMembers = value === '' ? 0 : Number(value);-->
<!--          }-->
<!--      }-->
<!--    },-->
<!--  methods: {-->
<!--    /** 计算两个坐标的距离，单位米 **/-->
<!--    Distance(lng1, lat1, lng2, lat2) {-->
<!--      //采用Haversine formula算法，高德地图的js计算代码，比较简洁 https://www.cnblogs.com/ggz19/p/7551088.html-->
<!--      let d = Math.PI / 180;-->
<!--      let f = lat1 * d,-->
<!--          h = lat2 * d;-->
<!--      let i = lng2 * d - lng1 * d;-->
<!--      let e =-->
<!--          (1 - Math.cos(h - f) + (1 - Math.cos(i)) * Math.cos(f) * Math.cos(h)) /-->
<!--          2;-->
<!--      return 2 * 6378137 * Math.asin(Math.sqrt(e));-->
<!--    },-->
<!--    sortedSuppliesList() {-->
<!--      // 按照 tents 排序-->
<!--      this.showSuppliesList = this.showSuppliesList-->
<!--          .slice()-->
<!--          .sort((a, b) => b.tents - a.tents);-->
<!--    },-->
<!--    toggleTable() {-->
<!--      this.tableVisible = !this.tableVisible;-->
<!--      this.toolValue = this.tableVisible ? "隐藏数据列表" : "显示数据列表";-->
<!--    },-->
<!--    init() {-->
<!--      let that = this;-->
<!--      let viewer = initCesium(Cesium);-->
<!--      viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息-->
<!--      window.viewer = viewer;-->
<!--      let options = {};-->
<!--      options.defaultResetView = Cesium.Cartographic.fromDegrees(-->
<!--          103.0,-->
<!--          29.98,-->
<!--          1500,-->
<!--          new Cesium.Cartographic()-->
<!--      );-->
<!--      options.enableCompass = true;-->
<!--      options.enableZoomControls = true;-->
<!--      options.enableDistanceLegend = true;-->
<!--      options.enableCompassOuterRing = true;-->
<!--      options.resetTooltip = "重置视图";-->
<!--      options.zoomInTooltip = "放大";-->
<!--      options.zoomOutTooltip = "缩小";-->
<!--      window.navigation = new CesiumNavigation(viewer, options);-->
<!--      document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =-->
<!--          "请输入地名进行搜索";-->
<!--      document.getElementsByClassName(-->
<!--          "cesium-baseLayerPicker-sectionTitle"-->
<!--      )[0].innerHTML = "影像服务";-->
<!--      document.getElementsByClassName(-->
<!--          "cesium-baseLayerPicker-sectionTitle"-->
<!--      )[1].innerHTML = "地形服务";-->

<!--      this.clickCount += 1;-->

<!--      const ellipsoid = viewer.scene.globe.ellipsoid;-->
<!--      const canvas = viewer.scene.canvas;-->
<!--      const handler = new Cesium.ScreenSpaceEventHandler(canvas);-->

<!--      let token = "34d101b55f6166c49c42aed5a7ed345c";-->
<!--      viewer.imageryLayers.addImageryProvider(-->
<!--          new Cesium.WebMapTileServiceImageryProvider({-->
<!--            url:-->
<!--                "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +-->
<!--                token,-->
<!--            layer: "tdtAnnoLayer",-->
<!--            style: "default",-->
<!--            format: "image/jpeg",-->
<!--            tileMatrixSetID: "GoogleMapsCompatible",-->
<!--          })-->
<!--      );-->
<!--      //影像注记-->
<!--      viewer.imageryLayers.addImageryProvider(-->
<!--          new Cesium.WebMapTileServiceImageryProvider({-->
<!--            url:-->
<!--                "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +-->
<!--                token,-->
<!--            layer: "tdtAnnoLayer",-->
<!--            style: "default",-->
<!--            format: "image/jpeg",-->
<!--            tileMatrixSetID: "GoogleMapsCompatible",-->
<!--            show: false,-->
<!--          })-->
<!--      );-->

<!--      handler.setInputAction((movement) => {-->
<!--        const cartesian = viewer.camera.pickEllipsoid(-->
<!--            movement.position,-->
<!--            ellipsoid-->
<!--        );-->
<!--        if (cartesian) {-->
<!--          const cartographic = ellipsoid.cartesianToCartographic(cartesian);-->
<!--          this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(-->
<!--              cartographic.latitude-->
<!--          ).toFixed(5);-->
<!--          this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(-->
<!--              cartographic.longitude-->
<!--          ).toFixed(5);-->

<!--          if (this.canMarkPoint) {-->
<!--            this.DialogFormVisible = true;-->
<!--            this.drawSite(-->
<!--                this.addSupplyPointCurrently.lat,-->
<!--                this.addSupplyPointCurrently.lng,-->
<!--                this.clickCount,-->
<!--                Cesium.Color.RED-->
<!--            );-->
<!--            // console.log("已添加标注点");-->
<!--            this.canMarkPoint = false;-->
<!--          }-->
<!--        }-->
<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    },-->
<!--    initPlot() {-->

<!--      getEmergency().then(res => {-->
<!--        let {emergencyRescueEquipment, disasterReliefSupplies, rescueTeamsInfo} = res;-->
<!--        console.log('获取到的res', res);-->

<!--        this.supplyList = disasterReliefSupplies-->
<!--        this.suppliesList.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo);-->

<!--        // 调用 `processPoints` 并传递不同的 `tableName`-->
<!--        this.processPoints(emergencyRescueEquipment, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");-->
<!--        this.processPoints(disasterReliefSupplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");-->
<!--        this.processPoints(rescueTeamsInfo, 'emergencyTeam', rescueTeamsInfoLogo, "应急救援力量");-->

<!--        // this.fetSupplyPoints();-->
<!--          this.listField = 'supplies'-->
<!--          this.selectedSuppliesList = this.suppliesList[0]-->
<!--          this.showIcon = this.selectedSuppliesList;-->
<!--          this.total = this.selectedSuppliesList.length;-->
<!--          this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);-->
<!--      });-->
<!--    },-->

<!--    processPoints(pointArr, type, icon, tableName) {-->
<!--      if (!Array.isArray(pointArr)) {-->
<!--        console.error(`${tableName} 数据格式不正确`, pointArr);-->
<!--        return;-->
<!--      }-->

<!--      pointArr = pointArr.filter(e => e.longitude !== null);-->

<!--      pointArr.forEach(element => {-->
<!--        // 检查是否已存在具有相同ID的实体-->
<!--        let existingEntity = window.viewer.entities.getById(element.uuid);-->
<!--        if (existingEntity) {-->
<!--          console.warn(`id为${element.uuid}的实体已存在。跳过此实体`);-->
<!--          return;-->
<!--        }-->
<!--        // 检查经度、纬度和高度是否为有效数值-->
<!--        if (isNaN(element.longitude) || isNaN(element.latitude)-->
<!--            || element.longitude < -180 || element.longitude > 180-->
<!--            || element.latitude < -90 || element.latitude > 90) {-->
<!--          console.log(`id为${element.uuid}的实体的坐标无效或超出范围`, element.longitude, element.latitude);-->
<!--          return;-->
<!--        }-->
<!--          let longitude = Number(element.longitude);-->
<!--          let latitude = Number(element.latitude);-->

<!--        element.type = type;-->
<!--        element.icon = icon-->

<!--          let bool = type === 'supplies' ? true : false-->

<!--        // 添加实体-->
<!--        this.addEntity(element, icon, tableName, longitude, latitude,bool);-->
<!--      });-->
<!--    },-->

<!--    addEntity(element, icon, tableName, longitude, latitude,bool) {-->
<!--      window.viewer.entities.add({-->
<!--        uuid: element.uuid,-->
<!--        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),-->
<!--        billboard: {-->
<!--          image: icon,-->
<!--          width: 40,-->
<!--          height: 40,-->
<!--          eyeOffset: new Cesium.Cartesian3(0, 0, 0),-->
<!--          color: Cesium.Color.WHITE.withAlpha(1),-->
<!--          scale: 0.8,-->
<!--          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地-->
<!--          depthTest: bool ? true : false, // 让 Cesium 正确处理图标的遮挡关系-->
<!--          disableDepthTestDistance: Number.POSITIVE_INFINITY-->
<!--        },-->
<!--        properties: {-->
<!--          tableName: tableName, // 动态传入的表名称-->
<!--          ...element, // 将element对象展开，自动填充所有属性-->
<!--          longitude: element.longitude,-->
<!--          latitude: element.latitude-->
<!--        }-->
<!--      });-->
<!--    },-->

<!--    isTerrainLoaded() {-->
<!--      let terrainProvider = window.viewer.terrainProvider;-->
<!--      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {-->
<!--        // console.log("地形未加载")-->
<!--        return false;-->
<!--      } else if (Cesium.defined(terrainProvider)) {-->
<!--        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，-->
<!--        // 则表示已经设置了其他地形提供者-->
<!--        // console.log("地形已加载")-->
<!--        return true;-->
<!--      }-->
<!--      // console.log("地形未加载")-->
<!--      return false;-->
<!--    },-->
<!--    entitiesClickPonpHandler() {-->
<!--      let that = this;-->
<!--      // 处理点击事件-->
<!--      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {-->
<!--        // 获取点击位置的实体-->
<!--        let pickedEntity = window.viewer.scene.pick(click.position);-->
<!--        window.selectedEntity = pickedEntity?.id;-->

<!--        if (Cesium.defined(pickedEntity)) {-->
<!--          let entity = window.selectedEntity;-->

<!--          // 判断实体类型并处理-->
<!--          if (entity._billboard) {-->
<!--            // 获取点击点的经纬度-->
<!--            let ray = viewer.camera.getPickRay(click.position);-->
<!--            let position = viewer.scene.globe.pick(ray, viewer.scene);-->
<!--            let cartographic = Cesium.Cartographic.fromCartesian(position);-->
<!--            let latitude = Cesium.Math.toDegrees(cartographic.latitude);-->
<!--            let longitude = Cesium.Math.toDegrees(cartographic.longitude);-->

<!--            // 如果有地形加载，更新高度-->
<!--            let height = 0;-->
<!--            if (this.isTerrainLoaded()) {-->
<!--              height = viewer.scene.globe.getHeight(cartographic);-->
<!--            }-->

<!--            // 更新弹窗位置-->
<!--            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);-->

<!--            // that.popupData = entity.properties;-->

<!--            // 解析 properties 以获取实际的数据-->
<!--            let properties = {};-->
<!--            entity.properties.propertyNames.forEach(name => {-->
<!--              properties[name] = entity.properties[name].getValue();-->
<!--            });-->
<!--            that.popupData = properties;-->
<!--            console.log("entity.properties作为弹窗数据:", that.popupData);-->

<!--            this.popupVisible = true;-->
<!--            this.updatePopupPosition();-->
<!--          } else {-->
<!--            this.popupVisible = false;-->
<!--          }-->

<!--          // 处理面实体-->
<!--          if (entity._polygon) {-->
<!--            that.showPolygon = true;-->
<!--          } else {-->
<!--            that.showPolygon = false;-->
<!--          }-->

<!--          // 处理线实体-->
<!--          if (entity._polyline) {-->
<!--            let status = cesiumPlot.drawPolylineStatus();-->
<!--            that.showPolyline = (status === 0);-->
<!--          } else {-->
<!--            that.showPolyline = false;-->
<!--          }-->
<!--        } else {-->
<!--          this.popupVisible = false;-->
<!--        }-->

<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->

<!--      // 确保在地图拖动时弹窗位置更新-->
<!--      window.viewer.screenSpaceEventHandler.setInputAction(movement => {-->
<!--        if (that.popupVisible && window.selectedEntity) {-->
<!--          that.updatePopupPosition();-->
<!--        }-->
<!--      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);-->
<!--    },-->
<!--    //&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;弹窗&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--    // 判断是否有高程-->
<!--    // 更新弹窗的位置-->
<!--    updatePopupPosition() {-->
<!--      // 笛卡尔3转笛卡尔2（屏幕坐标）-->
<!--      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(-->
<!--          window.viewer.scene,-->
<!--          this.selectedEntityHighDiy-->
<!--      );-->
<!--      if (canvasPosition) {-->
<!--        this.popupPosition = {-->
<!--          x: canvasPosition.x, //+ 20,-->
<!--          y: canvasPosition.y, //- 60 // 假设弹窗应该在图标上方 50px 的位置-->
<!--        };-->
<!--      }-->
<!--    },-->

<!--    //-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;附近资源快速匹配&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--    //-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;行政区划匹配-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->

<!--      // 行政区划匹配dialog选中函数-->
<!--    selectRegions(district){-->
<!--        const index = this.selectedRegions.indexOf(district);-->
<!--        if (index === -1) {-->
<!--            this.selectedRegions = []-->
<!--            this.selectedRegions.push(district); // 添加选中-->
<!--        } else {-->
<!--            this.selectedRegions.splice(index, 1); // 取消选中-->
<!--        }-->
<!--    },-->

<!--    handleDistrictClick() {-->
<!--        let district = this.selectedRegions[0]-->
<!--        //清除其他实体标签-->
<!--        this.removethdRegions()-->
<!--        this.removeDataSourcesLayer('YaanRegionLayer');-->
<!--        // this.visible = false;-->
<!--        // 根据区县代码过滤GeoJSON数据-->
<!--        let filteredFeatures = yaan.features.filter(feature => {-->
<!--            return feature.properties.adcode === district.adcode;-->
<!--        });-->
<!--        if (filteredFeatures.length > 0) {-->

<!--            console.log("filteredFeatures-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",filteredFeatures)-->

<!--            this.removePoints(this.suppliesList[0]);-->
<!--            this.removePoints(this.suppliesList[1]);-->
<!--            this.removePoints(this.suppliesList[2]);-->

<!--            // 创建一个经过过滤的GeoJSON对象，包含过滤后的特性数据-->
<!--            let filteredGeoJson = {-->
<!--                type: "FeatureCollection",-->
<!--                features: filteredFeatures-->
<!--            };-->

<!--            // 使用Cesium的GeoJsonDataSource.load方法加载经过过滤的GeoJSON数据-->
<!--            // 该方法用于将GeoJSON数据转换为Cesium的数据源，以便在3D地图中显示-->
<!--            // 在加载时，设置了数据源的样式属性，包括边颜色、填充颜色和边宽度-->
<!--            let geoPromise = Cesium.GeoJsonDataSource.load(filteredGeoJson, {-->
<!--                clampToGround: true, //贴地显示-->
<!--                stroke: Cesium.Color.RED,-->
<!--                fill: Cesium.Color.SKYBLUE.withAlpha(0.5),-->
<!--                strokeWidth: 10,-->
<!--            });-->

<!--            // 处理地理空间数据的Promise对象-->
<!--            geoPromise.then(async (dataSource) => {-->
<!--                // 将数据源添加到观众的数据显示中-->
<!--                window.viewer.dataSources.add(dataSource);-->
<!--                // 保存区域图层以便后续使用-->
<!--                window.regionLayerJump = dataSource-->

<!--                console.log("filteredFeatures-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;", filteredFeatures[0].geometry.coordinates)-->
<!--                // 遍历每个过滤后的地理特征-->
<!--                filteredFeatures.forEach((feature) => {-->
<!--                    // 获取特征的中心点坐标-->
<!--                    let center = feature.properties.center;-->

<!--                    // 检查中心点是否定义且格式正确-->
<!--                    if (center && center.length === 2) {-->
<!--                        // 将地理坐标转换为三维空间中的位置-->
<!--                        let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);-->
<!--                        // 创建并添加标签实体到观众的实体集合中-->
<!--                        let labelEntity = viewer.entities.add(new Cesium.Entity({-->
<!--                            position: position,-->
<!--                            label: new Cesium.LabelGraphics({-->
<!--                                text: district.name,  // 标签文本为区域名称-->
<!--                                scale: 1,  // 标签缩放比例-->
<!--                                font: "bolder 50px sans-serif",  // 标签字体样式-->
<!--                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 标签样式为填充和轮廓-->
<!--                                fillColor: Cesium.Color.fromCssColorString("#ffffff"),  // 标签填充颜色-->
<!--                                pixelOffset: new Cesium.Cartesian2(0, -60)  // 标签像素偏移量，用于调整位置-->
<!--                            })-->
<!--                        }));-->
<!--                        // 保存标签实体的引用，以便后续管理和操作-->
<!--                        this.labels.push(labelEntity);-->
<!--                    } else {-->
<!--                        // 如果中心点未定义或格式不正确，输出警告信息-->
<!--                        console.warn('中心点未定义或格式不正确:', feature);-->
<!--                    }-->
<!--                });-->



<!--                // 飞行到数据源中的实体位置，以便用户查看-->
<!--                viewer.flyTo(dataSource.entities.values);-->

<!--                // // 检查标绘点是否在范围内-->
<!--                // let boundingBox = this.getBoundingBox(filteredFeatures[0].geometry.coordinates[0]);-->
<!--                // console.log("边界框:", boundingBox);-->
<!--                //-->

<!--            }).catch((error) => {-->
<!--                // 如果加载GeoJSON数据失败，输出错误信息-->
<!--                console.error("加载GeoJSON数据失败:", error);-->
<!--            });-->

<!--            let obj = {-->
<!--                regionCode: this.selectedRegions[0].adcode-->
<!--            }-->
<!--            marchByRegion(obj).then(res => {-->
<!--                console.log("marchByRegion-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",res)-->
<!--                let suppliesArr = res.insideDisasterReliefSupplies-->
<!--                let emergencyTeamArr = res.insideRescueTeamsInfo-->
<!--                let reservesArr = res.insideEmergencyRescueEquipment-->
<!--                this.selectedDataByRegions = {suppliesArr,emergencyTeamArr,reservesArr}-->
<!--                console.log("selectedDataByRegions&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",this.selectedDataByRegions)-->

<!--                this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");-->
<!--                this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");-->
<!--                this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");-->
<!--                this.listField = 'supplies'-->
<!--                this.changeDataList('supplies')-->
<!--            })-->
<!--        } else {-->
<!--            // console.error("未找到对应的区县:", adcode);-->
<!--        }-->
<!--        this.selectedRegions = []-->
<!--        this.marchRegionsDialog = false-->
<!--      },-->

<!--      removethdRegions() {-->
<!--          // 检查是否存在名为regionLayerJump的图层-->
<!--          if (window.regionLayerJump) {-->
<!--              // 从viewer的数据源中移除图层，第二个参数为true表示强制移除-->
<!--              window.viewer.dataSources.remove(window.regionLayerJump, true);-->
<!--              // 清空regionLayerJump的引用，以便垃圾回收-->
<!--              window.regionLayerJump = null;-->


<!--              // console.log("图层已移除");-->
<!--          }-->
<!--          // this.isShowYaanRegionLegend = false;-->
<!--          // 获取图例容器，准备清空其内容-->
<!--          // const legend = document.getElementById('legend');-->
<!--          // 循环移除图例容器中的所有子元素-->
<!--          // while (legend.firstChild) {-->
<!--          //     legend.removeChild(legend.firstChild);-->
<!--          // }-->
<!--          // 遍历标签数组，移除每个标签实体-->
<!--          this.labels.forEach(label => {-->
<!--              window.viewer.entities.remove(label);-->
<!--          });-->
<!--          // 清空标签引用数组，以便垃圾回收-->
<!--          this.labels = [];-->
<!--      },-->
<!--      removeDataSourcesLayer(layerName) {-->
<!--          // 通过图层名称获取数据源对象如果存在，则执行移除操作-->
<!--          const dataSource = window.viewer.dataSources.getByName(layerName)[0];-->
<!--          if (dataSource) {-->
<!--              window.viewer.dataSources.remove(dataSource);-->
<!--          }-->
<!--      },-->

<!--    // 切换数据列表-->
<!--    changeDataList(param){-->
<!--        this.selectedSuppliesList = []-->
<!--        let flag = Object.keys(this.selectedDataByRegions).length === 0 ? false : true-->

<!--      if(param === 'supplies'){-->
<!--          this.listField = 'supplies'-->
<!--          this.selectedSuppliesList = flag ? this.selectedDataByRegions.suppliesArr : this.suppliesList[0]-->
<!--      }else if(param === 'emergencyTeam'){-->
<!--          this.listField = 'emergencyTeam'-->
<!--          this.selectedSuppliesList = flag ? this.selectedDataByRegions.emergencyTeamArr : this.suppliesList[2]-->
<!--      }else{-->
<!--          this.listField = 'reserves'-->
<!--          this.selectedSuppliesList = flag ? this.selectedDataByRegions.reservesArr : this.suppliesList[1]-->
<!--      }-->
<!--        this.showIcon = this.selectedSuppliesList;-->
<!--        this.total = this.selectedSuppliesList.length;-->
<!--        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);-->
<!--    },-->

<!--    // 绘制点-->
<!--    drawSite(lat, lng, id, color) {-->
<!--      let point = {-->
<!--        id: id,-->
<!--        position: Cesium.Cartesian3.fromDegrees(-->
<!--            parseFloat(lng),-->
<!--            parseFloat(lat)-->
<!--        ),-->
<!--      };-->
<!--      this.affectedPoints.push(point);-->
<!--      if (viewer) {-->
<!--        viewer.entities.add({-->
<!--          position: point.position,-->
<!--          point: {-->
<!--            pixelSize: 10,-->
<!--            color: color,-->
<!--          },-->
<!--        });-->
<!--      }-->
<!--    },-->

<!--    // 点击列表某行显示对应标绘点-->
<!--    showSupplyPoint(row) {-->
<!--      console.log("点击了：", row);-->
<!--      this.showIcon = [];-->
<!--      this.showIcon.push(row);-->
<!--      this.removePoints(this.suppliesList[0]);-->
<!--      this.removePoints(this.suppliesList[1]);-->
<!--      this.removePoints(this.suppliesList[2]);-->
<!--      if (this.showIcon[0].type === "supplies") {-->
<!--          this.processPoints(this.showIcon, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");-->
<!--      } else if (this.showIcon[0].type === "reserves") {-->
<!--          this.processPoints(this.showIcon, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");-->
<!--      } else {-->
<!--          this.processPoints(this.showIcon, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");-->
<!--      }-->
<!--    },-->

<!--    // 移除地图上的标绘点-->
<!--    removePoints(entityArr) {-->
<!--        entityArr.forEach((entity) => {-->
<!--            // console.log("-&#45;&#45;&#45;&#45;", entity);-->
<!--            let uuid = entity.uuid;-->
<!--            window.viewer.entities.values.forEach((existingEntity) => {-->
<!--                if (existingEntity.uuid === uuid) {-->
<!--                    window.viewer.entities.remove(existingEntity);-->
<!--                }-->
<!--            });-->
<!--        });-->
<!--    },-->

<!--    // 显示所有标绘点-->
<!--    showAllSupplyPoints() {-->
<!--      let that = this;-->
<!--      viewer.entities.values.forEach((entity) => {-->
<!--        if (entity.ellipse) {-->
<!--          viewer.entities.remove(entity);-->
<!--        }-->
<!--      });-->
<!--      this.removePoints(that.showIcon);-->
<!--      this.removePoints(that.selectedSuppliesList);-->
<!--        this.removethdRegions()-->
<!--        this.removeDataSourcesLayer('YaanRegionLayer');-->
<!--      this.initPlot()-->
<!--    },-->

<!--    // 物资查询-->
<!--    async searchSupply(){-->
<!--        let that = this;-->
<!--        this.activeMenuIndex = '2'-->
<!--        viewer.entities.values.forEach((entity) => {-->
<!--            if (entity.ellipse) {-->
<!--                viewer.entities.remove(entity);-->
<!--            }-->
<!--        });-->
<!--        this.removePoints(that.showIcon);-->
<!--        this.removePoints(that.selectedSuppliesList);-->
<!--        this.removePoints(this.suppliesList[0]);-->
<!--        this.removePoints(this.suppliesList[1]);-->
<!--        this.removePoints(this.suppliesList[2]);-->
<!--        let result = []-->
<!--        this.ifDrawEllipse = false-->
<!--        this.selectedSuppliesList = []-->
<!--        // 字符串部分到后端查询-->
<!--        let obj = {-->
<!--            county: this.searchSupplyForm.county,-->
<!--            address: this.searchSupplyForm.address,-->
<!--            contactPerson: this.searchSupplyForm.contactPerson,-->
<!--            contactPhone: this.searchSupplyForm.contactPhone,-->
<!--        }-->
<!--        await searchMaterialData(obj).then(res => {-->
<!--            // console.log("search&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",res)-->
<!--            result = res-->
<!--            this.selectedSuppliesList = result-->
<!--        })-->
<!--        this.drawSupplyPoint('searchSupplies')-->
<!--        this.listField = 'supplies'-->
<!--        this.activeMenuIndex = '3'-->
<!--        this.searchSupplyDialog = false-->
<!--        this.searchSupplyForm = {-->
<!--            county: "",-->
<!--            address: "",-->
<!--            contactPerson: "",-->
<!--            contactPhone: "",-->
<!--            tents: 0,-->
<!--            raincoats: 0,-->
<!--            rainBoots: 0,-->
<!--            flashlights: 0,-->
<!--            radius: 0.0,-->
<!--        }-->
<!--        // console.log("this.activeMenuIndex&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",this.activeMenuIndex)-->
<!--    },-->

<!--    // 救援力量查询-->
<!--    async searchEmergencyTeam(){-->
<!--        let that = this;-->
<!--        this.activeMenuIndex = '2'-->
<!--        viewer.entities.values.forEach((entity) => {-->
<!--            if (entity.ellipse) {-->
<!--                viewer.entities.remove(entity);-->
<!--            }-->
<!--        });-->
<!--        this.removePoints(that.showIcon);-->
<!--        this.removePoints(that.selectedSuppliesList);-->
<!--        this.removePoints(this.suppliesList[0]);-->
<!--        this.removePoints(this.suppliesList[1]);-->
<!--        this.removePoints(this.suppliesList[2]);-->
<!--        this.ifDrawEllipse = false-->
<!--        this.selectedSuppliesList = []-->
<!--        await searchEmergencyTeamData(this.searchEmergencyTeamForm).then(res => {-->
<!--            this.selectedSuppliesList = res-->
<!--            console.log("-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",this.selectedSuppliesList)-->

<!--        })-->
<!--        this.drawSupplyPoint('searchEmergencyTeam')-->
<!--        this.listField = 'emergencyTeam'-->
<!--        this.activeMenuIndex = '4'-->
<!--        this.searchEmergencyTeamDialog = false-->
<!--        this.searchEmergencyTeamForm = {-->
<!--            levelName: '',-->
<!--            teamTypeName: '',-->
<!--            totalMembers: 0,-->
<!--            address: '',-->
<!--            personInCharge: '',-->
<!--            chargePhone: ''-->
<!--        }-->
<!--    },-->

<!--    // 物资匹配dialog能打开-->
<!--    async marchSupply(){-->
<!--      if(this.addSupplyPointCurrently.lat === 0){-->
<!--          await ElMessageBox.alert('请先添加受灾点。', '提示', {-->
<!--              confirmButtonText: '确认',-->
<!--          });-->
<!--      }else{-->
<!--          this.marchSupplyDialog = true-->
<!--      }-->
<!--    },-->
<!--    // 物资匹配-->
<!--    async marchSupplies(){-->
<!--        this.removePoints(this.suppliesList[0]);-->
<!--        this.removePoints(this.suppliesList[1]);-->
<!--        this.removePoints(this.suppliesList[2]);-->
<!--        let result = this.supplyList-->
<!--        let radiusResult = []-->
<!--        let countResult = []-->
<!--        this.selectedSuppliesList = []-->
<!--        // console.log("result-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",result)-->
<!--        let i = 1.0-->
<!--        let flag = false-->
<!--        while (i < 15.0 && !flag){-->
<!--            radiusResult = await this.marchSupplyByRadius(result,i)-->
<!--            // console.log("radiusResult-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",radiusResult)-->
<!--            countResult = this.marchSupplyByCount(radiusResult)-->
<!--            // console.log("countResult-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;", countResult);-->
<!--            if(countResult.length > 0){-->
<!--                flag = true-->
<!--                this.marchSupplyRadius = i-->
<!--            }-->
<!--            i++-->
<!--        }-->
<!--        if(flag){-->
<!--            this.selectedSuppliesList = countResult-->
<!--            await ElMessageBox.alert(`物资匹配成功！查询半径为 ${i - 1} 公里。`, '提示', {-->
<!--                confirmButtonText: '确认',-->
<!--            });-->
<!--            this.ifDrawEllipse = true-->
<!--            this.drawSupplyPoint("searchSupplies",this.marchSupplyRadius)-->
<!--        }else{-->
<!--            this.selectedSuppliesList = []-->
<!--            await ElMessageBox.alert('15公里范围内未匹配到合适的物资。', '提示', {-->
<!--                confirmButtonText: '确认',-->
<!--            });-->
<!--        }-->
<!--        this.marchSupplyDialog = false-->
<!--    },-->

<!--    // 半径查询-->
<!--    async searchSuppliesByRadius(){-->
<!--        if(this.addSupplyPointCurrently.lat === 0){-->
<!--            await ElMessageBox.alert('请先添加受灾点。', '提示', {-->
<!--                confirmButtonText: '确认',-->
<!--            });-->
<!--        }else{-->
<!--            this.searchSupplyByRadiusDialog = true-->
<!--        }-->
<!--    },-->

<!--    // 通过半径匹配物资-->
<!--    async marchSuppliesByRadius(){-->
<!--        this.ifDrawEllipse = true-->
<!--      this.selectedSuppliesList = await this.marchSupplyByRadius(this.supplyList,this.searchSupplyForm.radius)-->
<!--        this.drawSupplyPoint("searchSupplies",this.searchSupplyForm.radius)-->
<!--        this.searchSupplyByRadiusDialog = false-->
<!--    },-->
<!--    // 半径匹配-->
<!--    async marchSupplyByRadius(array,radius){-->
<!--        // 移除现有的点-->
<!--        this.removePoints(this.suppliesList[0]);-->
<!--        this.removePoints(this.suppliesList[1]);-->
<!--        this.removePoints(this.suppliesList[2]);-->
<!--        let result = []-->
<!--        let longitude = parseFloat(this.addSupplyPointCurrently.lng);-->
<!--        let latitude = parseFloat(this.addSupplyPointCurrently.lat);-->
<!--        const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);-->
<!--        array.forEach((point) => {-->
<!--            const pointLongitude = parseFloat(point.longitude);-->
<!--            const pointLatitude = parseFloat(point.latitude);-->
<!--            const initialPoint = Cesium.Cartesian3.fromDegrees(-->
<!--                pointLongitude,-->
<!--                pointLatitude-->
<!--            );-->
<!--            // 距离以公里为单位-->
<!--            const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;-->
<!--            if (distance < radius) {-->
<!--                result.push(point);-->
<!--            }-->
<!--        });-->
<!--        return result-->
<!--    },-->
<!--    // 通过目标数量匹配物资-->
<!--    marchSupplyByCount(array){-->
<!--        let tents = 0-->
<!--        let raincoats = 0-->
<!--        let rainBoots = 0-->
<!--        let flashlights = 0-->
<!--        let flag = false-->
<!--        let bool1 = this.searchSupplyForm.tents > 0 ? false : true-->
<!--        let bool2 = this.searchSupplyForm.raincoats > 0 ? false : true-->
<!--        let bool3 = this.searchSupplyForm.rainBoots > 0 ? false : true-->
<!--        let bool4 = this.searchSupplyForm.flashlights > 0 ? false : true-->
<!--        let resultArray = []-->
<!--        array.forEach((ele) => {-->
<!--            if(ele.tents === 0){-->
<!--                bool1 = true-->
<!--            }-->
<!--            if(ele.raincoats === 0){-->
<!--                bool2 = true-->
<!--            }-->
<!--            if(ele.rainBoots === 0){-->
<!--                bool3 = true-->
<!--            }-->
<!--            if(ele.flashlights === 0){-->
<!--                bool4 = true-->
<!--            }-->
<!--            if(!bool1 || !bool2 || !bool3 || !bool4){-->
<!--                tents += ele.tents;-->
<!--                raincoats += ele.raincoats;-->
<!--                rainBoots += ele.rainBoots;-->
<!--                flashlights += ele.flashlights;-->
<!--                // console.log("rainBoots=====-&#45;&#45;&#45;&#45;",rainBoots)-->
<!--                if (tents >= this.searchSupplyForm.tents-->
<!--                    && raincoats >= this.searchSupplyForm.raincoats-->
<!--                    && rainBoots >= this.searchSupplyForm.rainBoots-->
<!--                    && flashlights >= this.searchSupplyForm.flashlights) {-->
<!--                    flag = true;-->
<!--                }-->
<!--                resultArray.push(ele)-->
<!--            }-->
<!--        });-->
<!--        // console.log("flag-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",flag)-->
<!--        if(flag){-->
<!--            return resultArray-->
<!--        }else{-->
<!--            return []-->
<!--        }-->
<!--    },-->

<!--      drawSupplyPoint(param,radius) {-->
<!--        this.total = this.selectedSuppliesList.length;-->
<!--        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);-->
<!--        this.removePoints(this.showIcon);-->
<!--        this.showIcon = [];-->
<!--        this.showIcon = this.selectedSuppliesList;-->
<!--          // console.log("this.selectedSuppliesList-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;",this.selectedSuppliesList)-->
<!--        let reservesArr = []  // 抢险救灾装备-->
<!--        let suppliesArr = []  // 救灾物资储备-->
<!--        let emergencyTeamArr = []  // 救援力量-->
<!--        if(param === 'searchSupplies'){-->
<!--            this.showIcon.forEach((item) => {-->
<!--                suppliesArr.push(item)-->
<!--            })-->
<!--        }else if(param === 'searchEmergencyTeam'){-->
<!--            this.showIcon.forEach((item) => {-->
<!--                emergencyTeamArr.push(item)-->
<!--            })-->
<!--        }else if(param === 'searchReserves'){-->
<!--            this.showIcon.forEach((item) => {-->
<!--                reservesArr.push(item)-->
<!--            })-->
<!--        }-->
<!--        else{-->
<!--            this.showIcon.forEach((item) => {-->
<!--                if (item.type === "reserves") {-->
<!--                    reservesArr.push(item);-->
<!--                } else if (item.type === "supplies") {-->
<!--                    suppliesArr.push(item);-->
<!--                } else {-->
<!--                    emergencyTeamArr.push(item);-->
<!--                }-->
<!--            });-->
<!--        }-->
<!--        this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");-->
<!--        this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");-->
<!--        this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");-->
<!--        if(this.ifDrawEllipse){-->
<!--            this.selectPoints(radius);-->
<!--        }-->
<!--      // }-->

<!--    },-->
<!--    // 查询指定范围内的物资点-->

<!--    selectPoints(radius) {-->
<!--      if (!isNaN(parseFloat(radius))) {-->
<!--        radius = parseFloat(radius) * 1000;-->

<!--        // 将经纬度转换为 Cartesian3 类型-->
<!--        const position = Cesium.Cartesian3.fromDegrees(-->
<!--            parseFloat(this.addSupplyPointCurrently.lng),-->
<!--            parseFloat(this.addSupplyPointCurrently.lat)-->
<!--        );-->
<!--        viewer.entities.values.forEach((entity) => {-->
<!--          if (entity.ellipse) {-->
<!--            viewer.entities.remove(entity);-->
<!--          }-->
<!--        });-->
<!--        viewer.entities.add({-->
<!--          position: position,-->
<!--          ellipse: {-->
<!--            semiMajorAxis: radius,-->
<!--            semiMinorAxis: radius,-->
<!--            material: Cesium.Color.GREEN.withAlpha(0.5),-->
<!--          },-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--    // 添加物资点-->
<!--    addDisasterPoint() {-->
<!--      this.canMarkPoint = true;-->
<!--    },-->
<!--      // 以下方法确保表单字段数据为0时不显示，且初始化时数据不为null，不会报错-->
<!--    handleDisasterTentsInput(value) {-->
<!--        this.searchSupplyForm.tents = value === '' ? 0 : Number(value);-->
<!--    },-->
<!--    handleFlashlightsInput(value) {-->
<!--        this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);-->
<!--    },-->
<!--    handleRaincoatsInput(value) {-->
<!--        this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);-->
<!--    },-->
<!--    handleRainBootsInput(value) {-->
<!--        this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);-->
<!--    },-->
<!--    handleRadiusInput(value) {-->
<!--        this.searchSupplyForm.radius = value;-->
<!--    },-->
<!--    handleTeamTotalMembersInput(){-->
<!--        this.searchEmergencyTeamForm.totalMembers = value-->
<!--    },-->
<!--      // -&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--    getPageArr(arr) {-->
<!--      let newArr = [];-->
<!--      let start = (this.currentPage - 1) * this.pageSize;-->
<!--      let end = this.currentPage * this.pageSize;-->
<!--      if (end > this.total) {-->
<!--        end = this.total;-->
<!--      }-->
<!--      for (; start < end; start++) {-->
<!--        newArr.push(arr[start]);-->
<!--      }-->
<!--      return newArr;-->
<!--    },-->
<!--    handleSizeChange(val) {-->
<!--      this.pageSize = val;-->
<!--      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);-->
<!--    },-->
<!--    handleCurrentChange(val) {-->
<!--      this.currentPage = val;-->
<!--      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);-->
<!--    },-->
<!--    tableHeaderColor() {-->
<!--      return {-->
<!--        "border-width": "1px",-->
<!--        "border-style": "solid",-->
<!--        "border-color": "#555555",-->
<!--        "background-color": "#293038 !important", // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效-->
<!--        color: "#fff",-->
<!--        padding: "0",-->
<!--        "text-align": "center",-->
<!--      };-->
<!--    },-->
<!--    // 修改table header的背景色-->
<!--    tableColor({row, column, rowIndex, columnIndex}) {-->
<!--      if (rowIndex % 2 == 1) {-->
<!--        return {-->
<!--          "border-width": "1px",-->
<!--          "border-style": "solid",-->
<!--          "border-color": "#555555",-->
<!--          "background-color": "#313a44",-->
<!--          color: "#fff",-->
<!--          padding: "0",-->
<!--          "text-align": "center",-->
<!--        };-->
<!--      } else {-->
<!--        return {-->
<!--          "border-width": "1px",-->
<!--          "border-style": "solid",-->
<!--          "border-color": "#555555",-->
<!--          "background-color": "#304156",-->
<!--          color: "#fff",-->
<!--          padding: "0",-->
<!--          "text-align": "center",-->
<!--        };-->
<!--      }-->
<!--    },-->
<!--    //- -&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--    /** 以坐标点为中心，简单粗略的创建一个指定半径的圆，半径单位米，pointCount为构建圆的坐标点数（比如24个点，点越多越圆，最少3个点），返回构成圆的坐标点数组 **/-->
<!--    CreateSimpleCircle(lng, lat, radius, pointCount) {-->
<!--      //球面坐标不会算，转换成三角坐标简单点，经度代表值大约：0.01≈1km 0.1≈10km 1≈100km 10≈1000km-->
<!--      let km = radius / 1000;-->
<!--      let a = km < 5 ? 0.01 : km < 50 ? 0.1 : km < 500 ? 1 : 10;-->
<!--      let b = this.Distance(lng, lat, lng + a, lat);-->
<!--      let c = this.Distance(lng, lat, lng, lat + a);-->
<!--      let rb = (radius / b) * a;-->
<!--      let rc = (radius / c) * a;-->
<!--      let arr = [];-->
<!--      let n = 0,-->
<!--          step = 360.0 / pointCount,-->
<!--          N = 360 - step / 2; //注意浮点数±0.000000001的差异-->
<!--      for (let i = 0; n < N; i++, n += step) {-->
<!--        let x = lng + rb * Math.cos((n * Math.PI) / 180);-->
<!--        let y = lat + rc * Math.sin((n * Math.PI) / 180);-->
<!--        arr[i] = [x, y];-->
<!--      }-->
<!--      arr.push([arr[0][0], arr[0][1]]); //闭环-->
<!--      return arr;-->
<!--    },-->
<!--    formatTime(minutes) {-->
<!--      const hours = Math.floor(minutes / 60); // 计算小时数-->
<!--      const remainingMinutes = Math.round(minutes % 60); // 计算剩余的分钟数并四舍五入-->
<!--      return `${hours > 0 ? hours + '小时' : ''}${remainingMinutes}分钟`;-->
<!--    },-->
<!--    walkStyle() {-->
<!--      this.visibleGuilde = false;-->
<!--      this.RouteTime = this.formatTime(this.humantime);-->
<!--      this.RouteWay = "步行";-->
<!--      this.selectedDrive = "backcolor: red";-->
<!--      this.selectedWalk = "backcolor: white";-->
<!--    },-->
<!--    driveStyle() {-->
<!--      this.visibleGuilde = true;-->
<!--      if (this.cartime.includes("0时0分钟")) {-->
<!--        this.RouteTime = "1分钟";-->
<!--      } else {-->
<!--        this.RouteTime = this.formatTime(this.cartime);-->
<!--      }-->
<!--      this.RouteWay = "驾驶";-->
<!--    },-->

<!--    onScroll(event) {-->
<!--      const container = event.target;-->
<!--      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight;-->
<!--      if (bottom && !this.loading) {-->
<!--        this.loadMoreGuide();-->
<!--      }-->
<!--    },-->
<!--    async loadMoreGuide() {-->
<!--      this.loading = true;-->
<!--      try {-->
<!--        // 调用API获取更多的指南数据-->
<!--        const newGuides = await this.fetchMoreGuides();-->
<!--        this.RouteGuilde = [...this.RouteGuilde, ...newGuides];-->
<!--      } catch (error) {-->
<!--        console.error('Failed to load more guides', error);-->
<!--      } finally {-->
<!--        this.loading = false;-->
<!--      }-->
<!--    },-->
<!--    async fetchMoreGuides() {-->
<!--      // 实现调用API逻辑-->
<!--      return []; // 返回新的指南数据-->
<!--    },-->
<!--    route() {-->
<!--      let handler = new Cesium.ScreenSpaceEventHandler(-->
<!--          window.viewer.scene.canvas-->
<!--      );-->
<!--      let that = this;-->
<!--      let propertiesId = [];-->
<!--      handler.setInputAction((event) => {-->
<!--        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）-->
<!--        let ray = viewer.camera.getPickRay(event.position);-->
<!--        let position = viewer.scene.globe.pick(ray, viewer.scene);-->
<!--        // // 1-2 坐标系转换-->
<!--        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度-->
<!--        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度-->
<!--        let lat = Cesium.Math.toDegrees(cartographic.latitude);-->

<!--        that.pos.push([lon, lat]);-->
<!--        let billBoardId = Date.now();-->
<!--        if (that.pos.length === 1) {-->
<!--          that.billboardD(position, start, billBoardId);-->
<!--          propertiesId.push(billBoardId);-->
<!--        } else {-->
<!--          that.billboardD(position, end, billBoardId);-->
<!--          propertiesId.push(billBoardId);-->
<!--        }-->
<!--        if (that.pos.length === 2) {-->
<!--          let path = ""-->
<!--          let pathName = []-->
<!--          let pathM = 0-->

<!--          let from = wgs84togcj02(that.pos[0][0], that.pos[0][1])-->
<!--          let end = wgs84togcj02(that.pos[1][0], that.pos[1][1])-->
<!--          let avoidArea = ""-->
<!--          if (that.areas.length > 0) {-->
<!--            let area = JSON.parse(JSON.stringify(that.areas))-->
<!--            for (let i = 0; i < area.length; i++) {-->
<!--              for (let j = 0; j < area[i].area.length; j += 2) {-->
<!--                avoidArea += wgs84togcj02(area[i].area[j][0], area[i].area[j][1]) + ";"-->
<!--              }-->
<!--              avoidArea += "|"-->
<!--            }-->
<!--            avoidArea = avoidArea.substring(0, avoidArea.length - 1);-->
<!--          }-->

<!--          axios.get("https://restapi.amap.com/v3/direction/driving?origin=" + from + "&destination=" + end + "&extensions=base&strategy=0&avoidpolygons=" + avoidArea + "&key=7b0b64174ef6951cc6ee669de03e4f59", {}).then(res => {-->

<!--            pathM += parseInt(res.data.route.paths[0].distance)-->
<!--            res.data.route.paths[0].steps.map(step => {-->
<!--                  pathName.push(step.instruction)-->
<!--                  path += (step.polyline + ";")-->
<!--                }-->
<!--            )-->

<!--            let pathSegments = path.split(";")-->
<!--                .map(segment =>-->
<!--                    segment-->
<!--                        .replace(/"/g, "")  // 去除双引号-->
<!--                        .split(",")  // 按逗号分割成经纬度数组-->
<!--                        .map(Number)  // 将字符串转换为数字-->
<!--                        .filter(seg => !isNaN(seg))  // 去除无效数字-->
<!--                )-->
<!--                .filter(segment => segment.length === 2)-->
<!--                .map(segment => gcj02towgs84(segment[0], segment[1]))-->
<!--// 在pathSegments数组开头插入起点-->
<!--            pathSegments.unshift(that.pos[0]);-->

<!--// 在pathSegments数组结尾添加终点-->
<!--            pathSegments.push(that.pos[1]);-->
<!--            that.pos = [];-->
<!--            that.polylineD(pathSegments, propertiesId);-->
<!--            this.cartime = (parseFloat(res.data.route.paths[0].duration) / 60).toFixed(2);-->
<!--            this.humantime = (pathM * 0.7 / 60).toFixed(2);-->
<!--            this.driveStyle();-->
<!--            this.walkStyle();-->
<!--            this.totalRoute = pathM;-->
<!--            this.RouteGuilde = pathName;-->
<!--          })-->

<!--          that.showTips = true;-->
<!--          //路径规划好后弹出气泡框-->
<!--          // this.bubbleTips(position);-->
<!--          // this.initTool(this.viewer.cesiumWidget.container);-->
<!--          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--        }-->
<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    },-->
<!--    //绘制路径的线-->
<!--    polylineD(data, propertiesId) {-->
<!--      let arr = [];-->
<!--      for (let i = 0; i < data.length; i++) {-->
<!--        let c3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);-->
<!--        // let cartographic = Cesium.Cartographic.fromDegrees(data[i][0],data[i][1])-->
<!--        // let cartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic)-->
<!--        arr.push(c3);-->
<!--      }-->
<!--      viewer.entities.add({-->
<!--        polyline: {-->
<!--          positions: arr,-->
<!--          width: 10,-->
<!--          depthFailMaterial: Cesium.Color.YELLOW,-->
<!--          clampToGround: true,-->
<!--        },-->
<!--        properties: {-->
<!--          propertiesId,-->
<!--        },-->
<!--      });-->
<!--    },-->
<!--    //绘制障碍物点的面-->
<!--    polygonD(positions, id) {-->
<!--      let arr = [];-->
<!--      for (let i = 0; i < positions.length; i++) {-->
<!--        let a = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);-->
<!--        arr.push(a);-->
<!--      }-->
<!--      let polygon = new Entity({-->
<!--        id: id,-->
<!--        polygon: {-->
<!--          hierarchy: arr,-->
<!--          material: new Cesium.Color.fromCssColorString("#FFD700").withAlpha(-->
<!--              0.2-->
<!--          ),-->
<!--          clampToGround: true,-->
<!--        },-->
<!--        properties: {},-->
<!--      });-->
<!--      viewer.entities.add(polygon);-->
<!--    },-->
<!--    //绘制半径的中心点-->
<!--    pointD(position, id) {-->
<!--      return viewer.entities.add({-->
<!--        id: id,-->
<!--        position: position,-->
<!--        point: {-->
<!--          pixelSize: 20,-->
<!--          color: Cesium.Color.RED,-->
<!--          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地-->
<!--          depthTest: false, //禁止深度测试但是没有下面那句有用-->
<!--          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）-->
<!--        },-->
<!--      });-->
<!--    },-->
<!--    //路径规划-->
<!--    billboardD(position, img, billBoardId) {-->
<!--      viewer.entities.add({-->
<!--        id: billBoardId,-->
<!--        position: position,-->
<!--        billboard: {-->
<!--          image: img,-->
<!--          // width: 25,//图片宽度,单位px-->
<!--          // height: 25,//图片高度，单位px // 会影响point大小，离谱-->
<!--          // eyeOffset: new Cesium.Cartesian3(-1, 1, 0),//与坐标位置的偏移距离-->
<!--          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地-->
<!--          depthTest: false, //禁止深度测试但是没有下面那句有用-->
<!--          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）-->
<!--        },-->
<!--      });-->
<!--    },-->
<!--    addArea() {-->
<!--      let handler = new Cesium.ScreenSpaceEventHandler(-->
<!--          window.viewer.scene.canvas-->
<!--      );-->
<!--      let that = this;-->
<!--      handler.setInputAction((event) => {-->
<!--        // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）-->
<!--        let ray = viewer.camera.getPickRay(event.position);-->
<!--        let position = viewer.scene.globe.pick(ray, viewer.scene);-->
<!--        // // 1-2 坐标系转换-->
<!--        let cartographic = Cesium.Cartographic.fromCartesian(position); //把笛卡尔坐标转换成制图实例，单位是弧度-->
<!--        let lon = Cesium.Math.toDegrees(cartographic.longitude); //把弧度转换成度-->
<!--        let lat = Cesium.Math.toDegrees(cartographic.latitude);-->
<!--        let ar = that.CreateSimpleCircle(lon, lat, 50, 24);-->
<!--        that.areas.push({area: ar, name: "area_" + Date.now()});-->
<!--        let id = "area_" + Date.now();-->
<!--        that.pointD(position, id);-->
<!--        that.polygonD(ar, id + "a");-->
<!--        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    },-->
<!--    removeAll() {-->
<!--      viewer.entities.removeAll();-->
<!--      this.areas = [];-->
<!--    },-->
<!--    removePoint() {-->
<!--      let handler = new Cesium.ScreenSpaceEventHandler(-->
<!--          window.viewer.scene.canvas-->
<!--      );-->
<!--      let that = this;-->
<!--      handler.setInputAction(async (click) => {-->
<!--        let pickedEntity = window.viewer.scene.pick(click.position);-->
<!--        // let entity = window.selectedEntity = pickedEntity?.id-->
<!--        let entity = pickedEntity?.id;-->
<!--        if (Cesium.defined(pickedEntity) && entity._point !== undefined) {-->
<!--          let id = entity.id;-->
<!--          that.areas = that.areas.filter((area) => area.name !== id);-->
<!--          viewer.entities.remove(entity);-->
<!--          viewer.entities.removeById(id + "a");-->
<!--          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--        }-->
<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    },-->
<!--    removePolyline() {-->
<!--      let handler = new Cesium.ScreenSpaceEventHandler(-->
<!--          window.viewer.scene.canvas-->
<!--      );-->
<!--      handler.setInputAction(async (click) => {-->
<!--        let pickedEntity = window.viewer.scene.pick(click.position);-->
<!--        let entity = (window.selectedEntity = pickedEntity?.id);-->
<!--        if (-->
<!--            Cesium.defined(pickedEntity) &&-->
<!--            window.selectedEntity._polyline !== undefined-->
<!--        ) {-->
<!--          let propertiesId = entity.properties.propertiesId._value;-->
<!--          for (let i = 0; i < propertiesId.length; i++) {-->
<!--            console.log(propertiesId[i], propertiesId[i] + "");-->
<!--            viewer.entities.removeById(propertiesId[i] + "");-->
<!--          }-->
<!--          viewer.entities.remove(entity);-->
<!--          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--        }-->
<!--      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    },-->
<!--    //绑定点击事件-->
<!--    //    bubbleTips(position) {-->
<!--    //     if (!viewer) {-->
<!--    //         console.error("Viewer is not initialized.");-->
<!--    //         return;-->
<!--    //     }-->
<!--    //     // 文字内容-->
<!--    //     var text = "Citizens Bank Park";-->
<!--    //     // 添加背景面板-->
<!--    //     var backgroundPanel = viewer.entities.add({-->
<!--    //         position: position,-->
<!--    //         billboard: {-->
<!--    //             // 使用 CSS 样式的背景图像或在下面的代码中可以选择不同的背景图-->
<!--    //             image: bubbleImg,-->
<!--    //             pixelOffset: new Cesium.Cartesian2(0, -80), // 需要根据实际需要调整偏移-->
<!--    //             width: 200, // 固定宽度或根据内容计算-->
<!--    //             height: 100, // 固定高度或根据内容计算-->
<!--    //         },-->
<!--    //     });-->

<!--    //     // 添加标签-->
<!--    //     var label = viewer.entities.add({-->
<!--    //         position: position,-->
<!--    //         label: {-->
<!--    //             text: text,-->
<!--    //             font: "16pt Arial",-->
<!--    //             style: Cesium.LabelStyle.FILL_AND_OUTLINE,-->
<!--    //             fillColor: Cesium.Color.WHITE,-->
<!--    //             outlineColor: Cesium.Color.GRAY,-->
<!--    //             outlineWidth: 2,-->
<!--    //             verticalOrigin: Cesium.VerticalOrigin.CENTER,-->
<!--    //             pixelOffset: new Cesium.Cartesian2(0, -30), // 根据背景面板的高度调整标签的位置-->
<!--    //             showBackground: true,-->
<!--    //             backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),-->
<!--    //             backgroundPadding: new Cesium.Cartesian2(10, 6)-->
<!--    //         }-->
<!--    //     });-->

<!--    //     // 添加点击事件处理（可选）-->
<!--    //     viewer.screenSpaceEventHandler.setInputAction(function (click) {-->
<!--    //         var pick = viewer.scene.pick(click.position);-->
<!--    //         if (Cesium.defined(pick) && (pick.id === backgroundPanel || pick.id === label)) {-->
<!--    //             console.log("Label or background panel clicked");-->
<!--    //         }-->
<!--    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);-->
<!--    // }-->

<!--    initTool(frameDiv) {-->
<!--      if (this.isInit) {-->
<!--        return 0;-->
<!--      }-->
<!--      //弹窗容器div-->
<!--      const rightdiv = document.createElement("DIV");-->
<!--      rightdiv.className = "tooltipdiv-right";-->
<!--      rightdiv.style = `-->
<!--      position:absolute;-->
<!--      width:200px;-->
<!--      min-height:100px;-->
<!--      max-height:300px;-->
<!--      background:#fff;-->
<!--      border-radius:4px;-->
<!--      box-shadow: 2px 4px 5px #888888;-->
<!--      `;-->

<!--      //弹窗箭头div-->
<!--      const arrow = document.createElement("DIV");-->
<!--      arrow.className = "tooltip-arrow";-->
<!--      arrow.style = `-->
<!--      position:absolute;-->
<!--      left:-24px;-->
<!--      top:38px;-->
<!--      width:0;-->
<!--      height:0;-->
<!--      border-top: 12px solid transparent;-->
<!--      border-right: 12px solid #fff;-->
<!--      border-bottom: 12px solid transparent;-->
<!--      border-left: 12px solid transparent;`;-->
<!--      rightdiv.appendChild(arrow);-->
<!--      //标题div-->
<!--      const title = document.createElement("DIV");-->
<!--      title.className = "tooltipdiv-inner";-->
<!--      title.style = `-->
<!--      width:100%;-->
<!--      height:25px;-->
<!--      line-height:25px;-->
<!--      text-align:center;-->
<!--      background:red;-->
<!--      `;-->
<!--      rightdiv.appendChild(title);-->

<!--      //内容div-->
<!--      const content = document.createElement("DIV");-->
<!--      content.className = "tooltipdiv-content";-->
<!--      content.style = `-->
<!--      width:200px;-->
<!--      box-sizing:border-box;-->
<!--      padding:10px 0 10px 10px;-->
<!--      overflow-y:scroll;-->
<!--      word-break:break-all;-->
<!--      `;-->
<!--      rightdiv.appendChild(content);-->

<!--      this.addDiv = rightdiv;-->
<!--      this.addtitle = title;-->
<!--      this.addcontent = content;-->
<!--      frameDiv.appendChild(rightdiv);-->

<!--      this.isInit = true;-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--:deep(.cesium-baseLayerPicker-dropDown-visible ){-->
<!--  transform: translate(0, 0);-->
<!--  /*天地图换地图优先级最高，避免被物资搜索框遮盖*/-->
<!--  z-index: 100;-->
<!--  visibility: visible;-->
<!--  opacity: 1;-->
<!--  transition: opacity 0.2s ease-out, transform 0.2s ease-out;-->
<!--}-->
<!--:deep(.cesium-viewer-toolbar) {-->
<!--  display: block;-->
<!--  /*搜索按钮优先级最高，避免被物资搜索框遮盖*/-->
<!--  z-index: 100;-->
<!--  position: absolute;-->
<!--  top: 5px;-->
<!--  right: 5px;-->
<!--}-->
<!--.el-sub-menu {-->
<!--  list-style: none;-->
<!--  margin: 0;-->
<!--  padding-left: 0;-->
<!--  /* width: 33%; */-->
<!--}-->
<!--.route-tool-container {-->
<!-- position: absolute;-->
<!-- padding: 15px;-->
<!-- border-radius: 5px;-->
<!-- /*width: 500px;*/-->
<!--  /*height: 200px;*/-->
<!--  top: 10px;-->
<!--  left: 10px;-->
<!--  z-index: 10; /* 更高的层级 */-->
<!--  background-color: rgba(40, 40, 40, 0.7);-->
<!--}-->

<!--.tool-container {-->
<!--  position: absolute;-->
<!--  padding: 15px;-->
<!--  border-radius: 5px;-->
<!--  top: 10px;-->
<!--  left: 10px;-->
<!--  z-index: 10;-->
<!--  background-color: rgba(40, 40, 40, 0.7);-->
<!--}-->

<!--#cesiumContainer {-->
<!--  height: calc(100vh - 50px);-->
<!--  width: 100%;-->
<!--  margin: 0;-->
<!--  padding: 0;-->
<!--  overflow: hidden;-->
<!--}-->

<!--#supplies {-->
<!--  position: absolute;-->
<!--  padding: 15px;-->
<!--  border-radius: 5px;-->
<!--  /*width: 500px;*/-->
<!--  /*height: 200px;*/-->
<!--  top: 10px;-->
<!--  left: 10px;-->
<!--  width: 80vw;-->
<!--  z-index: 10; /* 更高的层级 */-->
<!--  background-color: rgba(40, 40, 40, 0.7);-->
<!--  transition: width 0.3s; /* 平滑过渡效果 */-->
<!--}-->

<!--.marchSupply{-->
<!--    position: absolute;-->
<!--    z-index: 10;-->
<!--    justify-content: center;-->
<!--    align-content: center;-->
<!--    margin: 0;-->
<!--    padding: 0;-->
<!--}-->

<!--#supplies.collapsed {-->
<!--  width: 30% !important; /* 收缩时的宽度 */-->
<!--}-->

<!--.pagination1 {-->
<!--  width: 40%;-->
<!--  margin: 0 auto;-->
<!--  color: white;-->
<!--}-->

<!--.pagination1 ::v-deep .el-pagination__total,-->
<!--.pagination1 ::v-deep .el-pagination__jump {-->
<!--  color: white; /* 设置“共多少条”和“前往 页”部分的颜色为白色 */-->
<!--}-->

<!--.el-table {-->
<!--  background-color: #ffffff00;-->
<!--}-->

<!--:deep(.el-table&#45;&#45;fit .el-table__inner-wrapper:before) {-->
<!--  width: 0;-->
<!--}-->

<!--canvas {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  display: block;-->
<!--}-->

<!--.loading {-->
<!--  text-align: center;-->
<!--  margin: 10px;-->
<!--  color: #999;-->
<!--}-->
<!--.el-menu-item,-->
<!--.el-submenu__title {-->
<!--    padding: 0 20px;-->
<!--}-->

<!--.el-submenu__title:hover {-->
<!--    background-color: #444;-->
<!--}-->

<!--.el-menu-item:hover {-->
<!--    background-color: #444;-->
<!--}-->
<!--.el-form-item__label {-->
<!--    text-align: center; /* 标签文字右对齐 */-->
<!--}-->
<!--/*行政区划按钮样式*/-->
<!--.district-buttons {-->
<!--    display: flex;-->
<!--    flex-wrap: wrap;-->
<!--    margin-bottom: 10px;-->
<!--    justify-content: space-between;-->
<!--}-->
<!--.district-button {-->
<!--    flex: 0 0 20%; /* 每行5个按钮 */-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    margin: 4px; /* 调整按钮之间的间距 */-->
<!--}-->
<!--.district-button.selected {-->
<!--    background-color: #5b91c9; /* 选中按钮的背景色 */-->
<!--    color: white; /* 选中按钮的文字颜色 */-->
<!--    border: 1.5px solid #5b91c9; /* 增加边框 */-->
<!--    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 增加阴影效果 */-->
<!--    transform: scale(1.05); /* 略微放大 */-->
<!--}-->

<!--</style>-->
