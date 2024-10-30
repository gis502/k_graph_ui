import request from '@/utils/request';

/**
 * 获取集中供水工程受损统计
 */

export function getWatterSupplyProjectDamage(eqid){
    return request({
        url: '/system/supplySituationList', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}