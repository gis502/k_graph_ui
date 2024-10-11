import request from '@/utils/request';

/**
 * 获取转移安置的数据
 */
export function getCasualtyStats(eqid) {
    return request({
        url: '', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getTotal(eqid) {
    return request({
        url: 'transfer/getTotal', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getTransferInfo(eqid) {
    return request({
        url: 'transfer/getTransferInfo', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}
