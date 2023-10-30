### 一· 修改初衷
为了加强项目对资源的管理，以及资源的及时释放。旧版的资源全局统一加载。资源的释放不受控制，新版的资源引入AssetImpl类，对资源进行管理，资源的声明周期将和对应的资源管理同步，当资源不被所有的AssetImpl引用时，将会对资源进行释放。

### 变更内容：
- GLoader 由原来的静态类概念转换为全局的AssetImpl类，用来作为全局共享资源的加载，原则上不提倡使用- GLoader进行资源加载。
- AssetImpl 逻辑层资源接口，每一个GComponent将会允许只有一个独立的AssetImpl实例，该实例的生命周期将同步GComponent的生命周期，当GComponent销毁时，也会将其持有的AssetImpl进行资源释放操作。
- GCtrl 废弃了如下函数：
```js
public static destroy(node: cc.Node | string);

public static destroyAllChildren(node: cc.Node);

public static gchild(path: string | cc.Prefab, callBack: FunctionCreateGChildCallBack): void;

public static addGChild<T extends GChild>(path: string | cc.Prefab, parent: cc.Node, ...args): T;

public static prefab(path: string, callBack?: FunctionPrefabCallBack);

public static prefabs(callBack: FunctionPrefabsCallBack, ...paths: string[])

public static createItem(path: string | cc.Prefab, callBack?: FunctionCreateNodeCallBack): cc.Node;

public static preLoadAssets(progressCallBack: ProgressCallback<any>, completeCallBack: CompleteCallback<any>, type: typeof cc.Asset, ...paths: string[]);

```
- 新的节点销毁：
```js
node.destroy();

node.destroyAllChildren();
```

- 新的资源加载：
```js
    // 预制件加载方式1：
    this.addGChild(Res.prefab.vw.xianmeng.conditionItem, (item: ConditionItem) => {
        item.setData(minLevels[i]);
        item.callBack = this.onMinConditionItemClick.bind(this, minLevels[i]);
        this.minScroll.content.addChild(item.node);
    })
    // 预制件加载方式2, 如果确认资源已经加载过，则可以跳过prefab这一步。
    this.assetImpl.prefab(Res.prefab.vw.xianmeng.conditionItem, ()=>{
        let item =  this.addGChild(Res.prefab.vw.xianmeng.conditionItem, parentNode);
    })

    // 图片加载,将不在通过GLoader进行资源加载，而是通过对应资源管理器进行加载，其他的类似
    this.assetImpl.spriteFrame(this.costType, Res.texture.item.root + Res.texture.item.lingshi);

    // 如果确认资源已经加载完成过，则无需通过getPreloadAsset获取资源，可以直接进行资源操作；
    // 假设Res.prefab.vw.xianmeng.conditionItem已经加载完成，并且资源没有释放。
    let item =  this.addGChild(Res.prefab.vw.xianmeng.conditionItem, parentNode);
    // 则以上代码成立；

    ... // 其他的原理相同
```
- 如果界面有需要预加载的资源，可以通过UI.ts设置预加载的资源，在界面开启的时候，会先完成资源的预加载，然后再打开界面,窗口预加载的资源会在窗口关闭的时候进行卸载。
```js
/** 窗口静态预加载资源 */
export const JXViewPreLoad = {
    [VIEW_ID.lilianReward]: [{ type: cc.SpriteAtlas, path: Res.texture.lilian_fb.lilian }],
    [VIEW_ID_EX.fangshi]: [{ type: cc.SpriteAtlas, path: Res.texture.fangshi.root }],
    [VIEW_ID_EX.lilianFb]: [{ type: cc.SpriteAtlas, path: Res.texture.lilian_fb.fog }],
    [VIEW_ID_EX.duanzaoTuzhi]: [{ type: cc.Prefab, path: vw.lianqi.titleItem }, { type: cc.Prefab, path: vw.lianqi.tuzhiItem }]
}
```
- 关于预制件实例化的方法变更：
```js
 // 之前由GCtrl提供预制件的实例化。方法的兼容性比较强，现在将其简化成如下版本, 正常选择第二个函数进行使用
 // AssetImpl:
    public addGChild<T>(path: string | cc.Prefab, cb?: { (comp: T): void }): T {
        let gchild;
        if (typeof (path) == "string") {
            this.prefab(path, (asset: cc.Prefab) => {
                let node = cc.instantiate(asset);
                gchild = node.getComponent("GChild");
                if (cb) cb(gchild);
            })
        }
        else {
            let node = cc.instantiate(path);
            gchild = node.getComponent("GChild");
            if (cb) cb(gchild);
        }

        return gchild;
    }
// GComponent.ts
    public addGChild<T>(path: string | cc.Prefab, cb?: { (comp: T): void } | cc.Node, ...otherArgs: any[]): T {
        let item;
        this.assetImpl.addGChild(path, (gchild: any) => {
            if (cb instanceof cc.Node) {
                gchild.node.parent = cb;
            }
            else {
                cb && cb();
            }
            gchild.__onGStart(...otherArgs);
            item = gchild;
        });
        return item;
    }

```

- UICreate.ts修改， 所有共用的UI创造方法，都需要传入AssetImpl进行资源环境绑定。所以接口都变更了。

- 废弃GAnimation和GAnimationMgr,动画部分内容合并到AssetImpl分支中。
- 音频部分内容仍然保持原来的使用方式，音频资源的管理暂时独立管理。

