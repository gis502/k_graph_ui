<template>
  <div class="newIn">
    <el-col>
      <div class="eqName">
        {{ eqName }}
      </div>
    </el-col>
    <el-col>
      <div class="time newColCommon">
        发震时间：{{ time }}
      </div>
    </el-col>
    <el-col>
      <div class="lonlat newColCommon">
        震中经纬：{{ longitude }},{{latitude}}
      </div>
    </el-col>
    <el-col>
      <div class="magnitude newColCommon">
        地震震级：{{ magnitude }}
      </div>
    </el-col>
    <el-col>
      <div class="depth newColCommon">
        震源深度：{{ depth }}
      </div>
    </el-col>
    <el-col>
      <div class="position newColCommon">
        参考位置：{{ position }}
      </div>
    </el-col>
  </div>
</template>

<script>
export default {
  name: "newInfo",
  data() {
    return {
      eqName: '四川泸州市泸县3级地震',
      position:'四川泸州市泸县',
      time:'2024-08-02 00:18:02',
      magnitude:'3',
      longitude:'105.56',
      latitude:'29.24',
      depth:'8'
    }
  }
}
</script>

<style scoped>
.newIn{
  color: #fff;
  width: 100%;
  height: 100%;

}
.newColCommon{
  padding-left: 10px;
}

.eqName{
  margin-left: 10px;
  font-size: 18px;
}
</style>
