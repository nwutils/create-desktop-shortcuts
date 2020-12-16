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
   * @param  {string}  platform  'win32', 'linux', or 'darwin'.
   */
  mockPlatform: function (platform) {
    platform = platform || 'win32';
    Object.defineProperty(process, 'platform', {
      value: platform
    });
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
  mockfs: function (bool) {
    const vbs = path.join(path.dirname(__dirname), 'src', 'windows.vbs');
    const vbsLinux = testHelpers.slasher(vbs);
    const Windows = {
      [vbs]: 'text',
      'C:\\file.ext': 'text',
      'C:\\folder': {},
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
      'C:/Users/DUMMY/icon.ico': 'text',
      'C:/Users/DUMMY/icon.exe': 'text',
      'C:/Users/DUMMY/icon.dll': 'text',
      'C:/Users/DUMMY/icon.png': 'text',
      'C:/Users/DUMMY/Desktop': {}
    };
    const Linux = {
      '/home/DUMMY': {
        'file.ext': 'text',
        'icon.png': 'text',
        'icon.icns': 'text',
        'icon.bmp': 'text',
        'Desktop': {},
        'folder': {}
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
  restoreMockFs: function () {
    mock.restore();
  }
};

module.exports = testHelpers;
