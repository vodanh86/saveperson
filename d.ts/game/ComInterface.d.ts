interface ProgressCallback<T> {
    (completedCount: number, totalCount: number, item?: T): void;
}
interface CompleteCallback<T> {
    (error?: Error, resource?: T): void;
}
interface RPointValue {
    mask: number;
    value: boolean;
    forceStop?: boolean;
}

interface GameTimer {
    delta: number;
    checkTime: number;
    outTimeHandler: { (dt: number): void };
}

interface GameTimeClock {
    clockTime: number;//闹钟时间, 根据刷新周期来计算
    lastActivedTime; // number;
    actived: boolean; // 是否激活
    clockHandler: { (info: GameTimeClock): void };
    type: number; // 刷新周期。（时: 分，天： 时，周：时，月： 时）
}

interface RPointNode {
    mask: number[];
    subPath: string;
    posType?: number;
    effectType?: number;
    cb?: Function;
}
interface TimerTaskInfo {
    start: number;
    end: number;
    update?: any;
    endcb?: any;
    tickTime?: number;
    // idx: number;
    // taskId: string;
    // isArmy?: boolean;
}

interface TimerTickInfo {
    time: number;
    update?: any;
    endcb?: any;
    tickTime?: number;
}


interface PreventClicksValue {
    target: cc.Node,
    time: number,
    startCb?: any,
    endCb?: any
}

interface ItemCostResult {
    /** 将消耗条件传回 */
    // condition?: ItemCostCondition;
    /** 是否满足消耗 */
    enough?: boolean;
    /** 当前数量*/
    cur?: number;
    /** 需要数量 */
    need?: number;
    /** 消耗物品的静态表 */
    raw?: SItemRaw;

    tip?: string;

    /** 多次消耗 */
    ext?: {
        /** 实际满足次数 */
        enoughTimes: number,
        /** 实际满足消耗 */
        enoughCost: number,
    }
}

interface rankInfo {
    rankLv: number,
    rankNum: number,
}

declare type SItemRaw = SItemDataRaw & SEquipDataRaw;
declare type FrameAniConfigure = [string /** file */, string /** name */, number /** fix */, number /** cout */, number /** isadd */, number /** scale */, number /** 透明度 */];
declare type EffectConfigure = { root: string, effect: FrameAniConfigure, name: string, loop?: boolean, offset?: cc.Vec2, anchor?: cc.Vec2, anchOffset?: cc.Vec2 };