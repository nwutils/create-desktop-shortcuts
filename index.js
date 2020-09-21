'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;

const library = {
  // HELPERS
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
  },

  // VALIDATION
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
      this.throwError(options, 'Optional customLogger must be a type of function.');
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
        options[operatingSystem].outputPath = this.resolveWindowsEnvironmentVariables(options[operatingSystem].outputPath);
      } else {
        options[operatingSystem].outputPath = this.resolveTilde(options[operatingSystem].outputPath);
      }
      if (
        !fs.existsSync(options[operatingSystem].outputPath) ||
        !fs.lstatSync(options[operatingSystem].outputPath).isDirectory()
      ) {
        this.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' outputPath must exist and be a folder. Defaulting to desktop.');
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
      this.throwError(options, 'Optional ' + operatingSystem.toUpperCase() + ' ' + key + ' must be a string');
      delete options[operatingSystem][key];
    }
    return options;
  },
  validateLinuxFilePath: function (options) {
    if (!options.linux) {
      return options;
    }

    if (options.linux.filePath) {
      options.linux.filePath = this.resolveTilde(options.linux.filePath);
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
      this.throwError(options, 'LINUX filePath does not exist: ' + options.linux.filePath);
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
      this.throwError(options, 'LINUX filePath directory must exist and be a folder: ' + options.linux.filePath);
      delete options.linux;
    } else if (
      type &&
      type === 'Link' &&
      (
        !options.linux.filePath ||
        typeof(options.linux.filePath) !== 'string'
      )
    ) {
      this.throwError(options, 'LINUX filePath url must exist a string: ' + options.linux.filePath);
      delete options.linux;
    }

    if (options.linux && !options.linux.filePath) {
      this.throwError(options, 'LINUX filePath does not exist: ' + options.linux.filePath);
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
      this.throwError(options, 'Optional LINUX type must be "Application", "Link", or "Directory". Defaulting to "Application".');
      options.linux.type = 'Application';
    }

    if (options.linux.icon) {
      let iconPath = this.resolveTilde(options.linux.icon);

      if (!path.isAbsolute(iconPath)) {
        const outputDirectory = path.parse(options.linux.outputPath).dir;
        process.chdir(outputDirectory);
        iconPath = path.join(outputDirectory, iconPath);
        process.chdir(__dirname);
      }

      if (!iconPath.endsWith('.png') && !iconPath.endsWith('.icns')) {
        this.throwError(options, 'Optional LINUX icon should probably be a PNG file.');
      }

      if (!fs.existsSync(iconPath)) {
        this.throwError(options, 'Optional LINUX icon could not be found.');
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
      options.windows.filePath = this.resolveWindowsEnvironmentVariables(options.windows.filePath);
    }

    if (
      !options.windows.filePath ||
      typeof(options.windows.filePath) !== 'string' ||
      !fs.existsSync(options.windows.filePath)
    ) {
      this.throwError(options, 'WINDOWS filePath does not exist: ' + options.windows.filePath);
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
      this.throwError(options, 'Optional WINDOWS windowMode must be "normal", "maximized", or "minimized". Defaulting to "normal".');
      delete options.windows.windowMode;
    }
    if (!options.windows.windowMode) {
      options.windows.windowMode = 'normal';
    }

    if (options.windows.icon) {
      let iconPath = this.resolveWindowsEnvironmentVariables(options.windows.icon);

      if (!path.isAbsolute(iconPath)) {
        const outputDirectory = path.parse(options.widnows.outputPath).dir;
        process.chdir(outputDirectory);
        iconPath = path.join(outputDirectory, iconPath);
        process.chdir(__dirname);
      }

      // anything, then either '.exe', '.ico', or '.dll', maybe ',12'.
      let iconPattern = /^.*(?:\.exe|\.ico|\.dll)(?:,\d*)?$/m;
      if (!RegExp(iconPattern).test(iconPath)) {
        this.throwError(options, 'Optional WINDOWS icon must be a ICO, EXE, or DLL file. It may be followed by a comma and icon index value, like: \'C:\\file.exe,0\'');
      }

      if (!fs.existsSync(iconPath)) {
        this.throwError(options, 'Optional WINDOWS icon could not be found.');
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
      options.osx.filePath = this.resolveTilde(options.osx.filePath);
    }

    if (
      !options.osx.filePath ||
      typeof(options.osx.filePath) !== 'string' ||
      !fs.existsSync(options.osx.filePath)
    ) {
      this.throwError(options, 'OSX filePath does not exist: ' + options.osx.filePath);
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
  },

  // LINUX
  generateLinuxFileData: function (options) {
    // Set defaults
    let type = 'Type=Application';
    let terminal = 'Terminal=false';
    let exec = '';
    let name = 'Name=' + path.parse(options.linux.filePath).name;
    let comment = '';
    let icon = '';

    // Replace defaults if value passed in
    if (options.linux.type) {
      type = 'Type=' + options.linux.type;
    }
    if (options.linux.terminal) {
      terminal = 'Terminal=' + options.linux.terminal;
    }
    if (options.linux.filePath) {
      exec = 'Exec=' + options.linux.filePath;
    }
    if (options.linux.name) {
      name = 'Name=' + options.linux.name;
    }
    if (options.linux.comment) {
      comment = 'comment=' + options.linux.comment;
    }
    if (options.linux.icon) {
      icon = 'Icon=' + options.linux.icon;
    }

    // File format details:
    // https://wiki.archlinux.org/index.php/Desktop_entries
    const fileContents = [
      '#!/user/bin/env xdg-open',
      '[Desktop Entry]',
      'Version=1.0',
      type,
      terminal,
      exec,
      name,
      comment,
      icon
    ].filter(Boolean).join('\n');

    return fileContents;
  },
  makeLinuxShortcut: function (options) {
    const fileContents = this.generateLinuxFileData(options);

    let success = true;

    try {
      fs.writeFileSync(options.linux.outputPath, fileContents);
    } catch (error) {
      success = false;
      this.throwError(
        options,
        'ERROR: Could not create LINUX shortcut.\n' +
        'PATH: ' + options.linux.outputPath + '\n' +
        'DATA:\n' + fileContents,
        error
      );
    }

    if (success && options.linux.chmod) {
      try {
        fs.chmodSync(options.linux.outputPath, '755');
      } catch (error) {
        success = false;
        this.throwError(options, 'ERROR attempting to change permisions of ' + options.linux.outputPath, error);
      }
    }

    return success;
  },

  // WINDOWS
  makeWindowsShortcut: function (options) {
    const vbsScript = path.join(__dirname, 'windows.vbs');
    const filePathName = path.parse(options.windows.filePath).name;

    let success = true;

    const windowModes = {
      normal: 1,
      maximized: 3,
      minimized: 7
    };

    let outputPath = options.windows.outputPath;
    let filePath = options.windows.filePath;
    let args = options.windows.arguments || '';
    let comment = options.windows.comment || filePathName;
    let cwd = '';
    let icon = options.windows.icon || options.windows.filePath + ',0';
    let windowMode = windowModes[options.windows.windowMode] || 1;
    let hotkey = options.windows.hotkey || '';

    let wscriptArguments = [
      vbsScript,
      // '/NoLogo',  // Apparently this stops it from displaying a logo in the console, even though I haven't actually ever seen one
      // '/B',  // silent mode, but doesn't actually stop dialog alert windows from popping up on errors
      outputPath,
      filePath,
      args,
      comment,
      cwd,
      icon,
      windowMode,
      hotkey
    ];

    try {
      spawn('wscript', wscriptArguments);
    } catch (error) {
      success = false;
      this.throwError(
        options,
        'ERROR: Could not create WINDOWS shortcut.\n' +
        'TARGET: ' + options.windows.filePath + '\n' +
        'PATH: ' + options.windows.outputPath + '\n',
        error
      );
    }

    return success;
  },

  // OSX
  makeOSXShortcut: function (options) {
    let success = true;

    let overwrite = '';
    if (options.osx.overwrite) {
      overwrite = '-f';
    }

    if (options.osx.overwrite || (!options.osx.overwrite && !fs.existsSync(options.osx.outputPath))) {
      let command = [
        'ln',
        overwrite,
        '-s',
        '"' + options.osx.filePath + '"',
        '"' + options.osx.outputPath + '"'
      ].filter(Boolean).join(' ');

      try {
        // ln -s "/Applications/Sublime Text.app" "/Users/owner/Desktop/Sublime Text"
        exec(command);
      } catch (error) {
        success = false;
        this.throwError(
          options,
          'ERROR: Could not create OSX shortcut.\n' +
          'TARGET: ' + options.osx.filePath + '\n' +
          'PATH: ' + options.osx.outputPath + '\n',
          error
        );
      }
    } else {
      this.throwError(options, 'Could not create OSX shortcut because matching outputPath already exists and overwrite is false.');
    }

    return success;
  },

  // RUN
  runCorrectOSs: function (options) {
    if (!options.windows && !options.linux && !options.osx) {
      this.throwError(options, 'No shortcuts were created due to lack of accurate details passed in to options object', options);
      return false;
    } else if (options.onlyCurrentOS) {
      if (process.platform === 'win32' && options.windows) {
        return this.makeWindowsShortcut(options);
      }
      if (process.platform === 'linux' && options.linux) {
        return this.makeLinuxShortcut(options);
      }
      if (process.platform === 'darwin' && options.osx) {
        return this.makeOSXShortcut(options);
      }
    } else {
      let windowsSuccess = true;
      let linuxSuccess = true;
      let osxSuccess = true;

      if (options.windows) {
        windowsSuccess = this.makeWindowsShortcut(options);
      }
      if (options.linux) {
        linuxSuccess = this.makeLinuxShortcut(options);
      }
      if (options.osx) {
        osxSuccess = this.makeOSXShortcut(options);
      }

      return windowsSuccess && linuxSuccess && osxSuccess;
    }
  }
};

/**
 * Creates OS based shortcuts for files, folders, and applications.
 *
 * @param  {object}  options Options object for each OS
 * @return {boolean}         true = success, false = failed to create the icon or set its permissions (Linux)
 */
function createDesktopShortcut (options) {
  options = options || {};
  options = library.validateOptions(options);
  let success = library.runCorrectOSs(options);
  return success;
}

module.exports = createDesktopShortcut;
