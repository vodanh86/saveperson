// import { Notifications } from "../../notification/notifications";
//2021年1月7日版本

import TyqEventMgr from "../../tyq-event-mgr";
import tyqExtend from "../../tyq_extend";


// TODO: 录制视频成功，并且打印出视频所在位置，分享视频的时候显示shareVideo: fail parse share info fail; 把功能移植到特工上面是可以分享的，不知道是不是录制内容问题
class toutiao {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance: toutiao = new toutiao();
	/** 系统信息 */
	private systemInfo: any = null;
	/** banner广告对象 */
	private bannerAd: any = null;
	/** 奖励视频广告对象 */
	private rewardedVideoAd: any = null;
	/** 全局唯一的录屏管理器 */
	private GameRecorderManager: any = null;
	/**客服按钮对象 */
	public ContactButton: any = null;
	/**更多游戏按钮 */
	public MoregameButton: any = null;
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
	/** 录屏中断开始事件 */
	private interrupBeginListener: Function = null;
	/** 录屏中断结束事件 */
	private interrupEndListener: Function = null;
	/** banner广告id */
	private _bannerAdUnitId = '20bfdbajjibh1jjdd6';
	private _bannerAdRefreshTimeOutId: number = 0;
	/** 奖励视频广告id */
	private _rewardedVideoAdUnitId = '17fiaf9in9n22630nb';
	private _closeRewardVideoListener: Function = null;
	/**插屏广告ID */
	private __interstitialAdUnitId = "aiikioo1db8aj0bffc";
	/**插屏广告AD实例 */
	private interstitialAd: any = null;

	////////////////////////////
	// get、set访问器
	///////////////////////////
	public set bannerAdUnitId(adUnitId: string) {
		this._bannerAdUnitId = adUnitId;
	}

	public set rewardedVideoAdUnitId(adUnitId: string) {
		this._rewardedVideoAdUnitId = adUnitId;
	}

	public set closeRewardVideoListener(cb: Function) {
		this._closeRewardVideoListener = cb;
	}
	////////////////////////////
	// 构造器
	///////////////////////////
	protected constructor() {
		if (window.tt) {
			this.registerRecordScreenEvent();
			//this.handle();
		}
	}
	////////////////////////////
	// 登录模块
	///////////////////////////
	public toutiaoLogin() {
		return new Promise((resolve, reject) => {
			this.getSystemInfoSync();
			let loginData = {
				code: '',
				anonymousCode: '',
				name: null,
				photo: null
			};
			this.login()
				.then((res: { code: string; anonymousCode: string; isLogin: boolean }) => {
					loginData.code = res.code;
					loginData.anonymousCode = res.anonymousCode;
					if (res.isLogin) {
						this.getUserInfo()
							.then((data: { userInfo: any; rawData: string; signature?: string; encryptedData?: string; iv?: string }) => {
								loginData.name = data.userInfo.nickName;
								loginData.photo = data.userInfo.avatarUrl;
								resolve(loginData);
							})
							.catch(() => {
								reject(loginData);
							});
					} else {
						resolve(null);
					}
				})
				.catch(() => {
					reject(null);
				});
		});
	}

	/**
	 * @description 获取临时登录凭证
	 */
	private login() {
		return new Promise((resolve, reject) => {
			tt.login({
				/** 未登录时，是否强制调起登录框 */
				force: false,
				success: (res: { code: string; anonymousCode: string; isLogin: boolean }) => {
					console.log(`login调用成功${res.code} ${res.anonymousCode}`);
					resolve(res);
				},
				fail: (res: any) => {
					console.log('login调用失败');
					reject();
				}
			});
		});
	}

