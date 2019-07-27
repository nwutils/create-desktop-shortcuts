
# create-desktop-shortcuts

Easy API to create desktop shortcuts with Node

This is **not ready for use yet**. But the following is the planned API, it is subject to change.


```js
const createDesktopShortcut = require('create-desktop-shortcuts');
createDesktopShortcut({
  async: true,
  onlyCurrentOS: false,
  win: {
    name: 'My App Name',
    description: 'My App description',
    icon: 'C:\\path\\to\\file.ico',
    filepath: 'C:\\path\\to\\executable.exe',
    arguments: '--my-argument',
    windowMode: 'normal', // 'normal', 'maximized', 'minimized'
    hotkey: 'ALT+CTRL+F'
  },
  linux: {
    filepath: '/home/path/to/executable',
    icon: '/home/path/to/file.png',
    name: 'My App Name',
    comment: 'My comment',
    type: 'Application',
    terminal: 'false',
    chmod: true
  },
  osx: {} // todo
});
```
