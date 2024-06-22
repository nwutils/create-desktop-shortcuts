/**
 * @file    Mock the fs module so when simulating making a Linux shortcut, it does not actually create and chmod a file.
 * @author  TheJaredWilcurt
 */

import { vi } from "vitest";

const fs = await vi.importActual('fs');

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
