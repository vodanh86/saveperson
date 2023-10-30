

import { KS } from './Platform/kuaishouSDK/kuaishou';
import { Meizu } from './Platform/meizuSDK/meizu';
import { OPPO } from './Platform/oppoSDK/oppoAdMange';
import { Toutiao } from './Platform/toutiao/toutiao';
import { Vivo } from './Platform/vivoSDK/Vivo';
import { Wechat } from './Platform/wechat/wechat';
import { XM } from './Platform/xiaomiSDK/xiaomi';
import { topOnMgr } from './Third/AnyThinkAds/topOnMgr';
import IronSourceMgr from './Third/IronSourceMgr';
import MiAdMgr from './Third/MiAdMgr';
import TyqEventMgr from './tyq-event-mgr';
import tyqSdkConfig from './tyq-sdk-config';
import { OV_NativeAd } from './view/OV_NativeAd';
import { EType, IPos, ShuffType, WXCustomAd } from './WXCustomAd';

// import { JXDef } from '../conventions/JXCommon';
let adStr = "广告";
/**渠道 */
export enum Channel {
    /**默认 浏览器*/
    DEFAULT = 0,
    /**微信 */
    WECHAT = 1,
    /**头条 抖音 */
    TT = 2,
    /**快手 */
    KS = 3,
    /**oppo渠道 */
    OPPO = 4,
    /**vivo渠道 */
    VIVO = 5,
    /**魅族渠道 */
    MEIZU = 6,
    /**小米渠道 */
    XIAOMI = 7,
    ANDROID,
    IOS,
}
export interface IUserInfo {
    nickName: string;
    avatar: string;
    sex?: number,
    uid?: string,
}
export default class SdkMgr {
    protected static _ins: SdkMgr;

    /**录屏对象 */
    private _mediaRecorder: any = null;
    public static get ins(): SdkMgr {
        if (!this._ins) {
            this._ins = new SdkMgr;
        }
        return this._ins;
    }

    constructor() {
        if (cc.sys.platform == cc.sys.BYTEDANCE_GAME) {
            this.channel = Channel.TT;
        } else if (window.kwaigame) {
            this.channel = Channel.KS;
        } else if (cc.sys.platform == cc.sys.WECHAT_GAME && window.wx) {
            Wechat.getSystemInfoSync();
            Wechat.preLoadAd();
            WXCustomAd.preLoadShuffAd(ShuffType.left);
            WXCustomAd.preLoadShuffAd(ShuffType.right);
            this.channel = Channel.WECHAT;
        } else if (cc.sys.isMobile && cc.sys.isBrowser) {
            this.channel = Channel.DEFAULT;
        } else if (CC_PREVIEW) {
            this.channel = Channel.DEFAULT;
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.channel = Channel.ANDROID;
            if (tyqSdkConfig.useTopon) {
                topOnMgr.init();
            }
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            this.channel = Channel.IOS;
            if (tyqSdkConfig.useTopon) {
                topOnMgr.init();
            }
        }

    }

    private channel: Channel = Channel.WECHAT;
    private _videoRes: string = "";
    public getChannel() {
        return this.channel;
    }

