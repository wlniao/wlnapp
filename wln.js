import sm2 from './crypto/sm2.js';
import sm3 from './crypto/sm3.js';
import sm4 from './crypto/sm4.js';
import cb from './callback.js';
//import base64js from "./crypto/base64.js"
//import wlnAuth  from "./components/auth.vue"
//import wlnEmpty from "./components/empty.vue"
//import wlnDataPicker from "./components/data-picker.vue"
import './utility.js';
let components = {
  //wlnAuth,
  //wlnEmpty,
  //wlnDataPicker,
  //cuCustom 
};
if(typeof window !== 'undefined') {
  window.ShowTime = function(time, formatString) {
    return time.showTime(formatString);
  };
  window.emiOpenTab = function(url, name) {
    if (!parent || parent === self) {
      location.href = url;
    } else if(cb.getStorageSync('x-domain')) {
      let ifr = document.createElement('iframe');
      ifr.id = 'emifr';
      ifr.name = 'emifr';
      ifr.src = '//' + cb.getStorageSync('x-domain') + '/jsapi?do=open&url=' + encodeURIComponent(url) + '&name=' + encodeURI(name);
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
    } else {
      cb.toast('not found emi host');
    }
  };
  window.emiBackTab = function(name) {
    if(cb.getStorageSync('x-domain')) {
      let ifr = document.createElement('iframe');
      ifr.id = 'emifr';
      ifr.name = 'emifr';
      ifr.src = '//' + cb.getStorageSync('x-domain') + '/jsapi?do=back&name=' + encodeURI(name);
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
    } else {
      cb.toast('not found emi host');
    }
  };
  window.emiCloseTab = function(name) {
    if(cb.getStorageSync('x-domain')) {
      let ifr = document.createElement('iframe');
      ifr.id = 'emifr';
      ifr.name = 'emifr';
      ifr.src = '//' + cb.getStorageSync('x-domain') + '/jsapi?do=close&name=' + encodeURI(name);
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
    } else {
      cb.toast('not found emi host');
    }
  };
  window.emiToLogin = function() {
    if(cb.getStorageSync('x-domain')) {
      let ifr = document.createElement('iframe');
      ifr.id = 'emifr';
      ifr.name = 'emifr';
      ifr.src = '//' + cb.getStorageSync('x-domain') + '/jsapi?do=tologin';
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
    } else {
      cb.toast('not found emi host');
    }
  };
}
if(typeof window !== 'undefined' && window.Vue) {
  for(let k in components) { window.Vue.use(components[k]); }
}
function createWln(opts, callback) {
  let wln = {
    cfgs: {
      pk: '',
      api: '',
      debug: false,
      color: '#111111',
      bgColor: '#ffffff'
    }
  };
  if (opts && typeof opts == 'object') { for (let k in opts) { wln.cfgs[k] = opts[k]; } } //设置配置内容
  if (callback != undefined) { for (let k in callback) { cb[k] = callback[k]; } } //重载回调方法
  wln.empty = () => { cb.empty(); };
  wln.error = (msg) => { cb.error(msg); };
  wln.login = () => { cb.login(); };
  wln.logout = () => { cb.logout(); };
  wln.debug = (msg) => { if(wln.debug && msg) { console.debug(msg); } };
  wln.toast = (msg, type) => { cb.toast(msg, type); };
  wln.alert = (msg, fnOk) => { cb.alert(msg, fnOk || cb.empty ); };
  wln.confirm = (msg, fnYes, fnNot, txtYes, txtNot) => { cb.confirm(msg, fnYes || cb.empty, fnNot || cb.empty, txtYes, txtNot); };
  wln.prompt = (msg, fnYes, fnNot, txtYes, txtNot, inputTips) => { cb.prompt(msg, fnYes || cb.empty, fnNot || cb.empty, txtYes, txtNot, inputTips); };
  wln.gourl = (url, type) => { return cb.gourl(url, type); };
  wln.goback = (delta) => { return cb.goback(delta); };
  wln.loadingShow = (title) => { return cb.loadingShow(title); };
  wln.loadingHide = () => { return cb.loadingHide(); };
  wln.getStorageSync = (key, val) => { return cb.getStorageSync(key, val); };
  wln.setStorageSync = (key, val) => { return cb.setStorageSync(key, val); };
  wln.removeStorageSync = (key) => { return cb.removeStorageSync(key); };
  wln.sm3encrypt = (str) => { return sm3.encryptStr(str); };
  wln.ext = cb;
	
  /*
    方法说明：发起API请求
    参数说明：
    path:       请求路径（或URL）
    callfn:     请求成功时回调函数
    data:       向API接口Post的数据
    encrypt:    true/false，是否需要加密传输，默认为false
    noAuth:     true/false，此API接口是否免authorization验证，默认为false
    failfn:     请求失败时回调函数
    */
  wln.api = (path, callfn, data, encrypt, noAuth, failfn) => {
    let token = ''.randomString(16);
    let headers = { authorization: wln.getStorageSync('ticket') || '', 'x-domain': wln.getStorageSync('x-domain') || '', 'locale': wln.getStorageSync('locale') || '' };
    if (wln.cfgs.headers) { for(let i in wln.cfgs.headers) { headers[i] = wln.cfgs.headers[i]; } }
    if(data && encrypt && wln.cfgs.pk)
    {
      if(wln.cfgs.debug) { wln.debug(data); }
      headers['sm2token'] = sm2.doEncrypt(token, wln.cfgs.pk, 1); // 1 - C1C3C2，0 - C1C2C3，默认为1
      data = sm4.encrypt(token, typeof data === 'string' ? data : JSON.stringify(data));
    }
    cb.request('POST', wln.cfgs.api, path, data, headers, (res) => {
      if(noAuth !== true && (res.status == 401 || res.header && res.header['authify-state'] === 'false')) {
        cb.loadingHide();
        cb.noauth(res.data || {});
      } else if(res.data && res.data.code == '301' && res.data.tips && res.data.message) {
        wln.gourl(res.data.message);
      } else if(res.data && res.data.code == '400' && res.data.tips && res.data.message) {
        wln.error(res.data.message);
      } else if(res.data && res.data.code != '200' && res.data.tips && res.data.message) {
        wln.toast(res.data.message);
      } else if(typeof callfn === 'function') {
        if(encrypt && wln.cfgs.pk && res.data && res.data.data && typeof res.data.data === 'string')
        {
          let plain = '';
          try
          {
            plain = sm4.decrypt(token, res.data.data);
            if(plain && (plain[0] == '[' || plain[0] == '{'))
            {
              res.data.data = JSON.parse(plain);
            }
            else
            {
              res.data.data = plain;
            }
          } catch (e) { 
            // 忽略解密错误
          }
          if(wln.cfgs.debug) { wln.debug(res.data); }
        }
        callfn(res.data);
      }
    }, (err) => {
      cb.loadingHide();
      if(failfn) {
        failfn(err); //执行自定义回调函数
      } else {
        cb.toast('请求数据失败，请稍后再试');
      }
    });
  };
  wln.upload = (path, file, callfn, filter) => {
    let headers = { authorization: wln.getStorageSync('ticket') || '', 'x-domain': wln.getStorageSync('x-domain') || '' };
    if (wln.cfgs.headers) { for(let i in wln.cfgs.headers) { headers[i] = wln.cfgs.headers[i]; } }
    cb.upload(filter, wln.cfgs.api, path, file, headers, (res) => {
      callfn(res);
    },(err) => {
      callfn(err);
    });
  };
  return wln;
}
export default createWln;