import request from '@/utils/request'

//增
export function insert(data) {
    return request({
        url: '/safety_protection/insert',
        method: 'post',
        data: data
    })
}

//查全部
export function list() {
    return request({
        url: '/safety_protection/list',
        method: 'post',
    })
}

//条件查询
export function searchSafetyProtection(data) {
    return request({
        url: '/safety_protection/searchSafetyProtection',
        method: 'post',
        params: data
    })
}


//改
export function update(data) {
    return request({
        url: '/safety_protection/update',
        method: 'put',
        data: data
    })
}

//删
export function removeById(query) {
    return request({
        url: '/safety_protection/removeById',
        method: 'delete',
        params: query
    })
}