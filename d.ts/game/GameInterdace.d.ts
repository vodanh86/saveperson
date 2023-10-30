declare interface SceneArg {
    level: number,
}
/** 战场UI窗口参数 */
declare interface ArgsLineViewCtrl<T> {
    /** 场景ID */
    sceneId: number;
    /** 场景特有参数 */
    args?: T;
    /** 关闭按钮回调 */
    colseCb?: any;
    unClosk?: boolean
    /** 强制不关闭界面 */
}

