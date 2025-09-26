/**
 * Mock工具类
 * 用于拦截API请求并返回模拟数据
 */

// 初始化为空的mock数据对象
const mockData = {};

// 模拟延迟时间（毫秒）
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * 从../mock目录初始化mock数据
 * 注意：因为使用了import.meta.glob这个函数需要在Vite环境中运行
 */
export function init() {
  try {
    // 加载目录下的所有.js模块
    const modules = import.meta.glob('../mock/*.js', { eager: true, import: 'default' });
    // 遍历所有模块并注册mock数据
    Object.keys(modules).forEach((modulePath) => {
        const module = modules[modulePath];
        // 将模块中的每个路径都注册到mock数据中
        Object.keys(module).forEach((path) => {
            setMockData(path, module[path]);
        });
    });

  } catch (error) {
    console.warn('Mock data loading failed. The current environment does not support import.meta.glob');
  }
}

/**
 * Mock请求处理函数
 * @param {string} path 请求路径
 * @param {Function} callfn 成功回调函数
 * @param {any} data 请求数据
 * @param {boolean} encrypt 是否加密
 * @param {boolean} noAuth 是否免验证
 * @param {Function} failfn 失败回调函数
 * @param {Function} originalApi 原始调用后端请求的方法，mock失败时调用后端请求
 * @param {number} delayTime 模拟延迟时间
 */
export function mockApi(path, callfn, data, encrypt, noAuth, failfn, originalApi, delayTime) {
  // 模拟网络延迟
  delay(delayTime || 500).then(() => {
    // 检查是否有对应的mock数据
    if (mockData[path]) {
      // 返回mock数据
      callfn(mockData[path]);
    } else {
      // 如果没有mock数据，继续调用原始后端请求
      console.warn(`未找到路径"${path}"的mock数据，已调用原始后端请求`);
      originalApi(path, callfn, data, encrypt, noAuth, failfn);
    }
  });
}

/**
 * 添加或更新mock数据
 * @param {string} path 请求路径
 * @param {any} data mock数据
 */
export function setMockData(path, data) {
  mockData[path] = data;
}

/**
 * 删除mock数据
 * @param {string} path 请求路径
 */
export function removeMockData(path) {
  delete mockData[path];
}

/**
 * 获取所有mock数据
 */
export function getAllMockData() {
  return { ...mockData };
}

export default {
  init,
  mockApi,
  setMockData,
  removeMockData,
  getAllMockData
};