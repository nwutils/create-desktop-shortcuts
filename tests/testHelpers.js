/**
 * @file    Helper functions used by unit tests.
 * @author  TheJaredWilcurt
 */

const path = require('path');
const os = require('os');
const mock = require('mock-fs');

const testHelpers = {
  /**
   * Sets the process.platform to specified value.
   *
   * @example
   * mockPlatform('win32');
   *
   * @param {string} platform  'win32', 'linux', or 'darwin'.
   */
  mockPlatform: function (platform) {
    platform = platform || 'win32';
    Object.defineProperty(process, 'platform', {
      value: platform
    });
  },
  /**
   * Sets the global PATHs variable to equal a dummy path.
   *
   * @example
   * mockEnvPATH();
   */
  mockEnvPATH: function () {
    if (process && process.env) {
      this.PATH = process.env.PATH;
      if (process.platform === 'win32') {
        process.env.PATH = [
          'C:\\Program Files\\DUMMY'
        ].join(';');
      } else {
        process.env.PATH = [
          '/home/DUMMY'
        ].join(':');
      }
    }
  },
  /**
   * Overrides the process.env.OSTYPE so 'which' will run on
   * on a Linux CI pretending to be Windows.
   *
   * @example
   * mockOsType();
   *
   * @param {string} type  Optional, defaults to 'cygwin'. 'msys' would also work
   */
  mockOsType: function (type) {
    type = type || 'cygwin';
    if (process && process.env) {
      this.OSTYPE = process.env.OSTYPE;
      Object.defineProperty(process.env, 'OSTYPE', {
        value: type
      });
    }
  },
  /**
   * Sets the global PATHs variable back to the original value.
   *
   * @example
   * restoreEnvPATH();
   */
  restoreEnvPATH: function () {
    if (this.PATH && process && process.env) {
      process.env.PATH = this.PATH;
      this.PATH = '';
    }
  },
  /**
   * Converts from Windows Slashes to Unix slashes.
   *
   * @example
   * // 'C:/Folder/file.ext'
   * slasher('C:\\Folder\\file.ext');
   *
   * @param  {string} str  Any string.
   * @return {string}      Converted string.
   */
  slasher: function (str) {
    return str.split('\\').join('/');
  },
  /**
   * Converts all Window slasses (\) to Unix slashes (/)
   * in filePaths, outputPaths, and icons.
   *
   * @example
   * optionsSlasher(options);
   *
   * @param  {object} options  The user's options
   * @return {object}          The user's mutated options
   */
  optionsSlasher: function (options) {
    const operatingSystems = [
      'windows',
      'linux',
      'osx'
    ];
    const systemPaths = [
      'filePath',
      'outputPath',
      'icon'
    ];

    if (options) {
      operatingSystems.forEach((operatingSystem) => {
        if (options[operatingSystem]) {
          systemPaths.forEach((key) => {
            if (options[operatingSystem][key]) {
              options[operatingSystem][key] = this.slasher(options[operatingSystem][key]);
            }
          });
        }
      });
    }

    return options;
  },
  defaults: {
    onlyCurrentOS: true,
    verbose: true
  },
  /**
   * Sets up a fake file system with paths used by tests so we
   * can test the library without creating actual shortcuts on
   * the current machine. Also helps when testing OS specific
   * code when not on that OS.
   *
   * @example
   * mockfs(true);
   *
   * @param {boolean} bool  mockfs causes weird issues with console.log unless it is called first from this function, true resolves this
   */
  mockfs: function (bool) {
    const vbs = path.join(path.dirname(__dirname), 'src', 'windows.vbs');
    const vbsLinux = testHelpers.slasher(vbs);
    const windowsExecutable = mock.file({
      content: 'Executable',
      mode: 33206,
      uid: 0,
      gid: 0
    });
    const linuxExecutable = mock.file({
      content: 'Executable',
      mode: 33261,
      uid: 1000,
      gid: 1000
    });
    const Windows = {
      [vbs]: 'text',
      'C:\\file.ext': 'text',
      'C:\\folder': {},
      'C:\\Program Files\\DUMMY\\app.exe': windowsExecutable,
      'C:\\Program Files\\DUMMY\\powershell.exe': windowsExecutable,
      'C:\\Users\\DUMMY\\icon.ico': 'text',
      'C:\\Users\\DUMMY\\icon.exe': 'text',
      'C:\\Users\\DUMMY\\icon.dll': 'text',
      'C:\\Users\\DUMMY\\icon.png': 'text',
      'C:\\Users\\DUMMY\\Desktop': {}
    };
    let WindowsInLinuxCI = {
      [vbsLinux]: 'text',
      'C:/file.ext': 'text',
      'C:/folder': {},
      'C:\\Program Files\\DUMMY\\app.exe': windowsExecutable,
      'C:\\Program Files\\DUMMY': {
        'powershell.exe': linuxExecutable
      },
      'C:/Users/DUMMY/icon.ico': 'text',
      'C:/Users/DUMMY/icon.exe': 'text',
      'C:/Users/DUMMY/icon.dll': 'text',
      'C:/Users/DUMMY/icon.png': 'text',
      'C:/Users/DUMMY/Desktop': {}
    };
    const Linux = {
      '/home/DUMMY': {
        'app.exe': linuxExecutable,
        'file.ext': 'text',
        'icon.png': 'text',
        'icon.icns': 'text',
        'icon.bmp': 'text',
        Desktop: {},
        folder: {}
      }
    };
    if (os.platform() === 'win32') {
      WindowsInLinuxCI = {};
    }

    if (bool) {
      console.log('');
    }

    // mock-fs explodes if you use console in your code without
    // running it once right before execution.
    // console.log('');
    mock({
      ...Windows,
      ...WindowsInLinuxCI,
      ...Linux
    });
  },
  /**
   * Same as mockfs, but lets you create a one-off file system
   * for a specific test that needs to deviate from the rest of
   * the tests.
   *
   * @example
   * mockfsByHand({ 'C:\\Users\\DUMMY\\Desktop': {} }, true);
   *
   * @param {object}  input  Object where keys are file paths and string values are files and object values are folders
   * @param {boolean} bool   mockfs causes weird issues with console.log unless it is called first from this function, true resolves this
   */
  mockfsByHand: function (input, bool) {
    // mock-fs explodes if you use console in your code without
    // running it once right before execution.
    if (bool) {
      console.log('');
    }
    mock(input);
  },
  /**
   * Stops mocking calls to the filesystem,
   * restoring it back to normal.
   *
   * @example
   * restoreMockFs();
   */
  restoreMockFs: function () {
    mock.restore();
  }
};

module.exports = testHelpers;
