// 定义数据返回内容
export interface Result<T = any> {
  Success: boolean;
  Message: string;
  Code: number;
  Data?: T;
}

// 定义查询接口
export interface Query {
  key: string;
  page: number;
  size: number;
}

// 定义分页器接口
export interface Pager {
  rows: any[];
  total: number;
  message: string;
  loadMsg: string;
  errMsg: string;
}

// 为model.js创建类型声明
export interface ModelJsType {
  mQuery: Query;
  mPager: Pager;
}

// 为model.js模块提供类型声明
declare module './model.js' {
  export const mQuery: Query;
  export const mPager: Pager;
}