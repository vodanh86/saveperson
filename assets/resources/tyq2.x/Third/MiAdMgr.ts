import TyqEventMgr from "../tyq-event-mgr";
import MiFeedAd from "../view/MiFeedAd";


export default class MiAdMgr {
    public launchTime = 0;
    private androidClass = "org/cocos2dx/javascript/mi/MiAdMgr";
    private static _instance: MiAdMgr = null;
    public static getInstance() {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    public static get ins() {
        return this.getInstance();
    }
    public startGame() {
        this.launchTime = Date.now();
    }
    public getLaunchTime() {
        return (Date.now() - this.launchTime) / 1000;
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
    //自渲染广告点击回调
    private feedClickCb: Function = null;

    public showBanner(node: cc.Node) {
        this._showBannerNode = node;
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "showBanner", "()V");
        } else {
            console.error("please run on android");
        }

    }
    public destroyBanner() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "destroyBanner", "()V");
            this._showBannerNode = null;
        } else {
            console.error("please run on android");
        }
    }
    // public loadInterstitial() {
    //     if (cc.sys.os == cc.sys.OS_ANDROID) {
    //         jsb.reflection.callStaticMethod(this.androidClass, "loadInterstitial", "()V");
    //     } else {
    //         console.error("please run on android");
    //     }
    // }
    public showInterstitial() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "showInterstitial", "()V");
        } else {
            console.error("please run on android");
        }
    }
    public destroyInterstitial() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "destroyInterstitial", "()V");
        } else {
            console.error("please run on android");
        }
    }

    // public loadReward() {
    //     if (cc.sys.os == cc.sys.OS_ANDROID) {
    //         jsb.reflection.callStaticMethod(this.androidClass, "loadReward", "()V");
    //     } else {
    //         console.error("please run on android");
    //     }
    // }
    public showReward(des, cb: Function, cancel?: Function, fail?: Function) {
        // tyqSDK.collectClickEvent("广告" + des);
        this.rewardSuccess = cb;
        this.rewardCancel = cancel;
        this.rewardFailCb = fail;
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            // tyqSDK.collectAdAction(1);
            jsb.reflection.callStaticMethod(this.androidClass, "showReward", "()V");
        } else {
            console.error("please run on android");
        }
    }
    private onRewardShow() {
        // tyqSDK.collectAdAction(2);
        TyqEventMgr.getInstance().onAdShow();
    }
    private onRewardResult(isSuccess: boolean) {
        //这里必须要延迟一帧执行
        setTimeout(() => {
            if (isSuccess) {
                // tyqSDK.collectAdAction(3);
                TyqEventMgr.getInstance().onAdSuccess();
                if (this.rewardSuccess) {
                    this.rewardSuccess();
                    this.rewardSuccess = null;
                }
            } else {
                // tyqSDK.collectAdAction(4);
                TyqEventMgr.getInstance().onAdCancel();
                if (this.rewardCancel) {
                    this.rewardCancel();
                    this.rewardCancel = null;
                }
            }
        }, 0);
    }
    private onRewardLoadFail() {
        console.log("视频加载或播放失败:");
        // tyqSDK.collectClickEvent("视频加载或播放失败");
        TyqEventMgr.ins.sendEvent("视频加载或播放失败");
        if (this.rewardFailCb) {
            this.rewardFailCb();
            this.rewardFailCb = null;
        }
    }
    // public loadNativeAd() {
    //     if (cc.sys.os == cc.sys.OS_ANDROID) {
    //         jsb.reflection.callStaticMethod(this.androidClass, "loadNativeAd", "()V");
    //     } else {
    //         console.error("please run on android");
    //     }
    // }
    public showNativeAd() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "showNativeAd", "()V");
        } else {
            console.error("please run on android");
        }
    }

    private onBannerLoad() {
        if (this._showBannerNode && this._showBannerNode.active == true) {
            this.showBanner(this._showBannerNode);
        }
    }
    public setBannerCloseCb(fun: Function) {
        this._bannerCloseCb = fun;
    }
    private onBannerClose() {
        console.log("关闭banner");
        if (this._bannerCloseCb) {
            this._bannerCloseCb();
            this._bannerCloseCb = null;
        }
        this._showBannerNode = null;
    }
    public showFeedAd() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "showFeedAd", "()V");
        } else {
            console.error("please run on android");
        }
    }
    public setFeedClickArea(left: number, top: number, w: number, h: number) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "setFeedClickArea", "(IIII)V", left, top, w, h);
        } else {
            console.error("please run on android");
        }
    }
    public setFeedClickCb(cb: Function) {
        this.feedClickCb = cb;
    }
    private destroyFeed() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "destroyFeedAd", "()V");
        } else {
            console.error("please run on android");
        }
    }
    public onCloseFeed() {
        this.destroyFeed();
        this.setFeedClickArea(0, 0, 0, 0);
        this.feedClickCb = null;
    }
    private onFeedLoad(str: string) {

        cc.resources.load("tyqRes/prefab/MiFeedAd", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let node = cc.instantiate(prefab);

            cc.find("Canvas").addChild(node, cc.macro.MAX_ZINDEX);
            node.getComponent(MiFeedAd).init(str);
        })
    }
    private onFeedClick() {
        if (this.feedClickCb) {
            this.feedClickCb();
            this.feedClickCb = null;
        }
    }
}


window["MiAdMgr"] = MiAdMgr;