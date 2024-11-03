import request from '@/utils/request';

/**
 * 获取物资捐赠情况数据
 */

export function getMaterialDonation(eqid){
    return request({
        url: '/system/materialdonation', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}