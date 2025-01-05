import "./utility.js"
const tips = 'Required custom callback method: '
const cb = {
	empty: () => { },
	toast: (msg, type) => {
		console.log(tips + 'toast: (msg, type)')
	},
	alert: (msg, fnOk) => {
		console.log(tips + 'alert: (msg, fnOk)')
	},
	confirm: (msg, fnYes, fnNot, txtYes, txtNot) => {
		console.log(tips + 'confirm: (msg, fnYes, fnNot, txtYes, txtNot)')
	},
	prompt: (msg, fnYes, fnNot, txtYes, txtNot, inputTips) => {
		console.log(tips + 'prompt: (msg, fnYes, fnNot, txtYes, txtNot, inputTips)')
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
if(typeof uni == 'object') {
	cb.toast = (msg, type) => {
		uni.showToast({title: msg, icon: type || 'none', position: 'bottom', duration: 3000 })
	}
	cb.alert = (msg, fnOk) => {
		uni.showModal({title: '', showCancel: false, confirmText: '确定', content: msg, success: fnOk || cb.empty })
	}
	cb.confirm = (msg, fnYes, fnNot, txtYes, txtNot) => {
		uni.showModal({ content: msg, confirmText: (txtYes || '确定'), cancelText: (txtNot || '取消'), success: (cfm)=> { if(cfm.confirm) { fnYes && fnYes() } if(cfm.cancel) { fnNot && fnNot()} } })
	}
	cb.goback = (delta) => {
		return uni.navigateBack({ delta: delta || 1 })
	}
	cb.gourl = (url, type) => {
		if (url.indexOf('://') < 0) {
			if (type == 'tab') {
				return uni.switchTab({ url: url })
			} else if (type == 'red') {
				return uni.redirectTo({ url: url })
			} else {
				return uni.navigateTo({ url: url })
			}
		} else if (typeof window == 'object') {
			return location.href = url
		} else {
			return uni.navigateTo({ url: url })
		}
	}
	cb.request = (method, host, path, data, headers, fnYes, fnNot) => {
		return uni.request({
			url: host + path, data: data || {}, method: method,
			header: headers,
			success: res => {
				fnYes(res)
			},
			fail: res => {
				fnNot(res)
			}
		})
	}
	cb.upload = (filter, host, path, file, headers, fnYes, fnNot) => {
		return uni.uploadFile({
			url: host + path,
			name: 'file',
			header: headers,
			filePath: file.url,
			formData: { filter: filter },
			success: (res) => {
				if(res.statusCode != 200 && res.errMsg) {
					fnNot({success: false, message: 'error: ' + res.statusCode })
				} else {
					fnYes(JSON.parse(res.data))					
				}
			},
			fail:(e) => {
				fnNot({success: false, message: e.errMsg })
			}
		})
	}
	cb.getStorageSync = (key) => {
		return uni.getStorageSync(key)
	}
	cb.setStorageSync = (key, val) => {
		return uni.setStorageSync(key, val)
	}
	cb.removeStorageSync = (key) => {
		return uni.removeStorageSync(key) 
	}
} else if(typeof window == 'object') {
	if(typeof history == 'object') {
		cb.goback = (delta) => {
			return history.back(delta || 1)
		}
		cb.gourl = (url, type) => {
			if(url.indexOf('://') < 0) {
				if(type == 'red') {
					history.replaceState(null, null, url)
					location.reload()
				} else {
					return location.href = url
				}
			} else {
				return location.href = url
			}
		}
	}
	if(typeof localStorage == 'object') {
		cb.getStorageSync = (key) => {
			return localStorage.getItem(key)
		}
		cb.setStorageSync = (key, val) => {
			return localStorage.setItem(key, val)
		}
		cb.removeStorageSync = (key) => {
			return localStorage.removeItem(key)
		}
	}
	if(typeof fetch == 'function') {
		cb.request = (method, host, path, data, headers, fnYes, fnNot) => {
			let obj = { header: { } }
			fetch(host + path, { method: method, headers: headers, body: typeof data === 'string' ? data : JSON.stringify(data) }).then((res) => {
				res.headers.forEach((val, key) => { obj.header[key] = val })
				obj.status = res.status
				return res.json()
			}).then((res) => {
				obj.data = res
				fnYes(obj)
			}).catch((error) => {
				fnNot({success: false, message: error })
			})
		}
		cb.upload = (filter, host, path, file, headers, fnYes, fnNot) => {
			let obj = { header: { } }
			let form = new FormData();
			form.append('file', file);
			form.append('filter', filter);
			fetch(host + path, { method: 'post', headers: headers, body: form}).then((res) => {
				res.headers.forEach((val, key) => { obj.header[key] = val })
				obj.status = res.status
				return res.json()
			}).then((res) => {
				fnYes(res)
			}).catch((error) => {
				fnNot({success: false, message: error })
			})
		}
	}
}
export default cb