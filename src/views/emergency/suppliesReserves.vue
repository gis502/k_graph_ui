<template>
    <div class="app-container">
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
            <el-table-column label="序号" width="60" fixed="left">
                <template #default="{ row, column, $index }">
                    {{ ($index + 1) + (currentPage - 1) * pageSize }}
                </template>
            </el-table-column>

            <el-table-column
                    v-for="(header, index) in headersArr"
                    :key="index"
                    :prop="header.prop"
                    :label="header.label"
                    :width="header.width"
            >
                <template #default="scope">
                    <div v-if="header.label === '地址' || header.label === '县（区）'
                    || header.label === '其他' || header.label === '联系电话'">
                        <el-popover placement="top" :width="200" trigger="hover">
                            <div style="text-align: center">{{ scope.row[header.prop] }}</div>
                            <template #reference>
                                <div
                                        :style="{ width: header.width + 'px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
                                >
                        <span class="myNote">
                            {{ scope.row[header.prop] }}
                        </span>
                                </div>
                            </template>
                        </el-popover>
                    </div>
                    <div v-else>
                        {{ scope.row[header.prop] }}
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="150" fixed="right">
                <template #default="scope">
                    <el-button type="text" icon="Edit" @click="handleOpen('修改',scope.row)">修改</el-button>
                    <el-button type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                style="justify-content: center"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="pageSizes"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
        </el-pagination>


        <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%" :show-close="false">
            <el-row :gutter="10">
                <el-col :span="6">位置：</el-col>
                <el-col :span="18">
                    <el-input v-model="dialogContent.position" placeholder="请输入内容"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="6">发震时间：</el-col>
                <el-col :span="18">
                    <!--          <el-input v-model="dialogContent.time" placeholder="请输入内容"></el-input>-->
                    <el-date-picker
                            v-model="dialogContent.time"
                            type="datetime"
                            placeholder="选择日期时间"
                            value-format="x"
                            size="large">
                    </el-date-picker>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="6">震级：</el-col>
                <el-col :span="18">
                    <el-input v-model="dialogContent.magnitude" placeholder="请输入内容"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="6">经度：</el-col>
                <el-col :span="18">
                    <el-input v-model="dialogContent.longitude" placeholder="请输入内容"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="6">纬度：</el-col>
                <el-col :span="18">
                    <el-input v-model="dialogContent.latitude" placeholder="请输入内容"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="6">深度：</el-col>
                <el-col :span="18">
                    <el-input v-model="dialogContent.depth" placeholder="请输入内容"></el-input>
                </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
    import {
        addOrUpdateSuppliesReserves,
        delSuppliesReserves,
        suppliesReservesList
    } from "../../api/system/emergency.js";

    export default {
        name: "suppliesReserves",
        data(){
            return {
                suppliesReservesData: [],
                tableData: [],
                total: 0,
                pageSize: 10,
                pageSizes: [10, 20, 40],
                currentPage: 1,
                currentHeaders: [],
                // ---表头---
                headersArr: [
                    { prop: 'county', label: "县（区）", width: 180 },
                    { prop: 'totalItems', label: "合计总件套数", width: 120 },
                    { prop: 'infraredDetectors', label: "红外探测仪", width: 120 },
                    { prop: 'opticalDetectors', label: "光学探测仪(蛇眼)", width: 150 },
                    { prop: 'hydraulicSpreaders', label: "液压扩张钳", width: 120 },
                    { prop: 'hydraulicCutters', label: "液压剪切钳", width: 120 },
                    { prop: 'rockDrills', label: "凿岩机", width: 150 },
                    { prop: 'crowbars', label: "撬棍（把）", width: 150 },
                    { prop: 'rebarCutters', label: "钢筋速断器", width: 120 },
                    { prop: 'hydraulicJacks', label: "手动液压千斤顶", width: 150 },
                    { prop: 'lightSticks', label: "发光棒", width: 150 },
                    { prop: 'fuelLiters', label: "油料（升）", width: 150 },
                    { prop: 'tensileRopeMeters', label: "抗拉索", width: 150 },
                    { prop: 'rescueRopesMeters', label: "救援绳（米）", width: 150 },
                    { prop: 'ropeThrowers', label: "抛绳器", width: 150 },
                    { prop: 'foldingLadders', label: "折叠梯（个）", width: 150 },
                    { prop: 'shovelsPicksHooksForksHammers', label: "锹/镐/钩/叉/锤", width: 130 },
                    { prop: 'foldingShovels', label: "折叠铲（把）", width: 150 },
                    { prop: 'whistles', label: "口哨（个）", width: 150 },
                    { prop: 'helmets', label: "头盔（顶）", width: 150 },
                    { prop: 'rainBoots', label: "雨鞋（双）", width: 150 },
                    { prop: 'gloves', label: "手套（双）", width: 150 },
                    { prop: 'lifelinesMeters', label: "救生缆索（米）", width: 150 },
                    { prop: 'drainagePumps', label: "排水泵（台）", width: 150 },
                    { prop: 'fireBlowers', label: "风力灭火机（个）", width: 170 },
                    { prop: 'ironShovels', label: "铁锹（把）", width: 150 },
                    { prop: 'lifeJackets', label: "救生衣（件）", width: 150 },
                    { prop: 'lifeRings', label: "救生圈（个）", width: 150 },
                    { prop: 'warningTapesMeters', label: "警示带（米）", width: 150 },
                    { prop: 'walkieTalkies', label: "对讲机（台）", width: 150 },
                    { prop: 'megaphones', label: "扩音器（个）", width: 150 },
                    { prop: 'gongs', label: "锣（个）", width: 150 },
                    { prop: 'headlamps', label: "头灯（个）", width: 150 },
                    { prop: 'portableLights', label: "手提照明灯（个）", width: 170 },
                    { prop: 'medicalKits', label: "医疗急救箱", width: 150 },
                    { prop: 'excavators', label: "挖掘机", width: 150 },
                    { prop: 'loaders', label: "装载机（推土机）", width: 180 },
                    { prop: 'waterPumps', label: "抽水泵", width: 150 },
                    { prop: 'relayPumps', label: "接力水泵", width: 150 },
                    { prop: 'mobileWaterBags', label: "移动水囊（个）", width: 150 },
                    { prop: 'backpackFireSprayers', label: "背负式喷水灭火抢", width: 170 },
                    { prop: 'chainsaws', label: "油锯（个）", width: 150 },
                    { prop: 'hosesMeters', label: "水带（米）", width: 150 },
                    { prop: 'fireTrucks', label: "消防水车", width: 150 },
                    { prop: 'otherSupplies', label: "其他", width: 150 },
                    { prop: 'address', label: "地址", width: 200 },
                    { prop: 'longitude', label: "经度", width: 150 },
                    { prop: 'latitude', label: "纬度", width: 150 },
                    { prop: 'contactPerson', label: "联系人", width: 150 },
                    { prop: 'contactPhone', label: "联系电话", width: 150 },
                    // { prop: '', label: "经纬度点", width: 150 },
                    { prop: 'insertTime', label: "插入时间", width: 200 }
                ],
                // ---新增/修改---
                dialogShow: false,
                dialogTitle: null,
                dialogContent: {
                    position: '',
                    time: '',
                    magnitude: '',
                    longitude: '',
                    latitude: '',
                    depth: '',
                    eqid: ''
                },
            }
        },
        mounted() {
            suppliesReservesList().then(res => {
                this.suppliesReservesData = res
                this.total = res.length
                this.tableData = this.getPageArr()
                console.log("----------------",res[0])
            })
            // let data = {
            //     uuid: 'c12c82fe-5828-408a-9c73-f2605fb94e68',
            //     address: "雅安市雨城区雅东路三组25栋",
            //     blankets: 0,
            //     bunkBeds: 0,
            //     contactPerson: "巫金建",
            //     contactPhone: "13881613767",
            //     cottonClothing: 0,
            //     cottonCoats: 8000,
            //     county: "省级前置333333333333333",
            //     flashlights: 0,
            //     foldingBeds: 24580,
            //     generators: 0,
            //     insertTime: null,
            //     lightingFixtures: 0,
            //     lightingSets: 0,
            //     moistureProofPads: 21400,
            //     other: null,
            //     otherBlankets: 10000,
            //     otherClothing: 0,
            //     otherEquipment: 0,
            //     quilts: 20000,
            //     rainBoots: 0,
            //     raincoats: 0,
            //     reliefFamiliesBox: null,
            //     storagePointsCount: 0,
            //     tarpaulins: 0,
            //     tents: 3500,
            //     totalItemsCount: 87480
            // }
            // addOrUpdateSuppliesReserve(data).then(res => {
            //     // console.log("----------------",res)
            // })

            let data = {
                "county": "柏树村",
                "address": "柏树村村委会333333333333333333",
                "contactPerson": "卢福均",
                "contactPhone": "13882445639",
                "longitude": 103.297222,
                "latitude": 31.286667,
                "insertTime": "2024-07-31T09:54:01.000+08:00",
                "totalItems": 70,
                "infraredDetectors": 0,
                "opticalDetectors": 0,
                "hydraulicSpreaders": 0,
                "hydraulicCutters": 0,
                "hydraulicJacks": 0,
                "rockDrills": 0,
                "crowbars": 0,
                "rebarCutters": 0,
                "lightSticks": 1,
                "fuelLiters": 0,
                "tensileRopeMeters": 0,
                "rescueRopesMeters": 2,
                "ropeThrowers": 0,
                "foldingLadders": 0,
                "shovelsPicksHooksForksHammers": 2,
                "foldingShovels": 0,
                "whistles": 0,
                "helmets": 2,
                "rainBoots": 12,
                "gloves": 20,
                "lifelinesMeters": 1,
                "drainagePumps": 0,
                "fireBlowers": 0,
                "ironShovels": 0,
                "lifeJackets": 13,
                "lifeRings": 2,
                "warningTapesMeters": 5,
                "walkieTalkies": 1,
                "megaphones": 1,
                "gongs": 1,
                "headlamps": 5,
                "portableLights": 2,
                "medicalKits": 0,
                "excavators": 0,
                "loaders": 0,
                "waterPumps": 0,
                "relayPumps": 0,
                "mobileWaterBags": 0,
                "backpackFireSprayers": 0,
                "chainsaws": 0,
                "hosesMeters": 0,
                "fireTrucks": 0,
                "otherSupplies": "0"
            }
            // addOrUpdateSuppliesReserves(data).then(res => {
            //     console.log("新增-----------------",res)
            // })
        },
        methods:{
            handleOpen(feature, row){
                // console.log("row------",row)
                // this.dialogShow = false
                // this.dialogTitle = feature
            },
            handleDelete(row){
                // delSuppliesReserves(row.uniqueId).then(res => {
                //     console.log("delete--------",res)
                // })
            },

            // 确认提交修改或新增
            commit() {

            },
            // 关闭dialog对话框
            cancel() {
                this.dialogShow = false
                this.clearDialogContent()
            },
            // 清除DialogContent中的数据
            clearDialogContent() {
                Object.keys(this.dialogContent).forEach(key => {
                    this.dialogContent[key] = ''
                });
            },

            getPageArr() {
                let arr = []
                let start = (this.currentPage - 1) * this.pageSize
                let end = this.currentPage * this.pageSize
                if (end > this.total) {
                    end = this.total
                }
                for (; start < end; start++) {
                    this.suppliesReservesData[start].insertTime = this.formatDate(this.suppliesReservesData[start].insertTime);
                    arr.push(this.suppliesReservesData[start])
                }
                return arr
            },
            // 将ISO时间格式转为"YYYY-MM-DD HH:MM:SS"
            formatDate(isoString) {
                const date = new Date(isoString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            },
            //`每页 ${val} 条`
            handleSizeChange(val) {
                this.pageSize = val
                this.tableData = this.getPageArr()
                // console.log(`每页 ${val} 条`);
            },
            // `当前页: ${val}`
            handleCurrentChange(val) {
                this.currentPage = val
                this.tableData = this.getPageArr()
                // console.log(`当前页: ${val}`);
            },
            // 修改table的header的样式
            tableHeaderColor() {
                return {
                    // 'border-color': '#293038',
                    // 'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
                    // 'color': '#fff',
                    // 'padding': '0',
                    'text-align': 'center',
                    'font-size': '16px'
                }
            },
            // 修改table 中每行的样式
            tableColor({row, column, rowIndex, columnIndex}) {
                if (rowIndex % 2 == 1) {
                    return {
                        // 'border-color': '#313a44',
                        // 'background-color': '#313a44',
                        // 'color': '#fff',
                        'padding-top': '10px',
                        'padding-bottom': '10px',
                        'text-align': 'center',
                        'font-size': '16px',
                    }
                } else {
                    return {
                        // 'border-color': '#304156',
                        // 'background-color': '#304156',
                        // 'color': '#fff',
                        // 'padding': '0',
                        'padding-top': '10px',
                        'padding-bottom': '10px',
                        'text-align': 'center',
                        'font-size': '16px'
                    }
                }
            },
        }
    }
</script>

<style scoped>
:deep(.el-dialog__body) {
  text-align: end;
}
:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 15%;
  position: relative;
  margin: 0 auto;
}
</style>
