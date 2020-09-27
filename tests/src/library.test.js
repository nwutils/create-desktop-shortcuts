const library = require('@/library.js');
const testHelpers = require('@@/testHelpers.js');

const defaults = testHelpers.defaults;
const mockfs = testHelpers.mockfs;

let options;
let customLogger;

describe('library', () => {
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
  });

  describe('makeOSXShortcut', () => {
  });

  describe('runCorrectOSs', () => {
  });
});
