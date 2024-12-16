<template>
  <div class="app-container">
    <el-form-item label="地震信息">
      <el-input
        v-model="queryParams"
        placeholder="请输入地震信息"
        clearable
        style="width: 200px"
        @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
<!--      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>-->
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleAddOrUpdate('add')">新增</el-button>

    </el-form-item>

    <el-table
      :data="tableData"
      :stripe="true"
      :header-cell-style="tableHeaderColor"
      :cell-style="tableColor"
    >
      <el-table-column label="序号" width="60">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <el-table-column
        prop="occurrenceTime"
        label="发震时间"
        width="250"
        show-overflow-tooltip
      ></el-table-column>

      <el-table-column
        prop="earthquakeName"
        label="位置"
        width="300"
        show-overflow-tooltip
      ></el-table-column>

      <el-table-column prop="magnitude" label="震级(级)"></el-table-column>
      <el-table-column prop="longitude" label="经度(度分)"></el-table-column>
      <el-table-column prop="latitude" label="纬度(度分)"></el-table-column>
      <el-table-column prop="depth" label="深度(千米)"></el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleOpen('修改', scope.row)"
          >修改
          </el-button>
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%">
      <el-form ref="from" :model="dialogContent" :rules="rules">
        <el-row>
          <el-col :span="13">
            <el-form-item label="震发位置：" prop="earthquakeName">
              <el-input v-model="dialogContent.earthquakeName" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="发震时间：" prop="occurrenceTime">
              <el-date-picker
                v-model="dialogContent.occurrenceTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="震级(级)：" prop="magnitude">
              <el-input v-model="dialogContent.magnitude" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="深度(千米)：" prop="depth">
              <el-input v-model="dialogContent.depth" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="dialogContent.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="dialogContent.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>

    <el-dialog
      v-model="queryFormVisible"
      title="筛选"
      width="30vw"
      style="top:20vh"
    >
      <el-form :inline="true" :model="formValue" ref="formValue" :rules="formValuerules" :show-close="false">
        <el-form-item label="地震位置">
          <el-input v-model="formValue.earthquakeName" style="width: 23vw;" placeholder="地震位置" clearable/>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
            v-model="formValue.occurrenceTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            style="width: 23vw;"
            value-format="YYYY-MM-DDTHH:mm:ss"/>
        </el-form-item>
        <el-form-item label="地震震级" prop="magnitude" class="formValue">
          <el-input v-model="formValue.startMagnitude" style="width: 5vw;" placeholder="起始震级"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endMagnitude" style="width: 5vw;" placeholder="结束震级"/>
          <span style="margin: 0 10px">(级)</span>
        </el-form-item>
        <el-form-item label="地震深度" prop="depth" class="formValue">
          <el-input v-model="formValue.startDepth" style="width: 5vw" placeholder="起始深度"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endDepth" style="width: 5vw" placeholder="结束深度"/>
          <span style="margin: 0 10px">(千米)</span>
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="Cancel">取 消</el-button>
        <el-button type="primary" @click="onSubmit">筛 选</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="panelTitle" v-model="isPanelShow" width="30%">
      <el-form ref="panel" :model="addOrUpdateDTO" :rules="panelRules">
        <el-row>
          <el-col :span="13">
            <el-form-item label="震发位置：" prop="eqName">
              <el-input v-model="addOrUpdateDTO.eqAddr" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="发震时间：" prop="eqTime">
              <el-date-picker
                v-model="addOrUpdateDTO.eqTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="震级(级)：" prop="eqMagnitude">
              <el-input v-model="addOrUpdateDTO.eqMagnitude" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="深度(千米)：" prop="eqDepth">
              <el-input v-model="addOrUpdateDTO.eqDepth" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="addOrUpdateDTO.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="addOrUpdateDTO.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item label="地震类型：" prop="eqType">
            <el-select v-model="addOrUpdateDTO.eqType" placeholder="请选择地震类型" style="width: 200px" clearable>
              <el-option
                v-for="item in eqType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelPanel">取 消</el-button>
          <el-button type="primary" @click="commitPanel">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import {addEq, getAllEq, deleteeq, updataEq, queryEq, fromEq, eqEventTrigger} from '@/api/system/eqlist'

