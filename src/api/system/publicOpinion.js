import request from '@/utils/request';

/**
 * 获取宣传舆论情况数据
 */

export function getPublicOpinion(eqid){
    return request({
        url: '/system/publicopinion', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}