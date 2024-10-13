import request from '@/utils/request'


// 获取 应急响应
export function getEmergencyResponse() {
    return request({
        url: '/timeLine/emergencyResponse',
        method: 'get',
    })
}
// 获取 人员伤亡
export function getRescueActionCasualties(data) {
    return request({
        url: '/timeLine/rescueActionCasualties',
        method: 'get',
        params:data
    });
}

// 获取 救援出队
export function getRescueTeam(data) {
    return request({
        url: '/timeLine/rescueTeam',
        method: 'get',
        params: data
    })
}
// 获取 新闻
export function getNews() {
    return request({
        url: '/timeLine/news',
        method: 'get',
    })
}
