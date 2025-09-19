// 定义API响应接口
export interface ApiResponse {
  success: boolean;
  message: string;
  code: string;
  tips?: boolean;
  data?: any;
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
  import type { ModelJsType, Query, Pager } from './model.d.ts';
  export const mQuery: Query;
  export const mPager: Pager;
}