import request from '@/utils/request'

export function getYaanAftershockStatistics(data) {
    return request({
        url: '/excel/getYaanAftershockStatistics',
        method: 'post',
        data
    })
}

export function exportExcel(data) {
    return request({
        url: '/excel/exportExcel',
        method: 'post',
        responseType: 'blob', // 确保响应类型为blob
        data
    })
}

export function exportPlotExcel(data) {
  return request({
    url: '/excel/exportPlotExcel',
    method: 'post',
    responseType: 'blob',
    data
  })
}

export function downloadPlotExcel(plotBTO) {
  return request({
    url: '/excel/downloadPlotExcel',
    method: 'post',
    responseType: 'blob',
    data: plotBTO
  })
}

export function getField() {
    return request({
        url: '/Field',
        method: 'GET',
    });
}

export function getData(data) {
    return request({
        url: '/excel/getData',
        method: 'post',
        data
    })
}
export function getExcelUploadByTime(params) {
    return request({
        url: '/excel/getExcelUploadByTime',
        method: 'post',
        params
    })
}
export function getPicEqData(flag, eqId, time) {
    return request({
        url: '/excel/getPicEqData',
        method: 'get',
        params: {
            flag,
            eqId,
            time
        }
    });
}

export function deleteData(data) {8
    return request({
        url: '/excel/deleteData',
        method: 'delete',
        data
    })
}
export function getResettlementData() {
    return request({
        url: '/excel/getResettlementData',
        method: 'post',
    })
}

export function searchData(data) {
    return request({
        url: '/excel/searchData',
        method: 'post',
        data
    })
}