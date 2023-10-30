import GViewBase from "../../../Core/GView/GViewBase";
import { VIEW_ID } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";
import ThemeItem from "./ThemeItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThemeCtrl extends GViewBase {
	@property(cc.Node) themeLayer: cc.Node = null;

	onGLoad() {
		this.initView();
	}

	protected initView() {
		this.themeLayer.destroyAllChildren();
		this.assetImpl.prefab(Res.prefab.vw.module.ThemeItem, (prefab: cc.Prefab) => {
			let raws = GameMgr.themeData.data.values<SThemeDataRaw>();
			for (let i = 0; i < raws.length; i++) {
				let raw = raws[i];
				let node = cc.instantiate(prefab);
				this.themeLayer.addChild(node)
				let camp = node.getComponent(ThemeItem);
				camp.initView(raw);
			}
		})
	}

	protected onHomeBtnClick() {
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.home)
	}
}