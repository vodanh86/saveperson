import { JXDef } from "../../../conventions/JXCommon";
import { INVALID_VALUE, PRIORITY_VIEW } from "../../../Core/CoreDefine";
import { GCtrl } from "../../../Core/GCtrl";
import GChild from "../../../Core/GView/GChild";
import { Win } from "../../../Core/Manager/UIMgr";
import { PhysiclaType } from "../../Common/Define";
import { LTimer2 } from "../../Common/Language";
import { VIEW_ID } from "../../Common/UI";
import GameMgr from "../../Logic/GameMgr";
export interface PanelData {
	position?: cc.Vec2,
	winId: number,
	nPage?: number
}

const { ccclass, property, menu } = cc._decorator;
@ccclass @menu("Views/Home/PowerItem")
export default class powerItem extends GChild {
	@property(cc.Node) icon: cc.Node = null;
	@property(cc.Label) curPower: cc.Label = null;
	@property(cc.Label) time: cc.Label = null;
	private panelData: PanelData = null;

	private countdown: number = 60;
	private recover_num = 0;
	private recover_max = 0;
	private recover_time = 0;

	onLoad() {
		this.recover_num = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_num);
		this.recover_max = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_max);
		this.recover_time = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_time);
		this.countdown = JXDef.Time.MINUTE * this.recover_time / JXDef.Time.SECOND;
		GCtrl.ES.on(GCtrl.GClientWinDestroyEventMsg, this, this._onWinDestroy.bind(this), PRIORITY_VIEW);
		GCtrl.ES.on(GCtrl.GClientWinOpenEventMsg, this, this._onWinOpen.bind(this), PRIORITY_VIEW);
		GCtrl.ES.on(GCtrl.GTimerSecondEventMsg, this, this.updateTime.bind(this), PRIORITY_VIEW);
		this.updateView();
	}


	protected onAddBtnClick() {
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.clickPower);
		GameMgr.sdkMgr.hideBanner();
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.physicalCtrl, PhysiclaType.buchong)
	}

	private updateTime() {
		let curTime = GameMgr.luserData.curPower;
		this.curPower.string = curTime.toString();
		this.time.node.active = curTime < this.recover_max;
		if (this.time.node.active) {
			this.countdown--;
			if (this.countdown <= 0) {
				this.node.scale
				cc.tween(this.icon).to(0.2, { scale: 2 }).to(0.5, { scale: 1 }).start()
				this.curPower.string = GameMgr.luserData.addPower(this.recover_num) + "";
				let curTime = GameMgr.luserData.curPower;
				this.curPower.string = curTime.toString();
				this.countdown = JXDef.Time.MINUTE * this.recover_time / JXDef.Time.SECOND;
			} else {
				this.time.string = LTimer2(this.countdown)
			}
		}
	}


	protected _setData(param: PanelData) {
		this.panelData = param;
		if (!this.panelData) {
			for (let i = 0; i < this.node.children.length; i++) {
				this.node.children[i].active = false;
			}
			return;
		} else if (this.panelData.position) {
			this.updateView();
		}
		if (this.panelData.winId) {
			let win = GameMgr.uiMgr.getActiveTopWin(this.panelData.winId);
			if (win) {
				this.node.zIndex = win.sortOrder + 1;
			}
		}
	}

	protected updateView() {
		if (!this.panelData) return;
		// this.node.scale = 0.5;
		this.node.position = this.panelData.position;
		// cc.tween(this.node).to(0.2, { scale: 1 }).start();
	}

	protected _onWinDestroy(_, win: Win) {
		let panelData = this.getActiveTopAttribute();
		this._setData(panelData);
	}

	protected _onWinOpen(_, win: Win) {
		let panelData = this.getActiveTopAttribute();
		this._setData(panelData);
	}

	/**通过WinId 获取位置 */
	protected getPositionByWinId(windId: number, nPage: number) {
		switch (windId) {
			case VIEW_ID.physicalCtrl:
			case VIEW_ID.resultCtrl:
			case VIEW_ID.selectCtrl:
			case VIEW_ID.themeCtrl:
			case VIEW_ID.home: {
				return cc.v2(-400, 290);
			}
			case VIEW_ID.resultCtrl: {
				break;
			}
			case VIEW_ID.lineView: {
				return cc.v2(390, 290)
			}

		}
	}

	/**获取顶部组件的属性*/
	protected getActiveTopAttribute(winId?: number, nPage?: number) {
		const tagWins = [VIEW_ID.home, VIEW_ID.physicalCtrl, VIEW_ID.themeCtrl, VIEW_ID.selectCtrl, VIEW_ID.resultCtrl, VIEW_ID.lineView];
		if (winId) {
			let index = tagWins.indexOf(winId);
			if (index == INVALID_VALUE) {
				winId = null;
			}
		}

		if (!winId) {
			let wins = GameMgr.uiMgr.stack;
			for (let i = wins.length - 1; i >= 0; i--) {
				if (tagWins.indexOf(wins[i].winId) != INVALID_VALUE) {
					winId = wins[i].winId;
					break;
				}
			}
		}

		if (winId) {
			return {
				position: this.getPositionByWinId(winId, nPage),
				winId: winId
			};
		}
		return null;

	}
}