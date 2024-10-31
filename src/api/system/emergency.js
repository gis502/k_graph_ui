import request from '@/utils/request'

export function getEmergency(query) {
    return request({
        url: '/emergencyResources/getEmergency',
        method: 'get',
        params: query
    })
}

export function getFeaturesLayer(query) {
    return request({
        url: '/emergencyResources/getFeaturesLayer',
        method: 'get',
        params: query
    })
}


export function suppliesReservesList() {
    return request({
        url: '/emergencyResources/suppliesReservesList',
        method: 'get',
    })
}
export function addOrUpdateSuppliesReserves(data) {
    return request({
        url: '/emergencyResources/addOrUpdateSuppliesReserves',
        method: 'post',
        data: data
    })
}
export function delSuppliesReserves(uniqueId) {
    return request({
        url: '/emergencyResources/delSuppliesReserves',
        method: 'delete',
        params: {
            uniqueId: uniqueId
        }
    });
}

export function sheltersList() {
    return request({
        url: '/emergencyResources/sheltersList',
        method: 'get',
    })
}
export function searchEmergencyShelters(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyShelters',
        method: 'post',
        params: {'inputData':inputData}
    })
}
export function reservesList() {
    return request({
        url: '/emergencyResources/reservesList',
        method: 'get',
    })
}

export function rescueTeamList() {
    return request({
        url: '/emergencyResources/rescueTeamList',
        method: 'get',
    })
}

export function searchEmergencyTeam(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyTeam',
        method: 'post',
        params: {'inputData':inputData}
    })
}

export function searchMaterialData(inputData) {
    return request({
        url: '/emergencyResources/searchMaterialData',
        method: 'post',
        data: inputData
    })
}

export function searchEmergencyTeamData(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyTeamData',
        method: 'post',
        data: inputData
    })
}

export function searchDisasterReserves(inputData) {
    return request({
        url: '/emergencyResources/searchDisasterReserves',
        method: 'post',
        params: {'inputData':inputData}
    })
}

export function marchByRegion(inputData) {
    return request({
        url: '/emergencyResources/marchByRegion',
        method: 'post',
        params: {'inputData':inputData}
    })
}
