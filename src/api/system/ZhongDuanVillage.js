import request from '@/utils/request';

/**
 * 获取中断村
 */

export function getVillages(eqid){
    return request({
        url: '/system/village', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}