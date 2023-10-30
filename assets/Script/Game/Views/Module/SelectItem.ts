import { INVALID_VALUE } from "../../../Core/CoreDefine";
import GChild from "../../../Core/GView/GChild";
import { LinearState } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import { JXLocales } from "../../Common/Zh";
import GameMgr from "../../Logic/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectItem extends GChild {
	@property(cc.Sprite) img: cc.Sprite = null;
	@property(cc.Node) lock: cc.Node = null;
	@property(cc.Node) finished: cc.Node = null;
	@property(cc.Label) levelStr: cc.Label = null;
	protected _callBack: any;
	public set callBack(cb) {
		this._callBack = cb;
	}
	private _type: number = INVALID_VALUE;
	private _static: SLineRiddleRaw | SLineSaveRaw = null;
	private _state: LinearState = LinearState.Pass;


	public setView(data: SLineRiddleRaw | SLineSaveRaw, type: number) {
		this._type = type;
		this._static = data;
		let curLevel = GameMgr.luserData.getLevelByType(type)
		this.levelStr.string = data.id.toString();
		let imgStr = ""
		this.levelStr.node.active = true;
		if (data.id <= curLevel) {
			this._state = LinearState.Pass;
			this.finished.active = true;
			this.lock.active = false;
			imgStr = "pass_level";

		} else if (data.id === curLevel + 1) {
			this._state = LinearState.Now;
			this.lock.active = false;
			this.finished.active = false;
			imgStr = "cur_level";
		} else {
			this._state = LinearState.Future;
			this.lock.active = true;
			this.levelStr.node.active = false;
			this.finished.active = false;
			imgStr = "level_lock";
		}
		this.assetImpl.spriteAtlasFrame(this.img, Res.texture.views.selectCtrl, imgStr);
	}

	protected onBtnClick() {
		if (this._state === LinearState.Future) {
			GameMgr.uiMgr.showToast(JXLocales.tip.pass_before);
			return;
		}
		if (!GameMgr.luserData.costPower()) return;
		let arg: ArgsLineViewCtrl<SceneArg> = {
			sceneId: this._type,
			args: {
				level: this._static.id
			}
		}
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.lineView, arg);
		this._callBack();
	}


}