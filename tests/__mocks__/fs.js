/**
 * @file    Mock the fs module so when simulating making a Linux shortcut, it does not actually create and chmod a file.
 * @author  TheJaredWilcurt
 */

const fs = await vi.importActual('fs');

const fsMock = Object.assign({}, fs, {
  writeFileSync: vi.fn((file) => {
    if (file.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  }),
  chmodSync: vi.fn((file) => {
    if (file.includes('Throw chmod')) {
      throw 'Successfully errored';
    }
  })
});

export default fsMock;
