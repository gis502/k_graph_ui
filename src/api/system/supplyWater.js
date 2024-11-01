import request from '@/utils/request';

/**
 * 获取保障安置点供水统计
 */

export function getEnsureWaterSupply(eqid){
    return request({
        url: '/system/supplyWaterList', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}