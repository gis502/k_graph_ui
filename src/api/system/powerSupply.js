import request from '@/utils/request';
import dayjs from "dayjs";

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

export function fromPowerSupplyInformation(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/power/fromPowerSupplyInformation', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}
