const createDesktopShortcut = require('../index.js');
const testHelpers = require('@@/testHelpers.js');

const mockfs = testHelpers.mockfs;

let options;
let customLogger;

describe('createDesktopShortcut', () => {
  beforeEach(() => {
    customLogger = jest.fn();
    options = {
      customLogger
    };
    mockfs(true);
  });

  afterEach(() => {
    testHelpers.restoreMockFs();
  });

  describe('generateLinuxFileData', () => {
    test('Empty options', () => {
      expect(createDesktopShortcut(options))
        .toEqual(false);

      expect(customLogger)
        .toHaveBeenLastCalledWith(
          'No shortcuts were created due to lack of accurate details passed in to options object',
          options
        );
    });
  });
});
