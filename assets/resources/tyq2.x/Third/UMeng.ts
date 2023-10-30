


export default class UMeng {
    private className = "org/cocos2dx/javascript/UMeng";
    private static instance: UMeng = null;
    public static getInstance(): UMeng {
        if (this.instance == null) {
            this.instance = new this();
        }
        return this.instance;
    }
    public onAgreeUse() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.className, "onAgreeUser", "()V");
        }
    }
    public uploadEvent(event: string) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.className, "onEventObject", "(Ljava/lang/String;)V", event);
        }
    }
    public login(openId) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.className, "login", "(Ljava/lang/String;)V", openId);
        }
    }
    public register(id) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.className, "register", "(Ljava/lang/String;)V", id);
        }
    }
    private logOut() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.className, "logOut", "()V");
        }
    }
}
