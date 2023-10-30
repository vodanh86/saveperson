
// import GameMgr from "../Game/Logic/GameMgr";
import FaceBookMgr from "./Third/FaceBookMgr";
import MiSdk from "./Third/MiSdk";
import UMeng from "./Third/UMeng";
import { tyqSDK } from "./tyq-sdk";
import tyqSdkConfig from "./tyq-sdk-config";

//事件打点管理
export default class TyqEventMgr {
    public static tyqEventMgr: TyqEventMgr = null;
    public static getInstance(): TyqEventMgr {
        if (this.tyqEventMgr == null) {
            this.tyqEventMgr = new this();
        }
        return this.tyqEventMgr;
    }
    public static get ins() {
        return this.getInstance();
    }
    //注册事件
    public onRegister(id: string) {
        console.log("event:注册");
        if (tyqSdkConfig.useUmeng) {
            UMeng.getInstance().register(id);
        }
    }
    //登陆事件
    public onLogin(id: string) {
        console.log("event:登录");
        if (tyqSdkConfig.useUmeng) {
            UMeng.getInstance().login(id);
        }
    }
    //当用户同意用户协议事件
    public onAgreeUseAgree() {
        console.log("event:同意用户协议");
        if (tyqSdkConfig.isXiaomi) {
            MiSdk.getInstance().onUserAgreed();
        }
        if (tyqSdkConfig.useUmeng) {
            UMeng.getInstance().onAgreeUse();
        }



    }
    //当广告加载成功
    public onAdLoad() {
        tyqSDK.collectAdAction(1);
    }
    //当广告显示成功
    public onAdShow() {
        tyqSDK.collectAdAction(2);
    }
    //当用户完整看完广告
    public onAdSuccess() {
        tyqSDK.collectAdAction(3);
    }
    //当用户取消观看广告
    public onAdCancel() {
        tyqSDK.collectAdAction(4);
    }

    //发送普通打点事件
    public sendEvent(eventType: string, eventName?: string) {
        // if (GameMgr.lUserData && GameMgr.lUserData.isDoneGuide()) {
        let name = eventName ? eventType + "-" + eventName : eventType;
        this.sendEventPoint(name);
        // }
    }
    //发送引导事件
    public sendGuidStep(step) {
        this.sendEventPoint("引导-" + step);
    }

    private sendEventPoint(eventName) {
        tyqSDK.collectClickEvent(eventName);
        console.log("%cevent:" + eventName, "color:#FF7500");
        if (tyqSdkConfig.useFbEvent) {
            FaceBookMgr.sendCustomEvent(eventName);
        }
        if (tyqSdkConfig.useUmeng) {
            UMeng.getInstance().uploadEvent(eventName);
        }

    }
    //开始游戏
    public onStartGame(level: number) {

        console.log("event:gamestart:", level);
    }
    //结束广告
    public onEndGame(isWin) {

        console.log("event:gameEnd:", isWin);
    }
}