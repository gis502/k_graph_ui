import request from "@/utils/request.js";

export function getWay(data) {
    return request({
        url: '/map_test/way',
        method: 'post',
        data: data
    })
}

export function getWayByGaoDe(data) {
    return request({
        url: '/system/driving',
        method: 'post',
        data: data
    })
}