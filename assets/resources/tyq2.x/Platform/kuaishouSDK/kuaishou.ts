/**
 * 2021/4/14版本
 */

class kuaishou {
    ////////////////////////////
    // 类成员
    ///////////////////////////
    public static readonly _instance = new kuaishou()
    /** 奖励视频广告对象 */
    private rewardedVideoAd: any = null;
    /** 全局唯一的录屏管理器 */
    private mediaRecorder: any = null;
    /**用于存储成功录制的视频数据 */
    private video: any = null;
    /** 奖励视频广告id */
    private _rewardedVideoAdUnitId = "2300001739_01";
    /**快手平台appId */
    private appId = "ks685954522284992897";
    /**app secret */
    private app_secret = ''
    /**关注错误码 */
    ksError: string = ""



    ////////////////////////////
    // get、set访问器
    ///////////////////////////

    public set rewardedVideoAdUnitId(adUnitId: string) {
        this._rewardedVideoAdUnitId = adUnitId;
    }

    /**获取平台基础信息 */
    getSystemInfo() {
        kwaigame.getSystemInfo({
            response: (result) => {
                console.log("获取系统信息:" + JSON.stringify(result));
            }
        });
    }


    /**同步获取启动参数 */
    getLaunchOptionsSync() {
        kwaigame.getLaunchOptionsSync()
    }

    /**初始化, 在游戏启动时调用 */
    gameInit() {
        kwaigame.init({ "appId": this.appId });
    }

    /**在合适时机调用，移除快手小游戏加载页面，将游戏界面展示出来。 */
    readyGo() {
        kwaigame.readyGo()
    }

    /**登录接口,
     * 通过该接口获取的 gameUserId 是快手小游戏的唯一用户id，
     * gameToken 是使用快手小游戏服务器API的唯一验证 token。 */
    KSlogin(cb: Function) {
        kwaigame.login({
            success: (result: { gameUserId: string, gameToken: string }) => {
                console.log("登录成功:" + JSON.stringify(result));
                if (cb) {
                    cb(result)
                }
            },
            fail: (error: { code, msg: string }) => {
                console.log("登录失败:" + JSON.stringify(error));
            }
        });
    }

    /**向用户发起授权请求
     * 1.如果尚未发起过授权请求，则弹窗询问用户是否同意授权游戏使用某项功能或获取用户的某些数据；
     * 2.如果用户之前已经同意授权，则不会出现弹窗，直接返回成功
     * 3.如果用户之前已经拒绝授权，则不会再次出现弹窗，直接返回失败。
     * scpoe:需要获取权限的scope
     */
    authorize(cb: Function, failCb: Function) {
        // this.login()
        kwaigame.authorize({
            scope: "scope.userInfo",/**用户信息 */
            success: (result) => {
                console.log("获取用户信息成功：" + JSON.stringify(result));

                cb(result);
            },
            fail: (error: { code, msg: string }) => {
                console.log("授权获取用户信息失败: " + JSON.stringify(error));
                failCb();
            },
            complete: () => {
                /**申请授权完成的回调（无论成功失败都会被调用） */
                console.log("授权获取用户信息完成");

            }
        });
    }

    /**获取用户信息
     * 如果在未授权的情况下请求用户信息，会返回默认数据（空昵称、默认头像）
     * 1.userName	string	昵称
     * 2.userHead	string	头像
     * 3.gender	    string	性别，M-男，F-女
     * 4.userCity	string	城市
     * 5.age	     int	年龄
     */
    KSgetUserInfo(cb: Function) {
        kwaigame.getUserInfo({
            success: (result: { userName: string, userHead: string, gender: string, userCity, age }) => {
                console.log("获取用户信息成功：" + JSON.stringify(result));
                cb(result)
            },
            fail: (error: { code, msg: string }) => {
                console.log("获取用户信息失败: " + JSON.stringify(error));
            },
            complete: () => {
                console.log("获取用户信息完成");
            }
        });
    }

