

declare interface GListViewParams {
    scrollview: cc.ScrollView;
    mask: cc.Node;
    content: cc.Node;
    itemTpl: cc.Node;
    direction?: GListViewDir;
    width?: number;
    height?: number;
    gapX?: number;
    gapY?: number;
    padingX?: number;
    padingY?: number;
    /** cell其实坐标偏差（横向X,众纵向Y） */
    startOffset?: number;
    /** 水平方向排版时，垂直方向上的行数 */
    row?: number;
    /** 垂直方向排版时，水平方向上的列数 */
    column?: number;
    /** 回调函数host */
    cbHost?: any;
    /** item更新setter */
    itemSetter: (item: any, data: any, index: number) => void;
    /** 回收时的回调 */
    recycleCb?: (item: any) => void;
    /**滚动中的回调 */
    scrollingCb?: () => void;
    /** item选中效果setter */
    selectSetter?: (item: any, data: any, is_select: boolean, index: number) => void;
    /** 子节点选中回调 */
    childClick?: (item: any, data: any, index: number) => void;
    /** 长按回调事件 */
    childLongTouch?: (item: any, data: any, index: number, times: number) => void;
    /** 滚动到尽头的回调 */
    scrollToEndCb?: () => void;
    /** append时自动滚动到尽头 */
    autoScrolling?: boolean;
    /** 自动适配 */
    isWidget?: boolean;
    /** 回调的时候传GChild, 否则传Node */
    isCbClass?: boolean;
    /** 首次长按生效时间 */
    childLongTouchFristTime?: number;
    /** 第二次开始长按生效时间 */
    childLongTouchUpdateTime?: number;
}

declare interface GListItem {
    x: number;
    y: number;
    data: any;
    node: cc.Node;
    isSelect: boolean;
}

interface ElementChangeParams {
    // x?: number;
    // y?: number;
    // width?: number;
    // height?: number;
    now?: boolean;
    coords?: cc.Vec2[];
    verts?: [cc.Vec2, cc.Vec2, cc.Vec2, cc.Vec2];
}

/**
 * for gmap;
 */
interface FuncElementChangeCallBack {
    (param: ElementChangeParams): void;
}

/**
 * for gviewbase
 */
interface NodeCallBack {
    (node: cc.Node): void;
}

interface FlashNodeCallBack {
    (node: cc.Node, animation: cc.Animation, chip: cc.AnimationClip): void;
}

interface AnimationChipCallBack {
    (chip: cc.AnimationClip): void;
}

interface AnimationClipsCallBack {
    (clips: cc.AnimationClip[]): void;
}

interface ShareCallBack {
    (isSuc: boolean): void;
}

/** 来源信息 */
interface FromInfo {
    isSticky?: boolean; // 是否被置顶(不同平台表示不同含义)

    /** 启动时附带的参数，正常情况时代表本端来源， 或者说上级玩家 */
    playerId?: string;
    openId?: string;
    channelId?: string;
    sceneId?: number;
    scene?: number; // 微信传过来的sceneid；
    fight?: string;
}


interface AnimationConfigure {
    /** path */
    path?: string;
    /** clip name */
    aniName: string;
    /** 前缀 */
    prefix: string;
    /** 数值位数 */
    numberFix: number;
    /** 起始数值索引 */
    minIdx?: number;
    /** 结束数值索引 */
    maxIdx?: number;

    speed?: number;
}

interface ProcessCallback<T> {
    (cur: number, asset: T, total: number, isComplete: boolean);
}

interface RichTouchCallBack {
    (event: cc.Event.EventTouch, args: string[], element: any): void;
}

interface PreLoadAsset {
    type: typeof cc.Asset;
    path: string
}


interface PayInfo {
    /**表id */
    cpBuyId: string;
    /**商品名称 */
    cpBuyName: string;
    /**购买数量 */
    buyCount: number;
    /**价格 */
    price: number;
    /**订单号 */
    orderNo: string;
    /**下单时间 */
    orderTime: number;
    userExt?: any;
    useBalanceCB?: any;
}

interface PayState {
    /** 是否可支付的值
     * 0或undefined:   不显示支付
     * 1 ：显示支付
     * 2 ：显示支付，点击时提示“iOS受政策影响不可支付"
     */
    state: number,
    /** 消息 */
    msg: string
}

// 静态表数据以及索引
declare interface WindowStaticInfos {
    /** 客户端本地化文本 */
    locales: string[];
    /** 所有静态表 */
    allFiles: string[];
    /** 第一次启动加载的静态表 */
    launchFiles: string[];
    /** 第二次加载的静态表 */
    noLoadFiles?: string[];
    /** 静态表加载状态 */
    loadStatus?: any;
    /** i18n配置 */
    clientI18ns?: string[];
    /** [列名base64,表名base64, 干扰字符串 */
    encrypt?: [string, string, string[]];
};

declare interface MergeStatics {
    __merges: boolean;
    __datas: cc.JsonAsset[];
}

declare var wdStatics: WindowStaticInfos;
declare var WD_DEBUG: boolean;

type AssetInfo = { type: { prototype: cc.Asset }, path: string };
