
import { EDartStatus, EDartsType, tyqSDK } from "./tyq-sdk";
import CrazyBox, { crazyType } from "./view/CrazyBox";
import DartAd from "./view/DartAd";
import LandPage from "./view/LandPage";
import Privacypolicy, { IUrlConfig } from "./view/Privacypolicy";
import VerifyRealName from "./view/VerifyRealName";

export default class TyqViewMgr {
    private static prefabPath: string = "tyqRes/prefab/";
    /**
     * 显示狂点盒子
     * @param type 
     * @param cb 
     */
    public static showCrazyBox(type: crazyType, cb: (isSuccess) => void) {
        cc.resources.load(this.prefabPath + "CrazyBox", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let node = cc.instantiate(prefab);
            cc.find("Canvas").addChild(node, cc.macro.MAX_ZINDEX);
            node.getComponent(CrazyBox).init(cb, type);
        });
    }
    /**
     * 显示实名认证界面
     * @param parent 
     * @param next 
     */
    public static showVerifyRealName(parent: cc.Node, next: () => void) {
        cc.resources.load(this.prefabPath + "VerifyRealName", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let node = cc.instantiate(prefab);
            parent.addChild(node);
            node.getComponent(VerifyRealName).init(next);
        });
    }
    /**
     * 显示隐私政策界面
     * @param parent 
     * @param next 
     */
    public static showVerifyPrivacypolicy(parent: cc.Node, config: IUrlConfig, next: () => void) {
        cc.resources.load(this.prefabPath + "Privacypolicy", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let node = cc.instantiate(prefab);
            parent.addChild(node);
            node.getComponent(Privacypolicy).init(next, config);
        });
    }

    //显示落地页
    public static showLandPage(data, config, cb?) {
        cc.resources.load(this.prefabPath + "LandPage", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let node = cc.instantiate(prefab);
            node.getComponent(LandPage).initData(data, config, cb);
            cc.find("Canvas").addChild(node, cc.macro.MAX_ZINDEX);
        });
    }
    //显示飞镖广告详情页
    public static showDartAd(type: EDartsType, parent: cc.Node, config, pos: cc.Vec2 = cc.v2()) {
        let dartData = tyqSDK.getDartAdByType(type);
        if (dartData) {
            cc.resources.load(this.prefabPath + "DartAd", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
                if (err) {
                    console.error(err);
                    return;
                }

                let node = cc.instantiate(prefab);
                node.getComponent(DartAd).initData(dartData, type, config);
                if (pos) {
                    node.setPosition(pos);
                }
                parent.addChild(node);
                tyqSDK.sendDartAdStatus(dartData.ads_id, EDartStatus.exposure);
            });
        } else {
            console.error("没有dartAd数据");
        }

    }
}