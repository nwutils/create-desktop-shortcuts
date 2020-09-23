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
  }
};

module.exports = testHelpers;
