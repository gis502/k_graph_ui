import request from '@/utils/request';

export function getWorkGroupInfo(eqid) {
    return request({
        url: '/system/getWorkGroupInfo', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function getWordCloudLib(eqid) {
    return request({
        url: '/system/getWordCloudLib', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}
