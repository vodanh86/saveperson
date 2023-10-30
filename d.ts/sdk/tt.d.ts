declare namespace tt {
	/**获取全局唯一的录屏管理器 */
	function getGameRecorderManager();
	/**设置是否保持屏幕常亮状态 */
	function setKeepScreenOn(boolean);
	/**分享视频，已经废弃 */
	function shareVideo(argument);
	/**主动拉起转发界面（发布器）。 */
	function shareAppMessage(argument);
	/**监听用户点击右上角菜单中的“转发”按钮时触发的事件 */
	function onShareAppMessage(callback);
	/**跳转视频播放页 */
	function navigateToVideoView(videoId);
	/**创建画布 */
	function createCanvas():any;
	/**获取视频点赞数，封面图 */
	function request(videoId);
	/**返回小游戏启动参数 */
	function getLaunchOptionsSync(): any;
	/**获取系统信息。 */
	function getSystemInfoSync(): any;
	/**调用该 API 可以获取用户临时的登录凭证。 */
	function login(argument);
	/**调用方法会提前向用户发出授权请求。该方法不会调用对应接口，只会弹框咨询用户是否授权或者获取用户信息。如果用户之前有授权，该接口直接返回成功，不会跟用户产生交互 */
	function authorize(argument);
	/**用户的登录态具有时效性，随着用户未使用小程序的时间增加，用户的登录态越容易失效；
	 * 反之，则用户登录态可持续保持有效。使用该 API 可检查用户当前的 session 状态是否有效，登录态过期后开发者可以再调用 tt.login 获取新的用户登录态。 */
	function checkSession(argument);
	/**获取已登录用户的基本信息或特殊信息，首次使用的用户会弹出授权提示窗，若用户同意，则会返回用户的真实数据。 */
	function getUserInfo(argument): any;
	function vibrateShort(argument); // 手机震动
	function vibrateLong(argument);//长时间震动
	function exitMiniProgram(argument);//关闭小程序
	function openSetting(argument);//关闭小程序
	// function getOpenDataContext();
	/**创建的广告实例 */
	function createBannerAd(argument);
	/**开发者可以在小游戏中使用 Video 广告获得收入。
	 * Video 广告是由客户端原生渲染，覆盖在整个小游戏 Canvas 区域之上。Video 广告展示的时候用户不能操作小游戏。 
	 * Video 广告目前支持竖屏展示。如果是横屏游戏在展示时会先切到竖屏。
	 * 开发者工具上暂不支持调试该 API，请直接在真机上进行调试。 */
	function createRewardedVideoAd(argument);
	/**获取用户已经授权过的配置 */
	function getSetting(argument);
	/**从系统相册中选择图片，或使用相机拍摄图片，选取成功后将存入本地临时文件，并在 success 回调中返回相应路径列表。 */
	function chooseImage(argument);
	/**显示灰色背景的消息提示框。 */
	function showToast(argument);
	/**获取系统信息 */
	function getSystemInfo(argument);
	/**显示当前小程序页面的转发按钮。转发按钮位于小程序页面右上角的“更多”中。 */
	function showShareMenu(options);
	/**创建客服按钮 */
	function createContactButton(argument): any;
	/**创建更多游戏按钮，通过点击 */
	function createMoreGamesButton(argument): any;
	/**打开更多游戏的游戏盒子 */
	function showMoreGamesModal(argument): any;
	/**设置更多游戏配置 */
	function setMoreGamesInfo(argument):any;
	function createImage(): any;
	/**关注抖音号 */
	function openAwemeUserProfile():any;
	/**添加游戏关注 */
	function showFavoriteGuide(argument):any;
	/**创建插屏广告，开发者可以在小游戏中使用插屏广告获得收入。
     * 插屏广告是由客户端原生渲染，由开发者控制广告组件的显示。
     * 该能力支持竖屏版和横屏版小游戏。 */
    function createInterstitialAd(argument):any;
	/* 创建图片对象 */
	function createImage():any;
	/**友盟 */
	var uma: uma;
}

/**友盟数据统计SDK  */
declare class uma {
	/**上报抖音anonymousOpenid  获取这个ID 需要先调用tt.login获取anonymousCode，再通过抖音的服务器获取anonymous_openid*/
	public setAnonymousOpenId(anonymousOpenId): void;
	/**上传openid 需要通过抖音服务器获取openid */
	public setOpenid(openid): void
	/**
	 * 自定义事件
	 * @param eventID 事件ID需在官网申请，长度在128个字符内
	 * @param param 当params为object类型时，每个key长度不能超过256个字符
					当params为object类型时，其携带key的个数不能超过100个
					存在规则不合法情况时，丢弃整条事件
	 */
	public trackEvent(eventID: string, param?: Object): void;
	/**关卡 */
	stage: stage
}

/**关卡 */
declare class stage {
	/**
	 * 关卡开始
	 * @param stageId 关卡ID 该字段必传，且必须传为string类型
	 * @param stageName 关卡名称
	 */
	public onStart(obj: StartObj): void;
	/**
	 * 
	 * @param stageId 关卡ID 该字段必传，且必须传为string类型
	 * @param stageName 	关卡名称
	 * @param event 关卡结束结果  请按照以下两个字段上传，complete/ fail；
	 */
	public onEnd(obj: endObj): void;
}
interface StartObj {
	stageId: string,
	stageName: string
}

interface endObj {
	stageId: string,
	stageName: string,
	event: string
}