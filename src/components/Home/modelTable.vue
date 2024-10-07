<!--倾斜模型调整列表-->
<template>
    <div class="eqtable">
        <el-table :data="modelTableData" style="width: 100%;margin-bottom: 5px" :header-cell-style="tableHeaderColor"
                  :cell-style="tableColor" @row-click="">
            <el-table-column prop="name" label="模型名称" width="300px"></el-table-column>
           <el-table-column label="操作" width="158px" align="center">
                <template #default="scope">
                    <el-button type="text" :icon="Edit" @click="goModel(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div style="margin-left: 20%;">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-size="pageSize"
                    layout="total, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </div>

</template>

<script setup>
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {Edit} from '@element-plus/icons-vue'

let modelStatus = true

let props = defineProps(['modelData']);
console.log(props)
const total = ref(0);
const pageSize = ref(6);
const currentPage = ref(1);
const getEqData = ref([]);
const tableData = ref([]);
const router = useRouter();
const modelTableData = ref([]);

let modelInfo = reactive({
    name: null, path: null, rz: null, tz: null, rze: null, tze: null, time: null, modelid: null
})

watch(() => props.modelData, () => {
    console.log(props.modelData)
    let list = props.modelData
    console.log(list)
    getEqData.value = list;
    total.value = list.length;
    modelTableData.value = getPageArr();
});

const go = (row) => {
    const route = router.resolve({path: '/thd', query: {eqid: row.eqid}}).href;
    window.open(route, '_blank');
};

const tableHeaderColor = () => ({
    'border-width':'1px',
    'border-style':'solid',
    'border-color': '#555555',
    'background-color': '#293038 !important',
    'color': '#fff',
    'text-align': 'center',
});

const tableColor = ({rowIndex}) => {
    const backgroundColor = rowIndex % 2 === 1 ? '#313a44' : '#304156';
    return {
        'border-width':'1px',
        'border-style':'solid',
        'border-color': '#555555',
        // 'border-color': backgroundColor,
        'background-color': backgroundColor,
        'color': '#fff',
        'padding': '0',
    };
};

const getPageArr = () => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = Math.min(currentPage.value * pageSize.value, total.value);
    return getEqData.value.slice(start, end);
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    tableData.value = getPageArr();
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
    tableData.value = getPageArr();
};

const formatTime = (time) => time ? time.replace('T', ' ') : '';

function goModel(row){
    modelInfo.name = row.name
    modelInfo.path = row.path
    modelInfo.tz = row.tz
    modelInfo.rz = row.rz
    modelInfo.time = row.time
    modelInfo.modelid = row.modelid
    modelInfo.tze = row.tze
    modelInfo.rze = row.rze
    selectModel(row.path)
}

function selectModel(modelName) {
    remove3dData()
    initModel(modelName)
    // window.viewer.zoomTo(
    //     window.modelObject
    // )
    window.viewer.zoomTo(window.modelObject)
    modelStatus = true
    modelStatusContent.value = "隐藏当前模型"
}
function remove3dData() {
    window.viewer.scene.primitives.remove(window.modelObject)
    window.modelObject = null
}

/**
 * @Description:初始化加载模型并贴地
 * @author White Mo
 * @date 2024/3/25
 */
function initModel(modelName) {
    let baseURL = import.meta.env.VITE_APP_API_URL
    const customShader = new CustomShader({
        lightingModel:0
    })
    const tileset = new Cesium.Cesium3DTileset({
        url: baseURL + "/geoserver/www/" + modelName + "/tileset.json",
        loadSiblings: true,
        show: true,
        maximumScreenSpaceError: 64,//默认16，值越大经度越小
        maximumMemoryUsage: 3000,//可用于缓存瓦片的最大GPU内存量（以MB为单位）
        skipLevelOfDetail: true,
        preferLeaves: true,
        customShader: customShader
    });

    //如果遇到url中特殊字符+问题，前往node_modules\cesium\Source\ThirdParty\uri.js修改'%2B': '+'为'%2B': '%2B',禁止将json中的%2B转为+，因为geoserver无法识别+路径
    window.modelObject = tileset
    tileset.zIndex = -1;
    tileset.readyPromise.then(function () {
        window.viewer.scene.primitives.add(tileset);
        console.log("模型已加载")
        if (isTerrainLoaded()) {
            changeHeight(modelInfo.tze)
            tz.value = modelInfo.tze
            find()
        } else {
            // tz.value = modelInfo.tz
            // changeHeight(modelInfo.tz)
            // find()
            const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);//获取模型高度
            tz.value = 20 - Math.trunc(cartographic.height)//高度取整
            transferModel(tileset, 0, 0, tz.value, 0, 0, 0, 1, 1)//模型贴地
            console.log(tz.value, Math.trunc(cartographic.height), 123)
        }
    })

}

</script>

<style scoped>
.table {
    text-align: center;
}

/*表格页面样式*/
:deep(.el-table__inner-wrapper::before) {
    width: 0
}

:deep(.el-table) {
    --el-table-bg-color : ''
}

:deep(.el-pagination){
    --el-pagination-item-gap : 6px;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: -5px;
}

.custom-pagination >>> .el-pagination__total,
.custom-pagination >>> .el-pagination__jump,
.custom-pagination >>> .el-pagination__right-wrapper {
    color: white;
    font-size: 15px;
}

</style>

