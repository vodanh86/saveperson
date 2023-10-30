

// declare class qg {
//     static getSystemInfoSync(): any;//获取系统信息
//     static setKeepScreenOn(cfg: { keepSrceenOn: boolean, success: Function, fail: Function, complete: Function }): void//cfg = {} =>keepSrceenOn:boolean, success:Function, fail:Function, complete:Function  //设置屏幕是否常亮
//     static authorize(cfg: { type: string, success: Function, fail: Function }): void;//cfg={} => type:"code",success:Function,fail:Function  //登录授权
//     static getProfile(cfg: { token: string, success: Function, fail: Function }): void//cfg={} => token:"",success:Function,fail:Function  //获取授权信息
//     static exitApplication(): void//退出游戏，同步方法
//     static vibrateLong(): void;//使手机发生较长时间的振动。
//     static vibrateShort(): void;//使手机发生较短时间的振动
//     static createRewardedVideoAd(data: { posId: string }): void;//创建激励视频
//     static createInterstitialAd(data: { posId: string }): void;//创建插屏广告
//     static createNativeAd(data: { posId: string }): void;//创建原生广告
//     static createBannerAd(data: { posId: string, style: any }): void;//banner广告
// }
declare let qg: any