var b64pad='=';
var b64map='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// 定义int2char函数，将0-15的数字转换为十六进制字符
function int2char(n) {
  return '0123456789ABCDEF'.charAt(n);
}
String.prototype.HexToBase64 = function() {
  var i;
  var c;
  var h = this;
  var ret = '';
  for(i = 0; i+3 <= h.length; i+=3) {
    c = parseInt(h.substring(i,i+3),16);
    ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
  }
  if(i+1 == h.length) {
    c = parseInt(h.substring(i,i+1),16);
    ret += b64map.charAt(c << 2);
  }
  else if(i+2 == h.length) {
    c = parseInt(h.substring(i,i+2),16);
    ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
  }
  if (b64pad) while((ret.length & 3) > 0) ret += b64pad;
  return ret;
};
String.prototype.Base64ToHex = function() {
  var ret = '';
  var i;
  var k = 0; // b64 state, 0-3
  var slop;
  var v;
  var s = this;
  for(i = 0; i < s.length; ++i) {
    if(s.charAt(i) == b64pad) break;
    v = b64map.indexOf(s.charAt(i));
    if(v < 0) continue;
    if(k == 0) {
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 1;
    }
    else if(k == 1) {
      ret += int2char((slop << 2) | (v >> 4));
      slop = v & 0xf;
      k = 2;
    }
    else if(k == 2) {
      ret += int2char(slop);
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 3;
    }
    else {
      ret += int2char((slop << 2) | (v >> 4));
      ret += int2char(v & 0xf);
      k = 0;
    }
  }
  if(k == 1)
    ret += int2char(slop << 2);
  return ret;
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
