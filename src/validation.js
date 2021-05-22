'use strict';

/**
 * @file    This file validates the options object passed in by the user of this library to ensure it meets the expectations of the code.
 * @author  TheJaredWilcurt
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const which = require('which');

const helpers = require('./helpers.js');

const validation = {
  // SHARED
  /**
   * Creates, validates, and/or defaults the options object
   * and its values, including global settings, and each OS.
   *
   * @example
   * options = validateOptions(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateOptions: function (options) {
    options = options || {};
    if (typeof(options.verbose) !== 'boolean') {
      options.verbose = true;
    }
    if (typeof(options.onlyCurrentOS) !== 'boolean') {
      options.onlyCurrentOS = true;
    }
    if (!options.customLogger) {
      delete options.customLogger;
    } else if (typeof(options.customLogger) !== 'function') {
      delete options.customLogger;
      helpers.throwError(options, 'Optional customLogger must be a type of function.');
    }

    if (options.onlyCurrentOS) {
      if (process.platform !== 'win32' && options.windows) {
        delete options.windows;
      }
      if (process.platform !== 'linux' && options.linux) {
        delete options.linux;
      }
      if (process.platform !== 'darwin' && options.osx) {
        delete options.osx;
      }
    }

    options = this.validateLinuxOptions(options);
    options = this.validateWindowsOptions(options);
    options = this.validateOSXOptions(options);

    return options;
  },
  /**
   * Resolves the Environment Variables or tilde from outputPaths
   * to absolute paths. Verifies the outputPath exists and is a
   * folder. If path is not provided, does not exist, or is
   * otherwise invalid, defaults to the current user's desktop.
   *
   * @example
   * options = validateOutputPath(options);
   *
   * @param  {object} options          User's options
   * @param  {string} operatingSystem  'windows', 'linux', or 'osx'
   * @return {object}                  Validated or mutated user options
   */
  validateOutputPath: function (options, operatingSystem) {
    options = this.validateOptionalString(options, operatingSystem, 'name');

    if (!options[operatingSystem]) {
      return options;
    }

    if (options[operatingSystem].outputPath) {
      if (process.platform === 'win32') {
        options[operatingSystem].outputPath = helpers.resolveWindowsEnvironmentVariables(options[operatingSystem].outputPath);
      } else {
        options[operatingSystem].outputPath = helpers.resolveTilde(options[operatingSystem].outputPath);
      }

      if (
        !fs.existsSync(options[operatingSystem].outputPath) ||
        !fs.lstatSync(options[operatingSystem].outputPath).isDirectory()
      ) {
        helpers.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' outputPath must exist and be a folder. Defaulting to desktop.');
        delete options[operatingSystem].outputPath;
      }
    }

    if (!options[operatingSystem].outputPath) {
      options[operatingSystem].outputPath = path.join(os.homedir(), 'Desktop');
    }

    // Used for cross-platform testing. 'C:\\file.ext' => 'C:/file.ext' allowing path.parse to work on Linux (CI) with Windows paths
    // path.join.apply(null, ['C:', 'file.ext']) is same as path.join(...['C:', 'file.ext']); but works in older Node versions
    const correctedFilePath = path.join.apply(null, options[operatingSystem].filePath.split('\\'));

    const fileName = options[operatingSystem].name || path.parse(correctedFilePath).name || 'Root';
    const fileExtensions = {
      linux: '.desktop',
      win32: '.lnk',
      darwin: ''
    };
    const fileExtension = fileExtensions[process.platform];

    // 'C:\Users\Bob\Desktop\' + 'My App Name.lnk'
    // '~/Desktop/' + 'My App Name.desktop'
    options[operatingSystem].outputPath = path.join(options[operatingSystem].outputPath, fileName + fileExtension);

    return options;
  },
  /**
   * Generic validation method to ensure a specific key on a specific OS
   * object is either a string, or removed.
   *
   * @example
   * options = validateOptionalString(options);
   *
   * @param  {object} options          User's options
   * @param  {string} operatingSystem  'windows', 'linux', or 'osx'
   * @param  {string} key              The key within the OS object to be validated as an optional string
   * @return {object}                  Validated or mutated user options
   */
  validateOptionalString: function (options, operatingSystem, key) {
    if (
      typeof(options[operatingSystem]) === 'object' &&
      Object(options[operatingSystem]).hasOwnProperty(key) &&
      typeof(options[operatingSystem][key]) !== 'string'
    ) {
      helpers.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' ' + key + ' must be a string');
      delete options[operatingSystem][key];
    }
    return options;
  },
  /**
   * Finds executables in the user's PATH and returns the full filepath to them.
   * 'node' becomes 'C:\\Program Files\\nodejs\\node.exe'
   * If file does not exist or isn't an executable, returns the original string.
   *
   * @example
   * resolvePATH('node');
   *
   * @param  {string} filePath  The executable the shortcut will link to
   * @return {string}           A resolved path, or the original string
   */
  resolvePATH: function (filePath) {
    if (filePath) {
      return which.sync(filePath, { nothrow: true }) || filePath;
    }
    return filePath;
  },
  /**
   * Generic validation method to ensure a specific key on a specific OS
   * object is a boolean, and if not, give it the correct default value.
   *
   * @example
   * options = defaultBoolean(options);
   *
   * @param  {object}  options          User's options
   * @param  {string}  operatingSystem  'windows', 'linux', or 'osx'
   * @param  {string}  key              The key within the OS object to be validated or defaulted
   * @param  {boolean} defaultValue     The default value if no value set
   * @return {object}                   Validated or mutated user options
   */
  defaultBoolean: function (options, operatingSystem, key, defaultValue) {
    defaultValue = !!defaultValue;

    if (typeof(options[operatingSystem]) === 'object') {
      if (options[operatingSystem][key] === undefined) {
        options[operatingSystem][key] = defaultValue;
      }

      if (
        Object(options[operatingSystem]).hasOwnProperty(key) &&
        typeof(options[operatingSystem][key]) !== 'boolean'
      ) {
        helpers.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' ' + key + ' must be a boolean. Defaulting to ' + defaultValue);
        options[operatingSystem][key] = defaultValue;
      }
    }

    return options;
  },

  // LINUX
  /**
   * Ensures the Linux file path is valid and exists as a file,
   * folder, or url based on `type`. Resolves tilde to absolute paths.
   * If no valide filePath is presented, deleted "linux" object.
   *
   * @example
   * options = validateLinuxFilePath(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateLinuxFilePath: function (options) {
    if (!options.linux) {
      return options;
    }

    if (options.linux.filePath) {
      options.linux.filePath = helpers.resolveTilde(options.linux.filePath);
      options.linux.filePath = this.resolvePATH(options.linux.filePath);
    }

    options = this.validateLinuxType(options);
    const type = options.linux.type;
    if (
      (!type || type === 'Application') &&
      (
        !options.linux.filePath ||
        typeof(options.linux.filePath) !== 'string' ||
        !fs.existsSync(options.linux.filePath) ||
        fs.lstatSync(options.linux.filePath).isDirectory()
      )
    ) {
      helpers.throwError(options, 'LINUX filePath (with type of "Application") must exist and cannot be a folder: ' + options.linux.filePath);
      delete options.linux;
    } else if (
      type &&
      type === 'Directory' &&
      (
        !options.linux.filePath ||
        typeof(options.linux.filePath) !== 'string' ||
        !fs.existsSync(options.linux.filePath) ||
        !fs.lstatSync(options.linux.filePath).isDirectory()
      )
    ) {
      helpers.throwError(options, 'LINUX filePath (with type of "Directory") must exist and be a folder: ' + options.linux.filePath);
      delete options.linux;
    } else if (
      type &&
      type === 'Link' &&
      (
        !options.linux.filePath ||
        typeof(options.linux.filePath) !== 'string'
      )
    ) {
      helpers.throwError(options, 'LINUX filePath url must be a string: ' + options.linux.filePath);
      delete options.linux;
    }

    return options;
  },
  /**
   * Validates or defaults the `type` of Linux shortcut
   * based on the `filePath` to 'Link' if filePath starts
   * with 'http://' or 'https://', to 'Directory' if it exists
   * as a folder or 'Application', if the `filePath` exists as
   * a file.
   *
   * @example
   * options = validateLinuxType(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateLinuxType: function (options) {
    options = this.validateOptionalString(options, 'linux', 'type');

    const validTypes = ['Application', 'Link', 'Directory'];

    if (options.linux) {
      if (
        !options.linux.type &&
        options.linux.filePath &&
        typeof(options.linux.filePath) === 'string'
      ) {
        if (
          options.linux.filePath.startsWith('http://') ||
          options.linux.filePath.startsWith('https://')
        ) {
          options.linux.type = 'Link';
        } else if (
          fs.existsSync(options.linux.filePath) &&
          fs.lstatSync(options.linux.filePath).isDirectory()
        ) {
          options.linux.type = 'Directory';
        }
      }

      if (options.linux.type && !validTypes.includes(options.linux.type)) {
        helpers.throwError(options, 'Optional LINUX type must be "Application", "Link", or "Directory". Defaulting to "Application".');
        delete options.linux.type;
      }

      options.linux.type = options.linux.type || 'Application';
    }

    return options;
  },
  /**
   * Validates the Linux shortcut icon exists and
   * is either a ICNS or PNG file, or removes it.
   * If path is relative, converts it to absolute base
   * on the outputPath.
   *
   * @example
   * options = validateLinuxIcon(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateLinuxIcon: function (options) {
    options = this.validateOutputPath(options, 'linux');
    options = this.validateOptionalString(options, 'linux', 'icon');

    if (options.linux && options.linux.icon) {
      let iconPath = helpers.resolveTilde(options.linux.icon);

      if (!path.isAbsolute(iconPath)) {
        const outputDirectory = path.parse(options.linux.outputPath).dir;
        iconPath = path.join(outputDirectory, iconPath);
      }

      if (!iconPath.endsWith('.png') && !iconPath.endsWith('.icns')) {
        helpers.throwError(options, 'Optional LINUX icon should probably be a PNG file.');
      }

      if (!fs.existsSync(iconPath)) {
        helpers.throwError(options, 'Optional LINUX icon could not be found.');
        delete options.linux.icon;
      } else {
        options.linux.icon = iconPath;
      }
    }
    if (options.linux && !options.linux.icon) {
      delete options.linux.icon;
    }

    return options;
  },
  /**
   * Ensures all Linux settings are valid, or defaulted.
   * If no Linux options, it removes the "linux" object.
   *
   * @example
   * options = validateLinuxOptions(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateLinuxOptions: function (options) {
    options = this.validateLinuxFilePath(options);

    if (!options.linux) {
      return options;
    }

    options = this.validateLinuxIcon(options);
    options = this.defaultBoolean(options, 'linux', 'terminal', false);
    options = this.defaultBoolean(options, 'linux', 'chmod', true);
    options = this.validateOptionalString(options, 'linux', 'comment');
    options = this.validateOptionalString(options, 'linux', 'arguments');

    return options;
  },

  // WINDOWS
  /**
   * Ensures the Windows file path is valid and exists.
   * Resolves any environment variables to absolute paths.
   * If no valide filePath is presented, deleted "windows" object.
   *
   * @example
   * options = validateWindowsFilePath(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsFilePath: function (options) {
    if (!options.windows) {
      return options;
    }

    if (options.windows.filePath) {
      options.windows.filePath = helpers.resolveWindowsEnvironmentVariables(options.windows.filePath);
      options.windows.filePath = this.resolvePATH(options.windows.filePath);
    }

    if (
      !options.windows.filePath ||
      typeof(options.windows.filePath) !== 'string' ||
      !fs.existsSync(options.windows.filePath)
    ) {
      helpers.throwError(options, 'WINDOWS filePath does not exist: ' + options.windows.filePath);
      delete options.windows;
    }

    return options;
  },
  /**
   * Verifies or defaults the windowMode.
   *
   * @example
   * options = validateWindowsWindowMode(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsWindowMode: function (options) {
    options = this.validateOptionalString(options, 'windows', 'windowMode');

    const validWindowModes = ['normal', 'maximized', 'minimized'];

    if (options.windows && options.windows.windowMode && !validWindowModes.includes(options.windows.windowMode)) {
      helpers.throwError(options, 'Optional WINDOWS windowMode must be "normal", "maximized", or "minimized". Defaulting to "normal".');
      delete options.windows.windowMode;
    }

    if (options.windows && !options.windows.windowMode) {
      options.windows.windowMode = 'normal';
    }

    return options;
  },
  /**
   * Validates optional Windows shortcut icon, or removes it.
   * Resolves environment paths to absolute paths. Resolves
   * relative paths ('../a.ico') to absolute paths based on
   * outputPath. Verifies correct file extension and icon
   * index via regex. Verifies exists.
   *
   * @example
   * options = validateWindowsIcon(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsIcon: function (options) {
    options = this.validateOutputPath(options, 'windows');
    options = this.validateOptionalString(options, 'windows', 'icon');

    if (options.windows && options.windows.icon) {
      let iconPath = helpers.resolveWindowsEnvironmentVariables(options.windows.icon);

      if (!path.win32.isAbsolute(iconPath)) {
        let outputPath = options.windows.outputPath;
        // path.sep is forced to '/' in tests so Linux CI can validate Windows tests.
        // Coverage ignored because we can't do ELSE on this IF.
        /* istanbul ignore next */
        if (path.sep !== '\\') {
          outputPath = outputPath.split('\\').join('/');
          iconPath = iconPath.split('\\').join('/');
        }
        const outputDirectory = path.parse(outputPath).dir;
        iconPath = path.join(outputDirectory, iconPath);
      }

      // anything, then either '.exe', '.ico', or '.dll', maybe ',12'.
      let iconPattern = /^.*(?:\.exe|\.ico|\.dll)(?:,\d*)?$/m;
      if (!RegExp(iconPattern).test(iconPath)) {
        iconPath = undefined;
        helpers.throwError(options, 'Optional WINDOWS icon must be a ICO, EXE, or DLL file. It may be followed by a comma and icon index value, like: "C:\\file.exe,0"');
      }

      /**
       * Removes the icon index from file paths.
       * Such as 'C:\\file.exe,2' => 'C:\\file.exe'.
       *
       * @example
       * // 'C:\\file.exe'
       * removeIconIndex('C:\\file.exe,2');
       *
       * @param  {string} icon  Icon filepath.
       * @return {string}       Icon filepath without icon index.
       */
      function removeIconIndex (icon) {
        // 'C:\\file.dll,0' => 'dll,0'
        const extension = path.parse(icon).ext;
        // 'dll,0' => ['dll', '0'] => 'dll'
        const cleaned = extension.split(',')[0];
        // 'C:\\file.dll,0' => 'C:\\file.dll'
        return icon.replace(extension, cleaned);
      }

      if (!iconPath) {
        delete options.windows.icon;
      } else if (!fs.existsSync(removeIconIndex(iconPath))) {
        helpers.throwError(options, 'Optional WINDOWS icon could not be found.');
        delete options.windows.icon;
      } else {
        options.windows.icon = iconPath;
      }
    }

    return options;
  },
  /**
   * Validates the optional string "comment" for a windows shortcut.
   * Also handles old API "description" in case that is still passed
   * in.
   *
   * @example
   * options = validateWindowsComment(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsComment: function (options) {
    options = this.validateOptionalString(options, 'windows', 'comment');
    options = this.validateOptionalString(options, 'windows', 'description');

    // Accidentally showed 'description' in part of the docs that should have been comment.
    // Just in case someone copy/pasted that in the past we should make sure it works.
    if (options.windows && options.windows.description) {
      options.windows.comment = options.windows.comment || options.windows.description;
      delete options.windows.description;
    }

    return options;
  },
  /**
   * Resolves environement variables to absolute paths. Validates
   * the working directory for a Windows shortcut exists and is a
   * folder, or removes it.
   *
   * @example
   * options = validateWindowsWorkingDirectory(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsWorkingDirectory: function (options) {
    options = this.validateOptionalString(options, 'windows', 'workingDirectory');
    if (!options.windows || !Object(options.windows).hasOwnProperty('workingDirectory')) {
      return options;
    }

    options.windows.workingDirectory = helpers.resolveWindowsEnvironmentVariables(options.windows.workingDirectory);

    if (!fs.existsSync(options.windows.workingDirectory)) {
      helpers.throwError(options, 'Optional WINDOWS workingDirectory path does not exist: ' + options.windows.workingDirectory);
      delete options.windows.workingDirectory;
      return options;
    }

    if (!fs.lstatSync(options.windows.workingDirectory).isDirectory()) {
      helpers.throwError(options, 'Optional WINDOWS workingDirectory path must be a directory: ' + options.windows.workingDirectory);
      delete options.windows.workingDirectory;
      return options;
    }

    return options;
  },
  /**
   * Validates or removes the Windows object from the user's options.
   *
   * @example
   * options = validateWindowsOptions(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateWindowsOptions: function (options) {
    options = this.validateWindowsFilePath(options);

    if (!options.windows) {
      return options;
    }

    options = this.validateWindowsWindowMode(options);
    options = this.validateWindowsIcon(options);
    options = this.validateWindowsComment(options);
    options = this.validateWindowsWorkingDirectory(options);
    options = this.validateOptionalString(options, 'windows', 'arguments');
    options = this.validateOptionalString(options, 'windows', 'hotkey');

    return options;
  },

  // OSX
  /**
   * Validates the OSX filePath exists or removes the OSX object.
   *
   * @example
   * options = validateOSXFilePath(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateOSXFilePath: function (options) {
    if (!options.osx) {
      return options;
    }

    if (options.osx.filePath) {
      options.osx.filePath = helpers.resolveTilde(options.osx.filePath);
      options.osx.filePath = this.resolvePATH(options.osx.filePath);
    }

    if (
      !options.osx.filePath ||
      typeof(options.osx.filePath) !== 'string' ||
      !fs.existsSync(options.osx.filePath)
    ) {
      helpers.throwError(options, 'OSX filePath does not exist: ' + options.osx.filePath);
      delete options.osx;
    }

    return options;
  },
  /**
   * Validates or deletes the OSX object from the user's options.
   *
   * @example
   * options = validateOSXOptions(options);
   *
   * @param  {object} options  User's options
   * @return {object}          Validated or mutated user options
   */
  validateOSXOptions: function (options) {
    options = this.validateOSXFilePath(options);

    if (!options.osx) {
      return options;
    }

    options = this.validateOutputPath(options, 'osx');
    options = this.defaultBoolean(options, 'osx', 'overwrite', false);

    return options;
  }
};

module.exports = validation;
