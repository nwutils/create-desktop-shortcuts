/**
 * @file    Mock the child_process so execSync and spawnSync not actually called when simulating creating an OSX or Windows shortcut.
 * @author  TheJaredWilcurt
 */

const childProcess = jest.requireActual('child_process');

const childProcessMock = Object.assign({}, childProcess, {
  execSync: jest.fn((executableAndArgs) => {
    if (executableAndArgs.includes('Throw Error')) {
      throw 'Successfully errored';
    }
    if (executableAndArgs === '[Environment]::GetFolderPath("Desktop")') {
      return 'FAKED DESKTOP PATH';
    }
  }),
  spawnSync: jest.fn((executable, args) => {
    if (args.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  })
});

module.exports = childProcessMock;
