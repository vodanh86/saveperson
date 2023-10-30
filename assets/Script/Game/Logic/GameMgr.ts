import SdkMgr from "../../../resources/tyq2.x/SdkMgr";
import { JXDef } from "../../conventions/JXCommon";
import { ObjectWrap } from "../../Core/FrameEx/ES5Ex";
import GTimerMgr from "../../Core/Manager/GTimerMgr";
import { RedPointLogicMgr } from "../../Core/Manager/RedPointLogicMgr";
import { UIMgr } from "../../Core/Manager/UIMgr";
import { CHECK_TIME, LoadingType } from "../Common/Define";
import { VIEW_ID } from "../Common/UI";
import { LUserData } from "../Data/Locals/LUserData";
import { SLineMeet } from "../Data/Static/SLineMeet";
import { SLineRiddle } from "../Data/Static/SLineRiddle";
import { SLineSave } from "../Data/Static/SLineSave";
import { SSystemConfig } from "../Data/Static/SSystemConfig";
import { SThemeData } from "../Data/Static/SThemeData";
import JumpToMgr from "../Views/ViewUtil/JumpUtil";
import { GCtrl } from './../../Core/GCtrl';
import { DataPool } from './../../Core/Manager/DataPool';
import MapMgr from "./MapMgr";





/**
 * 1. 项目调试环境     WD_DEBUG     构建中wdDebug = true
 * 2. 全局控制器       jx               CC_DEV|| CC_DEBUG , 且 WD_DEBUG
 * 3. 物品代码                         CC_DEV || CC_DEBUG , 且 WD_DEBUG;
 * 4. GM指令                          CC_DEV || CC_DEBUG
 * 5. 模拟充值                         GM指令开启，对应SDK没有重载支付接口
 * 6. 充值入口                         IOS不可支付(以及去除)，其他的通过GameEnv参数决定
 * 7. 分享接口                         根据SDK提供的canSdkShare函数的返回值决定
 */

export default class GameMgr extends ObjectWrap {
    protected static _ins: GameMgr;
    public static ins(): GameMgr {
        if (!this._ins) {
            this._ins = new GameMgr;
        }
        return this._ins;
    }
    /** 热数据 */

    /** 静态数据 */
    public static systemConfig: SSystemConfig = null;
    public static lineSave: SLineSave = null;
    public static lineRiddle: SLineRiddle = null;
    public static lineMeet: SLineMeet = null;
    public static themeData: SThemeData = null;
    /** 本地数据 */
    public static luserData: LUserData = null;
    /** 引导管理器 */
    /** 管理器 */
    public static mapMgr: MapMgr = null;
    /** 跳转管理器 */
    public static jumpToMgr: JumpToMgr = null
    public static sdkMgr: SdkMgr = null;

    /** UI管理器 */
    public static uiMgr = UIMgr;
    public static redMgr: RedPointLogicMgr = null;
    /**当前渠道 */
    /** 时间调度容器 */
    protected _timeCounters: GameTimer[] = [];
    /** 定时闹钟管理器 */
    protected _timeColocks: GameTimeClock[] = [];
    protected _timeIndex: number;
    /** 耗时任务去重（如果短时间内出现同一个任务则，不发送） */
    protected _lastEndTaskId: string = null;
    /** 军队任务去重（如果端时间内出现同一个任务则不发送 */
    public lastEndArmyTaskId: string = null;

    ///////////////////////////////////////////////Init Functions////////////////////////////////////////////////////////////////////////////
    // 加载i18n客户端表格数据
    protected static __STATIC_CONFIG_INIT() {
        window.wdStatics = {
            locales: [],
            launchFiles: [],
            allFiles: [
                "systemConfig", "lineSave", "lineRiddle", "themeData", "lineMeet"
            ]
        };
        window.wdStatics.locales = window.wdStatics.locales.map((v, k) => "" + v);
        window.wdStatics.launchFiles = window.wdStatics.launchFiles.map((v, k) => "" + v);
        window.wdStatics.allFiles = window.wdStatics.allFiles.map((v, k) => "" + v);
        window.wdStatics.loadStatus = window.wdStatics.loadStatus || {};
    }

    /** 初始化客户端登陆的时候需要的静态数据 */
    public static initLoginStatic(progress: ProgressCallback<any>, callBack: CompleteCallback<any>) {
        this.__STATIC_CONFIG_INIT();
        let onLoadEnd = () => {
            callBack();
        }

        let fileNames = window.wdStatics.launchFiles;
        DataPool.ins().loadRTStatics(fileNames, (fileName: string, cur: number, total: number) => {
            window.wdStatics.loadStatus[fileName] = true;
            progress && progress(cur, fileNames.length);
        }, () => onLoadEnd());
    }

    // 初始化客户端登陆的时候需要的运热数据
    public static onInitLoginRunTime() {

    }

