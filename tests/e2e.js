const fs = require('fs');
const path = require('path');

const createDesktopShortcuts = require('../index.js');

const filePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, '__mocks__');

let success = createDesktopShortcuts({
  linux: {
    filePath,
    outputPath,
    type: 'Directory',
    chmod: false
  },
  osx: {
    filePath,
    outputPath
  },
  windows: {
    filePath,
    outputPath
  }
});

if (success) {
  let ext = '';
  if (process.platform === 'linux') {
    ext = '.desktop';
  }
  if (process.platform === 'win32') {
    ext = '.lnk';
  }
  let outputDir = path.join(__dirname, '__mocks__', 'src' + ext);
  if (!fs.existsSync(outputDir)) {
    throw 'E2E: COULD NOT FIND DESKTOP SHORTCUT';
  } else {
    console.log('Automated end-to-end test completed successfully.');
  }
} else {
  throw 'E2E: FAILED TO CREATE DESKTOP SHORTCUT';
}
