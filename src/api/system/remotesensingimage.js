import request from '@/utils/request'


//增
export function insert(data) {
    return request({
        url: '/remotesensing/addRI',
        method: 'post',
        data: data,

    })
}

/**
 * 数据展示
 * @returns {*}
 */
export function list() {
    return request({
        url: '/remotesensing/searchRI',
        method: 'post',
    })
}

/**
 * 搜索框查询
 * @param queryValue
 * @returns {*}
 */
export function queryRemoteSensingData(inputData) {
    return request({
        url: '/remotesensing/queryRI',  // 后端接口地址
        method: 'get',  // 使用 POST 方法
        params: {inputData}  // 如果没有传值，则为空字符串

    });
}

/**
 * 筛选
 * @param data
 * @returns {*}
 * @constructor
 */
export function RemoteSensingFilterContent(data) {
    return request({
        url: '/remotesensing/filterRI',
        method: 'post',
        data: data
    });
}

//改
export function update(data) {
    return request({
        url: '/remotesensing/updaRI',
        method: 'post',
        data: data
    })
}

//删
export function removeById(query) {
    return request({
        url: '/remotesensing/removeRI',
        method: 'delete',
        params: query
    })
}