    /**
     * @description 是否支持改API
     * @param api
     */
    private static isSupportedAPI(api: any) {
        // kwaigame.isSupport(kwaigame.Support.features.RewardVideo);
        // kwaigame.isSupportAsync(kwaigame.Support.features.RewardVideo, {response: (result) => {
        //     console.log("support reward video: " + result);
        // }});
    }


    /**获取全局激励视频广告组件 */
    showRewardedVideoAd(cb: Function) {
        let param: any = {};
        param.adUnitId = this._rewardedVideoAdUnitId;
        this.rewardedVideoAd = kwaigame.createRewardedVideoAd(param);
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.show({
                success: () => {
                    console.log("激励视频播放成功");
                },
                fail: (result) => {
                    console.log("激励视频播放失败: " + JSON.stringify(result));
                }
            })
            console.log("激励广告组件获取成功");
            this.rewardedVideoAd.onClose((result) => {
                console.log("激励视频关闭回调: " + JSON.stringify(result));
            });
            this.rewardedVideoAd.onReward((result) => {
                console.log("激励视频奖励回调: " + JSON.stringify(result));
                cb()
            });
        } else {
            console.log("激励广告组件获取失败");
        }
    }


    /**
     * @description 创建全局录屏组件
     */
    registerRecordScreenEvent() {
        // 创建录屏对象
        this.video = null
        this.mediaRecorder = kwaigame.createMediaRecorder()
        if (this.mediaRecorder === null) {
            console.log("返回 null 时表示当前 APP 版本不支持录屏")
            return
        } else {
            // 注册回调， 不关心的回调可以不注册
            let that = this
            this.mediaRecorder.onStart(function () {
                console.log("录频开始成功")
            })
            this.mediaRecorder.onStop(function (data) {
                // 每次成功录制都会生成一个 videoID
                that.video = data.videoID
                console.log(`录频停止成功 ${JSON.stringify(data)} `)
            })

            this.mediaRecorder.onError(function (error) {
                console.log(`录频过程中发生错误 ${JSON.stringify(error)} `)
            })
        }

    }

    /**
     *  开始录屏
     */
    public startRecordScreen() {
        // 开始录屏， start 和 stop 调用需要配对，每次 start , stop 都会生成一段视频, 并从 onStop() 回调
        this.video = null
        if (this.mediaRecorder) {
            this.mediaRecorder.start();
        }

    }

    /**
     *  暂停录屏
     */
    public pauseRecordScreen() {
        if (this.mediaRecorder) {
            this.mediaRecorder.pause();
        }
    }

    /**恢复录屏 */
    public resumeRecordScreen() {
        if (this.mediaRecorder) {
            this.mediaRecorder.resume();
        }
    }

    /**
     *  停止录屏
     */
    public stopRecordScreen() {
        if (this.mediaRecorder) {
            // 成功 stop 后会触发 onStop() 回调
            this.mediaRecorder.stop()
        }
    }

    /**发布录屏到快手。 */
    publishVideo(cb?: Function) {
        // 发布录屏至快手
        if (this.mediaRecorder) {
            if (this.video === null) {
                // 无视频可以发布
                return
            }
            let that = this
            this.mediaRecorder.publishVideo({
                video: that.video, // 指定需要发布的视频片段，不指定则默认发布最后一次 start , stop 之间生成的视频
                callback: (error) => {
                    if (error) {
                        console.log(`发布录屏失败： ${JSON.stringify(error)}`)
                    } else {
                        console.log("发布录屏成功")
                        cb()
                    }
                }
            });
        }
    }

    /**查看关注官⽅帐号状态
    * errorCode:1 表示成功
    * errorMsg:错误信息
    * hasFollow:是否关注
    */
    checkFollowState() {
        kwaigame.checkFollowState({
            accountType: "CPServiceAccount",
            callback: (result: { errorCode: number, errorMsg: string, hasFollow: boolean }) => {
                console.log(JSON.stringify(result));
                this.ksError = result.errorMsg
            }
        })
    }

    /**打开官方账号 */
    openUserProfile() {
        kwaigame.openUserProfile({
            accountType: "CPServiceAccount",
            callback: (result) => {
                console.log(JSON.stringify(result));
            }
        })
    }

}
export const KS = kuaishou._instance