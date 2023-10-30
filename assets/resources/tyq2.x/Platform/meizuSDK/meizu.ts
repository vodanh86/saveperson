//2021年3月15日版

class meizu {
    ////////////////////////////
    // 类成员
    ///////////////////////////
    public static readonly _instance: meizu = new meizu();
    /** 系统信息 */
	private systemInfo: any = null;
    /** banner广告id */
    private _bannerAdUnitId = 'WhRwDMYh';
    /** 奖励视频广告id */
    private _rewardedVideoAdUnitId = 'VtOtGAoC';
    /**插屏广告id */
    private _interstitialAdUnitId = '94URyDKw';
    /**插屏广告AD实例 */
    private interstitialAd: any = null;
    /** banner广告对象 */
    private bannerAd: any = null;
    /** 奖励视频广告对象 */
    private rewardedVideoAd: any;
    /**网络状态 */
    netWorkInfo: any;
    

    ////////////////////////////
    // get、set访问器
    ///////////////////////////
    public set bannerAdUnitId(adUnitId: string) {
        this._bannerAdUnitId = adUnitId;
    }

    public set rewardedVideoAdUnitId(adUnitId: string) {
        this._rewardedVideoAdUnitId = adUnitId;
    }



    /**获取系统信息。 */
	getSystemInfo(){
        console.log("系统信息",mz.getSystemInfo());
       return mz.getSystemInfo()
    }


    /////////////////////
    //banner广告
    ////////////////////

    /**
     * @description 显示banner广告
     */
    public showBannerAd() {
        if (this.bannerAd) return
        //创建 Banner 广告组件
        var screenHeight = qg.getSystemInfoSync().screenHeight;
        var screenWidth = qg.getSystemInfoSync().screenWidth;
        console.log("系统高度", screenHeight, "screenWidth", screenWidth);

        this.bannerAd = mz.createBannerAd({
            adUnitId: this._bannerAdUnitId,   //广告id，使用申请的id
            style: {
                left: 0,
                top: screenHeight - screenWidth / 6.7,
                width: screenWidth,    // 设置banner需要的宽度，横屏游戏宽度建议使用参考值1440，必须设置              
                height: screenWidth / 6.7    // 广告期望高度，在onResize里面可以根据广告的高度重新设置高度            
            }
        });
        //设置成功加载回调
        this.bannerAd.onLoad(() => {
            console.log("banner 广告加载成功");
            this.bannerAd.show();
        })
        // this.bannerAd.onResize((res)=>{
        //     console.log("Banner 尺寸改变"); 
        //    let  screenHeight = qg.getSystemInfoSync().screenHeight; 
        //    //重新修改位置           
        //     this.bannerAd.style.top = screenHeight - res.height; //确定左上角位置，为底部位置
        //     this.bannerAd.style.left = 0;
        //     this.bannerAd.style.width =  res.width;
        //      this.bannerAd.style.height = res.height;  
        // });
    }


    /**隐藏banner广告 */
    hideBannerAd() {
        console.log("----> hideBannerAd", this.bannerAd);
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }

    

    /////////////////////
    //激励广告
    ////////////////////
    showRewardedVideoAd() {
        return new Promise<void>((resolve, reject) => {
        this.rewardedVideoAd = mz.createRewardedVideoAd({
            adUnitId: this._rewardedVideoAdUnitId
        });
        this.rewardedVideoAd.load()
        this.rewardedVideoAd.onLoad(() => {
            this.rewardedVideoAd.show()
        })
        this.rewardedVideoAd.onClose(()=>{   
            resolve()     
            // 发放奖励逻辑涉及动画建议延时500ms操作   
        });
    })
    }

    



    /////////////////////
    //插屏广告
    ////////////////////

    /**
     * 展示插屏广告
     */
    public showInterstitialAd() {
        console.log("插屏广告");
        this.interstitialAd = mz.createInsertAd({    
            adUnitId: this._interstitialAdUnitId
        })
        this.interstitialAd.onLoad(()=>{    
            console.log("insert 广告加载成功");     
            this.interstitialAd.show(()=>{
                console.log("insert 广告展示成功"); 
            })
        })
        this.interstitialAd.load();  //调用load成功后会回调onLoad。在onLoad里面调用show即可展示
    }


    /**网络状态 */
    getNetworkType() {
        mz.getNetworkType({ success: (res) => { 
            console.log("getNetworkType success = " + res.networkType); 
            this.netWorkInfo.string = res.networkType; 
        }, fail: (res) => { 
            console.log("getNetworkType success = " + res.errMsg); 
            this.netWorkInfo.string = res.errMsg; }, 
            complete: (res) => { 
                console.log("getNetworkType complete = " + res); 
            } })
    }

    /**获取当前渠道名字 */
	public returnAppName(): string {
		return mz.getProvider()
	}
}
export const Meizu = meizu._instance
