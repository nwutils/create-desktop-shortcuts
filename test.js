let cds = require('./index.js');

let success = cds({
  linux: {
    name: 'Koala A11y',
    comment: 'Truly commented',
    filePath: '~/Downloads/Koa11y/Koa11y',
    chmod: true,
    icon: '~/Downloads/Koa11y/package.nw/_img/logo.png'
  },
  osx: {
    filePath: '~/Downloads/Koa11y.app'
  },
  windows: {
    name: 'My App Name',
    comment: 'My App description',
    icon: 'D:\\folder.ico',
    filePath: 'C:\\Portable Apps\\Koa11y_v3.0.0\\Koa11y.exe',
    outputPath: '%USERPROFILE%\\Desktop',
    arguments: '--my-argument -f \'other stuff\'',
    windowMode: 'maximized',
    hotkey: 'ALT+CTRL+F'
  }
});

console.log(success);
