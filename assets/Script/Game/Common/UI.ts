import { JXDef } from "../../conventions/JXCommon";
import { WinAddMode, WinCloseMode, WinLayer, WinMaskStatus, WinType } from "../../Core/CoreDefine";
import { MapWrap } from "../../Core/FrameEx/ES5Ex";
import { BASE_VIEW_ID_EX, WinInfo, WinInfos, WinModel } from "../../Core/Manager/UIMgr";
import { Res } from "./UIResources";

// var VIEW_ID_BASE = 1000000;
/** 所有的窗口ID */
export const VIEW_ID = JXDef.SYS_IDENTITY_ID;
/** 附上客户端的界面ID */
// cc.js.mixin(VIEW_ID, VIEW_ID);
cc.js.mixin(VIEW_ID, BASE_VIEW_ID_EX);

// 来个警告
if (CC_DEV) {
    let keys = Object.keys(VIEW_ID);
    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < keys.length; j++) {
            if (i == j) continue
            if (VIEW_ID[keys[i]] == VIEW_ID[keys[j]]) {
                cc.warn(`${keys[i]}  == ${keys[j]}`)
            }
        }
    }
}


///////////////////////////////////////////////////////////////////////////// 窗口类型模板 //////////////////////////////////////////////////////////////////////
/** 通用全屏大窗口 */
const ComFullWin = new WinModel(WinType.FullView, WinMaskStatus.kOnlyShow, WinAddMode.ReplaceLayer, WinCloseMode.OnlyDestroy | WinCloseMode.PopAll, WinLayer.FirstWindow);
/** 通用全屏大窗口, 入栈本层之下的UI */
const ComFullStackWin = new WinModel(WinType.FullView, WinMaskStatus.kOnlyShow, WinAddMode.PushLower, WinCloseMode.OnlyDestroy | WinCloseMode.PopAll, WinLayer.FirstWindow);

/** 通用二级单例界面 */
const ComSecSingleWin = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.ReplaceSelf, WinCloseMode.OnlyDestroy, WinLayer.SecondWindow);
/** 通用二级堆叠界面 */
const ComSecWindow = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.OnlyDestroy, WinLayer.SecondWindow);
/** 通用二级隐藏复用界面 */
const ComSecHidWindow = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.Hide, WinLayer.SecondWindow);
/** 通用全屏二级界面 */
const ComSecFullWinow = new WinModel(WinType.FullView, WinMaskStatus.kOnlyShow | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.OnlyDestroy, WinLayer.SecondWindow);
/** 通用二级全屏单例界面 */
const ComSecFullSingleWin = new WinModel(WinType.FullView, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.ReplaceSelf, WinCloseMode.OnlyDestroy, WinLayer.SecondWindow);
/** 通用二级全屏单例界面-黑色背景 */
const CSFSBlackWin = new WinModel(WinType.FullView, WinMaskStatus.kOnlyShow | WinMaskStatus.kOpacity255, WinAddMode.ReplaceSelf, WinCloseMode.OnlyDestroy, WinLayer.SecondWindow);

/** 通用模态窗口 */
const ComThrWindow = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.OnlyDestroy, WinLayer.ThirdWindow);
/** 通用三级单例窗口 */
const ComThrSingleWin = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.ReplaceSelf, WinCloseMode.OnlyDestroy, WinLayer.ThirdWindow);
/** 通用不可关闭模态窗口 */
const ComUnCloseThrWindow = new WinModel(WinType.Window, WinMaskStatus.kOnlyShow | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.OnlyDestroy, WinLayer.ThirdWindow);

/** 通用频繁信息窗口 */
const ComTipWindow = new WinModel(WinType.Window, WinMaskStatus.kTouchClose | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.Recycle, WinLayer.ThirdWindow);
/** 通用频繁警告窗口 */
const ComUnTouckTipWindow = new WinModel(WinType.Window, WinMaskStatus.kOnlyShow | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.Recycle, WinLayer.WarnWindow);
/** 通用频繁警告窗口 */
const ComWarnWindow = new WinModel(WinType.Window, WinMaskStatus.kTouchClose, WinAddMode.Stack, WinCloseMode.Recycle, WinLayer.WarnWindow);


/** 通用顶层 */
const ComTopFix = new WinModel(WinType.Fix, WinMaskStatus.kOnlyShow, WinAddMode.ReplaceSelf, WinCloseMode.Recycle, WinLayer.TopWindow);
const ComTopFixConfirm = new WinModel(WinType.Fix, WinMaskStatus.kOnlyShow | WinMaskStatus.kOpacity156, WinAddMode.Stack, WinCloseMode.Recycle, WinLayer.TopWindow);

const ComWarnFix = new WinModel(WinType.Fix, WinMaskStatus.kNone, WinAddMode.Stack, WinCloseMode.OnlyDestroy, WinLayer.TopUpWindow);


/** 窗口预制件所以 */
const vw = Res.prefab.vw;

/** 窗口基本信息 */
export const JXWinInfo = new WinInfos(Object.keys(VIEW_ID).map((v, k) => VIEW_ID[v]), new MapWrap([
    [VIEW_ID.home, new WinInfo(vw.home.homeCtrl, ComFullWin)],
    [VIEW_ID.lineView, new WinInfo(vw.core.LineView, ComFullStackWin)],
    [VIEW_ID.resultCtrl, new WinInfo(vw.core.ResultCtrl, ComUnCloseThrWindow)],
    [VIEW_ID.themeCtrl, new WinInfo(vw.module.ThemeCtrl, ComSecSingleWin)],
    [VIEW_ID.selectCtrl, new WinInfo(vw.module.SelectCtrl, ComSecSingleWin)],
    [VIEW_ID.tipCtrl, new WinInfo(vw.core.TipCtrl, ComSecSingleWin)],
    [VIEW_ID.physicalCtrl, new WinInfo(vw.module.PhysicalCtrl, ComThrSingleWin)],
    [VIEW_ID.GuideCtrl, new WinInfo(vw.core.GuideNode, ComSecSingleWin)],
    [BASE_VIEW_ID_EX.WAIT, new WinInfo(vw.tip.wait, ComTopFix)],

]));

/** 窗口静态预加载资源 */
export const JXViewPreLoad = {

}


export const VIEW_IDByPageNum: { [id: number]: { page?: number[], view?: number } } = {

}