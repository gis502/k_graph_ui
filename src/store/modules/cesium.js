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
            plottype: null,
            situationPlotData: null
        })
        const polygonInfo = reactive({
            plottype: null,
            situationPlotData: null
        })

        function getPolyilneInfo() {
            return {
                plottype: polyilneInfo.plottype,
                situationPlotData: polyilneInfo.situationPlotData
            }
        }

        function setPolyilneInfo(info) {
            polyilneInfo.plottype = info.plottype
            polyilneInfo.situationPlotData = info.situationPlotData
        }

        function clearPolyilneInfo() {
            polyilneInfo.plottype = null
            polyilneInfo.situationPlotData = null
        }
        function getPolygonInfo() {
            return {
                plottype: polygonInfo.plottype,
                situationPlotData: polygonInfo.situationPlotData
            }
        }

        function setPolygonInfo(info) {
            polygonInfo.plottype = info.plottype
            polygonInfo.situationPlotData = info.situationPlotData
        }

        function clearPolygonInfo() {
            polygonInfo.plottype = null
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
