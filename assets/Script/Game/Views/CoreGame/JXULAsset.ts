import { GAssetImpl } from "../../../Core/GLoader/GLoader";
import { Res } from "../../Common/UIResources";
import { INVALID_VALUE } from './../../../Core/CoreDefine';
import { ObjectWrap } from './../../../Core/FrameEx/ES5Ex';
import { CustomsData } from "./CustomsParser";
import { COMMON_ANI_NAME, JXBtlArrIx, JXCustomsPrefab, JXSceneEffect } from "./JXULDEfine";
/*资源加载类 */
export class CustomsAssets extends ObjectWrap {
	public assetImpl: GAssetImpl = null;
	constructor(key: string) {
		super();
		this.assetImpl = GAssetImpl.getAssetImpl(key);
	}

	/** 加载资源 */
	public preLoads(endCb: any, ...allAssets) {
		this.assetImpl.preLoads((curIndx: number, totalCount: number, path: string, err: Error, asset: typeof cc.Asset) => {
			if (curIndx == totalCount) {
				endCb();
			}
		},
			...allAssets);
	}

	/**
	  * 加载所有资源
	  * @param datas 
	  * @param sceneId 场景ID
	  * @param endCb 加载完成回调
	  */
	public loadAllRoundAssets(datas: CustomsData[], sceneId: number, endCb: any) {
		let allPaths = [];
		let allAssets = [];
		this.loadSceneAssets(allAssets, allPaths)
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			if (!data.isRoot) {
				let path = "censor" + sceneId + JXCustomsPrefab + data.name;
				allAssets.push({ type: cc.Prefab, path })
			}
		}

		this.preLoads((curIndx: number, totalCount: number, asset: cc.Asset) => endCb(),
			{ type: sp.SkeletonData, path: Res.spine.love },
			...allAssets);
	}

	/**
	   * 加载场景特效资源
	   * @param assets -
	   * @param paths -
	  */
	public loadSceneAssets(assets: AssetInfo[], paths: string[]) {
		let keys = Object.keys(JXSceneEffect);
		for (let i = 0; i < keys.length; i++) {
			let path = JXSceneEffect[keys[i]];
			if (!this.hasLoadAsset(paths, path)) {
				assets.push({ type: sp.SkeletonData, path: path });
				paths.push(path);
			}
		}
	}

	/**
	    * 检测paths中是否包含path
	    * @param paths -
	    * @param path -
	  */
	public hasLoadAsset(paths: string[], path: string): boolean {
		return paths.indexOf(path) != INVALID_VALUE;
	}

	/**
	  * 创建一个帧动画
	  * @param config 帧动画配置
	  * @param wrapModel 循环模式
	  * @param rootPath 资源根目录
	  */
	public createEffectsAnimation(config: FrameAniConfigure, wrapModel, rootPath: string, ANIMATION_SPEED): cc.AnimationClip {
		let assetPath = rootPath + config[JXBtlArrIx.Zero];
		let asset = this.assetImpl.getPreLoadAsset<cc.SpriteAtlas>(assetPath);
		if (!asset) {
			cc.log("找不到资源：" + assetPath);
			return;
		}
		GAssetImpl.checkAtlasDyPack(assetPath, asset);
		let clips = this.assetImpl.atlasJXLoadClips(asset, {    /** clip name */
			aniName: COMMON_ANI_NAME,
			/** 前缀 */
			prefix: config[JXBtlArrIx.One],
			/** 数值位数 */
			numberFix: config[JXBtlArrIx.Two],
			/** 起始数值索引 */
			minIdx: 1,
			/** 结束数值索引 */
			maxIdx: config[JXBtlArrIx.Three]
		});
		let clip = clips[JXBtlArrIx.Zero];
		if (!clip) {
			cc.log(`帧动画配置BUG 资源为${assetPath}, 配置为${JSON.stringify(config)}`);
		}
		clip.wrapMode = wrapModel;
		clip.sample = 30;
		clip.speed = ANIMATION_SPEED;
		return clip;
	}

	/**
	 * 创建一个帧动画
	 * @param aniConfig 动画配置
	 * @param root 根目录
	 * @param wrapModel 循环模式
	 * @param cb 回调
	 */
	public createEffect(aniConfig: FrameAniConfigure, root: string, wrapModel: cc.WrapMode, speed = 1, cb?): cc.Animation {
		let node = new cc.Node();
		let sp = node.addComponent(cc.Sprite);
		sp.type = cc.Sprite.Type.SIMPLE;
		sp.sizeMode = cc.Sprite.SizeMode.RAW;
		node.scale = aniConfig[JXBtlArrIx.Five];
		node.anchorY = 0;
		node.opacity = aniConfig[JXBtlArrIx.Six] * 255;
		if (aniConfig[JXBtlArrIx.Four]) {
			sp.setBlend(cc.macro.BlendFactor.SRC_ALPHA, cc.macro.BlendFactor.ONE);
		}
		sp.trim = false;
		let animation = node.addComponent(cc.Animation);
		let clip = this.createEffectsAnimation(aniConfig, wrapModel, root, speed);
		animation.addClip(clip);
		animation.once(cc.Animation.EventType.FINISHED, () => {
			node.destroy();
			if (cb) cb();
		})
		return animation;
	}

	/**
	  * 创建一个spine
	  * @param path 
	  */
	public createSpine(path: string): sp.Skeleton {
		let spineNode = new cc.Node();
		let spine = spineNode.addComponent(sp.Skeleton);
		spine.premultipliedAlpha = false;
		spine.skeletonData = this.assetImpl.getPreLoadAsset<sp.SkeletonData>(path);
		return spine;
	}

	public destroy() {
		this.assetImpl.release();
		this.assetImpl = null;
	}


}