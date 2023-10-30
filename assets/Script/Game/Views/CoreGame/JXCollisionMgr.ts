import { ObjectWrap } from "../../../Core/FrameEx/ES5Ex";
import { GCtrl } from "../../../Core/GCtrl";
import { CMsg, PART_BTL_SCENE } from "../../Common/Define";
import { Res } from "../../Common/UIResources";
import JXComCollider from "./JXComCollider";
import JXLVCmdMgr from "./JXLVCmdMgr";
import { CollisionType } from "./JXULDEfine";

/**碰撞管理 */
export default class JXCollisionMgr extends ObjectWrap implements IComLike {

	private _running: boolean = false;
	public set running(v: boolean) {
		this._running = v;
	}
	private _cmdMgr: JXLVCmdMgr = null;
	constructor(cmdMgr: JXLVCmdMgr) {
		super();
		this._cmdMgr = cmdMgr;
	}

	update(dt: number) {

	}


	public endFight() {
		if (this._running) {
			this._cmdMgr.endFight(false);
		}
	}
	// 只在两个碰撞体开始接触时被调用一次
	public onBeginContact(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
		if (!this._running) return;
		let selfComp = selfCollider.node.getComponent(JXComCollider);
		let otherComp = otherCollider.node.getComponent(JXComCollider);
		let otherName = otherCollider.node.name;
		let type = selfComp.CollisionType;
		let fun = () => {

			switch (type) {
				case CollisionType.VANISH: {
					let node = otherCollider.node;
					node.getComponent(cc.RigidBody).awake = false;
					GCtrl.ES.emit(CMsg.client.fight.itemCrash);
					selfCollider.node.getComponent(cc.RigidBody).enabledContactListener = false;
					cc.tween(node).to(0.5, { opacity: 0 }).call(() => {
						if (this._running) {
							this._cmdMgr.endFight(true);
						}
						node.active = false;
					}).start()
					break;
				}
				case CollisionType.WAKETARGET: {
					let node = otherCollider.node;
					selfComp.CollisionType = CollisionType.NONE;
					let copyNode = cc.instantiate(node);
					copyNode.parent = node.parent;
					node.removeFromParent();
					let index = this._cmdMgr.props.indexOf(node);
					this._cmdMgr.props.splice(index, 1);
					node.destroy()
					this._cmdMgr.props.push(copyNode);
					copyNode.getComponent(JXComCollider).bindCollisionMgr(this);
					let rigid = copyNode.getComponent(cc.RigidBody);
					rigid.type = cc.RigidBodyType.Dynamic;
					break;
				}
				case CollisionType.VANISHWIN: {
					let node = otherCollider.node;
					node.getComponent(cc.RigidBody).awake = false;
					GCtrl.ES.emit(CMsg.client.fight.itemCrash);
					if (this._running) {
						this._running = false;
						if (selfCollider.node.name === "element_buoy") {
							let self = selfCollider.node;
							let index = this._cmdMgr.props.indexOf(self);
							this._cmdMgr.props.splice(index, 1);
							self.destroy();
						}
						if (this._cmdMgr.sceneId === PART_BTL_SCENE.MEET) {
							var worldManifold = contact.getWorldManifold();
							let spine = this._cmdMgr.assetManager.createSpine(Res.spine.love);
							spine.node.parent = node.parent;
							spine.premultipliedAlpha = false;
							spine.node.position = node.parent.convertToNodeSpaceAR(worldManifold.points[0]);
							spine.setAnimation(0, "animation", true);
						}
						this._cmdMgr.endFight(true);
					}
					break;
				}
				case CollisionType.WATER: {
					let node = otherCollider.node;
					let box = node.getComponent(cc.RigidBody);
					box.gravityScale = -0.8
					break;
				}
				case CollisionType.CANTTOUCH: {
					if (this._running) {
						this._cmdMgr.endFight(false);
					}
					break;
				}
				case CollisionType.TOUCH2END: {
					selfComp.isTouch = true;
					if (this._running) {
						this._cmdMgr.endFight(true, selfComp);
						GCtrl.ES.emit(CMsg.client.fight.itemCrash);
					}
					break;
				}
				case CollisionType.NOTOUCH2END: {
					selfComp.isTouch = true;
					break;
				}
			}
		}
		if (selfComp._isHumen) {
			if (otherComp || otherName === "GraphicsNode") {
				if (!otherComp || (otherComp && otherComp.CollisionType != CollisionType.VANISHWIN && otherComp.CollisionType != CollisionType.NONE)) {
					this._cmdMgr.endFight(false)
				}
			} else {
				if (otherName === selfComp.target) {
					fun();
				}
			}
		} else {
			fun()
		}
	}

	//cocos像素与米的比例就是32：1
	public getPointsByRect(rect: any) {
		let x = rect.x;
		let y = rect.y;
		let h = rect.height / 2;
		let w = rect.width / 2;
		let point1 = cc.v2(x - w, y + h);
		let point2 = cc.v2(x + w, y + h);
		let point3 = cc.v2(x + w, y - h);
		let point4 = cc.v2(x - w, y - h);
		return [{ X: point1.x / 32, Y: point1.y / 32 }, { X: point2.x / 32, Y: point2.y / 32 }, { X: point3.x / 32, Y: point3.y / 32 }, { X: point4.x / 32, Y: point4.y / 32 }]
	}

	// 只在两个碰撞体结束接触时被调用一次
	public onEndContact(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
		if (!this._running) return;
		let selfComp = selfCollider.node.getComponent(JXComCollider);
		let otherComp = otherCollider.node.getComponent(JXComCollider);
		let otherName = otherCollider.node.name;
		let type = selfComp.CollisionType;
		switch (type) {
			case CollisionType.WATER: {
				let node = otherCollider.node;
				let box = node.getComponent(cc.RigidBody);
				box.gravityScale = 1;
				break;
			}
			case CollisionType.TOUCH2END: {
				selfComp.isTouch = false;
				break;
			}
			case CollisionType.NOTOUCH2END: {
				selfComp.isTouch = false;
				if (this._running) {
					this._cmdMgr.endFight(true, selfComp);
				}
				break;
			}
		}

	}

	// 每次将要处理碰撞体接触逻辑时被调用
	public onPreSolve(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
		if (!this._running) return;
	}

	// 每次处理完碰撞体接触逻辑时被调用
	public onPostSolve(contact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
		if (!this._running) return;

	}
}