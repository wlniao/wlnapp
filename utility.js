import { fromByteArray, toByteArray, encodeString } from './crypto/base64.js';

String.prototype.ToBase64 = function() {
  // 使用base64.js的encodeString函数将字符串编码为Base64
  return encodeString(this);
};

String.prototype.HexToBase64 = function() {
  // 将十六进制字符串转换为字节数组
  var bytes = [];
  for (var i = 0; i < this.length; i += 2) {
    bytes.push(parseInt(this.substr(i, 2), 16));
  }
  // 使用base64.js的fromByteArray函数进行编码
  return fromByteArray(bytes);
};
String.prototype.Base64ToHex = function() {
  // 使用base64.js的toByteArray函数进行解码
  var bytes = toByteArray(this);
  // 将字节数组转换为十六进制字符串
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    hex += (bytes[i] >>> 4).toString(16);
    hex += (bytes[i] & 0xF).toString(16);
  }
  return hex.toUpperCase();
};
// 移除指定字符串
String.prototype.trim = function (char, type) {
  if (char) {
    if (type == 'left') {
      return this.replace(new RegExp('^\\'+char+'+', 'g'), '');
    } else if (type == 'right') {
      return this.replace(new RegExp('\\'+char+'+$', 'g'), '');
    }
    return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
  }
  return this.replace(/^\s+|\s+$/g, '');
};

//日期格式化
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份           
    'd+': this.getDate(), //日           
    'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
    'H+': this.getHours(), //小时           
    'm+': this.getMinutes(), //分           
    's+': this.getSeconds(), //秒           
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度           
    'S': this.getMilliseconds() //毫秒           
  };
  var week = {
    '0': '/u65e5',
    '1': '/u4e00',
    '2': '/u4e8c',
    '3': '/u4e09',
    '4': '/u56db',
    '5': '/u4e94',
    '6': '/u516d'
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + '']);
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};

/**
 * 显示时间
 * @param time 时间
 * @param formatString 时间格式
 */
function ShowTime(time, formatString) {
  if (!formatString) {
    formatString = 'yyyy-MM-dd HH:mm:ss';
  }
  if (!time) {
    return new Date().format(formatString);
  } else if(typeof time == 'string') {
    if(time.indexOf(':') > 0 || time.indexOf('-') > 0 || !parseInt(time) || parseInt(time) <= 1000) {
      return time;
    } else {
      time = parseInt(time);
    }
  }
  if(time <= 1000) {
    return '';
  } else if(time < 99999999999) {
    return new Date(time * 1000).format(formatString);
  } else {
    return new Date(time).format(formatString);
  }
}
Number.prototype.showTime = function(formatString) {
  return this > 0 ? ShowTime(this, formatString) : '';
};
String.prototype.showTime = function(formatString) {
  return ShowTime(this, formatString);
};

//字符串格式化
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, i, o, n) {
    console.log(m, o, n);
    return args[i];
  });
};
//字符串尾部
String.prototype.endWith = function (str) {
  if (str == null || str == '' || this.length == 0 || str.length > this.length)
    return false;
  if (this.substring(this.length - str.length) == str)
    return true;
  else
    return false;
};
//字符串头部
String.prototype.startWith = function (str) {
  if (str == null || str == '' || this.length == 0 || str.length > this.length)
    return false;
  if (this.substr(0, str.length) == str)
    return true;
  else
    return false;
};
var _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
//随机生成字符串
String.prototype.randomString = function(len) {
  var min = 0, max = _charStr.length-1, _str = '';
  //判断是否指定长度，否则默认长度为16
  len = len || 16;
  //循环生成字符串
  for(var i = 0, index; i < len; i++) {		
    index = RandomIndex(min, max, i);
    _str += _charStr[index];
  }
  return _str;
};
/**
 * 随机生成索引
 * @param min 最小值
 * @param max 最大值
 * @param i 当前获取位置
 */
function RandomIndex(min, max, i){
  var index = Math.floor(Math.random()*(max-min+1)+min),
    numStart = _charStr.length - 10;
    //如果字符串第一位是数字，则递归重新获取
  if(i==0&&index>=numStart){
    index = RandomIndex(min, max, i);
  }
  //返回最终索引值
  return index;
}
