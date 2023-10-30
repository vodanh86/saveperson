import { JXDef } from "../../../conventions/JXCommon";
import { INVALID_VALUE, OBJECT_COPY } from "../../../Core/CoreDefine";
import { GCtrl } from "../../../Core/GCtrl";
import { GLocal } from "../../../Core/Manager/DataPool";
import { PART_BTL_SCENE, PhysiclaType } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import GameMgr from "../../Logic/GameMgr";

const { ccclass } = cc._decorator;
@ccclass
export class LUserData extends GLocal {
	public $localKey = 'LUserData';
	private $lastHideTime: number = null;
	private $themeLevel: number[] = null;
	private $tipTime: number = null;
	private $curPower: number = null;

	private $limitPhysical: number = null;
	private $limitTime: number = null;
	private $watchTime: number = null;
	public get curPower() {
		return this.$curPower;
	}

	public addPower(v: number) {
		this.$curPower += v;
		this.set();
		return this.$curPower;
	}

	public setLimitTime() {
		let num = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.wuxian_num);
		let time = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.wuxian_time);
		this.$limitPhysical = num;
		this.$limitTime = GCtrl.now + JXDef.Time.HOUR * time;
		this.set();
	}

	public onInit(): void {
		this.load();
		this.initEvent()
		this.updatePower();
		this.$watchTime = 0;
		if (!this.$themeLevel) {
			this.$themeLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
		} else {
			if (!this.$themeLevel[PART_BTL_SCENE.MEET] && this.$themeLevel[PART_BTL_SCENE.MEET] != 0) {
				this.$themeLevel.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0,])
			}
		}
		if (!this.$curPower) {
			this.$curPower = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.default_power);
		}
		if (this.$tipTime === null) {
			this.$tipTime = 0;
		}
		this.set();
	}

	public setLevelByType(type: number, id: number) {
		let curLevel = this.$themeLevel[type];
		if (curLevel > id) {
			return;
		} else {
			this.$themeLevel[type] = id;
			this.set();
		}
	}

	/*通过类型 */
	public getLevelByType(type: number) {
		let arr = OBJECT_COPY(this.$themeLevel);
		return arr[type];
	}

	/**注冊事件*/
	protected initEvent() {
		cc.game.on(cc.game.EVENT_SHOW, () => {
			this.updatePower();
		})
		cc.game.on(cc.game.EVENT_HIDE, () => {
			this.$lastHideTime = GCtrl.now;
			this.set();
		})
	}


	public get AdWatchTime() {
		return this.$watchTime;
	}

	public set AdWatchTime(v: number) {
		this.$watchTime = v;
		this.set();
	}

	protected updatePower() {
		let now = GCtrl.now;
		if ((now - this.$lastHideTime) > JXDef.Time.MINUTE && this.$lastHideTime != INVALID_VALUE) {
			let recover_num = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_num);
			let recover_max = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_max);
			let recover_time = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.recover_time);
			let time = now - this.$lastHideTime;
			let surplus = Math.floor(time / (JXDef.Time.MINUTE * recover_time));
			let addTime = surplus * recover_num;
			this.$curPower += addTime;
			if (this.$curPower > recover_max) {
				this.$curPower = recover_max;
			}
			this.$lastHideTime = INVALID_VALUE;
			this.set();
		}
	}

	/**使用体力 */
	public costPower() {
		let cost = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.power_cost);
		if (GCtrl.now < this.$limitTime) {
			if (this.$limitPhysical > cost) {
				this.$limitPhysical -= cost;
				this.set()
				return true;
			}
		} else {
			this.$limitPhysical = 0;
		}
		if (this.$curPower < cost) {
			GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.physicalCtrl, PhysiclaType.buchong)
			return false;
		} else {
			this.$curPower -= cost;
			this.set();
			return true
		}
	}

	/**使用提示次数*/
	public costTipTime() {
		if (this.$tipTime < 1) {
			return false;
		} else {
			this.$tipTime -= 1;
			this.set();
			return true;
		}
	}

	/**获取提示次数 */
	public addTipTime(v: number) {
		this.$tipTime += v;
		this.set();
	}

	public get tipTime() {
		return this.$tipTime;
	}

}