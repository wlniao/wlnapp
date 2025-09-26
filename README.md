# wlnapp

### Usage
```
git submodule add https://gitee.com/wlniao/wlnapp.git ./src/wlnapp
```

### 安装npm包
```
npm install jsbn
```
### 目录结构

```
.
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── layout/         # 布局组件
│   ├── pages/          # 页面组件
│   ├── types/          # TypeScript类型定义
│   ├── wlnapp/         # 核心功能模块
│   │   ├── crypto/         # 前端数据加密模块
│   │   ├── wui-ctrl/       # 管理后台UI通用内容
│   │   ├── callback.js     # 核心类支持的默认调用方法
│   │   ├── model.js        # 通用的后端数据响应类型
│   │   └── wln.js          # 核心功能模块
│   ├── mock/           # Mock数据目录
│   │   ├── authInfo.js     # /Appx/AuthInfo接口mock数据
│   │   ├── template.js     # Mock数据模板文件
│   │   └── ...             # 其他模块的mock数据
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── public/             # 静态资源
└── ...                 # 配置文件等
```


### 开启Mock功能
引用Mock模块
```
import mock from './wlnapp/mock.js'
```

添加Mock处理逻辑
```
// 如果是mock模式，重写wln.api方法以优先使用mock数据
if (wln.getStorageSync('mock') === 'true' || (import.meta as any).env?.VITE_MOCK === 'true') {
  mock.init('/cloud/service', 'mock');
  const originalApi = wln.api; // 保存原始的wln.api方法，mock失败时调用原始方法
  wln.api = (path, callfn, data, encrypt, noAuth, failfn) => {
    return mock.mockApi(path, callfn, data, encrypt, noAuth, failfn, originalApi, 300);
  };
}
```

添加mock目录并添加数据文件template.js
```
/**
 * Mock数据模板文件
 * 复制此文件来创建新的mock数据模块
 */

export default {
  '/your/api/path': {
    success: true,
    message: '请求成功',
    code: '200',
    data: {
      // 你的数据
    }
  }
};
```