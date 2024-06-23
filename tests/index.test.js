/**
 * @file    Tests the library entry point, to ensure 100% coverage.
 * @author  TheJaredWilcurt
 */

import createDesktopShortcut from '../index.js';

import testHelpers from '@@/testHelpers.js';

let customLogger = vi.fn();

describe('createDesktopShortcut', () => {
  test('Empty options', () => {
    expect(createDesktopShortcut({ customLogger }))
      .toEqual(false);

    expect(customLogger)
      .toHaveBeenLastCalledWith(
        'No shortcuts were created due to lack of accurate details passed in to options object',
        {
          ...testHelpers.defaults,
          customLogger
        }
      );
  });
});
