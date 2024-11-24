import request from '@/utils/request'
import dayjs from 'dayjs'; // 使用 dayjs 进行日期格式化

/**
 * 余震数量统计
 * @returns {*}
 */
// 新增 API 方法
export function getAftershockMagnitude(eqid) {
    return request({
        url: '/system/getLatestAftershockMagnitude',
        method: 'get',
        params: {eqid: eqid}
    });
}

export function fromAftershock(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/system/fromAftershock', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}

/**
 * 获取各区人口总数
 * @returns {*}
 */
export function getPopulationData() {
    return request({
        url: '/system/populationdata/list',
        method: 'post',
    });
}

export function getRiskPoint(eqid) {
    return request({
        url: `/risk_points/list/${eqid}`, // 使用模板字符串插入 eqid
        method: 'get',
    });
}



export function getAfterShockInformation(eqid) {
    return request({
        url: '/system/getAfterShockInformation',
        method: 'get',
        params: {eqid: eqid}
    });
}

export function getTotal(eqid) {
    return request({
        url: '/system/getAftershock',
        method: 'get',
        params: {eqid: eqid}
    });
}

