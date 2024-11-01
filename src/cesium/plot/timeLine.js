/**
 * 初始化计时线
 * 启动计时器，每隔一段时间更新当前时间位置
 */
export function initTimerLine() {
    // 标记计时器为运行状态
    this.isTimerRunning = true;

    // 播放一遍完成（停止，如果计算结果超过，设为最大值）
    if (this.currentTimePosition >= 100) {
        this.currentTimePosition = 0;
        this.currentTime = this.eqstartTime;
        this.currentNodeIndex = 0;
    }

    // 每隔100毫秒更新一次当前时间
    this.intervalId = setInterval(() => {
        this.updateCurrentTime();
    }, 100);
}

/**
 * 时间轴停止
 * 此方法用于停止当前正在运行的定时器它通过清除间隔标识并重置相关状态来实现
 * 定时器停止后，不会再执行任何操作，确保资源得到正确释放
 */
export function stopTimer() {
    // 清除定时器
    clearInterval(this.intervalId);
    // 重置定时器标识为null
    this.intervalId = null;
    // 设置定时器运行状态为false
    this.isTimerRunning = false;

    // console.log("stopTimer")
}

/**
 * 前进一步函数，用于模拟时间线前进
 * 该函数通过增加当前节点索引来实现时间线的前进，并更新当前的时间位置和时间
 * 当达到终点时，会重置当前时间位置为100，并停止计时器
 * @param {number} this.currentNodeIndex 当前节点索引，用于指示时间线上的位置
 * @param {number} this.timelineAdvancesNumber 时间线前进的总次数，用于计算节点索引
 * @param {number} this.currentSpeed 当前速度，用于计算时间位置的增加量
 * @param {number} this.currentTimePosition 当前时间位置，表示进度条的当前位置
 * @param {Date} this.currentTime 当前时间，表示当前的时间点
 * @param {boolean} this.isTimerRunning 计时器是否运行中，用于控制时间线的前进
 * @param {string} this.eqendTime 结束时间，表示时间线的终点
 * @param {string} this.eqid 地震ID，用于在渲染时标识地震
 * @param {Date} this.eqstartTime 开始时间，表示时间线的起点
 * @param {function} this.intimexuanran 渲染函数，根据地震ID渲染地震效果
 * @param {function} this.updatePlot 更新图表函数，用于在时间线前进时更新图表
 */
export function forward() {
    // 更新当前节点索引，使用模运算确保索引在合法范围内
    this.currentNodeIndex = (this.currentNodeIndex + 1) % this.timelineAdvancesNumber
    // 计算进度条每次前进的量
    let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed
    // 增加当前时间位置
    this.currentTimePosition += tmp;
    // 当达到或超过终点时
    if (this.currentTimePosition >= 100) {
        // 重置当前时间位置为100
        this.currentTimePosition = 100;
        // 设置当前时间为结束时间
        this.currentTime = this.eqendTime
        // 停止计时器
        this.isTimerRunning = false
        // 调用渲染函数，传入地震ID
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
    } else {
        // 当未达到终点时，对当前时间位置取模确保值在合法范围内
        this.currentTimePosition = this.currentTimePosition % 100
        // 计算新的时间点，每次增加5分钟
        let newTime = new Date(this.currentTime);
        this.currentTime = newTime.setMinutes(newTime.getMinutes() + 5);
        // 更新图表
        this.updatePlot()
    }
}



/**
 * 后退函数，用于在时间线上向后移动
 * 该函数通过调整当前节点索引和当前时间位置来实现后退
 * 当前时间位置达到0时，停止计时器
 * 否则，根据当前时间位置和节点索引计算新的时间位置和实际时间
 * 并更新图表显示
 */
export function backward() {
    // 减小当前节点索引，并根据时间线前进次数取模，以实现循环效果
    this.currentNodeIndex = (this.currentNodeIndex - 1) % this.timelineAdvancesNumber
    // 计算每次后退的进度百分比
    let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed
    // 减小当前时间位置
    this.currentTimePosition -= tmp;
    // 当前时间位置小于等于0时，重置当前时间位置和时间，并停止计时器
    if (this.currentTimePosition <= 0) {
        this.currentTimePosition = 0;
        this.currentTime = this.eqstartTime
        this.isTimerRunning = false
    } else {
        // 否则，更新当前时间位置
        this.currentTimePosition = this.currentTimePosition % 100
        // 计算新的时间，这里简化处理，直接减去5分钟
        let newTime = new Date(this.currentTime);
        this.currentTime = newTime.setMinutes(newTime.getMinutes() - 5);
        // 更新图表显示
        this.updatePlot()
    }
}


/**
 * 根据用户点击的时间轴位置，跳转到相应的场景
 * @param {MouseEvent} event - 鼠标点击事件
 */
export function jumpToTime(event) {
    // 获取时间轴的矩形区域，用于计算点击位置对应的进度
    const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
    // 计算点击位置相对于时间轴左边缘的距离
    const clickedPosition = event.clientX - timeRulerRect.left;
    // 根据点击位置计算当前时间进度的百分比
    this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
    // 更新时间进度条的宽度，以反映当前时间进度
    this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
    // 根据当前时间进度百分比和总步骤数计算当前步骤索引
    this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber) // Assuming 672 is the total number of steps
    // console.log(this.currentTimePosition,this.timelineAdvancesNumber,"jumpToTime")
    // 根据当前步骤索引计算当前时间，假设每个步骤代表5分钟
    this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
    // console.log("this.currentTime jumpToTime",this.currentTime)
    if (this.currentTimePosition >= 100) {
        // 当时间进度达到或超过100%时，重置为100%
        this.currentTimePosition = 100;
        // 设置当前时间为结束时间
        this.currentTime = this.eqendTime
        // 停止计时器
        this.stopTimer();
        // 更新计时器运行状态标志为false
        this.isTimerRunning = false
        // 调用 intimexuanran 方法，传入地震ID
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
    } else {
        // 如果时间进度未达到100%，则更新图表
        this.updatePlot();
    }
}

