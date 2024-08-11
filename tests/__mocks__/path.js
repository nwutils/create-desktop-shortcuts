/**
 * @file    Mock the path module so that the separator is consistent on all platforms running tests.
 * @author  TheJaredWilcurt
 */

const path = await vi.importActual('path');

const pathMock = Object.assign({}, path, {
  sep: '/'
});

export default pathMock;
