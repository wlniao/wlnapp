export interface WlnInstance {
  api: (path: string, success?: (data: any) => void, error?: (err: any) => void, option?: any, notLoading?: boolean, notAuth?: boolean) => void;
  error: (msg: string) => void;
  toast: (msg: string, type?: string | boolean) => void;
  alert: (msg: string, fnOk?: () => void) => void;
  confirm: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string) => void;
  loadingHide: () => void;
  loadingShow: (msg?: string) => any;
  gourl: (url: string, type?: any) => void;
  noauth: (obj?: any) => void;
  login: () => void;
  tabto: (title: string, urlto: string) => void;
  uploader: (path: string, accept?: string, fn?: (data: any) => void) => void;
  upload: (path: string, file: File, fn?: (data: any) => void, accept?: string) => void;
  setStorageSync: (key: string, value: any) => void;
  getStorageSync: (key: string) => any;
}

export interface WlnConfig {
  api: string;
  pk: string;
}

export interface WlnOption {
  error?: (msg: string) => void;
  toast?: (msg: string, type?: string | boolean) => void;
  alert?: (msg: string, fnOk?: () => void) => void;
  confirm?: (msg: string, fnYes?: () => void, fnNot?: () => void, txtYes?: string, txtNot?: string) => void;
  loadingHide?: () => void;
  loadingShow?: (msg?: string) => any;
  gourl?: (url: string, type?: any) => void;
  noauth?: (obj?: any) => void;
  login?: () => void;
  tabto?: (title: string, urlto: string) => void;
  uploader?: (path: string, accept?: string, fn?: (data: any) => void) => void;
}

// 为wln.js模块提供类型声明
declare module './wln.js' {
  export default function createWln(config: WlnConfig, option?: WlnOption): WlnInstance
}

export default createWln;

// 全局组件类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    wln: WlnInstance;
  }
}