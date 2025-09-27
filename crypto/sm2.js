/* eslint-disable no-use-before-define */
import { BigInteger } from 'jsbn';
import sm3 from './sm3.js';
import _ from './utils.js';
import { encodeDer, decodeDer } from './asn1.js';

const {G, curve, n} = _.generateEcparam();
const C1C2C3 = 0;

/**
 * SM2 加密函数
 * @param {string|Array} msg - 要加密的消息
 * @param {string} publicKey - 公钥
 * @param {number} cipherMode - 密文格式（1:C1C3C2, 0:C1C2C3）
 * @returns {string} 加密后的密文
 */
function doEncrypt(msg, publicKey, cipherMode = 1) {
  msg = typeof msg === 'string' ? _.hexToArray(_.utf8ToHex(msg)) : Array.prototype.slice.call(msg);
  if(publicKey && publicKey.length == 128) {
    publicKey = '04' + publicKey; // 补齐未压缩公钥默认头部
  }
  publicKey = _.getGlobalCurve().decodePointHex(publicKey); // 先将公钥转成点

  const keypair = _.generateKeyPairHex();
  const k = new BigInteger(keypair.privateKey, 16); // 随机数 k

  // c1 = k * G
  let c1 = keypair.publicKey;
  if (c1.length > 128) c1 = c1.substr(c1.length - 128);

  // (x2, y2) = k * publicKey
  const p = publicKey.multiply(k);
  const x2 = _.hexToArray(_.leftPad(p.getX().toBigInteger().toRadix(16), 64));
  const y2 = _.hexToArray(_.leftPad(p.getY().toBigInteger().toRadix(16), 64));

  // c3 = hash(x2 || msg || y2)
  const c3 = _.arrayToHex(sm3.encrypt([].concat(x2, msg, y2)));
  let ct = 1;
  let offset = 0;
  let t = []; // 256 位
  const z = [].concat(x2, y2);
  const nextT = () => {
    // (1) Hai = hash(z || ct)
    // (2) ct++
    t = sm3.encrypt([...z, ct >> 24 & 0x00ff, ct >> 16 & 0x00ff, ct >> 8 & 0x00ff, ct & 0x00ff]);
    ct++;
    offset = 0;
  };
  nextT(); // 先生成 Ha1

  for (let i = 0, len = msg.length; i < len; i++) {
    // t = Ha1 || Ha2 || Ha3 || Ha4
    if (offset === t.length) nextT();

    // c2 = msg ^ t
    msg[i] ^= t[offset++] & 0xff;
  }
  const c2 = _.arrayToHex(msg);

  return '04' + (cipherMode === C1C2C3 ? c1 + c2 + c3 : c1 + c3 + c2);
}

/**
 * SM2 解密函数
 * @param {string} encryptData - 加密的数据
 * @param {string} privateKey - 私钥
 * @param {number} cipherMode - 密文格式（1:C1C3C2, 0:C1C2C3）
 * @param {Object} options - 选项
 * @param {string} options.output - 输出格式（'string' 或 'array'）
 * @returns {string|Array} 解密后的明文
 */
function doDecrypt(encryptData, privateKey, cipherMode = 1, {
  output = 'string'
} = {}) {
  privateKey = new BigInteger(privateKey, 16);

  let c3 = encryptData.substr(128, 64);
  let c2 = encryptData.substr(128 + 64);

  if (cipherMode === C1C2C3) {
    c3 = encryptData.substr(encryptData.length - 64);
    c2 = encryptData.substr(128, encryptData.length - 128 - 64);
  }

  const msg = _.hexToArray(c2);
  const c1 = _.getGlobalCurve().decodePointHex('04' + encryptData.substr(0, 128));

  const p = c1.multiply(privateKey);
  const x2 = _.hexToArray(_.leftPad(p.getX().toBigInteger().toRadix(16), 64));
  const y2 = _.hexToArray(_.leftPad(p.getY().toBigInteger().toRadix(16), 64));

  let ct = 1;
  let offset = 0;
  let t = []; // 256 位
  const z = [].concat(x2, y2);
  const nextT = () => {
    // (1) Hai = hash(z || ct)
    // (2) ct++
    t = sm3.encrypt([...z, ct >> 24 & 0x00ff, ct >> 16 & 0x00ff, ct >> 8 & 0x00ff, ct & 0x00ff]);
    ct++;
    offset = 0;
  };
  nextT(); // 先生成 Ha1

  for (let i = 0, len = msg.length; i < len; i++) {
    // t = Ha1 || Ha2 || Ha3 || Ha4
    if (offset === t.length) nextT();

    // c2 = msg ^ t
    msg[i] ^= t[offset++] & 0xff;
  }

  // c3 = hash(x2 || msg || y2)
  const checkC3 = _.arrayToHex(sm3.encrypt([].concat(x2, msg, y2)));

  if (checkC3 === c3.toLowerCase()) {
    return output === 'array' ? msg : _.arrayToUtf8(msg);
  } else {
    return output === 'array' ? [] : '';
  }
}

/**
 * SM2 签名函数
 * @param {string|Array} msg - 要签名的消息
 * @param {string} privateKey - 私钥
 * @param {Object} options - 选项
 * @param {Array} options.pointPool - 点池
 * @param {boolean} options.der - 是否使用 DER 编码
 * @param {boolean} options.hash - 是否进行哈希
 * @param {string} options.publicKey - 公钥
 * @param {string} options.userId - 用户ID
 * @returns {string} 签名值
 */