    /**观看广告 */
    public watchAd(callback: Function, fail?: Function, cancel?: Function) {
        let cb = () => {
            // GameMgr.lUserData.doneTask(ETaskType.watchAd);
            callback();
        }

        switch (this.channel) {
            case Channel.DEFAULT: {
                cb();
                break;
            }
            case Channel.TT: {
                Toutiao.showRewardVideoAd("guanggao").then((is) => {
                    if (is) {
                        console.log("success")

                        cb();
                    } else if (cancel) {
                        cancel();
                    }
                }, (res) => {

                    // GameMgr.uiMgr.showToast("广告加载失败");
                    if (fail) {
                        fail();
                    }
                })
                break;
            }
            case Channel.WECHAT: {

                Wechat.showRewardVideoAd().then((isSuc) => {
                    if (isSuc) {
                        console.log("success")

                        cb();
                    } else if (cancel) {
                        cancel();
                    }

                }, (res?) => {
                    if (fail) {
                        fail();
                    }
                })
                break;
            }
            case Channel.MEIZU: {
                Meizu.showRewardedVideoAd().then(() => {
                    console.log("success")

                    cb();
                }, () => {
                    console.log("fail")
                })
                break;
            }
            case Channel.OPPO: {
                OPPO.showRewardVideoAd(() => {
                    console.log("success")

                    cb();
                }, () => {
                    console.log("fail")
                })
                break;
            }
            case Channel.VIVO: {
                Vivo.showRewardVideoAd((isSuc) => {
                    if (isSuc) {


                        console.log("success")
                        cb();
                    } else {
                        console.log("fail")
                    }
                })
                break;
            }
            case Channel.XIAOMI: {
                XM.showRewardedVideoAd(() => {

                    console.log("success");
                    cb();
                }, () => {
                    console.log("fail")
                })
                break;
            }
            case Channel.KS: {
                KS.showRewardedVideoAd(() => {

                    cb();
                })
                break;
            }
            case Channel.ANDROID: {

                if (tyqSdkConfig.isXiaomi) {
                    MiAdMgr.ins.showReward("", () => {
                        cb();
                    }, () => {
                        if (cancel) {
                            cancel();
                        }
                    })
                } else if (tyqSdkConfig.useTopon) {
                    topOnMgr.showRewardVideoAd("", () => {
                        cb();
                    }, () => {
                        if (cancel) {
                            cancel();
                        }
                    })
                } else if (tyqSdkConfig.useIronSource) {
                    IronSourceMgr.ins.showReward("", () => {
                        cb();
                    }, () => {
                        if (cancel) {
                            cancel();
                        }
                    })
                } else {
                    cb();
                }



                break;
            }
            case Channel.IOS:
                if (tyqSdkConfig.useTopon) {
                    topOnMgr.showRewardVideoAd("", () => {
                        cb();
                    }, () => {
                        if (cancel) {
                            cancel();
                        }
                    })
                }
                break;
        }

    }

    public umaSetPoint(event: string, obj?: any) {
        if (obj) {
            TyqEventMgr.ins.sendEvent(event, obj.msg);
        } else {
            TyqEventMgr.ins.sendEvent(event);
        }
    }

    public showMoreGamesModal() {
        switch (this.channel) {
            case Channel.TT: {
                Toutiao.showMoreGamesModal();
                break;
            }
        }
    }

    public ttFocusOn() {
        Toutiao.openAwemeUserProfile();
    }

    /**录屏开始 */
    protected startRecoding() {

    }

    /**事件添加开始录屏 */
    public recordStart() {
        console.log("录屏开始*--*");
        if (this.channel == Channel.TT) {
            Toutiao.startRecordScreen(300, this.startRecoding);
            console.log("录屏开始11111", 11111);
        } else if (this.channel == Channel.KS) {
            this._mediaRecorder = kwaigame.createMediaRecorder();
            this._mediaRecorder.start();
        } else if (this.channel == Channel.WECHAT) {

        }
    }

    public puaseRecord() {
        console.log("暂停录屏");
        if (this.channel == Channel.TT) {
            Toutiao.pauseRecordScreen();
        } else if (this.channel == Channel.KS) {
            this._mediaRecorder.pause();
        }
    }

    public resumeRecord() {
        console.log("继续录屏")
        if (this.channel === Channel.TT) {
            Toutiao.resumeRecordScreen()
        } else if (this.channel == Channel.KS) {
            this._mediaRecorder.resume();
        }
    }

    /**事件添加结束录屏 */
    public recordEnd() {
        console.log("录屏结束*--*");
        if (this.channel == Channel.TT) {
            Toutiao.stopRecordScreen((path) => {
                Toutiao.clipVideo(60, path, (res) => {
                    this._videoRes = res.videoPath;
                    console.log("录屏结束*--*", 11111);
                })
            });
        } else if (this.channel == Channel.KS) {
            this._mediaRecorder.stop();
        }
    }

