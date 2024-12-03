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

export function getBuildingDamage(eqid){
  return request({
    url: '/damageassessment/getBuildingDamageByEqid',
    method: 'get',
    params: { eqid }
  })
}

export function getEconomicLoss(eqid){
  return request({
    url: '/damageassessment/getEconomicLossByEqid',
    method: 'get',
    params: { eqid }
  })
}

export function saveBuildingDamageData(saveBuildingDamage){
  return request({
    url: '/damageassessment/saveBuildingDamage',
    method: 'post',
    data: saveBuildingDamage
  })
}

export function saveEconomicLossData(saveEconomicLoss){
  return request({
    url: '/damageassessment/saveEconomicLoss',
    method: 'post',
    data: saveEconomicLoss
  })
}

// export function dataTest(data){
//   return request({
//     url: '/test/post/resp',
//     method: 'post',
//     data: data
//   })
// }

export function getDA(type, EqEventGetResultTownDTO){
  return request({
    url: '/damageassessment/getDA',
    method: 'post',
    data: EqEventGetResultTownDTO,
    params: { type }
  })
}
