// @ts-nocheck
import { NetworkMgr } from "./weNetworkMgr";
import tyqSdkConfig from "./tyq-sdk-config";


class http {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance = new http();
	private _timeOut = 10 * 1000;
	private _httpUrl = tyqSdkConfig.server;
	////////////////////////////
	// get、set构造器
	///////////////////////////
	public set timeOut(time: number) {
		this._timeOut = time;
	}

	public set httpUrl(url: string) {
		this._httpUrl = url;
	}

	////////////////////////////
	// 构造函数
	///////////////////////////
	public constructor() {
	}

	public init(httpUrl: string) {
		this._httpUrl = httpUrl;
	}

	/**
	 * 发送请求
	 * @param route 注册事件，通过消息机制返回服务端回调的信息
	 * @param msg 请求数据
	 * @param mid 
	 */
	public post(route: string, msg: Object, mid?: number) {
		//计算请求时间//////
		// let time = new Date().getTime();
		////////////
		var dataStr = "";
		if (msg) {
			dataStr = this.createSign(msg);
		}
		let xhr = new XMLHttpRequest();//cc.loader.getXMLHttpRequest();
		// 超时时间1s，单位是毫秒
		xhr.timeout = this._timeOut;
		xhr.open('POST', this._httpUrl + route, true);
		// 服务端也需要设置
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		//DES3加密
		// dataStr = this.strToDES3(dataStr);
		xhr.send(dataStr);
		xhr.onreadystatechange = function onreadystatechange() {
			//////////
			// let time2 = new Date().getTime();
			// const dis = time2 - time;
			// console.log("返回时间======");
			// console.log(dis);
			///////////
			// 请求完成。在此进行处理。
			if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
				let respone: any = xhr.responseText;
				if (!respone) {
					// console.error('http request respone is null');
					NetworkMgr.onHttpError(mid, null, 'http request respone is null');
					return;
				}
				NetworkMgr.checkRespone(route, respone, mid);
			}
		}.bind(this);

		// XMLHttpRequest 超时
		xhr.ontimeout = function ontimeout(error) {
			console.error('http request timeout: ', error);
			NetworkMgr.onHttpError(mid, null, 'http request timeout: ');
			// NetworkMgr.onHttpError(mid, res, 'http request timeout: ');
		}.bind(this);

