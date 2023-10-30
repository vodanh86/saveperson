//import AD from "../../../AD/AD";


const global = {
	/**临时处理加的 2020-12-29 */
	latticeAdunit: null,
	/**临时处理加的 2020-12-29 */
	iconCount: null,
}
class wechat {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance: wechat = new wechat();
	/** 系统信息 */
	private systemInfo: wx.types.SystemInfo = null;
	/** 登录按钮对象 */
	private userInfoButton: UserInfoButton = null;
	/** banner广告对象 */
	private bannerAd: BannerAd = null;
	/** 奖励视频广告对象 */
	private rewardedVideoAd: RewardedVideoAd = null;
	/** 插屏广告对象 */
	private interstitialAd = null;
	/**推荐位广告对象 */
	private RiconAD: iconAd = null;
	private LiconAD: iconAd = null;
	/**格子广告对象 */
	private gridAd: gridAd = null;
	/**格子广告数量 */
	private gridAdCunt: number = null;
	/** 游戏画面录制对象 */
	private GameRecorder: GameRecorder = null;
	/** 录屏开始事件 */
	private startListener: Function = null;
	/** 监听录屏继续事件 */
	private resumeListener: Function = null;
	/** 录屏暂停事件 */
	private pauseListener: Function = null;
	/**  录屏结束事件 */
	private stopListener: Function = null;
	/**  录屏错误事件 */
	private errorListener: Function = null;
	/** 录屏取消事件 */
	private abortListener: Function = null;
	/** 录制时间更新事件。在录制过程中触发该事件 */
	private timeUpdateListener: Function = null;
	/** 游戏圈对象 */
	private gameClub: GameClubButton = null;
	/** 意见反馈按钮 */
	private feedbackButton: FeedbackButton = null;
	/** 切换到前台事件 */
	private showListener: Function = null;
	/** 切换到后台事件 */
	private hideListener: Function = null;
	/** banner广告id */
	private _bannerAdUnitId = ["adunit-4db653bd7c048ef0", 'adunit-bbda7af39d5c7ca8', 'adunit-0cf2a758135f9715', 'adunit-5fec39ce54c5d8b5', 'adunit-5e27506876eca8fd'];
	private _bannerAdObjList: BannerAd[] = [];
	private _bannerShowIndex = 0;
	private _bannerTimer = null;
	private _bannerAdRefreshTimeOutId: number = 0;
	/** 奖励视频广告id */
	private _rewardedVideoAdUnitId = ["adunit-2522639daad8f288", 'adunit-6673ea056474e06b', 'adunit-413b986cee325fff'];
	/** 插屏广告id */
	private _interstitialAdUnitId = ['adunit-7bab3e1774441506'];
	/**格子广告ID */
	private _latticeAdUnitId = ''
	/**推荐位广告，左右 */
	private _RIconAdunit = ''
	private _LIconAdunit = ''

	/** 登录按钮信息 */
	private mainBannerAD = null;
	private _userInfoButtonData = {
		width: null,
		height: null,
		x: null,
		y: null,
		url: null
	};
	/** 反馈页面的按钮信息 */
	private _feedbackButtonData = {
		width: null,
		height: null,
		x: null,
		y: null,
		url: null
	};
	/** banner广告的像素大小 */
	private _bannerSize = {
		width: 340,
		height: 172
	};

