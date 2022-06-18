/**
 * @file    Tests the library's core functionality, to ensure 100% coverage.
 * @author  TheJaredWilcurt
 */

jest.mock('child_process');
jest.mock('fs');
jest.mock('path');
jest.mock('os');

const fs = require('fs');
const childProcess = require('child_process');

const library = require('@/library.js');
const validation = require('@/validation.js');
const testHelpers = require('@@/testHelpers.js');

const defaults = testHelpers.defaults;
const mockfs = testHelpers.mockfs;

let options;
let customLogger;

describe('library', () => {
  beforeEach(() => {
    customLogger = jest.fn();
    options = {
      customLogger
    };
    mockfs();
  });

  afterEach(() => {
    testHelpers.restoreMockFs();
  });

  describe('generateLinuxFileData', () => {
    beforeEach(() => {
      options = {
        linux: {
          ...defaults,
          customLogger,
          filePath: '/home/DUMMY/file.ext'
        }
      };
    });

    test('Empty options', () => {
      expect(library.generateLinuxFileData({}))
        .toEqual('');
    });

    test('Empty linux options', () => {
      options.linux = {};

      expect(library.generateLinuxFileData(options))
        .toEqual('');
    });

    test('File path', () => {
      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/file.ext"',
          'Name=file'
        ].join('\n'));
    });

    test('Terminal', () => {
      options.linux.terminal = true;

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=true',
          'Exec="/home/DUMMY/file.ext"',
          'Name=file'
        ].join('\n'));
    });

    test('Type', () => {
      options.linux.type = 'Directory';
      options.linux.filePath = '/home/DUMMY';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Directory',
          'Terminal=false',
          'Exec="/home/DUMMY"',
          'Name=DUMMY'
        ].join('\n'));
    });

    test('Name', () => {
      options.linux.name = 'Test';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/file.ext"',
          'Name=Test'
        ].join('\n'));
    });

    test('Comment', () => {
      options.linux.comment = 'Test';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/file.ext"',
          'Name=file',
          'comment=Test'
        ].join('\n'));
    });

    test('Icon', () => {
      options.linux.icon = '/home/DUMMY/icon.png';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/file.ext"',
          'Name=file',
          'Icon=/home/DUMMY/icon.png'
        ].join('\n'));
    });

    test('Arguments', () => {
      options.linux.arguments = '-f --version';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/file.ext" -f --version',
          'Name=file'
        ].join('\n'));
    });

    test('Arguments with file path space', () => {
      options.linux.filePath = '/home/DUMMY/foo bar/file.ext';
      options.linux.arguments = '-f --version';

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Application',
          'Terminal=false',
          'Exec="/home/DUMMY/foo bar/file.ext" -f --version',
          'Name=file'
        ].join('\n'));
    });
  });

  describe('makeLinuxShortcut', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('linux');
      options.linux = {
        filePath: '/home/DUMMY/file.ext'
      };
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);
    });

    test('Basic instructions', () => {
      expect(library.makeLinuxShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .toHaveBeenLastCalledWith('/home/DUMMY/Desktop/file.desktop', '755');

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          '/home/DUMMY/Desktop/file.desktop',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });

    test('Error writing file', () => {
      options.linux.outputPath = 'Throw Error';

      expect(library.makeLinuxShortcut(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith(
          [
            'ERROR: Could not create LINUX shortcut.',
            'PATH: Throw Error',
            'DATA:',
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n'),
          'Successfully errored'
        );

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          'Throw Error',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });

    test('Error setting permissions', () => {
      options.linux.outputPath = 'Throw chmod';

      expect(library.makeLinuxShortcut(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith('ERROR attempting to change permisions of Throw chmod', 'Successfully errored');

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .toHaveBeenLastCalledWith('Throw chmod', '755');

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          'Throw chmod',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });
  });

  describe('makeWindowsShortcut', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('win32');
      options.windows = {
        filePath: 'C:\\file.ext'
      };
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);
    });

    test('Basic instructions', () => {
      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );
    });

    test('Use window mode default', () => {
      delete options.windows.windowMode;

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );
    });

    test('Icon', () => {
      options.windows.icon = 'C:/Users/DUMMY/icon.ico';

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/Users/DUMMY/icon.ico',
            1,
            ''
          ]
        );
    });

    test('No icon', () => {
      options.windows.filePath = 'C:/Users/DUMMY/icon.dll';
      delete options.windows.icon;

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/Users/DUMMY/icon.dll',
            '',
            '',
            '',
            'C:/Users/DUMMY/icon.dll,0',
            1,
            ''
          ]
        );
    });

    test('Windows arguments', () => {
      options.windows.arguments = '--force';

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '--force',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );
    });

    test('Windows arguments contains double quotes', () => {
      options.windows.arguments = '-m "Some text"';

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '-m __DOUBLEQUOTE__Some text__DOUBLEQUOTE__',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );
    });

    test('Windows comment contains double quotes', () => {
      options.windows.comment = 'Look at what "I" made.';

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            'Look at what __DOUBLEQUOTE__I__DOUBLEQUOTE__ made.',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );
    });

    test('Windows hotkey contains double quotes', () => {
      options.windows.hotkey = 'CTRL+SHIFT+"';

      expect(library.makeWindowsShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            'CTRL+SHIFT+__DOUBLEQUOTE__'
          ]
        );
    });

    test('Windows.vbs not found', () => {
      const fsExistsSync = fs.existsSync;
      fs.existsSync = jest.fn(() => {
        return false;
      });

      expect(library.makeWindowsShortcut(options))
        .toEqual(false);

      fs.existsSync = fsExistsSync;

      expect(customLogger)
        .toHaveBeenCalledWith('Could not locate required "windows.vbs" file.', undefined);

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();
    });

    test('Catch error', () => {
      options.windows.filePath = 'Throw Error';

      expect(library.makeWindowsShortcut(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenCalledWith(
          'ERROR: Could not create WINDOWS shortcut.' + '\n' +
          'TARGET: ' + options.windows.filePath + '\n' +
          'PATH: ' + options.windows.outputPath + '\n',
          'Successfully errored'
        );

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'Throw Error',
            '',
            '',
            '',
            'Throw Error',
            1,
            ''
          ]
        );
    });
  });

  describe('makeOSXShortcut', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('darwin');
      options.osx = {
        filePath: '/home/DUMMY/file.ext'
      };
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);
    });

    test('Basic instructions', () => {
      expect(library.makeOSXShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -s "/home/DUMMY/file.ext" "/home/DUMMY/Desktop/file"');

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Overwrite', () => {
      options.osx.overwrite = true;

      expect(library.makeOSXShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -f -s "/home/DUMMY/file.ext" "/home/DUMMY/Desktop/file"');

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('File exists', () => {
      options.osx.outputPath = '/home/DUMMY/file.ext';

      expect(library.makeOSXShortcut(options))
        .toEqual(true);

      expect(customLogger)
        .toHaveBeenLastCalledWith('Could not create OSX shortcut because matching outputPath already exists and overwrite is false.', undefined);

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Throw Error', () => {
      options.osx.filePath = 'Throw Error';

      expect(library.makeOSXShortcut(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith(
          'ERROR: Could not create OSX shortcut.\n' +
          'TARGET: Throw Error\n' +
          'PATH: /home/DUMMY/Desktop/file\n',
          'Successfully errored'
        );

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -s "Throw Error" "/home/DUMMY/Desktop/file"');

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });
  });

  describe('runCorrectOSs', () => {
    beforeEach(() => {
      options.windows = { filePath: 'C:\\file.ext' };
      options.linux = { filePath: '/home/DUMMY/file.ext' };
      options.osx = { filePath: '/home/DUMMY/file.ext' };
    });

    test('No OS', () => {
      testHelpers.mockPlatform('linux');
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);
      delete options.windows;
      delete options.linux;
      delete options.osx;

      expect(library.runCorrectOSs(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith('No shortcuts were created due to lack of accurate details passed in to options object', options);

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Windows only', () => {
      testHelpers.mockPlatform('win32');
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            'C:/Users/DUMMY/Desktop/file.lnk',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Linux only', () => {
      testHelpers.mockPlatform('linux');
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .toHaveBeenLastCalledWith('/home/DUMMY/Desktop/file.desktop', '755');

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          '/home/DUMMY/Desktop/file.desktop',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });

    test('OSX only', () => {
      testHelpers.mockPlatform('darwin');
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -s "/home/DUMMY/file.ext" "/home/DUMMY/Desktop/file"');

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Unsupported platform', () => {
      testHelpers.mockPlatform('kitten');
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);
      options.windows = {};

      expect(library.runCorrectOSs(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith('Unsupported platform. This library only supports process.platform of "win32", "linux" and "darwin".', options);

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Every OS', () => {
      testHelpers.mockPlatform('linux');
      options.onlyCurrentOS = false;
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -s "/home/DUMMY/file.ext" "/home/DUMMY/Desktop/file.desktop"');

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            '/home/DUMMY/Desktop/file.desktop',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );

      expect(fs.chmodSync)
        .toHaveBeenLastCalledWith('/home/DUMMY/Desktop/file.desktop', '755');

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          '/home/DUMMY/Desktop/file.desktop',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });

    test('Every OS except linux', () => {
      testHelpers.mockPlatform('linux');
      delete options.linux;
      options.onlyCurrentOS = false;
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .toHaveBeenLastCalledWith('ln -s "/home/DUMMY/file.ext" "/home/DUMMY/Desktop/file.desktop"');

      expect(childProcess.spawnSync)
        .toHaveBeenLastCalledWith(
          'wscript',
          [
            library.produceWindowsVBSPath(),
            '/home/DUMMY/Desktop/file.desktop',
            'C:/file.ext',
            '',
            '',
            '',
            'C:/file.ext',
            1,
            ''
          ]
        );

      expect(fs.chmodSync)
        .not.toHaveBeenCalled();

      expect(fs.writeFileSync)
        .not.toHaveBeenCalled();
    });

    test('Every OS except windows and osx', () => {
      testHelpers.mockPlatform('linux');
      delete options.windows;
      delete options.osx;
      options.onlyCurrentOS = false;
      options = validation.validateOptions(options);
      options = testHelpers.optionsSlasher(options);

      expect(library.runCorrectOSs(options))
        .toEqual(true);

      expect(customLogger)
        .not.toHaveBeenCalled();

      expect(childProcess.execSync)
        .not.toHaveBeenCalled();

      expect(childProcess.spawnSync)
        .not.toHaveBeenCalled();

      expect(fs.chmodSync)
        .toHaveBeenLastCalledWith('/home/DUMMY/Desktop/file.desktop', '755');

      expect(fs.writeFileSync)
        .toHaveBeenLastCalledWith(
          '/home/DUMMY/Desktop/file.desktop',
          [
            '#!/user/bin/env xdg-open',
            '[Desktop Entry]',
            'Version=1.0',
            'Type=Application',
            'Terminal=false',
            'Exec="/home/DUMMY/file.ext"',
            'Name=file'
          ].join('\n')
        );
    });
  });
});
