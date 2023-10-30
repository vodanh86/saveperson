
// import { _decorator, Component, Node, SpriteFrame, SpriteComponent, SystemEvent } from 'cc';
// import BaseView from '../BaseView';
// import { Vivo } from '../../easyFramework/channel/vivo/Vivo';
// import AD from '../../AD';
// import GDef from '../../config/GDef';

import { OPPO } from "../Platform/oppoSDK/oppoAdMange";
import { Vivo } from "../Platform/vivoSDK/Vivo";
import SdkMgr, { Channel } from "../SdkMgr";



// import global from '../../config/global';
const { ccclass, property } = cc._decorator;

@ccclass
export class OV_NativeAd extends cc.Component {

    /**原生id */
    private _adId: any = null;
    /**显示这个原生广告节点面板 */
    /**回调 */
    private _closeCb: Function = null!;
    private _clickCb: Function = null;
    private _clickLabelCb: Function = null;

    private isLoadSuccess: boolean = false;

    @property({
        type: cc.Sprite,
        tooltip: "ov原生"
    })
    spt_banner: cc.Sprite = null!;

    @property(cc.Label)
    lb_look: cc.Label = null;
    @property(cc.Node)
    btn_continue: cc.Node = null;
    @property(cc.Node)
    btn_look: cc.Node = null;

    @property(cc.Node) node_close: cc.Node = null;
    @property(cc.Node) taget: cc.Node = null;

    onLoad() {
        this.lb_look.node.active = false;
        this.btn_continue.active = false;
        this.btn_look.active = false;
        this.node.active = false;
    }

    public onClickNativeAd() {
        console.log("触摸到原生广告");
        console.log("发送原生广告");


        if (SdkMgr.ins.getChannel() == Channel.VIVO) {
            Vivo.clickNativeAd(this._adId);
        } else if (SdkMgr.ins.getChannel() == Channel.OPPO) {
            OPPO.clickNativeAd(this._adId);
        }
        if (this._clickCb) {
            this._clickCb();
            this._clickCb = null;
        }
    }

    public onContinueClick() {
        this.onClose();
    }
    /**关闭 */
    public onClose() {

        if (this._closeCb != null) {
            this._closeCb();
            this._closeCb = null;
        }
        this.node.destroy();
    }
    //点击文字
    public onClickLabel() {
        if (this._clickLabelCb) {
            this._clickLabelCb();
            this._clickLabelCb = null;
        }
    }
    public sendNative() {
        if (this.isLoadSuccess) {
            this.onClickNativeAd();
            return true;
        }
        return false;
    }
    private create(success?: Function, fail?: Function) {
        // this.bindButton(this.ui_btn, () => {
        //     Vivo.clickNativeAd(this._adId);
        // });
        if (SdkMgr.ins.getChannel() == Channel.VIVO) {
            Vivo.createNativeAd((res: any) => {
                this.onCreateAd(res);
                if (success) {
                    success(this);
                }
            }, () => {
                this.onCreateFail();
                if (fail) {
                    fail(this);
                }
            });
        } else if (SdkMgr.ins.getChannel() == Channel.OPPO) {
            OPPO.createNativeAd((res: any) => {
                this.onCreateAd(res);
                if (success) {
                    success(this);
                }
            }, () => {
                this.onCreateFail();
                if (fail) {
                    fail(this);
                }
            });
        } else {
            success();
        }


        // this._panelNode = panel!;
        // this._callBack = callBack!;
    }
    private onCreateAd(res) {
        console.log("createNativeAd");
        this.node.active = true;
        this._adId = res.adId;
        this.loadRoteImg(res.imgUrlList[0], (sptFrame: cc.SpriteFrame) => {
            console.log("imgUrlList", sptFrame);
            // this.ui_top.on(cc.Node.EventType.TOUCH_START, () => {
            //     console.log("触摸到原生广告");
            //     console.log("发送原生广告");
            //     Vivo.clickNativeAd(this._adId);

            // }, this);

            this.spt_banner.spriteFrame = sptFrame;
        })
        this.isLoadSuccess = true;
    }
    private onCreateFail(res?) {
        this.node.active = false;;
        console.log("fail")
    }

    public init(parent: cc.Node, pos: cc.Vec2, size: cc.Size, success?: Function, fail?: Function) {
        this.node.parent = parent;
        this.node.setPosition(pos);
        this.spt_banner.node.setContentSize(size);
        this.lb_look.node.y = size.height + 17;
        this.node_close.setPosition(size.width / 2 - 24, size.height - 24);
        this.taget.setPosition(-size.width / 2 + this.taget.width / 2, size.height - this.taget.height / 2);
        this.create(success, fail);
    }
    private loadRoteImg(url: string, cb: (frame: cc.SpriteFrame) => void) {
        cc.loader.load(url, (err: Error, data: cc.Texture2D) => {
            if (err) {
            } else {
                // let text2d = new Texture2D();
                // text2d.image = data;
                let sptFrame = new cc.SpriteFrame(data);
                // sptFrame.texture = text2d;
                cb(sptFrame);
            }
        })
    }

    public setTipLabel(lb: string = "点击查看", cb?: Function) {
        this.lb_look.node.active = true;
        this.lb_look.string = lb;
        this._clickLabelCb = cb;
        return this.lb_look.node;
    }
    //设置底部提示语,第一个继续,第二个查看广告
    public setBottomTip(str1, str2) {
        if (str1) {
            this.btn_continue.active = true;
            this.btn_continue.children[0].getComponent(cc.Label).string = str1;
        }
        if (str2) {
            this.btn_look.active = true;
            this.btn_look.children[0].getComponent(cc.Label).string = str2;
        }
    }
    // public showMoreBtn() {

    //     this.btn_continue.active = true;
    //     this.btn_look.active = true;

    // }
    // public hidebtn_look() {
    //     this.btn_look.active = false;
    // }
    // public show_btn_continue() {
    //     this.btn_continue.active = true;
    // }

    public setCloseCb(closeCb: Function) {
        this._closeCb = closeCb;
    }
    public setClickCb(cb: Function) {
        this._clickCb = cb;
    }
}

