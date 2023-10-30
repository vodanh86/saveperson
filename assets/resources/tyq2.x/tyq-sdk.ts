// import { sys, Node, loader, Prefab, instantiate, randomRange, isValid, resources, assetManager, AssetManager, log } from "cc";

import TyqEventMgr from "./tyq-event-mgr";
import tyqSdkConfig from "./tyq-sdk-config";
import TyqViewMgr from "./tyq-view-mgr";
import tyqExtend from "./tyq_extend";
import { NetworkMgr } from "./weNetworkMgr";

/**游戏数据 */
export interface gameInfo {
    gameName: string,
    gameImg: string,
    gameTips: string,
    gameVideID: string,
    gameID: any
}
export enum EDartsType {
    grid = 1,
    interstitial,
    infoFlow,
    reward,

}
export enum EDartStatus {
    /**曝光 */
    exposure = 1,
    /**访问 */
    visit = 2,
    /**点击 */
    click = 3,
}
/**SDK 类 */
class tyqSdk {
    public static readonly _instance = new tyqSdk();

    /**开关对象合集 */
    private switch_info: any = {};
    /**总开关 1是开 0是关*/
    private master_switch: number = 0;
    /**用户唯一openID */
    private openid: string = ""
    /**游玩时间 */
    private _playTime: number = 0;
    /**观看视频时间 */
    private _videoTime: number = 0;

    //飞镖
    private reqDartAwardTime = 0;
    private dartDurTime = 30000;//飞镖请求最小间隔事件,防止重复请求
   private dartAwardFun: (config) => void = null;

    private _gameLevel: string = "";
    private item_openId = "tyq_item_openid";
    private item_watermark = "tyq_item_watermark_";
    private item_dartAwardConfig = "tyq_item_dartAward_config";
    private _watermark: string = "";
    private _onlineTime = 0;
    private _dartDatas = {};

    constructor() {

    }
    /**初始化SDK,获取开关 只需传成功回调，因为成功失败都会进入场景*/
    public init(success?: Function) {
        //以上代码是游玩统计
        // this.LaunchOptionsSync = Toutiao.LaunchOptionsSync();
        // if (tyqSdkConfig.webTest) {
        //     this.LaunchOptionsSync = {
        //         scene_id: "990001",
        //         query: {}
        //     }
        // }
        this._watermark = cc.sys.localStorage.getItem(this.item_watermark) || "";
        this.openid = this.initOpenId();
        var time = this.getTimeStamp(true);//获取到毫秒的时间戳，精确到毫秒
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: time,
            app_version: tyqSdkConfig.app_version,
        }
        NetworkMgr.xhrPost("api/v1/switch_info", info, (cb: any) => {
            console.log(cb);
            if (cb.data) {
                this.switch_info = cb.data.switch_info;
                this.master_switch = cb.data.master_switch;
                if (cb.data.ads_data) {
                    this._dartDatas = cb.data.ads_data;
                }
                // this.scene_id = cb.data.scene_id;
                // this.initMasterSwitch(cb.data.switch_v1, cb.data.switch_v2);
                // this.initAdUnitId(cb.data.dy_ad_id);
                // this.initGameList();
                // this.addLevel(true);
            }
            if (success) {
                success();
                // this.login();
                return;
            }
        }, () => {
            if (success) {
                success();
            }
        });

