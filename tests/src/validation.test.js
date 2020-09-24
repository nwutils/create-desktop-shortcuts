const fs = require('fs');
jest.mock('fs');
jest.mock('os');

const validation = require('@/validation.js');

const testHelpers = require('@@/testHelpers.js');

const defaults = {
  onlyCurrentOS: true,
  verbose: true
};
const customLogger = jest.fn();

describe('Validation', () => {
  describe('validateOptions', () => {
    test('Empty', () => {
      expect(validation.validateOptions())
        .toEqual(defaults);
    });

    test('Empty object', () => {
      expect(validation.validateOptions({}))
        .toEqual(defaults);
    });

    test('Inverted defaults', () => {
      const options = {
        onlyCurrentOS: false,
        verbose: false,
        customLogger: undefined
      };

      expect(validation.validateOptions(options))
        .toEqual({
          onlyCurrentOS: false,
          verbose: false
        });
    });

    test('Inverted defaults', () => {
      const consoleError = console.error;
      console.error = jest.fn();

      const options = {
        customLogger: 'Not a function'
      };
      const message = [
        '_________________________',
        'Create-Desktop-Shortcuts:',
        'Optional customLogger must be a type of function.'
      ].join('\n');

      expect(validation.validateOptions(options))
        .toEqual(defaults);

      expect(console.error)
        .toHaveBeenCalledWith(message, undefined);

      console.error = consoleError;
    });

    describe('Windows', () => {
      test('Delete osx and linux', () => {
        testHelpers.mockPlatform('win32');

        fs.existsSync.mockReturnValue(true);

        const options = {
          customLogger,
          windows: { filePath: 'C:\\file.ext' },
          linux: { filePath: '~/file.ext' },
          osx: { filePath: '~/file.ext' }
        };

        let results = validation.validateOptions(options);
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk',
              windowMode: 'normal'
            }
          });
      });
    });

    describe('Linux', () => {
      test('Delete windows and osx', () => {
        testHelpers.mockPlatform('linux');

        fs.existsSync.mockReturnValue(true);
        const options = {
          customLogger,
          windows: { filePath: 'C:\\file.ext' },
          linux: { filePath: '~/file.ext', type: 'Link' },
          osx: { filePath: '~/file.ext' }
        };

        let results = validation.validateOptions(options);
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop',
              type: 'Link',
              chmod: true,
              terminal: false
            }
          });
      });
    });

    describe('OSX', () => {
      test('Delete windows and linux', () => {
        testHelpers.mockPlatform('darwin');

        fs.existsSync.mockReturnValue(true);

        const options = {
          customLogger,
          windows: { filePath: 'C:\\file.ext' },
          linux: { filePath: '~/file.ext' },
          osx: { filePath: '~/file.ext' }
        };

        let results = validation.validateOptions(options);
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            osx: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file',
              overwrite: false
            }
          });

        testHelpers.mockPlatform(processPlatform);
      });
    });
  })

  describe('validateOptionalString', () => {
    test('Empty options', () => {
      expect(validation.validateOptionalString({}))
        .toEqual({});
    });
  });

  describe('defaultBoolean', () => {
    test('Empty options', () => {
      expect(validation.defaultBoolean({}))
        .toEqual({});
    });
  });

  describe('validateLinuxFilePath', () => {
    test('Empty options', () => {
      expect(validation.validateLinuxFilePath({}))
        .toEqual({});
    });
  });

  describe('validateLinuxType', () => {
    test('Empty options', () => {
      expect(validation.validateLinuxType({}))
        .toEqual({});
    });
  });

  describe('validateLinuxIcon', () => {
    test('Empty options', () => {
      expect(validation.validateLinuxIcon({}))
        .toEqual({});
    });
  });

  describe('validateLinuxOptions', () => {
    test('Empty options', () => {
      expect(validation.validateLinuxOptions({}))
        .toEqual({});
    });
  });

  describe('validateWindowsFilePath', () => {
    test('Empty options', () => {
      expect(validation.validateWindowsFilePath({}))
        .toEqual({});
    });
  });

  describe('validateWindowsWindowMode', () => {
    test('Empty options', () => {
      expect(validation.validateWindowsWindowMode({}))
        .toEqual({});
    });
  });

  describe('validateWindowsIcon', () => {
    test('Empty options', () => {
      expect(validation.validateWindowsIcon({}))
        .toEqual({});
    });
  });

  describe('validateWindowsOptions', () => {
    test('Empty options', () => {
      expect(validation.validateWindowsOptions({}))
        .toEqual({});
    });
  });

  describe('validateOSXFilePath', () => {
    test('Empty options', () => {
      expect(validation.validateOSXFilePath({}))
        .toEqual({});
    });
  });

  describe('validateOSXOptions', () => {
    test('Empty options', () => {
      expect(validation.validateOSXOptions({}))
        .toEqual({});
    });
  });
});
