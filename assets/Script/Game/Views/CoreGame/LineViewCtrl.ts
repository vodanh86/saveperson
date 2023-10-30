// author: http://lamyoung.com/


import { tyqSDK } from "../../../../resources/tyq2.x/tyq-sdk";
import { JXDef } from "../../../conventions/JXCommon";
import { INVALID_VALUE } from "../../../Core/CoreDefine";
import { GCtrl } from "../../../Core/GCtrl";
import GViewBase from "../../../Core/GView/GViewBase";
import { AudioMgr } from "../../../Core/Manager/AudioMgr";
import MathEx, { Plane } from "../../../Core/Math/MathEx";
import { CMsg, PART_BTL_SCENE } from "../../Common/Define";
import { L } from "../../Common/Language";
import { VIEW_ID } from "../../Common/UI";
import { breathe } from "../../Common/UIAction";
import { Res } from "../../Common/UIResources";
import { JXLocales } from "../../Common/Zh";
import GameMgr from "../../Logic/GameMgr";
import { ViewUtil } from "../ViewUtil/VIewUtil";
import JXLVCmdMgr from "./JXLVCmdMgr";
import LinePhysicsCollider from "./LinePhysicsCollider";

const { ccclass, property } = cc._decorator;
@ccclass
export default class LineViewCtrl extends GViewBase {
    @property(cc.Node) lineLayer: cc.Node = null;
    @property(cc.Node) physicsLayer: cc.Node = null;
    @property(cc.Prefab) graphicsNode: cc.Prefab = null;
    @property(cc.Label) tip: cc.Label = null;
    @property(cc.Label) levelStr: cc.Label = null;
    @property(cc.Node) wells: cc.Node[] = [];
    @property(cc.Sprite) bg: cc.Sprite = null;
    @property(cc.Label) cd: cc.Label = null;
    @property(cc.Node) tipBtn: cc.Node = null;
    @property(sp.Skeleton) dagou: sp.Skeleton = null;
    @property(cc.Node) tipVideo: cc.Node = null;
    @property(cc.Node) finger: cc.Node = null;
    @property(cc.Node) videoFlags: cc.Node = null;

    private camera: cc.Camera = null;
    /**触摸开始的节点 */
    private _touchStartPoint: cc.Vec2 = null;
    private _IsTouchMoved: boolean = false;
    private _linePoints: cc.Vec2[] = [];
    private _curGrNode: cc.Node = null;
    private _allGrNodeArr: cc.Node[] = [];
    protected _plane: Plane;
    private MAX_LINE_POINT = 200;
    private _sceneId: number = null;
    private _winArgs: ArgsLineViewCtrl<any> = null;
    private _staticRaw: SLineSaveRaw | SLineRiddleRaw = null;
    private _level: number = INVALID_VALUE;
    /**绘制区域 */
    protected _drawRect: cc.Rect = null;
    /**公共的命令管理类 */
    private _cmdMgr: JXLVCmdMgr;
    private _audioPlay: boolean = false;
    private _restartTime: number = 0;

