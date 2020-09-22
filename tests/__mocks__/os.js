const os = jest.requireActual('os');

const osMock = Object.assign({}, os, {
  homedir: function () {
    if (process.platform === 'win32') {
      return 'C:\\Users\\MOCK_HOME_DIR';
    }
    return '/home/DUMMY';
  }
});

module.exports = osMock;
