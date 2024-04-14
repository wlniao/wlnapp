import sm2 from "./crypto/sm2.js"
import sm4 from "./crypto/sm4.js"
import cb from "./callback.js"
//import base64js from "./crypto/base64.js"
//import wlnAuth  from "./components/auth.vue"
//import wlnEmpty from "./components/empty.vue"
//import wlnDataPicker from "./components/data-picker.vue"
import "./utility.js"
let components = {
	//wlnAuth,
	//wlnEmpty,
	//wlnDataPicker,
	//cuCustom 
}
if(typeof window !== 'undefined' && window.Vue) {
	for(let k in components) { window.Vue.use(components[k]) }
}
function createWln(opts, callback) {
    let wln = {
		cfgs: {
			pk: '',
			api: '',
			debug: false,
			color: '#111111',
			bgColor: '#ffffff',
		}
	}
	if (opts && typeof opts == 'object') { for (let k in opts) { wln.cfgs[k] = opts[k] } } //设置配置内容
    if (callback != undefined) { for (let k in callback) { cb[k] = callback[k] } } //重载回调方法
    wln.empty = () => { }
    wln.login = () => { cb.login() }
    wln.logout = () => { cb.logout() }
    wln.debug = (msg) => { if(wln.debug && msg) { console.debug(msg) } }
    wln.toast = (msg, time) => { cb.toast(msg, time) }
    wln.alert = (msg, fn) => { cb.alert(msg, fn) }
    wln.confirm = (msg, fnYes, fnNot) => { cb.confirm(msg, fnYes, fnNot) }
    wln.gourl = (url, type) => { return cb.gourl(url, type) }
    wln.goback = (delta) => { return cb.goback(delta) }
    wln.loadingShow = (title) => { return cb.loadingShow(title) }
    wln.loadingHide = () => { return cb.loadingHide() }
    wln.getStorageSync = (key) => { return cb.getStorageSync(key) }
    wln.setStorageSync = (key, val) => { return cb.setStorageSync(key, val) }
    wln.removeStorageSync = (key) => { return cb.removeStorageSync(key) }
	wln.ext = cb
	
    /*
    方法说明：发起API请求
    参数说明：
    path:       请求路径（或URL）
    callfn:     请求成功时回调函数
    data:       向API接口Post的数据
    encrypt:    true/false，是否需要加密传输，默认为false
    noAuth:     true/false，此API接口是否免authorization验证，默认为false
    */
    wln.api = (path, callfn, data, encrypt, noAuth, failfn) => {
		let token = ''.randomString(16)
		let headers = { Authorization: wln.getStorageSync('ticket') || '' }
		if(data && encrypt && wln.cfgs.pk)
		{
			if(wln.cfgs.debug) { wln.debug(data) }
			headers['sm2token'] = sm2.doEncrypt(token, wln.cfgs.pk, 1) // 1 - C1C3C2，0 - C1C2C3，默认为1
			data = sm4.encrypt(token, typeof data === 'string' ? data : JSON.stringify(data));
		}
		cb.request('POST', wln.cfgs.api, path, data, headers, (res) => {
			if(noAuth !== true && res.header && res.header['authify-state'] === 'false') {
				cb.loadingHide()
				cb.noauth(noAuth)
			} else if(typeof callfn === 'function') {
				if(encrypt && wln.cfgs.pk && res.data && res.data.data && typeof res.data.data === 'string')
				{
					let plain = ''
					try
					{
						plain = sm4.decrypt(token, res.data.data);
						if(plain && (plain[0] == '[' || plain[0] == '{'))
						{
							res.data.data = JSON.parse(plain)
						}
						else
						{
							res.data.data = plain
						}
					} catch { }
					if(wln.cfgs.debug) { wln.debug(res.data) }
				}
				callfn(res.data)
			}
		}, (err) => {
			cb.loadingHide()
			if(failfn) {
				failfn(err) //执行自定义回调函数
			} else {
				cb.toast('请求数据失败，请稍后再试')
			}
		})
	}
    wln.upload = (path, file, callfn, filter) => {
		cb.upload(filter, wln.cfgs.api, path, file, { Authorization: wln.getStorageSync('ticket') || '' }, (res) => {
			callfn(res.data)
		},(err) => {
			callfn({success: false, message: err.errMsg })
		})
	}
    return wln
}
export default createWln