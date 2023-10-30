
export interface IPos {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    centerX?: number;
    centerY?: number;
}
export enum ShuffType {
    right,
    left
}

export enum EType {
    // * @param type 1矩阵；2横向；3竖向；4单格子
    rect = 1,
    horizontal,
    vertical,
    grid,
}
export class WXCustomAd {
    private static errCb: Function;
    /**原生模板广告矩阵样式id	 */
    private static _customc_rect_adunit = ['adunit-93a34e2654297dd8', 'adunit-a23c639d4b6a3637', 'adunit-76c5aa3e78075b93'];

    /**原生模板广告横向样式id	 */
    private static _customc_h_adunit = [];

    /**原生模板广告竖向样式id	 */
    private static _customc_v_adunit = [];

    /**原生模板广告单个样式id	 */
    private static _customc_one_adunit = [];

    private static _RGridAdUnitId = ['adunit-f4cb56dda35c63af', 'adunit-37ac96de8c1da842', 'adunit-360130898d75935b'];
    private static _LGridAdUnitId = ['adunit-7ac07fde57dbf052', 'adunit-03625bad0a452f58', 'adunit-fc67d5f28f172052'];
    private static _RGridAdObjList = []
    private static _LGridAdObjList = [];
    private static _GridTimer = null;
    private static _LShowIndex = 0
    private static _RShowIndex = 0;
    private static _gridWaits = [];


    /**广告缓存 */
    private static _ads = {};

    /** */
    private static _waits = [];

