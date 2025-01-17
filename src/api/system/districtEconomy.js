import request from '@/utils/request'

/*
* 获取对应区县经济与地貌数据
* */
export function getDistrictEconomy() {
    return request({
        url: '/system/getDistrictEconomy',
        method: 'get',
        // params: {}
    })
}

export function getDistrictTerrain(address) {
    return request({
        url: '/system/getDistrictTerrain',
        method: 'get',
        params: {address}
    })
}

