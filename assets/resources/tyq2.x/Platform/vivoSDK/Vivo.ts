
interface tempVideoAd {
    adObj: any
    isInVideo: boolean
    callBack: Function
}
class vivo {
    public static readonly _instance: vivo = new vivo();

    private videoAd!: tempVideoAd
    private bannerAd: any
    private interstitialAd: any
    private nativeAd: any

    private videoPosId = 'c468a33abd4a401c945cdf2b1b132df0';
    private bannerPosId = '8c1c8b7057d545a1bc9b25702c949172';
    private interstitialPosId = 'b4a8c8c389e74d60854582616ea09fc1';
    private nativePosId = '6611630f4c6246c19a7f9e970aea7921';

    constructor() {
    }

    //获取系统信息的同步版本
    get systemInfo() {
        return qg.getSystemInfoSync();
    }
    //设置屏幕是否常量
    public setKeepScreenOn(bol: any) {
        qg.setKeepScreenOn({
            keepSrceenOn: bol,
            success: () => { console.log('设置屏幕常亮成功') },
            fail: () => { },
            complete: () => { },
        })
    }
    //登录授权
    public authorize_code() {
        return new Promise((resolve, reject) => {
            qg.authorize({
                type: "code",
                success: function (data: any) {
                    resolve(data);
                },
                fail: function (data: any, code: any) {
                    reject(data);
                }
            })
        });
    }
    // 旧版本获取token
    public authorize_token() {
        return new Promise((resolve, reject) => {
            qg.authorize({
                type: "token",
                success: function (obj: any) {
                    resolve(obj);
                },
                fail: function (data: any, code: any) {
                    reject(data);
                }
            })
        })
    }
    // 获取授权信息 
    public getProfile(_token: any) {
        return new Promise((resolve, reject) => {
            qg.getProfile({
                token: _token,
                success: function (data: any) {
                    resolve(data);
                },
                fail: function (data: any, code: any) {
                    reject(data);

                }
            })
        });
    }
    /*
    *  qg.exitApplication()
    *  退出游戏，同步方法
    */
    exitApplication(cb: any) {
        qg.exitApplication();
    }
    /**
     * 使手机发生较长时间的振动。
     * @param callback 回调 (isSuccess, res)
     */
    public vibrateLong(callback?: Function): void {
        qg.vibrateLong();
        if (callback) {
            callback()
        }

    };
    /**
     * 使手机发生较短时间的振动
     * 
     */
    public vibrateShort(cb?: Function): void {
        qg.vibrateShort();
        if (cb) {
            cb()
        }
    };

    //=============================广告

