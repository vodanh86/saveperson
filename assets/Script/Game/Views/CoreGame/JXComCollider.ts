import { PRIORITY_VIEW } from "../../../Core/CoreDefine";
import { GCtrl } from "../../../Core/GCtrl";
import GChild from "../../../Core/GView/GChild";
import { AudioMgr } from "../../../Core/Manager/AudioMgr";
import { CMsg } from "../../Common/Define";
import { Res } from "../../Common/UIResources";
import JXCollisionMgr from "./JXCollisionMgr";
import { CollisionType, InitialRigid } from "./JXULDEfine";

const { ccclass, property, menu } = cc._decorator;
@ccclass
export default class JXComCollider extends GChild {
	@property() nodeName: string = "";
	/**碰撞目标 */
	@property() _target: string = "";
	@property({
		visible: function () {
			return !this._isHumen;
		}
	})
	public set target(v: string) {
		this.nodeName = this.node.name;
		this._target = v;
	}
	public get target() {
		return this._target;
	}

	/**碰撞的类型 */
	@property({
		type: cc.Enum(CollisionType),
		visible: function () {
			return !this._isHumen;
		}
	}) CollisionType = CollisionType.NONE

	/**碰撞体的觉醒的类型 */
	@property({
		type: cc.Enum(InitialRigid),
		visible: function () {
			return !this._isHumen;
		}
	}) InitialRigid = InitialRigid.NONE

	@property({}) aniName: string = "";
	@property() isLoop: boolean = false;

	@property() _isHumen: boolean = false;
	@property()
	public set isHumen(v: boolean) {
		this.nodeName = this.node.name
		this._isHumen = v;
	}
	public get isHumen() {
		return this._isHumen;
	}

	private rigidBody: cc.RigidBody = null;
	private CollisionMgr: JXCollisionMgr = null;
	private _isTouch: boolean = false;
	public get isTouch() {
		return this._isTouch;
	}

	public set isTouch(v: boolean) {
		this._isTouch = v;
	}

	public bindCollisionMgr(mgr: JXCollisionMgr) {
		this.CollisionMgr = mgr;
		this.init()
	}


	public onGLoad(): void {
		GCtrl.ES.on(CMsg.client.fight.lineEnd, this, this.onCMsgLineEnd.bind(this), PRIORITY_VIEW);
		GCtrl.ES.on(CMsg.client.fight.itemCrash, this, this.onCMSGItemCrash.bind(this), PRIORITY_VIEW);
	}

	protected onCMSGItemCrash() {
		let spine = this.node.getComponent(sp.Skeleton)
		if (spine && this.aniName && this.aniName != "") {
			switch (this.aniName) {
				case "break": {
					AudioMgr.Ins().playEffect(Res.audio.ice);
					break;
				}
			}
			spine.setAnimation(0, this.aniName, this.isLoop)
		}
	}

	protected onCMsgLineEnd() {
		if (this.InitialRigid === InitialRigid.LINEAWARD) {
			this.rigidBody.awake = true;
		} else if (this.InitialRigid === InitialRigid.LINELISTEN) {
			this.node.getComponent(cc.PhysicsCollider).enabled = true;
		}
	}


	private init() {
		this.rigidBody = this.node.getComponent(cc.RigidBody);
		if (this.rigidBody) {
			switch (this.InitialRigid) {
				case InitialRigid.LINEAWARD: {
					this.rigidBody.awake = false;
					break;
				}
				case InitialRigid.SLEEP: {
					this.rigidBody.type = cc.RigidBodyType.Static;
					break;
				}
				case InitialRigid.LINELISTEN: {
					this.node.getComponent(cc.PhysicsCollider).enabled = false;
					break;
				}
				case InitialRigid.NONE: {
					this.rigidBody.awake = true;
					break;
				}
			}
		}
	}

	// 只在两个碰撞体开始接触时被调用一次
	onBeginContact(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
		let comp = this;
		if ((selfCollider.node.name === "element_niulang" || selfCollider.node.name === "element_zhinv" || selfCollider.node.name === "element_ball") && otherCollider.node.name === "endTrigger") {
			this.CollisionMgr.endFight();
			return;
		}
		if (comp.target === otherCollider.node.name || this._isHumen || comp.target === "") {
			this.CollisionMgr.onBeginContact(contact, selfCollider, otherCollider)
		}
	}

	// 只在两个碰撞体结束接触时被调用一次
	onEndContact(contact, selfCollider, otherCollider) {
		let comp = this;
		if (comp.target === otherCollider.node.name || this._isHumen || comp.target === "") {
			this.CollisionMgr.onEndContact(contact, selfCollider, otherCollider)
		}
	}

	// 每次将要处理碰撞体接触逻辑时被调用
	onPreSolve(contact, selfCollider, otherCollider) {
		// let comp = selfCollider.node.getComponent(JXComCollider);
		// if (comp.target === otherCollider.node.name || this._isHumen || comp.target === "") {
		// 	this.CollisionMgr.onEndContact(contact, selfCollider, otherCollider)
		// }
	}

	// 每次处理完碰撞体接触逻辑时被调用
	onPostSolve(contact, selfCollider, otherCollider) {
		// let comp = this;
		// if (comp.target === otherCollider.node.name || this._isHumen || comp.target === "") {
		// 	this.CollisionMgr.onEndContact(contact, selfCollider, otherCollider)
		// }
	}
}