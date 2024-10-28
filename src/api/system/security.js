import request from '@/utils/request'

//增
export function insert(data) {
    if (data.source === "全部IPv4地址") {
        data.source = "0.0.0.0/0"
    } else if (data.source === "全部IPv6地址") {
        data.source = "::/0"
    }
    
    return request({
        url: '/safety_protection/insert',
        method: 'post',
        data: data
    })
}

//增
export function list() {
    return request({
        url: '/safety_protection/list',
        method: 'post',
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