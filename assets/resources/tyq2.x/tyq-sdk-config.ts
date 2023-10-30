// @ts-nocheck
// import { error, log } from "cc";
class tyqConfig {
    /**游戏名称 */
    gameName = '画线大聪明';
    /**游戏版本号 */
    gameVersion = '1.0.4';
    /**用于区分审核版和正式版，每次上传都需要改这个值 1和2*/
    app_version = 1;
    //后台appid
    appId = 'TyqApp20220328113321';//
    //后台分配的key 
    api_key = 'IM5uE4ICyyaLGt9wkc8CEe8xypIVa1ll';
    //后台app秘钥
    AppSecret = "1";

    // SDK服务端域名
    server = 'https://api.game.xmtyq.com/china_app_game_sdk/';
    // server = 'https://api.game.tyqwl.com/overseas_app_game_sdk/'

    /**
     * 以下针对apk配置
     */

    /**广告平台相关 优先级小米>topon>IronSource*/
    //是否是小米平台
    isXiaomi = false;
    //是否使用topon聚合
    useTopon = false;
    //是否使用IronSource聚合
    useIronSource = false;

    /**打点相关 */
    //是否使用友盟打点
    useUmeng = false;
    //是否使用Facebook事件打点
    useFbEvent = false;

}
export default new tyqConfig