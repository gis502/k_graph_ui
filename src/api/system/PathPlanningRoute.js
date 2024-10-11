import request from '@/utils/request';

/**
 * 获取高德api统计数据
 * @param {string} from - 起点
 * @param {string} end - 终点
 * @param {Array} areas - 避免的区域
 * @param {string} key - API密钥
 * @returns {Promise} - 返回一个 Promise 对象
 */
export function getRouteData(from, end, areas, key) {
    return request({
        url: '/system/getRoute',
        method: 'POST',
        data: {
            from,
            end,
            areas,
            key,
        },
    });
}