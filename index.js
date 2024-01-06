/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const validation = require('./src/validation.js');
const library = require('./src/library.js');
const { OPTIONS } = require('./api-type-definitions.js');

/**
 * Creates OS based shortcuts for files, folders, urls, and applications.
 *
 * @example
 * createDesktopShortcut({
 *   windows: { filePath: 'C:\\path\\to\\executable.exe' },
 *   linux:   { filePath: '/home/path/to/executable' },
 *   osx:     { filePath: '/home/path/to/executable' }
 * });
 *
 * @param  {OPTIONS} options  Options object for each OS, and global options
 * @return {boolean}          True = success, false = failed to create the icon or set its permissions (Linux).
 */
function createDesktopShortcut (options) {
  options = validation.validateOptions(options);
  let success = library.runCorrectOSs(options);
  return success;
}

module.exports = createDesktopShortcut;
