import request from '@/utils/request'


//增
export function insert(data) {
    return request({
        url: '/orthophoto/save',
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
        url: '/orthophoto/list',
        method: 'post',
    })
}

/**
 * 搜索框查询
 * @param queryValue
 * @returns {*}
 */
export function queryOrthophotoData(queryValue) {
    return request({
        url: '/orthophoto/qureyEq',  // 后端接口地址
        method: 'post',  // 使用 POST 方法
        data: queryValue  // 如果没有传值，则为空字符串

    });
}

/**
 * 筛选
 * @param data
 * @returns {*}
 * @constructor
 */
export function OrthophotoFilterContent(data) {
    return request({
        url: '/orthophoto/fromeq',
        method: 'post',
        data: data
    });
}

//改
export function update(data) {
    return request({
        url: '/orthophoto/update',
        method: 'post',
        data: data
    })
}

//删
export function removeById(query) {
    return request({
        url: '/orthophoto/removeById',
        method: 'delete',
        params: query
    })
}
