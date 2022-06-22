/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const validation = require('./src/validation.js');
const library = require('./src/library.js');

/**
 * OPTIONAL: console.error is called by default if verbose: true.
 *
 * Your own custom logging function called with helpful warning/error
 * messages from the internal validators. Only used if verbose: true.
 *
 * @callback {Function} CUSTOMLOGGER
 * @param    {string}   message       The human readable warning/error message
 * @param    {object}   [error]       Sometimes an error or options object is passed
 * @param    {Array}    [asdf]        asdf
 * @param    {boolean}  [qwer]        qwer
 * @param    {number}   [wert]        wert
 * @return   {void}
 */

/**
 * @typedef  {object} WINDOWS
 * @property {string} filePath               The target the shortcut points to.
 * @property {string} [outputPath]           Path where shortcut will be placed. Defaults to user's desktop.
 * @property {string} [name]                 Name of the shortcut file.
 * @property {string} [comment]              Metadata file "comment" property. Description of what the shortcut would open.
 * @property {string} [icon]                 Image shown on the shortcut icon. You can also pass in an index if file contains multiple icons, like `'C:\\file.exe,0'`
 * @property {string} [arguments]            Additional arguments passed in to the end of your target `filePath`.
 * @property {string} [windowMode="normal"]  How the window should be displayed by default. Valid inputs: 'normal', 'maximized', 'minimized'. Defaults to 'normal'.
 * @property {string} [hotkey]               A global hotkey to associate to opening this shortcut, like 'CTRL+ALT+F'.
 * @property {string} [workingDirectory]     The working directory for the shortcut when it launches, must be a valid path to a folder.
 * @property {string} [VBScriptPath]         This is an advanced option specifically and only for projects packaged with `pkg`. [See documentation](https://github.com/nwutils/create-desktop-shortcuts#windows-settings).
 */

/**
 * @typedef  {object}  LINUX
 * @property {string}  filePath          The target the shortcut points to.
 * @property {string}  [outputPath]      Path where shortcut will be placed. Defaults to user's desktop.
 * @property {string}  [name]            Name of the shortcut file.
 * @property {string}  [comment]         Metadata file "comment" property. Description of what the shortcut would open.
 * @property {string}  [icon]            Image shown on the shortcut icon. Preferably a 256x256 PNG.
 * @property {string}  [type]            Type of shortcut. Valid inputs: 'Link', 'Directory', 'Application'.
 * @property {boolean} [terminal=false]  If true, will run in a terminal.
 * @property {boolean} [chmod=true]      If true, will apply a `chmod +x` (755) to the shortcut after creation to allow execution permission.
 * @property {string}  [arguments]       Additional arguments passed in to the end of your target `filePath`.
 */

/**
 * @typedef  {object}  OSX
 * @property {string}  filePath           The target the shortcut points to.
 * @property {string}  [outputPath]       Path where shortcut will be placed. Defaults to user's desktop.
 * @property {string}  [name]             Name of the shortcut file.
 * @property {boolean} [overwrite=false]  If true, will replace any existing file in the `outputPath` with matching `name`. [See documentation](https://github.com/nwutils/create-desktop-shortcuts#osx-settings).
 */

/**
 * @typedef  {object}       OPTIONS
 * @property {boolean}      [onlyCurrentOS=true]  Optional. Only create a shortcut for the current OS even if other OS's are passed in.
 * @property {boolean}      [verbose=true]        Optional. Logs out helpful warnings/errors using `customLogger` or console.error.
 * @property {CUSTOMLOGGER} [customLogger]        Optional. Called (if verbose: true) with helpful warning/error messages from internal validators.
 * @property {WINDOWS}      [windows]             Optional. Windows shortcut settings.
 * @property {LINUX}        [linux]               Optional. Linux shortcut settings.
 * @property {OSX}          [osx]                 Optional. OSX shortcut settings.
 */

/**
 * Creates OS based shortcuts for files, folders, urls, and applications.
 *
 * @example
 * createDesktopShortcut({
 *   windows: { filePath: 'C:\\path\\to\\executable.exe' },
 *   linux:   { filePath: '/home/path/to/executable'     },
 *   osx:     { filePath: '/home/path/to/executable'     }
 * });
 *
 * @param  {OPTIONS} options  Options object for each OS.
 * @return {boolean}          True = success, false = failed to create the icon or set its permissions (Linux).
 */
function createDesktopShortcut (options) {
  options = validation.validateOptions(options);
  let success = library.runCorrectOSs(options);
  return success;
}

module.exports = createDesktopShortcut;
