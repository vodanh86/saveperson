
class oppoAdMange {
    public static readonly _instance: oppoAdMange = new oppoAdMange()

    /**激励视频广告对象 */
    private rewardVideoAd: any
    /**banner广告对象 */
    private bannerAd: any
    /**原生广告对象 */
    private nativeAd: any
    /**原生插屏广告对象 */
    private insertAd: any
    /**激励视频广告ID */
    private _rewardVideoAdUnitId = '388920';
    /**banner广告ID */
    private _banneradUnitId = '388926';
    /**原生广告ID */
    private nativeadUnitId = '388925';
    /**原生插屏广告ID */
    private insertAdUnitId = '';


    public set bannerAdUnitId(adUnitId: string) {
        this._banneradUnitId = adUnitId;
    }

    public set rewardedVideoAdUnitId(adUnitId: string) {
        this._rewardVideoAdUnitId = adUnitId;
    }

    //获取系统信息的同步版本
    get systemInfo() {
        return qg.getSystemInfoSync();
    }

    /**登陆接口 */
    login() {
        qg.login({
            success: res => {
                // 可全局储存 token，方便其他能力获取，注意 token 过期时间
                console.log(`登录成功: ${JSON.stringify(res.data)}`)
            },
            fail: res => {
                console.log(`登录失败: ${JSON.stringify(res)}`)
            }
        })
    }

    /**获取授权信息  */
    public getProfile(_token) {
        return new Promise((resolve, reject) => {
            qg.getProfile({
                token: _token,
                success: function (data) {
                    resolve(data);
                },
                fail: function (data, code) {
                    reject(data);

                }
            })
        });
    }
    /**  退出游戏，同步方法*/
    exitApplication() {
        qg.exitApplication();
    }

    /**使手机发生较短时间的振动（20 ms） */
    vibrateShort() {
        qg.vibrateShort({
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { }
        })
    }

    /**使手机发生较长时间的振动（400 ms) */
    vibrateLong() {
        qg.vibrateLong({
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { }
        })
    }

    //=============================广告

    /**展示激励视频 */
    showRewardVideoAd(suc: Function, fail: Function) {
        console.log("展示激励视频");
        //    if(this.systemInfo.minPlatformVersion<1051)return
        // return new Promise<void>((resolve, reject) => {
        this.rewardVideoAd = qg.createRewardedVideoAd({
            adUnitId: this._rewardVideoAdUnitId,
        })
        console.log('加载广告')
        this.rewardVideoAd
            .load()
            .then(() => {
                console.log('promise 回调：加载成功')
                console.log('展示广告')
                // 调用 show 方法请求展示 banner，成功的时候回调 onShow，出错的时候回调 onError
                this.rewardVideoAd
                    .show()
                    .then(() => {
                        console.log('promise 回调：展示成功')
                    })
                    .catch(err => {
                        console.log(`promise 回调：展示失败 ${JSON.stringify(err)}`);
                    })
            })
            .catch(err => {
                console.log(`promise 回调：加载失败 ${JSON.stringify(err)}`)
            })

        this.rewardVideoAd.onClose((res: any) => {
            if (res.isEnded) {
                cc.log('激励视频广告完成，发放奖励')
                suc()
                this.rewardVideoAd.offClose()
                // resolve();
            } else {
                cc.log('激励视频广告取消关闭，不发放奖励')
                fail();
                // reject();
                this.rewardVideoAd.offClose()
            }
        })

        // })
    }


    /**展示Banner广告 */
    showBannerAd() {
        console.log("展示banner视频");
        if (this.systemInfo.minPlatformVersion < 1051) return
        if (this.bannerAd) {
            return;
        }
        this.bannerAd = qg.createBannerAd({
            adUnitId: this._banneradUnitId,
        })
        console.log("创建成功");

        this.bannerAd.onLoad(() => {
            cc.log('banner 广告加载成功')
        })
        this.bannerAd.show(() => {
            cc.log('banner 广告显示')
        })
        this.bannerAd.onError(function (err) {
            cc.error("banner 广告出错")
            cc.error(JSON.stringify(err))
            this.bannerAd.destroy()
            this.bannerAd = null;
        })
    }


    /**隐藏Banner广告 */
    hideBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }

    /**展示原生插屏广告 */
    showInterstitialAd() {

    }

    /**原生插屏 */
    creatorInterstitialAd() {
    }


    /**创建原生广告 */
    createNativeAd(next: Function, fail: Function) {
        if (this.systemInfo.platformVersionCode < 1051) return
        // if (this.nativeAd) {
        //     this.nativeAd.destroy();
        //     this.nativeAd = null;
        // }
        this.nativeAd = qg.createNativeAd({
            posId: this.nativeadUnitId
        })
        this.nativeAd.onLoad((res) => {
            if (res && res.adList) {
                console.log("原生广告", res);
                this.reportAdShow(res.adList[0].adId);
                if (next) {
                    next(res.adList[0]);
                }
            }
        })
        this.nativeAd.onError((res) => {
            console.log('原生广告加载失败', res)
            if (fail) {
                fail(res);
            }
        })
        let adLoad = this.nativeAd.load()
        adLoad && adLoad.then(() => {
            console.log("原生广告加载成功");
        }).catch((err) => {
            console.log('原生广告加载失败', JSON.stringify(err));
            if (fail) {
                fail();
            }
        });
    }
    /**上报原生点击 */
    clickNativeAd(adId) {
        if (!this.nativeAd) return;
        this.nativeAd.reportAdClick({
            adId: adId,
        });
    }

    /**上报广告曝光 */
    reportAdShow(adId) {
        if (!this.nativeAd) return;
        this.nativeAd.reportAdShow({
            adId: adId
        })
    }



    // 检查登录信息 5分钟后token 失效
    public getSetting(cbOK, cbFail = null) {

    }

    /**判断是否已经创建桌面图标 */
    hasShortcutInstalled() {
        this.login()
        qg.hasShortcutInstalled({
            success: function (res) {
                // 判断图标未存在时，创建图标
                if (res == false) {
                    qg.installShortcut({
                        success: function () {
                            // 执行用户创建图标奖励
                        },
                        fail: function (err) { },
                        complete: function () { }
                    })
                }
            },
            fail: function (err) { },
            complete: function () { }
        })
    }

    /**设置游戏加载进度页面（该功能必须接入，否则会因为未接入，导致游戏加载页进度条缺失而被测试打回） */
    setLoadingProgress() {
        qg.setLoadingProgress({
            progress: 50
        });
    }
    /**隐藏游戏加载进度页面 */
    loadingComplete() {
        qg.loadingComplete({
            complete: function (res) { }
        });
    }

    /**跳转小游戏 */
    navigateToMiniGame() {
        qg.navigateToMiniGame({
            pkgName: 'com.sjmsj.nearme.gamecenter',
            path: '?page=pageB',
            extraData: {
                from: 'pageA'
            },
            success: function () {

            },
            fail: function (res) {
                console.log(JSON.stringify(res))
            }
        })
    }


}
export const OPPO = oppoAdMange._instance