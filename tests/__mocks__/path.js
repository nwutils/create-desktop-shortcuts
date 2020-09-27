const path = jest.requireActual('path');

const pathMock = Object.assign({}, path, {
  sep: '/'
});

module.exports = pathMock;
