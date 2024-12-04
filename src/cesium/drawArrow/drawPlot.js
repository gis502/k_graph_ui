import {
    StraightArrow,
    AttackArrow,
    PincerArrow,
} from "./arrowClass"
import * as Cesium from "cesium"

const arrow = {
    isActivate: false,
    drawArr: [],
    handler: null,
    viewer: null,
    init: function (viewer) {
        if (!this.isActivate) {
            this.isActivate = true;
            this.viewer = viewer;
            // this.bindEdit();
            // 定义全局变量
            window.isDrawingPolygon = false;
        }
    },
    disable: function () {
        if (this.isActivate) {
            this.isActivate = false;
            for (var i = 0; i < this.drawArr.length; i++) {
                this.drawArr[i].disable();
            }
            this.drawArr = [];
            if (this.handler && !this.handler.isDestroyed()) {
                this.handler.destroy();
                this.handler = null;
            }
            this.viewer = null;
        }
    },
    draw: function (type) {
        for (var i = 0; i < this.drawArr.length; i++) {
            this.drawArr[i].disableHandler();
        }
        switch (type) {
            case "straightArrow":
                var straightArrow = new StraightArrow(this.viewer);
                straightArrow.disable();
                straightArrow.startDraw();
                this.drawArr.push(straightArrow);
                break;
            case "attackArrow":
                var attackArrow = new AttackArrow(this.viewer);
                attackArrow.disable()
                attackArrow.startDraw();
                this.drawArr.push(attackArrow);
                break;
            case "pincerArrow":
                var pincerArrow = new PincerArrow(this.viewer);
                pincerArrow.disable()
                pincerArrow.startDraw();
                this.drawArr.push(pincerArrow);
            default:
                break;
        }
    },
    saveData: function () { //保存用户数据
        var jsonData = {
            straightArrowData: [],
            attackArrowData: [],
            pincerArrowData: []
        }
        for (var step = 0; step < this.drawArr.length; step++) {
            var item = this.drawArr[step];
            var positions = item.getLnglats();
            if (item.type == "StraightArrow") {
                jsonData.straightArrowData.push(positions);
            } else if (item.type == "AttackArrow") {
                jsonData.attackArrowData.push(positions);
            } else {
                jsonData.pincerArrowData.push(positions);
            }
        }
        console.log("保存的数据：" + JSON.stringify(jsonData));

    },
    showData: function (jsonData) { //展示用户保存的数据
        if (!jsonData) return;
        var straightArrowArr = jsonData.straightArrowData;
        var attackArrowArr = jsonData.attackArrowData;
        var pincerArrowArr = jsonData.pincerArrowData;
        //展示直线箭头
        for (var i = 0; i < straightArrowArr.length; i++) {
            var item = straightArrowArr[i];
            var straightArrow = new StraightArrow(this.viewer);
            straightArrow.createByData(item);
            this.drawArr.push(straightArrow);
        }
        //展示攻击箭头
        for (var j = 0; j < attackArrowArr.length; j++) {
            var item = attackArrowArr[j];
            var attackArrow = new AttackArrow(this.viewer);
            attackArrow.createByData(item);
            this.drawArr.push(attackArrow);
        }
        //展示钳击箭头
        for (var z = 0; z < pincerArrowArr.length; z++) {
            var item = pincerArrowArr[z];
            var pincerArrow = new PincerArrow(this.viewer);
            pincerArrow.createByData(item);
            this.drawArr.push(pincerArrow);
        }

    },
    showStraightArrow: function (straightArr) {
        for (var i = 0; i < straightArr.length; i++) {
            var flag = this.drawArr.find(cur => cur.objId == straightArr[i].plotId)		//查找一下传入的id和数组中的id是否相同
            if (!flag) {
                var item = straightArr[i];
                var straightArrow = new StraightArrow(this.viewer);
                straightArrow.objId = straightArr[i].plotId;
                straightArrow.createByData(item);
                this.drawArr.push(straightArrow);
            }
        }
    },
    showAttackArrow: function (attackArr) {
        for (var i = 0; i < attackArr.length; i++) {
            var flag = this.drawArr.find(cur => cur.objId === attackArr[i].plotId)		//查找一下传入的id和数组中的id是否相同
            if (!flag) {
                var item = attackArr[i];
                var attackArrow = new AttackArrow(this.viewer);
                attackArrow.objId = attackArr[i].plotId;
                attackArrow.createByData(item);
                this.drawArr.push(attackArrow);
            }
        }
    },
    showPincerArrow: function (pincerArr) {
        for (var i = 0; i < pincerArr.length; i++) {
            var flag = this.drawArr.find(cur => cur.objId == pincerArr[i].plotId)		//查找一下传入的id和数组中的id是否相同
            if (!flag) {
                var item = pincerArr[i];
                var pincerArrow = new PincerArrow(this.viewer);
                pincerArrow.objId = pincerArr[i].plotId;
                pincerArrow.createByData(item);
                this.drawArr.push(pincerArrow);
            }
        }
    },
    drawStraightArrow: function (data, resolve) {
        window.isDrawingPolygon = true;
        for (var i = 0; i < this.drawArr.length; i++) {
            this.drawArr[i].disableHandler();
        }
        var straightArrow = new StraightArrow(this.viewer);
        straightArrow.disable();
        straightArrow.startDraw(data, resolve);
        this.drawArr.push(straightArrow);
    },
    drawAttackArrow: function (data, resolve) {
        window.isDrawingPolygon = true;
        for (var i = 0; i < this.drawArr.length; i++) {
            this.drawArr[i].disableHandler();
        }
        var attackArrow = new AttackArrow(this.viewer);
        attackArrow.disable();
        attackArrow.startDraw(data, resolve);
        this.drawArr.push(attackArrow);
    },
    drawPincerArrow: function (data, resolve) {
        window.isDrawingPolygon = true;
        for (var i = 0; i < this.drawArr.length; i++) {
            this.drawArr[i].disableHandler();
        }
        var pincerArrow = new PincerArrow(this.viewer);
        pincerArrow.disable();
        pincerArrow.startDraw(data, resolve);
        this.drawArr.push(pincerArrow);
    },
    nowArrowObj: null,
    bindEdit: function () {
        var $this = this;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction(function (evt) { //单机开始绘制
            var pick = $this.viewer.scene.pick(evt.position);
            console.log("单击开始绘制pick", pick)
            if (Cesium.defined(pick) && pick.id) {
                if ($this.nowArrowObj) {
                    if ($this.nowArrowObj.state != -1) {
                        console.log("上一步操作未结束，请继续完成上一步！");
                        return;
                    }
                }
                console.log('drawArr', $this.drawArr);

                for (var i = 0; i < $this.drawArr.length; i++) {
                    if (pick.id.objId == $this.drawArr[i].objId) {
                        $this.nowArrowObj = $this.drawArr[i];
                        $this.drawArr[i].startModify();
                        break;
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    clearOne: function () {
        var $this = this;
        this.handler.setInputAction(function (evt) { //单机开始绘制
            var pick = $this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                for (var i = 0; i < $this.drawArr.length; i++) {
                    if (pick.id.objId == $this.drawArr[i].objId) {
                        $this.drawArr[i].clear();
                        $this.drawArr.splice(i, 1);
                        break;
                    }
                }
                $this.handler.destroy();
                $this.bindEdit();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    clearById: function (id) {
        console.log("clearById arrow")
        var $this = this;
        for (var i = 0; i < $this.drawArr.length; i++) {
            if (id === $this.drawArr[i].objId) {
                $this.drawArr[i].clear();
                $this.drawArr.splice(i, 1);
                break;
            }
        }
    },
    clearAll: function () {
        for (var i = 0; i < this.drawArr.length; i++) {
            this.drawArr[i].clear();
        }
    }
}

export default arrow
