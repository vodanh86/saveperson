import { GCtrl } from "../GCtrl";

const { ccclass, property, menu } = cc._decorator;
@ccclass @menu('FrameEx/CanvasEx')
export default class CanvasEx extends cc.Canvas {

    onLoad() {
        let old = GCtrl.designSize.width / GCtrl.designSize.height;
        let win = cc.view.getVisibleSize().width / cc.view.getVisibleSize().height; //cc.winSize.width / GCtrl.winSize.height;

        if (old > win) {
            this.fitHeight = false;
            this.fitWidth = true;
        }
        else {
            this.fitHeight = true;
            this.fitWidth = false;
        }
    }

    startOpt() {
    }
}