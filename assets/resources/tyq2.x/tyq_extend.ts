//额外一些方法

export default class tyqExtend {


    public static getOAID() {
        let oaid = "";
        if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
            oaid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/TyqHelper", "getOAID", "()Ljava/lang/String;");
        }
        return oaid;
    }
    public static getPhoneModel() {
        let model = "";
        if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
            model = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/TyqHelper", "getPhoneModel", "()Ljava/lang/String;");
        }
        return model;
    }
    public static downloadApk(url: string) {
        if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/TyqHelper", "downloadAPK", "(Ljava/lang/String;)V", url);
        }
    }
    public static dartClick(url: string, appid: string, openid: string, ads_id: number) {
        if (window.jsb && cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/TyqHelper", "dartClick", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V", url, appid, openid, ads_id);
        }
    }
    public static copy(text: string) {
        if (window.jsb && cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/TyqHelper", "copyToClipboard", "(Ljava/lang/String;)V", text);
        }
    }
}