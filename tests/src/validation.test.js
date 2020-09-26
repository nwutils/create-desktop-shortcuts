const mock = require('mock-fs');

jest.mock('os');

const validation = require('@/validation.js');

const testHelpers = require('@@/testHelpers.js');

const defaults = {
  onlyCurrentOS: true,
  verbose: true
};
let customLogger;
const mockfs = function () {
  mock({
    'C:\\file.ext': 'text',
    'C:\\folder': {},
    '/home/DUMMY': {
      'file.ext': 'text',
      'icon.png': 'text',
      'icon.icns': 'text',
      'icon.bmp': 'text',
      'Desktop': {},
      'folder': {}
    }
  });
}

describe('Validation', () => {
  beforeEach(() => {
    customLogger = jest.fn();
  });

  afterEach(() => {
    mock.restore();
  });

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
        mockfs();

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
        mockfs();

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
        mockfs();

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
      });
    });
  });

  describe('validateOutputPath', () => {
    test('Empty options', () => {
      expect(validation.validateOutputPath({}))
        .toEqual({});
    });

    describe('Windows', () => {
      test('Resolve outputPath', () => {
        testHelpers.mockPlatform('win32');
        mockfs();

        process.env.KITTEN = 'folder';

        const options = {
          windows: {
            filePath: 'C:\\file.ext',
            outputPath: 'C:\\%KITTEN%'
          }
        };

        let results = validation.validateOutputPath(options, 'windows');
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/folder/file.lnk'
            }
          });
      });

      test('Output does not exist', () => {
        testHelpers.mockPlatform('win32');
        mockfs();

        process.env.KITTEN = 'folder';

        const options = {
          ...defaults,
          customLogger,
          windows: {
            filePath: 'C:\\file.ext',
            outputPath: 'C:\\DoesNotExist'
          }
        };

        let results = validation.validateOutputPath(options, 'windows');
        results = testHelpers.optionsSlasher(results);

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS outputPath must exist and be a folder. Defaulting to desktop.', undefined);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk'
            }
          });
      });
    });

    describe('Linux', () => {
      test('Resolve outputPath tilde', () => {
        testHelpers.mockPlatform('linux');
        mockfs();

        const options = {
          linux: {
            filePath: '/home/DUMMY/file.ext',
            outputPath: '~/folder'
          }
        };

        let results = validation.validateOutputPath(options, 'linux');
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/folder/file.desktop'
            }
          });
      });

      test('Root file name', () => {
        testHelpers.mockPlatform('linux');
        mockfs();

        const options = {
          linux: {
            filePath: '/',
            outputPath: '/home/DUMMY/folder'
          }
        };

        let results = validation.validateOutputPath(options, 'linux');
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            linux: {
              filePath: '/',
              outputPath: '/home/DUMMY/folder/Root.desktop'
            }
          });
      });
    });
  });

  describe('validateOptionalString', () => {
    test('Empty options', () => {
      expect(validation.validateOptionalString({}))
        .toEqual({});
    });

    test('Valid string', () => {
      const options = {
        windows: {
          name: 'text'
        }
      };

      expect(validation.validateOptionalString(options, 'windows', 'name'))
        .toEqual(options);
    });

    test('Invalid string', () => {
      const options = {
        ...defaults,
        customLogger,
        windows: {
          name: 3
        }
      };

      expect(validation.validateOptionalString(options, 'windows', 'name'))
        .toEqual(options);

      expect(customLogger)
        .toHaveBeenCalledWith('Optional WINDOWS name must be a string', undefined);
    });
  });

  describe('defaultBoolean', () => {
    let options;
    beforeEach(() => {
      options = {
        ...defaults,
        customLogger,
        linux: {}
      };
    });

    test('Empty options', () => {
      expect(validation.defaultBoolean({}))
        .toEqual({});
    });

    test('Valid false', () => {
      options.linux.chmod = false;

      expect(validation.defaultBoolean(options, 'linux', 'chmod', true))
        .toEqual(options);

      expect(customLogger)
        .not.toHaveBeenCalled();
    });

    test('Valid true', () => {
      options.linux.chmod = true;

      expect(validation.defaultBoolean(options, 'linux', 'chmod', false))
        .toEqual(options);

      expect(customLogger)
        .not.toHaveBeenCalled();
    });

    test('Default when key is empty', () => {
      expect(validation.defaultBoolean(options, 'linux', 'chmod', true))
        .toEqual({
          ...defaults,
          customLogger,
          linux: {
            chmod: true
          }
        });

      expect(customLogger)
        .not.toHaveBeenCalled();
    });

    test('Log when non-boolean', () => {
      options.linux.chmod = 'false';

      expect(validation.defaultBoolean(options, 'linux', 'chmod', true))
        .toEqual({
          ...defaults,
          customLogger,
          linux: {
            chmod: true
          }
        });

      expect(customLogger)
        .toHaveBeenLastCalledWith('Optional LINUX chmod must be a boolean. Defaulting to true', undefined);
    });
  });

  describe('Linux validators', () => {
    let options;

    beforeEach(() => {
      testHelpers.mockPlatform('linux');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        linux: {
          filePath: '/home/DUMMY/file.ext'
        }
      }
    });

    describe('validateLinuxFilePath', () => {
      test('Empty options', () => {
        expect(validation.validateLinuxFilePath({}))
          .toEqual({});
      });

      test('No filepath', () => {
        options.linux.filePath = undefined;

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath (with type of "Application") must exist and cannot be a folder: undefined', undefined);
      });

      test('No type', () => {
        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              type: 'Application'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('File does not exist', () => {
        options.linux.filePath = '/home/DUMMY/DoesNotExist.ext';

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath (with type of "Application") must exist and cannot be a folder: /home/DUMMY/DoesNotExist.ext', undefined);
      });

      test('Application type cannot be a folder', () => {
        options.linux.filePath = '/home/DUMMY';

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath (with type of "Application") must exist and cannot be a folder: /home/DUMMY', undefined);
      });

      test('Directory type cannot be a file', () => {
        options.linux.filePath = '/home/DUMMY/file.ext';
        options.linux.type = 'Directory';

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath (with type of "Directory") must exist and be a folder: /home/DUMMY/file.ext', undefined);
      });

      test('Link type must be a string', () => {
        options.linux.filePath = undefined;
        options.linux.type = 'Link';

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath url must be a string: undefined', undefined);
      });

      test('Empty Linux object', () => {
        options.linux = {};

        expect(validation.validateLinuxFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('LINUX filePath (with type of \"Application\") must exist and cannot be a folder: undefined', undefined);
      });
    });

    describe('validateLinuxType', () => {
      test('Empty options', () => {
        expect(validation.validateLinuxType({}))
          .toEqual({});
      });

      test('Invalid type', () => {
        options.linux.type = 'kitten';

        expect(validation.validateLinuxType(options))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              type: 'Application'
            }
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional LINUX type must be "Application", "Link", or "Directory". Defaulting to "Application".', undefined);
      });
    });

    describe('validateLinuxIcon', () => {
      beforeEach(() => {
        delete options.linux.filePath;
      });

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
  });

  describe('Windows validators', () => {
    let options;

    beforeEach(() => {
      testHelpers.mockPlatform('win32');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        windows: {
          filePath: 'C:\\file.ext'
        }
      }
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
  });

  describe('OSX validators', () => {
    let options;

    beforeEach(() => {
      testHelpers.mockPlatform('darwin');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        windows: {
          filePath: '/home/DUMMY/file.ext'
        }
      }
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
});
