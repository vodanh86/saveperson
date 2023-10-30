import GViewBase from "../../../Core/GView/GViewBase";
import { PART_BTL_SCENE } from "../../Common/Define";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GuideCtrl extends GViewBase {
	@property(cc.Node) guide_1: cc.Node = null;
	@property(cc.Node) guide_2: cc.Node = null;
	@property(cc.Node) guide_3: cc.Node = null;


	onGStart(scene: number) {
		switch (scene) {
			case PART_BTL_SCENE.SAVE: {
				this.guide_1.active = true;
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				this.guide_2.active = true;
				break;
			}
			case PART_BTL_SCENE.MEET: {
				this.guide_3.active = true;
				break;
			}
		}
	}
}