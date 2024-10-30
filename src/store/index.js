// store.js
import { createPinia, defineStore } from 'pinia';

// 创建 Pinia 实例
const store = createPinia();

// 定义一个 store
export const useGlobalStore = defineStore('globalEqId', {
    state: () => ({
        globalEqId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', // 全局地震id
        globalChange: '', // 是否更新板块，全局标识
    }),
    actions: {
        setGlobalVariable(newValue) {
            this.globalEqId = newValue;  // 更新全局变量
            console.log("全局地震",this.globalEqId)
        },
        setGlobalChange(newValue){
          this.globalChang = newValue; // 更新全局标识
            console.log("全局模块更新标识",this.globalChang)
        }
    }
});

// 导出 store
export default store;
