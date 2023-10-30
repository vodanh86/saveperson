### 一· 修改初衷
经历过旧的GCtrl.showView/GCtrl.showViewByParams方法的都知道，这是我们旧的UI显示接口。参数相对来说虽然算不上很复杂，但是参数比较散，并且实际引用场景比较低。很多时候在设计上属于拆东墙补西墙。但是还是用的比较开心的，最主要的原因还是约束比较低。这次的修改主要是基于以下几个原因，望周知：
##### 1. 旧的方法好似 cc.instantiate，仅仅只是一个添加窗口的接口，并没有起实际的管理作用。
##### 2. 跳转处理中，之前是将高于需要跳转界面的层级窗口直接移除。算是比较暴力的一种处理方式。
##### 3. 高频窗口频繁destroy和instantiate,不符合UI优化方案以及设计。
##### 4. 全屏窗口频繁堆叠，有伤优化。
##### 5. 许多GViewBase种的信息，比如说遮罩颜色，遮罩触摸，窗口动画等信息，都需要预制件实例化之后方可获取，希望这些信息能在预制件实例化之前获取。
##### 6. 希望加强窗口之间的约束和交互，这时候有一个统一的管理已成必然。

### 二· 修改变更
经过本次为期一周的修改，框架层变更内容如下：
##### 1. GViewBase:
```
> a. 移除GviewBase中关于窗口信息相关的属性
> b. GViewBase添加 win (class： Win) 属性， 对应为窗口的实际信息，该信息将在窗口和预制件第一次绑定的时候传入。
 > c. 生命周期函数变更：
    >> i : onGStart() 之前之后通过GCtrl.showViewByParams方法调用的时候才会生效，现在生效的机制为，如果初次绑定或者传入窗口的参数发生变更时将会调用。
    （本来的期望时每次进行绑定的时候都调用的，但是之前的业务层没有考虑过重复调用onGStart可能引发的BUG，所以暂定为这个机制。）
    >> ii : 添加生命周期函数onGActive, 这个方法在窗口每次激活的时候都会被调用，和onGStart的区别在于，
    即使参数没有发生变更，也会调用
    （目的是为了进行窗口的刷新，当参数引用没有发生变更，但是参数实际属性发生变更时，这时候时检测不出来，所以需要自行判定是否需要在onGActive处理UI逻辑.）
    >> iii : onClose, onGDestroy: 实际作用没有发生变更，但是处理逻辑上发生了改变。不会影响业务逻辑，有兴趣可以自己看。
> d. 实际生命周期流程：
    （预制件实例化 onGLoad）-> (showWin时第一次绑定或者参数有变更 onGStart) -> onGActive() -> onClose -> onGDestry
```
##### 2. UIMgr(UI管理器)
```
> a. 新增ui管理器，UI管理器是一个静态类。活动的Win（之后的窗口都这么描述）会存放在_stack中，临时入栈的窗口会在_heap中，被回收，之后可以复用的窗口在_recycles中。
窗口什么时候在什么容器中，是根据窗口的配置，和当时运行时的状态决定的。
只有配置了复用的属性，窗口才会在_recycles中。否则在用户实际关闭之后，该窗口依旧会被destroy掉。
> b. 新版的UI系统，所有的窗口将共用一个遮罩池。
也就是说，遮罩将永远来自于该遮罩池，遮罩的复用率极大的提高。
> c. 窗口的预加载资源，已经窗口的各种配置和模态信息，将作为静态信息存放在代码中，如果到时候有需要，会将这些信息资源化。
> d. 需要使用UIMgr进行窗口管理需要调用窗口初始化initWinInfos，三个参数分别为 窗口配置，资源预加载配置，Toast构造函数。
> e. 初始化完成之后显示窗口调用UIMgr.showWin(WinId, ...args); 
第一个参数为配置中的winId,即窗口ID.
旧版的窗口时拿着预制件资源的路径到处招摇撞骗，新版的需要使用窗口ID。
> f. uiMgr已经集成到了GameMgr中。同时 showWin方法也集成到了JumpToUtil中，所以正常情况下，请使用JumpToUtil进行窗口调用。
> g. 关于窗口的一些属性可以在CoreDefine.ts中找到。分别为WinAddMode, WinCloseMode, WinCreateEnv, WinLayer, WinMaskStatus, WinType详细的注释在代码中都能找到。
```
##### 3. UI.ts(UI配置)
```
> a. VIEW_ID_EX : 客户端自定义窗口ID.
> b. 窗口类型模板： 将一些通用的窗口配置参数作为一个组合。
> c. JXWinInfo: 实际窗口配置信息，关联prefab以及winId和winInfo。
> d. JXViewPreLoad: 静态配置需要预加载的资源。
```
##### 4. Toast
```
> a. toast修改为多实例模式，同时默认全局会共享一个Toast，调用全局toast使用 GameMgr.uiMgr.showToast, 参数同原来的。
> b. 如果需要自己建立一个单独的实例，请使用let toast = new Toast(cc.Node); toast.show, 参数同原来的；
```
##### 5. GPageView
```
> a. 切页窗口集成，具体使用可以参考UserAttribute使用。
> b. 生命周期同GViewBase。
> c. 需要选择行重载的函数, 详细信息主readme中有解释：
```
``` js
    /** 选中分页 */
    protected onSelected(nPage: number) {

    }

    /** 分页被取消 */
    protected onUnSelected(nPage: number) {

    }

    protected isCanSwitch(nPage: number, isCanToast: boolean = true): boolean {
        return true;
    }

    protected outAction(pageNode: cc.Node, nOldPage: number, nNewPage: number): cc.Tween {
        return null;
    }

    protected inAction(pageNode: cc.Node, nOldPage: number, nNewPage: number): cc.Tween {
        return null;
    }

```

##### 6. GPage
```
> a. 分页组件，作为GPageView的子控件存在。
> b. onPageActive, onPageDisable是旧的方法，为了兼容旧版本而存在。后期会废弃。
> c. 生命周期函数： 同GChild的同时额外多了： onPageOut， onPageIn, 作为切页切出时候的回调，和切入的回调。
```



