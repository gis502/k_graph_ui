import request from "@/utils/request.js";

export function upload(data) {
    return request({
        url: '/common/upload',
        method: 'post',
        headers : {'Content-Type': 'multipart/form-data'},
        data: data
    })
}

export function getNewsList() {
    return request({
        url:'/news/getNewsList',
        method:'post'
    })
}


