import { tyqSDK } from "../../../../resources/tyq2.x/tyq-sdk";
import { JXDef } from "../../../conventions/JXCommon";
import { INVALID_VALUE } from "../../../Core/CoreDefine";
import GViewBase from "../../../Core/GView/GViewBase";
import { AudioMgr } from "../../../Core/Manager/AudioMgr";
import { PART_BTL_SCENE } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { breathe } from "../../Common/UIAction";
import { Res } from "../../Common/UIResources";
import { JXLocales } from "../../Common/Zh";
import GameMgr from "../../Logic/GameMgr";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ResultCtrl extends GViewBase {
	@property(sp.Skeleton) aniAni: sp.Skeleton = null;
	@property(cc.Label) conclusion: cc.Label = null;
	@property(cc.Node) cnt: cc.Node = null;
	@property(cc.Node) tipBtn: cc.Node = null;

	private _isWin: boolean = false;
	private sceneId: number = INVALID_VALUE;
	private _level: number = INVALID_VALUE;
	private _cb: Function = null;

	public onGStart(sceneId: number, id, isWin: boolean, cb): void {
		this.win.maskNode.opacity = 220;
		this._isWin = isWin;
		this._cb = cb;
		this.sceneId = sceneId;
		this._level = id;
		breathe(this.tipBtn, 1.2, 0.5);
		if (isWin) {
			GameMgr.luserData.setLevelByType(sceneId, id);
			AudioMgr.Ins().playEffect(Res.audio.success);
		}
		let curRaw: SLineRiddleRaw | SLineSaveRaw = null;
		switch (this.sceneId) {
			case PART_BTL_SCENE.SAVE: {
				curRaw = GameMgr.lineSave.getRaw(id);
				tyqSDK.endGame(true)
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				curRaw = GameMgr.lineRiddle.getRaw(id);
				tyqSDK.endGame(true)
				break;
			}
			case PART_BTL_SCENE.MEET: {
				curRaw = GameMgr.lineMeet.getRaw(id);
				tyqSDK.endGame(true)
				break;
			}
		}
		let switchAd = Number(tyqSDK.getSwitchValue("jili_ad"));
		if (switchAd && switchAd === GameMgr.luserData.AdWatchTime) {
			GameMgr.sdkMgr.watchAd(() => {
				GameMgr.luserData.AdWatchTime = 0;

			})
		} else {
			GameMgr.luserData.AdWatchTime = GameMgr.luserData.AdWatchTime + 1;
			let switchInfo = Number(tyqSDK.getSwitchValue("insert_ad"));
			if (switchInfo) {
				GameMgr.sdkMgr.showIntersAd();
			}
		}

		this.conclusion.string = curRaw.conclusion;
		this.showAni();
	}


	protected showAni() {
		this.aniAni.setCompleteListener(() => {
			this.aniAni.setAnimation(0, "2", true);
			this.aniAni.setCompleteListener(() => { })
			let node = this.cnt;
			node.scale = 1;
			node.opacity = 0;
			let tween = cc.tween(node).to(0.3, { scale: 1, opacity: 255 });
			tween.start();
		})
		let node = this.conclusion.node;
		node.active = true;
		node.scale = 1.1;
		node.opacity = 0;
		let tween = cc.tween(node).delay(0.5).by(0.2, { scale: 0.5 * 1.1, opacity: 128, y: 0, }).by(0.4, { scale: -0.5 * 1.1, y: 15 }).parallel(
			cc.tween(node).by(0.5, { y: 0 }, { easing: "cubicOut" }),
			cc.tween(node).delay(0.2).by(0.4, { opacity: 255 })
		)
		tween.start();
		this.aniAni.setAnimation(0, "1", false);
	}

	protected onReturnHome() {
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.home);
	}


	protected onWatchAd() {
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.resultTip)
		GameMgr.sdkMgr.watchAd(() => {
			GameMgr.luserData.addTipTime(1);
			GameMgr.uiMgr.showToast(JXLocales.tip.success);
		}, () => {
			GameMgr.uiMgr.showToast(JXLocales.tip.fails);
		})
	}

	protected onNextClick() {
		if (this._isWin) {
			let next = null;
			let nextId = this._level + 1;
			switch (this.sceneId) {
				case PART_BTL_SCENE.SAVE: {
					next = GameMgr.lineSave.getRaw(nextId);
					break;
				}
				case PART_BTL_SCENE.DECODE: {
					next = GameMgr.lineRiddle.getRaw(nextId);
					break;
				}
				case PART_BTL_SCENE.MEET: {
					next = GameMgr.lineMeet.getRaw(nextId);
					break;
				}
			}
			if (next) {
				if (!GameMgr.luserData.costPower()) return;
				let arg: ArgsLineViewCtrl<SceneArg> = {
					sceneId: this.sceneId,
					args: {
						level: nextId
					}
				}
				this._cb();
				GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.lineView, arg);
			} else {
				GameMgr.uiMgr.showToast(JXLocales.tip.last);
			}
		}
	}
}