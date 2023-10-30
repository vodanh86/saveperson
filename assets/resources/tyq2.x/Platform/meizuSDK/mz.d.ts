declare namespace mz{
	/**获取系统信息。 */
	function getSystemInfo():any
    /**获取系统信息的同步方法。 */
	function getSystemInfoSync(): any;
   /**创建的广告实例 */
	function createBannerAd(argument);
	/**开发者可以在小游戏中使用 Video 广告获得收入。
	 * Video 广告是由客户端原生渲染，覆盖在整个小游戏 Canvas 区域之上。Video 广告展示的时候用户不能操作小游戏。 
	 * Video 广告目前支持竖屏展示。如果是横屏游戏在展示时会先切到竖屏。
	 * 开发者工具上暂不支持调试该 API，请直接在真机上进行调试。 */
	function createRewardedVideoAd(argument);
	/**创建插屏广告，开发者可以在小游戏中使用插屏广告获得收入。
     * 插屏广告是由客户端原生渲染，由开发者控制广告组件的显示。
     * 该能力支持竖屏版和横屏版小游戏。 */
    function createInsertAd(argument):any
    /**网络状态 */
    function getNetworkType(object)
    /**获取平台名称 */
    function getProvider()
}
