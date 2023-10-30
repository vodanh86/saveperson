import { tyqSDK } from "../../../../resources/tyq2.x/tyq-sdk";
import { JXDef } from "../../../conventions/JXCommon";
import GViewBase from "../../../Core/GView/GViewBase";
import { AudioMgr } from "../../../Core/Manager/AudioMgr";
import { PART_BTL_SCENE, PhysiclaType } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { breathe, shake } from "../../Common/UIAction";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";
import powerItem from "./PowerItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeCtrl extends GViewBase {
	@property(cc.Node) powerBtn: cc.Node = null;
	@property(cc.Node) startBtn: cc.Node = null;

	private loadNum: number = 0;

	public onGLoad(): void {
		this.initPowerItem();
		AudioMgr.Ins().playMusic(Res.audio.bgm);
		shake(this.powerBtn, 10, 0.8);
		breathe(this.startBtn, 1.2, 0.8);
	}

	public onGStart(...args: any[]): void {
		this.secondLoadBundle(JXDef.bundle.second, () => {
		})
	}

	public onGActive(): void {
		if (tyqSDK.getSwitchValue("switch_banner")) {
			let time = tyqSDK.getSwitchValue("banner_time");
			GameMgr.sdkMgr.showBannerTurns(Number(time))
		}

		if (tyqSDK.getSwitchValue("switch_gride")) {
			let time = tyqSDK.getSwitchValue("gride_time");
			GameMgr.sdkMgr.showGridTurns(Number(time));
		}
	}

	private initPowerItem() {
		let UIRoot = GameMgr.uiMgr.uiRoot;
		this.addGChild<powerItem>(Res.prefab.vw.home.powerItem, UIRoot);
	}

	/**无限体力 */
	protected onUnlimitedPowerClick() {
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.clickLimitPower);
		GameMgr.sdkMgr.hideBanner();
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.physicalCtrl, PhysiclaType.wuxian);
	}

	/**全部主题 */
	protected onAllThemeClick() {
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.allTheme);
		GameMgr.sdkMgr.hideBanner();
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.themeCtrl);
	}

	/**最新主题 */
	protected onNewThemeClick() {
		let newRaw = GameMgr.themeData.getNewRaw();
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.newGame);
		GameMgr.sdkMgr.hideBanner();
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.selectCtrl, newRaw.type);
	}

	/**开始游戏 */
	protected onStartGameClick() {
		if (!GameMgr.luserData.costPower()) return;
		GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.startGame);
		let curLevel = GameMgr.luserData.getLevelByType(PART_BTL_SCENE.SAVE);
		let size = GameMgr.lineSave.data.size;
		let arg: ArgsLineViewCtrl<SceneArg> = {
			sceneId: PART_BTL_SCENE.SAVE,
			args: {
				level: curLevel < size ? (curLevel + 1) : curLevel,
			}
		}
		GameMgr.sdkMgr.hideBanner();
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.lineView, arg);
	}


	protected secondLoadBundle(bundles, cb) {
		let keys = Object.keys(bundles);
		if (keys.length == 0) {
			cb();
			return;
		}
		const str = bundles[keys[this.loadNum]];
		cc.assetManager.loadBundle(str, (err: Error, boule: cc.AssetManager.Bundle) => {
			if (err) {
				cc.error("分包加载失败:" + str);
			} else {
				cc.log("分包加载成功:" + str)
			}
			this.loadNum++;
			if (this.loadNum < keys.length) {
				this.secondLoadBundle(bundles, cb);
			} else {
				this.loadNum = 0;
				cb()
			}
		});
	}
}