declare namespace kwaigame{
    /**同步获取启动参数 */
    function getLaunchOptionsSync()
    /**初始化, 在游戏启动时调用 */
    function init(obejct)
    /**在合适时机调用，移除快手小游戏加载页面，将游戏界面展示出来。 */
    function readyGo()
    /**登录接口,通过该接口获取的 gameUserId 是快手小游戏的唯一用户id，gameToken 是使用快手小游戏服务器API的唯一验证 token */
    function login(obejct)
    /**向用户发起授权请求 */
    function authorize(obejct)
    /**获取用户信息 */
    function getUserInfo(obejct)
    /**获取全局激励视频广告组件 */
    function createRewardedVideoAd(obejct)
    /**创建全局录屏组件 */
    function createMediaRecorder()
    /**获取平台基础信息 */
    function getSystemInfo(response)
    /**同步判断当前快手应用是否支持某一功能集合 */
    function isSupportAsync(feature,obejct)
    /**查看关注官⽅帐号状态 */
    function checkFollowState(object)
    /**打开官方账号 */
    function openUserProfile(object)

}