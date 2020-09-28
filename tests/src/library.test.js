jest.mock('child_process');
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
      customLogger,
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
          'Exec=/home/DUMMY/file.ext',
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
          'Exec=/home/DUMMY/file.ext',
          'Name=file'
        ].join('\n'));
    });

    test('Type', () => {
      options.linux.type = 'Directory';
      options.linux.filePath = '/home/DUMMY'

      expect(library.generateLinuxFileData(options))
        .toEqual([
          '#!/user/bin/env xdg-open',
          '[Desktop Entry]',
          'Version=1.0',
          'Type=Directory',
          'Terminal=false',
          'Exec=/home/DUMMY',
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
          'Exec=/home/DUMMY/file.ext',
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
          'Exec=/home/DUMMY/file.ext',
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
          'Exec=/home/DUMMY/file.ext',
          'Name=file',
          'Icon=/home/DUMMY/icon.png'
        ].join('\n'));
    });
  });

  describe('makeLinuxShortcut', () => {
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
            'file',
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
            'file',
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
            'file',
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
            'icon',
            '',
            'C:/Users/DUMMY/icon.dll,0',
            1,
            ''
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
            'Throw Error',
            '',
            'Throw Error',
            1,
            ''
          ]
        );
    });
  });

  describe('makeOSXShortcut', () => {
  });

  describe('runCorrectOSs', () => {
  });
});
