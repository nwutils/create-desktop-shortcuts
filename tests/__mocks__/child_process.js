const childProcess = jest.requireActual('child_process');

const childProcessMock = Object.assign({}, childProcess, {
  execSync: jest.fn((executableAndArgs) => {
    if (executableAndArgs.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  }),
  spawnSync: jest.fn((executable, args) => {
    if (args.includes('Throw Error')) {
      throw 'Successfully errored';
    }
  })
});

module.exports = childProcessMock;
