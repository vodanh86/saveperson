declare type StringOrNumber = string | number;

declare function md5(s: any): string;

declare module cc {
    declare interface Node {
        getChildComByName<T extends Component>(name: string, type: { prototype: T }): T;
        getChildByList(path: string): cc.Node;
        getChildComByList<T extends cc.Component>(path: string, type: { prototype: T }): T;
        logPath(): string;
        getMinPostion(): cc.Vec2;
        getMaxPosition(): cc.Vec2;
        worldActive(): boolean;
        getUserData<T>(): T;
        setUserData<T>(value: T);
        switchParent(newParent: cc.Node): void;
        snapshotNode(clluingMask?: number, coustomSize?: cc.Size): cc.Node;
        snapshotCamera(clluingMask?: number, coustomSize?: cc.Size): cc.Camera;
    }

    export class RenderFlow {
        static FLAG_DONOTHING: number;
        static FLAG_BREAK_FLOW: number;
        static FLAG_LOCAL_TRANSFORM: number;
        static FLAG_WORLD_TRANSFORM: number;
        static FLAG_TRANSFORM: number;
        static FLAG_OPACITY: number;
        static FLAG_COLOR: number;
        static FLAG_OPACITY_COLOR: number;
        static FLAG_UPDATE_RENDER_DATA: number;
        static FLAG_RENDER: number;
        static FLAG_CHILDREN: number;
        static FLAG_POST_RENDER: number;
        static FLAG_FINAL: number;
    }

    declare module Component {
        declare interface EventHandler {
            emitWithBoolResult(params): boolean;
        }

    }

    declare interface Component {
        forcibleRender(renderFunc: any): void;
    }

    declare interface Button {
        public clickAudio: string;
        _onTouchEnded(event: cc.Event.EventTouch): void;
    }

    // declare interface Label {
    //     font: cc.Font;
    // }

    declare module Button {
        export let comAudio: string;
    }


    declare interface Sprite {
        setBlend(src: number, dst: number): void;
    }

    declare function warnID(id);

    declare class Pomelo {
        /**
         * 这是往往是客户端的第一次调用，params中应该指出要连接的服务器的ip和端口号，cb会在连接成功后进行回调;
         * @param params 连接参数
         * @param cb 连接成功回调
         */
        init(params: object): void;
        /**
         * 请求服务，route为服务端的路由，格式为"..", msg为请求的内容，cb会响应回来后的回调;
         * @param route 路由
         * @param msg 请求内容
         * @param cb 响应回调
         */
        request(route: string, msg: object, cb: any): void;
        request(route: string, cb: any);
        /**
         * 发送notify，不需要服务器回响应的，因此没有对响应的回调，其他参数含义同request;
         * @param route 路由
         * @param msg 消息
         */
        notify(route: string, msg: object): void;
        /**
         * 这个是从EventEmmiter继承过来的方法，用来对服务端的推送作出响应的。route会用户自定义的，格式一般为"onXXX";
         * @param route 路由
         * @param cb 回调
         */
        on(route: string, cb: any): void;
        /**
         * 这个是pomelo主动断开连接的方法;
         */
        disconnect(forceCb?: any): void;
    }

    export type seedrandomStateType = boolean | (() => prng);

    interface prng {
        new(seed?: string, options?: seedRandomOptions, callback?: any): prng;
        (): number;
        quick(): number;
        int32(): number;
        double(): number;
        state(): () => prng;
    }

    interface seedrandom_prng {
        (seed?: string, options?: seedRandomOptions, callback?: any): prng;
        alea: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        xor128: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        tychei: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        xorwow: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        xor4096: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        xorshift7: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
        quick: (seed?: string, options?: seedRandomOptions, callback?: seedrandomCallback) => prng;
    }

    interface seedrandomCallback {
        (prng?: prng, shortseed?: string, global?: boolean, state?: seedrandomStateType): prng;
    }

    interface seedRandomOptions {
        entropy?: boolean;
        'global'?: boolean;
        state?: seedrandomStateType;
        pass?: seedrandomCallback;
    }

    interface Action {
        endCallback(callback): Action & FiniteTimeAction;
        __endCallBack: any;
    }


}

declare module dragonBones {
    class AnimationInfo {
        name: string;
        duration: number;
        bone: Array;
        ffd: Array;
        slot: Array;
    }
    declare interface ArmatureDisplay {
        public getAnimationInfo(armature: string, aniName: string): AnimationInfo
    }
}

declare module sp {
    declare interface Skeleton {
        public getAnimationInfo(aniName: string): spine.Andimation;
        public attachUtil: sp.AttachUtil;
    }

}

declare var pomelo: cc.Pomelo;

declare var seedrandom: cc.seedrandom_prng;

declare type prng = cc.prng;

declare var Editor: Editor;

/** 模拟生命周期 */
declare interface IComLike {
    start?: { (): void };
    update?: { (dt: number): void };
    onEnable?: { (): void };
    onDisable?: { (): void };
    lateUpdate?: { (): void };
    onDestroy?: { (): void };
}

/** 定义管理器接口 */
declare interface ILogicImpl {
    initGame?: { (): void };
    loginOut?: { (): void };
}


abstract class GDataRaw {
}

declare interface UserModel {
    $itemLogs?: [number, number, number, number][]; /** [id, 类型， 增量， 总量] */
    $fullFields: string[]; //  差量字段，需要全量更新的标识
}

declare interface ILogData {
    slog?: string;
    logId?: number;
    key?: number;
}

declare interface JXResponse<TDATA extends Resp> {
    code: number;
    data: TDATA;
    now: number;
    req?: Msg;
    ext?: any;
    /** 消息来源的路由 */
    __route__: string;
    notify: boolean;
}

declare interface Msg {
    __route__: string;//服务端使用
    __times__?: number[];
    token?: string;
    ext?: any;
    unLog?: boolean
}

abstract class IRankPage<ITEM> extends Resp {
    paged: IPaged<ITEM>;
    /** rank: 第一名以0开始，无名次时 -1 */
    mine: IMyRank
}

interface IRankLiteItem {
    user: IUserLite;
    value: number;
    extra?: any;
    rank?: number;
}

interface IMyRank {
    rank: number,
    score: number,
    extra?: any,
    value?: number,
    _list?: IMyRank[],
}


declare class I18nManager {
    /** 是否已经初始化完成 */
    public inited: boolean;
    /** 当前语言 */
    public curLang: string;
    /** 当前字体 */
    public ttf: cc.TTFFont;
    /** 本地化加载  */
    public initLocalesHandler(handler: { (lang: string, callBack: { (data: any): void }): void });
    /** 本地化字体加载 */
    public initLocalesTTFHandler(handler: { (lang: string, callBack: { (data: any): void }): void }, ttfUuids: any);
    /** 初始化多语言 */
    public init(lang: string, endCallBack: function);
    /**
     * 添加语料
     * @param data 要添加的语料
     * @param prefix 语料入库前缀
     */
    public extendText(data: any, prefix?: string);
    /**
     * 替换语料
     * @param data 要替换的语料
     */
    public replaceText(data: any);
    /** 清除语料 */
    public clearText();
    /** 获取多语言文本 */
    public t(...args: any[]);

    /**
     * 获取i18n资源路径
     * @param subPath 相对目录
     */
    public fullPath(subPath: string);

    // editor function 
    public updateSceneRenderers();
}


declare var i18n: I18nManager;

declare var ClipperLib: any;



