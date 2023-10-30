import { JXDef } from "../../../conventions/JXCommon";
import { ObjectWrap } from "../../../Core/FrameEx/ES5Ex";
import { GCtrl } from "../../../Core/GCtrl";
import { GAssetImpl } from "../../../Core/GLoader/GLoader";
import { AudioMgr } from "../../../Core/Manager/AudioMgr";
import { PART_BTL_SCENE } from "../../Common/Define";
import { VIEW_ID } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";
import { ViewUtil } from "../ViewUtil/VIewUtil";
import { CustomsComp, CustomsData, CustomsParseProgress, CustomsParser, MapParseStatus } from "./CustomsParser";
import JXCollisionMgr from "./JXCollisionMgr";
import JXComCollider from "./JXComCollider";
import { CustomsAssets } from "./JXULAsset";
import { CollisionType, JXCustomsPrefab } from "./JXULDEfine";
import LinePhysicsCollider from "./LinePhysicsCollider";
import LineViewCtrl from "./LineViewCtrl";

/**命令管理器 */
export default class JXLVCmdMgr extends ObjectWrap implements IComLike {
	/** 资源管理器 */
	public assetManager: CustomsAssets;
	/**碰撞管理工具*/
	public collisionMgr: JXCollisionMgr;

	/*地图数据加载类 */
	private _parser: CustomsParser = null;
	/**场景 */
	protected _sceneId: number = 0;
	public get sceneId() {
		return this._sceneId;
	}
	private level: number = 0;
	private assetImpl: GAssetImpl = null;
	public rootNode: cc.Node;
	private _propsLayer: cc.Node = null;
	private _isEnd: boolean = false;
	public set isEnd(v: boolean) {
		this._isEnd = v;
	}
	private _props: cc.Node[] = [];
	public get props() {
		return this._props;
	}

	public _lineViewCtrl: LineViewCtrl = null;
	private _tick = null;

	constructor(sceneId: number, nameFlag: string, level: number, apl: GAssetImpl, lineLayer: LineViewCtrl) {
		super();
		this.assetImpl = apl
		this._lineViewCtrl = lineLayer;
		this.level = level;
		this._sceneId = sceneId;
		this.assetManager = new CustomsAssets(nameFlag);
		this.collisionMgr = new JXCollisionMgr(this);
		this.registerEvent();
	}

	update(dt: number) {

	}

	/**注冊事件 */
	protected registerEvent() {

	}