    /**事件转发 */
    public recordCut(cb: Function) {
        if (this.channel == Channel.TT) {
            console.log("录屏" + this._videoRes);
            Toutiao.shareAppMessage("最强小英雄", this._videoRes, ["最强小英雄", "抖音小游戏", "卡牌回合", "卡牌格斗"]).then(() => {
                console.log('分享视频成功');
                cb();
            })
        } else if (this.channel == Channel.KS) {
            this._mediaRecorder.publishVideo({
            });
        } else {
            console.log("假装分享视频成功")
            cb();
        }
    }
    //授权
    public authorize(cb: (userInfo: IUserInfo | null) => void) {
        if (this.channel == Channel.TT) {
            Toutiao.TTLogin(() => {

                Toutiao.toutiaoLogin().then((res: any) => {
                    if (res) {
                        let userInfo: IUserInfo = {
                            nickName: res.name,
                            avatar: res.photo,
                        }
                        cb(userInfo);
                        //获取抖音的oppenid
                    } else {
                        cb(null);
                    }


                }).catch((res) => {
                    console.log(`toutiaoLogin 调用失败`);
                    console.log(res);
                    cb(null);
                })
            }, (res) => {
                cc.log(res);
                cb(null);
            }, false)
        } else if (this.channel == Channel.KS) {
            KS.KSlogin(() => {
                KS.KSgetUserInfo((res: any) => {

                    let userInfo: IUserInfo = {
                        nickName: res.userName,
                        avatar: res.userHead,
                    }
                    cb(userInfo);
                })
            })
        } else if (this.channel == Channel.DEFAULT) {
            cb(null);
        } else if (this.channel == Channel.WECHAT) {
            // Wechat.login(() => {

            //     Wechat.getUserInfo((res: any) => {
            //         let userInfo: IUserInfo = {
            //             nickName: res.userInfo.nickName,
            //             avatar: res.userInfo.avatarUrl,
            //         }
            //         cb(userInfo);
            //     }, (res) => {
            //         console.log(`getUserInfo 调用失败`);
            //         console.log(res);
            //         cb(null);
            //     })
            // }, (res) => {
            //     cc.log(res);
            //     cb(null);
            // });
            let button = wx.createUserInfoButton({
                type: 'text',
                text: '获取用户信息',
                style: {
                    left: 10,
                    top: 76,
                    width: 200,
                    height: 40,
                    lineHeight: 40,
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            })
            button.onTap((res) => {
                console.log(res.userInfo.avatarUrl);
                console.log(res.userInfo.nickName);
            })

        } else {
            cb(null);
        }
    }

    public initGame() {

    }

    public loginOut() {
    }
    /**是否显示分享录屏按钮 */
    public isShowRecordBtn() {
        if (this.channel == Channel.TT || this.channel == Channel.KS) {
            return true;
        }
        return false;
    }

    public isWechat() {
        return this.channel == Channel.WECHAT;
    }

    //显示插屏广告
    public showIntersAd() {
        if (this.channel == Channel.VIVO) {
            Vivo.showInterstitialAd();
        } else if (this.channel == Channel.TT) {
            Toutiao.showInterstitialAd();
        } else if (this.channel == Channel.WECHAT) {
            Wechat.showInterstitialAd();
        } else if (this.channel == Channel.OPPO) {
            OPPO.showInterstitialAd();
        } else if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.isXiaomi) {
                MiAdMgr.ins.showInterstitial();
            } else if (tyqSdkConfig.useTopon) {
                topOnMgr.showInterstitialAd();
            } else if (tyqSdkConfig.useIronSource) {
                IronSourceMgr.ins.showIntertitial();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showInterstitialAd();
            }

        }

    }
    /**展示原生信息流广告(横幅样式) 
  * @param success 广告展示成功回调
  * @param fail 广告展示失败回调
 */
    public showNativeInfomation() {
        if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeInfomation();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeInfomation();
            }
        }

    }
    /**展示中心区域的原生信息流广告 */
    public showNativeInfomationOfCentre() {
        if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeInfomationOfCentre();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeInfomationOfCentre();
            }
        }

    }
    /**展示原生横幅广告 */
    public showNativeBanner() {
        if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeBanner();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showNativeBanner();
            }
        }

    }
    public showFullInters() {
        if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showFullInterstitial();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showFullInterstitial();
            }
        }

    }
    public showBanner(node?) {
        if (this.channel == Channel.TT) {
            Toutiao.showBannerAd();
        } else if (this.channel == Channel.WECHAT) {
            Wechat.showBannerAd();
        } else if (this.channel == Channel.VIVO) {
            Vivo.showBannerAd();
        } else if (this.channel == Channel.OPPO) {
            OPPO.showBannerAd();
        } else if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.isXiaomi) {
                MiAdMgr.ins.showBanner(node);
            } else if (tyqSdkConfig.useTopon) {
                topOnMgr.showBannerAd(node);
            } else if (tyqSdkConfig.useIronSource) {
                IronSourceMgr.ins.showBanner(node);
            }
        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.showBannerAd(node);
            }
        }
    }

    public showBannerTurns(time) {
        if (this.channel == Channel.WECHAT) {
            Wechat.showBannerTurns(time);
        }
    }

    public hideBanner() {
        if (this.channel == Channel.TT) {
            Toutiao.hideBannerAd();
        } else if (this.channel == Channel.VIVO) {
            Vivo.hideBannerAd();
        } else if (this.channel == Channel.OPPO) {
            OPPO.hideBannerAd();
        } else if (this.channel == Channel.WECHAT) {
            Wechat.hideBannerAd();
        } else if (this.channel == Channel.ANDROID) {
            if (tyqSdkConfig.isXiaomi) {
                MiAdMgr.ins.destroyBanner();
            } else if (tyqSdkConfig.useTopon) {
                topOnMgr.removeBannerAd();
            } else if (tyqSdkConfig.useIronSource) {
                IronSourceMgr.ins.destroyBanner();
            }

        } else if (this.channel == Channel.IOS) {
            if (tyqSdkConfig.useTopon) {
                topOnMgr.removeBannerAd();
            }
        }
    }
    private _ovNativeAd: cc.Node = null;
    //显示OV原生广告
    public showOvNativeAd(node: cc.Node, pos: cc.Vec2, size: cc.Size, success?: (ad: OV_NativeAd) => void, fail?: Function) {
        if (this._ovNativeAd) {
            this._ovNativeAd.destroy();
        }
        cc.resources.load("tyqRes/prefab/OV_NativeAd", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            this._ovNativeAd = cc.instantiate(prefab);
            cc.find("Canvas").addChild(this._ovNativeAd, cc.macro.MAX_ZINDEX);
            this._ovNativeAd.getComponent(OV_NativeAd).init(node, pos, size, success, fail);
        });

    }

    public sendOvNative(): boolean {
        if (this._ovNativeAd && cc.isValid(this._ovNativeAd)) {
            let nativeAd = this._ovNativeAd.getComponent(OV_NativeAd);
            return nativeAd.sendNative();
        }
        return false;
    }


    public showGridTurns(time: number) {
        if (this.channel == Channel.WECHAT) {
            WXCustomAd.showGridTurns(time);
        }
    }

    public stopGridTurns() {
        if (this.channel == Channel.WECHAT) {
            WXCustomAd.stopGridTurns();
        }
    }

    public showWxCustomAd(flag, type: EType, pos: IPos, extraId?, errcb?) {
        if (this.channel == Channel.WECHAT) {
            WXCustomAd.createCustomAd(flag, type, pos, extraId, errcb);
        }
    }

    public hideWxCustomAd(flag) {
        if (this.channel == Channel.WECHAT) {
            WXCustomAd.hideCustomAd(flag);
        }
    }

    public hideAllWxCustom() {
        if (this.channel == Channel.WECHAT) {
            WXCustomAd.hideAllAd();
        }
    }
}