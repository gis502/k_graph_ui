import request from '@/utils/request'

export function getEmergency(query) {
    return request({
        url: '/emergency/getEmergency',
        method: 'get',
        params: query
    })
}

