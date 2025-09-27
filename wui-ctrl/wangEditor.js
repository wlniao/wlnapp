const toolbarConfig =  {
  toolbarKeys: ['undo', 'redo', 'headerSelect',
    {
      key: 'group-justify',
      title: '对齐',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify']
    }, '|', 'insertVideo', 'insertImage', 'uploadImage', 'insertTable', 'blockquote', 'clearStyle', {
      key: 'group-more',
      title: '更多',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
      menuKeys: ['bulletedList', 'numberedList']
    }
  ]
};
const editorConfig = {
  MENU_CONF: {},
  placeholder: '点此添加内容',
  hoverbarKeys: {
    text: {
      menuKeys: ['bold', 'underline', 'italic', 'color', 'bgColor', '|', 'fontSize', 'fontFamily', 'lineHeight', 'insertLink']
    }
  }
};
editorConfig.MENU_CONF['uploadImage'] = {
  server: '/upload', // 上传图片地址
  timeout: 60 * 1000, // 上传超时时间
  fieldName: 'filename',
  headers: { Accept: 'text/x-json' },
  meta: { token: 'sessionkey' },
  metaWithUrl: false, // 参数是否拼接到 url 上
  withCredentials: false, // 跨域是否传递 cookie ，默认为 false
  maxFileSize: 10 * 1024 * 1024, // 10M
  base64LimitSize: 512, // 512b 以下插入 base64
  customInsert(res, insertFn) {
    if (res.success) {
      insertFn(res.url, res.fileName, ''); // res 即服务端的返回结果，从 res 中找到 url alt href ，然后插图图片
    } else {
      console.error('customInsert', res);
    }
  },
  onProgress(progress) {
    console.log('onProgress', progress);
  },
  onSuccess(file, res) {
    console.log('onSuccess', file, res);
  },
  onFailed(file, res) {
    console.log('onFailed', file, res);
  },
  onError(file, err, res) {
    console.error('onError', file, err, res);
  },
  onBeforeUpload(files) {
    console.log('onBeforeUpload', files);
    return files; // 返回哪些文件可以上传，return false 会阻止上传
  }
};
export {
  toolbarConfig,
  editorConfig
};