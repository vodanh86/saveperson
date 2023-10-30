import { JXDef } from "../../../conventions/JXCommon";
import GChild from "../../../Core/GView/GChild";
import { PART_BTL_SCENE } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThemeItem extends GChild {
	@property(cc.Sprite) img: cc.Sprite = null;
	@property(cc.Node) isNew: cc.Node = null;
	@property(cc.Label) curProgress: cc.Label = null;

	private _isOnlyShow: boolean = false;
	/**靜態數據 */
	private _staticRaw: SThemeDataRaw = null;
	onGload() {

	}

	public initView(raw: SThemeDataRaw, isOnlyShow: boolean = false) {
		this._isOnlyShow = isOnlyShow;
		this._staticRaw = raw;
		this.isNew.active = !!raw.isNew;
		this.curProgress.node.active = !!raw.type && !isOnlyShow;
		this.assetImpl.spriteAtlasFrame(this.img, Res.texture.views.selectCtrl, raw.img);
		this.node.getComponent(cc.Button).interactable = !isOnlyShow;
		this.setPregerss()
	}

	/**设置进度 */
	protected setPregerss() {
		if (this._isOnlyShow) {
			return;
		}
		let raw = this._staticRaw;
		let num = GameMgr.luserData.getLevelByType(raw.type)
		let len = 0;
		switch (raw.type) {
			case PART_BTL_SCENE.SAVE: {
				len = GameMgr.lineSave.data.size;
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				len = GameMgr.lineRiddle.data.size;
				break;
			}
			case PART_BTL_SCENE.MEET: {
				len = GameMgr.lineMeet.data.size;
				break;
			}
		}
		this.curProgress.string = num + "/" + len;
	}

	/**按钮点击 */
	protected onBtnClick() {
		switch (this._staticRaw.type) {
			case PART_BTL_SCENE.NONE: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.moveGame);
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.riddleClick);
				break;
			}
			case PART_BTL_SCENE.SAVE: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.saveClick);
				break;
			}
			case PART_BTL_SCENE.MEET: {
				GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.meetClick);
				break;
			}
		}
		if (this._staticRaw.type === PART_BTL_SCENE.NONE) {
			return;
		}
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.selectCtrl, this._staticRaw.type)
	}
}