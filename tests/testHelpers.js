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
   * @param  {boolean} bool  mockfs causes weird issues with console.log unless it is called first from this function, true resolves this
   */
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
