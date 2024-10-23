import request from '@/utils/request'
import log from "@/views/monitor/job/log.vue";

//增
export function insert(data) {
    return request({
        url: '/orthophoto/save',
        method: 'post',
        data: data,

    })
}

//查
export function list() {
    return request({
        url: '/orthophoto/list',
        method: 'post',
    })
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