        //开始统计玩家停留时间
        this._onlineTime = this.getTimeStamp();
        cc.game.on(cc.game.EVENT_HIDE, () => {
            this.collectPlayeTime();
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            this._onlineTime = this.getTimeStamp();
            let nowTime = Date.now();
            if (nowTime - this.reqDartAwardTime >= this.dartDurTime) {
                this.reqDartAwardTime = Date.now();
                setTimeout(() => {
                    this.reqDartAward();
                }, 200);
            }
        })
    }
    /**
     * 登录接口
     * @returns 
     */
    public login() {
        if (!this.openid) {
            console.error("openId为空");
            return;
        }

        var time = this.getTimeStamp(true);//获取到毫秒的时间戳，精确到毫秒
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: time,
            openid: this.openid,
            watermark: this._watermark,
        }
        NetworkMgr.xhrPost("api/v1/login", info, (res: any) => {
            console.log(res);
            TyqEventMgr.ins.onLogin(this.openid);
            if (res.data) {
                this._watermark = encodeURIComponent(res.data.watermark);
                cc.sys.localStorage.setItem(this.item_watermark, this._watermark);
            }

        }, () => {
            console.error("登录失败,网络错误");
        });
    }
    /**
     * 实名认证接口
     * @param carId 
     * @param realName 
     * @param cb 
     */
    public verifyRealName(carId: string, realName: string, cb: Function) {
        var time = this.getTimeStamp(true);//获取到毫秒的时间戳，精确到毫秒
        let data = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: time,
            openid: this.openid,
            cardno: carId,
            name: realName
        }
        NetworkMgr.xhrPost("api/v1/idcard", data, cb);
    }


    /**直接获取开关值 */
    //mast  是否判断总开关
    public getSwitchValue(str: string): any {
        if (this.master_switch == 0) {
            return 0;
        }
        if (!this.switch_info[str]) {//不存在这个开关
            console.log(str + "开关不存在");
            return 0
        } else if (this.switch_info[str] == "0") {
            return 0;
        } else {
            return this.switch_info[str];
        }
    }
    /**
     * 概率开关值
     * @param str 
     * @returns 
     */
    public getConfigProbability(str: string) {
        let value = this.getSwitchValue(str);
        if (!value) {
            return false;
        }
        let rand = Math.random();
        if (rand < value) {
            return true;
        } else {
            return false;
        }
    }


    /**游戏开始时调用 
     * @param level 关卡 如果是特殊关卡，传特殊关卡名称即可
     * @param inGameFun 真正开始游戏的方法
    */
    public startGame(level: any, inGameFun?: Function) {
        // this.outMain();
        // if (this.Physical <= 0 && this.getSwitchByName("mianPhysical")) {
        //     this.showPhysicalPanel();
        //     return;
        // }
        // if (typeof (level) == "number") {
        //     this._gameLevel = level.toString();
        // } else {
        //     this._gameLevel = level;
        // }
        this._gameLevel = level;
        this.collectLevelInfo();
        TyqEventMgr.getInstance().onStartGame(level);
        // this.hideMain();
        // if (this.tyq_exit) {
        //     this.tyq_exit.active = false;
        // }
        // this.Physical = -1;
        // //游戏开始调用狂点宝箱  这里要区分套路版
        // if (!this.getSwitchInfoByName("crazyBox", this.levelCunt)) {
        //     inGameFun();
        //     this.screencap();
        //     return;
        // }
        // this.loadPrefab("prefab/tyq_crazyBox", (node: cc.Node) => {
        //     if (this.canvasNode) {
        //         node.setParent(this.canvasNode);
        //         node.getComponent(tyq_crazyBox)!.inint(() => {
        //             inGameFun();
        //             this.screencap();
        //         });
        //     }
        // })
    }


    /**
     * 游戏结束时调用
     * @param gameType 过关状态，传win或者lose字符串，不是通关的游戏也传win
     * @param nextFun 进入下一关（或者结算界面）的方法传进来
     */
    public endGame(isWin: boolean, nextFun?: Function) {
        // this.stopScreencap();
        this.collectLevelInfo(isWin ? 2 : 3);
        TyqEventMgr.getInstance().onEndGame(isWin);
        // if (this.tyq_exit) {
        //     this.tyq_exit.active = true;
        // }
        // if (!this.getSwitchInfoByName("endGameAD", this.levelCunt)) {
        //     // this.loadPrefab("prefab/tyq_share", (node: cc.Node) => {
        //     //     node.setParent(this.canvasNode);
        //     //     node.getComponent(tyq_share)!.init(() => {
        //     //         this.showLuckBox(gameType, nextFun);
        //     //     })
        //     // });
        // } else {
        //     this.showVideoAD("结束视频拉取", () => {
        //         // this.loadPrefab("prefab/tyq_share", (node: cc.Node) => {
        //         //     node.setParent(this.canvasNode);
        //         //     node.getComponent(tyq_share)!.init(() => {
        //         //         this.showLuckBox(gameType, nextFun);
        //         //     })
        //         // })
        //     }, () => {
        //         // this.loadPrefab("prefab/tyq_share", (node: cc.Node) => {
        //         //     node.setParent(this.canvasNode);
        //         //     node.getComponent(tyq_share)!.init(() => {
        //         //         this.showLuckBox(gameType, nextFun);
        //         //     })
        //         // })
        //     });
        // }
        // if (gameType == "win") {
        //     this.addLevel();
        // }
    }


    /**
     * 收集用户点击事件
     * @param event 时间名称
     */
    public collectClickEvent(event: string) {
        if (!this.openid) {
            console.error("没有openid");
            return;
        }
        var time = this.getTimeStamp(true);
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: time,
            openid: this.openid,
            event_id: event,
            watermark: this._watermark,
        }
        NetworkMgr.xhrPost("api/v1/collect_click_event", info);
    }
    /**收集用户玩游戏停留时间 */
    private collectPlayeTime() {
        if (!this.openid) {
            console.error("没有openid");
            return;
        }

        var nowTime = this.getTimeStamp();
        let elapsed = nowTime - this._onlineTime;
        console.log("上传停留", elapsed);
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: this.getTimeStamp(true),
            openid: this.openid,
            duration_time: elapsed,
            watermark: this._watermark,
        }
        NetworkMgr.xhrPost("api/v1/collect_open_game_play_time", info);
    }
    /**
     * 收集广告视频行为(已弃用)
     * @param status 广告状态。1 拉取成功（视频请求pv） 2 广告展示(视频曝光pv) 3 视频完整播放 4 视频中途关掉（这个要上传play_time）
     */
    public collectAdAction(status: number) {
        return;
        // if (!this.openid) return;
        // var time = this.getTimeStamp(true);
        // let curTime = Number(time);
        // if (status == 2) {//展示成功开始计算时间
        //     this._videoTime = curTime;
        // } else if (status == 3) {//播放完整清楚时间
        //     this._videoTime = 0;
        // } else if (status == 4) {//中途关掉
        //     this._videoTime = curTime - this._videoTime;
        // }
        // let info = {
        //     appid: tyqSdkConfig.appId,
        //     nonce_str: this.randomStr(),
        //     time_stamp: time,
        //     openid: this.openid,
        //     status: status,
        //     play_time: this._videoTime,
        // }
        // NetworkMgr.xhrPost("api/v1/collect_ad_action", info);
    }

    /**随机字符串*/
    private randomStr(strLen: number = 32) {
        let len = strLen;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        let maxPos = $chars.length;
        let pwd = '';
        for (let idx = 0; idx < len; idx++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    /**openID初始化 */
    private initOpenId(): string {
        let isNew = false;
        let openId = cc.sys.localStorage.getItem(this.item_openId);
        if (!openId) {
            isNew = true;
            openId = this.randOpenid();
            cc.sys.localStorage.setItem(this.item_openId, openId);
            TyqEventMgr.ins.onRegister(openId);
        }
        console.log("openid=", openId);

        return openId;
    }
    private randOpenid() {
        // let openId = "";
        // var data = new Date();
        // const curTime = data.getFullYear().toString() + (data.getMonth() + 1).toString() + data.getDate().toString()//精确到日
        // let Hours = data.getHours().toString();
        // let Min = data.getMinutes().toString();
        // let Second = data.getSeconds().toString();
        // if (Hours.length == 1) {
        //     Hours = "0" + Hours;
        // }
        // if (Min.length == 1) {
        //     Min = "0" + Min;
        // }
        // if (Second.length == 1) {
        //     Second = "0" + Second;
        // }
        // const randStr = this.randomStr(19);
        // openId = "tyq" + curTime + Hours + Min + Second + randStr;
        // return openId;
        var s = [], hexDigits = "0123456789abcdef";
        for (var i = 0; i < 40; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = s[28] = "-";
        return s.join("");
    }
    /**
     * 收集关卡游玩信息
     * @param stata 胜利或者失败
     */
    private collectLevelInfo(stata?: number) {
        if (!this.openid) return;
        var time = this.getTimeStamp(true);
        let curTime = this.getTimeStamp(false);
        if (stata) {//如果有状态 要计算游戏时间
            var play_time = curTime - this._playTime;
            this._playTime = 0;
        } else {
            var play_time = 0;
            this._playTime = curTime;
        }
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: time,
            openid: this.openid,
            game_level: this._gameLevel,
            status: stata ? stata : 1,
            play_time: play_time,
            watermark: this._watermark,
        }
        NetworkMgr.xhrPost("api/v1/collect_user_play_game_level", info);
    }


    /**
     * 获取时间戳
     * @param second 传true 会返回精确到秒的时间戳 ，默认返回精确到毫秒的时间戳
     * @returns 
     */
    private getTimeStamp(isSecond = false) {
        let time = Date.now();
        if (isSecond) {
            time = Math.floor(time / 1000);
        }
        return time;
    }
    /**
     * 发送广告事件(曝光点击等)
     * @param ads_id 
     * @param status 
     * @returns 
     */
    public sendDartAdStatus(ads_id, status: EDartStatus) {
        if (!ads_id) {
            console.error("没有ads_id");
            return;
        }
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: this.getTimeStamp(true),
            openid: this.openid,
            ads_id: ads_id,
            status: status,
        }
        NetworkMgr.xhrPost("api/v1/ads_collect_datas", info);
    }

    /**
     * 根据类型获取飞镖广告
     * @param type 
     * @returns 
     */

    public getDartAdByType(type) {
        let dartDatas = this._dartDatas[type];
        if (dartDatas && dartDatas.length > 0) {
            return dartDatas[Math.floor(Math.random() * dartDatas.length)];
        }
        return null;
    }

    //上报数据给巨量引擎
    public sendToAppLog() {
        // if (!ads_id) {
        //     console.error("没有ads_id");
        //     return;
        // }
        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: this.getTimeStamp(true),
            openid: this.openid,
            models: tyqExtend.getPhoneModel(),
            oaid: tyqExtend.getOAID(),
        }
        console.log("发送巨量激活", JSON.stringify(info));
        NetworkMgr.xhrPost("china_app_game_sdk/api/v1/douyin_monitor_act", info, (res) => {

            console.log("巨量激活响应", JSON.stringify(res));
        });
    }
    //请求推广奖励(飞镖下载安装激活的奖励)
    private reqDartAward() {
        console.log("请求非标广告奖励");

        let info = {
            appid: tyqSdkConfig.appId,
            nonce_str: this.randomStr(),
            time_stamp: this.getTimeStamp(true),
            openid: this.openid,
        }
        NetworkMgr.xhrPost("api/v1/get_rewards", info, (res) => {
            console.log(res.errmsg)
            if (res.errcode == 0) {
                // isActive = true;

                if (this.dartAwardFun && typeof this.dartAwardFun == "function") {
                    let config = cc.sys.localStorage.getItem(this.item_dartAwardConfig);
                    this.dartAwardFun(JSON.parse(config));
                }
            }
        });
    }
    //设置飞镖下载奖励
    public setReqAwardFun(fun: (config) => void) {
        this.dartAwardFun = fun;
        this.reqDartAward();
    }
    //点击飞镖广告 下载/查看 事件
    public onClickDart(dartAd, config) {
        this.sendDartAdStatus(dartAd.ads_id, EDartStatus.click);

        if (config) {
            cc.sys.localStorage.setItem(this.item_dartAwardConfig, JSON.stringify(config));
        }

        if (dartAd.types == 1) {
            //apk
            tyqExtend.dartClick(dartAd.download_url, dartAd.appid, this.openid, dartAd.ads_id);
        } else if (dartAd.types == 2) {
            //h5
            let extra = `&openid=${this.openid}&ads_id=${dartAd.ads_id}`;
            cc.sys.openURL(dartAd.download_url + extra);
        }
    }
    public loadDartAd(type: EDartsType, parent: cc.Node, config, pos: cc.Vec2 = cc.v2()) {
        TyqViewMgr.showDartAd(type, parent, config, pos);


    }
    //直接显示落地页(用来替代普通激励视频)
    public loadLandPage(cb: Function) {
        let dartData = tyqSDK.getDartAdByType(EDartsType.reward);
        if (dartData) {
            TyqViewMgr.showLandPage(dartData, null, cb);
            return true;
        }
        return false;
    }
}
export const tyqSDK = tyqSdk._instance;
(<any>window)["TyqSdk"] = tyqSdk._instance;
