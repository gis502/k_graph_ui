import request from '@/utils/request';


export function getModelData() {
    return request({
        url: '/system/model/getmodel', // 对应的后台接口
        method: 'get'
    });
}

/**
 * 获取总数
 * @returns {*}
 */
export function getModelTotalData() {
    return request({
        url: '/system/model/getModelTotalCount', // 对应的后台接口
        method: 'get'
    });
}

/**
 * 删除数据
 * @returns {*}
 */
export function deleteModel(uuid) {
    return request({
        url: `system/model/deletemodel`, // URL 不需要包含 {modelid}
        method: 'get', // 使用 DELETE 方法
        params: { uuid } // 将 modelid 作为查询参数
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
