
// import global, { Channel } from './config/global';
// var ATJSSDK = null;
// /**激励视频SDK脚本 */
// var ATRewardedVideoJSSDK = null;
// /**插屏广告脚本 */
// var ATInterstitialJSSDK = null;
// /**banner广告脚本 */
// var ATBannerJSSDK = null;
// /**原生广告 */
// var ATNativeJSSDK = null;


import TyqEventMgr from "../../tyq-event-mgr";



/**原生广告类型 */
enum NativeType {
    none,
    NativeInfomation,
    NativeBanner,
    NativeCentre
}
interface IAdId {
    [index: string]: string,
    readonly banner,
    readonly interstitial,
    readonly reward,
    readonly fullInters?,
    readonly nativeInfo,
    readonly nativeBanner,

}
class TopOnMgr {
    public static _instance: TopOnMgr = null;
    private androidID: string = "a61a880438ce37";
    private appKey: string = "e30dc605c38d53f383dc240362db6456";
    private IOSID: string = "a61b01ea8857e0";
    private AndroidAd: IAdId = {
        banner: "b61a881349edaa",
        interstitial: "b61a8811fe1214",
        reward: "b61a880f68c7d7",
        fullInters: "b619d9a15e5cf3",
        nativeInfo: "b61a8814a1c5f2",
        nativeBanner: "b61a881666e2d7",
    }
    private IosAd: IAdId = {
        banner: "b61b02050137e4",
        interstitial: "b61b02084d5e1e",
        reward: "b61b020023f2a4",
        fullInters: "",
        nativeInfo: "b61b020263082a",
        nativeBanner: "",

    }

    /**激励视频加载完成回调 */
    private rewardeVideoLoadCallBack = null;
    /**插屏加载完成回调 */
    private interstitialLoadCallBack = null;
    /**插屏广告关闭回调 */
    private interstitialCloseCallBack = null;
    /**banner加载完成回调 */
    private bannerLoadCallBack = null;
    /**原生加载完成回调 */
    private nativeLoadCallBack = null;
    /**广告播放失败回调 */
    private rewardeFailCallBack = null;
    /**广告播放成功回调 */
    private rewardeSuccess = null;
    /**原生显示成功回调 */
    private nativeSuccessCallBack = null;
    /**原生显示失败回调 */
    private nativeFailCallBack = null;
    /**普通banner展示成功回调 */
    private bannerSuccessCallBack = null;
    /**普通banner展示失败回调 */
    private bannerFailCallBack = null;

    /**当前原生广告的类型 */
    private curNativeType: NativeType = NativeType.none;

    private bannerIsShow: boolean = false;

    /**topOn 玩家关闭后重新拉取的时间*/
    private topOnCloseRefresTime: number = 5;
    /**topon 计时器 */
    private topOnInterval: any = null;
    /**topOn banner关闭的方法 */
    private topOnCloseFun: Function = null;
    /**是否是topon的自定义banner */
    private isTopOnBanner: boolean = true;
    /**topOn 横幅重新刷新时间*/
    private topOnRefreshTime: number = 30;
    //native计时器
    private nativeSuccessTimer: number = 0;

