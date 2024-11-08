import request from "@/utils/request.js";

export function upload(data) {
    return request({
        url: '/common/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data
    })
}

export function getNewsList(data) {
    return request({
        url: '/news/getNewsList',
        method: 'post',
        data
    })
}

export function save(data) {
    return request({
        url:'/news/save',
        method:'post',
        data
    })
}

export function removeById(params) {
    return request({
        url: '/news/removeById',
        method: 'delete',
        params
    })
}

export function searchData(data) {
    return request({
        url: '/news/searchData',
        method: 'post',
        data
    })
}

export function update(data) {
    return request({
        url: '/news/update',
        method: 'put',
        data
    })
}