    public static preLoadShuffAd(type: ShuffType) {
        if (!window.wx) return;
        let ids: string[] = null;
        let cnt = null;
        let pos = null;
        if (type === ShuffType.right) {
            ids = this._RGridAdUnitId;
            cnt = this._RGridAdObjList;
            pos = { top: 100, right: 70 };
        } else if (type === ShuffType.left) {
            ids = this._LGridAdUnitId;
            cnt = this._LGridAdObjList;
            pos = { top: 100, left: 70 };
        }
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            this.createAd(id, cnt, type, pos, EType.vertical, i)
        }
    }


    protected static createAd(id, cnt, type: ShuffType, pos: IPos, flag: EType, index: number, endCb?) {
        if (!window.wx) return;
        if (this._gridWaits.indexOf(id) != -1) {
            return;
        }
        let sysInfo = wx.getSystemInfoSync();
        let version = sysInfo.SDKVersion;
        if (this.compareVersion(version, '2.11.1') >= 0) {
            console.log("创建原生模板广告" + type, "id:" + id, "pos:", pos);
            let p = this.getPos(flag, pos);
            this._gridWaits.push(id)
            let ad = wx.createCustomAd({
                adUnitId: id,
                adIntervals: 30,
                style: {
                    top: p.top,
                    left: p.left,
                    width: 330, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
                    fixed: false // fixed 只适用于小程序环境
                }
            })

            ad.onLoad(() => {
                console.log('原生模板广告加载成功:', id);
                cnt[index] = ad;
                let i = this._gridWaits.indexOf(id);
                this._gridWaits.splice(i, 1);
                if (endCb) {
                    endCb(ad);
                }
            });
            ad.onError((res) => {
                let i = this._gridWaits.indexOf(id);
                this._gridWaits.splice(i, 1);
                console.log('原生模板广告加载失败:', res.errCode, ' ', res.errMsg);
            });
            ad.onClose(() => {
                cnt[index] = null;
                console.log("原生模板广告关闭");
            });
        }

    }


    public static stopGridTurns() {
        clearInterval(this._GridTimer)
        this._LGridAdObjList.forEach(ad => {
            if (ad) {
                ad.hide();
            }
        });

        this._RGridAdObjList.forEach(ad => {
            if (ad) {
                ad.hide();
            }
        })
    }

    //轮流显示格子广告
    public static showGridTurns(times) {
        clearInterval(this._GridTimer);
        this.showGrideNext(ShuffType.left);
        this.showGrideNext(ShuffType.right);
        this._GridTimer = setInterval(() => {
            this.showGrideNext(ShuffType.left);
            this.showGrideNext(ShuffType.right);
        }, times)
    }

    private static showGrideNext(type: ShuffType) {
        let adObjList = []
        let ids = []
        let pos = null;
        let showIndex = 0;
        let lastIndex = 0
        if (type === ShuffType.left) {
            adObjList = this._LGridAdObjList;
            ids = this._LGridAdUnitId;
            pos = { top: 100, left: 70 };
            showIndex = this._LShowIndex;

        } else {
            adObjList = this._RGridAdObjList;
            ids = this._RGridAdUnitId;
            pos = { top: 100, right: 70 };
            showIndex = this._RShowIndex;
        }
        if (ids.length <= 0) {
            console.error('zzzzzzz无banner广告');
            return;
        }
        lastIndex = showIndex;
        adObjList.forEach(ad => {
            if (ad) {
                ad.hide();
            }
        })
        showIndex++;
        if (showIndex >= ids.length) {
            showIndex = 0;
        }

        if (type === ShuffType.left) {
            this._LShowIndex = showIndex
        } else {
            this._RShowIndex = showIndex
        }
        let ad = adObjList[showIndex];
        if (ad) {
            ad.show();
            console.log("原生广告切换", showIndex)
        } else {
            let id = ids[showIndex];
            if (this._gridWaits.indexOf(id) === -1) {
                if (adObjList[lastIndex]) {
                    adObjList[lastIndex].show()
                }
                this.createAd(id, adObjList, type, pos, EType.vertical, showIndex, (ad) => {
                    console.log("原生广告切换", showIndex)
                    if (adObjList[lastIndex]) {
                        adObjList[lastIndex].hide()
                    }
                    ad.show();
                })
            }
        }
    }



    /**
     * 设置广告id
     * @param rectid 矩阵样式id
     * @param hid 横向样式id
     * @param vid 竖向样式id
     * @param oneid 单格子样式id
     */
    static setadunit(rectid, hid, vid, oneid) {
        this._customc_rect_adunit = rectid;
        this._customc_h_adunit = hid;
        this._customc_v_adunit = vid;
        this._customc_one_adunit = oneid;
    }

    /**
     * 创建一个原生广告对象
     * @param flag 创建来源标识（用标识来控制显示和隐藏）
     * @param type 1矩阵；2横向；3竖向；4单格子
     * @param pos 位置(对象可包含left、right、top、bottom、centerX、centerY字段)。分别表示距离左右上下和中心点的距离
     * @returns 
     */
    static createCustomAd(flag, type: EType, pos: IPos, extraId?: any, errCb?: Function, endCb?: Function) {
        if (!window.wx) return;
        let sysInfo = wx.getSystemInfoSync();
        let version = sysInfo.SDKVersion;
        let ad = null;
        let id = "";
        let self = this;

        if (type == 1) {
            id = this._customc_rect_adunit[this.rand(0, this._customc_rect_adunit.length - 1)];
        } else if (type == 2) {
            id = this._customc_h_adunit[this.rand(0, this._customc_h_adunit.length - 1)];
        } else if (type == 3) {
            id = this._customc_v_adunit[this.rand(0, this._customc_v_adunit.length - 1)];
        }
        else if (type == 4) {
            id = this._customc_one_adunit[this.rand(0, this._customc_one_adunit.length - 1)];
        }
        if (extraId) {
            if (typeof extraId == "string") {
                id = extraId;
            } else if (extraId instanceof Array) {
                id = extraId[this.rand(0, extraId.length - 1)];
            }

        }

        //id不存在
        if (id == "") return;

        // console.log("显示原生模板广告", flag, this._ads, this._waits);
        if (errCb) {
            this.errCb = errCb;
        }
        //缓存有
        if (this._ads[flag]) {
            ad = this._ads[flag];
            console.log("缓存有");
            if (!ad.isShow()) ad.show();
        }
        else if (this.compareVersion(version, '2.11.1') >= 0) {
            console.log("创建原生模板广告" + flag, "id:" + id, "pos:", pos);
            let p = self.getPos(type, pos);
            ad = wx.createCustomAd({
                adUnitId: id,
                adIntervals: 30,
                style: {
                    top: p.top,
                    left: p.left,
                    width: 330, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
                    fixed: false // fixed 只适用于小程序环境
                }
            })

            ad.onLoad(() => {
                self._ads[flag] = ad;
                let index = self._waits.indexOf(flag);
                console.log("原生模板广告加载完成：" + flag, self._waits, index);
                if (endCb) { endCb() }
                if (index == -1)
                    ad.show();
                else {
                    self._waits = self._waits.filter(x => x != flag);
                    // self._waits.splice(index, 1);
                    ad.hide().then(() => {

                    }).catch(() => {
                        // self.hideCustomAd(flag);
                        console.log("第二次hide");
                        ad.hide().catch(() => {
                            console.log("第三次hide");
                        });
                    });
                }

            });
            ad.onError(self.onError.call(self));
            ad.onClose(self.onClose.call(self));
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            // wx.showModal({
            //     title: '提示',
            //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            // })
        }
    }

    public static rand(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }
    /**
     * 隐藏原生模板广告
     * @param flag 
     */
    public static hideCustomAd(flag) {
        let ad = null;

        console.log("隐藏原生模板广告", flag, this._ads, this._waits);
        if (this._ads[flag]) {
            ad = this._ads[flag];
            if (ad.isShow())
                ad.hide().then(() => {

                }).catch(() => {
                    // self.hideCustomAd(flag);
                    console.log("第二次hide");
                    ad.hide().catch(() => {
                        console.log("第三次hide");
                    });
                });
        } else {
            this._waits.push(flag);
        }
    }
    public static destroyCustomAd(flag) {
        if (this._ads[flag]) {
            this._ads[flag].destroy();
            this._ads[flag] = null;
        }
    }
    private static onError(err) {
        console.log(err);
        if (this.errCb) {
            this.errCb();
            this.errCb = null;
        }
    }

    private static onLoad() {
        console.log('多格子原生广告加载成功')
    }

    private static onClose() {
        console.log('原生模板广告关闭')
    }

    private static compareVersion(v1, v2) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0
    }

    /**
     * 获取实际的位置
     * @param type 模板类型
     * @param pos 游戏中的相对位置
     * @returns 
     */
    private static getPos(type, pos: IPos) {
        let sysInfo = wx.getSystemInfoSync();
        let w = 0, h = 0;

        if (type == 1) { w = 330; h = 360; };
        if (type == 2) { w = 360; h = 106; };
        if (type == 3) { w = 72; h = 250; };
        if (type == 4) { w = 68; h = 106; };


        // if (type == 1) { w = 330; h = 360; };
        // if (type == 2) { w = 72; h = 250; };
        // if (type == 3) { w = 72; h = 250; };
        // if (type == 4) { w = 68; h = 106; };


        let sc_w = sysInfo.windowWidth / cc.winSize.width;
        let sc_h = sysInfo.windowHeight / cc.winSize.height;

        let l = (sysInfo.windowWidth - w) / 2;
        let t = (sysInfo.windowHeight - h) / 2;
        if (pos && pos.left != undefined) l = pos.left * sc_w;
        if (pos && pos.top != undefined) t = pos.top * sc_h;
        if (pos && pos.right != undefined) l = sysInfo.windowWidth - w - pos.right * sc_w;
        if (pos && pos.bottom != undefined) t = sysInfo.windowHeight - h - pos.bottom * sc_h;
        if (pos && pos.centerX != undefined) l = (sysInfo.windowWidth - w) / 2 + pos.centerX * sc_w;
        if (pos && pos.centerY != undefined) t = (sysInfo.windowHeight - h) / 2 + pos.centerY * sc_h;

        return {
            left: l,
            top: t
        }
    }
    public static hideAllAd() {
        for (const key in this._ads) {
            this.hideCustomAd(key);
        }


    }
}