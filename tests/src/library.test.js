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
    test('Placeholder', () => {
      expect(typeof(library))
        .toEqual('object');
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
