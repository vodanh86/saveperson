import { EDartsType, tyqSDK } from "../tyq-sdk";
import TyqViewMgr from "../tyq-view-mgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DartAd extends cc.Component {
    @property(cc.Sprite) spt_img: cc.Sprite = null;
    private dartType: EDartsType = -1;
    private adData: any = {};
    @property(cc.Node) btn_close: cc.Node = null;
    private clickTime = 0;
    private config: any = null;
    protected onLoad(): void {
        this.btn_close.active = false;
    }
    protected start(): void {

    }
    public initData(data, type: EDartsType, config) {
        if (data) {
            this.adData = data;
            this.dartType = type;
            this.config = config;
            cc.assetManager.loadRemote(data.img_name, (err: Error, texture: cc.Texture2D) => {
                if (err) {
                    console.error(err);
                } else {
                    if (!this.spt_img) return;
                    this.spt_img.spriteFrame = new cc.SpriteFrame(texture);
                    if (this.dartType == EDartsType.grid) {
                        this.btn_close.active = false;
                        this.spt_img.node.setContentSize(60, 60);
                    } else if (this.dartType == EDartsType.infoFlow) {
                        // this.spt_img.node.setContentSize(510, 420);
                        this.btn_close.active = true;
                        this.btn_close.setPosition(this.spt_img.node.width / 2 - this.btn_close.width / 2, this.spt_img.node.height / 2 - this.btn_close.height / 2);
                    } else if (this.dartType == EDartsType.interstitial) {
                        // this.spt_img.node.setContentSize(705, 450);
                        this.btn_close.active = true;
                        this.btn_close.setPosition(this.spt_img.node.width / 2 - this.btn_close.width / 2, this.spt_img.node.height / 2 - this.btn_close.height / 2);
                    }
                }

            })
        }

    }
    public onclick() {
        console.log("点击");
        let nowTime = Date.now();
        if (nowTime - this.clickTime <= 500) {
            console.log("防止连续点击");
            return;
        }
        console.log("展示");
        this.clickTime = nowTime;
        let dartAd = this.adData;

        if (dartAd.is_h5) {
            TyqViewMgr.showLandPage(dartAd, this.config);
        } else {
            // 

            tyqSDK.onClickDart(dartAd, this.config);
        }
    }
    public onClickClose() {
        this.node.destroy();
    }

}
