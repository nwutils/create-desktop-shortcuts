/**
 * @file    This file creates an shortcut on the computer (or VM) it is ran on, then verifies it worked.
 * @author  TheJaredWilcurt
 */

const timeLabel = '|              |  Executed in';
console.time(timeLabel);

const fs = require('fs-extra');
const path = require('path');
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

const createDesktopShortcuts = require('../index.js');

let extensions = {
  linux: '.desktop',
  win32: '.lnk'
};

let extension = extensions[process.platform] || '';

const filePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, '__mocks__');
const outputFile = path.join(__dirname, '__mocks__', 'src' + extension);
const Arguments = '-m "test"';
const hotkey = 'Ctrl+Shift+P';
const comment = 'Some "very" good text.';

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
    outputPath,
    hotkey,
    comment,
    arguments: Arguments,
    workingDirectory: outputPath,
    windowMode: 'maximized'
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
  if (process.platform === 'darwin') {
    console.timeEnd(timeLabel);
  }
  console.log('|              |' + fill(' ') + '|');
  console.log(' ¯¯¯¯¯¯¯¯¯¯¯¯¯¯ ' + fill('¯') + '\n\n');

  if (!pass) {
    throw 'Error';
  }
}

/**
 * Logs out the time it took for the shortcut to be created.
 *
 * @param  {string} osBlock  Block of text to show containing the OS name
 */
function endTime (osBlock) {
  console.log('\n ______________ __________________________');
  console.log('|              |                          |');
  console.log(osBlock + '                          |');
  console.timeEnd(timeLabel);
  console.log(' ¯¯¯¯¯¯¯¯¯¯¯¯¯¯ ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' + '\n\n');
}

const successMessage = 'Successly created and validated file.';

if (success) {
  if (!fs.existsSync(outputFile)) {
    alert(false, 'Could not find desktop shortcut.');
  } else if (process.platform === 'win32') {
    // We need to log the Windows time now to be accurate, as the
    // getWindowsShortcutProperties step adds ~200-400ms that we don't care about
    endTime('| WINDOWS TIME |');
    // This is here to validate the VBS script outputted a shortcut as expected
    const outputProperties = getWindowsShortcutProperties.sync(outputFile)[0];
    const expected = {
      FullName: outputFile,
      Arguments: Arguments,
      Description: comment,
      Hotkey: hotkey,
      IconLocation: filePath + ',0',
      RelativePath: '',
      TargetPath: filePath,
      WindowStyle: '3',
      WorkingDirectory: outputPath
    };
    const windowsShortcutVerified = JSON.stringify(expected) === JSON.stringify(outputProperties);
    if (windowsShortcutVerified) {
      alert(true, successMessage);
    } else {
      console.log({ expected, outputProperties });
      alert(false, 'Windows Shortcut properties mismatch');
    }
  } else if (process.platform === 'linux') {
    endTime('|  LINUX TIME  |');
    const expected = [
      '#!/user/bin/env xdg-open',
      '[Desktop Entry]',
      'Version=1.0',
      'Type=Directory',
      'Terminal=false',
      'Exec="' + filePath + '" ' + Arguments,
      'Name=src'
    ].join('\n');
    const output = String(fs.readFileSync(outputFile));
    if (expected === output) {
      alert(true, successMessage);
    } else {
      console.log({ expected, output });
      alert(false, 'Linux Shortcut properties mismatch');
    }
  } else {
    alert(true, successMessage);
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
