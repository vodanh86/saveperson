export default class TianYun {

    static getInstance() {

        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    static _instance: TianYun = null;

    constructor() {

    }

    private _AndroidClass = "org/cocos2dx/javascript/TianYun";
    private _IosClass = "";
    public sendToTAQ(type: number = 1) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._AndroidClass, "sendToTAQ", "(I)V", type);
        }
    }
    public event(event_id: string) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._AndroidClass, "event", "(Ljava/lang/String;)V", event_id);
        }
    }

    public isShowIllegal() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod(this._AndroidClass, "isShowIllegal", "()Z");
        }
    }
    public startGame() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._AndroidClass, "startGame", "()V");
        }
    }
    public endGame(isWin: boolean) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._AndroidClass, "endGame", "(Z)V", isWin);
        }
    }
    public onRewardedVideoAdPlayStart() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._AndroidClass, "onRewardedVideoAdPlayStart", "()V");
        }
    }
}
