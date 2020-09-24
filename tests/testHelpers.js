const testHelpers = {
  /**
   * Sets the process.platform to specified value.
   *
   * @param  {string}  platform  'win32', 'linux', or 'darwin'
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
   * @param  {string} str  Any string
   * @return {string}      Converted string
   */
  slasher: function (str) {
    return str.split('\\').join('/');
  },
  optionsSlasher: function (options) {
    if (options) {
      if (options.windows) {
        if (options.windows.filePath) {
          options.windows.filePath = this.slasher(options.windows.filePath);
        }
        if (options.windows.outputPath) {
          options.windows.outputPath = this.slasher(options.windows.outputPath);
        }
        if (options.windows.icon) {
          options.windows.icon = this.slasher(options.windows.icon);
        }
      }
      if (options.linux) {
        if (options.linux.filePath) {
          options.linux.filePath = this.slasher(options.linux.filePath);
        }
        if (options.linux.outputPath) {
          options.linux.outputPath = this.slasher(options.linux.outputPath);
        }
        if (options.linux.icon) {
          options.linux.icon = this.slasher(options.linux.icon);
        }
      }
      if (options.osx) {
        if (options.osx.filePath) {
          options.osx.filePath = this.slasher(options.osx.filePath);
        }
        if (options.osx.outputPath) {
          options.osx.outputPath = this.slasher(options.osx.outputPath);
        }
      }
    }
    return options;
  }
};

module.exports = testHelpers;