    //播放激励视频
    showRewardVideoAd(next: any) {
        if (this.systemInfo.platformVersionCode < 1041) return next && next(false);
        if (!qg.createRewardedVideoAd) return next && next(false);
        if (this.videoAd) {
        } else {
            this.videoAd = {
                adObj: null,
                isInVideo: false,
                callBack: null!
            }
            this.videoAd.adObj = qg.createRewardedVideoAd({
                posId: this.videoPosId
            });
            this.videoAd.adObj.onError((err: any) => {
                this.videoAd.isInVideo = false;
                this.videoAd.callBack && this.videoAd.callBack(false);
                // Emitter.getInstance().emit("showADTip", '频繁观看广告，请稍后再试!');

                console.log("视频广告创建失败")
                switch (err.errCode) {
                    case -3:
                        console.log("激励广告加载失败---调用太频繁", JSON.stringify(err));


                        break;
                    case -4:
                        console.log("激励广告加载失败--- 一分钟内不能重复加载", JSON.stringify(err));


                        break;
                    case 30008:
                        // 当前启动来源不支持激励视频广告，请选择其他激励策略
                        break;
                    default:
                        console.log("激励广告展示失败", err)


                        break;
                }
            })
            this.videoAd.adObj.onLoad(() => {
                let adshow = this.videoAd.adObj.show();
                adshow && adshow.then(() => {// 捕捉show失败的错误
                    console.log("激励视频广告显示成功");
                    // if (AudioMgr.isOpen) {
                    //     AudioMgr.pause();
                    // }
                    this.videoAd.isInVideo = true;
                }).catch((err: any) => {
                    console.log("激励视频广告显示失败", err);
                    this.videoAd.isInVideo = false;
                    this.videoAd.callBack && this.videoAd.callBack(false);
                    // Emitter.getInstance().emit("showADTip", '频繁观看广告，请稍后再试!');
                });
            })
            this.videoAd.adObj.onClose((res: any) => {
                this.videoAd.isInVideo = false;
                console.log('onClose!', res)
                if (res && res["isEnded"]) {
                    this.videoAd.callBack && this.videoAd.callBack(true);
                } else {
                    // Emitter.getInstance().emit("showADTip", '提前关闭视频不能得到奖励哦！');
                    this.videoAd.callBack && this.videoAd.callBack(false);


                }
                // if (AudioMgr.isOpen) {
                //     AudioMgr.resume();
                // }
                this.videoAd.callBack = null!;
                // this.rewardedVideoAd.offClose();
            });
        }
        this.videoAd.isInVideo = true;
        this.videoAd.callBack = next;
        let adLoad = this.videoAd.adObj.load();//第一次调用 可能会报-3  广告能正常展示就可以忽略
        // 捕捉load失败的错误
        adLoad && adLoad.then(() => {
            console.log("激励视频广告加载成功");
            this.videoAd.isInVideo = true;
        }).catch((err: any) => {
            this.videoAd.isInVideo = false;
            console.log("激励视频广告加载失败", err);
            // Emitter.getInstance().emit("showADTip", '频繁观看广告，请稍后再试!');
            this.videoAd.callBack && this.videoAd.callBack(false);
        });
    }

    //------

    showBannerAd() {
        if (this.systemInfo.platformVersionCode < 1041) return;
        if (this.bannerAd) return;
        console.log('显示banner广告3')
        let doBannerShow = () => {
            let adshow = this.bannerAd.show();
            adshow && adshow.then(() => {
                console.log("banner广告展示成功");
            }).catch((err: any) => {
                switch (err.code) {
                    case 30003:
                        console.log("新用户7天内不能曝光Banner，请将手机时间调整为7天后，退出游戏重新进入")
                        break;
                    case 30009:
                        console.log("10秒内调用广告次数超过1次，10秒后再调用")
                        break;
                    case 30002:
                        console.log("加载广告失败，重新加载广告")
                        break;
                    default:
                        console.log("banner广告展示失败")
                        console.log(JSON.stringify(err))
                        break;
                }
            });
        }
        this.bannerAd = qg.createBannerAd({
            posId: this.bannerPosId,
            style: {
            }
        });
        console.log('创建banner广告第一步', this.bannerAd)
        this.bannerAd.onSize((res: any) => {
            console.log('banner onResize', res);
            // gl.bannerSize = {
            //     width: res.width,
            //     height: (res.width / 16 * 9),
            //     winHeight: this.systemInfo.screenHeight
            // };
            // this.bannerAd.style.left = (this.systemInfo.screenWidth - res.width) / 2;
            // this.bannerAd.style.top = this.systemInfo.screenHeight - (res.width / 16 * 9);
        })
        this.bannerAd.onLoad(() => {
            this.bannerAd.offLoad && this.bannerAd.offLoad();
            console.log("banner 广告加载成功 ...");
            doBannerShow();
        });
        this.bannerAd.onError((err: any) => {
            this.bannerAd.offError && this.bannerAd.offError();
            console.log("banner 广告创建失败 ...", err);
        });
        this.bannerAd.onClose((err: any) => {
            this.bannerAd.offClose();
            console.log("onClose 广告创建 ...", err);
        });
    }
    hideBannerAd() {
        if (!this.bannerAd) {
            return;
        }
        var addestroy = this.bannerAd.destroy();
        // 调用then和catch之前需要对show的结果做下判空处理，防止出错（如果没有判空，在平台版本为1052以及以下的手机上将会出现错误）
        addestroy && addestroy.then(() => {
            console.log("banner广告销毁成功");
            this.bannerAd.offLoad();
            this.bannerAd.offError();
            this.bannerAd.offSize();
        }).catch((err: any) => {
            console.log("banner广告销毁失败", err);
        });
    }

