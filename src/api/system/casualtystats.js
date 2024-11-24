import request from '@/utils/request';
import dayjs from "dayjs";

/**
 * 获取人员伤亡统计数据
 * @returns {Promise} - 返回一个 Promise 对象，其中包含人员伤亡统计数据
 */
export function getCasualtyStats(eqid) {
    return request({
        url: '/casualty/sumCasById', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function gettotal(eqid) {
    return request({
        url: '/casualty/gettotal', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getCasualty(eqid) {
    return request({
        url: '/casualty/getCasualty', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function fromCasualty(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/casualty/fromCasualty', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}







