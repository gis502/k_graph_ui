import request from '@/utils/request'

export function getListTable(query) {
    return request({
        url: '/list_table/getListTable',
        method: 'post',
        data: query
    })
}

export function backup(tableName) {
    return request({
        url: '/backup/download',
        method: 'get',
        responseType: 'blob', // Important: specifies the response type
        params: { tableName: tableName }
    });
}