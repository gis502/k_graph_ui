import request from '@/utils/request'

//增
export function addEq(data) {
    return request({
        url: '/system/addEq',
        method: 'post',
        data: data
    })
}

// 删
export function deleteeq(query) {
    return request({
        url: '/system/deleteEq',
        method: 'post',
        params: query
    })
}

// 查
export function getAllEq(query) {
    return request({
        url: '/system/geteq',
        method: 'get',
    })
}

export function queryEq(queryValue) {
    return request({
        url: '/system/queryEq',
        method: 'get',
        params: queryValue
    })
}

export function fromEq(form) {
    return request({
        url: '/system/fromEq',
        method: 'post',
        data: form
    })
}

export function getKeyEq(query) {
    return request({
        url: '/system/getKeyeq',
        method: 'get',
    })
}

export function getLatestEq(query) {
    return request({
        url: '/system/getLatestEq',
        method: 'get',
    })
}

export function getExcelUploadEarthquake() {
    return request({
        url: '/system/getExcelUploadEarthquake',
        method: 'get',
    })
}

// 改
export function updataEq(data) {
    return request({
        url: '/system/updataeq',
        method: 'post',
        data: data
    })
}

export function getEqById(data) {
    return request({
        url: '/system/queryEqById',
        method: 'post',
        params:data
    })

}

export function getNearbyVillage(position) {
    return request({
        url: '/villageCommunity/getNearbyVillage',
        method: 'post',
        data: position
    })

}

export function getGeomById(data) {
    return request({
        url: '/system/getGeomById',
        method: 'get',
        params:{id:data}
    })

}
