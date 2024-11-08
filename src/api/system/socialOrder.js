import request from '@/utils/request';

/**
 * 获取社会秩序情况数据
 */

export function getSocialOrder(eqid){
    return request({
        url: '/system/socialorder', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}