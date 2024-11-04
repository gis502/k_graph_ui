
import request from '@/utils/request';

/**
 * 获取慈善数据
 */

export function getGovernment(eqid){
    return request({
        url: '/system/governmentdepartmentdonations', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}