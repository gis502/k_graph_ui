import request from '@/utils/request';

/**
 * 获取地质灾害数据
 */

export function getRiskConstructionGeohazards(eqid){
    return request({
        url: '/system/riskconstructiongeohazards', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}