    protected onGLoad(): void {
        this.MAX_LINE_POINT = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.lineLength);
        cc.macro.ENABLE_MULTI_TOUCH = false;
        this.camera = cc.find("Canvas/Camera").getComponent(cc.Camera);
        this._plane = new Plane;
        this._plane.p = new cc.Vec3(0, 0, 0);
        this._plane.n = new cc.Vec3(0, 0, 1);
        cc.director.getPhysicsManager().enabled = true;
        this.tipVideo.active = GameMgr.luserData.tipTime <= 0;
        // cc.director.getPhysicsManager().debugDrawFlags = 1;
        if (Number(tyqSDK.getSwitchValue("switch_finger"))) {
            this.setFinger();
        }
    }

    public onGStart(winArgs: ArgsLineViewCtrl<any>): void {
        this._sceneId = winArgs.sceneId;
        this._winArgs = winArgs;
        this.loadEnv();
        breathe(this.tipBtn);
        GameMgr.sdkMgr.hideBanner();
    }

    /**手指 */
    protected setFinger() {

        let time = [3, 4, 5, 6][MathEx.random(0, 3)];
        let now = GCtrl.now;
        let endTime = now + time * JXDef.Time.SECOND;
        ViewUtil.taskTick({
            start: now,
            end: endTime,
            tickTime: 1,
            endcb: function () {
                this.finger.active = true;
            }.bind(this)
        }, this.node);
    }

    /**加载环境 */
    protected loadEnv() {
        switch (this._sceneId) {
            case PART_BTL_SCENE.SAVE: {
                this.wells.forEach(node => { node.active = false; });
                let args = this._getArgs<SceneArg>()
                this._level = args.level;
                this._staticRaw = GameMgr.lineSave.getRaw<SLineSaveRaw>(this._level);
                this.assetImpl.spriteFrame(this.bg, Res.texture.big.bg2);
                tyqSDK.startGame(10000 + this._level);
                break;
            }
            case PART_BTL_SCENE.DECODE: {
                let args = this._getArgs<SceneArg>()
                this._level = args.level;
                this._staticRaw = GameMgr.lineRiddle.getRaw<SLineRiddleRaw>(this._level);
                this.assetImpl.spriteFrame(this.bg, Res.texture.big.bg3);
                tyqSDK.startGame(20000 + this._level);
                break;
            }
            case PART_BTL_SCENE.MEET: {
                this.wells.forEach(node => { node.active = false; });
                let args = this._getArgs<SceneArg>()
                this._level = args.level;
                this._staticRaw = GameMgr.lineMeet.getRaw<SLineRiddleRaw>(this._level);
                this.assetImpl.spriteFrame(this.bg, Res.texture.big.bg4);
                tyqSDK.startGame(30000 + this._level);
                break;
            }
        }
        if (this._level === 1) {
            GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.GuideCtrl, this._sceneId)
        }
        this.setView();
        this._cmdMgr = new JXLVCmdMgr(this._sceneId, "RBBattle", this._level, this.assetImpl, this);
        this._cmdMgr.initPhysicsLayer(this.physicsLayer);
        this._cmdMgr.loadAllResources(this.onResLoaded.bind(this));
    }

    protected setView() {
        this.tip.string = this._staticRaw.tip;
        this.levelStr.string = L(JXLocales.fight.customs, this._level)
    }

    /**所有资源加载完毕 */
    protected onResLoaded() {
        if (!this.isValid) return;
        this._drawRect = cc.rect(-this.physicsLayer.width / 2, -this.physicsLayer.height / 2, this.physicsLayer.width, this.physicsLayer.height)
        this.startOpt();

    }

    protected _getArgs<T>(args0?: any): T {
        if (args0) {
            return args0.args as T;
        }
        return this._win.logicArgs[0].args as T;
    }

    /**開始操作 */
    protected startOpt(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this._IsTouchMoved = false;
        this.CreatAGrNode();
    }

    /**
     *获取触碰点的坐标
     *由于在适配宽高的情况下，getLocation 获得的位置坐标不正确 
     *可以用这个方法将getLocation获取的屏幕坐标转换成世界坐标
     * @param {cc.Vec2} pos
     * @return {*} 
     * @memberof LineView
     */
    public getTouchWorldPos(pos: cc.Vec2) {
        let ray = this.camera.getRay(pos);
        let world = MathEx.rayPlaneIntersectPoint(ray, this._plane);
        return cc.v2(world.x, world.y);
    }

    protected onTouchStart(touch: cc.Touch) {
        let world = this.getTouchWorldPos(touch.getLocation());
        let touchPos = this.lineLayer.convertToNodeSpaceAR(world);
        let isInCollider = this.checkPointInRect(world);
        if (this._drawRect.contains(touchPos) && !isInCollider) {
            this._touchStartPoint = touchPos
            this._linePoints = [];
            this._curGrNode.getComponent(cc.Graphics).clear();
            this._curGrNode.getComponent(cc.Graphics).moveTo(this._touchStartPoint.x, this._touchStartPoint.y);
            this._linePoints.push(cc.v2(this._touchStartPoint.x, this._touchStartPoint.y));
        }
    }

    protected onTouchMove(touch: cc.Touch) {

        if (!this._touchStartPoint) {
            return;
        }
        if (!this._audioPlay) {
            this._audioPlay = true
            AudioMgr.Ins().playEffect(Res.audio.huaxian, () => { }, () => {
                this._audioPlay = false;
            });
        }

        let func = (point) => {
            let touchPos = point;
            this._curGrNode.getComponent(cc.Graphics).lineTo(touchPos.x, touchPos.y);
            this._curGrNode.getComponent(cc.Graphics).stroke();
            let latsPont = this._linePoints[this._linePoints.length - 1];
            let offsetx = 0;
            let offsety = 0;
            let offset = 1
            if (latsPont.x > touchPos.x) {
                offsetx = offset;
            } else {
                offsetx = -offset;
            }
            if (latsPont.y > touchPos.y) {
                offsety = offset;
            } else {
                offsety = -offset;
            }
            this._curGrNode.getComponent(cc.Graphics).moveTo(touchPos.x + offsetx, touchPos.y + offsety);
            this._linePoints.push(cc.v2(touchPos.x, touchPos.y));
        }

        this._IsTouchMoved = true;
        let world = this.getTouchWorldPos(touch.getLocation());
        let touchPos = this.lineLayer.convertToNodeSpaceAR(world);
        let lastPos = this._linePoints[this._linePoints.length - 1];
        lastPos = cc.v2(lastPos.x, lastPos.y);
        if (lastPos) {
            let linelen = lastPos.sub(touchPos).mag();
            if (linelen > 20) {
                let num = Math.floor(linelen / 5)
                let x = (touchPos.x - lastPos.x) / num;
                let y = (touchPos.y - lastPos.y) / num;
                let offset = cc.v2(x, y);
                for (let i = 0; i < num; i++) {
                    let point = lastPos.addSelf(offset);
                    let world = this.lineLayer.convertToWorldSpaceAR(point);
                    let isInCollider = this.checkPointInRect(world);
                    if (isInCollider) {
                        func(touchPos);
                        this.onTouchEnd();
                        return;
                    }
                }
            } else {
                let isInCollider = this.checkPointInRect(world);
                if (isInCollider) {
                    this.onTouchEnd();
                    return;
                }
            }
        }
        if (this._linePoints.length < this.MAX_LINE_POINT) {
            // if (this._sceneId === PART_BTL_SCENE.DECODE) {
            if (touchPos.x > this._drawRect.xMax) touchPos.x = this._drawRect.xMax;
            if (touchPos.y > this._drawRect.yMax) touchPos.y = this._drawRect.yMax;
            if (touchPos.x < this._drawRect.xMin) touchPos.x = this._drawRect.xMin;
            if (touchPos.y < this._drawRect.yMin) touchPos.y = this._drawRect.yMin;
            // }
            func(touchPos);
        }
    }

    /**触摸结束 */
    protected onTouchEnd() {
        if (!this._touchStartPoint) {
            return;
        }
        if (!this._IsTouchMoved) {
            return;
        }
        this.DrawPathOver();
        this._IsTouchMoved = false;
        this.CreatAGrNode();
        this._touchStartPoint = null;
        GCtrl.ES.emit(CMsg.client.fight.lineEnd)
    }

    protected checkPointInRect(point: cc.Vec2) {
        let items = [...this._cmdMgr.props, ...this._allGrNodeArr];
        let isIn = false;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            isIn = this._cmdMgr.checkPointInCollider(point, item);
            if (isIn) return isIn;
        }
        return isIn
    }

    // 把本次划过的路线做成物理节点
    protected DrawPathOver() {
        let rigibodyLogic = this._curGrNode.addComponent(cc.RigidBody);
        rigibodyLogic.gravityScale = 2;
        let physicsLine = this._curGrNode.addComponent(LinePhysicsCollider);
        rigibodyLogic.bullet = true;
        physicsLine.lineWidth = this._curGrNode.getComponent(cc.Graphics).lineWidth;
        let arr = [...this._linePoints]
        physicsLine.points = arr
        physicsLine.friction = 0.2;
        physicsLine.density = 2;
        physicsLine.apply();
        this._linePoints = [];
    }

    //创建画线节点
    protected CreatAGrNode() {
        this._curGrNode = cc.instantiate(this.graphicsNode);
        this.lineLayer.addChild(this._curGrNode)
        this._allGrNodeArr.push(this._curGrNode);
    }

    /**重新开始按钮 */
    protected onRestartBtnClick() {
        let time = Number(tyqSDK.getSwitchValue("restart_time"));
        if (this._restartTime < time) {
            this._restartTime++;
            this.ResetGame();
            if (this._restartTime === time) {
                this.videoFlags.active = true;
            }
        } else {
            GameMgr.sdkMgr.watchAd(() => {
                this.ResetGame();
            })
        }
    }

    /**重新开始 */
    public ResetGame() {
        this._allGrNodeArr.forEach((node) => {
            node.removeFromParent();
            node.destroy();
        })
        this._cmdMgr.isEnd = false;
        this._cmdMgr.collisionMgr.running = true;
        this._cmdMgr.resetPropsLayer();
        this.dagou.node.active = false;
        this.cd.node.parent.active = false;
        this._allGrNodeArr = [];
        this.CreatAGrNode();
    }

    /**
     * 提示
     */
    protected onTipBtnClick() {
        let isUse = GameMgr.luserData.costTipTime();
        this.tipVideo.active = GameMgr.luserData.tipTime <= 0;
        if (isUse) {
            GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.tipCtrl, this._sceneId, this._level);
            return;
        } else {
            GameMgr.sdkMgr.watchAd(() => {
                GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.tipCtrl, this._sceneId, this._level);
            }, () => {
                GameMgr.uiMgr.showToast(JXLocales.currency.tl);
            })
        }
    }


    /**下一关 */
    protected onNextClick() {
        let curLevel = GameMgr.luserData.getLevelByType(this._sceneId)
        let next = null;
        let nextId = this._level + 1;
        let typeName = "";
        switch (this._sceneId) {
            case PART_BTL_SCENE.SAVE: {
                next = GameMgr.lineSave.getRaw(nextId);
                typeName = JXLocales.fight.save;
                break;
            }
            case PART_BTL_SCENE.DECODE: {
                next = GameMgr.lineRiddle.getRaw(nextId);
                typeName = JXLocales.fight.decode;
                break;
            }
            case PART_BTL_SCENE.MEET: {
                next = GameMgr.lineMeet.getRaw(nextId);
                typeName = JXLocales.fight.meet;
                break;
            }

        }

        let func = () => {
            if (next) {
                GameMgr.sdkMgr.umaSetPoint(L(JXDef.umaPoint.jump, typeName, this._level));
                GameMgr.sdkMgr.watchAd(() => {
                    this.onClose()
                    let arg: ArgsLineViewCtrl<SceneArg> = {
                        sceneId: this._sceneId,
                        args: {
                            level: nextId
                        }
                    }
                    GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.lineView, arg);
                })
            } else {
                GameMgr.uiMgr.showToast(JXLocales.tip.last)
            }
        }
        if (curLevel >= this._level) {
            func();
        } else {
            GameMgr.luserData.setLevelByType(this._sceneId, this._level);
            func();
        }
    }


    onClose() {
        super.onClose();
        if (this._cmdMgr) {
            this._cmdMgr.destroy();
            this._cmdMgr = null;
        }
    }

    onGDestroy() {
        if (this._cmdMgr) {
            this._cmdMgr.destroy();
            this._cmdMgr = null;
        }
    }

}
