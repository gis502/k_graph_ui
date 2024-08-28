import request from '@/utils/request'

export function getEmergencyData(query) {
    return request({
        url: '/system/emergency/getEmergency',
        method: 'get',
        params: query
    })
}

