/**
 * @file    Mock the path module so that the separator is consistent on all platforms running tests.
 * @author  TheJaredWilcurt
 */

import { vi } from "vitest";

const path = await vi.importActual('path');

const pathMock = Object.assign({}, path, {
  sep: '/'
});

module.exports = pathMock;
