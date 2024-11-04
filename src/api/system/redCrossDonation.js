import request from '@/utils/request';

/**
 * 获取红十字会数据
 */

export function getRedCrossDonations(eqid){
    return request({
        url: '/system/redcrossdonations', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}