/**
 * @file    This file creates an shortcut on the computer (or VM) it is ran on, then verifies it worked.
 * @author  TheJaredWilcurt
 */

const timeLabel = '|              |  Executed in';
console.time(timeLabel);

const fs = require('fs-extra');
const path = require('path');

const createDesktopShortcuts = require('../index.js');

let extensions = {
  linux: '.desktop',
  win32: '.lnk'
};

let extension = extensions[process.platform] || '';

const filePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, '__mocks__');
const outputFile = path.join(__dirname, '__mocks__', 'src' + extension);

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

/**
 * Creates an boxed alert in the console based on E2E test results
 * and length of the message.
 *
 * @example
 * alert(true, 'Everything worked.');
 * alert(false, 'Something broke.');
 *
 * @param {boolean} pass     true = test passed, false will throw an error to stop CI
 * @param {string}  message  The details of the test results
 */
function alert (pass, message) {
  let state = 'PASSED';
  if (!pass) {
    state = 'FAILED';
  }
  /**
   * Creates the same character repeated as many times as the
   * message length + 4 (for padding). Used above/below the
   * message to create a box.
   *
   * @example
   * fill(' ');
   *
   * @param  {string} character  A string with a length of 1.
   * @return {string}            The character repeated to fill the length of the box.
   */
  function fill (character) {
    if (character.length !== 1) {
      character = ' ';
    }
    let length = message.length + 4;
    return new Array(length).fill(character).join('');
  }


  console.log('\n ______________ ' + fill('_'));
  console.log('|              |' + fill(' ') + '|');
  console.log('|  E2E ' + state + '  |  ' + message + '  |');
  console.timeEnd(timeLabel);
  console.log('|              |' + fill(' ') + '|');
  console.log(' ¯¯¯¯¯¯¯¯¯¯¯¯¯¯ ' + fill('¯') + '\n\n');

  if (!pass) {
    throw 'Error';
  }
}

if (success) {
  if (!fs.existsSync(outputFile)) {
    alert(false, 'Could not find desktop shortcut.');
  } else {
    alert(true, 'Successly created and validated file.');
  }
} else {
  alert(false, 'Failed to create desktop shortcut.');
}

try {
  fs.removeSync(outputFile);
} catch (err) {
  alert(false, 'Error deleting end-to-end shortcut.');
}

if (fs.existsSync(outputFile)) {
  alert(false, 'Shortcut file was not removed.');
}
