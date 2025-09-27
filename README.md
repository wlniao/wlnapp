# wlnapp

A frontend framework for web applications with encryption capabilities, including SM2/SM3/SM4 cryptographic algorithms.

## Installation

```bash
npm install wlnapp
```

## Usage

### As a submodule

```bash
git submodule add https://gitee.com/wlniao/wlnapp.git ./src/wlnapp
```

### As an NPM package

```javascript
import createWln from 'wlnapp';

const wln = createWln({
  api: 'https://your-api-endpoint.com',
  pk: 'your-public-key'
});

// Use the wln instance
wln.api('/your/api/path', (data) => {
  console.log(data);
});
```

## Features

- SM2/SM3/SM4 encryption algorithms
- API request handling with encryption support
- Cross-platform compatibility (UniApp, Web, etc.)
- Mock data support for development
- TypeScript support

## API

### createWln(config, callbacks)

Create a wln instance with the given configuration.

```javascript
const wln = createWln({
  api: 'https://your-api-endpoint.com',
  pk: 'your-public-key',
  debug: false
}, {
  // Custom callback implementations
  toast: (msg, type) => { /* your implementation */ },
  alert: (msg, fnOk) => { /* your implementation */ }
});
```

### wln.api(path, success, data, encrypt, noAuth, fail)

Make an API request.

```javascript
wln.api('/user/profile', (data) => {
  console.log(data);
}, { id: 123 }, true, false, (error) => {
  console.error(error);
});
```

## Directory Structure

```
.
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Common components
│   ├── layout/         # Layout components
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   ├── wlnapp/         # Core functionality modules
│   │   ├── crypto/         # Frontend encryption modules
│   │   ├── wui-ctrl/       # Admin UI common content
│   │   ├── callback.js     # Default callback methods
│   │   ├── model.js        # Common backend response types
│   │   └── wln.js          # Core functionality module
│   ├── mock/           # Mock data directory
│   │   ├── authInfo.js     # /Appx/AuthInfo interface mock data
│   │   ├── template.js     # Mock data template file
│   │   └── ...             # Other module mock data
│   ├── App.vue         # Root component
│   └── main.ts         # Entry file
├── public/             # Static assets
└── ...                 # Configuration files
```

## Enabling Mock Functionality

Import the mock module:

```javascript
import mock from 'wlnapp/mock';
```

Add mock handling logic:

```javascript
// If in mock mode, override wln.api to use mock data first
if (wln.getStorageSync('mock') === 'true' || (import.meta as any).env?.VITE_MOCK === 'true') {
  mock.init('/cloud/service', 'mock');
  const originalApi = wln.api; // Save the original wln.api method, call it when mock fails
  wln.api = (path, callfn, data, encrypt, noAuth, failfn) => {
    return mock.mockApi(path, callfn, data, encrypt, noAuth, failfn, originalApi, 300);
  };
}
```

Add a mock directory and data file template.js:

```javascript
/**
 * Mock data template file
 * Copy this file to create new mock data modules
 */

export default {
  '/your/api/path': {
    success: true,
    message: 'Request successful',
    code: '200',
    data: {
      // Your data
    }
  }
};
```

## License

MIT