/**
 * 时间轴的开始拖拽事件处理函数
 * 该函数用于初始化拖拽操作，记录拖拽开始的位置，并设置拖拽过程中的事件监听器
 * 同时，为了防止在拖拽过程中选中内容，设置了禁止选择的CSS样式
 *
 * @param {MouseEvent} event - 鼠标事件对象，包含拖拽开始时的坐标信息
 */
export function startDrag(event) {
    this.isDragging = true; // 标记当前开始进入拖拽状态
    this.dragStartX = event.clientX; // 记录拖拽开始时的鼠标 X 坐标
    document.addEventListener('mousemove', this.drag); // 在文档上添加鼠标移动事件监听器，用于处理拖拽过程
    document.addEventListener('mouseup', this.stopDrag); // 在文档上添加鼠标抬起事件监听器，用于结束拖拽
    // 添加禁用选择的 CSS 样式
    document.body.style.userSelect = 'none';
    document.body.style.WebkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
}


/**
 * 处理鼠标拖动事件
 * @param {MouseEvent} event - 鼠标拖动事件对象
 */
export function drag(event) {
    // 如果没有拖动，则不执行后续操作
    if (!this.isDragging) return;
    // 获取时间尺的矩形信息
    const timeRulerRect = this.$el.querySelector('.time-ruler').getBoundingClientRect();
    // 计算鼠标点击位置相对于时间尺左边缘的水平距离
    const clickedPosition = Math.max(timeRulerRect.left, Math.min(event.clientX, timeRulerRect.right)) - timeRulerRect.left;
    // 计算新的进度位置百分比
    const newPosition = (clickedPosition / timeRulerRect.width) * 100;
    // 更新当前时间进度位置
    this.currentTimePosition = newPosition;
    // 更新当前节点索引，根据时间线的总进度数进行比例转换
    this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber);
    // 根据开始时间和当前节点索引计算当前时间
    // 注意：此处将时间增量从15分钟调整为5分钟
    this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
    // 更新时间进度条的宽度，以反映新的进度位置
    this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
}

/**
 * 停止拖拽操作
 * 当用户释放鼠标按钮时调用此方法，以重置拖拽状态并停止监听鼠标事件
 */
export function stopDrag() {
    // 重置isDragging状态，表示不再拖拽中
    this.isDragging = false;
    // 移除鼠标移动事件监听器，防止拖拽结束后鼠标移动事件继续触发
    document.removeEventListener('mousemove', this.drag);
    // 移除鼠标释放事件监听器，释放后不再需要此事件处理函数
    document.removeEventListener('mouseup', this.stopDrag);

    // 当currentTimePosition达到或超过100时，进行特殊处理
    if (this.currentTimePosition >= 100) {
        // 将currentTimePosition和currentTime设置为结束时间
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime;
        // 停止计时器
        this.stopTimer();
        // this.isTimerRunning = false
        // this.xuanran(this.eqid)
        // 调用另一个方法进行处理，传入eqid作为参数
        this.intimexuanran(this.eqid)
    } else {
        // 如果不满足上述条件，调用updatePlot方法更新图表
        this.updatePlot();
    }
    // 恢复默认的选择行为
    document.body.style.userSelect = 'auto';
    document.body.style.WebkitUserSelect = 'auto';
    document.body.style.MozUserSelect = 'auto';
    document.body.style.msUserSelect = 'auto';
}

/**
 * 选择时间轴的播放倍速
 *
 * @param {string} speed - 速度的字符串表示，格式为"数字-单位"，如"50-米/秒"
 */
export function selectSpeed(speed) {
    // 直接赋值速度选项
    this.speedOption = speed
    // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
    this.currentSpeed = parseFloat(speed.split('-')[0])
    // console.log("-----------------------",this.currentSpeed)
}


/**
 * 更新当前时间
 * 此方法用于模拟时间进度条的前进，根据当前速度和节点索引更新当前时间
 * 如果时间进度达到终点，将停止时间进度条并触发相关事件
 * 否则，将根据当前节点索引计算实际时间，并更新时间轴上的标绘点
 */
export function updateCurrentTime() {
    // 根据当前速度和节点索引计算新的节点索引，实现时间的前进
    this.currentNodeIndex = (this.currentNodeIndex + 1 * this.currentSpeed) % this.timelineAdvancesNumber //前进timelineAdvancesNumber次，每次5分钟，
    // 计算时间进度条的当前位置增量
    let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed //进度条每次前进
    this.currentTimePosition += tmp;

    // 检查是否达到或超过终点
    if (this.currentTimePosition >= 100) {
        // 达到终点时的处理
        this.currentTimePosition = 100;
        this.currentTime = this.eqendTime
        this.stopTimer();
        this.isTimerRunning = false
        this.intimexuanran(this.eqid)
        // this.xuanran(this.eqid)
    } else {
        // 未达到终点时的处理
        this.currentTimePosition = this.currentTimePosition % 100
        // 根据当前节点索引计算实际时间
        this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        // 根据是否需要显示标绘层来更新图层
        if (this.isMarkingLayer) {
            this.updatePlot()
        } else {
            this.MarkingLayerRemove()
        }
        // end 图层控制 是否显示标绘点（时间轴仍然需要往前）
    }
    // 其他情况的处理（代码中未实现）
    // else{
    //   this.eqendTime=realTime
    //   this.timelineAdvancesNumber=
    // }
}
