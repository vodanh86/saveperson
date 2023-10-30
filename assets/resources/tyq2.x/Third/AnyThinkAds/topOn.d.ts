declare namespace globalThis {
    namespace ATBannerJSSDK {
        var kATBannerAdLoadingExtraBannerAdSizeStruct;
        var kATBannerAdShowingPositionTop;
        var kATBannerAdShowingPositionBottom;
        var kATBannerAdAdaptiveOrientationPortrait;
        var kATBannerAdAdaptiveWidth;
        var kATBannerAdAdaptiveOrientation;
        function loadBanner(a, b);
        function setAdListener(obj);
        function showAdInPosition(a, b);
        function createLoadAdSize(a, b);
        function removeAd(id);
    }
    namespace ATRewardedVideoJSSDK {
        function showAd(is: string);
        function setAdListener(listen: any);
        function loadRewardedVideo(id: string, set: any);
        var userIdKey: string;
        let userDataKey: string;
    }
    namespace ATJSSDK {
        function printLog(str);
        function initSDK(appid, appkey);
        function setLogDebug(b: boolean);
    }

    namespace ATInterstitialJSSDK {
        function setAdListener(obj: any);
        function showAd(obj);
        var UseRewardedVideoAsInterstitial;
        function loadInterstitial(a, b);
        function showAdInPosition();
        function showAdInPosition();
    }
    namespace ATNativeJSSDK {
        function setAdListener(obj);
        function removeAd(id)
        function loadNative(a, b);
        function showAd(a, b);
        function createLoadAdSize(a, b);
        class AdViewProperty {
            public parent;
            public createItemViewProperty(...param);
            public appIcon;
            public cta;
            public mainImage;
            public title;
            public desc;
            public dislike;
        }
    }
}