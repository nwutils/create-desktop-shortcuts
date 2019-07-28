'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const library = {
  // HELPERS
  throwError: function (message) {
    console.error(
      '_________________________\n' +
      'Create-Desktop-Shortcuts:\n' +
      message
    );
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

  // VALIDATION
  validateOptions: function (options) {
    if (typeof(options.onlyCurrentOS) !== 'boolean') {
      options.onlyCurrentOS = true;
    }

    options = this.validateFilePath(options, 'linux');
    options = this.validateFilePath(options, 'windows');
    options = this.validateFilePath(options, 'osx');

    if (options.linux) {
      options = this.validateLinuxOptions(options);
    }
    return options;
  },
  validateFilePath: function (options, operatingSystem) {
    if (options[operatingSystem]) {
      if (options[operatingSystem].filePath) {
        options[operatingSystem].filePath = this.resolveTilde(options[operatingSystem].filePath);
      }

      if (
        !options[operatingSystem].filePath ||
        typeof(options[operatingSystem].filePath) !== 'string' ||
        !fs.existsSync(options[operatingSystem].filePath)
      ) {
        this.throwError(operatingSystem.toUpperCase() + ' file path does not exist: ' + options[operatingSystem].filePath);
        delete options[operatingSystem];
      }
    }

    return options;
  },
  validateOutputPath: function (options, operatingSystem) {
    options = this.validateOptionalString(options, operatingSystem, 'name');

    if (options[operatingSystem].outputPath) {
      options[operatingSystem].outputPath = this.resolveTilde(options[operatingSystem].outputPath);
      if (
        !fs.existsSync(options[operatingSystem].outputPath) ||
        !fs.lstatSync(options[operatingSystem].outputPath).isDirectory()
      ) {
        this.throwError('Optional ' + operatingSystem.toUpperCase() + ' output path must exist and be a folder. Defaulting to desktop.');
        delete options[operatingSystem].outputPath;
      }
    }

    if (!options[operatingSystem].outputPath) {
      options[operatingSystem].outputPath = path.join(os.homedir(), 'Desktop');
    }

    let fileName = options[operatingSystem].name || path.parse(options[operatingSystem].filePath).name;
    let fileExtension = '.desktop';
    if (process.platform === 'win32') {
      fileExtension = '.lnk';
    }

    // 'C:\Users\Bob\Desktop\' + 'My App Name.lnk'
    // '~/Desktop/' + 'My App Name.desktop'
    options[operatingSystem].outputPath = path.join(options[operatingSystem].outputPath, fileName + fileExtension);

    return options;
  },
  validateOptionalString: function (options, operatingSystem, key) {
    if (options[operatingSystem] && options[operatingSystem][key] && typeof(options[operatingSystem][key]) !== 'string') {
      this.throwError('Optional ' + operatingSystem.toUpperCase() + ' ' + key + ' must be a string');
      delete options[operatingSystem][key];
    }
    return options;
  },
  validateLinuxOptions: function (options) {
    // already validated options.linux and options.linux.filepath by this point
    options = this.validateOutputPath(options, 'linux');
    options = this.validateOptionalString(options, 'linux', 'comment');
    options = this.validateOptionalString(options, 'linux', 'type');
    options = this.validateOptionalString(options, 'linux', 'icon');

    if (typeof(options.linux.terminal) !== 'boolean') {
      options.linux.terminal = false;
    }
    if (typeof(options.linux.chmod) !== 'boolean') {
      options.linux.chmod = true;
    }

    if (options.linux.icon) {
      let iconPath = this.resolveTilde(options.linux.icon);

      if (!path.isAbsolute(iconPath)) {
        iconPath = path.join(options.linux.outputPath, iconPath);
      }

      if (!iconPath.endsWith('.png') && !iconPath.endsWith('.icns')) {
        this.throwError('Optional LINUX icon should probably be a PNG file.');
      }

      if (!fs.existsSync(iconPath)) {
        this.throwError('Optional LINUX icon could not be found.');
        delete options.linux.icon;
      } else {
        options.linux.icon = iconPath;
      }
    }

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

    var fileContents = [
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
        'ERROR: Could not create LINUX shortcut.\n' +
        'PATH: ' + options.linux.outputPath + '\n' +
        'DATA:\n' + fileContents
      );
      this.throwError(error);
    }

    if (success && options.linux.chmod) {
      try {
        fs.chmodSync(options.linux.outputPath, '755');
      } catch (error) {
        success = false;
        this.throwError('ERROR attempting to change permisions of ' + options.linux.outputPath);
        this.throwError(error);
      }
    }

    return success;
  },

  // WINDOWS
  makeWindowsShortcut: function (options) {
    // todo
    this.throwError('WINDOWS shortcut creation is not available yet.\n' + JSON.stringify(options, null, 2));
    return false;
  },

  // OSX
  makeOSXShortcut: function (options) {
    // todo
    this.throwError('OSX shortcut creation is not available yet.\n' + JSON.stringify(options, null, 2));
    return false;
  },

  // RUN
  runCorrectOSs: function (options) {
    if (options.onlyCurrentOS) {
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

    if (!options.windows && !options.linux && !options.osx) {
      this.throwError('No shortcuts were created due to lack of accurate details passed in to options object\n' + JSON.stringify(options, null, 2));
      return false;
    }
  }
};

function createDesktopShortcut (options) {
  options = options || {};
  options = library.validateOptions(options);
  let success = library.runCorrectOSs(options);

  console.log('TEMPORARY DEBUGGER');
  console.log(JSON.stringify(options, null, 2));

  return success;
}

module.exports = createDesktopShortcut;
