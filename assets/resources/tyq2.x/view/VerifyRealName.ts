// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { tyqSDK } from "../tyq-sdk";


const { ccclass, property } = cc._decorator;

@ccclass
export default class VerifyRealName extends cc.Component {
    @property(cc.EditBox) editbox_name: cc.EditBox = null;
    @property(cc.EditBox) editbox_id: cc.EditBox = null;
    @property(cc.Node) tipNode: cc.Node = null;
    private _local = "tyq_real_name";
    private _child = "tyq_no_18";
    private _noChild = "tyq_full_18";
    private _cb: Function = null;
    protected onLoad(): void {
        this.node.setContentSize(cc.winSize);
        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }

    }
    protected start(): void {
        let isHideVerifyRealName = tyqSDK.getSwitchValue("isHideVerifyRealName");
        if (isHideVerifyRealName) {
            this.node.active = false;
            this.node.destroy();
            return;
        }
        let status = cc.sys.localStorage.getItem(this._local);
        if (!status) {

        } else if (status == this._child) {
            this.showChildTip();
        } else if (status == this._noChild) {
            this.node.active = false;
            this.node.destroy();
        }
    }
    public init(cb: Function) {
        this._cb = cb;

    }
    protected onDestroy(): void {
        cc.sys.localStorage.setItem(this._local, this._noChild);
        if (this._cb) {
            this._cb();
        }
    }
    public onClickSubmit() {
        this.send();
    }
    public send() {
        let name = this.editbox_name.string;
        let carId = this.editbox_id.string;
        if (!name || !carId) {
            return;
        }
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (reg.test(carId) === false) {
            this.showToast("身份证输入不合法");
            return;
        }


        tyqSDK.verifyRealName(carId, name, (res: { errcode: number, errmsg: string }) => {
            console.log(res);
            //成功
            if (res.errcode == 0) {

                this.showToast("认证成功");
                this.node.destroy();

                //实名信息验证失败
            } else if (res.errcode == 401) {

                this.showToast("实名认证失败,请输入正确的信息");
                //未满18周岁
            } else if (res.errcode == 402) {
                cc.sys.localStorage.setItem(this._local, this._child);
                this.showChildTip();
            }
        });
    }
    public showToast(str) {
        let node = new cc.Node();
        node.zIndex = 9999;
        node.color = cc.color(255, 255, 255);
        cc.find("Canvas").addChild(node);
        let label = node.addComponent(cc.Label);
        label.string = str;
        cc.tween(node).to(1.2, { opacity: 100 }).start();
        cc.tween(node).by(1.5, { y: 200 }).removeSelf().start();
    }
    public showChildTip() {
        this.tipNode.active = true;
    }
    public onClickExit() {
        cc.game.end();
    }
}
