/**
 * @file    The global setup for all Jest tests.
 * @author  TheJaredWilcurt
 */

const os = require('os');
const processPlatform = process.platform;
const testHelpers = require('@@/testHelpers.js');

if (os.platform() !== 'win32') {
  testHelpers.mockOsType();
}

global.beforeEach(() => {
});

global.afterEach(() => {
  testHelpers.mockPlatform(processPlatform);
  jest.resetModules();
  // thing = jest.fn(); gets called, then .toHaveBeenCalledWith() will see all calls, but this clears the log after each test
  jest.clearAllMocks();
});

// Jest's setTimeout defaults to 5 seconds.
// Bump the timeout to 60 seconds.
jest.setTimeout(60 * 1000);
