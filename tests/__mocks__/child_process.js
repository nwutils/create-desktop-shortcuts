const childProcess = jest.requireActual('child_process');

const childProcessMock = Object.assign({}, childProcess, {
  execSync: jest.fn(),
  spawnSync: jest.fn()
});

module.exports = childProcessMock;
