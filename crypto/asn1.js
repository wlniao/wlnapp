/* eslint-disable class-methods-use-this */
import { BigInteger } from 'jsbn';

/**
 * 将大整数转换为值
 * @param {BigInteger} bigint - 大整数
 * @returns {string} 十六进制字符串
 */
function bigintToValue(bigint) {
  let h = bigint.toString(16);
  if (h[0] !== '-') {
    // 正数
    if (h.length % 2 === 1) h = '0' + h; // 补齐到整字节
    else if (!h.match(/^[0-7]/)) h = '00' + h; // 非0开头，则补一个全0字节
  } else {
    // 负数
    h = h.substr(1);

    let len = h.length;
    if (len % 2 === 1) len += 1; // 补齐到整字节
    else if (!h.match(/^[0-7]/)) len += 2; // 非0开头，则补一个全0字节

    let mask = '';
    for (let i = 0; i < len; i++) mask += 'f';
    mask = new BigInteger(mask, 16);

    // 对绝对值取反，加1
    h = mask.xor(bigint).add(BigInteger.ONE);
    h = h.toString(16).replace(/^-/, '');
  }
  return h;
}

/**
 * ASN.1 对象类
 */
class ASN1Object {
  constructor() {
    this.tlv = null;
    this.t = '00';
    this.l = '00';
    this.v = '';
  }

  /**
   * 获取 DER 编码的十六进制字符串
   * @returns {string} DER 编码的十六进制字符串
   */
  getEncodedHex() {
    if (!this.tlv) {
      this.v = this.getValue();
      this.l = this.getLength();
      this.tlv = this.t + this.l + this.v;
    }
    return this.tlv;
  }

  /**
   * 获取长度
   * @returns {string} 长度的十六进制表示
   */
  getLength() {
    const n = this.v.length / 2; // 字节数
    let nHex = n.toString(16);
    if (nHex.length % 2 === 1) nHex = '0' + nHex; // 补齐到整字节

    if (n < 128) {
      // 短格式，以 0 开头
      return nHex;
    } else {
      // 长格式，以 1 开头
      const head = 128 + nHex.length / 2; // 1(1位) + 真正的长度占用字节数(7位) + 真正的长度
      return head.toString(16) + nHex;
    }
  }

  /**
   * 获取值
   * @returns {string} 空字符串
   */
  getValue() {
    return '';
  }
}

/**
 * DER 整数类
 */
class DERInteger extends ASN1Object {
  /**
   * 构造函数
   * @param {BigInteger} bigint - 大整数
   */
  constructor(bigint) {
    super();

    this.t = '02'; // 整型标签说明
    if (bigint) this.v = bigintToValue(bigint);
  }

  /**
   * 获取值
   * @returns {string} 值的十六进制表示
   */
  getValue() {
    return this.v;
  }
}

/**
 * DER 序列类
 */
class DERSequence extends ASN1Object {
  /**
   * 构造函数
   * @param {Array} asn1Array - ASN.1 对象数组
   */
  constructor(asn1Array) {
    super();

    this.t = '30'; // 序列标签说明
    this.asn1Array = asn1Array;
  }

  /**
   * 获取值
   * @returns {string} 所有 ASN.1 对象编码后的连接字符串
   */
  getValue() {
    this.v = this.asn1Array.map(asn1Object => asn1Object.getEncodedHex()).join('');
    return this.v;
  }
}

/**
 * 获取长度占用字节数
 * @param {string} str - 输入字符串
 * @param {number} start - 起始位置
 * @returns {number} 长度占用的字节数
 */
function getLenOfL(str, start) {
  if (+str[start + 2] < 8) return 1; // l 以0开头，则表示短格式，只占一个字节
  return +str.substr(start + 2, 2) & 0x7f + 1; // 长格式，取第一个字节后7位作为长度真正占用字节数，再加上本身
}

/**
 * 获取长度
 * @param {string} str - 输入字符串
 * @param {number} start - 起始位置
 * @returns {number} 长度值
 */
function getL(str, start) {
  // 获取 l
  const len = getLenOfL(str, start);
  const l = str.substr(start + 2, len * 2);

  if (!l) return -1;
  const bigint = +l[0] < 8 ? new BigInteger(l, 16) : new BigInteger(l.substr(2), 16);

  return bigint.intValue();
}

/**
 * 获取值的位置
 * @param {string} str - 输入字符串
 * @param {number} start - 起始位置
 * @returns {number} 值的起始位置
 */
function getStartOfV(str, start) {
  const len = getLenOfL(str, start);
  return start + (len + 1) * 2;
}

/**
 * ASN.1 DER 编码，针对 SM2 签名
 * @param {BigInteger} r - r 值
 * @param {BigInteger} s - s 值
 * @returns {string} DER 编码的十六进制字符串
 */
export function encodeDer(r, s) {
  const derR = new DERInteger(r);
  const derS = new DERInteger(s);
  const derSeq = new DERSequence([derR, derS]);

  return derSeq.getEncodedHex();
}

/**
 * 解析 ASN.1 DER，针对 SM2 验签
 * @param {string} input - 输入的十六进制字符串
 * @returns {Object} 包含 r 和 s 值的对象
 */
export function decodeDer(input) {
  // 结构：
  // input = | tSeq | lSeq | vSeq |
  // vSeq = | tR | lR | vR | tS | lS | vS |
  const start = getStartOfV(input, 0);

  const vIndexR = getStartOfV(input, start);
  const lR = getL(input, start);
  const vR = input.substr(vIndexR, lR * 2);

  const nextStart = vIndexR + vR.length;
  const vIndexS = getStartOfV(input, nextStart);
  const lS = getL(input, nextStart);
  const vS = input.substr(vIndexS, lS * 2);

  const r = new BigInteger(vR, 16);
  const s = new BigInteger(vS, 16);

  return {r, s};
}