	/**
	 * @description 获取已登录用户的基本信息或特殊信息
	 * @tips 本 API 依赖于login，请确保调用前已经调用了该API
	 */
	public getUserInfo() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		return new Promise((resolve, reject) => {
			tt.getUserInfo({
				/** 是否需要返回敏感数据 */
				withCredentials: true,
				success: (res: { userInfo: object; rawData: string; signature?: string; encryptedData?: string; iv?: string }) => {
					console.log(`getUserInfo调用成功${res.userInfo}`);
					resolve(res);
				},
				fail: (res: any) => {
					console.log('getUserInfo调用失败: ', res);
					reject();
				}
			});
		});
	}

	////////////////////////////
	// banner广告
	///////////////////////////
	/**
	 * @description 显示banner广告
	 * @param refreshTime 自动刷新时间，默认10秒，0为不刷新；
	 */
	public showBannerAd(refreshTime: number = 10) {
		console.log("创建banner广告");

		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		if (!toutiao.isSupportedAPI(tt.createBannerAd)) {
			console.log('不支持banner广告');
			return;
		}
		this.hideBannerAd();
		this.createBannerAd();
		this.bannerAd.onLoad(() => {
			console.log('=====> @framework, banner广告加载成功');
			this.bannerAd.show().then((args: any) => {
				console.log("----> =====> @framework, banner广告 show 成功", args);
			}).catch((args: any) => {
				console.log("----> =====> @framework, banner广告 show 失败", args);
			});
			// 移除setTimeout
			if (this._bannerAdRefreshTimeOutId != 0) {
				clearTimeout(this._bannerAdRefreshTimeOutId);
				this._bannerAdRefreshTimeOutId = 0;
			}
			// 延时刷新banner
			if (refreshTime > 0) {
				this._bannerAdRefreshTimeOutId = setTimeout(() => {
					if (this.bannerAd)
						this.showBannerAd(refreshTime);
				}, refreshTime * 1000);
			}
		});
	}

	/**
	 * @description 隐藏banner广告
	 */
	public hideBannerAd() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		console.log("----> hideBannerAd", this.bannerAd);
		if (this.bannerAd) {
			this.bannerAd.hide();
			this.bannerAd.destroy();
			this.bannerAd = null;
		}
	}

	/**
	 * @description 创建banner广告
	 * @tips 每个广告实例只会与一条固定的广告素材绑定。开发者如果想要展示另一条广告，需要创建一个新的bannerAd实例。
	 * Banner广告一般的比例为16:9，最小宽度是128（设备像素），最大宽度是208（设备像素）。开发者可以在这之间自由指定广告宽度。广告组件会自动等比例缩放素材。
	 */
	private createBannerAd() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		console.log('12342365476572354r52345')
		console.log(this._bannerAdUnitId)
		if (this.bannerAd) {
			return;
		}
		let targetBannerAdWidth = 208;
		this.bannerAd = tt.createBannerAd({
			// 广告单元 id
			adUnitId: this._bannerAdUnitId,
			style: {
				// 根据系统约定尺寸计算出广告高度
				top: this.systemInfo.windowHeight - (targetBannerAdWidth / 16 * 9),
				left: (this.systemInfo.windowWidth - targetBannerAdWidth) / 2,
				width: targetBannerAdWidth
			}
		});

		this.bannerAd.onError((res) => {
			console.log('=====> @framework, banner广告加载失败：', res);
		});
		this.bannerAd.onResize((res: { width: number; height: number }) => {
			if (this.bannerAd && targetBannerAdWidth !== res.width) {
				this.bannerAd.style.top = this.systemInfo.windowHeight - res.height;
				this.bannerAd.style.left = (this.systemInfo.windowWidth - res.width) / 2;
				this.bannerAd.style.width = res.width;
			}
		});
	}
	/**
   * 调起抖音看广告视频
   * @param str 为什么看视频
   */
	public showRewardVideoAd(str: string) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		return new Promise((resolve, reject) => {
			this.createRewardedVideoAd().then(() => {
				TyqEventMgr.ins.onAdLoad();
				this.rewardedVideoAd.show().then(() => {
					TyqEventMgr.ins.onAdShow();
				}).catch(() => {
					this.rewardedVideoAd.load().then(() => {
						TyqEventMgr.ins.onAdLoad();
						TyqEventMgr.ins.onAdShow();
						this.rewardedVideoAd.show();
					})
				});
			}, (err?) => {
				console.log('=====> @framework, 奖励视频对象为不存在');
				/* 观看视频回调失败之后的回调 */
				reject();
				return null;
			});
			//关闭视频回调。
			let closeListener = (res) => {
				//用户完整的看完了视频
				if (res.isEnded) {
					TyqEventMgr.ins.onAdSuccess();
					// resolve();
					//看完广告获得薯片
				} else {
					/* 观看广告半路退出时的回调 */
					TyqEventMgr.ins.onAdCancel();
					// reject();
				}
				resolve(res.isEnded);
				this.closeRewardVideo();
				this.rewardedVideoAd.offClose(closeListener);
			};
			//当用户点击了 Video 广告上的关闭按钮时，会触发 close 事件的监听器。
			this.rewardedVideoAd.onClose(closeListener);
			let errorListener = (res) => {
				console.log('=====> @framework, 加载奖励视频错误：', res);
				var msg = "观看广告失败：未知原因"
				switch (res.errCode) {
					case 1000:
						msg = "观看广告失败：后端错误调用失败"
						break;
					case 1001:
						msg = "观看广告失败：参数错误"
						break;
					case 1002:
						msg = "观看广告失败：广告单元无效"
						break;
					case 1003:
						msg = "观看广告失败：内部错误"
						break;
					case 1004:
						msg = "观看广告失败：无适合的广告"
						break;
					case 1005:
						msg = "观看广告失败：广告组件审核中"
						break;
					case 1006:
						msg = "观看广告失败：广告组件被驳回"
						break;
					case 1007:
						msg = "观看广告失败：广告能力被禁用"
						break;
					case 1008:
						msg = "观看广告失败：广告单元已关闭"
						break;
					case 20002:
						msg = "观看广告失败：不支持 banner 广告 API"
						break;
					case 120002:
						msg = "观看广告失败：今日观看广告次数已达上限"
						break;
					default:
						break;
				}
				reject(msg);
				this.rewardedVideoAd.offError(errorListener);
			};
			this.rewardedVideoAd.onError(errorListener);
		});
	}
	/**
	 * 展示插屏广告
	 */
	public showInterstitialAd() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		console.log("插屏广告");
		this.creatorInterstitialAd().then(() => {
			this.interstitialAd.show().then(() => {
				console.log("插屏广告显示成功");
			}).catch((err) => {
				console.log(err);
				console.log("插屏广告显示失败");
				//失败就再请求一次
				this.interstitialAd.load().then(() => {
					this.interstitialAd.show();
				})
			});
		})
	}
	/**创建插屏广告 */
	private creatorInterstitialAd() {
		return new Promise<void>((resolve, reject) => {
			if (!tt.createInterstitialAd) {
				console.log("不支持插屏广告");
				reject();
				return;
			}
			if (this.interstitialAd) {
				console.log("插屏广告已经创建");
				resolve();
				return;
			}
			this.interstitialAd = tt.createInterstitialAd({
				adUnitId: this.__interstitialAdUnitId
			})
			this.interstitialAd.load().then(() => {
				resolve();
			}, (err) => {
				console.log("插屏广告出错啦");
				console.log(err);
			}).catch((err) => {
				console.log("插屏广告出错");
				console.log(err);
				reject();
			});
		});
	}


	/**
	 * 调起抖音看广告视频
	 * @param str 为什么看视频
	 */
	public showRewardVideoAd1(str: string) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		//友盟+ 统计
		// if(window.tt.uma){
		// }
		return new Promise<void>((resolve, reject) => {
			this.createRewardedVideoAd();
			if (!this.rewardedVideoAd) {
				console.log('=====> @framework, 奖励视频对象为不存在');
				tt.uma.trackEvent("touchVideo", { source: str, state: "失败" });
				/* 当观看广告半路失败之后的回调 */
				reject();
				return null;
			}
			this.rewardedVideoAd.load()
				.then(() => {
					this.rewardedVideoAd.show();
				}).catch((err: any) => {
					console.log("----> =====> @framework, 奖励视频show失败", err);
					/* 当观看广告半路失败之后的回调 */
					reject();
					tt.uma.trackEvent("touchVideo", { source: str, state: "失败" });

				});
			//关闭视频回调。
			let closeListener = (res) => {
				//用户完整的看完了视频
				if (res.isEnded) {
					resolve();
					//看完广告获得薯片
					// this.getChips(0);
					tt.uma.trackEvent("touchVideo", { source: str, state: "成功" });
				} else {
					reject();
					tt.uma.trackEvent("touchVideo", { source: str, state: "失败" });

				}
				this.closeRewardVideo();
				this.rewardedVideoAd.offClose(closeListener);
			};
			//当用户点击了 Video 广告上的关闭按钮时，会触发 close 事件的监听器。
			this.rewardedVideoAd.onClose(closeListener);
			let errorListener = (res) => {
				console.log('=====> @framework, 加载奖励视频错误：', res);
				var msg = "观看广告失败：未知原因"
				switch (res.errCode) {
					case 1000:
						msg = "观看广告失败：后端错误调用失败"
						break;
					case 1001:
						msg = "观看广告失败：参数错误"
						break;
					case 1002:
						msg = "观看广告失败：广告单元无效"
						break;
					case 1003:
						msg = "观看广告失败：内部错误"
						break;
					case 1004:
						msg = "观看广告失败：无适合的广告"
						break;
					case 1005:
						msg = "观看广告失败：广告组件审核中"
						break;
					case 1006:
						msg = "观看广告失败：广告组件被驳回"
						break;
					case 1007:
						msg = "观看广告失败：广告能力被禁用"
						break;
					case 1008:
						msg = "观看广告失败：广告单元已关闭"
						break;
					case 20002:
						msg = "观看广告失败：不支持 banner 广告 API"
						break;
					case 120002:
						msg = "观看广告失败：今日观看广告次数已达上限"
						break;
					default:
						break;
				}
				reject(msg);
				tt.uma.trackEvent("touchVideo", { source: str, state: "失败" });
				this.rewardedVideoAd.offError(errorListener);
			};
			this.rewardedVideoAd.onError(errorListener);
		});
	}

	/**
   * @description 创建视频广告单例（小游戏端是全局单例）
   * @tips 全局只有一个videoAd实例，重复创建没有用
   */
	private createRewardedVideoAd() {
		return new Promise<void>((resolve, reject) => {
			if (!tt.createRewardedVideoAd) {
				console.log('=====> @framework, 当前客户端版本过低，无法使用奖励视频功能，请升级到最新客户端版本后重试');
				reject();
				return;
			}
			if (this.rewardedVideoAd) {
				resolve();
				return;
			}
			this.rewardedVideoAd = tt.createRewardedVideoAd({
				adUnitId: this._rewardedVideoAdUnitId
			});
			this.rewardedVideoAd.load().then(() => {
				resolve();
			}, () => {
				console.log("加载失败");
			}).catch((err: any) => {
				console.log("----> =====> @framework, 奖励视频show失败", err);

				reject(err);
			});

		});

	}

	private closeRewardVideo() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		if (this._closeRewardVideoListener) {
			this._closeRewardVideoListener();
		}
	}
	////////////////////////////
	// 分享
	///////////////////////////
	/**
	 * @description 主动拉起转发界面
	 * @param _title 转发标题，不传则默认使用当前小游戏的名称。
	 * @param _imageUrl 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径，显示图片长宽比推荐 5:4
	 * @param _query 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionSync() 或 tt.onShow() 获取启动参数中的 query。
	 */
	public shareAppMessage(_title: string, _videoUrl: string, _extra: Array<string>, _query?: string) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise<any>((resolve, reject) => {
			tt.shareAppMessage({
				// article	发布图文内容
				// video	发布视频内容
				// token	口令分享，生成一串特定的字符串文本，仅头条APP支持
				channel: 'video', //
				title: _title,
				// imageUrl: _videoUrl,

				//query: _query,
				/** 附加信息 */
				extra: {
					videoTag: _extra[0],
					videoPath: _videoUrl,
					hashtag_list: _extra,
					videoTopics: _extra,
					withVideoId: true,
				},
				success: (res) => {
					//分享录屏 获得薯片
					// this.getChips(1);
					// this.getVideoInfo(res.videoId, _videoUrl)
					resolve(res.videoId);

				},
				fail: (e) => {
					console.error(e);
					reject();
				}
			});
		});
	}
	/**获取视频分享的信息 */
	public getVideoInfo(id, url) {
		console.log("获取视频分享的信息");
		console.log(id);
		tt.request({
			url: url,
			method: "POST",
			data: {
				alias_ids: [id],
			},
			success: (res) => {
				console.log(res);

				if (res.data.data[0].video_info.cover_url) {


					console.log(res.data.data[0].video_info); // 包含 cover_url，还有其它字段
				} else {
					setTimeout(() => {
						this.getVideoInfo(id, url);
					}, 5000);
				}
			},
		});
	}
	//屏幕内截图
	public screenshot() {
		const canvas = tt.createCanvas();
		canvas.getContext("2d");
		// // console.log("开始屏幕内截图");
		// // oTempFilePath 方法
		// canvas.toTempFilePath({
		// 	x: 200,
		// 	y: 200,
		// 	width: 200,
		// 	height: 150,
		// 	destWidth: 200,
		// 	destHeight: 150,
		// 	success: (res) => {


		// 		console.log(res.tempFilePath);

		// 	},
		// });
		return new Promise<any>((resolve, reject) => {
			canvas.toTempFilePath({
				x: 200,
				y: 200,
				width: 200,
				height: 150,
				destWidth: 200,
				destHeight: 150,
				success: (res) => {
					console.log("开始屏幕内截图");
					resolve(res)
				},
				fail: (e) => {
					console.error(e);
					reject();
				}
			});
		});



	}
	/* 创建图片 */
	public createImage(tempFilePath) {
		console.log("开始绘制图片");

		const image = tt.createImage();
		image.src = tempFilePath;
		image.width = 200;
		image.height = 200;
		image.addEventListener("load", (res) => {
			console.log("加载成功");
		});
		image.addEventListener("error", (res) => {
			console.log("加载失败");
		});

	}

	/* 返回当前app的名字 */
	public returnAppName(): string {
		return this.systemInfo.appName.toUpperCase();
	}

	/**跳转视频播放页 
	 * @param videoId 传入的视频id
	*/
	public navigateToVideoView(videoId) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise<void>((resolve, reject) => {
			tt.navigateToVideoView({
				videoId: videoId,

				success: (res) => {
					resolve(res.videoId);
					/* res结构： {errMsg: string } */
				},
				fail: (e) => {
					if (e.errCode === 1006) {
						tt.showToast({
							title: "something wrong with your network",
						});
					}
					reject();
				}
			});
		});
	}
	/**获取视频点赞数，封面图 
	 * @param videoId 传入的视频id//可以是数组形式
	*/
	public request(videoId) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise<void>((resolve, reject) => {
			tt.request({
				url: "https://gate.snssdk.com/developer/api/get_video_info",
				method: "POST",
				data: {
					alias_ids: [videoId],
				},
				success: (res) => {
					resolve(res);

				},
				fail: (e) => {

					reject();
				}
			});
		});
	}
	/**
	 * @description 注册GameRecorderManager
	 */
	private registerRecordScreenEvent() {
		this.getSystemInfoSync();

		if (!toutiao.isSupportedAPI(tt.getGameRecorderManager)) {
			console.log('=====> @framework,当前客户端版过低，无法使用奖励视频功能，请升级到最新客户端版本后重试');
			return;
		}
		this.GameRecorderManager = tt.getGameRecorderManager();
		// 监听录屏开始事件
		this.GameRecorderManager.onStart((res: any) => {
			if (this.startListener) {
				this.startListener();
			}
		});
		// 监听录屏继续事件
		this.GameRecorderManager.onResume(() => {
			if (this.resumeListener) {
				this.resumeListener();
			}
		});
		// 监听录屏暂停事件
		this.GameRecorderManager.onPause(() => {
			if (this.pauseListener) {
				this.pauseListener();
			}
		});
		// 监听录屏结束事件。可以通过 onStop 接口监听录屏结束事件，获得录屏地址
		this.GameRecorderManager.onStop((res: { videoPath: string }) => {
			if (this.stopListener) {
				this.stopListener(res.videoPath, res);
			}
		});
		// 监听录屏错误事件
		this.GameRecorderManager.onError((res: { errMsg: string }) => {
			console.log('=====> @framework,录屏错误：', res.errMsg);
			if (this.errorListener) {
				this.errorListener();
			}
		});
		// 监听录屏中断开始
		this.GameRecorderManager.onInterruptionBegin(() => {
			if (this.interrupBeginListener) {
				this.interrupBeginListener();
			}
		});
		// 监听录屏中断结束
		this.GameRecorderManager.onInterruptionEnd(() => {
			if (this.interrupEndListener) {
				this.interrupEndListener();
			}
		});
		//监听用户分享
		tt.onShareAppMessage(function (res) {
			return {
				templateId: "3hlt8qdiwq012h84b8",
				success() {
					// console.log('转发发布器已调起');
				},
				fail() {
					// console.log('转发发布器调起失败');
					//console.log(res);
				}
			}
		})
	}

	/**
	 * @description 开始录屏
	 * @param _duration 录屏的时长，单位 s，必须大于3s，最大值 120（2 分钟）
	 * @param callback 录制开始事件回调
	 */
	public startRecordScreen(_duration: number, callback?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		this.startListener = callback;
		this.GameRecorderManager.start({
			duration: _duration
		});
	}

	/**
	 * @description 暂停录屏
	 */
	public pauseRecordScreen(callback?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		this.pauseListener = callback;
		this.GameRecorderManager.pause();
	}

	public resumeRecordScreen(callback?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		this.resumeListener = callback;
		this.GameRecorderManager.resume();
	}

	/**
	 * @description 暂停录屏
	 * @param callback
	 */
	public stopRecordScreen(callback?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		this.stopListener = callback;
		this.GameRecorderManager.stop();
	}
	////////////////////////////
	// 其他能力
	///////////////////////////
	/**
	 * @description 检查用户当前的 session 状态是否有效。
	 * @tips 只有成功调用 tt.login 才会生成 session，checkSession 才会进入 success 回调当用户退出登录会清除 session
	 */
	private checkSession() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise<void>((resolve, reject) => {
			tt.checkSession({
				success: () => {
					resolve();
					console.log('session未过期');
				},
				fail: () => {
					reject();
					console.log('session已过期，需要重新登录');
				}
			});
		});
	}
	// /**显示客服管理按钮 */
	// public showContactButton(url, top, left, success?: Function, fail?: Function) {

	// 	const Framesize = cc.view.getFrameSize()
	// 	if (!this.ContactButton) {
	// 		this.ContactButton = tt.createContactButton({
	// 			type: "image", //
	// 			image: url,
	// 			/** 附加信息 */
	// 			style: {
	// 				left: Framesize.width * left,
	// 				top: (Framesize.height / (Framesize.width / 375) / 2 - 667 / 2 + 535) * (Framesize.width / 375),
	// 				width: 50,
	// 				height: 50,
	// 				borderRadius: 50
	// 				//borderWidth: 0,
	// 				// textAlign:"center"

	// 			},
	// 			success: (res) => {
	// 				console.log("客服创建成功");
	// 				if (success) {
	// 					success();
	// 				}
	// 				//this.ContactButton.show();
	// 			},
	// 			fail: (e) => {
	// 				console.log("客服创建失败");
	// 				if (fail) {
	// 					fail();
	// 				}
	// 			}
	// 		});
	// 	}
	// 	else {
	// 		this.ContactButton.show();
	// 	}
	// }
	/**显示客服管理按钮 */
	public showContactButton(url, pos: cc.Vec3, size: cc.Size) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		const pixelSize = cc.director.getWinSizeInPixels();
		const Framesize = cc.view.getFrameSize();
		const scalX = Framesize.width / pixelSize.width;
		const scalY = Framesize.height / pixelSize.height;
		if (!this.ContactButton) {
			this.ContactButton = tt.createContactButton({
				type: "image", //
				image: url,
				/** 附加信息 */
				style: {
					left: Framesize.width / 2 + Math.abs(pos.x) * scalX,
					top: Framesize.height / 2 + Math.abs(pos.y) * scalY,
					width: size.width * scalX,
					height: size.height * scalY,
					borderRadius: 0,
					borderWidth: 0,
					//lineHeight: 40,
				},
				success: (res) => {
					console.log("客服创建成功");

				},
				fail: (e) => {
					console.log("客服创建失败");
				}
			});
		} else {
			this.ContactButton.show();
		}
	}


	/**客服按钮隐藏 */
	public hideContactButton() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		if (!this.ContactButton) return;
		this.ContactButton.hide();
	}
	/**添加更多游戏的按钮 */
	// public createMoreGamesButton(url, pos: cc.Vec3, size: cc.Size) {
	// 	if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

	// 	const pixelSize = cc.director.getWinSizeInPixels();
	// 	const Framesize = cc.view.getFrameSize();
	// 	const scalX = Framesize.width / pixelSize.width;
	// 	const scalY = Framesize.height / pixelSize.height;
	// 	if (!this.ContactButton) {
	// 		this.ContactButton = tt.createMoreGamesButton({
	// 			type: "image", //
	// 			image: url,
	// 			/** 附加信息 */
	// 			style: {
	// 				left: Framesize.width / 2 + Math.abs(pos.x) * scalX,
	// 				top: Framesize.height / 2 + Math.abs(pos.y) * scalY,
	// 				width: size.width * scalX,
	// 				height: size.height * scalY,
	// 				borderRadius: 0,
	// 				borderWidth: 0,
	// 				//lineHeight: 40,
	// 			},
	// 			actionType: "box",
	// 			appLaunchOptions: [
	// 				{
	// 					appId: "tta930df8d360b7e6d",
	// 					// query: "gameName=假如学生喜爱写作业&pos=" + pos,
	// 					query: "",
	// 					extraData: {}
	// 				},
	// 				{
	// 					appId: "ttbc61cadc235aa747",
	// 					// query: "gameName=假如学生爱写作业&pos=" + pos,
	// 					query: "",
	// 					extraData: {}
	// 				},
	// 				{
	// 					appId: "ttcf37b98a500cd748",
	// 					// query: "gameName=赛几探险记&pos=" + pos,
	// 					query: "",
	// 					extraData: {}
	// 				},
	// 				{
	// 					appId: "ttefcd997070f6f7bc",
	// 					// query: "gameName=烧脑吧赛几&pos=" + pos,
	// 					query: "",
	// 					extraData: {}
	// 				},

	// 			],

	// 			onNavigateToMiniGameBox(res) {
	// 				console.log("跳转到小游戏盒子", res);
	// 			},
	// 			success: (res) => {
	// 				console.log("更多游戏创建成功");

	// 				this.ContactButton.show();

	// 			},
	// 			fail: (e) => {
	// 				console.log("更多游戏创建失败");
	// 				console.log(e);


	// 			}
	// 		});
	// 	}
	// }
	/**
	 * @description 获取用户已经授权过的配置。结果中只会包含小程序向用户请求过的权限
	 */
	public getSetting() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise((resolve, reject) => {
			tt.getSetting({
				success: (res: any) => {
					resolve(res.authSetting);
				},
				fail: () => {
					reject();
					console.log('session已过期，需要重新登录');
				}
			});
		});
	}

	/**调用方法会提前向用户发出授权请求。该方法不会调用对应接口，只会弹框咨询用户是否授权或者获取用户信息。如果用户之前有授权，该接口直接返回成功，不会跟用户产生交互 */
	public authorize() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise((resolve, reject) => {
			tt.authorize({
				authorize: 'scope.userInfo',
				success: (res: any) => {
					resolve(res.authSetting);
				},
				fail: () => {
					reject();
					console.log('session已过期，需要重新登录');
				}
			});
		});
	}

	/**
	 * @description 返回小游戏启动参数(好友邀请中获取query)
	 */
	private getLaunchOptionsSync() {
		return tt.getLaunchOptionsSync();
	}

	/**
	 *	打开设置页面，返回用户设置过的授权结果。
	 */
	public openSetting() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		return new Promise((resolve, reject) => {
			tt.openSetting({
				success: (res: {}) => {
					resolve(res);
				},
				fail: (res: any) => {
					reject();
				}
			})
		});
	};
	////////////////////////////
	// 震动
	///////////////////////////
	/**
	 * 使手机发生较长时间的振动。
	 * @param callback 回调 (isSuccess, res)
	 */
	public vibrateLong(callback?: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.vibrateLong({
			success(res) {
				if (callback)
					callback(true, res);
			},
			fail(res) {
				if (callback)
					callback(false, res);
			}
		});
	};
	/**
	 * 使手机发生较短时间的振动
	 * @param cb 回调 (isSuccess, res)
	 */
	public vibrateShort(cb?: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.vibrateShort({
			success(res) {
				if (cb)
					cb(true, res);
			},
			fail(res) {
				if (cb)
					cb(false, res);
			}
		});
	};
	////////////////////////////
	// 通用
	///////////////////////////
	/**
	 * @description 获取系统信息
	 */
	private getSystemInfoSync() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		try {
			this.systemInfo = tt.getSystemInfoSync();
			console.log('this.systemInfo', this.systemInfo)
		} catch (e) {
			console.log('获取系统信息失败');
		}
	}

	/**
	 * @description 是否支持改API
	 * @param api
	 */
	private static isSupportedAPI(api: any): boolean {

		return !!api;
	}

	/**
	 * 	关闭小程序
	 * @param 成功回调
	 */
	public exitMiniProgram(cb: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.exitMiniProgram({
			success(res) {
				if (cb)
					cb(true, res);
			},
			fail(res) {
				if (cb)
					cb(false, res);
			}
		});
	};
	/**
	 * 关注抖音号
	 */
	public openAwemeUserProfile() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		tt.openAwemeUserProfile();
	}

	/**
	 * 显示灰色背景的消息提示框
	 * @param title 内容
	 * @param duration 提示框停留时间，单位ms
	 * @param cb 成功后回调
	 */
	public showToast(title: string, duration: number = 3000, cb?: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.showToast({
			title: title,
			duration: duration,
			success: () => {
				if (cb) cb();
			}
		});
	};

	/**
	 * 获取系统信息
	 * @param callback 成功后回调
	 */
	public getSystemInfo(callback?: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.getSystemInfo({
			success: (res) => {
				if (callback) callback(res);
			}
		});
	};

	/**监听用户点击右上角菜单中的“转发”按钮时触发的事件
	 * Tip： 该方法可以监听用户通过右上角菜单中触发的分享操作，在不同宿主端具体的操作会有所差别，在抖音中包括分享和拍抖音，在头条包括分享和发头条，以此类推。
		Tip： 该方法的实际调用链路为

		开发者注册此事件后
		用户点击小游戏菜单中的分享或者拍抖音等按钮
		自动调用开发者通过 tt.onShareAppMessage 定义的函数，并传入带有 channel 参数的对象，执行得到该函数的返回对象，
		接着调用 tt.shareAppMessage ，将上一步返回的对象传入其中，拉起分享。
		Tip：该方法可以用于监听用户在小游戏右上角菜单中的分享操作，开发者可以监听此事件并自定义分享行为。
	 */
	public onShareAppMessage(callback?: Function): void {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.onShareAppMessage(function (res) {
			// console.log(res);
			if (callback) callback(res);
		})
	}

	/**
	 * 
	 * @param time 生成最后几秒的视频
	 * @param videoPath 视频地址，在结束录频时会返回，传入这里
	 */
	public clipVideo(time: number, videoPath: any, callback?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		const recorder = this.GameRecorderManager;
		recorder.clipVideo({
			path: videoPath,
			timeRange: [time, 0],
			success(res) {
				//如果成功，并且有回调
				if (callback) {
					callback(res);
				}
				// console.log(res.videoPath); // 生成最后time秒的视频
			},
			fail(e) {
				console.error(e);
			},
		});
	}

	/**
	 * 显示分享按钮
	 */
	public showShareMenu() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.showShareMenu({
			success(res) {
				console.log("已成功显示转发按钮");
			},
			fail(err) {
				console.log("showShareMenu 调用失败", err.errMsg);
			},
			complete(res) {
				console.log("showShareMenu 调用完成");
			},
		})
	}

	/**
	 * 新的登录接口 获取code
	 *
	 * @param bool 是否强制拉取登录框
	 */
	public TTLogin(cb: Function, fail?: Function, bool = false) {
		const name = Toutiao.returnAppName();
		let bools = null
		if (!bool) {
			bools = false;
			if (name == 'DOUYIN' || name == 'douyin_lite') {
				bools = true;
			}
		} else {
			bools = true;
		}

		tt.login({
			/** 未登录时，是否强制调起登录框 */
			force: bools,
			success: (res: { errMsg: string; code: string; anonymousCode: string; isLogin: boolean }) => {
				if (cb) {
					cb(res);
				}
			},
			fail: (res: any) => {
				if (fail) {
					fail(res);
				}
			}
		})
	}

	/**
	 * 获取用户敏感信息
	 */
	public TTGetUserInfo(cb: Function, fail?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		tt.getUserInfo({
			withCredentials: true,//获取用户敏感信息
			success(res) {
				cb(res);
			},
			fail(res) {
				if (fail) {
					fail(res);
				}
			},
		})
	}

	// // 	/**添加游戏关注 */
	public showFavoriteGuide() {
		tt.showFavoriteGuide({
			type: "bar",
			content: "一键添加到我的小程序",
			position: "bottom",
			success(res) {
				console.log("引导组件展示成功");
			},
			fail(res) {
				console.log("引导组件展示失败");
			},
		});
	}
	// public 
	/* 添加更多游戏 */
	public showMoreGamesModal() {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;
		tt.setMoreGamesInfo({
			appLaunchOptions: [
				{
					appId: "tta930df8d360b7e6d",
					// query: "gameName=假如学生喜爱写作业&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttbc61cadc235aa747",
					// query: "gameName=假如学生爱写作业&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttcf37b98a500cd748",
					// query: "gameName=赛几探险记&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttefcd997070f6f7bc",
					// query: "gameName=烧脑吧赛几&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},

			],
		});


		tt.showMoreGamesModal({
			appLaunchOptions: [
				{
					appId: "tta930df8d360b7e6d",
					// query: "gameName=假如学生喜爱写作业&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttbc61cadc235aa747",
					// query: "gameName=假如学生爱写作业&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttcf37b98a500cd748",
					// query: "gameName=赛几探险记&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},
				{
					appId: "ttefcd997070f6f7bc",
					// query: "gameName=烧脑吧赛几&pos=" + pos,
					query: "foo=bar&baz=qux",
					extraData: {}
				},

			],
			success(res) {
				console.log('success', res.errMsg)
			},
			fail(res) {
				console.log('fail', res.errMsg)
			},
		})
		// tt.onNavigateToMiniProgram(function (res) {
		// 	console.log("open other games", res);
		// 	if (res.errCode != 2) {
		// 		// adLogic.reportAnalytics('clickMoreSuccess', {
		// 		//   name: pos,
		// 		//   errcode: res.errCode,
		// 		// });
		// 	}
		// })
	}



	/**
	 * 获取抖音头像
	 */
	getHeadImage(url: string, cb?: Function, fail?: Function) {
		if (cc.sys.platform != cc.sys.BYTEDANCE_GAME) return;

		const image = tt.createImage();
		image.src = url;
		image.width = 60;
		image.height = 60;
		image.addEventListener("load", (res) => {
			console.log("加载成功");
			console.log(image);

			if (cb) {
				cb(res);
			}
		});
		image.addEventListener("error", (res) => {
			if (fail) {
				fail(res);
			}
			console.log("加载失败");
		});
	}

}
export const Toutiao = toutiao._instance;
