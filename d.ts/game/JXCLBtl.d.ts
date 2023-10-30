import { JXEDir } from "../../assets/Script/Game/Views/Fight/JXULDefine";

interface JXCLAction {
	track: sp.spine.TrackEntry;
	duration: number;
}

interface IChessBtl {
	name: string,
	id: string,
	isPlayer: boolean,
	dir: JXEDir,
	tableId: number,
	ext?: any;
}

/** 战场UI窗口参数 */
declare interface ArgsLineViewCtrl<T> {
	/** 场景ID */
	sceneId: number;
	/** 场景特有参数 */
	args?: T;
	/** 关闭按钮回调 */
	colseCb?: any;
	unClosk?: boolean
	/** 强制不关闭界面 */
}