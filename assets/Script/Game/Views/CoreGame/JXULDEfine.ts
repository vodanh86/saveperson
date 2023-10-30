export const JXSceneEffect: { [key: string]: string } = {

}

export const COMMON_ANI_NAME = "COMMON_NAME";
export const JXCustomsPrefab = "/customsItem/";

/** JXBattle Array common Index: 战斗库普通索引 */
export enum JXBtlArrIx {
	Zero,
	One,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine,
	Ten,
}

/**类型 */
export enum InitialRigid {
	NONE,
	/**画线后苏醒*/
	LINEAWARD,
	/**睡眠 */
	SLEEP,
	LINELISTEN,
}



export enum CollisionType {
	/**不处理碰撞 */
	NONE,
	/**碰撞目标消失*/
	VANISH,
	/**苏醒目标 */
	WAKETARGET,
	/**发生碰撞就胜利 */
	VANISHWIN,
	/**水 */
	WATER,
	/**不能碰撞的节点 */
	CANTTOUCH,
	/*触碰到结束*/
	TOUCH2END,
	/**没有触摸到结束 */
	NOTOUCH2END
}
