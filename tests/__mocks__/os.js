/**
 * @file    Mock the os module so the homedir is consistent on all computers running the tests.
 * @author  TheJaredWilcurt
 */

const os = await vi.importActual('node:os');

const osMock = Object.assign({}, os, {
  homedir: function () {
    if (process.platform === 'win32') {
      return 'C:\\Users\\DUMMY';
    }
    return '/home/DUMMY';
  }
});

export default osMock;
