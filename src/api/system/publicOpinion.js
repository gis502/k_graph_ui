import request from '@/utils/request';
import dayjs from "dayjs";

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

export function fromPublic(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/system/fromPublicOpinion', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}