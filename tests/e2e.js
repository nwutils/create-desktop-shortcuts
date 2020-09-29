let createDesktopShortcuts = require('../index.js');

let success = createDesktopShortcuts({
  linux: {
    filePath: './src',
    type: 'Directory',
    chmod: false
  },
  osx: {
    filePath: './src'
  },
  windows: {
    filePath: '.\\src'
  }
});

if (success) {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  let ext = '';
  if (process.platform === 'linux') {
    ext = '.desktop';
  }
  if (process.platform === 'win32') {
    ext = '.lnk';
  }
  let outputDir = path.join(os.homedir(), 'Desktop', 'src' + ext);
  console.log(outputDir);
  if (!fs.existsSync(outputDir)) {
    throw 'E2E: COULD NOT FIND DESKTOP SHORTCUT';
  } else {
    console.log('Automated end-to-end test completed successfully.');
  }
} else {
  throw 'E2E: FAILED TO CREATE DESKTOP SHORTCUT';
}
