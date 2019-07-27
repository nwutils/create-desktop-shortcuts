const fs = require('fs');
const path = require('path');

const library = {
  validateOptions: function (options) {
    if (typeof(options.async) !== 'boolean') {
      options.async = false;
    }
    if (typeof(options.onlyCurrentOS) !== 'boolean') {
      options.onlyCurrentOS = true;
    }
    if (options.linux) {
      if (
        !options.linux.filepath ||
        typeof(options.linux.filepath) !== 'string' ||
        !fs.existsSync(options.linux.filepath)
      ) {
        console.error('Linux file path does not exist: ' + options.linux.filepath);
        delete options.linux;
      }
    }
    return options;
  },
  generateLinuxFileData: function (options) {
    // Set defaults
    let type = 'Type=Application';
    let terminal = 'Terminal=false';
    let exec = '';
    let name = 'Name=' + path.parse(options.linux.filepath).name;
    let comment = '';
    let icon = '';

    // Replace defaults if value passed in
    if (options.linux.type) {
      type = 'Type=' + options.linux.type;
    }
    if (options.linux.terminal) {
      terminal = 'Terminal=' + options.linux.terminal;
    }
    if (options.linux.filepath) {
      exec = 'Exec=' + options.linux.filepath;
    }
    if (options.linux.name) {
      name = 'Name=' + options.linux.name;
    }
    if (options.linux.comment) {
      comment = 'comment=' + options.linux.comment;
    }
    if (options.linux.filepath) {
      icon = 'Icon=' + options.linux.filepath;
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
    var fileContents = generateLinuxFileData(options);
    // todo: save file to location
    if (options.chmod) {
      var command = 'chmod +x ~/Desktop/Example.desktop';
      // todo: run command
    }
  },
  makeWindowsShortcut: function (options) {
    // todo
    return true;
  },
  makeOSXShortcut: function (options) {
    // todo
    return true;
  },
  runCorrectOSs: function (options) {
    // todo: async?
    if (options.onlyCurrentOS) {
      if (process.platform === 'win32' && options.win) {
        this.makeWindowsShortcut(options);
      }
      if (process.platform === 'linux' && options.linux) {
        this.makeLinuxShortcut(options);
      }
      if (process.platform === 'darwin' && options.osx) {
        this.makeOSXShortcut(options);
      }
    } else {
      if (options.win) {
        this.makeWindowsShortcut(options);
      }
      if (options.linux) {
        this.makeLinuxShortcut(options);
      }
      if (options.osx) {
        this.makeOSXShortcut(options);
      }
    }
  }
};

function createDesktopShortcut (options) {
  options = library.validateOptions(options);
  library.runCorrectOSs(options);
}

module.exports = createDesktopShortcut;
