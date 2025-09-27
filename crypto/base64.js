/**
 * Base64编码和解码工具
 */

// 字符映射表
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// 特殊字符处理
revLookup['-'.charCodeAt(0)] = 62; // 用于URL安全的Base64
revLookup['_'.charCodeAt(0)] = 63; // 用于URL安全的Base64

/**
 * 获取需要填充的字符数
 * @param {string} b64 - Base64字符串
 * @returns {Array} - [有效字符数, 需要填充的字符数]
 */
function getLens(b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  // 查找填充字符的位置
  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

/**
 * 计算解码后的字节数组长度
 * @param {number} validLen - 有效字符数
 * @param {number} placeHoldersLen - 填充字符数
 * @returns {number} - 字节数组长度
 */
function getByteLength(validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

/**
 * 将Base64字符串解码为字节数组
 * @param {string} b64 - Base64字符串
 * @returns {Uint8Array|Array} - 字节数组
 */
export function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];

  var arr = new Arr(getByteLength(validLen, placeHoldersLen));

  var curByte = 0;

  // 处理主要的4字符组
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen;

  var i;
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  // 处理剩余字符
  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  }
  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}

/**
 * 将3个字节转换为4个Base64字符
 * @param {number} num - 24位数字
 * @returns {string} - 4个Base64字符
 */
function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F];
}

/**
 * 将字节数组的一部分编码为Base64字符串
 * @param {Uint8Array|Array} uint8 - 字节数组
 * @param {number} start - 开始位置
 * @param {number} end - 结束位置
 * @returns {string} - Base64字符串
 */
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

/**
 * 将字节数组编码为Base64字符串
 * @param {Uint8Array|Array} uint8 - 字节数组
 * @returns {string} - Base64字符串
 */
export function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // 剩余字节数
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // 处理完整的3字节组
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : i + maxChunkLength));
  }

  // 处理剩余字节
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    );
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    );
  }

  return parts.join('');
}

/**
 * 获取Base64字符串的字节长度
 * @param {string} b64 - Base64字符串
 * @returns {number} - 字节长度
 */
export function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return byteLength(validLen, placeHoldersLen);
}