    //-------
    //显示插屏广告
    showInterstitialAd(next?: any) {
        if (this.systemInfo.platformVersionCode < 1031) return next && next(false);
        if (this.interstitialAd) return;
        console.log("显示插屏广告");
        this.interstitialAd = qg.createInterstitialAd({
            posId: this.interstitialPosId,
        });
        var doShow = () => {
            let adShow = this.interstitialAd.show();
            // 调用then和catch之前需要对show的结果做下判空处理，防止出错（如果没有判空，在平台版本为1052以及以下的手机上将会出现错误）
            adShow && adShow.then(() => {
                console.log("插屏广告展示成功");
                next && next();
            }).catch((err: any) => {
                this.interstitialAd = null;
                switch (err.code) {
                    case 30003:
                        console.log("新用户7天内不能曝光Banner，请将手机时间调整为7天后，退出游戏重新进入")
                        break;
                    case 30009:
                        console.log("10秒内调用广告次数超过1次，10秒后再调用")
                        break;
                    case 30002:
                        console.log("load广告失败，重新加载广告")
                        break;
                    case 30000:
                        break;
                    default:
                        console.log("插屏广告展示失败")
                        console.log(err)
                        break;
                }
            });
        }
        this.interstitialAd.onLoad(() => {
            console.log('加载插屏广告成功')
            doShow();
        }, () => {
            console.log('加载插屏广告失败')
            this.interstitialAd = null;
        })
        this.interstitialAd.onError((err: any) => {
            console.log("插屏广告创建失败 ...", err)
            this.interstitialAd = null;
        })
        this.interstitialAd.onClose(() => {
            console.log("插屏 关闭 ...")
            this.interstitialAd && this.interstitialAd.offClose();
            this.interstitialAd = null;
        })
    }
    //----------

    //创建原生广告
    createNativeAd(next?: Function, resS?: Function) {
        if (this.systemInfo.platformVersionCode < 1053) return next && next(false);
        this.nativeAd = qg.createNativeAd({
            posId: this.nativePosId
        })
        console.log("原生广告原生广告", this.nativeAd)
        this.nativeAd.onLoad((res: any) => {
            if (res && res.adList) {
                console.log("原生广告", res);
                console.log(res.adList)
                console.log(res.adList[0])
                next && next(res.adList[0]);
            }
            else {
                next && next(null);
            }
            this.reportAdShow(res.adList[0].adId);
        })
        this.nativeAd.onError((res: any) => {
            console.log('原生广告加载失败', res)
            // next && next()
            if (resS) {
                resS()
            }
        })
        let adLoad = this.nativeAd.load()
        adLoad && adLoad.then(() => {
            console.log("原生广告加载成功");
        }).catch((err: any) => {
            console.log('原生广告加载失败', JSON.stringify(err));
            // next && next()
            if (resS) {
                resS()
            }
        });
    }

    /**上报原生点击 */
    clickNativeAd(adId: any) {
        if (!this.nativeAd) return;
        this.nativeAd.reportAdClick({
            adId: adId,
        });
    }

    /**上报广告曝光 */
    reportAdShow(adId: any) {
        if (!this.nativeAd) return;
        this.nativeAd.reportAdShow({
            adId: adId
        })
    }

    /**销毁广告组件，释放资源 */
    desNativeAd() {
        console.log("销毁广告组件，释放资源", this.nativeAd);
        this.nativeAd.destroy();
    }


    // 检查登录信息 5分钟后token 失效
    public getSetting(cbOK: any, cbFail = null) {

    }
}

export const Vivo = vivo._instance;