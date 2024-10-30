import request from '@/utils/request';

/**
 * 获取电力设施损毁及抢修情况
 */



export function getPowerSupply(eqid){
    return request({
        url: '/power/supply', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}