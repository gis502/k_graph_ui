import request from '@/utils/request'


export function getPersonDes(eqid) {
    return request({
        url: '/damageassessment/getPersonDes',
        method: 'post',
        data: eqid
        // params:{id:eqId}
    })
}
export function saveIntensityCircle(savecircles){
    return request({
        url: '/damageassessment/saveIntensityCircle',
        method: 'post',
        data: savecircles
    })
}