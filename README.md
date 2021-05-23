
# create-desktop-shortcuts

[![Build Status](https://github.com/nwutils/create-desktop-shortcuts/workflows/Build%20Status/badge.svg)](https://github.com/nwutils/create-desktop-shortcuts/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![Unit Test Coverage: 100%](https://img.shields.io/badge/Test%20Coverage-100%25-brightgreen.svg?logo=jest)](https://github.com/nwutils/create-desktop-shortcuts/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![End-to-End Windows Passing](https://img.shields.io/badge/E2E-Passing-brightgreen.svg?logo=windows)](https://github.com/nwutils/create-desktop-shortcuts/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![End-to-End Linux Passing](https://img.shields.io/badge/E2E-Passing-brightgreen.svg?logo=ubuntu)](https://github.com/nwutils/create-desktop-shortcuts/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![End-to-End OSX Passing](https://img.shields.io/badge/E2E-Passing-brightgreen.svg?logo=apple)](https://github.com/nwutils/create-desktop-shortcuts/actions?query=workflow%3A%22Build+Status%22+branch%3Amain) [![Lint Coverage: 100%](https://img.shields.io/badge/Lint%20Coverage-100%25-brightgreen.svg?logo=eslint)](https://github.com/tjw-lint) [![Compatible with Node 4+](https://img.shields.io/badge/Node-%3E%3D4.0.0-brightgreen.svg?logo=Node.js)](/package.json) [![Code of Conduct: No Ideologies](https://img.shields.io/badge/CoC-No%20Ideologies-blue)](/CODE_OF_CONDUCT.md) [![MIT Licensed](https://img.shields.io/badge/License-MIT-brightgreen)](/LICENSE)


## Small, lightweight, cross-platform, built in validation!


### 100% Test Coverage, Automated Cross-Platform End-to-End tested

An easy, cross-platform, API to create desktop shortcuts with Node. (*Works in [NW.js](https://nwjs.io) too!*)

This library is completely **synchronous**.

It uses 1 dependency, which has it's own single dependency

* **create-desktop-shortcuts** - small - 100% test coverage
  * **[which](https://github.com/npm/node-which)** - small - 100% test coverage - used by 9 million projects
    * **[isexe](https://github.com/isaacs/isexe)** - very small - used by 9 million projects


## Installation

```
npm install --save create-desktop-shortcuts
```


### Examples

**Simple example:**

```js
const createDesktopShortcut = require('create-desktop-shortcuts');

const shortcutsCreated = createDesktopShortcut({
  windows: { filePath: 'C:\\path\\to\\executable.exe' },
  linux:   { filePath: '/home/path/to/executable'     },
  osx:     { filePath: '/home/path/to/executable'     }
});

if (shortcutsCreated) {
  console.log('Everything worked correctly!');
} else {
  console.log('Could not create the icon or set its permissions (in Linux if "chmod" is set to true, or not set)');
}
```

**Advanced Example:**

Each OS handles the concept of a shortcut icon slightly differently. So they each have a slightly different API, but I tried to keep them similar when they overlap.

```js
const createDesktopShortcut = require('create-desktop-shortcuts');

const shortcutsCreated = createDesktopShortcut({
  // OPTIONAL: defaults to true
  onlyCurrentOS: true,
  // OPTIONAL: defaults to true
  verbose: true,
  /**
   * OPTIONAL: console.error is called by default if verbose: true.
   *
   * Your own custom logging function called with helpful warning/error
   * messages from the internal validators. Only used if verbose: true.
   *
   * @param  {string} message The human readable warning/error message
   * @param  {object} error   Sometimes an error or options object is passed
   */
  customLogger: function (message, error) {
    console.log(message, error);
  },
  windows: {
    // REQUIRED: Path must exist
    filePath: 'C:\\path\\to\\executable.exe',
    // OPTIONAL: Defaults to the Desktop of the current user
    outputPath: 'C:\\some\\folder',
    // OPTIONAL: defaults to the filePath file's name (without the extension)
    name: 'My App Name',
    // OPTIONAL
    comment: 'My App description',
    // OPTIONAL: File must exist and be ICO, EXE, or DLL
    icon: 'C:\\path\\to\\file.ico',
    // OPTIONAL
    arguments: '--my-argument -f \'other stuff\'',
    // OPTIONAL: defaults to 'normal'
    windowMode: 'normal',
    // OPTIONAL
    hotkey: 'ALT+CTRL+F'
  },
  linux: {
    // REQUIRED: Path must exist
    filePath: '/home/path/to/executable',
    // OPTIONAL: Defaults to the Desktop of the current user
    outputPath: '/home/some/folder',
    // OPTIONAL: defaults to the filePath file's name (without the extension)
    name: 'My App Name',
    // OPTIONAL
    description: 'My app description',
    // OPTIONAL: File must exist and be PNG or ICNS
    icon: '/home/path/to/file.png',
    // OPTIONAL: 'Application', 'Directory', or 'Link' (must logically match filePath)
    type: 'Application',
    // OPTIONAL: defaults to false
    terminal: false,
    // OPTIONAL: defaults to true
    chmod: true,
    // OPTIONAL
    arguments: '--my-argument -f'
  },
  osx: {
    // REQUIRED: Path must exist
    filePath: '/Applications/My App.app',
    // OPTIONAL: Defaults to the Desktop of the current user
    outputPath: '/home/some/folder',
    // OPTIONAL: defaults to the filePath file's name (without the extension)
    name: 'My App Name',
    // OPTIONAL: defaults to false
    overwrite: false
  }
});

// returns true if everything worked correctly, or false if it could not create the icon or set its permissions
console.log(shortcutsCreated);
```


## Documentation


### Global Settings

Key             | Type     | Allowed         | Default         | Description
:--             | :--      | :--             | :--             | :--
`onlyCurrentOS` | Boolean  | `true`, `false` | `true`          | If true and you pass in objects for multiple OS's, this will only create a shortcut for the OS it was ran on.
`verbose`       | Boolean  | `true`, `false` | `true`          | If true, consoles out helpful warnings and errors using `customLogger` or `console.error`.
`customLogger`  | Function | Any function    | `console.error` | You can pass in your own custom function to log errors/warnings to. When called the function will receive a `message` string for the first argument and sometimes an `error` object for the second argument. This is useful in NW.js to see the messages logged to the regular Chromium Developer Tools instead of the background page's developer tools. But this can also be useful in other scenarios, like adding in custom wrappers or colors in a command line/terminal. This function may be called multiple times before all synchronous tasks complete.


### Windows Settings

Key                | Type   | Allowed                                  | Default                      | Description
:--                | :--    | :--                                      | :--                          | :--
`filePath`         | String | Any valid path or URL                    | **This is a required field** | This is the target the shortcut points to.
`outputPath`       | String | Any valid path to a folder               | `'%USERPROFILE%\\Desktop'`   | Path where the shortcut will be placed.
`name`             | String | Any file system safe string              | Uses name from filePath      | The name of the shortcut file.
`comment`          | String | Any string                               | Not used if not supplied     | Metadata file "comment" property. Description of what the shortcut would open.
`icon`             | String | Valid path to file (ICO, EXE, or DLL)    | Uses OS default icon         | The image shown on the shortcut icon. You can also pass in an index if file contains multiple icons, like `'C:\\file.exe,0'`
`arguments`        | String | Any string                               | None                         | Additional arguments passed in to the end of your target `filePath`
`windowMode`       | String | `'normal'`, `'maximized'`, `'minimized'` | `'normal'`                   | How the window should be displayed by default
`hotkey`           | String | Any string                               | None                         | A global hotkey to associate to opening this shortcut, like `'CTRL+ALT+F'`
`workingDirectory` | String | Any valid path to a folder               | None                         | The working directory for the shortcut when it launches


### Linux Settings

Key          | Type    | Allowed                                  | Default                      | Description
:--          | :--     | :--                                      | :--                          | :--
`filePath`   | String  | Any valid path or URL                    | **This is a required field** | This is the target the shortcut points to. Must be a valid/existing folder if `type: 'Directory'`, or file if `type: 'Application'`.
`outputPath` | String  | Any valid path to a folder               | Current user's desktop       | Path where the shortcut will be placed.
`name`       | String  | Any file system safe string              | Uses name from filePath      | The name of the shortcut file.
`comment`    | String  | Any string                               | Not used if not supplied     | Metadata file "comment" property. Description of what the shortcut would open.
`icon`       | String  | Valid path to PNG or ICNS file           | Uses OS default icon         | The image shown on the shortcut icon. Preferably a 256x256 PNG.
`type`       | String  | `'Application'`, `'Link'`, `'Directory'` | Based on `filePath`          | Type of shortcut. Defaults to `'Link'` if `filePath` starts with `'http://'` or `'https://'`. Defaults to `'Directory'` if filePath exists and is a folder. Defaults to Application otherwise.
`terminal`   | Boolean | `true`, `false`                          | `false`                      | If true, will run in a terminal.
`chmod`      | Boolean | `true`, `false`                          | `true`                       | If true, will apply a `chmod +x` (755) to the shortcut after creation to allow execution permission.
`arguments`  | String  | Any string                               | None                         | Additional arguments passed in to the end of your target `filePath`


### OSX Settings

OSX will automatically inherit the icon of the target you point to. It doesn't care if you point to a folder, file, or application.

**NOTE:** If `overwrite` is set to `false` and a matching file already exists, a `console.error` will occur to inform you of this, however `create-desktop-shortcuts` will still report successful (return `true`). This `console.error` can be hidden by setting `verbose` to `false`, or using a `customLogger` to [intercept it](https://github.com/nwutils/create-desktop-shortcuts/blob/main/src/library.js#L252).

Key          | Type    | Allowed                     | Default                      | Description
:--          | :--     | :--                         | :--                          | :--
`filePath`   | String  | Any valid path or URL       | **This is a required field** | This is the target the shortcut points to.
`outputPath` | String  | Any valid path to a folder  | Current user's desktop       | Path where the shortcut will be placed.
`name`       | String  | Any file system safe string | Uses name from filePath      | The name of the shortcut file.
`overwrite`  | Boolean | `true`, `false`             | false                        | If true, will replace any existing file in the `outputPath` with matching `name`. See above note for more details.


### Special paths

The `filePath` for all OS's can be set to an executable name directly if it is available in the user's PATH. For example, if you set it to `'node'` or `'python'` or `'cmd'` and the user can access those from PATH variables, it will work automatically. But the file must exist and must be an actual executable, otherwise you should hard code the value.

The `filePath` and `outputPath` can use environment variables on Windows, like `'%appData%'`. See the "Add to start menu" section below for more examples.

The `filePath` and `outputPath` can start with `~` or `/` on Linux or OSX and the paths will be resolved automatically.


### Add to start menu

Here are the documented paths you can use for the `outputPath` to create a shortcut in the start menu.

OS     | Type         | `outputPath`                                              | Note
:--    | :--          | :--                                                       | :--
Win 7+ | All Users    | `%AllUsersProfile%\Microsoft\Windows\Start Menu\Programs` | `C:\ProgramData\Microsoft\Windows\Start Menu\Programs`
Win 7+ | All Users    | `%ProgramData%\Microsoft\Windows\Start Menu\Programs`     | Should be exactly same as above
Win 7+ | Current User | `%AppData%\Microsoft\Windows\Start Menu\Programs`         | Should work fine\reliably
Linux  | All Users    | `/usr/share/applications`                                 | According to Arch and Gnome
Linux  | All Users    | `/usr/local/share/applications/`                          | According to Arch
Linux  | Current User | `~/.local/share/applications`                             | According to Gnome docs

OSX doesn't have a "Start menu" nor an official means of [adding items to the dock](https://developer.apple.com/forums/thread/122743).

In Windows 8+ it might be possible to pin a "tile" in the start menu, but that looks difficult, and out of scope for this library. If someone else created a Node library for pinning tiles to the start menu this line of the README should be updated to link to it.


* * *


## OS Support

**End-to-end tests run on every commit using:**

* Ubuntu latest with Node v8.3.0
* Ubuntu latest with Node v14.x.x
* Windows latest with Node v8.3.0
* Windows latest with Node v14.x.x
* OSX latest with Node v8.3.0
* OSX latest with Node v14.x.x

**Manually Tested on:**

* Windows XP with Node v4.4.5
* Windows 7 with Node v4.0.0, v8, v10, v12
* Windows 10 with Node v12, v14, v15
* Ubuntu 16, 20 with Node v12
* OSX 10.11 with Node v7.3.0
* NW.js v0.14.7 (LTS), v0.30.0, v0.50.0


* * *


## Credits

Author: The Jared Wilcurt

Parts of the `windows.vbs` were copied/modified based on:

 * https://www.vbsedit.com/html/a239a3ac-e51c-4e70-859e-d2d8c2eb3135.asp
 * https://forums.techguy.org/threads/solved-vbscript-create-a-shortcut-within-a-folder.886401/


* * *


## How can you help improve this repo?

* Report bugs in the GitHub issues
* Request features
* Fix reported bugs with a PR
* Offer an async and sync mode, instead of just sync.
  * Note: Make sure it can still run in older versions of NW.js
* Help with any of the known issues listed below:


* * *


## Known issues

1. **Windows:** If WScript does not like what is passed to it, it displays a Windows Dialog with an error on the line that failed. I have no idea how to turn that off, so I've just added in tons of validation checks to prevent anything from being passed in to it that could cause this. But may still occur if you pass in junk to it that gets by the validation checks.
1. **Linux:** No real recourse if the script does not have permission to run `chmod` on Linux. You would just need to run it again with sudo or something. If you have ideas, create an issue or PR.
1. **OSX:** I know of no way to set a custom icon image on OSX. It will just always use the same icon the executable had (or file type if linking to an `.html` file for example)
1. **Windows/Linux:** May want to add in `overwrite` option for Windows and Linux too. This would require deleting the existing shortcut. Deleting files is something that each OS sucks at in different ways and would require pulling in something like `fs-extra` or a similar dependency.
1. **OSX:** To my knowledge there is no way to pass in arguments with a shortcut. If anyone knows how, make an issue with details.
