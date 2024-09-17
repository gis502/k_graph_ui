import request from '@/utils/request'

export function getEmergency(query) {
    return request({
        url: '/system/emergency/getEmergency',
        method: 'get',
        params: query
    })
}

export function getFeaturesLayer(query) {
    return request({
        url: '/system/emergency/getFeaturesLayer',
        method: 'get',
        params: query
    })
}

export function suppliesReservesList() {
    return request({
        url: '/system/emergency/suppliesReservesList',
        method: 'get',
    })
}
export function addOrUpdateSuppliesReserves(data) {
    return request({
        url: '/system/emergency/addOrUpdateSuppliesReserves',
        method: 'post',
        data: data
    })
}
export function delSuppliesReserves(uniqueId) {
    return request({
        url: '/system/emergency/delSuppliesReserves',
        method: 'delete',
        params: {
            uniqueId: uniqueId
        }
    });
}

export function sheltersList() {
    return request({
        url: '/system/emergency/sheltersList',
        method: 'get',
    })
}
export function searchEmergencyShelters(inputData) {
    return request({
        url: '/system/emergency/searchEmergencyShelters',
        method: 'post',
        params: {'inputData':inputData}
    })
}
export function reservesList() {
    return request({
        url: '/system/emergency/reservesList',
        method: 'get',
    })
}

export function rescueTeamList() {
    return request({
        url: '/system/emergency/rescueTeamList',
        method: 'get',
    })
}

export function searchEmergencyTeam(inputData) {
    return request({
        url: '/system/emergency/searchEmergencyTeam',
        method: 'post',
        params: {'inputData':inputData}
    })
}

export function searchMaterialData(inputData) {
    return request({
        url: '/system/emergency/searchMaterialData',
        method: 'post',
        params: {'inputData':inputData}
    })
}

export function searchDisasterReserves(inputData) {
    return request({
        url: '/system/emergency/searchDisasterReserves',
        method: 'post',
        params: {'inputData':inputData}
    })
}
