import request from '@/utils/request'

/*
* 获取对应区县经济与地貌数据
* */
export function getDistrictEconomy(time) {
    return request({
        url: '/system/getDistrictEconomy',
        method: 'get',
        params: {time}
    })
}

