import { MapWrap } from "../../../Core/FrameEx/ES5Ex";
import { GAssetImpl } from "../../../Core/GLoader/GLoader";
import MathEx from "../../../Core/Math/MathEx";

//info[类型,角度,[x,y],[scalex,scaley],[anchx,anchy],[Sizex,size],'颜色',opacity,分组]
export declare type CustomeDataTpl = [string, number, number[], number[], number[], number[], string, number, number]
export interface CustomsData {
	id: string,
	name: string,
	angle: number,
	positon: cc.Vec2,
	scale: cc.Vec2,
	anch: cc.Vec2,
	size: cc.Size,
	color: string,
	opacity: number,
	group: number,
	isRoot: boolean,
}

export interface CustomsComp {
	nodeName: string,
	target: string,
	type: number,
	isHumen: boolean,
	rigid: number,
	aniLoop: boolean,
	aniName: string,
}

/**关卡加载数据 */
export enum CustomsParseProgress {
	MPP_LoadMapData, // 加载地图数据
}

/**
 * 地图加载状态
 */
export enum MapParseStatus {
	MPS_BeginLoad, // 开始加载；
	MPS_Loading,    // 加载中
	MPS_LoadSuccess, // 加载成功
	MPS_LoadFailed, // 加载失败
}


var NonUuidMark = '.';
export class JXIdGenerater {
	protected _id: number;
	protected _prefix: string;
	constructor(category) {
		this._id = 0 | (Math.random() * 998);
		this._prefix = category ? (category + NonUuidMark) : '';
	}

	getNewId() {
		return this._prefix + (++this._id);
	}

	getOffsetId(offset: number) {
		return this._prefix + (this._id + offset);
	}

}
/******************************************************************************************************************* loader */
export class CustomsParser {
	protected _worldAsseet: cc.JsonAsset;
	public _mapData: MapWrap<string, CustomsData> = new MapWrap<string, CustomsData>();
	public _compData: MapWrap<string, CustomsComp> = new MapWrap<string, CustomsComp>()

	// 加载进度回调
	protected _progressCallBack: any = null;
	// 地图文件夹的根目录
	protected _filePath: string = '';
	private _assetImpl: GAssetImpl = null;
	/** ID生成器 */
	public insIdGentor: JXIdGenerater;

	constructor(path: string, progressCallBack: any, assetImpl: GAssetImpl) {
		this._filePath = path;
		this._assetImpl = assetImpl;
		this._progressCallBack = progressCallBack;
		this.insIdGentor = new JXIdGenerater("Props");
	}

	/**加载地图数据 */
	public loadMapData() {
		this.callProgress(CustomsParseProgress.MPP_LoadMapData, MapParseStatus.MPS_BeginLoad);
		let self = this;
		this._assetImpl.json(this._filePath, (err, JsonAsset: cc.JsonAsset) => {
			if (err) {
				self.callProgress(CustomsParseProgress.MPP_LoadMapData, MapParseStatus.MPS_LoadFailed, err);
			}
			self._worldAsseet = JsonAsset;
			let datas: CustomeDataTpl[] = self._worldAsseet.json.items;
			let comps: CustomsComp[] = self._worldAsseet.json.collider;
			self.dealWithCustomeData(self._worldAsseet.json.info, self._worldAsseet.json.name);
			for (let i = 0; i < datas.length; i++) {
				self.dealWithCustomeData(datas[i])
			}
			for (let j = 0; j < comps.length; j++) {
				self._compData.set(comps[j].nodeName, comps[j]);
			}
			console.log("地图数据解析完成:", self._mapData)
			self.callProgress(CustomsParseProgress.MPP_LoadMapData, MapParseStatus.MPS_LoadSuccess, this)
		}, false)
	}

	/**处理数据 */
	protected dealWithCustomeData(data: CustomeDataTpl, name?: string) {
		let customeData: CustomsData = {
			id: this.insIdGentor.getNewId(),
			name: data[0],
			angle: data[1],
			positon: MathEx.arrToVec2(data[2]),
			scale: MathEx.arrToVec2(data[3]),
			anch: MathEx.arrToVec2(data[4]),
			size: this.arrToSize(data[5]),
			color: data[6],
			opacity: data[7],
			group: data[8],
			isRoot: name ? true : false
		}
		this._mapData.set(customeData.id, customeData);
	}
	/**
      * 地图加载进度回调
      * @param mpp 进度回调
      * @param mps 加载状态
      * @param param 额外参数
      */
	public callProgress(mpp: CustomsParseProgress, mps: MapParseStatus, param: any = null) {
		if (!this._progressCallBack) return;
		this._progressCallBack(mpp, mps, param);
	}

	/**将数组转化为cc.Size */
	private arrToSize(arr: number[]): cc.Size {
		let size = new cc.Size(0);
		size.width = arr[0];
		size.height = arr[1];
		return size;
	}



}