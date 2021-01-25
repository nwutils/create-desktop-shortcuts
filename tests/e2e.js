/**
 * @file    This file creates an shortcut on the computer (or VM) it is ran on, then verifies it worked.
 * @author  TheJaredWilcurt
 */

const fs = require('fs-extra');
const path = require('path');

const createDesktopShortcuts = require('../index.js');

let ext = '';
if (process.platform === 'linux') {
  ext = '.desktop';
}
if (process.platform === 'win32') {
  ext = '.lnk';
}
const filePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, '__mocks__');
const outputFile = path.join(__dirname, '__mocks__', 'src' + ext);

let success = createDesktopShortcuts({
  linux: {
    filePath,
    outputPath,
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
  if (!fs.existsSync(outputFile)) {
    throw 'E2E: COULD NOT FIND DESKTOP SHORTCUT';
  } else {
    console.log('\n ______________ _________________________________________');
    console.log('|              |                                         |');
    console.log('|  E2E PASSED  |  Successly created and validated file.  |');
    console.log('|              |                                         |');
    console.log(' ¯¯¯¯¯¯¯¯¯¯¯¯¯¯ ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n\n');
  }
} else {
  throw 'E2E: FAILED TO CREATE DESKTOP SHORTCUT';
}

try {
  fs.removeSync(outputFile);
} catch (err) {
  throw 'E2E: Error deleting end-to-end shortcut';
}

if (fs.existsSync(outputFile)) {
  throw 'E2E: Shortcut file was not removed';
}
