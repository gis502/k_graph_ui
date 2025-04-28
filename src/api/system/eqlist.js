import request from '@/utils/request'

//增
export function addEq(data) {
    return request({
        url: '/system/addEq',
        method: 'post',
        data: data
    })
}

export function exportReport(eqEventDto) {
    return request({
        url:'/system/getReport',
        method: 'get',
        data: eqEventDto
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

export function deletedEq(query){
    return request({
        url: '/tp/api/open/eq/delete',
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
export function getAllEqList(query) {
    return request({
        url: '/tp/api/open/eq/list',
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
//eqlist表
export function queryEqList(queryValue) {
    return request({
        url: '/system/queryEqList',
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
export function fromEqList(form) {
    return request({
        url: '/system/fromEqList',
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
export function getExcelUploadEqList() {
    return request({
        url: '/tp/api/open/getExcelUploadEqList',
        method: 'get',
    })
}

export function eqEventReassessment(data) {

    return request({
        url: '/tp/api/open/reassessment',
        method: 'post',
        data
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
export function getEqListById(data) {
    return request({
        url: '/system/getEqListById',
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
        params: {id: data}
    })
}
export function getGeomByEqListId(data) {
    return request({
        url: '/system/getGeomByEqListId',
        method: 'get',
        params: {id: data}
    })
}
export function getCloud(data) {
    return request({
        url: '/system/cloudword',
        method: 'get',
        params: {eqid: data}
    })
}

export function eqEventTrigger(data) {
    return request({
        url: '/tp/api/open/trigger',
        method: 'post',
        data
    })
}

export function addNewEq(data) {
  return request({
    url: '/system/trigger',
    method: 'post',
    data
  })
}

export function eqProgress(data){
    return request({
        url: '/tp/api/open/eq/processes',
        method: 'get',
        params: data
    })
}
