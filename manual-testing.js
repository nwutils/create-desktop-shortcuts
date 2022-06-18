/**
 * @file    Used during local development to manually test the functionality of different features.
 * @author  TheJaredWilcurt
 */

const timeLabel = 'Executed in';
console.time(timeLabel);

const createDesktopShortcuts = require('./index.js');

let success = createDesktopShortcuts({
  linux: {
    name: 'Koala A11y',
    comment: 'Truly commented',
    filePath: '~/Downloads/Koa11y/Koa11y',
    chmod: true,
    icon: '../Downloads/Koa11y/package.nw/_img/logo.png'
  },
  osx: {
    filePath: '~/Downloads/Koa11y.app'
  },
  windows: {
    name: 'My App Name',
    comment: 'My App description',
    icon: '..\\..\\..\\PortableApps\\Koa11y_v3.0.0\\package.nw\\_img\\fav.ico',
    filePath: 'C:\\PortableApps\\Koa11y_v3.0.0\\Koa11y.exe',
    outputPath: '%USERPROFILE%\\Desktop',
    arguments: '--my-argument -f "other stuff"',
    windowMode: 'maximized',
    hotkey: 'ALT+CTRL+F'
  }
});

console.log(success);

console.timeEnd(timeLabel);
