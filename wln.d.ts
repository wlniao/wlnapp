export interface WlnInstance {
  cfgs: WlnConfig;
  empty: () => void;
  login: () => void;
  logout: () => void;
  error: (msg: any) => void;
  debug: (msg: string) => void;
  toast: (msg: string, type?: string | boolean) => void;
  alert: (msg: string, fnOk?: () => void) => void;
  confirm: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string) => void;
  prompt: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string, inputTips?: string) => void;
  gourl: (url: string, type?: any) => string | void;
  goback: (delta?: number) => string | void;
  loadingShow: (title?: string) => any;
  loadingHide: () => any;
  getStorageSync: (key: string, val?: any) => any;
  setStorageSync: (key: string, val: any) => any;
  removeStorageSync: (key: string) => any;
  sm3encrypt: (str: string) => string;
  api: (path: string, callfn?: (data: any) => void, data?: any, encrypt?: boolean, noAuth?: boolean, failfn?: (err: any) => void) => void;
  upload: (path: string, file: File, callfn?: (data: any) => void, filter?: string) => void;
  request: (path: string, data?: any, encrypt?: boolean, noAuth?: boolean) => any;
  ext: any;
}

export interface WlnConfig {
  pk: string;
  api: string;
  debug?: boolean;
  color?: string;
  bgColor?: string;
  headers?: Record<string, string>;
}

export interface WlnOption {
  empty?: () => void;
  error?: (msg: string) => void;
  login?: () => void;
  logout?: () => void;
  debug?: (msg: string) => void;
  toast?: (msg: string, type?: string | boolean) => void;
  alert?: (msg: string, fnOk?: () => void) => void;
  confirm?: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string) => void;
  prompt?: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string, inputTips?: string) => void;
  gourl?: (url: string, type?: any) => string | void;
  goback?: (delta?: number) => string | void;
  loadingShow?: (title?: string) => any;
  loadingHide?: () => any;
  getStorageSync?: (key: string, val?: any) => any;
  setStorageSync?: (key: string, val: any) => any;
  removeStorageSync?: (key: string) => any;
  fetch?: (method: string, baseUrl: string, path: string, data: any, headers: Record<string, string>, success: (res: any) => void, fail: (err: any) => void) => void;
  upload?: (filter: string, baseUrl: string, path: string, file: File, headers: Record<string, string>, success: (res: any) => void, fail: (err: any) => void) => void;
}

// 为wln.js模块提供类型声明
declare module './wln.js' {
  export default function createWln(config: WlnConfig, option?: WlnOption): WlnInstance
}

// 导出createWln函数的类型
export default function createWln(config: WlnConfig, option?: WlnOption): WlnInstance;

// 从model模块重新导出类型
export type { Result, Query, Pager } from './model.d.ts';
export { mQuery, mPager } from './model.js';

// 全局组件类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    wln: WlnInstance;
  }
}