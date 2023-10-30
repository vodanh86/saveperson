
export default class IronSourceMgr {
    private androidClass = "org/cocos2dx/javascript/ironSource/IronSourceMgr";
    private static _instance: IronSourceMgr = null;
    public static getInstance(): IronSourceMgr {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    public static get ins() {
        return this.getInstance();
    }

    //将要展现banner的节点
    private _showBannerNode: cc.Node = null;
    //banner关闭回调
    private _bannerCloseCb: Function = null;

    //激励广告成功回调
    private rewardSuccess: Function = null;
    //激励广告取消回调
    private rewardCancel: Function = null;
    //激励广告加载播放失败回调
    private rewardFailCb: Function = null;

    public showBanner(node: cc.Node) {
        this._showBannerNode = node;
        if (this.isAndroid()) {
            jsb.reflection.callStaticMethod(this.androidClass, "showBanner", "()V");
        } else if (this.isIos()) {

        }
    }
    public destroyBanner() {
        if (this.isAndroid()) {
            jsb.reflection.callStaticMethod(this.androidClass, "destroyBanner", "()V");
            this._showBannerNode = null;
        } else if (this.isIos()) {

        }
    }
    private onBannerClose() {
        console.log("关闭banner");
        if (this._bannerCloseCb) {
            this._bannerCloseCb();
            this._bannerCloseCb = null;
        }
        this._showBannerNode = null;
    }
    private onBannerLoad() {
        if (this._showBannerNode && this._showBannerNode.active == true) {
            this.showBanner(this._showBannerNode);
        }
    }
    public showIntertitial() {
        if (this.isAndroid()) {
            jsb.reflection.callStaticMethod(this.androidClass, "showInterstitial", "()V");
        } else if (this.isIos()) {

        }
    }
    public showReward(des, cb: Function, cancel?: Function, fail?: Function) {
        this.rewardSuccess = cb;
        this.rewardCancel = cancel;
        this.rewardFailCb = fail;
        if (this.isAndroid()) {
            jsb.reflection.callStaticMethod(this.androidClass, "showReward", "()V");
        } else if (this.isIos()) {

        }
    }

    private onRewardShow() {
        // TyqEventMgr.getInstance().onAdShow();
    }
    private onRewardResult(isSuccess: boolean) {
        //这里必须要延迟一帧执行
        setTimeout(() => {
            if (isSuccess) {
                // TyqEventMgr.getInstance().onAdSuccess();
                if (this.rewardSuccess) {
                    this.rewardSuccess();
                    this.rewardSuccess = null;
                }
            } else {
                // TyqEventMgr.getInstance().onAdCancel();
                if (this.rewardCancel) {
                    this.rewardCancel();
                    this.rewardCancel = null;
                }
            }
        }, 0);
    }
    private onRewardLoadFail() {
        console.log("视频加载或播放失败:");
        if (this.rewardFailCb) {
            this.rewardFailCb();
            this.rewardFailCb = null;
        }
    }

    private isAndroid() {
        return CC_JSB && cc.sys.os == cc.sys.OS_ANDROID;
    }
    private isIos() {
        return CC_JSB && cc.sys.os == cc.sys.OS_IOS;
    }
}

window['IronSourceMgr'] = IronSourceMgr;