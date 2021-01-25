/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const validation = require('./src/validation.js');
const library = require('./src/library.js');

/**
 * Creates OS based shortcuts for files, folders, and applications.
 *
 * @example
 * createDesktopShortcut({
 *   windows: { filePath: 'C:\\path\\to\\executable.exe' },
 *   linux: { filePath: '/home/path/to/executable' },
 *   osx: { filePath: '/home/path/to/executable' }
 * });
 *
 * @param  {object}  options  Options object for each OS.
 * @return {boolean}          True = success, false = failed to create the icon or set its permissions (Linux).
 */
function createDesktopShortcut (options) {
  options = validation.validateOptions(options);
  let success = library.runCorrectOSs(options);
  return success;
}

module.exports = createDesktopShortcut;
