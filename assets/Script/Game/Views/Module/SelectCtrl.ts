import { GListView } from "../../../Core/GView/GListView";
import GViewBase from "../../../Core/GView/GViewBase";
import { PART_BTL_SCENE } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";
import SelectItem from "./SelectItem";
import ThemeItem from "./ThemeItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectCtrl extends GViewBase {
	@property(cc.Node) titleNode: cc.Node = null;
	@property(cc.Node) scrollViewContent: cc.Node = null;

	private _listView: GListView = null;
	private _type: number = null;
	onGStart(type: number) {
		this._type = type;
		this.initTile();
		this.initListView();
	}

	protected initTile() {
		this.titleNode.destroyAllChildren();
		let raw = GameMgr.themeData.getRaw<SThemeDataRaw>(this._type)
		this.assetImpl.prefab(Res.prefab.vw.module.ThemeItem, (prefab: cc.Prefab) => {
			let node = cc.instantiate(prefab);
			this.titleNode.addChild(node)
			let camp = node.getComponent(ThemeItem);
			camp.initView(raw, true);
		})
	}

	protected initListView() {
		if (this._listView) return;
		this.assetImpl.prefab(Res.prefab.vw.module.SelectItem, (prefab: cc.Prefab) => {
			if (!this.isValid) return;
			this._listView = new GListView({
				scrollview: this.scrollViewContent.parent.parent.getComponent(cc.ScrollView),
				mask: this.scrollViewContent.parent,
				content: this.scrollViewContent,
				itemTpl: cc.instantiate(prefab),
				cbHost: this,
				itemSetter: this.onSetter,
				isCbClass: true,
				column: 5,
				gapX: 60,
				gapY: 30,
				padingX: 50,
				padingY: 20,
			});
			this.dealWithData();
		})

	}


	private onSetter(item: SelectItem, data: SLineRiddleRaw | SLineSaveRaw): void {
		item.setView(data, this._type);
		item.callBack = () => {
			this.onClose();
		};
	}

	protected dealWithData() {
		let arr: SLineRiddleRaw[] | SLineSaveRaw[] = null;
		switch (this._type) {
			case PART_BTL_SCENE.DECODE: {
				arr = GameMgr.lineRiddle.data.values<SLineRiddleRaw>();
				break;
			}
			case PART_BTL_SCENE.SAVE: {
				arr = GameMgr.lineSave.data.values<SLineSaveRaw>()
				break;
			}
			case PART_BTL_SCENE.MEET: {
				arr = GameMgr.lineMeet.data.values<SLineMeetRaw>();
				break;
			}
		}
		this._listView.setData(arr);
	}

	protected onHomeBtnClick() {
		GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.home)
	}
}