/**
 * @file    Mock the path module so that the separator is consistent on all platforms running tests.
 * @author  TheJaredWilcurt
 */

const path = jest.requireActual('path');

const pathMock = Object.assign({}, path, {
  sep: '/'
});

module.exports = pathMock;
