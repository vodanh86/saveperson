import { INVALID_STRING_VALUE, INVALID_VALUE } from './../../Core/CoreDefine';

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
}

/**
 * 红点枚举
 * 客户端红点从 300开始
 */

export enum RPointMask {
    /**客户端红点起始*/
    RPM_Client = 300,

}

/** 线性状态 */
export enum LinearState {
    /** 已通过 */
    Pass,
    /** 当前 */
    Now,
    /** 未出现 */
    Future,
}

/** 加载类型枚举 */
export enum LoadingType {
    AppStart,
    PloatScene,
    GameScene,
    InitRole,
    BattleScene,
    Simulator,
}

/**排序 */
export enum CompareEnum {
    CEQual = 0,
    CGreater = -1,
    CLess = 1,
}

/** 弹窗提示类型 */
export enum ITEMTYPE {
    /**金币 */
    COIN,
    /**体力 */
    PY,
}

/**段位 */
export enum RANKLV {
    RANKLV0,
    /**青铜 */
    RANKLV1,
    /**白银 */
    RANKLV2,
    /**黄金 */
    RANKLV3,
    /**钻石 */
    RANKLV4,
    /**星耀 */
    RANKLV5,
    /**大师 */
    RANKLV6,
    /**王者 */
    RANKLV7,
}


/** 弹窗提示类型 */
export enum ToastType {
    Null,
    /** 游戏提示 */
    WarnTip,
    End,
}

/**战斗场景 */
export enum PART_BTL_SCENE {
    NONE,
    /**解救 */
    SAVE = 1,
    /** 解密 */
    DECODE = 2,
    /**相遇 */
    MEET = 3,
}

export enum PhysiclaType {
    buchong,
    wuxian
}

/**打点点 */
export const PointInfo = {

}


export const CHECK_TIME = {
    TIME_CLOCK_CHECK: 10, // (s)
}

/**
 * 红点动效类型
 */
export enum RedpointEffect {
    /**闪烁 */
    BLING,
    /**特效 */
    RUNNING,
    /**感叹号红点 */
    REDPOINT,
}







//#region 
export const CMsg = {
    client: {

        view: {
        },
        fight: {
            itemCrash: "CMsg.client.fight.ItemCrash",
            lineEnd: "CMsg.client.fight.lineEnd",
        }
    },
    rPoint: { // 红点模块
        valueSetting: "CMsg.rPoint.valueSetting",
        viewSetting: "CMsg.rPoint.viewSetting",
    },
    data: {


    },
    unlock: {

    },
}
//#endregion

/** Key format */
export const KF = {

    genItemKey(id: number, type: number): string {
        return id + '_' + type
    },
    deItemKey(str: string): [number, number] {
        if (!str || str == INVALID_STRING_VALUE) return [INVALID_VALUE, INVALID_VALUE];
        let strs = str.split('_');
        return [parseInt(strs[0]), parseInt(strs[1])];
    },

    getLogKey(main: number, sub: number): number {
        return main * 10000 + sub;
    },
    deLogKey(key: number): [number, number] {
        return [Math.floor(key / 10000), key % 10000];
    },

    posDecode: function (str: string): cc.Vec2 {
        if (!str || str == INVALID_STRING_VALUE) return cc.Vec2.ZERO;
        let strs = str.split('_');
        if (strs.length != 2) {
            cc.error('army id format be error! ');
            return null;
        }
        return cc.v2(parseInt(strs[0]), parseInt(strs[1]));
    },

    posEncode: function (pos: cc.Vec2): string {
        return pos.x + '_' + pos.y;
    },


    spliteArrays<T>(src: T[], num: number): T[][] {
        let totalSize = src.length;
        let res = [];
        let item = [];
        for (let i = 0; i < totalSize; i++) {
            if (!item) item = [];
            item.push(src[i]);
            if (i == totalSize - 1) {
                res.push(item);
            }
            else if (item.length == num) {
                res.push(item);
                item = null;
            }
        }
        return res;
    },
}