		// XMLHttpRequest 错误
		xhr.onerror = function onerror(error) {
			// console.error('http request error: ', error);
			NetworkMgr.onHttpError(mid, error, 'http request error: ');
			// alert('网络通信失败，请刷新重试。');
		}.bind(this);
	}

	/**
	 * GET 请求
	 * @param route 
	 * @param msg 
	 * @param mid 
	 */
	public post2(route: string, msg: Object, mid?: number) {
		const str = this.MsgToString(msg)
		let xhr = new XMLHttpRequest();
		// 超时时间1s，单位是毫秒
		xhr.timeout = this._timeOut;
		xhr.open('GET', this._httpUrl + route + "?" + str, true);
		// 服务端也需要设置
		xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
		xhr.send(JSON.stringify(msg));
		xhr.onreadystatechange = function onreadystatechange() {
			// 请求完成。在此进行处理。
			if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
				// console.log("返回"+xhr);
				let respone: any = xhr.responseText;
				if (!respone) {

					// console.error('http request respone is null');
					NetworkMgr.onHttpError(mid, null, 'http request respone is null');
					return;
				}
				NetworkMgr.checkRespone(route, respone, mid);
			}
		}.bind(this);

		// XMLHttpRequest 超时
		xhr.ontimeout = function ontimeout(error) {
			console.error('http request timeout: ', error);
			// NetworkMgr.onHttpError(mid, res, 'http request timeout: ');
		}.bind(this);

		// XMLHttpRequest 错误
		xhr.onerror = function onerror(error) {
			NetworkMgr.onHttpError(mid, error, 'http request error: ');
		}.bind(this);

	}

	/**
	 * Get请求，将json转换成字符串数据
	 */
	MsgToString(msg: any): string {
		let arr = Object.keys(msg);
		let str = "";
		for (let value of arr) {
			str += value + "=" + '"' + msg[value] + '"' + "&"
		}
		return str;
	}

	/**
	 * 数据加密
	 */
	strToDES3(data): any {
		// let des3Data: string = window.DES3.encrypt(global.DES3_KEY, data);
		// let newData = des3Data.replace(/\+/g, "%2B");
		// return newData;
	}

	/**生成sign加密 */
	private createSign(obj: Object) {
		var arr = new Array();
		var num = 0;
		for (var i in obj) {
			arr[num] = i;
			num++;
		}
		var sortArr = arr.sort();//参数名ASCII字典序排序
		var str = ""
		for (var i in sortArr) {
			if (!obj[sortArr[i]] && typeof (obj[sortArr[i]]) != "number") {
				continue;
			}
			str += sortArr[i] + "=" + obj[sortArr[i]] + "&&";
		}
		var signstr = str;
		signstr += "api_key=" + tyqSdkConfig.api_key;
		str += "sign=" + this.MD5(decodeURIComponent(signstr));
		return str;
	}

	/**md5加密*/
	private md5encode(str: string) {
		var hexcase = 0;
		var b64pad = "";
		var chrsz = 8;
		let hex_md5 = (s) => {
			return binl2hex(core_md5(str2binl(s), s.length * chrsz));
		}
		let b64_md5 = (s) => {
			return binl2b64(core_md5(str2binl(s), s.length * chrsz));
		}
		let str_md5 = (s) => {
			return binl2str(core_md5(str2binl(s), s.length * chrsz));
		}
		let hex_hmac_md5 = (key, data) => {
			return binl2hex(core_hmac_md5(key, data));
		}
		let b64_hmac_md5 = (key, data) => {
			return binl2b64(core_hmac_md5(key, data));
		}
		let str_hmac_md5 = (key, data) => {
			return binl2str(core_hmac_md5(key, data));
		}
		let md5_vm_test = () => {
			return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
		}
		let core_md5 = (x, len) => {
			x[len >> 5] |= 0x80 << ((len) % 32);
			x[(((len + 64) >>> 9) << 4) + 14] = len;
			var a = 1732584193;
			var b = -271733879;
			var c = -1732584194;
			var d = 271733878;
			for (var i = 0; i < x.length; i += 16) {
				var olda = a;
				var oldb = b;
				var oldc = c;
				var oldd = d;
				a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
				d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
				c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
				b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
				a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
				d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
				c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
				b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
				a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
				d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
				c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
				b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
				a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
				d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
				c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
				b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
				a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
				d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
				c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
				b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
				a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
				d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
				c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
				b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
				a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
				d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
				c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
				b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
				a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
				d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
				c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
				b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
				a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
				d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
				c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
				b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
				a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
				d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
				c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
				b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
				a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
				d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
				c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
				b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
				a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
				d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
				c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
				b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
				a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
				d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
				c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
				b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
				a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
				d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
				c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
				b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
				a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
				d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
				c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
				b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
				a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
				d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
				c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
				b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
				a = safe_add(a, olda);
				b = safe_add(b, oldb);
				c = safe_add(c, oldc);
				d = safe_add(d, oldd);
			}
			return Array(a, b, c, d);
		}
		let md5_cmn = (q, a, b, x, s, t) => {
			return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
		}
		let md5_ff = (a, b, c, d, x, s, t) => {
			return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		let md5_gg = (a, b, c, d, x, s, t) => {
			return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		let md5_hh = (a, b, c, d, x, s, t) => {
			return md5_cmn(b ^ c ^ d, a, b, x, s, t);
		}
		let md5_ii = (a, b, c, d, x, s, t) => {
			return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
		}
		let core_hmac_md5 = (key, data) => {
			var bkey = str2binl(key);
			if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);
			var ipad = Array(16),
				opad = Array(16);
			for (var i = 0; i < 16; i++) {
				ipad[i] = bkey[i] ^ 0x36363636;
				opad[i] = bkey[i] ^ 0x5C5C5C5C;
			}
			var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
			return core_md5(opad.concat(hash), 512 + 128);
		}
		let safe_add = (x, y) => {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
		let bit_rol = (num, cnt) => {
			return (num << cnt) | (num >>> (32 - cnt));
		}
		let str2binl = (str) => {
			var bin = Array();
			var mask = (1 << chrsz) - 1;
			for (var i = 0; i < str.length * chrsz; i += chrsz)
				bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
			return bin;
		}
		let binl2str = (bin) => {
			var str = "";
			var mask = (1 << chrsz) - 1;
			for (var i = 0; i < bin.length * 32; i += chrsz)
				str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
			return str;
		}
		let binl2hex = (binarray) => {
			var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			var str = "";
			for (var i = 0; i < binarray.length * 4; i++) {
				str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
					hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
			}
			return str;
		}
		let binl2b64 = (binarray) => {
			var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var str = "";
			for (var i = 0; i < binarray.length * 4; i += 3) {
				var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) |
					(((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) |
					((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
				for (var j = 0; j < 4; j++) {
					if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
					else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
				}
			}
			return str;
		}
		return hex_md5(str);
	}

	private MD5(instring) {
		var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
		var b64pad = "";  /* base-64 pad character. "=" for strict RFC compliance   */

		/*
		 * These are the functions you'll usually want to call
		 * They take string arguments and return either hex or base-64 encoded strings
		 */
		function hex_md5(s) { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
		function b64_md5(s) { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
		function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
		function hex_hmac_md5(k, d) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
		function b64_hmac_md5(k, d) { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
		function any_hmac_md5(k, d, e) { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

		/*
		 * Perform a simple self-test to see if the VM is working
		 */
		function md5_vm_test() {
			return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
		}

		/*
		 * Calculate the MD5 of a raw string
		 */
		function rstr_md5(s) {
			return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
		}

		/*
		 * Calculate the HMAC-MD5, of a key and some data (raw strings)
		 */
		function rstr_hmac_md5(key, data) {
			var bkey = rstr2binl(key);
			if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

			var ipad = Array(16), opad = Array(16);
			for (var i = 0; i < 16; i++) {
				ipad[i] = bkey[i] ^ 0x36363636;
				opad[i] = bkey[i] ^ 0x5C5C5C5C;
			}

			var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
			return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
		}

		/*
		 * Convert a raw string to a hex string
		 */
		function rstr2hex(input) {
			try { hexcase } catch (e) { hexcase = 0; }
			var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			var output = "";
			var x;
			for (var i = 0; i < input.length; i++) {
				x = input.charCodeAt(i);
				output += hex_tab.charAt((x >>> 4) & 0x0F)
					+ hex_tab.charAt(x & 0x0F);
			}
			return output;
		}

		/*
		 * Convert a raw string to a base-64 string
		 */
		function rstr2b64(input) {
			try { b64pad } catch (e) { b64pad = ''; }
			var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var output = "";
			var len = input.length;
			for (var i = 0; i < len; i += 3) {
				var triplet = (input.charCodeAt(i) << 16)
					| (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
					| (i + 2 < len ? input.charCodeAt(i + 2) : 0);
				for (var j = 0; j < 4; j++) {
					if (i * 8 + j * 6 > input.length * 8) output += b64pad;
					else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
				}
			}
			return output;
		}

		/*
		 * Convert a raw string to an arbitrary string encoding
		 */
		function rstr2any(input, encoding) {
			var divisor = encoding.length;
			var i, j, q, x, quotient;

			/* Convert to an array of 16-bit big-endian values, forming the dividend */
			var dividend = Array(Math.ceil(input.length / 2));
			for (i = 0; i < dividend.length; i++) {
				dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
			}

			/*
			 * Repeatedly perform a long division. The binary array forms the dividend,
			 * the length of the encoding is the divisor. Once computed, the quotient
			 * forms the dividend for the next step. All remainders are stored for later
			 * use.
			 */
			var full_length = Math.ceil(input.length * 8 /
				(Math.log(encoding.length) / Math.log(2)));
			var remainders = Array(full_length);
			for (j = 0; j < full_length; j++) {
				quotient = Array();
				x = 0;
				for (i = 0; i < dividend.length; i++) {
					x = (x << 16) + dividend[i];
					q = Math.floor(x / divisor);
					x -= q * divisor;
					if (quotient.length > 0 || q > 0)
						quotient[quotient.length] = q;
				}
				remainders[j] = x;
				dividend = quotient;
			}

			/* Convert the remainders to the output string */
			var output = "";
			for (i = remainders.length - 1; i >= 0; i--)
				output += encoding.charAt(remainders[i]);

			return output;
		}

		/*
		 * Encode a string as utf-8.
		 * For efficiency, this assumes the input is valid utf-16.
		 */
		function str2rstr_utf8(input) {
			var output = "";
			var i = -1;
			var x, y;

			while (++i < input.length) {
				/* Decode utf-16 surrogate pairs */
				x = input.charCodeAt(i);
				y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
				if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
					x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
					i++;
				}

				/* Encode output as utf-8 */
				if (x <= 0x7F)
					output += String.fromCharCode(x);
				else if (x <= 0x7FF)
					output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
						0x80 | (x & 0x3F));
				else if (x <= 0xFFFF)
					output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
						0x80 | ((x >>> 6) & 0x3F),
						0x80 | (x & 0x3F));
				else if (x <= 0x1FFFFF)
					output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
						0x80 | ((x >>> 12) & 0x3F),
						0x80 | ((x >>> 6) & 0x3F),
						0x80 | (x & 0x3F));
			}
			return output;
		}

		/*
		 * Encode a string as utf-16
		 */
		function str2rstr_utf16le(input) {
			var output = "";
			for (var i = 0; i < input.length; i++)
				output += String.fromCharCode(input.charCodeAt(i) & 0xFF,
					(input.charCodeAt(i) >>> 8) & 0xFF);
			return output;
		}

		function str2rstr_utf16be(input) {
			var output = "";
			for (var i = 0; i < input.length; i++)
				output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
					input.charCodeAt(i) & 0xFF);
			return output;
		}

		/*
		 * Convert a raw string to an array of little-endian words
		 * Characters >255 have their high-byte silently ignored.
		 */
		function rstr2binl(input) {
			var output = Array(input.length >> 2);
			for (var i = 0; i < output.length; i++)
				output[i] = 0;
			for (var i = 0; i < input.length * 8; i += 8)
				output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
			return output;
		}

		/*
		 * Convert an array of little-endian words to a string
		 */
		function binl2rstr(input) {
			var output = "";
			for (var i = 0; i < input.length * 32; i += 8)
				output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
			return output;
		}

		/*
		 * Calculate the MD5 of an array of little-endian words, and a bit length.
		 */
		function binl_md5(x, len) {
			/* append padding */
			x[len >> 5] |= 0x80 << ((len) % 32);
			x[(((len + 64) >>> 9) << 4) + 14] = len;

			var a = 1732584193;
			var b = -271733879;
			var c = -1732584194;
			var d = 271733878;

			for (var i = 0; i < x.length; i += 16) {
				var olda = a;
				var oldb = b;
				var oldc = c;
				var oldd = d;

				a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
				d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
				c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
				b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
				a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
				d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
				c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
				b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
				a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
				d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
				c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
				b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
				a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
				d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
				c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
				b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

				a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
				d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
				c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
				b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
				a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
				d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
				c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
				b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
				a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
				d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
				c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
				b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
				a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
				d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
				c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
				b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

				a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
				d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
				c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
				b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
				a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
				d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
				c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
				b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
				a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
				d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
				c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
				b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
				a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
				d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
				c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
				b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

				a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
				d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
				c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
				b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
				a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
				d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
				c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
				b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
				a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
				d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
				c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
				b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
				a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
				d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
				c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
				b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

				a = safe_add(a, olda);
				b = safe_add(b, oldb);
				c = safe_add(c, oldc);
				d = safe_add(d, oldd);
			}
			return Array(a, b, c, d);
		}

		/*
		 * These functions implement the four basic operations the algorithm uses.
		 */
		function md5_cmn(q, a, b, x, s, t) {
			return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
		}
		function md5_ff(a, b, c, d, x, s, t) {
			return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function md5_gg(a, b, c, d, x, s, t) {
			return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function md5_hh(a, b, c, d, x, s, t) {
			return md5_cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function md5_ii(a, b, c, d, x, s, t) {
			return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
		}

		/*
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
		 * to work around bugs in some JS interpreters.
		 */
		function safe_add(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}

		/*
		 * Bitwise rotate a 32-bit number to the left.
		 */
		function bit_rol(num, cnt) {
			return (num << cnt) | (num >>> (32 - cnt));
		}

		return hex_md5(instring);
	}

	public get(path: string, data: any, handler: any, extraUrl?: string): XMLHttpRequest {
		// var xhr = cc.loader.getXMLHttpRequest();
		var xhr = new XMLHttpRequest();
		xhr.timeout = 5000;
		var str = "?";
		for (let k in data) {
			if (str != "?") {
				str += "&";
			}
			str += `${k}=${data[k]}`;
		}
		if (extraUrl == null) extraUrl = GHttpClient.url;
		var requestURL = extraUrl + path + str;
		console.log("RequestURL:" + requestURL);
		xhr.open('GET', requestURL, true);
		// if (cc.sys.isNative){
		//     xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
		//     xhr.setRequestHeader("CONTENT-TYPE", "text/html;charset=UTF-8");
		// }
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
				console.log("http res(" + xhr.responseText.length + "):" + xhr.responseText);
				try {
					var ret = JSON.parse(xhr.responseText);
					if (handler !== null) {
						handler(null, ret);
					}                        /* code */
				} catch (e) {
					if (handler !== null) {
						handler(e);
					}
				}
				finally {

				}
			}
		}

		xhr.send();
		return xhr;
	}
}

export const Http = http._instance;
