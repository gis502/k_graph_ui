import request from '@/utils/request'
export function addModelApi(data) {
    return request({
        url: '/system/model/addmodel',
        method: 'post',
        data: data
    })
}
export function getAllModel(query) {
    return request({
        url: '/system/model/getmodel',
        method: 'get',
    })
}
export function deleteModel(query){
    return request({
        url: '/system/model/deletemodel',
        method: 'get',
        params: query
    })
}
export function updataModel(data) {
    return request({
        url: '/system/model/updatamodel',
        method: 'post',
        data: data
    })
}
export function updataModelNoElevation(data) {
    return request({
        url: '/system/model/updatamodelnoelevation',
        method: 'post',
        data: data
    })
}
export function updataModelElevation(data) {
    return request({
        url: '/system/model/updatamodelelevation',
        method: 'post',
        data: data
    })
}

/**
 * 态势标绘搜索框查询
 * @param queryValue
 * @returns {*}
 */
export function querySituationData(inputData) {
    return request({
        url: '/system/queryName',  // 后端接口地址
        method: 'get',
        params: {inputData}  // 如果没有传值，则为空字符串
    });
}

/**
 * 倾斜模型调整
 * @param queryValue
 * @returns {*}
 */
export function querytiltModelData(inputData) {
    return request({
        url: '/system/model/queryName',  // 后端接口地址
        method: 'get',
        params: {inputData}  // 如果没有传值，则为空字符串
    });
}