    /**获取激励视频的广告ID */
    private rewardVideoID() {

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.reward;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.reward;
        }
    }

    /**获取插屏广告ID */
    private InterstitialID() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.interstitial;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.interstitial;
        }
    }
    /**获取banner广告ID */
    private bannerID() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.banner;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.banner;
        }
    }

    /**
     * 原生信息流广告ID
     */
    private nativeinfomationID() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.nativeInfo;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.nativeInfo;
        }
    }

    /**原生横幅广告 */
    private nativeBannerID() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.nativeBanner;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.nativeBanner;
        }
    }
    /**获取全屏插屏视频ID */
    private FullInterstitial() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return this.AndroidAd.fullInters;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            return this.IosAd.fullInters;
        }
    }
    public static getInstance() {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    constructor() {
    }
    init() {
        // ATJSSDK = window.ATJSSDK;
        // ATRewardedVideoJSSDK = window.ATRewardedVideoJSSDK;
        // ATInterstitialJSSDK = window.ATInterstitialJSSDK;
        // ATBannerJSSDK = window.ATBannerJSSDK;
        // ATNativeJSSDK = window.ATNativeJSSDK;
        ATJSSDK.setLogDebug(false);
        if (cc.sys.os == cc.sys.OS_IOS) {
            ATJSSDK.initSDK(this.IOSID, this.appKey);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            ATJSSDK.initSDK(this.androidID, this.appKey);
        }
        this.setRewardVideAdListener();
        this.setInterstitialListener();
        this.setBannerListener();
        this.setNativeListener();

        this.preloadRewardVideoAd();
        this.preloadFullInters();
        this.preloadIntersitial();
        this.preloadBanner();
    }

    /**设置激励视频的监听 */
    private setRewardVideAdListener() {
        var that = this;
        let isSuccess = false;
        var rewardedVideoListener = {
            //广告加载成功
            onRewardedVideoAdLoaded(placementId) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdLoaded(" + placementId + ")");
                console.log(that.rewardeVideoLoadCallBack);
                if (that.rewardeVideoLoadCallBack) {
                    that.rewardeVideoLoadCallBack();
                }
                TyqEventMgr.ins.onAdLoad();
            },
            //广告加载失败
            onRewardedVideoAdFailed(placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdFailed(" + placementId + ", " + errorInfo + ")");
                if (that.rewardeFailCallBack) {
                    that.rewardeFailCallBack();
                }
                console.log("广告加载失败");

            },
            //广告开始播放
            onRewardedVideoAdPlayStart(placementId, callbackInfo) {
                TyqEventMgr.ins.onAdShow();
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdPlayStart(" + placementId + ", " + callbackInfo + ")");
            },
            //广告播放结束
            onRewardedVideoAdPlayEnd(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdPlayEnd(" + placementId + ", " + callbackInfo + ")");

            },
            //广告播放失败
            onRewardedVideoAdPlayFailed(placementId, errorInfo, callbackInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdPlayFailed(" + placementId + ", " + errorInfo + ", " + callbackInfo + ")");
                if (that.rewardeFailCallBack) {
                    that.rewardeFailCallBack();
                }
                console.log("广告播放失败");
            },
            //广告被关闭
            onRewardedVideoAdClosed(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdClosed(" + placementId + ", " + callbackInfo + ")");
                setTimeout(() => {
                    if (isSuccess) {
                        TyqEventMgr.ins.onAdSuccess();
                        if (that.rewardeSuccess) {
                            that.rewardeSuccess();
                            that.rewardeSuccess = null;
                        }
                    } else {
                        TyqEventMgr.ins.onAdCancel();
                        if (that.rewardeFailCallBack) {
                            that.rewardeFailCallBack();
                        }
                    }

                    console.log("广告被关闭", isSuccess);
                    that.preloadRewardVideoAd();
                }, 0);

            },
            //广告被点击
            onRewardedVideoAdPlayClicked(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onRewardedVideoAdPlayClicked(" + placementId + ", " + callbackInfo + ")");
            },
            //激励成功，开发者可在此回调中下发奖励，一般先于onRewardedVideoAdClosed回调，服务器激励则不一定
            onReward(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkRewardedVideoDemo::onReward(" + placementId + ", " + callbackInfo + ")");

                isSuccess = true;
                console.log("广告播放成功");
            }
        }
        ATRewardedVideoJSSDK.setAdListener(rewardedVideoListener);
    }

    /**设置插屏广告监听 */
    private setInterstitialListener() {
        var that = this;
        var interstitialListener = {
            //广告加载成功
            onInterstitialAdLoaded(placementId) {
                ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdLoaded(" + placementId + ")");
                if (that.interstitialLoadCallBack) {
                    that.interstitialLoadCallBack();
                    that.interstitialLoadCallBack = null;
                }
                console.log("插屏加载成功");

            },
            //广告加载失败
            onInterstitialAdLoadFail(placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdLoadFail(" + placementId + ", " + errorInfo + ")");
                if (that.interstitialCloseCallBack) {
                    that.interstitialCloseCallBack();
                    that.interstitialCloseCallBack = null;
                }
                console.log("插屏加载失败");
            },
            //广告展示成功
            // onInterstitialAdShow(placementId, callbackInfo) {
            //     ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdShow(" + placementId + ", " + callbackInfo + ")");
            // },
            //广告视频开始播放，部分平台有此回调
            // onInterstitialAdStartPlayingVideo(placementId, callbackInfo) {
            //     ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdStartPlayingVideo(" + placementId + ", " + callbackInfo + ")");
            // },
            //广告视频播放结束，部分广告平台有此回调
            // onInterstitialAdEndPlayingVideo(placementId, callbackInfo) {
            //     ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdEndPlayingVideo(" + placementId + ", " + callbackInfo + ")");
            // },
            //广告视频播放失败，部分广告平台有此回调
            onInterstitialAdFailedToPlayVideo(placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdFailedToPlayVideo(" + placementId + ", " + errorInfo + ")");
                console.log("插屏播放失败");

            },
            //广告展示失败
            onInterstitialAdFailedToShow(placementId) {
                // ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdFailedToShow(" + placementId + ")");
                if (that.interstitialCloseCallBack) {
                    that.interstitialCloseCallBack();
                    that.interstitialCloseCallBack = null;
                }
                console.log("插屏展示失败");

            },
            //广告被关闭
            onInterstitialAdClose(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdClose(" + placementId + ", " + callbackInfo + ")");
                if (that.interstitialCloseCallBack) {
                    that.interstitialCloseCallBack();
                    that.interstitialCloseCallBack = null;
                }
                console.log("插屏被关闭");
            },
            //广告被点击
            // onInterstitialAdClick(placementId, callbackInfo) {
            //     ATJSSDK.printLog("AnyThinkInterstitialDemo::onInterstitialAdClick(" + placementId + ", " + callbackInfo + ")");
            // }
        };
        console.log("插屏ATInterstitialJSSDK");
        ATInterstitialJSSDK.setAdListener(interstitialListener);
    }

    /**设置banner广告监听 */
    private setBannerListener() {
        var that = this;
        var bannerListener = {
            //广告加载成功
            onBannerAdLoaded(placementId) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdLoaded(" + placementId + ")");
                if (that.bannerLoadCallBack) {
                    that.bannerLoadCallBack();
                }
                console.log("banner加载成功");
            },
            //广告关闭按钮被点击
            onBannerAdCloseButtonTapped() {
                that.preloadBanner();
            },
            //广告加载失败
            onBannerAdLoadFail: function (placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdLoadFail(" + placementId + ", " + errorInfo + ")");
                if (that.bannerFailCallBack) {
                    that.bannerFailCallBack();
                    that.bannerFailCallBack = null;
                }
                console.log("1111111111111111111");
                console.log("banner加载失败");
            },
            //广告展示成功
            onBannerAdShow: function (placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdShow(" + placementId + ", " + callbackInfo + ")");
                if (that.bannerSuccessCallBack) {
                    that.bannerSuccessCallBack();
                    that.bannerSuccessCallBack = null;
                }
                that.bannerIsShow = true;
                console.log("banner展示成功");
            },
            //广告被点击
            onBannerAdClick: function (placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdClick(" + placementId + ", " + callbackInfo + ")");
            },
            //广告自动刷新成功
            onBannerAdAutoRefresh: function (placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdAutoRefresh(" + placementId + ", " + callbackInfo + ")");
            },
            //广告自动刷新失败
            onBannerAdAutoRefreshFail: function (placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkBannerDemo::onBannerAdAutoRefreshFail(" + placementId + ", " + errorInfo + ")");
            },
        }
        ATBannerJSSDK.setAdListener(bannerListener);
    }

    /**设置原生广告监听 */
    private setNativeListener() {
        var that = this;
        var nativeAdListner = {
            //广告加载成功
            onNativeAdLoaded(placementId) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdLoaded(" + placementId + ")");
                if (that.nativeLoadCallBack) {
                    that.nativeLoadCallBack();
                }
            },
            //广告关闭按钮被点击，部分广告平台有此回调
            onNativeAdCloseButtonTapped(placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdCloseButtonTapped(" + placementId + ", " + callbackInfo + ")");
                clearTimeout(that.nativeSuccessTimer);
                that.removeNativeAD();
            },
            //广告加载失败
            onNativeAdLoadFail: function (placementId, errorInfo) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdLoadFail(" + placementId + ", " + errorInfo + ")");
                this.curNativeType = NativeType.none;
                if (that.nativeFailCallBack) {
                    that.nativeFailCallBack();
                    that.nativeFailCallBack = null;
                }
            },
            //广告展示成功
            onNativeAdShow: function (placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdShow(" + placementId + ", " + callbackInfo + ")");
                if (that.nativeSuccessCallBack) {
                    that.nativeSuccessCallBack();
                    that.nativeSuccessCallBack = null;
                }
                //5秒后关闭原生广告
                clearTimeout(that.nativeSuccessTimer);
                that.nativeSuccessTimer = setTimeout(() => {
                    that.removeNativeAD();
                }, 5000);
            },
            //广告被点击
            onNativeAdClick: function (placementId, callbackInfo) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdClick(" + placementId + ", " + callbackInfo + ")");
            },
            //广告视频开始播放，部分广告平台有此回调
            onNativeAdVideoStart: function (placementId) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdVideoStart(" + placementId + ")");
            },
            //广告视频结束播放，部分广告平台有此回调
            onNativeAdVideoEnd: function (placementId) {
                ATJSSDK.printLog("AnyThinkNativeDemo::onNativeAdVideoEnd(" + placementId + ")");
            },
        }
        ATNativeJSSDK.setAdListener(nativeAdListner);

    }

    /**展示激励视频 */
    showRewardVideoAd(des: string, success: Function, fail?: Function) {
        var setting = {};
        this.rewardeSuccess = success;
        if (fail) {
            this.rewardeFailCallBack = fail;
        } else {
            this.rewardeFailCallBack = null;
        }

        this.rewardeVideoLoadCallBack = (() => {
            ATRewardedVideoJSSDK.showAd(this.rewardVideoID());//显示视频
        })
        ATRewardedVideoJSSDK.loadRewardedVideo(this.rewardVideoID(), setting);//加载视频
    }
    private preloadRewardVideoAd() {
        var setting = {};
        this.rewardeVideoLoadCallBack = null;
        ATRewardedVideoJSSDK.loadRewardedVideo(this.rewardVideoID(), setting);//加载视频
    }
    private preloadFullInters() {
        this.interstitialLoadCallBack = null;
        var setting = {};
        setting[ATInterstitialJSSDK.UseRewardedVideoAsInterstitial] = true;
        ATInterstitialJSSDK.loadInterstitial(this.FullInterstitial(), setting);
    }
    private preloadIntersitial() {
        this.interstitialLoadCallBack = null;
        var setting = {};
        setting[ATInterstitialJSSDK.UseRewardedVideoAsInterstitial] = true;
        ATInterstitialJSSDK.loadInterstitial(this.InterstitialID(), setting);
    }
    /**显示插屏广告
     * @param closeFun 广告被关闭回调
     */
    showInterstitialAd(closeFun?: Function) {
        // if (closeFun) {
        //     this.interstitialCloseCallBack = closeFun;
        // } else {
        //     this.interstitialCloseCallBack = null;
        // }
        let close = () => {
            this.preloadIntersitial();
            if (closeFun) {
                closeFun();
            }
        }
        this.interstitialCloseCallBack = close;
        this.interstitialLoadCallBack = (() => {
            ATInterstitialJSSDK.showAd(this.InterstitialID());
        })
        var setting = {};
        setting[ATInterstitialJSSDK.UseRewardedVideoAsInterstitial] = true;
        ATInterstitialJSSDK.loadInterstitial(this.InterstitialID(), setting);
        console.log("插屏广告代码");
    }
    /**
     * 显示banner
     * @param pos 位置 传 top 或者Bottom
     */
    showBannerAd(node, pos?: string, succes?: Function, fail?: Function) {
        this.bannerSuccessCallBack = null;
        this.bannerFailCallBack = null;
        if (succes) {
            this.bannerSuccessCallBack = succes;
        }
        if (fail) {
            this.bannerFailCallBack = fail;
        }
        var setting = {};
        this.bannerLoadCallBack = (() => {
            if (!node || !cc.isValid(node) || node.active == false) {
                return;
            }
            if (pos == "top") {
                ATBannerJSSDK.showAdInPosition(this.bannerID(), ATBannerJSSDK.kATBannerAdShowingPositionTop);
            } else {
                ATBannerJSSDK.showAdInPosition(this.bannerID(), ATBannerJSSDK.kATBannerAdShowingPositionBottom);
            }
        })
        // setting[ATBannerJSSDK.kATBannerAdLoadingExtraBannerAdSizeStruct] = ATBannerJSSDK.createLoadAdSize(view.getFrameSize().width, view.getFrameSize().height / 7);原始
        setting[ATBannerJSSDK.kATBannerAdLoadingExtraBannerAdSizeStruct] = ATBannerJSSDK.createLoadAdSize(cc.view.getFrameSize().width / 2, cc.view.getFrameSize().height * 0.2);

        setting[ATBannerJSSDK.kATBannerAdAdaptiveWidth] = cc.view.getFrameSize().width;
        setting[ATBannerJSSDK.kATBannerAdAdaptiveOrientation] = ATBannerJSSDK.kATBannerAdAdaptiveOrientationPortrait;
        ATBannerJSSDK.loadBanner(this.bannerID(), setting);
        console.log("banner代码");
    }
    private preloadBanner() {
        this.bannerLoadCallBack = null;
        var setting = {};
        ATBannerJSSDK.loadBanner(this.bannerID(), setting);
    }
    /**移除bannerAd */
    removeBannerAd() {
        ATBannerJSSDK.removeAd(this.bannerID());
        this.preloadBanner();
    }

    /**展示原生信息流广告(横幅样式) 
     * @param success 广告展示成功回调
     * @param fail 广告展示失败回调
    */
    showNativeInfomation(success?: Function, fail?: Function) {
        if (this.curNativeType != NativeType.none) {
            return;
        }
        this.nativeSuccessCallBack = null;
        this.nativeFailCallBack = null;
        if (success) {
            this.nativeSuccessCallBack = success;
        }
        if (fail) {
            this.nativeFailCallBack = fail;
        }
        this.nativeLoadCallBack = (() => {
            var frameSize = cc.view.getFrameSize();
            var frameWidth = frameSize.width;
            var frameHeight = frameSize.height;
            var padding = frameSize.width / 35;

            var parentWidth = frameWidth;
            // var parentHeight = 100;
            var parentHeight = parentWidth * 0.3;
            // var parentHeight = frameWidth * 4 / 5;
            var appIconSize = frameWidth / 7;


            var nativeAdViewProperty = new ATNativeJSSDK.AdViewProperty();
            nativeAdViewProperty.parent = nativeAdViewProperty.createItemViewProperty(0, frameHeight - parentHeight, parentWidth, parentHeight, "#ffffff", "", 0);

            nativeAdViewProperty.appIcon = nativeAdViewProperty.createItemViewProperty(0, parentHeight - appIconSize, appIconSize, appIconSize, "", "", 0);
            nativeAdViewProperty.cta = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize * 2, parentHeight - appIconSize, appIconSize * 2, appIconSize, "#2095F1", "#ffffff", appIconSize / 3);

            nativeAdViewProperty.mainImage = nativeAdViewProperty.createItemViewProperty(padding, padding, parentWidth - 2 * padding, parentHeight - appIconSize - 2 * padding, "#ffffff", "#ffffff", 14);

            nativeAdViewProperty.title = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "", "#000000", appIconSize / 3);
            nativeAdViewProperty.desc = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize / 2, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "#ffffff", "#000000", appIconSize / 4);
            // nativeAdViewProperty.adLogo = nativeAdViewProperty.createItemViewProperty(0,0,0,0,"#ffffff","#ffffff",14);
            // nativeAdViewProperty.rating = nativeAdViewProperty.createItemViewProperty(0,0,0,0,"#ffffff","#ffffff",14);
            nativeAdViewProperty.dislike = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize / 2, 0, appIconSize / 2, appIconSize / 2, "#00ffffff", "#ffffff", 14);

            ATNativeJSSDK.showAd(this.nativeinfomationID(), nativeAdViewProperty);
        })
        //加载原生广告时需要传入广告展示的宽高
        ATNativeJSSDK.loadNative(this.nativeinfomationID(), ATNativeJSSDK.createLoadAdSize(cc.view.getFrameSize().width, cc.view.getFrameSize().width * 0.3));
        // ATNativeJSSDK.loadNative(this.nativeinfomationID(), ATNativeJSSDK.createLoadAdSize(view.getFrameSize().width, cc.view.getFrameSize().width * 4 / 5));//原始
        this.curNativeType = NativeType.NativeInfomation;
    }

    /**展示原生横幅广告 */
    showNativeBanner() {
        if (this.curNativeType != NativeType.none) {
            return;
        }
        this.nativeLoadCallBack = (() => {
            var frameSize = cc.view.getFrameSize();
            var frameWidth = frameSize.width;
            var frameHeight = frameSize.height;
            var padding = frameSize.width / 35;
            var parentWidth = frameWidth;
            var parentHeight = frameWidth * 0.3;
            var appIconSize = parentHeight;
            var nativeAdViewProperty = new ATNativeJSSDK.AdViewProperty();
            nativeAdViewProperty.parent = nativeAdViewProperty.createItemViewProperty(0, frameHeight - parentHeight, parentWidth, parentHeight, "#ffffff", "", 0);
            nativeAdViewProperty.appIcon = nativeAdViewProperty.createItemViewProperty(0, parentHeight - appIconSize, appIconSize, appIconSize, "", "", 0);
            nativeAdViewProperty.mainImage = nativeAdViewProperty.createItemViewProperty(padding, padding, parentWidth - 2 * padding, parentHeight - appIconSize - 2 * padding, "#ffffff", "#ffffff", 14);
            nativeAdViewProperty.cta = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize * 2, parentHeight - appIconSize, appIconSize * 2, appIconSize, "#2095F1", "#ffffff", appIconSize / 3);
            nativeAdViewProperty.title = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "", "#000000", appIconSize / 3);
            nativeAdViewProperty.desc = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize / 2, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "#ffffff", "#000000", appIconSize / 4);
            nativeAdViewProperty.dislike = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize / 2, frameHeight - parentHeight, appIconSize / 2, appIconSize / 2, "#00ffffff", "#ffffff", 14);
            ATNativeJSSDK.showAd(this.nativeBannerID(), nativeAdViewProperty);
        })
        //加载原生广告时需要传入广告展示的宽高
        // ATNativeJSSDK.loadNative(this.nativeBannerID(), ATNativeJSSDK.createLoadAdSize(view.getFrameSize().width, view.getFrameSize().height / 8));
        ATNativeJSSDK.loadNative(this.nativeBannerID(), ATNativeJSSDK.createLoadAdSize(cc.view.getFrameSize().width, cc.view.getFrameSize().width * 0.3));
        this.curNativeType = NativeType.NativeBanner;
    }

    /**展示中心区域的原生信息流广告 */
    showNativeInfomationOfCentre(success?: Function) {
        if (this.curNativeType != NativeType.none) {
            return;
        }
        this.nativeLoadCallBack = (() => {
            var frameSize = cc.view.getFrameSize();
            var frameWidth = frameSize.width;
            var frameHeight = frameSize.height;
            var padding = frameSize.width / 35;

            var parentWidth = frameWidth * 4 / 5;
            var parentHeight = frameHeight * 4 / 5;
            var appIconSize = frameWidth / 6;


            var nativeAdViewProperty = new ATNativeJSSDK.AdViewProperty();
            nativeAdViewProperty.parent = nativeAdViewProperty.createItemViewProperty(frameWidth / 2 - parentWidth / 2, frameHeight / 2 - parentHeight / 2, parentWidth, parentHeight, "#ffffff", "", 0);
            // nativeAdViewProperty.parent = nativeAdViewProperty.createItemViewProperty(0, frameHeight - frameHeight * 0.8, parentWidth, parentHeight, "#ffffff", "", 0);
            nativeAdViewProperty.appIcon = nativeAdViewProperty.createItemViewProperty(0, parentHeight - appIconSize, appIconSize, appIconSize, "", "", 0);
            nativeAdViewProperty.cta = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize * 2, parentHeight - appIconSize, appIconSize * 2, appIconSize, "#2095F1", "#ffffff", appIconSize / 3);

            nativeAdViewProperty.mainImage = nativeAdViewProperty.createItemViewProperty(padding, padding, parentWidth - 2 * padding, parentHeight - appIconSize - 2 * padding, "#ffffff", "#ffffff", 14);

            nativeAdViewProperty.title = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "", "#000000", appIconSize / 3);
            nativeAdViewProperty.desc = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize / 2, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "#ffffff", "#000000", appIconSize / 4);
            // nativeAdViewProperty.adLogo = nativeAdViewProperty.createItemViewProperty(0,0,0,0,"#ffffff","#ffffff",14);
            // nativeAdViewProperty.rating = nativeAdViewProperty.createItemViewProperty(0,0,0,0,"#ffffff","#ffffff",14);
            // nativeAdViewProperty.dislike = nativeAdViewProperty.createItemViewProperty(frameWidth / 2 + parentWidth / 2 - appIconSize / 2, frameHeight / 2 - parentHeight / 2, appIconSize / 2, appIconSize / 2, "#ffffff", "#ffffff", 14);
            nativeAdViewProperty.dislike = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize / 2, 0, appIconSize / 2, appIconSize / 2, "#00ffffff", "#ffffff", 14);
            ATNativeJSSDK.showAd(this.nativeinfomationID(), nativeAdViewProperty);
        })
        ATNativeJSSDK.loadNative(this.nativeinfomationID(), ATNativeJSSDK.createLoadAdSize(cc.view.getFrameSize().width, cc.view.getFrameSize().width * 4 / 5));
        this.curNativeType = NativeType.NativeCentre;
    }

    /**移除原生广告 */
    removeNativeAD() {
        if (this.curNativeType == NativeType.none) return;
        switch (this.curNativeType) {
            case NativeType.NativeBanner:
                ATNativeJSSDK.removeAd(this.nativeBannerID());
                break;
            case NativeType.NativeCentre:
                ATNativeJSSDK.removeAd(this.nativeinfomationID());
                break;
            case NativeType.NativeInfomation:
                ATNativeJSSDK.removeAd(this.nativeinfomationID());
                break;
            default:
                break;
        }
        this.curNativeType = NativeType.none;
    }
    /**显示全屏插屏广告
     * @param closeFun 广告被关闭回调
     */
    showFullInterstitial(closeFun?: Function) {
        let close = () => {
            this.preloadFullInters();
            if (closeFun) {
                closeFun();
            }
        }
        // if (closeFun) {
        //     this.interstitialCloseCallBack = closeFun;
        // } else {
        //     this.interstitialCloseCallBack = null;
        // }
        this.interstitialCloseCallBack = close;
        this.interstitialLoadCallBack = (() => {
            ATInterstitialJSSDK.showAd(this.FullInterstitial());
        })
        var setting = {};
        setting[ATInterstitialJSSDK.UseRewardedVideoAsInterstitial] = true;
        ATInterstitialJSSDK.loadInterstitial(this.FullInterstitial(), setting);
    }
}
export const topOnMgr = TopOnMgr.getInstance();