/**
 * @file    Tests the library helpers, to ensure 100% coverage.
 * @author  TheJaredWilcurt
 */

import process from 'node:process';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('os');

const processPlatform = process.platform;

import { throwError, resolveTilde, resolveWindowsEnvironmentVariables } from '../../src/helpers.js';

import testHelpers from '../testHelpers.js';

describe('helpers', () => {
  describe('throwError', () => {
    test('Custom logger is called', () => {
      const options = {
        verbose: true,
        customLogger: vi.fn()
      };

      throwError(options, 'message', 'error');

      expect(options.customLogger)
        .toHaveBeenCalledWith('message', 'error');
    });

    test('Custom logger is not called when verbose is false', () => {
      const options = {
        verbose: false,
        customLogger: vi.fn()
      };

      throwError(options, 'message', 'error');

      expect(options.customLogger)
        .not.toHaveBeenCalled();
    });

    test('Console.error called when verbose true and no custom logger', () => {
      const consoleError = console.error;
      console.error = vi.fn();
      const options = {
        verbose: true
      };

      throwError(options, 'message', 'error');

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
      testHelpers.mockPlatform(processPlatform);
    });

    test('Returns undefined if nothing passed in', () => {
      expect(resolveTilde())
        .toEqual(undefined);
    });

    test('Returns undefined if non-string passed in', () => {
      expect(resolveTilde(33))
        .toEqual(undefined);
    });

    test('~', () => {
      expect(resolveTilde('~'))
        .toEqual('/home/DUMMY');
    });

    test('~/', () => {
      expect(resolveTilde('~/'))
        .toEqual('/home/DUMMY/');
    });

    test('~/folder', () => {
      expect(resolveTilde('~/folder'))
        .toEqual('/home/DUMMY/folder');
    });

    test('~alias/folder', () => {
      expect(resolveTilde('~alias/folder'))
        .toEqual('~alias/folder');
    });

    test('/folder/file.ext', () => {
      expect(resolveTilde('/folder/file.ext'))
        .toEqual('/folder/file.ext');
    });
  });

  describe('resolveWindowsEnvironmentVariables', () => {
    beforeEach(() => {
      testHelpers.mockPlatform('win32');
    });

    afterEach(() => {
      testHelpers.mockPlatform(processPlatform);
    });

    test('Returns undefined if nothing passed in', () => {
      expect(resolveWindowsEnvironmentVariables())
        .toEqual(undefined);
    });

    test('Returns undefined if non-string passed in', () => {
      expect(resolveWindowsEnvironmentVariables(33))
        .toEqual(undefined);
    });

    test('C:\\folder\\file.ext', () => {
      expect(resolveWindowsEnvironmentVariables('C:\\folder\\file.ext'))
        .toEqual('C:\\folder\\file.ext');
    });

    test('C:\\%KITTEN%\\file.ext', () => {
      process.env.KITTEN = 'kitty';

      expect(resolveWindowsEnvironmentVariables('C:\\%KITTEN%\\file.ext'))
        .toEqual('C:\\kitty\\file.ext');
    });

    test('C:\\%PUPPY%\\file.ext', () => {
      expect(resolveWindowsEnvironmentVariables('C:\\%PUPPY%\\file.ext'))
        .toEqual('C:\\%PUPPY%\\file.ext');
    });
  });
});
