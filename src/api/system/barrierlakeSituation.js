import request from '@/utils/request';

/**
 * 获取堰塞湖数据
 */

export function getBarrierlakeSituation(eqid){
    return request({
        url: '/system/barrierlakesituation', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}