	private _gameClubSize = {
		icon: '',
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	private _closeRewardVideoListener: Function = null;
	////////////////////////////
	// get、set访问器
	///////////////////////////
	public set RIconAduni(adUnitId: string) {
		this._RIconAdunit = adUnitId;
	}

	public set LIconAduni(adUnitId: string) {
		this._LIconAdunit = adUnitId;
	}

	public set bannerAdUnitId(adUnitId: string) {
		// this._bannerAdUnitId = adUnitId;
	}

	public set rewardedVideoAdUnitId(adUnitId: string) {
		// this._rewardedVideoAdUnitId = adUnitId;
	}

	public set interstitialAdUnitId(adUnitId: string) {
		// this._interstitialAdUnitId = adUnitId;
	}

	public set bannerSize(size: any) {
		this._bannerSize.width = size.width;
		this._bannerSize.height = size.height;
	}

	public set latticeAdUnitId(adUnitId: string) {
		this._latticeAdUnitId = adUnitId;
	}

	public set gameClubSize(size: any) {
		this._gameClubSize.x = size.x;
		this._gameClubSize.y = size.y;
		this._gameClubSize.width = size.width;
		this._gameClubSize.height = size.height;
		this._gameClubSize.icon = size.icon;
	}

	public set userInfoButtonData(data: any) {
		this._userInfoButtonData.width = data.width;
		this._userInfoButtonData.height = data.height;
		this._userInfoButtonData.x = data.x;
		this._userInfoButtonData.y = data.y;
		this._userInfoButtonData.url = data.url;
	}

	public set closeRewardVideoListener(cb: Function) {
		this._closeRewardVideoListener = cb;
	}

	////////////////////////////
	// get、set访问器
	///////////////////////////
	public constructor() {
		if (window.wx) {
			// this.registerRecordScreenEvent();
			this.getSystemInfoSync();
		}
	}
	//预加载所有广告
	public preLoadAd() {
		this.createRewardedVideoAd();
		this.preLoadBanner();
		this.createInterstitialAd();
	}
	//预加载所有banner广告
	public preLoadBanner() {

		for (let i = 0; i < this._bannerAdUnitId.length; i++) {
			let id = this._bannerAdUnitId[i];
			let bannerAd = this.createBanner(id);
			this._bannerAdObjList.push(bannerAd);
		}

	}
	private createBanner(id) {
		let bannerSize = {
			// width: this._bannerSize.width / this.systemInfo.pixelRatio,
			// height: this._bannerSize.height / this.systemInfo.pixelRatio
			width: this._bannerSize.width,
			height: this._bannerSize.height
		};
		// let id = this._bannerAdUnitId[Math.floor(Math.random() * this._bannerAdUnitId.length)];
		let bannerObj = wx.createBannerAd({
			// 广告单元 id
			adUnitId: id,
			// 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于30（该参数不传入时 Banner 广告不会自动刷新）
			adIntervals: 30,
			style: {
				left: this.systemInfo.windowWidth / 2 - bannerSize.width / 2,
				top: this.systemInfo.windowHeight - bannerSize.height + this.systemInfo.windowHeight * 0.1,
				height: bannerSize.height,
				width: bannerSize.width
			}
		});
		// console.log('bannerSize: ', bannerSize, ', systemInfo: ', this.systemInfo, ',this.bannerAd.style: ', this.bannerAd.style);

		bannerObj.onLoad(() => {
			console.log('=====> @framework, banner广告加载成功' + id);

		});
		bannerObj.onError((res) => {
			console.log('=====> @framework, banner广告加载失败：', id);
			// next && next(false);
		});
		bannerObj.onResize((res: { width: number; height: number }) => {
			bannerObj.style.left = this.systemInfo.windowWidth / 2 - res.width / 2 - 0.1;
			bannerObj.style.top = this.systemInfo.windowHeight - res.height + 0.1;
		});
		return bannerObj;
	}
	////////////////////////////
	// 登录模块
	///////////////////////////
	/**
	 * 登陆接口
	 * @param cbOK
	 * @param cbFail
	 */
	public wetchatLogin(cbOK, cbFail): void {
		let data = {
			wccode: null,
			wcencrypted: null,
			wciv: null,
			// userInfo: null
		};
		// 获取玩家数据
		let getLoginData = () => {
			this.login((code: any) => {
				data.wccode = code;
				if (cbOK)
					cbOK(code);
			}, (res: any) => {
				data.wcencrypted = res.encryptedData;
				data.wciv = res.iv;
				if (cbFail)
					cbFail(data);
			});
		};
		getLoginData();
	}

	/**
	 * @description 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限
	 *
	 * @param cbDone 登陆成功后回调
	 * @param cbFail 登陆失败后回调
	 */
	public getSetting(cbDone, cbFail): void {
		if (wechat.isSupportedAPI(wx.getSetting)) {
			wx.getSetting({
				success: (res: { authSetting: wx.types.AuthSetting }) => {
					cbDone(res.authSetting['scope.userInfo']);
				},
				fail: (res) => {
					if (cbFail) cbFail(res);
				}
			});
		} else {
			console.error("----> 微信版本不支持getSetting API");
			if (cbFail) cbFail("----> 微信版本不支持getSetting API");
		}
	}

	/**
	 * @description 创建用户登录按钮
	 */
	public createUserInfoButton(x = 0, y = 0, width = cc.winSize.width, height = cc.winSize.height): void {
		if (wechat.isSupportedAPI(wx.createUserInfoButton)) {
			this.userInfoButton = wx.createUserInfoButton({
				type: 'image',
				style: {
					left: x,
					top: y,
					width: cc.winSize.width,
					height: cc.winSize.height
				}
			});
		} else {
			console.log('=====> @framework,当前微信版本过低，无法使用授权按钮，请升级到最新微信版本后重试');
		}
	}


	public destroyAuthorizeBtn(): void {
		if (this.userInfoButton) {
			this.userInfoButton.destroy();
			this.userInfoButton = null;
		}
	};


	/**
	 * @description 监听用户点击登录按钮的事件
	 */
	private onTapUserInfoButton(cbOK, cbFail): void {
		if (this.userInfoButton) {
			this.userInfoButton.onTap((res: any) => {
				// 点击登录按钮，用户授权成功
				console.log('onTap', res);
				if (res.userInfo) {
					this.destroyAuthorizeBtn();
					if (cbOK)
						cbOK(res);
				} else {
					cbFail(res);
				}
			});
		} else {
			cbFail(null);
		}
	}


	/**
	 * @description 登录游戏服务
	 */
	public login(cbOk, cbFail): void {
		wx.login({
			success: (res: { code: string }) => {
				cbOk(res.code);
			},
			fail: () => {
				cbFail();
			}
		});
	}

	/**
	 * @description 获取用户信息
	 */
	public getUserInfo(resolve?, reject?): void {
		this.getSetting((res: any) => {
			wx.getUserInfo({
				success: (res: any) => {
					if (resolve)
						resolve(res);
				},
				fail: (err) => {
					if (reject)
						reject(err);
				}
			});
		}, (res) => {
			if (reject) {
				console.log(res);
				reject("getsetting 失败");
			}

		})
	}

	////////////////////////////
	// 分享
	///////////////////////////
	/**
	 * @description 分享，主动拉起转发，进入选择通讯录界面
	 * @param _title
	 * @param _imageUrl
	 * @param _query
	 */
	public shareAppMessage(_title: string, _imageUrl: string, _query: string): void {
		wx.shareAppMessage({
			title: _title,
			imageUrl: _imageUrl,
			query: _query
		});
	}

	////////////////////////////
	// banner广告
	///////////////////////////
	/**
	 * @description 显示banner广告
	   * @param refreshTime 自动刷新时间，默认30秒，必须>=30秒；
	 */
	public showBannerAd(next?, refreshTime: number = 30) {
		if (!wechat.isSupportedAPI(wx.createBannerAd)) return;
		if (!this.bannerAd) {
			this.createBannerAd(refreshTime, next);
			this.bannerAd.show();
			return;
		}
		else {
			this.bannerAd.show();
			next && next(true);
		}

	}

	//轮流显示banner
	public showBannerTurns(times) {
		if (!wechat.isSupportedAPI(wx.createBannerAd)) return;
		clearInterval(this._bannerTimer);
		this.showBannerNext();
		this._bannerTimer = setInterval(() => {
			this.showBannerNext();
		}, times)
	}


	private showBannerNext() {
		if (this._bannerAdObjList.length <= 0) {
			console.error('zzzzzzz无banner广告');
			return;
		}
		this._bannerAdObjList.forEach(ad => {
			ad.hide();
		})
		this._bannerAdObjList[this._bannerShowIndex].hide();
		this._bannerShowIndex++;
		if (this._bannerShowIndex >= this._bannerAdObjList.length) {
			this._bannerShowIndex = 0;
		}
		let bannerAd = this._bannerAdObjList[this._bannerShowIndex];
		if (bannerAd) {
			bannerAd.show().catch(() => {
				let id = this._bannerAdUnitId[this._bannerShowIndex];
				bannerAd = this.createBanner(id);
				if (bannerAd) {
					bannerAd.show();
				}
			});
		} else {
			let id = this._bannerAdUnitId[this._bannerShowIndex];
			bannerAd = this.createBanner(id);
			if (bannerAd) {
				bannerAd.show();
			}
		}

	}

	// }
	/**
	 * @description 隐藏banner广告
	 */
	public hideBannerAd() {
		if (this.bannerAd) {
			this.bannerAd.hide();
		}
		if (this._bannerAdRefreshTimeOutId != 0) {
			clearTimeout(this._bannerAdRefreshTimeOutId);
			this._bannerAdRefreshTimeOutId = 0;
		}
		clearInterval(this._bannerTimer);
		this._bannerAdObjList.forEach(ad => {
			ad.hide();
		})
	}
	/**
	* @description 销毁banner广告
	*/
	public destroyBannerAd() {
		if (this.bannerAd) {
			this.bannerAd.destroy();
			this.bannerAd = null;
		}
		if (this._bannerAdRefreshTimeOutId != 0) {
			clearTimeout(this._bannerAdRefreshTimeOutId);
			this._bannerAdRefreshTimeOutId = 0;
		}
	}

	/**
	 * @description 创建banner广告
	 */
	public createBannerAd(refreshTime, next?, isShow = true) {
		console.log("banner width= ", this._bannerSize.width, this._bannerAdUnitId)
		let bannerSize = {
			// width: this._bannerSize.width / this.systemInfo.pixelRatio,
			// height: this._bannerSize.height / this.systemInfo.pixelRatio
			width: this._bannerSize.width,
			height: this._bannerSize.height
		};
		let id = this._bannerAdUnitId[Math.floor(Math.random() * this._bannerAdUnitId.length)];
		this.bannerAd = wx.createBannerAd({
			// 广告单元 id
			adUnitId: id,
			// 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于30（该参数不传入时 Banner 广告不会自动刷新）
			adIntervals: 30,
			style: {
				left: this.systemInfo.windowWidth / 2 - bannerSize.width / 2,
				top: this.systemInfo.windowHeight - bannerSize.height + this.systemInfo.windowHeight * 0.1,
				height: bannerSize.height,
				width: bannerSize.width
			}
		});
		console.log('bannerSize: ', bannerSize, ', systemInfo: ', this.systemInfo, ',this.bannerAd.style: ', this.bannerAd.style);

		this.bannerAd.onLoad(() => {
			console.log('=====> @framework, banner广告加载成功');
			// 移除setTimeout
			if (this._bannerAdRefreshTimeOutId != 0) {
				clearTimeout(this._bannerAdRefreshTimeOutId);
				this._bannerAdRefreshTimeOutId = 0;
			}
			if (isShow) this.bannerAd.show();
			// 延时刷新banner
			// if (refreshTime > 0) {
			// 	this._bannerAdRefreshTimeOutId = setTimeout(() => {
			// 		if (this.bannerAd)
			// 			this.showBannerAd(refreshTime);
			// 	}, refreshTime * 1000);
			// }
			next && next(true);
		});
		this.bannerAd.onError((res) => {
			console.log('=====> @framework, banner广告加载失败：', res);
			next && next(false);
		});
		this.bannerAd.onResize((res: { width: number; height: number }) => {
			this.bannerAd.style.left = this.systemInfo.windowWidth / 2 - res.width / 2 - 0.1;
			this.bannerAd.style.top = this.systemInfo.windowHeight - res.height + 0.1;
			//AD.setErrNodeY(-((this.bannerAd.style.top * winSize.height / this.systemInfo.windowHeight) - winSize.height / 2));
		});
	}


	////////////////////////////
	// 奖励广告
	///////////////////////////

	public showRewardVideoAd() {
		return new Promise((resolve, reject) => {
			this.createRewardedVideoAd();
			if (!this.rewardedVideoAd) {
				console.log('=====> @framework, 奖励视频对象为不存在');
				reject();
				return null;
			}
			this.rewardedVideoAd.load().then(() => {
				this.rewardedVideoAd.show();
			});
			let closeListener = (res: { isEnded: boolean }) => {
				let isComplete: boolean;
				// 小于 2.1.0 的基础库版本，res 是一个 undefined
				if (res && res.isEnded || res === undefined) {
					isComplete = true;
					resolve(isComplete);
				} else {
					isComplete = false;
					resolve(isComplete);
				}
				this.closeRewardVideo();
				this.rewardedVideoAd.offClose(closeListener);
				this.rewardedVideoAd = null;
				this.createRewardedVideoAd();
			};

			let errorListener = (res: { errMsg: string; errCode: number }) => {
				console.log('=====> @framework, 奖励视频发生错误：', res);
				// 再拉一次视频
				this.rewardedVideoAd.load()
					.then(() => {
						return this.rewardedVideoAd.show();
					})
					.then(() => {
						this.rewardedVideoAd.offError(errorListener);
					})
					.catch(() => {
						reject();
						this.rewardedVideoAd.offError(errorListener);
					});
			};
			this.rewardedVideoAd.onClose(closeListener);
			this.rewardedVideoAd.onError(errorListener);
		});
	}

	/**
	 * @description 创建奖励视频单例（小游戏端是全局单例）
	 */
	private createRewardedVideoAd(): void {
		if (!wx.createRewardedVideoAd) {
			console.log('=====> @framework,当前微信版本过低，无法使用奖励视频功能，请升级到最新微信版本后重试');
			return;
		}
		if (this.rewardedVideoAd) {
			return;
		}
		let id = Math.floor(Math.random() * this._rewardedVideoAdUnitId.length);
		this.rewardedVideoAd = wx.createRewardedVideoAd({
			adUnitId: this._rewardedVideoAdUnitId[id]
		});

		this.rewardedVideoAd.onLoad(() => {
			console.log('=====> @framework, 加载视频广告成功');
		});
		this.rewardedVideoAd.onError(() => {
			console.log('=====> @framework, 加载视频广告失败');
		})
	}

	private closeRewardVideo(): void {
		if (this._closeRewardVideoListener) {
			this._closeRewardVideoListener();
		}
	}

	////////////////////////////
	// 插屏广告
	///////////////////////////
	public showInterstitialAd(closeCb?): void {
		if (!wx.createInterstitialAd) {
			console.log('=====> @framework,当前微信版本过低，无法使用插屏广告功能，请升级到最新微信版本后重试');
			return;
		}

		this.createInterstitialAd();

		console.log("----> 显示插屏广告");
		this.interstitialAd.show();
		this.interstitialAd.onError((res) => {
			console.log('=====> @framework,插屏创建失败: ', res);
			closeCb && closeCb();
		});

		this.interstitialAd.onClose(res => {
			this.interstitialAd = null;
			console.log('----> 插屏 广告关闭')
			closeCb && closeCb();
			this.interstitialAd = null;
			this.createInterstitialAd();
		})
	}
	private createInterstitialAd() {
		if (!this.interstitialAd) {
			let id = this._interstitialAdUnitId[Math.floor(Math.random() * this._interstitialAdUnitId.length)];
			this.interstitialAd = wx.createInterstitialAd({
				adUnitId: id
			});
			this.interstitialAd.onLoad(() => {
				console.log('=====> @framework,插屏创建成功');
			});
			// this.interstitialAd.onError(() => {
			// 	console.log('=====> @framework,插屏创建失败');
			// });
		}

	}
	////////////////////////////
	// 游戏圈
	///////////////////////////
	/**
	 * @description 创建微信游戏圈
	 */
	public createGameClubButton(): void {
		// 微信圈是用户必要的功能，不需求弹出提示
		if (!wx.createGameClubButton) {
			console.log('=====> @framework,当前微信版本过低，无法使用游戏圈功能，请升级到最新微信版本后重试');
			return;
		}
		if (this.gameClub) {
			return;
		}
		this.gameClub = wx.createGameClubButton({
			icon: this._gameClubSize.icon,
			style: {
				left: this._gameClubSize.x / this.systemInfo.pixelRatio,
				top: this._gameClubSize.y / this.systemInfo.pixelRatio,
				width: this._gameClubSize.width,
				height: this._gameClubSize.height
			}
		});
		this.gameClub.hide();
		console.log('gameClub', this.gameClub);
	}

	/**
	 * @description 显示微信游戏圈
	 */
	public showGameClub(): void {
		console.log('显示游戏圈：', this.gameClub);
		this.createGameClubButton();
		if (this.gameClub) {
			this.gameClub.show();
			console.log('显示游戏圈成功');
		}
	}

	/**
	 * @description 隐藏微信游戏圈
	 */
	public hideGameClub(): void {
		if (this.gameClub) {
			this.gameClub.hide();
		}
	}

	////////////////////////////
	// 开放数据域
	///////////////////////////
	/**
	 * @description 向开放数据域发送消息
	 * @param msg 要发送的消息，message 中及嵌套对象中 key 的 value 只能是 primitive value。即 number、string、boolean、null、undefined
	 */
	public postMessage(msg: any, info?: any): void {
		let data = {
			message: '',
			value: info
		}
		data.message = msg;
		data.value = info;
		console.log('发送信息: ', data);
		wx.getOpenDataContext().postMessage(data);
	}

	////////////////////////////
	// 意见反馈
	///////////////////////////
	/**
	 * @description 创建打开意见反馈页面的按钮, 默认使用图片按钮的形式创建
	 */
	public createFeedbackButton(cbOk, cbFail): void {
		if (wechat.isSupportedAPI(wx.createFeedbackButton)) {
			this.feedbackButton = wx.createFeedbackButton({
				type: 'image', // 按钮的类型.支持text、image
				image: this._feedbackButtonData.url,
				style: {
					left: this._feedbackButtonData.x, // 左上角横坐标
					top: this._feedbackButtonData.y, // 左上角纵坐标
					width: this._feedbackButtonData.width, // 宽度
					height: this._feedbackButtonData.height // 高度
				}
			});
			cbOk(this.feedbackButton);
		} else {
			console.log('=====> @framework,当前微信版本过低，无法使用反馈按钮，请升级到最新微信版本后重试');
			cbFail();
		}
	}

	/**
	 * @description 监听意见反馈按钮的点击事件(在创建意见反馈按钮后，立即执行该函数，注册点击事件)，只能使用一次
	 */
	public onTapFeedbackButton(cbOk, cbFail): void {
		if (this.feedbackButton) {
			this.feedbackButton.onTap(() => {
				cbOk();
			});
		} else {
			cbFail();
		}
	}

	/**
	 * @description 显示意见反馈按钮
	 */
	public showFeedbackButton(): void {
		if (this.feedbackButton) {
			this.feedbackButton.show();
		}
	}

	/**
	 * @description 隐藏意见反馈按钮
	 */
	public hideFeedbackButton(): void {
		if (this.feedbackButton) {
			this.feedbackButton.hide();
		}
	}

	////////////////////////////
	// 录屏
	///////////////////////////
	/**
	 * @description 获取全局唯一的游戏画面录制对象
	 */
	public getGameRecorder(cbOk, cbFail): void {
		if (wechat.isSupportedAPI(wx.getGameRecorder)) {
			this.GameRecorder = wx.getGameRecorder();
			cbOk();
		} else {
			cbFail();
		}
	}

	public registerRecordScreenEvent(): void {
		if (!wechat.isSupportedAPI(wx.getGameRecorder)) {
			console.log('=====> @framework,当前客户端版过低，无法使用录制功能，请升级到最新客户端版本后重试');
			return;
		}
		this.GameRecorder = wx.getGameRecorder();
		// 监听录屏继续事件
		this.GameRecorder.on('start', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.resumeListener) {
				this.resumeListener();
			}
		});
		// 监听录屏暂停事件
		this.GameRecorder.on('pause', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.pauseListener) {
				this.pauseListener();
			}
		});
		// 监听录屏结束事件。可以通过 onStop 接口监听录屏结束事件，获得录屏地址
		this.GameRecorder.on('stop', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.stopListener) {
				console.log('视频的时长：', res.duration);
				this.stopListener(res.duration);
			}
		});

		// 监听录屏错误事件
		this.GameRecorder.on('error', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			console.log('=====> @framework,录屏错误：', res.error.message, ',code: ', res.error.code);
			if (this.errorListener) {
				this.errorListener();
			}
		});

		// 录制时间更新事件。在录制过程中触发该事件
		this.GameRecorder.on('timeUpdate', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			console.log('=====> @framework,录屏到第几秒：', res.currentTime);
			if (this.timeUpdateListener) {
				this.timeUpdateListener();
			}
		});

		// 录制取消事件
		this.GameRecorder.on('abort', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.abortListener) {
				this.abortListener();
			}
		});
	}

	/**
	 *  @description 开始录屏
	 * @param callback
	 */
	public startRecordScreen(callback?: Function): void {
		return
		this.startListener = callback;
		this.GameRecorder.start({
			fps: 24,
			duration: 7200,
			bitrate: 1000,
			gop: 12
		});
	}

	/**
	 * @description 暂停录屏
	 */
	public pauseRecordScreen(callback?: Function): void {
		this.pauseListener = callback;
		this.GameRecorder.pause();
	}

	/**
	 * @description 恢复录制游戏画面
	 * @param callback
	 */
	public resumeRecordScreen(callback?: Function): void {
		this.resumeListener = callback;
		this.GameRecorder.resume();
	}

	/**
	 * @description 结束录制游戏画面。结束录制后可以发起分享
	 * @param callback
	 */
	public stopRecordScreen(callback?: Function): void {
		this.stopListener = callback;
		this.GameRecorder.stop();
	}

	/**
	 * @description 放弃录制游戏画面。此时已经录制的内容会被丢弃
	 * @param callback
	 */
	public abortRecordScreen(callback?: Function): void {
		this.abortListener = callback;
		this.GameRecorder.abort();
	}

	public createGameRecorderShareButton(): void {

	}

	////////////////////////////
	// 其他能力
	///////////////////////////
	/**
	 * 监听小游戏回到前台的事件
	 * @param callbak
	 */
	public onShow(callbak): void {
		this.showListener = callbak;
		wx.onShow(this.onShowListener.bind(this));
	}

	/**
	 * @description 取消监听小游戏回到前台的事件
	 */
	public offShow(): void {
		wx.offShow(this.onShowListener);
	}

	/**
	 * @description 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件
	 * @param callbak
	 */
	public onHide(callbak): void {
		this.hideListener = callbak;
		wx.onHide(this.onHideListener.bind(this));
	}

	/**
	 * @description 取消监听小游戏隐藏到后台事件
	 */
	public offHide(): void {
		this.hideListener = null;
		wx.offHide(this.onHideListener);
	}

	public onShowListener(res): void {
		if (this.showListener) {
			this.showListener(res);
		}
	}

	public onHideListener(): void {
		if (this.hideListener) {
			this.hideListener();
		}
	}

	/**
	 * @description 打开另一个小程序
	 * @param _appId
	 * @param _path
	 */
	public navigateToMiniProgram(_appId: string, _path: string, cbOk, cbFail): void {
		if (wechat.isSupportedAPI(wx.navigateToMiniProgram)) {
			wx.navigateToMiniProgram({
				appId: _appId,
				path: _path,
				envVersion: 'release',
				success: () => {
					cbOk();
				},
				fail: () => {
					cbFail();
				},
				complete: () => {
				}
			});
		} else {
			cbFail();
		}
	}

	////////////////////////////
	// 震动
	///////////////////////////
	/**
		 * 使手机发生较长时间的振动。
		 */
	/**
	 * 使手机发生较长时间的振动。
	 * @param cb 回调
	 */
	public vibrateLong(cb?: Function): void {
		if (cb)
			console.warn("----> vibrateLong 微信可能没有cb");
		wx.vibrateLong();
	};
	/**
	 * 使手机发生较短时间的振动
	 * @param cb 回调
	 */
	public vibrateShort(cb?: Function): void {
		console.warn("----> vibrateShort 微信可能没有cb");
		wx.vibrateShort();
	};
	////////////////////////////
	// 通用
	///////////////////////////
	/**
	 * @description 获取系统信息
	 */
	public getSystemInfoSync(): void {
		this.systemInfo = wx.getSystemInfoSync();
	}

	/**
	 * @description 是否支持改API
	 * @param api
	 */
	private static isSupportedAPI(api: any): boolean {
		if (api) {
			return true;
		} else {
			wx.showModal({
				title: '提示',
				content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
			});
			return false;
		}
	}

	/**
	 * 退出小程序
	 * @param cb
	 */
	public exitMiniProgram(cb: any): void {
		wx.exitMiniProgram(cb);
	};

	/**
	 * 显示灰色背景的消息提示框
	 * @param title 内容
	 * @param duration 提示框停留时间，单位ms
	 * @param callback 成功后回调
	 */
	public showToast(title: string, duration: number = 3000, callback?: Function): void {
		wx.showToast({
			title: title,
			duration: duration,
			success: () => {
				if (callback) callback();
			}
		});
	};

	/**
	 * 获取系统信息
	 * @param callback 成功后回调
	 */
	public getSystemInfo(callback?: Function): void {
		wx.getSystemInfo({
			success: (res) => {
				if (callback) callback(res);
			}
		});
	};


	/**
	 * 阿拉丁事件
	 * @param str
	 * @param objOrStr {key:string,value:string}
	 */
	public aldSendEvent(str, objOrStr?): void {
		console.log('send msg: ', str);
		if (wx.aldSendEvent) {
			if (objOrStr)
				wx.aldSendEvent(str);
			else
				wx.aldSendEvent(str, objOrStr);
		} else
			console.error("----> 阿拉丁接入失败，请检查game.js");
	}

	/**
	 * 创建供量主广告实例
	 */
	public createIconAd() {
		let styleItemArray = [...Array(global.iconCount + 1).map((_, i) => ({
			appNameHidden: false,
			color: 'white',
			size: 100,
			borderWidth: 100,
			borderColor: 'white',
			left: 100 * i,
			top: 100,
		}))]
		// 创建推荐位实例，提前初始化
		this.LiconAD = wx.createGameIcon({
			adUnitId: this._LIconAdunit,
			count: global.iconCount,
			style: styleItemArray
		})

		// this.RiconAD = wx.createGameIcon({
		// 	adUnitId:this._RIconAdunit,
		// 	count:global.iconCount,
		// 	style:styleItemArray
		// })
		this.LiconAD.onError((res) => {
			console.log('=====> @framework, 小游戏推荐左边icon加载失败：', res);
			//next && next(false);
		});
		this.LiconAD.onLoad(() => {
			console.log('=====> @framework, 小游戏推荐左边icon加载成功');
		})

		this.LiconAD.onResize(size => {
			//偶数  自适应排位置
			var starTop = 0;
			if (global.iconCount % 2 === 0) {
				starTop = this.systemInfo.windowHeight / 2 - global.iconCount / 2 * size[0].height;
			} else {
				starTop = this.systemInfo.windowHeight / 2 - global.iconCount / 2 * size[0].height + size[0].height / 2;
			}
			for (let i = 0; i < size.length; i++) {
				size[i].left = 10
				size[i].top = starTop + (72 * i);
			}
		})
		//同一时间只能展示一个，放弃右边的
		// this.RiconAD.onResize(size =>{
		// 	//偶数  自适应排位置
		// 	var starTop = 0;
		// 	if(global.iconCount%2 === 0){
		// 		starTop = this.systemInfo.windowHeight/2 - global.iconCount/2*size[0].height;
		// 	}else{
		// 		starTop = this.systemInfo.windowHeight/2 - global.iconCount/2*size[0].height+size[0].height/2;
		// 	}
		// 	for (let i = 0; i < size.length; i++) {
		// 		size[i].left = this.systemInfo.windowWidth-10
		// 		size[i].top = starTop + (72*i);
		// 	}
		// })
	}

	/**
	 * 显示小游戏推荐广告
	 */
	public showIconAd(dir: string) {
		if (dir == 'R') {
			if (this.RiconAD) {
				this.RiconAD.load().then(() => {
					this.RiconAD.show()
				}).catch((err) => {
					console.error(err)
				})
			} else {
				setTimeout(this.createIconAd, 1000)
			}
		} else {
			if (this.LiconAD) {
				this.LiconAD.load().then(() => {
					this.LiconAD.show()
				}).catch((err) => {
					console.error(err)
				})
			} else {
				setTimeout(this.createIconAd, 1000)
			}
		}
	}

	/**创建格子广告 */
	public createGridAd(count: number) {
		this.gridAd = wx.createGridAd({
			adUnitId: global.latticeAdunit,
			adTheme: 'white',
			gridCount: count,
			adIntervals: 30,
			style: {
				left: 0,
				top: this.systemInfo.windowHeight / 2 - 350,
				width: 500,
				opacity: 0.8
			}
		})
		this.gridAd.onLoad(() => {
			console.log('=====> @framework, 格子广告加载成功');
			this.gridAdCunt = count;
		});
		this.gridAd.onError((res) => {
			console.log('=====> @framework, 格子广告加载失败：', res);
		});
	}

	/**显示格子广告 */
	public showGridAd(count: number) {
		//数量不一样的时候重新创建格子
		if (count != this.gridAdCunt) {
			if (this.gridAd) {
				this.gridAd.destroy();
			}
			this.createGridAd(count);
		}
		this.gridAd.show();
	}

	/**隐藏格子广告 */
	public hideGridAd() {
		this.gridAd.hide();
	}

	/**
	 * 显示转发和分享到朋友圈
	 * @param bool 是否使用带 shareTicket 的转发详情
	 */
	public showShareMenu(bool: boolean = false) {
		if (window.wx) {
			wx.showShareMenu({
				withShareTicket: bool,
				menus: ['shareAppMessage', 'shareTimeline']
			})
		}
	}
}

export const Wechat = wechat._instance;
