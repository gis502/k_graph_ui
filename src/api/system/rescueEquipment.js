import request from '@/utils/request';
/**
 * 获取大型救援设备情况
 */
export function getEquipment(eqid){
    return request({
        url: '/system/largespecialrescueequipment', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}
