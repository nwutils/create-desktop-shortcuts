var cds = require('./index.js');

var success = cds({
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
    filePath: 'C:\\Users\\%USERNAME%\\Downloads\\InSpectre.exe',
    outputPath: '%USERPROFILE%\\Desktop',
    arguments: '--my-argument -f "other stuff"',
    windowMode: 'normal',
    hotkey: 'ALT+CTRL+F'
  }
});

console.log(success);
