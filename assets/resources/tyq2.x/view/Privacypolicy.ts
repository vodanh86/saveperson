import TyqEventMgr from "../tyq-event-mgr";
import { tyqSDK } from "../tyq-sdk";

const { ccclass, property } = cc._decorator;
export interface IUrlConfig {
    useAgreeUrl: string,
    privacypolicyUrl: string,
}
@ccclass
export default class Privacypolicy extends cc.Component {
    private _useAgreeUrl = "http://www.xmtyq.com/pages/gamenotice_chn.html?gamename=%E6%9C%80%E5%BC%B7%E5%B0%8F%E8%8B%B1%E9%9B%84";
    private _privacypolicyUrl = "http://www.xmtyq.com/pages/gamenotice_chn.html?gamename=%E6%9C%80%E5%BC%B7%E5%B0%8F%E8%8B%B1%E9%9B%84";
    @property(cc.Node) btn_agree: cc.Node = null;
    @property(cc.Node) btn_exit: cc.Node = null;
    @property(cc.Node) btn_close: cc.Node = null;
    @property(cc.WebView) webView: cc.WebView = null;

    @property(cc.Node) labelContent: cc.Node = null;
    private _callBack: Function = null;
    private _privacy = "tyq_littleHero_privacypolicy";
    protected onLoad(): void {
        this.node.setContentSize(cc.winSize);
        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }
        this.hideWebView();
    }
    public init(cb: Function = void 0, config: IUrlConfig) {
        this._callBack = cb;
        this._useAgreeUrl = config.useAgreeUrl;
        this._privacypolicyUrl = config.privacypolicyUrl;
    }
    protected start(): void {
        let isShowPrivacy = tyqSDK.getSwitchValue("isHidePrivacy");
        if (isShowPrivacy || cc.sys.localStorage.getItem(this._privacy)) {
            this.node.active = false;
            this.node.destroy();
        }

    }
    public onClickAgree() {
        this.node.destroy();
    }
    public onClickClose() {
        this.hideWebView();
    }
    public onClickExit() {
        cc.game.end();
    }

    public onClickUseAgree() {
        this.showWebView(this._useAgreeUrl);

    }
    protected onDestroy(): void {
        cc.sys.localStorage.setItem(this._privacy, "true");
        if (this._callBack) {
            this._callBack();
            this._callBack = null;
        }
        TyqEventMgr.ins.onAgreeUseAgree();
    }
    public onClickPrivacypolicy() {
        this.showWebView(this._privacypolicyUrl);
    }
    public showWebView(url) {
        this.webView.url = url;
        this.webView.node.active = true;
        this.labelContent.active = false;
    }
    public hideWebView() {
        this.webView.node.active = false;
        this.labelContent.active = true;
    }
}