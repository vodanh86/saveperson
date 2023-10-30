// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import MiAdMgr from "../Third/MiAdMgr";
import { tyqSDK } from "../tyq-sdk";



const { ccclass, property } = cc._decorator;

@ccclass
export default class MiFeedAd extends cc.Component {
    @property(cc.Sprite) spt_img: cc.Sprite = null;
    @property(cc.Label) label_title: cc.Label = null;
    @property(cc.Label) label_des: cc.Label = null;
    @property(cc.Label) label_tag: cc.Label = null;
    @property(cc.Label) label_btnText: cc.Label = null;
    @property(cc.Node) clickArea: cc.Node = null;
    @property(cc.Node) maskNode: cc.Node = null;
    public onLoad() {
        // this.init();
    }
    public init(opt: any = {}) {
        console.log(opt);
        if (opt["title"]) {
            this.label_title.string = opt["title"];
        }

        if (opt["des"]) {
            this.label_des.string = opt["des"];
        }
        if (opt["imgUrl"]) {
            this.loadRemoteImg(opt["imgUrl"], this.spt_img);
        }

        if (opt["tag"]) {
            this.label_tag.string = opt["tag"];
        }

        if (opt["btnText"]) {
            this.label_btnText.string = opt["btnText"];
        }

        if (opt["icon"]) {
            console.log(opt["icon"]);
        }
        if (opt["logo"]) {
            console.log(opt["logo"]);
        }
        let size = this.transPhoneSize(this.clickArea);
        //
        if (tyqSDK.getSwitchValue("tyq_isFeedLargeScale")) {
            size = this.transPhoneSize(this.maskNode);
        }

        MiAdMgr.getInstance().setFeedClickArea(size.left, size.top, size.width, size.height);
        MiAdMgr.getInstance().setFeedClickCb(() => {
            this.onClickClose();
        })
    }
    //将cocos size转换为手机size
    public transPhoneSize(node: cc.Node): { left: number, top: number, width: number, height: number } {
        let winSize = cc.winSize;
        let frameSize = cc.view.getFrameSize();
        let sw = frameSize.width / winSize.width;
        let sh = frameSize.height / winSize.height;

        let w = node.width;
        let h = node.height;

        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));

        let l = worldPos.x - w / 2;

        let t = winSize.height - worldPos.y - h / 2;
        return { left: l * sw, top: t * sh, width: w * sw, height: h * sh };
    }
    protected onClickClose() {
        MiAdMgr.ins.onCloseFeed();
        this.node.destroy();
    }

    private loadRemoteImg(url: string, spt: cc.Sprite) {
        cc.assetManager.loadRemote(url, (err, texture: cc.Texture2D) => {
            if (err) {
                console.error(err);
                return;
            }
            let sptFrame = new cc.SpriteFrame(texture);
            spt.spriteFrame = sptFrame;
        })
    }

}
