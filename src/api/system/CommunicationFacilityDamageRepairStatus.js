import request from '@/utils/request';

/**
 * 获取通信设施损毁及抢修情况
 */

export function getFacility(eqid){
    return request({
        url: '/system/facility', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}