const validation = require('../../src/validation.js');

describe('Validation', () => {
  describe('validateOptions', () => {
    test('Empty', () => {
      expect(validation.validateOptions())
        .toEqual({
          onlyCurrentOS: true,
          verbose: true
        });
    });

    test('Empty object', () => {
      expect(validation.validateOptions({}))
        .toEqual({
          onlyCurrentOS: true,
          verbose: true
        });
    });
  })
});
