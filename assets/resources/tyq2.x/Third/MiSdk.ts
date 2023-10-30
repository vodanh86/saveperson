import TyqEventMgr from "../tyq-event-mgr";
import { tyqSDK } from "../tyq-sdk";


export default class MiSdk {

    private androidClass = "org/cocos2dx/javascript/mi/MiSdk";
    private static _instance: MiSdk = null;
    public static getInstance() {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    public static get ins() {
        return this.getInstance();
    }

    public onUserAgreed() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "onUserAgreed", "()V");
        } else {
            console.error("please run on android");
        }
    }
    public login() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.androidClass, "login", "()V");
        } else {
            console.error("please run on android");
        }
    }
    public onLoginSuccess(uid: string) {

        console.log("小米账号登录成功,uid:", uid);
    }
    public onLoginFail() {
        console.log("登录失败");
        this.login();
    }
    public onLoginCancel() {
        console.log("取消");
        this.login();
    }
}
window["MiSdk"] = MiSdk;
