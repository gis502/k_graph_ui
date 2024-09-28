import request from '@/utils/request'


export function getPersonDes(query) {
    return request({
        url: '/damageassessment/getPersonDes',
        method: 'get',
    })
}
export function saveIntensityCircle(savecircles){
    return request({
        url: '/damageassessment/saveIntensityCircle',
        method: 'post',
        data: savecircles
    })
}