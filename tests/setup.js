/**
 * @file    The global setup for all Jest tests.
 * @author  TheJaredWilcurt
 */

import os from 'node:os';

import testHelpers from './testHelpers.js';

const processPlatform = process.platform;

if (os.platform() !== 'win32') {
  testHelpers.mockOsType();
}

beforeEach(() => {
});

afterEach(() => {
  testHelpers.mockPlatform(processPlatform);
  vi.resetModules();
  // thing = vi.fn(); gets called, then .toHaveBeenCalledWith() will see all calls, but this clears the log after each test
  vi.clearAllMocks();
});

