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
  wln.login = () => { cb.login(); };
  wln.logout = () => { cb.logout(); };
  wln.error = (msg) => { cb.error(msg); };
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
    方法说明：发起API请求并返回Promise
    参数说明：
    path:       请求路径（或URL）
    data:       向API接口Post的数据
    opts:       请求配置：unpack、plaintext
    */
  wln.fetch = (path, data, opts) => {
    if(opts == undefined)
    {
      opts = {
        unpack: false, //true/false，是否直接返回res.data，默认为false
        plaintext: false //true/false，是否强制明文传输，默认为false
      }
    }
    return new Promise((resolve, reject) => {
      let token = ''.randomString(16);
      let headers = { authorization: wln.getStorageSync('ticket') || '', 'x-domain': wln.getStorageSync('x-domain') || '', 'locale': wln.getStorageSync('locale') || '' };
      if (wln.cfgs.headers) { for(let i in wln.cfgs.headers) { headers[i] = wln.cfgs.headers[i]; } }
      if(data && !opts.plaintext && wln.cfgs.pk)
      {
        if(wln.cfgs.debug) { wln.debug(data); }
        headers['sm2token'] = sm2.doEncrypt(token, wln.cfgs.pk, 1); // 1 - C1C3C2，0 - C1C2C3，默认为1
        data = sm4.encrypt(token, typeof data === 'string' ? data : JSON.stringify(data));
      }
      cb.fetch('POST', wln.cfgs.api, path, data, headers, (res) => {
        if(res.data && typeof res.data === 'string')
        {
          if(res.data[0] == '[' || res.data[0] == '{' || res.data[0] == '"')
          {
            res.data = JSON.parse(res.data)
          }
          else if(!opts.plaintext && wln.cfgs.pk && token)
          {
            res.data = JSON.parse(sm4.decrypt(token, res.data))
            if(wln.cfgs.debug)
            {
              wln.debug(res.data)
            }
          }
        }
        if(res.status == 401 || res.header['www-authenticate']) {
          cb.noauth(res.data)
          reject(res.data || {})
        } else if (res.status == 301) {
          if(typeof res.header['location'] === 'string') { wln.gourl(res.header['location']) }
          reject(res.data || {})
        } else if (res.status != 200) {
          if(res.data) {
            if(typeof res.data === 'string') { wln.toast(res.data) }
            else if(res.data.message) { wln.toast(res.data.message) }
            reject(res.data)
          } else if(res.statusText) {
            wln.toast(res.statusText, false)
            reject({ Code: res.status, Message: res.statusText })
          } else {
            reject({ Code: res.status })
          }
        } else if (res.data && !res.data.Code && !res.data.Message && res.data.message && res.data.code && res.data.code != 200) {
          wln.toast(res.data.message)
          reject(res.data)
        } else {
          resolve(new Promise((resolve, reject) => {
            if (opts.unpack) {
              //不解包直接返回
              resolve(res.data)
            } else if (res.data.Code == 200) {
              if(res.data.Message) {
                wln.toast(res.data.Message, true)
              }
              resolve(res.data.Data)
            } else {
              reject(res.data)
            }
          }))
        }
      }, (err) => {
        wln.toast('Error: ' + err, false)
        reject({})
      })
    })
  };

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
    cb.fetch('POST', wln.cfgs.api, path, data, headers, (res) => {
      if(typeof res.data === 'string')
      {
        if(res.data[0] == '[' || res.data[0] == '{' || res.data[0] == '"')
        {
          res.data = JSON.parse(res.data)
        }
        else if(encrypt && wln.cfgs.pk && token)
        {
          res.data = JSON.parse(sm4.decrypt(token, res.data))
          if(wln.cfgs.debug)
          {
            wln.debug(res.data)
          }
        }
      }
      if(noAuth !== true && (res.status == 401 || (res.header && res.header['www-authenticate']))) {
        cb.noauth(res.data)
      } else if(res.status == 400 && res.data) {
        wln.error(res.data.message || res.data)
      } else if(res.data.message || res.status == 301 && res.data) {
        wln.gourl(res.data.message || res.data)
      } else if(res.status != 200 && res.data) {
        wln.toast(res.data.message || res.data)
      } else if(typeof callfn === 'function') {
        callfn(res.data)
      }
    }, (err) => {
      cb.loadingHide();
      if(failfn) {
        failfn(err); //执行自定义回调函数
      } else {
        cb.toast('请求数据失败，请稍后再试')
      }
    })
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