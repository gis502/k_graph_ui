import request from '@/utils/request'


/**
 * 余震数量统计
 * @returns {*}
 */
// 新增 API 方法
export function getAftershockMagnitude(eqid) {
    return request({
        url: '/system/getLatestAftershockMagnitude',
        method: 'get',
        params: {eqid: eqid}
    });
}

