import request from '@/utils/request';


/**
 * 搜索框查询
 * @param queryValue
 * @returns {*}
 */
export function queryObliqueImageryData(data) {
    return request({
        url: '/system/model/qureyEq',
        method: 'post',
        data: data
    });
}

/**
 * 筛选
 * @param data
 * @returns {*}
 * @constructor
 */
export function ObliqueImageryFilterContent(data) {
    return request({
        url: '/system/model/fromeq',
        method: 'post',
        data: data
    });
}


/**
 * 删除数据
 * @returns {*}
 */
export function deleteModel(uuid) {
    return request({
        url: `system/model/deletemodel`,
        method: 'get',
        params: { uuid }
    });
}





/**
 * 添加数据
 * @returns {*}
 */
export function addModel(data) {
    return request({
        url: '/system/model/addmodel', // 对应的后台接口
        method: 'post',
        data: data
    });
}

/**
 * 更新数据
 * @returns {*}
 */
export function updataModel(data) {
    return request({
        url: '/system/model/updatamodels', // 对应的后台接口
        method: 'post',
        data: data
    });
}
