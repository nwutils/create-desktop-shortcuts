
# create-desktop-shortcuts

[![Build Status](https://travis-ci.org/nwutils/create-desktop-shortcuts.svg?branch=master)](https://travis-ci.org/nwutils/create-desktop-shortcuts)

Easy API to create desktop shortcuts with Node

This is **not ready for use yet**. But the following is the planned API, it is subject to change.

Currently everything is **synchronous**.

```js
const createDesktopShortcut = require('create-desktop-shortcuts');
createDesktopShortcut({
  onlyCurrentOS: false, // defaults to true
  verbose: false, // consoles out helpful error messages if true (defaults to true)
  windows: {
    name: 'My App Name',
    description: 'My App description',
    icon: 'C:\\path\\to\\file.ico',
    filePath: 'C:\\path\\to\\executable.exe',
    outputPath: 'C:\some\folder', \\ defaults to the current user's desktop
    arguments: '--my-argument',
    windowMode: 'normal', // 'normal', 'maximized', 'minimized'
    hotkey: 'ALT+CTRL+F'
  },
  linux: {
    name: 'My App Name',
    comment: 'My comment',
    icon: '/home/path/to/file.png',
    filePath: '/home/path/to/executable',
    outputPath: 'C:\some\folder', \\ defaults to the current user's desktop
    type: 'Application',
    terminal: false,
    chmod: true
  },
  osx: {} // todo
}); // returns true if everything worked correctly, or false if it could not create the icon or set its permissions
```
