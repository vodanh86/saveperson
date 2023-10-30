import { JXDef } from "../../../conventions/JXCommon";
import { INVALID_VALUE } from "../../../Core/CoreDefine";
import GViewBase from "../../../Core/GView/GViewBase";
import { PhysiclaType } from "../../Common/Define";
import { L } from "../../Common/Language";
import { VIEW_ID } from "../../Common/UI";
import { breathe } from "../../Common/UIAction";
import { Res } from "../../Common/UIResources";
import { JXLocales } from "../../Common/Zh";
import GameMgr from "../../Logic/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PhysicalCtrl extends GViewBase {
	@property(cc.Sprite) bgImg: cc.Sprite = null;
	@property(cc.Label) num: cc.Label = null;
	@property(cc.Label) tip: cc.Label = null;
	@property(cc.Node) yesBtn: cc.Node = null;

	/**类型 */
	private _type: number = INVALID_VALUE;
	private _num: number = INVALID_VALUE;

	onGStart(type: number) {
		this._type = type;
		this.initView();
		breathe(this.yesBtn, 1.2, 0.5);
	}

	/**初始化视图*/
	protected initView() {
		if (this._type === PhysiclaType.buchong) {
			this._num = GameMgr.systemConfig.value(JXDef.SYS_CONFIG_KEY.bucong_num);
			this.assetImpl.spriteFrame(this.bgImg, Res.texture.big.bg_bucong);
			this.tip.string = JXLocales.currency.bc_tip;
		} else {
			this._num = GameMgr.systemConfig.value(JXDef.SYS_CONFIG_KEY.wuxian_num);
			let tip = GameMgr.systemConfig.value(JXDef.SYS_CONFIG_KEY.wuxian_time);
			this.assetImpl.spriteFrame(this.bgImg, Res.texture.big.bg_wuxian);
			this.tip.string = L(JXLocales.currency.wx_tip, tip);
		}
		this.num.string = this._num.toString();
	}

	protected onNoBtnClick() {
		switch (this._type) {
			case PhysiclaType.buchong: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.powerNo)
				break
			}
			case PhysiclaType.wuxian: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.limitNo)
				break;
			}
		}
		this.onClose()
	}

	/**领取按钮点击 */
	protected onYesBtnClick() {
		switch (this._type) {
			case PhysiclaType.buchong: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.powerAd)
				break
			}
			case PhysiclaType.wuxian: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.limitAd)
				break;
			}
		}
		GameMgr.sdkMgr.watchAd(() => {
			if (this._type === PhysiclaType.buchong) {
				GameMgr.luserData.addPower(this._num);
			} else {
				GameMgr.luserData.setLimitTime();
			}
			GameMgr.uiMgr.showToast(JXLocales.tip.success);
			this.onClose();
		}, () => {
			GameMgr.uiMgr.showToast(JXLocales.tip.fails);
		})
	}


	protected onHomeBtnClick() {
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.home)
	}
}