export default {
  name: "index",
  data() {

    return {
      rules: {
        earthquakeName: [
          {required: true, message: '请输入震发位置', trigger: 'blur'},
        ],
        occurrenceTime: [
          {required: true, message: '请选择发震时间', trigger: ['blur', 'change']},
        ],
        magnitude: [
          {required: true, message: '请输入震级(级)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('震级不能为空'));
              }
              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('震级必须为数字'));
              }
              if (num < 3 || num > 10) {
                return callback(new Error('震级必须在 3 到 10 之间'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },

        ],
        depth: [
          {required: true, message: '请输入深度(千米)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('深度不能为空'));
              }
              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('深度必须为数字'));
              }
              if (num < 0) {
                return callback(new Error('深度不能为负数'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },
        ],
        longitude: [
          {required: true, message: '请输入经度(度分)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('经度不能为空'));
              }
              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('经度必须为数字'));
              }
              if (num < -180 || num > 180) {
                return callback(new Error('经度应在-180到180之间'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },
        ],
        latitude: [
          {required: true, message: '请输入纬度(度分)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('纬度不能为空'));
              }
              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('纬度必须为数字'));
              }
              if (num < -90 || num > 90) {
                return callback(new Error('纬度应在-90到90之间'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },
        ],
      },
      formValuerules: {
        magnitude: [
          {
            validator: (rule, value, callback) => {
              const {startMagnitude, endMagnitude} = this.formValue;

              // 检查两个值是否都存在
              if (!startMagnitude || !endMagnitude) {
                callback(); // 直接通过，不进行验证
                return;
              }

              // 进行震级比较
              if (Number(startMagnitude) > Number(endMagnitude)) {
                callback(new Error('起始震级必须小于等于结束震级'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        depth: [
          {
            validator: (rule, value, callback) => {
              const {startDepth, endDepth} = this.formValue;

              // 检查两个值是否都存在
              if (!startDepth || !endDepth) {
                callback(); // 直接通过，不进行验证
                return;
              }

              // 进行深度比较
              if (Number(startDepth) > Number(endDepth)) {
                callback(new Error('起始深度必须小于等于结束深度'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },

      formValid: false, // 表单验证状态
      getEqData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        earthquakeName: '',
        occurrenceTime: '', // 初始化为当前时间的时间戳
        magnitude: '',
        longitude: '',
        latitude: '',
        depth: '',
        eqid: '',
      },
      queryParams: '',

      requestParams: '',
      queryFormVisible: false,
      formValue: {
        earthquakeName: '',
        occurrenceTime: '',
        startMagnitude: '',
        endMagnitude: '',
        startDepth: '',
        endDepth: ''
      },
      shortcuts: [
        {
          text: '近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        },
        {
          text: '近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          }
        },
        {
          text: '近一年',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
            return [start, end]
          }
        }
      ],

      addOrUpdateDTO: {
        event: '',
        eqName: '',
        eqTime: '',
        eqAddr: '',
        longitude: '',
        latitude: '',
        eqMagnitude: '',
        eqDepth: '',
        eqType: '',
      },

      panelTitle: '',
      isPanelShow: false,
      panelRules: '',

      eqType: [
        {
          label: "正式",
          value: "Z",
        },
        {
          label: "演练",
          value: "Y",
        },
        {
          label: "测试",
          value: "T",
        }
      ]

    }
  },
  mounted() {
    setInterval(this.updateTime, 500)
    this.getEq()
    console.log(this.simplifyLocation("四川省雅安市雨城区某某镇" ,5))
    console.log(this.simplifyLocation("四川省雅安市石棉县安顺场镇", 5.5))
    console.log(this.simplifyLocation("甘肃省陇南市文县", "6.5"))
  },
  methods: {

  commitPanel() {

    this.$notify({
      title: '地震触发成功',
      message: "正在进行评估中,请等待",
      duration: 600000
    });

    this.isPanelShow = !this.isPanelShow
    this.addOrUpdateDTO.event = this.createTid()
    this.addOrUpdateDTO.eqName = this.simplifyLocation(this.addOrUpdateDTO.eqAddr, this.addOrUpdateDTO.eqMagnitude)
    this.addOrUpdateDTO.eqTime = this.addOrUpdateDTO.eqTime.replace('T', ' ')
    eqEventTrigger(this.addOrUpdateDTO)
        .then(res => {
          console.log(res)
        })
    // console.log("你好：", this.addOrUpdateDTO)
  },

    cancelPanel() {
      this.addOrUpdateDTO = {
        event: '',
        eqName: '',
        eqTime: '',
        eqAddr: '',
        longitude: '',
        latitude: '',
        eqMagnitude: '',
        eqDepth: '',
        eqType: '',
      }
    },


    onSubmit() {
      const {earthquakeName, occurrenceTime, startMagnitude, endMagnitude, startDepth, endDepth} = this.formValue;

      // 如果时间范围选择为空，将其设为null
      let startTime = null;
      let endTime = null;
      if (occurrenceTime && occurrenceTime.length === 2) {
        startTime = this.formatISODateTimeToBackend(occurrenceTime[0])
        endTime = this.formatISODateTimeToBackend(occurrenceTime[1])

        // console.log("转换后的开始时间:", startTime);
        // console.log("转换后的结束时间:", endTime);
      }

      // 构建查询对象
      const queryParams = {
        earthquakeName: earthquakeName || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        startMagnitude: startMagnitude || undefined,
        endMagnitude: endMagnitude || undefined,
        startDepth: startDepth || undefined,
        endDepth: endDepth || undefined,
      };

      // 发送请求
      fromEq(queryParams).then(res => {
        // 处理返回的数据
        this.getEqData = res.map(item => ({
          ...item,
          occurrenceTime: this.timestampToTime(item.occurrenceTime),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2)
        }));
        this.total = this.getEqData.length;
        this.tableData = this.getPageArr();
        // 隐藏筛选表单
        this.queryFormVisible = false;
        this.clearFormValue();
      });

    },
    openQueryForm() {
      this.queryFormVisible = true
    },
    updateTime() {
      this.nowTime = this.now_time()
    },
    now_time() {
      let myDate = new Date()
      let myYear = myDate.getFullYear()
      let myMonth = myDate.getMonth() + 1
      let myToday = myDate.getDate()
      let myDay = myDate.getDay()
      let myHour = myDate.getHours()
      let myMinute = myDate.getMinutes()
      let mySecond = myDate.getSeconds()
      let week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return myYear + '年' + this.fillZero(myMonth) + '月' + this.fillZero(myToday) + '日' + this.fillZero(myHour) + ':' + this.fillZero(myMinute) + ':' + this.fillZero(mySecond) + week[myDay]
    },
    fillZero(str) {
      return str < 10 ? '0' + str : str
    },
    getEq() {
      let that = this
      getAllEq().then(res => {
        let resData = res.filter(item => item.magnitude >= 3)
        that.getEqData = resData
        that.total = resData.length
        let data = []
        for (let i = 0; i < res.length; i++) {
          let item = res[i]
          item.occurrenceTime = that.timestampToTime(item.occurrenceTime)
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        console.log("返回的数据：", res)
        that.tableData = this.getPageArr()
      })
    },

    handleAddOrUpdate(operation) {
      if (operation === 'add') {
        this.isPanelShow = !this.isPanelShow
      }
    },

    // 删除单条地震
    handleDelete(row) {
      let that = this;
      this.$confirm('确定要删除这条地震记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteeq({eqid: row.eqid}).then(res => {
          that.getEq();
          that.$message({
            type: 'success',
            message: '删除成功'
          });
        });
      }).catch(() => {
        that.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 点击新增或修改打开dialog对话框
    handleOpen(title, row) {
      if (title === "新增") {
        this.dialogTitle = title
        console.log(this.dialogTitle)
      } else if (title === "修改") {
        this.dialogTitle = title
        this.dialogContent = {
          earthquakeName: row.earthquakeName,
          occurrenceTime: this.formatDateToBackend(row.occurrenceTime), // 初始化为当前时间的时间戳
          magnitude: row.magnitude,
          longitude: row.longitude,
          latitude: row.latitude,
          depth: row.depth,
          eqid: row.eqid,
        }
      }
      this.dialogShow = !this.dialogShow
    },
    // 搜索功能
    handleQuery() {
      // 获取搜索关键字
      const searchKey = this.queryParams.trim();
      let result = searchKey.replace(/年|月/g, "-").replace(/日/g, "");
      // 如果搜索关键字为空，恢复为原始数据
      if (searchKey === "") {
        this.tableData = this.getPageArr();  // 恢复所有数据并重新进行分页
        return;
      }

      // 发送搜索请求
      queryEq({queryValue: result}).then(res => {
        console.log("检查返回的数据", res); // 检查返回的数据
        // 处理并格式化返回的数据
        const filteredData = res.filter(item => item.magnitude >= 3).map(item => ({
          ...item,
          occurrenceTime: this.timestampToTime(item.occurrenceTime),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));
        // 搜索之后更新数据
        this.getEqData = filteredData;
        this.total = filteredData.length;  // 更新总数
        // 使用更新后的数据更新分页
        this.tableData = this.getPageArr(filteredData);  // 传入处理后的数据
      }).catch(error => {
        console.error("搜索时出现错误:", error);
      });
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getEq();  // 重新加载所有数据
    },

    //新增或修改
    commit() {
      this.$refs.from.validate((valid) => {
        if (valid) {
          // 发送请求
          // 提交表单逻辑
          console.log("表单验证通过，提交数据");
        } else {
          console.log("表单验证失败，请检查输入！");
          // this.$message.error('表单验证失败，请检查输入！');
        }
      });

      // this.dialogContent.occurrenceTime = this.formatDateToBackend(this.dialogContent.occurrenceTime); // 调用方法格式化时间
      console.log("formatDateToBackend格式化时间commit：", this.dialogContent.occurrenceTime);
      this.dialogContent.occurrenceTime = this.formatISODateTimeToBackend(this.dialogContent.occurrenceTime); // 调用方法格式化时间
      console.log("formatDateToBackend“T”->' 'commit：", this.dialogContent.occurrenceTime);


      if (this.dialogTitle === "新增") {
        console.log("this.dialogContent.time新增：", this.dialogContent.occurrenceTime);
        addEq(this.dialogContent).then(res => {
          this.getEq();
          this.dialogShow = false;
          this.clearDialogContent();
        });
      } else {

        console.log("this.dialogContent.time更新：", this.dialogContent.occurrenceTime);
        updataEq(this.dialogContent).then(res => {
          this.getEq();
          this.dialogShow = false;
          this.clearDialogContent();
        });
      }
    },

    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
      this.$refs.from.resetFields(); // 重置表单
      this.$refs.from.clearValidate(); // 清除验证状态
    },
    // 关闭dialog对话框
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },
    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
    },
    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },
    // 对数据库获取到的标绘图片数组切片
    getPageArr(data = this.getEqData) {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        arr.push(data[start])
      }
      return arr
    },

    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.pageSize = val
      this.tableData = this.getPageArr()
      // console.log(`每页 ${val} 条`);
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.getPageArr()
      // console.log(`当前页: ${val}`);
    },
    // 修改table的header的样式
    tableHeaderColor() {
      return {
        // 'border-color': '#293038',
        // 'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        // 'color': '#fff',
        // 'padding': '0',
        'text-align': 'center',
        'font-size': '16px'
      }
    },
    // 修改table 中每行的样式
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          // 'border-color': '#313a44',
          // 'background-color': '#313a44',
          // 'color': '#fff',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'height': '60px',
          'text-align': 'center',
          'font-size': '16px',
        }
      } else {
        return {
          // 'border-color': '#304156',
          // 'background-color': '#304156',
          // 'color': '#fff',
          // 'padding': '0',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'text-align': 'center',
          'font-size': '16px'
        }
      }
    },

    simplifyLocation(eqAddr, eqMagnitude) {
      const match = eqAddr.match(/^(\S*省)?(\S*市|\S*州)?(\S*区|\S*县)/);
      if (!match) return eqAddr; // 无法匹配返回原始地名

      // 提取省、市/州、区/县
      const province = match[1] ? match[1].replace("省", "") : ""; // 省份去掉“省”
      const county = match[3] ? match[3].replace(/[区县]/, "") : ""; // 区/县去掉后缀

      // 如果市/州与区/县之间只有一个字，连带区/县返回
      if (county.length === 1) {
        return `${province}${match[3]}${eqMagnitude}级地震`;
      }

      // 正常返回省、市/州简化结果
      return `${province}${county}${eqMagnitude}级地震`;
    },


    createTid() {

      // 构造当前时间的部分
      // const now = new Date();
      // const year = now.getFullYear(); // 4位年份
      // const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份，补齐两位
      // const day = String(now.getDate()).padStart(2, '0'); // 日期，补齐两位
      // const hours = String(now.getHours()).padStart(2, '0'); // 小时，补齐两位
      // const minutes = String(now.getMinutes()).padStart(2, '0'); // 分钟，补齐两位
      // const seconds = String(now.getSeconds()).padStart(2, '0'); // 秒钟，补齐两位
      // const randomId = this.guid(8); // 提取 GUID 的最后8位
      //
      // // 拼接成完整的 event 值
      // const Tid = `T${year}${month}${day}${hours}${minutes}${seconds}${randomId}`;
      // return Tid;
      return this.guid()
    },
    // 构造当前时间的部分
    // const now = new Date();
    // const year = now.getFullYear(); // 4位年份
    // const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份，补齐两位
    // const day = String(now.getDate()).padStart(2, '0'); // 日期，补齐两位
    // const hours = String(now.getHours()).padStart(2, '0'); // 小时，补齐两位
    // const minutes = String(now.getMinutes()).padStart(2, '0'); // 分钟，补齐两位
    // const seconds = String(now.getSeconds()).padStart(2, '0'); // 秒钟，补齐两位
    // const randomId = this.guid(8); // 提取 GUID 的最后8位
    //
    // // 拼接成完整的 event 值
    // const Tid = `T${year}${month}${day}${hours}${minutes}${seconds}${randomId}`;
    // return Tid;
    return this.guid();
  },

  guid(num) {
    return num ?
        Array.from({length: num}, () => Math.floor(Math.random() * 10)).join('') :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0,
              v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
  },


    timestampToTime(timestamp) {
      // console.log("转换前的时间戳:", timestamp);
      let DateObj = new Date(timestamp)
      if (isNaN(DateObj.getTime())) {
        console.error("无效的时间戳:", timestamp);
        return "";
      }
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
      let year = DateObj.getFullYear()
      let month = DateObj.getMonth() + 1
      let day = DateObj.getDate()
      let hh = DateObj.getHours()
      let mm = DateObj.getMinutes()
      let ss = DateObj.getSeconds()
      month = month > 9 ? month : '0' + month
      day = day > 9 ? day : '0' + day
      hh = hh > 9 ? hh : '0' + hh
      mm = mm > 9 ? mm : '0' + mm
      ss = ss > 9 ? ss : '0' + ss

      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
    },

    /**
     * 将年月日转换成-的形式 （用于格式化传给后端）
     * @param inputDate
     * @returns {string}
     */
    formatDateToBackend(inputDate) {
      // 使用正则表达式提取日期和时间部分
      const regex = /(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2}):(\d{2})/;
      const matches = inputDate.match(regex);

      if (matches) {
        // 格式化为目标格式 "yyyy-MM-dd HH:mm:ss"
        return `${matches[1]}-${matches[2]}-${matches[3]} ${matches[4]}:${matches[5]}:${matches[6]}`;
      } else {
        throw new Error("Invalid date format");
      }
    },
    /**
     * 将ISO格式换成后端想要的格式
     * @param input
     * @returns {*|string}
     */
    formatISODateTimeToBackend(input) {
      if (!input) return '';
      return input.replace('T', ' '); // 替换 'T' 为空格
    }

}
,
}

</script>

<style scoped>
.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

.dialog-footer {
  position: relative;
  bottom: -5px;
  right: 0;
  padding: 5px; /* 调整按钮与对话框边缘的距离 */
  text-align: right; /* 右对齐按钮 */
}

:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 15%;
  position: relative;
  margin: 0 auto;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #262259;
  font-size: inherit;
  /*display: none;*/
}

:deep(.formValue) {
  padding-bottom: 13px;
}


:deep(.el-form) {
  padding-bottom: 6px;
}


:deep(.el-form-item--default .el-form-item__error) {
  font-size: 14px !important; /* 字体大小 */
  padding-top: 5px !important;
}

:deep(.el-form--inline .el-form-item ) {
  padding-bottom: 8px;
}

.el-row {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  padding: 10px !important;
}
</style>
