const fs = require('fs');
const path = require('path');
const os = require('os');

const helpers = require('./helpers.js');

const validation = {
  validateOptions: function (options) {
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

    const fileName = options[operatingSystem].name || path.parse(options[operatingSystem].filePath).name || 'Root';
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
  validateOptionalString: function (options, operatingSystem, key) {
    if (options[operatingSystem] && options[operatingSystem][key] && typeof(options[operatingSystem][key]) !== 'string') {
      helpers.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' ' + key + ' must be a string');
      delete options[operatingSystem][key];
    }
    return options;
  },
  validateLinuxFilePath: function (options) {
    if (!options.linux) {
      return options;
    }

    if (options.linux.filePath) {
      options.linux.filePath = helpers.resolveTilde(options.linux.filePath);
    }

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
      helpers.throwError(options, 'LINUX filePath does not exist: ' + options.linux.filePath);
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
      helpers.throwError(options, 'LINUX filePath directory must exist and be a folder: ' + options.linux.filePath);
      delete options.linux;
    } else if (
      type &&
      type === 'Link' &&
      (
        !options.linux.filePath ||
        typeof(options.linux.filePath) !== 'string'
      )
    ) {
      helpers.throwError(options, 'LINUX filePath url must exist a string: ' + options.linux.filePath);
      delete options.linux;
    }

    if (options.linux && !options.linux.filePath) {
      helpers.throwError(options, 'LINUX filePath does not exist: ' + options.linux.filePath);
      delete options.linux;
    }

    return options;
  },
  validateLinuxOptions: function (options) {
    if (!options.linux) {
      return options;
    }

    options = this.validateLinuxFilePath(options);
    options = this.validateOutputPath(options, 'linux');
    options = this.validateOptionalString(options, 'linux', 'comment');
    options = this.validateOptionalString(options, 'linux', 'type');
    options = this.validateOptionalString(options, 'linux', 'icon');

    if (!options.linux) {
      return options;
    }

    if (typeof(options.linux.terminal) !== 'boolean') {
      options.linux.terminal = false;
    }
    if (typeof(options.linux.chmod) !== 'boolean') {
      options.linux.chmod = true;
    }

    const validTypes = ['Application', 'Link', 'Directory'];
    if (options.linux.type && !validTypes.includes(options.linux.type)) {
      helpers.throwError(options, 'Optional LINUX type must be "Application", "Link", or "Directory". Defaulting to "Application".');
      options.linux.type = 'Application';
    }

    if (options.linux.icon) {
      let iconPath = helpers.resolveTilde(options.linux.icon);

      if (!path.isAbsolute(iconPath)) {
        const outputDirectory = path.parse(options.linux.outputPath).dir;
        process.chdir(outputDirectory);
        iconPath = path.join(outputDirectory, iconPath);
        process.chdir(__dirname);
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

    return options;
  },
  validateWindowsFilePath: function (options) {
    if (!options.windows) {
      return options;
    }

    if (options.windows.filePath) {
      options.windows.filePath = helpers.resolveWindowsEnvironmentVariables(options.windows.filePath);
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
  validateWindowsOptions: function (options) {
    options = this.validateWindowsFilePath(options);
    if (!options.windows) {
      return options;
    }

    options = this.validateOutputPath(options, 'windows');
    options = this.validateOptionalString(options, 'windows', 'comment');
    options = this.validateOptionalString(options, 'windows', 'icon');
    options = this.validateOptionalString(options, 'windows', 'arguments');
    options = this.validateOptionalString(options, 'windows', 'windowMode');
    options = this.validateOptionalString(options, 'windows', 'hotkey');

    const validWindowModes = ['normal', 'maximized', 'minimized'];
    if (options.windows.windowMode && !validWindowModes.includes(options.windows.windowMode)) {
      helpers.throwError(options, 'Optional WINDOWS windowMode must be "normal", "maximized", or "minimized". Defaulting to "normal".');
      delete options.windows.windowMode;
    }
    if (!options.windows.windowMode) {
      options.windows.windowMode = 'normal';
    }

    if (options.windows.icon) {
      let iconPath = helpers.resolveWindowsEnvironmentVariables(options.windows.icon);

      if (!path.isAbsolute(iconPath)) {
        const outputDirectory = path.parse(options.widnows.outputPath).dir;
        process.chdir(outputDirectory);
        iconPath = path.join(outputDirectory, iconPath);
        process.chdir(__dirname);
      }

      // anything, then either '.exe', '.ico', or '.dll', maybe ',12'.
      let iconPattern = /^.*(?:\.exe|\.ico|\.dll)(?:,\d*)?$/m;
      if (!RegExp(iconPattern).test(iconPath)) {
        helpers.throwError(options, 'Optional WINDOWS icon must be a ICO, EXE, or DLL file. It may be followed by a comma and icon index value, like: \'C:\\file.exe,0\'');
      }

      if (!fs.existsSync(iconPath)) {
        helpers.throwError(options, 'Optional WINDOWS icon could not be found.');
        delete options.windows.icon;
      } else {
        options.windows.icon = iconPath;
      }
    }

    return options;
  },
  validateOSXFilePath: function (options) {
    if (!options.osx) {
      return options;
    }
    if (!options.osx.filePath) {
      delete options.osx;
      return options;
    }

    if (options.osx.filePath) {
      options.osx.filePath = helpers.resolveTilde(options.osx.filePath);
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
  validateOSXOptions: function (options) {
    options = this.validateOSXFilePath(options);
    if (!options.osx) {
      return options;
    }

    if (typeof(options.osx.overwrite) !== 'boolean') {
      options.osx.overwrite = false;
    }

    options = this.validateOutputPath(options, 'osx');

    return options;
  }
};

module.exports = validation;
