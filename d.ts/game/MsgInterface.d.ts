declare interface PlayerSkillInfo {
	dir: number,
	isPlayer: boolean
}


declare interface PlayerUseSkill {
	playerId: string,
	skillId: number,
}

declare interface PlayerCastSkill extends PlayerUseSkill {

}

declare interface PlayerCastSkillOver {
	playerId: string
}