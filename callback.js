import "./utility.js"
const tips = 'Required custom callback method: '
const cb = {
    toast: (msg, time) => {
        console.log(tips + 'toast: (msg, time)')  
    },
    alert: (msg, fn) => {
        console.log(tips + 'alert: (msg, fn)')  
    },
    confirm: (msg, fnYes, fnNot, txtYes, txtNot) => {
        console.log(tips + 'confirm: (msg, fnYes, fnNot, txtYes, txtNot)')    
    },
    request: (method, host, path, data, headers, fnYes, fnNot) => {
        console.log(tips + 'request: (method, host, path, data, headers, fnYes, fnNot)')    
    },
    upload: (filter, host, path, file, headers, fnYes, fnNot) => {
        console.log(tips + 'upload: (filter, host, path, file, headers, fnYes, fnNot)')    
    },
    login: () => {
        console.log(tips + 'login()')        
    },
    logout: () => {
        console.log(tips + 'logout()')        
    },
    noauth: (invite) => {
        console.log(tips + 'noauth: (invite)')  
    },
    gourl(url, type) {
        console.log(tips + 'gourl(url, type)')      
    },
    goback(delta) {
        console.log(tips + 'goback(delta)')
    },
    loadingShow(title) {
        console.log(tips + 'loadingShow(title)')
    },
    loadingHide() {
        console.log(tips + 'loadingHide()')
    },
    getStorageSync(key) {
        console.log(tips + 'getStorageSync(key)')
    },
    setStorageSync(key, val) {
        console.log(tips + 'setStorageSync(key, val)')
    },
    removeStorageSync(key) {
        console.log(tips + 'removeStorageSync(key)')    
    }
}
export default cb