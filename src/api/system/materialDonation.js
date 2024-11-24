import request from '@/utils/request';
import dayjs from "dayjs";

/**
 * 获取物资捐赠情况数据
 */

export function getMaterialDonation(eqid){
    return request({
        url: '/system/materialdonation', // 对应的后台接口
        method: 'get',
        params: { eqid } // 传递参数
    });
}

export function fromMaterialDonation(eqid, time) {

    // 格式化用户输入的时间
    const formattedTime = dayjs(time).format('YYYY-MM-DDTHH:mm:ss');

    return request({
        url: '/system/fromMaterialDonation', // 后端接口地址
        method: 'get',
        params: { eqid, time: formattedTime } // 传递参数
    });
}