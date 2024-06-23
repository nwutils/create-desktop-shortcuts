/**
 * @file    Tests the library helpers, to ensure 100% coverage.
 * @author  TheJaredWilcurt
 */

vi.mock('os');

import process from 'node:process';

import helpers from '../../src/helpers.js';

import testHelpers from '@@/testHelpers.js';

describe('helpers', () => {
  describe('throwError', () => {
    test('Custom logger is called', () => {
      const options = {
        verbose: true,
        customLogger: vi.fn()
      };

      helpers.throwError(options, 'message', 'error');

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', 'error');
    });

    test('Custom logger is not called when verbose is false', () => {
      const options = {
        verbose: false,
        customLogger: vi.fn()
      };

      helpers.throwError(options, 'message', 'error');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Console.error called when verbose true and no custom logger', () => {
      const consoleError = console.error;
      console.error = vi.fn();
      const options = {
        verbose: true
      };

      helpers.throwError(options, 'message', 'error');

      expect(console.error)
        .toHaveBeenCalledWith('_________________________\nCreate-Desktop-Shortcuts:\nmessage', 'error');

      console.error = consoleError;
    });
  });

  describe('resolveTilde', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('linux');
    });

    afterEach(() => {
      testHelpers.mockPlatform(process.platform);
    });

    test('Returns undefined if nothing passed in', () => {
      expect(helpers.resolveTilde())
        .toEqual(undefined);
    });

    test('Returns undefined if non-string passed in', () => {
      expect(helpers.resolveTilde(33))
        .toEqual(undefined);
    });

    test('~', () => {
      expect(helpers.resolveTilde('~'))
        .toEqual('/home/DUMMY');
    });

    test('~/', () => {
      expect(helpers.resolveTilde('~/'))
        .toEqual('/home/DUMMY/');
    });

    test('~/folder', () => {
      expect(helpers.resolveTilde('~/folder'))
        .toEqual('/home/DUMMY/folder');
    });

    test('~alias/folder', () => {
      expect(helpers.resolveTilde('~alias/folder'))
        .toEqual('~alias/folder');
    });

    test('/folder/file.ext', () => {
      expect(helpers.resolveTilde('/folder/file.ext'))
        .toEqual('/folder/file.ext');
    });
  });

  describe('resolveWindowsEnvironmentVariables', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('win32');
    });

    afterEach(() => {
      testHelpers.mockPlatform(process.platform);
    });

    test('Returns undefined if nothing passed in', () => {
      expect(helpers.resolveWindowsEnvironmentVariables())
        .toEqual(undefined);
    });

    test('Returns undefined if non-string passed in', () => {
      expect(helpers.resolveWindowsEnvironmentVariables(33))
        .toEqual(undefined);
    });

    test('C:\\folder\\file.ext', () => {
      expect(helpers.resolveWindowsEnvironmentVariables('C:\\folder\\file.ext'))
        .toEqual('C:\\folder\\file.ext');
    });

    test('C:\\%KITTEN%\\file.ext', () => {
      process.env.KITTEN = 'kitty';

      expect(helpers.resolveWindowsEnvironmentVariables('C:\\%KITTEN%\\file.ext'))
        .toEqual('C:\\kitty\\file.ext');
    });

    test('C:\\%PUPPY%\\file.ext', () => {
      expect(helpers.resolveWindowsEnvironmentVariables('C:\\%PUPPY%\\file.ext'))
        .toEqual('C:\\%PUPPY%\\file.ext');
    });
  });
});
