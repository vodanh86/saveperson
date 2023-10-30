import { GStatic } from "../../../Core/Manager/DataPool";

const { ccclass } = cc._decorator;
@ccclass
export class SThemeData extends GStatic {
	public parse(obj: any): boolean {
		for (let i = 0; i < obj.data.length; i++) {
			let raw = GStatic.addonRaw<SThemeDataRaw>(obj.data[i]);
			this._data.set(raw.id, raw);
		}
		return true;
	}


	public getNewRaw() {
		let raws = this._data.values<SThemeDataRaw>()
		for (let i = 0; i < raws.length; i++) {
			if (raws[i].isNew) {
				return raws[i]
			}
		}
	}


	public getRawByType(type: number) {
		let raws = this._data.values<SThemeDataRaw>()
		for (let i = 0; i < raws.length; i++) {
			if (raws[i].type == type) {
				return raws[i]
			}
		}
	}
}