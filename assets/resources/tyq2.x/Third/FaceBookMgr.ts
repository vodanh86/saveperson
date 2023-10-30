export default class FaceBookMgr {

    private static androidClass = "org/cocos2dx/javascript/FaceBookMgr";

    public static sendCustomEvent(eventName: string) {
        if (this.isAndroid()) {
            jsb.reflection.callStaticMethod(this.androidClass, "onUserAgreed", "(Ljava/lang/String;)V", eventName);
        } else {
            console.error("please run on android");
        }
    }

    private static isAndroid() {
        return CC_JSB && cc.sys.os == cc.sys.OS_ANDROID;
    }
    private static isIos() {
        return CC_JSB && cc.sys.os == cc.sys.OS_IOS;
    }
}