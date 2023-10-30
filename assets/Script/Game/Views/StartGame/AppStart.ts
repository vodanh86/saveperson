import GComponent from "../../../Core/FrameEx/GComponent";
import { JXViewPreLoad, JXWinInfo } from "../../Common/UI";
import { Res } from "../../Common/UIResources";
import GameMgr from "../../Logic/GameMgr";
import { Toast } from './../../Logic/ToastMgr';
import AppCtrl from "./AppCtrl";


const APP_CTRL = "AppCtrl"
const { ccclass, property, menu } = cc._decorator;
@ccclass @menu('AppStart')
export default class AppStart extends GComponent {
    @property(cc.Prefab) loadPrefab: cc.Prefab = null;

    protected __onLoad() {

        // i18n.initLocalesTTFHandler((lang, cb) => {
        //     console.log(lang)
        //     GLoader.font(`font/fzyt`, (ttf: cc.TTFFont) => {
        //         cb(ttf);
        //     })
        // }, {
        //     // 中文简体
        //     "f705d4c5-ea1f-4b96-8fa0-43f03313c35d": "zh_CN",
        // })

        i18n.init('zh_CN', () => {
            GameMgr.uiMgr.initWinInfos(JXWinInfo, JXViewPreLoad, (node) => {
                return new Toast(node);
            });
            cc.Button.comAudio = Res.audio.button;
            this.onGameStart();
        })
    }

    start() {

    }

    public onGameStart() {
        let node = cc.director.getScene().getChildByName(APP_CTRL);
        if (!node) {
            //添加一个控制节点
            node = new cc.Node();
            if (node) {
                node.name = 'AppCtrl';
                let appCtrl = node.addComponent(AppCtrl);
                appCtrl.initEvent();
                cc.game.addPersistRootNode(node);
            }
        }

        let loadNode = cc.instantiate(this.loadPrefab);
        GameMgr.uiMgr.uiRoot.addChild(loadNode);
    }
}

