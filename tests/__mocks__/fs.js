/**
 * @file    Mock the fs module so when simulating making a Linux shortcut, it does not actually create and chmod a file.
 * @author  TheJaredWilcurt
 */

const fs = jest.requireActual('fs');

const fsMock = Object.assign({}, fs, {
  writeFileSync: jest.fn((file) => {
    if (file.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  }),
  chmodSync: jest.fn((file) => {
    if (file.includes('Throw chmod')) {
      throw 'Successfully errored';
    }
  })
});

module.exports = fsMock;
