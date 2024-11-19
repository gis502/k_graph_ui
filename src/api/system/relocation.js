import request from '@/utils/request';
import dayjs from "dayjs";

/**
 * 获取转移安置的数据
 */
export function getCasualtyStats(eqid) {
    return request({
        url: '', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getTotal(eqid) {
    return request({
        url: 'transfer/getTotal', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getTransferInfo(eqid) {
    return request({
        url: 'transfer/getTransferInfo', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function fromTransferSettlementInfo(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: 'transfer/fromtransferSettlementInfo', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}


