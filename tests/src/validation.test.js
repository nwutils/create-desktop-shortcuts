/**
 * @file    Tests the library API validation scripts, to ensure 100% coverage.
 * @author  TheJaredWilcurt
 */

jest.mock('child_process');
jest.mock('path');
jest.mock('os');

const os = require('os');

const validation = require('@/validation.js');
const testHelpers = require('@@/testHelpers.js');

const defaults = testHelpers.defaults;
const mockfs = testHelpers.mockfs;

let options;
let customLogger;

describe('Validation', () => {
  beforeEach(() => {
    customLogger = jest.fn();
  });

  afterEach(() => {
    testHelpers.restoreMockFs();
    testHelpers.restoreEnvPATH();
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
      options = {
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

    test('Defaults', () => {
      const consoleError = console.error;
      console.error = jest.fn();

      options = {
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

        options = {
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

        options = {
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

        options = {
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
      beforeEach(() => {
        testHelpers.mockPlatform('win32');
        testHelpers.mockEnvPATH();
        mockfs();
        process.env.KITTEN = 'folder';
        options = {
          ...defaults,
          customLogger,
          windows: {
            filePath: 'C:\\file.ext'
          }
        };
      });

      test('Resolve outputPath', () => {
        options.windows.outputPath = 'C:\\%KITTEN%';

        let results = validation.validateOutputPath(options, 'windows');
        results = testHelpers.optionsSlasher(results);

        expect(customLogger)
          .not.toHaveBeenCalled();

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/folder/file.lnk'
            }
          });
      });

      test('Defaults to using powershell if platform supports it', () => {
        testHelpers.mockOsType();

        let results = validation.validateOutputPath(options, 'windows');
        results = testHelpers.optionsSlasher(results);

        expect(customLogger)
          .not.toHaveBeenCalled();

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Powershell-derived-desktop/file.lnk'
            }
          });
      });

      test('Powershell returns undefined', () => {
        global.breakPowershell = true;

        let results = validation.validateOutputPath(options, 'windows');
        results = testHelpers.optionsSlasher(results);

        expect(customLogger)
          .not.toHaveBeenCalled();

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk'
            }
          });

        global.breakPowershell = false;
      });

      test('Output and powershell does not exist', () => {
        testHelpers.restoreMockFs();

        const Windows = {
          'C:\\file.ext': 'text',
          'C:\\Users\\DUMMY\\Desktop': {}
        };
        let WindowsInLinuxCI = {
          'C:/file.ext': 'text',
          'C:/Users/DUMMY/Desktop': {}
        };
        const Linux = {
          '/home/DUMMY': {
            'file.ext': 'text',
            Desktop: {}
          }
        };

        if (os.platform() === 'win32') {
          WindowsInLinuxCI = {};
        }

        testHelpers.mockfsByHand({
          ...Windows,
          ...WindowsInLinuxCI,
          ...Linux
        });

        options.windows.outputPath = 'C:\\DoesNotExist';

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
      beforeEach(() => {
        testHelpers.mockPlatform('linux');
        mockfs();
        options = {
          ...defaults,
          customLogger,
          linux: {}
        };
      });

      test('Resolve outputPath tilde', () => {
        options.linux.filePath = '/home/DUMMY/file.ext';
        options.linux.outputPath = '~/folder';

        let results = validation.validateOutputPath(options, 'linux');
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/folder/file.desktop'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Root file name', () => {
        options.linux.filePath = '/';
        options.linux.outputPath = '/home/DUMMY/folder';

        let results = validation.validateOutputPath(options, 'linux');
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/',
              outputPath: '/home/DUMMY/folder/Root.desktop'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });
    });
  });

  describe('validateOptionalString', () => {
    test('Empty options', () => {
      expect(validation.validateOptionalString({}))
        .toEqual({});
    });

    test('Valid string', () => {
      options = {
        windows: {
          name: 'text'
        }
      };

      expect(validation.validateOptionalString(options, 'windows', 'name'))
        .toEqual(options);
    });

    test('Invalid string', () => {
      options = {
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

  describe('resolvePATH', () => {
    beforeEach(() => {
      if (process.platform !== 'win32') {
        testHelpers.mockPlatform('linux');
      }
      testHelpers.mockEnvPATH();
      mockfs();
    });

    test('Undefined', () => {
      expect(validation.resolvePATH(undefined))
        .toEqual(undefined);
    });

    test('Resolves PATH', async () => {
      expect(['/home/DUMMY/app.exe', 'C:\\Program Files\\DUMMY\\app.exe'].includes(validation.resolvePATH('app.exe')))
        .toEqual(true);
    });
  });

  describe('defaultBoolean', () => {
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
    beforeEach(() => {
      testHelpers.mockPlatform('linux');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        linux: {
          filePath: '/home/DUMMY/file.ext'
        }
      };
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
        options.linux.type = 'Application';

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
          .toHaveBeenCalledWith('LINUX filePath (with type of "Application") must exist and cannot be a folder: undefined', undefined);
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

      test('Default to link based on file path', () => {
        options.linux.filePath = 'https://xpda.net';

        expect(validation.validateLinuxType(options))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: 'https://xpda.net',
              type: 'Link'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Default to directory based on file path', () => {
        options.linux.filePath = '/home/DUMMY/';

        expect(validation.validateLinuxType(options))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/',
              type: 'Directory'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });
    });

    describe('validateLinuxIcon', () => {
      beforeEach(() => {
        options.linux.outputPath = '/home/DUMMY/Desktop';
      });

      test('Empty options', () => {
        expect(validation.validateLinuxIcon({}))
          .toEqual({});
      });

      test('Empty string icon', () => {
        options.linux.icon = '';

        expect(testHelpers.optionsSlasher(validation.validateLinuxIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('PNG icon', () => {
        options.linux.icon = '/home/DUMMY/icon.png';

        expect(testHelpers.optionsSlasher(validation.validateLinuxIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop',
              icon: '/home/DUMMY/icon.png'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('ICNS icon', () => {
        options.linux.icon = '/home/DUMMY/icon.icns';

        expect(testHelpers.optionsSlasher(validation.validateLinuxIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop',
              icon: '/home/DUMMY/icon.icns'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('BPM icon', () => {
        options.linux.icon = '/home/DUMMY/file.bmp';

        expect(testHelpers.optionsSlasher(validation.validateLinuxIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop'
            }
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional LINUX icon should probably be a PNG file.', undefined);
      });

      test('Relative path', () => {
        options.linux.icon = '../icon.png';

        expect(testHelpers.optionsSlasher(validation.validateLinuxIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            linux: {
              filePath: '/home/DUMMY/file.ext',
              outputPath: '/home/DUMMY/Desktop/file.desktop',
              icon: '/home/DUMMY/icon.png'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
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
    beforeEach(() => {
      testHelpers.mockPlatform('win32');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        windows: {
          filePath: 'C:\\file.ext',
          outputPath: 'C:\\Users\\DUMMY\\Desktop'
        }
      };
    });

    describe('validateWindowsFilePath', () => {
      test('Empty options', () => {
        expect(validation.validateWindowsFilePath({}))
          .toEqual({});
      });

      test('No filePath', () => {
        delete options.windows.filePath;

        expect(validation.validateWindowsFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('WINDOWS filePath does not exist: undefined', undefined);
      });

      test('File does not exist', () => {
        options.windows.filePath = 'C:\\DoesNotExist.ext';

        expect(testHelpers.optionsSlasher(validation.validateWindowsFilePath(options)))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('WINDOWS filePath does not exist: C:\\DoesNotExist.ext', undefined);
      });
    });

    describe('validateWindowsWindowMode', () => {
      test('Empty options', () => {
        expect(validation.validateWindowsWindowMode({}))
          .toEqual({});
      });

      test('Invalid mode', () => {
        options.windows.windowMode = 'kitten';

        expect(testHelpers.optionsSlasher(validation.validateWindowsWindowMode(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop',
              windowMode: 'normal'
            }
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS windowMode must be "normal", "maximized", or "minimized". Defaulting to "normal".', undefined);
      });
    });

    describe('validateWindowsIcon', () => {
      beforeEach(() => {
        options.windows.icon = 'C:\\Users\\DUMMY\\icon.ico';
      });

      test('Empty options', () => {
        expect(validation.validateWindowsIcon({}))
          .toEqual({});
      });

      test('Icon.ico', () => {
        expect(testHelpers.optionsSlasher(validation.validateWindowsIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk',
              icon: 'C:/Users/DUMMY/icon.ico'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Icon.exe,0', () => {
        options.windows.icon = 'C:\\Users\\DUMMY\\icon.exe,0';

        expect(testHelpers.optionsSlasher(validation.validateWindowsIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk',
              icon: 'C:/Users/DUMMY/icon.exe,0'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Icon.dll,0', () => {
        options.windows.icon = 'C:\\Users\\DUMMY\\icon.dll,0';

        expect(testHelpers.optionsSlasher(validation.validateWindowsIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk',
              icon: 'C:/Users/DUMMY/icon.dll,0'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Icon.png', () => {
        options.windows.icon = 'C:\\Users\\DUMMY\\icon.png';

        expect(testHelpers.optionsSlasher(validation.validateWindowsIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk'
            }
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS icon must be a ICO, EXE, or DLL file. ' +
            'It may be followed by a comma and icon index value, like: "C:\\file.exe,0"', undefined);
      });

      test('DoesNotExist.ico', () => {
        options.windows.icon = 'C:\\Users\\DUMMY\\DoesNotExist.ico';

        expect(testHelpers.optionsSlasher(validation.validateWindowsIcon(options)))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk'
            }
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS icon could not be found.', undefined);
      });

      test('Relative path', () => {
        options.windows.icon = '..\\icon.ico';

        let results = validation.validateWindowsIcon(options);
        results = testHelpers.optionsSlasher(results);

        expect(results)
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              filePath: 'C:/file.ext',
              outputPath: 'C:/Users/DUMMY/Desktop/file.lnk',
              icon: 'C:/Users/DUMMY/icon.ico'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });
    });

    describe('validateWindowsComment', () => {
      beforeEach(() => {
        delete options.windows.filePath;
        delete options.windows.outputPath;
      });

      test('Empty object', () => {
        expect(validation.validateWindowsComment({}))
          .toEqual({});
      });

      test('Comment', () => {
        options.windows.comment = 'comment';

        expect(validation.validateWindowsComment(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              comment: 'comment'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Description', () => {
        options.windows.description = 'description';

        expect(validation.validateWindowsComment(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              comment: 'description'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Comment and description', () => {
        options.windows.comment = 'comment';
        options.windows.description = 'description';

        expect(validation.validateWindowsComment(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              comment: 'comment'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });
    });

    describe('validateWindowsWorkingDirectory', () => {
      beforeEach(() => {
        delete options.windows.filePath;
        delete options.windows.outputPath;
      });

      test('Empty object', () => {
        expect(validation.validateWindowsWorkingDirectory({}))
          .toEqual({});
      });

      test('Empty windows object', () => {
        expect(validation.validateWindowsWorkingDirectory(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {}
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
      });

      test('Path does not exist', () => {
        options.windows.workingDirectory = 'C:\\fake\\path';

        expect(validation.validateWindowsWorkingDirectory(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {}
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS workingDirectory path does not exist: C:\\fake\\path', undefined);
      });

      test('Path is not a directory', () => {
        options.windows.workingDirectory = 'C:\\file.ext';

        expect(validation.validateWindowsWorkingDirectory(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {}
          });

        expect(customLogger)
          .toHaveBeenCalledWith('Optional WINDOWS workingDirectory path must be a directory: C:\\file.ext', undefined);
      });

      test('Working directory exists', () => {
        options.windows.workingDirectory = 'C:\\Users\\DUMMY\\Desktop';

        expect(validation.validateWindowsWorkingDirectory(options))
          .toEqual({
            ...defaults,
            customLogger,
            windows: {
              workingDirectory: 'C:\\Users\\DUMMY\\Desktop'
            }
          });

        expect(customLogger)
          .not.toHaveBeenCalled();
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
    beforeEach(() => {
      testHelpers.mockPlatform('darwin');
      mockfs();
      options = {
        ...defaults,
        customLogger,
        osx: {
          filePath: '/home/DUMMY/file.ext'
        }
      };
    });

    describe('validateOSXFilePath', () => {
      test('Empty options', () => {
        expect(validation.validateOSXFilePath({}))
          .toEqual({});
      });

      test('No filePath', () => {
        delete options.osx.filePath;

        expect(validation.validateOSXFilePath(options))
          .toEqual({
            ...defaults,
            customLogger
          });

        expect(customLogger)
          .toHaveBeenCalledWith('OSX filePath does not exist: undefined', undefined);
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
