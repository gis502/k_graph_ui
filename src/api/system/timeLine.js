import request from '@/utils/request'


// 获取 应急响应
export function getEmergencyResponse(data) {
    return request({
        url: '/timeLine/emergencyResponse',
        method: 'get',
        params:data
    })
}
export function saveEmergencyResponse(data){
    return request({
        url: '/timeLine/saveEmergencyResponse',
        method: 'post',
        data:data
    })
}
// 获取 人员伤亡
export function getRescueActionCasualties(data) {
    return request({
        url: '/casualty/getAllRecordInfo',
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
export function getNews(data) {
    return request({
        url: '/timeLine/news',
        method: 'get',
        params: data
    })
}
