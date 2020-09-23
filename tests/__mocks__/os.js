const os = jest.requireActual('os');

const osMock = Object.assign({}, os, {
  homedir: function () {
    if (process.platform === 'win32') {
      return 'C:\\Users\\DUMMY';
    }
    return '/home/DUMMY';
  }
});

module.exports = osMock;
