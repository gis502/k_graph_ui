import request from '@/utils/request'


/**
 * 余震数量统计
 * @returns {*}
 */
export function aftershockSum() {
    return request({
        url: '/system/getLatestAftershockMagnitude',
        method: 'get',
    })
}
