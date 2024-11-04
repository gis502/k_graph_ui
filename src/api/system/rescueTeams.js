import request from '@/utils/request';
/**
 * 获取救援物资情况
 */
export function getRescueForces(eqid){
    return request({
        url: '/system/rescueforces', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}
