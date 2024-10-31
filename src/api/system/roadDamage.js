import request from '@/utils/request';

/**
 * 获取道路损毁及抢修情况与交通管控情况
 */

export function getRoadRepairs(eqid){
    return request({
        url: '/system/repairs', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}