const mock = require('mock-fs');

jest.mock('os');

const validation = require('@/validation.js');

const testHelpers = require('@@/testHelpers.js');

const defaults = {
  onlyCurrentOS: true,
  verbose: true
};
let customLogger = undefined ||  jest.fn();
const mockfs = function () {
  mock({
    'C:\\file.ext': 'text',
    'C:\\folder': {},
    '/home/DUMMY': {
      'file.ext': 'text',
      'Desktop': {},
      'folder': {}
    }
  });
}

describe('Validation', () => {
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
    test('Empty options', () => {
      expect(validation.defaultBoolean({}))
        .toEqual({});
    });

    test('Valid false', () => {
      const options = {
        ...defaults,
        customLogger,
        linux: {
          chmod: false
        }
      };

      expect(validation.defaultBoolean(options, 'linux', 'chmod', true))
        .toEqual(options);

      expect(customLogger)
        .not.toHaveBeenCalledWith();
    });

    test('Valid true', () => {
      const options = {
        ...defaults,
        customLogger,
        linux: {
          chmod: true
        }
      };

      expect(validation.defaultBoolean(options, 'linux', 'chmod', false))
        .toEqual(options);

      expect(customLogger)
        .not.toHaveBeenCalledWith();
    });

    test('Default when key is empty', () => {
      const options = {
        ...defaults,
        customLogger,
        linux: {
        }
      };

      expect(validation.defaultBoolean(options, 'linux', 'chmod', true))
        .toEqual({
          ...defaults,
          customLogger,
          linux: {
            chmod: true
          }
        });

      expect(customLogger)
        .not.toHaveBeenCalledWith();
    });

    test('Log when non-boolean', () => {
      customLogger = jest.fn();
      const options = {
        ...defaults,
        customLogger,
        linux: {
          chmod: 'false'
        }
      };

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

  describe('validateLinuxFilePath', () => {
    let options;

    beforeEach(() => {
      testHelpers.mockPlatform('linux');
      mockfs();
      customLogger = jest.fn();
      options = {
        ...defaults,
        customLogger,
        linux: {
          filePath: '/home/DUMMY/file.ext'
        }
      }
    });

    test('Empty options', () => {
      expect(validation.validateLinuxFilePath({}))
        .toEqual({});
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
    });

    expect(customLogger)
      .not.toHaveBeenCalled();
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
