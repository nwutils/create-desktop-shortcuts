const fs = require('fs');
jest.mock('fs');
jest.mock('os');
const processPlatform = process.platform;

const validation = require('@/validation.js');

const testHelpers = require('@@/testHelpers.js');

describe('Validation', () => {
  describe('validateOptions', () => {
    const defaults = {
      onlyCurrentOS: true,
      verbose: true
    };
    const customLogger = jest.fn();

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

    test('Delete windows and linux', () => {
      testHelpers.mockPlatform('darwin');

      fs.existsSync.mockReturnValue(true);

      const options = {
        customLogger,
        windows: { filePath: 'C:\\file.ext' },
        linux: { filePath: '~/file.ext' },
        osx: { filePath: '~/file.ext' }
      };

      const results = validation.validateOptions(options);
      results.osx.outputPath = testHelpers.slasher(results.osx.outputPath);

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
  })
});
