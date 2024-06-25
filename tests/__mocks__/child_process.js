/**
 * @file    Mock the child_process so execSync and spawnSync not actually called when simulating creating an OSX or Windows shortcut.
 * @author  TheJaredWilcurt
 */

const childProcess = await vi.importActual('node:child_process');

const childProcessMock = Object.assign({}, childProcess, {
  execSync: vi.fn((executableAndArgs) => {
    if (executableAndArgs.includes('Throw Error')) {
      throw 'Successfully errored';
    }
    if (executableAndArgs === '[Environment]::GetFolderPath("Desktop")') {
      if (global.breakPowershell) {
        return undefined;
      }
      return 'C:/Powershell-derived-desktop';
    }
  }),
  spawnSync: vi.fn((executable, args) => {
    if (args.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  })
});

export default childProcessMock;
