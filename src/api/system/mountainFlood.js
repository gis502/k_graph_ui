import request from '@/utils/request';

/**
 * 获取山洪数据
 */

export function getSecondaryDisaster(eqid){
    return request({
        url: '/system/secondarydisasterinfo', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}