import request from '@/utils/request';
import dayjs from "dayjs";

/**
 * 获取道路损毁及抢修情况与交通管控情况
 */

export function getRoadRepairs(eqid){
    return request({
        url: '/system/repair', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function fromRepair(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/system/fromrepair', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}