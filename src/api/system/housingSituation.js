import request from '@/utils/request';

/**
 * 获取保障安置点供水统计
 */

export function getHousingSituationList(eqid){
    return request({
        url: '/system/HousingSituationList', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}