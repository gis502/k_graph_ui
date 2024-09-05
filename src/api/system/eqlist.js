import request from '@/utils/request'

//增
export function addEq(data) {
    return request({
        url: '/system/addeq',
        method: 'post',
        data: data
    })
}

// 删
export function deleteeq(query) {
    return request({
        url: '/system/deleteeq',
        method: 'get',
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

export function getKeyEq(query) {
    return request({
        url: '/system/getKeyeq',
        method: 'get',
    })
}

export function getLatestEq(query) {
    return request({
        url: '/system/getLatesteq',
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

export function getEqbyId(data) {
    return request({
        url: '/system/geteqbyid',
        method: 'post',
        params: data
    })

}