    // 通用结束接口
    protected static _commonStaticsLoadEnd() {
        this.systemConfig = DataPool.ins().getStatic(SSystemConfig);
        this.lineRiddle = DataPool.ins().getStatic(SLineRiddle);
        this.lineMeet = DataPool.ins().getStatic(SLineMeet);
        this.lineSave = DataPool.ins().getStatic(SLineSave);
        this.themeData = DataPool.ins().getStatic(SThemeData);
    }

    /** 初始化 */
    public static initFristGameStatics(progress: ProgressCallback<any>, callBack: CompleteCallback<any>) {
        DataPool.ins().loadRTStatics(window.wdStatics.allFiles, (fileName: string, cur: number, total: number) => {
            window.wdStatics.loadStatus[fileName] = true;
            progress && progress(cur, window.wdStatics.allFiles.length);
        }, () => {
            this._commonStaticsLoadEnd();
            GameMgr.initLocalData();
            GameMgr.initGameRunTime();
            callBack();
        })
    }



    // public static initAllStatics(progress: ProgressCallback<any>, callBack: CompleteCallback<any>) {
    //     this.__STATIC_CONFIG_INIT();
    //     let table = window.wdStatics.allFiles;
    //     for (let i = 0; i < window.wdStatics.launchFiles.length; i++) {
    //         if (table.indexOf(window.wdStatics.launchFiles[i]) != INVALID_VALUE) {
    //             continue;
    //         }
    //         table.push(...window.wdStatics.launchFiles);
    //     }

    //     DataPool.ins().loadRTStatics(table, (fileName: string, cur: number, total: number) => {
    //         window.wdStatics.loadStatus[fileName] = true;
    //         progress && progress(cur, table.length);
    //     }, () => {
    //         this._commonStaticsLoadEnd();
    //         GameMgr.initLocalData();
    //         GameMgr.initGameRunTime();
    //         callBack();
    //     })
    // }

    /** 初始化客户端游戏进行时需要的热数据 */
    public static initGameRunTime() {
    }

    /**初始化本地数据 */
    public static initLocalData() {
        this.luserData = DataPool.ins().getLocal(LUserData);
    }

    /** 初始化逻辑管理器 */
    public static initLogicManager() {
        this.mapMgr = MapMgr.ins;
        this.redMgr = RedPointLogicMgr.ins();
        this.sdkMgr = SdkMgr.ins;
    }

    /**初始化底层工具管理 */
    public static initSimulator() {
        this.jumpToMgr = JumpToMgr.ins;
    }

    public initReConnectEvent() {

    }

    public initGame() {
        GCtrl.ES.on(GCtrl.GTimerSecondEventMsg, this, this.onTimeCalculat.bind(this));
        let now = GCtrl.now;
        this._timeCounters = [
            { delta: 0, checkTime: CHECK_TIME.TIME_CLOCK_CHECK, outTimeHandler: GameMgr.redMgr.timingCheck.bind(GameMgr.redMgr) }
        ];
        GTimerMgr.ins().start();
        // 二级
        GameMgr.jumpToMgr.initGame();
        GameMgr.sdkMgr.initGame();
        // 三级: 综合管理器要放到其他功能模块的管理器后面，因为会有引用
        GameMgr.redMgr.initGame();
    }

    public onReconnect() {

    }

    /**清除热数据*/
    public static clearRunTime() {
        DataPool.ins().clearRunTimes();
    }

    /**清除本地数据 */
    public static clearLoacalData() {
        DataPool.ins().clearLocals();
    }

    public restart() {
        // 注销事件
        GCtrl.ES.off(this);
        // 注销事件
        GCtrl.ES.off(this);
        GameMgr.jumpToMgr.loginOut();
        GameMgr.sdkMgr.loginOut();
        GameMgr.redMgr.loginOut();
        for (const key in JXDef.LOCAL_KEY) {
            cc.sys.localStorage.removeItem(JXDef.LOCAL_KEY[key]);
        }
        GameMgr.clearRunTime();
        GameMgr.clearLoacalData();
        let GuideRoot = GameMgr.uiMgr.uiRoot.parent.getChildByName("GudieRoot");
        if (GuideRoot) { GuideRoot.destroy() }
        let topPannel = GameMgr.uiMgr.uiRoot.getChildByName("TopUiItem");
        if (topPannel) {
            topPannel.destroy();
        }
        // 移除所有界面
        UIMgr.removeAllActiveWin();
        UIMgr.showWin(VIEW_ID.load, LoadingType.AppStart);
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    public onTimeCalculat() {
        this._timeCounters.forEach(e => e.delta += GCtrl.deltaSecondTime);
        // 性能优化，保证一帧最多处理一个事件
        this._timeIndex = this._timeIndex || 0;
        if (this._timeIndex >= this._timeCounters.length) {
            // 一次轮回清理一起当前记录的耗时任务
            this._lastEndTaskId = null;
            this._timeIndex = 0;
        }

        let timer = this._timeCounters[this._timeIndex];
        if (timer.delta >= timer.checkTime) {
            timer.outTimeHandler(timer.delta);
            timer.delta = 0;
        }
        this._timeIndex++;
    }


}

