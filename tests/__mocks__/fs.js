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
