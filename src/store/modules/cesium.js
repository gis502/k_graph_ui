import {ref, reactive, computed} from "vue";

export const useCesiumStore = defineStore('cesium', () => {
        const pointInfo = reactive({
            earthquakeId: null,
            plotId: null,
            time: null,
            plotType: null,
            geom: null,
            elevation: null,
            icon: null,
        })

        function getPointInfo1() {
            return {
                earthquakeId: pointInfo.earthquakeId,
                plotId: pointInfo.plotId,
                plotType: pointInfo.plotType,
                geom: pointInfo.geom,
                elevation: pointInfo.elevation,
                icon: pointInfo.icon,
            }
        }

        function setPointInfo1(info) {
            pointInfo.earthquakeId = info.earthquakeId
            pointInfo.plotId = info.plotId
            pointInfo.plotType = info.plotType
            pointInfo.geom = info.geom
            pointInfo.elevation = info.elevation
            pointInfo.icon = info.icon
        }

        function clearData() {
            pointInfo.earthquakeId = null
            pointInfo.plotId = null
            pointInfo.plotType = null
            pointInfo.geom = null
            pointInfo.elevation = null
            pointInfo.icon = null
        }

        const polyilneInfo = reactive({
            plotType: null,
            situationPlotData: null
        })
        const polygonInfo = reactive({
            plotType: null,
            situationPlotData: null
        })

        function getPolyilneInfo() {
            return {
                plotType: polyilneInfo.plotType,
                situationPlotData: polyilneInfo.situationPlotData
            }
        }

        function setPolyilneInfo(info) {
            polyilneInfo.plotType = info.plotType
            polyilneInfo.situationPlotData = info.situationPlotData
        }

        function clearPolyilneInfo() {
            polyilneInfo.plotType = null
            polyilneInfo.situationPlotData = null
        }
        function getPolygonInfo() {
            return {
                plotType: polygonInfo.plotType,
                situationPlotData: polygonInfo.situationPlotData
            }
        }

        function setPolygonInfo(info) {
            polygonInfo.plotType = info.plotType
            polygonInfo.situationPlotData = info.situationPlotData
        }

        function clearPolygonInfo() {
            polygonInfo.plotType = null
            polygonInfo.situationPlotData = null
        }

        return {
            pointInfo,
            getPointInfo1,
            setPointInfo1,
            clearData,
            getPolyilneInfo,
            setPolyilneInfo,
            clearPolyilneInfo,
            getPolygonInfo,
            setPolygonInfo,
            clearPolygonInfo
        }
    }
)
