import GViewBase from "../../../Core/GView/GViewBase";
import MathEx from "../../../Core/Math/MathEx";
import { PART_BTL_SCENE } from "../../Common/Define";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TipCtrl extends GViewBase {
	@property(cc.Sprite) img: cc.Sprite = null;

	public onGStart(senceId: number, level: number): void {
		let imgStr = "";
		let raw: SLineRiddleRaw | SLineSaveRaw | SLineMeetRaw = null;
		let path = "censor" + senceId + Res.texture.views.gameTip;
		switch (senceId) {
			case PART_BTL_SCENE.SAVE: {
				imgStr = "ls_" + level;
				raw = GameMgr.lineSave.getRaw<SLineSaveRaw>(level);
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				imgStr = "lr_" + level;
				raw = GameMgr.lineRiddle.getRaw<SLineRiddleRaw>(level);
				break;
			}
			case PART_BTL_SCENE.MEET: {
				imgStr = "lm_" + level;
				raw = GameMgr.lineRiddle.getRaw<SLineMeetRaw>(level);
			}
		}
		this.assetImpl.spriteFrame(this.img, path + imgStr);
		this.img.node.position = MathEx.arrToVec2(raw.tipPositon)
	}
}