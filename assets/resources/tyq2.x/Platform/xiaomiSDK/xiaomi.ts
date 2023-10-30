
class xiaomi {
    public static readonly _instance: xiaomi = new xiaomi()

    /**激励视频广告对象 */
    private rewardedVideoAd: any
    /**banner广告对象 */
    private bannerAd: any
    /**原生广告对象 */
    private nativeAd: any
    /**原生插屏广告对象 */
    private interstitialAd: any
    /**激励视频广告ID */
    private _rewardVideoAdUnitId = '12345';
    /**banner广告ID */
    private _banneradUnitId = '12345';
    /**原生广告ID */
    private _nativeadUnitId = '';
    /**原生插屏广告ID */
    private _insertAdUnitId = '12345';


    public set bannerAdUnitId(adUnitId: string) {
        this._banneradUnitId = adUnitId;
    }

    public set rewardedVideoAdUnitId(adUnitId: string) {
        this._rewardVideoAdUnitId = adUnitId;
    }

    /***展示激励视频 */
    showRewardedVideoAd(suc: Function, fail: Function) {
        this.rewardedVideoAd = qg.createRewardedVideoAd({
            adUnitId: this._rewardVideoAdUnitId
        });
        this.rewardedVideoAd.show()
        this.rewardedVideoAd.load()
        this.rewardedVideoAd.onLoad(() => {
            console.log('load success')
        })
        this.rewardedVideoAd.onClose(data => {
            console.log('close ad: ${data.isEnded}')
            if (data.isEnded) {
                suc()
            } else {
                fail();
            }
        })
    }

    /**展示插屏广告 */
    showInterstitialAd() {
        this.interstitialAd = qg.createInterstitialAd({
            adUnitId: this._insertAdUnitId
        });
        this.interstitialAd.show();
        this.interstitialAd.onLoad(() => {
            console.log('load success')
        })
    }

    /**展示banner广告 */
    showBannerAd() {
        this.bannerAd = qg.createBannerAd({
            adUnitId: this._banneradUnitId
        })
        //监听Banner广告加载成功回调事件
        this.bannerAd.onLoad(() => {
            console.log('load success')
        })
        //显示Banner
        this.bannerAd.show()
            .catch(err => console.log(err));
        //监听Banner广告尺寸变化事件
        // this.bannerAd.onResize(data => {
        //     console.log('show banner ad width:${data.width}，height: ${data.height}')
        //     console.log('show banner ad realWidth:${data.style.realWidth}，height: ${data.style.realHeight}')
        // })

        //监听Banner广告加载失败回调事件
        this.bannerAd.onError(data => {
            console.log('error: errorMsg: ${data.msg}, erroCode: ${data.code}')
        })
    }

    /**隐藏广告 */
    hideBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.hide()
            this.bannerAd.destroy()
            this.bannerAd = null;
        }
    }
}
export const XM = xiaomi._instance
