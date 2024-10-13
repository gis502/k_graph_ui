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
    // 获取URL中的参数
    // const urlParams = new URLSearchParams(window.location.search);
    // const eqid = urlParams.get('eqid');  // 从URL中获取eqid参数

    return request({
        url: '/timeLine/rescueActionCasualties',
        method: 'get',
        // method: 'post',
        // params: { eqid }  // 传递获取到的eqid
        params:data
    });
}

// 获取 救援出队
export function getRescueTeam() {
    // 获取URL中的参数
    const urlParams = new URLSearchParams(window.location.search);
    const eqid = urlParams.get('eqid');  // 从URL中获取eqid参数
    return request({
        url: '/timeLine/rescueTeam',
        method: 'get',
        params: { eqid }  // 传递获取到的eqid
    })
}
// 获取 新闻
export function getNews() {
    return request({
        url: '/timeLine/news',
        method: 'get',
    })
}
