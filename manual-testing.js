/**
 * @file    Used during local development to manually test the functionality of different features.
 * @author  TheJaredWilcurt
 */

const timeLabel = 'Executed in';
console.time(timeLabel);

const os = require('os');
const path = require('path');

const createDesktopShortcuts = require('./index.js');
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');
/*
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
*/

const place = 'C:\\Users\\wilcurtj\\Desktop\\My App Name.lnk';

const output = getWindowsShortcutProperties.sync(place);

if (output) {
  console.log(output);
} else {
  console.log('There was an error');
}

console.timeEnd(timeLabel);
