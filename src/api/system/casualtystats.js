import request from '@/utils/request';

/**
 * 获取人员伤亡统计数据
 * @returns {Promise} - 返回一个 Promise 对象，其中包含人员伤亡统计数据
 */
export function getCasualtyStats(eqid) {
    return request({
        url: '/casualty/sumCasById', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function gettotal(eqid) {
    return request({
        url: '/casualty/gettotal', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}




