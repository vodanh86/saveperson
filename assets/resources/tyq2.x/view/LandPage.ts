// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EDartStatus, tyqSDK } from "../tyq-sdk";

const { ccclass, property } = cc._decorator;
var scheme = "tyq";
@ccclass
export default class LandPage extends cc.Component {
    @property(cc.WebView) webView: cc.WebView = null;
    private adData: any = {};
    private config: any = null;
    private closeCb = null;
    start() {
        console.log("发送展示")
        tyqSDK.sendDartAdStatus(this.adData.ads_id, EDartStatus.visit);
        this.webView.url = this.adData.h5_url;
        console.log(this.adData);

    }
    protected onLoad(): void {
        this.node.setContentSize(cc.winSize);
        this.webView.node.setContentSize(cc.winSize);
        this.webView.setJavascriptInterfaceScheme(scheme);
        this.webView.setOnJSCallback(this.onJsCb.bind(this));


    }
    //网页信息回调
    private onJsCb(target, url) {
        var str = url.replace(scheme + '://', '');
        let obj = this.parseStrToObj(str);
        switch (obj.action) {
            case "download":
                tyqSDK.onClickDart(this.adData, this.config);
                break;
            case "close":
                this.onClose();
                break;
            case "scheme":
                cc.sys.openURL(decodeURIComponent(obj.url));
                break;
        }

    }
    public initData(data, config, cb?) {
        if (data) {
            this.adData = data;
            this.config = config;
        }
        if (cb) {
            this.closeCb = cb;
        }
    }
    public onClickClose() {
        this.onClose();
    }
    public parseStrToObj(str: string) {
        let obj: any = {};
        let array = str.split('&');
        for (let kv of array) {
            let kvList = kv.split("=");
            if (kvList.length == 2) {
                let key = kvList[0];
                let value = kvList[1];
                obj[key] = value;
            }
        }
        return obj;
    }
    private webViewEvent(webView: cc.WebView, event: cc.WebView.EventType, customEventData: string) {
        if (event == cc.WebView.EventType.LOADED) {
            console.log("LOADEDLOADEDLOADEDLOADEDLOADEDLOADEDLOADEDLOADEDLOADEDLOADED")
        }
    }
    private onClose() {
        if (this.closeCb && typeof this.closeCb == "function") {
            this.closeCb();
            this.closeCb = null;
        }
        this.node.destroy()
    }
    // update (dt) {}
}