function doSignature(msg, privateKey, {
  pointPool, der, hash, publicKey, userId
} = {}) {
  let hashHex = typeof msg === 'string' ? _.utf8ToHex(msg) : _.arrayToHex(msg);

  if (hash) {
    // SM3杂凑
    publicKey = publicKey || getPublicKeyFromPrivateKey(privateKey);
    hashHex = getHash(hashHex, publicKey, userId);
  }

  const dA = new BigInteger(privateKey, 16);
  const e = new BigInteger(hashHex, 16);

  // k
  let k = null;
  let r = null;
  let s = null;

  do {
    do {
      let point;
      if (pointPool && pointPool.length) {
        point = pointPool.pop();
      } else {
        point = getPoint();
      }
      k = point.k;

      // r = (e + x1) mod n
      r = e.add(point.x1).mod(n);
    } while (r.equals(BigInteger.ZERO) || r.add(k).equals(n));

    // s = ((1 + dA)^-1 * (k - r * dA)) mod n
    s = dA.add(BigInteger.ONE).modInverse(n).multiply(k.subtract(r.multiply(dA))).mod(n);
  } while (s.equals(BigInteger.ZERO));

  if (der) return encodeDer(r, s); // ASN.1 DER 编码

  return _.leftPad(r.toString(16), 64) + _.leftPad(s.toString(16), 64);
}

/**
 * SM2 验签函数
 * @param {string|Array} msg - 要验证签名的消息
 * @param {string} signHex - 签名值
 * @param {string} publicKey - 公钥
 * @param {Object} options - 选项
 * @param {boolean} options.der - 是否使用 DER 编码
 * @param {boolean} options.hash - 是否进行哈希
 * @param {string} options.userId - 用户ID
 * @returns {boolean} 验签结果
 */
function doVerifySignature(msg, signHex, publicKey, {der, hash, userId} = {}) {
  let hashHex = typeof msg === 'string' ? _.utf8ToHex(msg) : _.arrayToHex(msg);

  if (hash) {
    // SM3杂凑
    hashHex = getHash(hashHex, publicKey, userId);
  }

  let r; let
    s;
  if (der) {
    const decodeDerObj = decodeDer(signHex); // ASN.1 DER 解码
    r = decodeDerObj.r;
    s = decodeDerObj.s;
  } else {
    r = new BigInteger(signHex.substring(0, 64), 16);
    s = new BigInteger(signHex.substring(64), 16);
  }

  const PA = curve.decodePointHex(publicKey);
  const e = new BigInteger(hashHex, 16);

  // t = (r + s) mod n
  const t = r.add(s).mod(n);

  if (t.equals(BigInteger.ZERO)) return false;

  // x1y1 = s * G + t * PA
  const x1y1 = G.multiply(s).add(PA.multiply(t));

  // R = (e + x1) mod n
  const R = e.add(x1y1.getX().toBigInteger()).mod(n);

  return r.equals(R);
}

/**
 * SM3 杂凑算法
 * @param {string} hashHex - 哈希值
 * @param {string} publicKey - 公钥
 * @param {string} userId - 用户ID
 * @returns {string} 杂凑结果
 */
function getHash(hashHex, publicKey, userId = '1234567812345678') {
  // z = hash(entl || userId || a || b || gx || gy || px || py)
  userId = _.utf8ToHex(userId);
  const a = _.leftPad(G.curve.a.toBigInteger().toRadix(16), 64);
  const b = _.leftPad(G.curve.b.toBigInteger().toRadix(16), 64);
  const gx = _.leftPad(G.getX().toBigInteger().toRadix(16), 64);
  const gy = _.leftPad(G.getY().toBigInteger().toRadix(16), 64);
  let px;
  let py;
  if (publicKey.length === 128) {
    px = publicKey.substr(0, 64);
    py = publicKey.substr(64, 64);
  } else {
    const point = G.curve.decodePointHex(publicKey);
    px = _.leftPad(point.getX().toBigInteger().toRadix(16), 64);
    py = _.leftPad(point.getY().toBigInteger().toRadix(16), 64);
  }
  const data = _.hexToArray(userId + a + b + gx + gy + px + py);

  const entl = userId.length * 4;
  data.unshift(entl & 0x00ff);
  data.unshift(entl >> 8 & 0x00ff);

  const z = sm3.encrypt(data);

  // e = hash(z || msg)
  return _.arrayToHex(sm3.encrypt(z.concat(_.hexToArray(hashHex))));
}

/**
 * 根据私钥计算公钥
 * @param {string} privateKey - 私钥
 * @returns {string} 公钥
 */
function getPublicKeyFromPrivateKey(privateKey) {
  const PA = G.multiply(new BigInteger(privateKey, 16));
  const x = _.leftPad(PA.getX().toBigInteger().toString(16), 64);
  const y = _.leftPad(PA.getY().toBigInteger().toString(16), 64);
  return '04' + x + y;
}

/**
 * 获取椭圆曲线点
 * @returns {Object} 包含密钥对和点信息的对象
 */
function getPoint() {
  const keypair = _.generateKeyPairHex();
  const PA = curve.decodePointHex(keypair.publicKey);

  keypair.k = new BigInteger(keypair.privateKey, 16);
  keypair.x1 = PA.getX().toBigInteger();

  return keypair;
}

export default {
  generateKeyPairHex: _.generateKeyPairHex,
  compressPublicKeyHex: _.compressPublicKeyHex,
  comparePublicKeyHex: _.comparePublicKeyHex,
  doEncrypt,
  doDecrypt,
  doSignature,
  doVerifySignature,
  getPublicKeyFromPrivateKey,
  getPoint,
  verifyPublicKey: _.verifyPublicKey
};