	public endFight(isWin: boolean, self?: JXComCollider, cb?) {
		if (isWin) {
			let now = GCtrl.now;
			let endTime = now + 3 * JXDef.Time.SECOND;
			if (this._tick) return;
			this._lineViewCtrl.cd.node.parent.active = true;
			this._lineViewCtrl.cd.string = "5";
			this._tick = ViewUtil.taskTick({
				start: now,
				end: endTime,
				tickTime: 1,
				update: function () {
					let num = Number(this._lineViewCtrl.cd.string);
					num--;
					AudioMgr.Ins().playEffect(Res.audio.cd);
					this._lineViewCtrl.cd.string = num;
				}.bind(this),
				endcb: function () {
					this._tick = null;
					this._lineViewCtrl.cd.node.parent.active = false;
					if (this && !this._isEnd) {
						/**处理触碰触碰到结束的结果*/
						if (self && self.CollisionType === CollisionType.TOUCH2END && !self.isTouch) {
							return;
						}
						/**处理触碰分离到结束的结果*/
						if (self && self.CollisionType === CollisionType.NOTOUCH2END && self.isTouch) {
							return;
						}
						this._lineViewCtrl.dagou.setCompleteListener(() => {
							GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.resultCtrl, this._sceneId, this.level, isWin, () => {
								this._lineViewCtrl.onClose();
							});
						})
						this._lineViewCtrl.dagou.node.active = true;
						AudioMgr.Ins().playEffect(Res.audio.dagou);
						this._lineViewCtrl.dagou.setAnimation(0, "dagou", false)
						this.collisionMgr.running = false;
					}
				}.bind(this)
			}, this.rootNode);
		} else {
			this._lineViewCtrl.cd.node.parent.active = false;
			this.rootNode.stopAllActions();
			this.collisionMgr.running = false;
			this._isEnd = true;
			this._lineViewCtrl.dagou.node.active = true;
			this._lineViewCtrl.dagou.setCompleteListener(() => {
				this._lineViewCtrl.ResetGame();
			});
			AudioMgr.Ins().playEffect(Res.audio.shibai);
			this._lineViewCtrl.dagou.setAnimation(0, "dacha", false)
			GameMgr.uiMgr.showToast("游戏失败！");
		}
	}

	/**加载场景所需的资源 */
	public loadAllResources(endCb: any) {
		let prefix = ""
		switch (this._sceneId) {
			case PART_BTL_SCENE.SAVE: {
				prefix = "lineSave_";
				break;
			}
			case PART_BTL_SCENE.DECODE: {
				prefix = "lineRiddle_";
				break;
			}
			case PART_BTL_SCENE.MEET: {
				prefix = "lineMeet_";
				break;
			}

		}
		let root = Res.data.root + "customs/" + prefix + this.level;
		this._parser = new CustomsParser(root, (mpp: CustomsParseProgress, mps: MapParseStatus, parser: CustomsParser) => {
			if (mpp === CustomsParseProgress.MPP_LoadMapData && mps === MapParseStatus.MPS_LoadSuccess) {
				this.assetManager.loadAllRoundAssets(parser._mapData.values(), this._sceneId, () => {
					this.drawElement();
					/**綁定碰撞器 */
					this.collisionMgr.running = true;
					endCb();
				})
			}
		}, this.assetImpl)
		this._parser.loadMapData();
	}

	/**创建效果 */
	protected drawElement() {
		let element = this._parser._mapData.values<CustomsData>();
		for (let i = 0; i < element.length; i++) {
			let data = element[i];
			if (data.isRoot) {
				let node = new cc.Node();
				let root = this.rootNode.getChildByName("root")
				node.parent = root;
				this.setItemProps(node, data);
				this._propsLayer = node;
				break;
			}
		}

		for (let i = 0; i < element.length; i++) {
			let data = element[i];
			if (!data.isRoot) {
				let path = "censor" + this.sceneId + JXCustomsPrefab + data.name
				let prefab = this.assetManager.assetImpl.getPreLoadAsset<cc.Prefab>(path);
				let node = cc.instantiate(prefab);
				node.parent = this._propsLayer;
				this.setItemProps(node, data);
				this._props.push(node);
			}
		}
		let data = this._parser._compData.values<CustomsComp>();
		for (let i = 0; i < data.length; i++) {
			let compInfo = data[i];
			for (let j = 0; j < this._props.length; j++) {
				let node = this._props[j];
				if (node.name === compInfo.nodeName) {
					let comp = node.addComponent(JXComCollider);
					comp._target = compInfo.target;
					comp.nodeName = compInfo.nodeName;
					comp.CollisionType = compInfo.type;
					comp._isHumen = compInfo.isHumen;
					comp.InitialRigid = compInfo.rigid;
					comp.isLoop = compInfo.aniLoop;
					comp.aniName = compInfo.aniName;
					comp.bindCollisionMgr(this.collisionMgr)
					continue
				} else if (node.children.length) {
					let target = node.getChildByName(compInfo.nodeName);
					if (target) {
						let comp = target.addComponent(JXComCollider);
						comp._target = compInfo.target;
						comp.nodeName = compInfo.nodeName;
						comp.CollisionType = compInfo.type;
						comp._isHumen = compInfo.isHumen;
						comp.InitialRigid = compInfo.rigid;
						comp.isLoop = compInfo.aniLoop;
						comp.aniName = compInfo.aniName;
						comp.bindCollisionMgr(this.collisionMgr);
						continue;
					}
				}
			}
		}

	}

	/**设置道具属性 */
	protected setItemProps(node: cc.Node, data: CustomsData) {
		let rigidBody = node.getComponent(cc.RigidBody);
		node.active = true;
		if (rigidBody) rigidBody.awake = false
		node.anchorX = data.anch.x;
		node.anchorY = data.anch.y;
		node.position = data.positon;
		node.opacity = data.opacity;
		node.color = new cc.Color().fromHEX(data.color);
		node.setContentSize(data.size);
		node.scaleX = data.scale.x;
		node.scaleY = data.scale.y;
		node.angle = data.angle;
		node.name = data.name;
		node.groupIndex = data.group;
		node["dataId"] = data.id;
		if (rigidBody) rigidBody.awake = true;
	}

	/**重置道具层 */
	public resetPropsLayer() {
		this._propsLayer.destroy();
		this._props = [];
		this.drawElement();
	}


	/**设置物理层 */
	public initPhysicsLayer(target: cc.Node) {
		if (!target) return;
		this.rootNode = target;
		return target;
	}

	/**
	 *判定一个点是否在包围盒内
	 * @param {cc.Vec2} point
	 * @param {cc.PhysicsCollider} collider
	 * @return {*} 
	 * @memberof JXLVCmdMgr
	 */
	public checkPointInCollider(point: cc.Vec2, node: cc.Node) {
		if (!cc.isValid(node)) {
			return false;
		}
		let collider = node.getComponent(cc.PhysicsCollider);
		let touchPoint = node.convertToNodeSpaceAR(point)
		let isIn = false;
		if (collider) {
			if (collider instanceof cc.PhysicsPolygonCollider && !(collider instanceof LinePhysicsCollider)) {
				let box = collider.points;
				isIn = cc.Intersection.pointInPolygon(touchPoint, box);
			} else
				if (collider instanceof cc.PhysicsCircleCollider) {
					let pos = collider.node.parent.convertToWorldSpaceAR(collider.node.position);
					let tadius = collider.radius;
					isIn = cc.Intersection.circleCircle({ position: point, radius: 1 }, { position: pos, radius: tadius })
				} else {
					let width = node.width / 2;
					let height = node.height / 2;
					let shapes = collider["_shapes"];
					for (let i = 0; i < shapes.length; i++) {
						let box = shapes[i]["m_normals"]
						let rects = []
						let m_centroid = shapes[i]["m_centroid"];
						for (let j = 0; j < box.length; j++) {
							let x = box[j].x - m_centroid.x;
							let y = box[j].y - m_centroid.y;
							let rect = cc.v2();
							rect.x = x * width;
							rect.y = y * height;
							rects.push(rect);
						}
						isIn = cc.Intersection.pointInPolygon(touchPoint, rects);
						if (isIn) {
							break;
						}
					}
				}
		}
		return isIn
	}

	public destroyAssetManager() {
		this.assetManager.destroy();
		this.assetManager = null;
	}

	/**释放已经加载的资源 */
	public releaseResource() {
		this.assetManager.assetImpl.tagReleaseTempAssets();
	}

	public destroy() {
		this.destroyAssetManager();
		GCtrl.ES.off(this);
	}
}