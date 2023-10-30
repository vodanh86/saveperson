### AppConfigure 程序启动参数

#### 1.结构信息
``` js
/** app启动参数 */
declare interface AppConfigure {
    /** sdk传入的账号信息 */
    accountInfo: SdkAccountInfo;
    /** sdk配置信息 */
    sdkConfigure: SdkConfigure;
    /** 游戏环境参数 */
    env: GameEnv;
    /** 启动参数，用来表示启动来源（用来作为分享依据） */
    fromInfo?: FromInfo;
}


/** SDK账号信息 */
declare interface SdkAccountInfo {
    /** 渠道Id */
    channelid: string;
    /** 群岛的用户id */
    channeluid: string;
    /** 登陆标识 */
    openid: string;
    /** 名称 */
    nickname: string;
    /** 签名 */
    sign: string;
    /** 是否是新账号 */
    isnewuser?: boolean;
    /** sdk账号的其他信息 */
    ext?: any;
}


/** SDK配置信息 */
declare interface SdkConfigure {
    /** appId */
    appId: string;

    /** 充值档 */
    payStatics: SPayRaw[];
}


/** 运行环境 */
declare interface GameEnv {
    /** 代码版本号 */
    version: string;
    /** 资源版本号 */
    resVer: string;
    /** 运维环境 */
    mode: string;
    /** 运维环境简写 */
    miniMode: string;
    /** 是否维护 */
    isMaintain: string;
    /** 维护提示文本 */
    maintainTip: string;
    /** 资源cdn前缀 */
    cdnPrifix: string;
    /** 服务器ip */
    host: string;
    /** 服务器端口 */
    port: number;
    /** 平台 */
    platform: number;
    /** 分享资源url */
    shareConfigUrl: string;
    /** 分享配置 */
    shareSetting: {
        share: string,
        sharegap1: string,
        sharegap2: string,
        sharetips: string
    },
    /** IOS支付状态 */
    iOSPayModel: number;
    /** IOS不可支付提示文本 */
    iOSPayBanTip: string;
    /** 是否不采用wws */
    unwws: boolean;
    /** 游戏公告url */
    gameNews: string;
}

```

#### 2.入口变量
``` js
/** SDK配置信息 */
declare var app_sdkConfigure: SdkConfigure;
// sdk账号信息
declare var app_sdkAccountInfo: SdkAccountInfo;
// 游戏环境
declare var app_gameEnv: GameEnv;
// 来源信息
declare var app_fromInfo: FromInfo
```

#### 3.页面透参
        现在参数将全部由页面传入，游戏内将不再对参数进行额外的处理。处理规则为页面将解析url参数，
    分别对上述的四个启动参数进行同字段名称覆盖操作。 代码如下：
``` js
    window['app_sdkAccountInfo'] = null;
    window['app_sdkConfigure'] = null;
    window['app_fromInfo'] = null;
    window['app_gameEnv']={
        version: "202007030946",
        mode: "mode",
        isMaintain: "isMaintain",
        maintainTip: "maintainTip",
        cdnPrifix: window.cdnPrefix,
        host: null,
        port: null,
        shareConfigUrl: "https://mt-dev-cdn.s.erlou.com/static/shareconfig.php",
        shareSetting: {
            share: "share",
            sharegap1: "sharegap1",
            sharegap2: "sharegap2",
            sharetips: "sharetips"
        },
        gameNews: "http://192.168.2.229:8082/debug/game/gamenews.php"
    }

    function dealParams(query)  {
        let params = {};
        let strs = query.split("&");
        console.log(strs)
        for (var i = 0; i < strs.length; i++) {
            params[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
        return params;
    }

    function GetH5Request()  {
        var url = location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            let params = dealParams(str);
            if (!params) return;
            let keys = Object.keys(params);
            for (let i = 0; i < keys.length; i++) {
                if (params[keys[i]] == "true") params[keys[i]] = true;
                if (params[keys[i]] == "false") params[keys[i]] = false;
            }
            return params;
        }
        return null;
    }

    let fixAccountInfo = function (params) {
        app_sdkAccountInfo = app_sdkAccountInfo || {};
        let keys = ["channelid", "channeluid", "openid", "nickname", "isnewuser"];
        for (let i = 0; i < keys.length; i++) {
            if (params[keys[i]]) app_sdkAccountInfo[keys[i]] = params[keys[i]];
        }

    }
    let fixSdkConfigure = function (params) {
        app_sdkConfigure = app_sdkConfigure || {};
        let keys = ["appId"];
        for (let i = 0; i < keys.length; i++) {
            if (params[keys[i]]) app_sdkConfigure[keys[i]] = params[keys[i]];
        }
    }
    let fixGameEnv = function (params) {
        app_gameEnv = app_gameEnv || {};
        let keys = ["version", "resVer", "mode", "miniMode", "isMaintain", "maintainTip", "cdnPrifix", "host", "port", "platform", "shareConfigUrl", "iOSPayModel", "iOSPayBanTip", "unwws", "gameNews"];
        for (let i = 0; i < keys.length; i++) {
            if (params[keys[i]]) app_gameEnv[keys[i]] = params[keys[i]];
        }

    }
    let fixFromInfo = function (params) {
        app_fromInfo = app_fromInfo || {};
        let keys = ["isSticky", "playerId", "openId", "channelIds", "sceneId", "scene", "fight"];
        for (let i = 0; i < keys.length; i++) {
            if (params[keys[i]]) app_fromInfo[keys[i]] = params[keys[i]];
        }
    }

    let params = GetH5Request() || {};
    // h5参数透传
    fixAccountInfo(params);
    fixSdkConfigure(params);
    fixGameEnv(params);
    fixFromInfo(params);
```
        



