const os = require('os');

const helpers = {
  throwError: function (options, message, error) {
    if (options.verbose && options.customLogger) {
      options.customLogger(message, error);
    } else if (options.verbose) {
      console.error(
        '_________________________\n' +
        'Create-Desktop-Shortcuts:\n' +
        message,
        error
      );
    }
  },
  resolveTilde: function (filePath) {
    if (!filePath || typeof(filePath) !== 'string') {
      return undefined;
    }

    // '~/folder/path' or '~'
    if (filePath[0] === '~' && (filePath[1] === '/' || filePath.length === 1)) {
      return filePath.replace('~', os.homedir());
    }

    return filePath;
  },
  /**
   * Replaces all environment variables with their actual value.
   * Keeps intact non-environment variables using '%'
   *
   * @param  {string} filePath The input file path with percents
   * @return {string}          The resolved file path;
   */
  resolveWindowsEnvironmentVariables: function (filePath) {
    if (!filePath || typeof(filePath) !== 'string') {
      return undefined;
    }

    /**
     * Returns the value stored in the process.env for a given
     * environment variable. Or the original '%ASDF%' string if
     * not found.
     *
     * @param  {string} withPercents    '%USERNAME%'
     * @param  {string} withoutPercents 'USERNAME'
     * @return {string}                 'bob' || '%USERNAME%'
     */
    function replaceEnvironmentVariable (withPercents, withoutPercents) {
      let found = process.env[withoutPercents];
      // 'C:\Users\%USERNAME%\Desktop\%asdf%' => 'C:\Users\bob\Desktop\%asdf%'
      return found || withPercents;
    }

    // 'C:\Users\%USERNAME%\Desktop\%PROCESSOR_ARCHITECTURE%' => 'C:\Users\bob\Desktop\AMD64'
    filePath = filePath.replace(/%([^%]+)%/g, replaceEnvironmentVariable);

    return filePath;
  }
};

module.exports = helpers;
