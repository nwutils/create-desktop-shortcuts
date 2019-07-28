
# create-desktop-shortcuts

[![Build Status](https://travis-ci.org/nwutils/create-desktop-shortcuts.svg?branch=master)](https://travis-ci.org/nwutils/create-desktop-shortcuts)

Easy API to create desktop shortcuts with Node

This is **not ready for use yet**. But the following is the planned API, it is subject to change.

Currently everything is **synchronous**.

Simple example:

```js
const createDesktopShortcut = require('create-desktop-shortcuts');
const shortCutsCreated = createDesktopShortcut({
  linux: {
    filePath: '/home/path/to/executable'
  },
  windows: {
    filePath: 'C:\\path\\to\\executable.exe'
  },
  osx: {} // todo
});
// returns true if everything worked correctly, or false if it could not create the icon or set its permissions
console.log(shortCutsCreated);
```

Advanced Example:

```js
const createDesktopShortcut = require('create-desktop-shortcuts');
createDesktopShortcut({
  onlyCurrentOS: false,
  verbose: false,
  linux: {
    name: 'My App Name',
    comment: 'My comment',
    icon: '/home/path/to/file.png',
    filePath: '/home/path/to/executable',
    outputPath: 'C:\some\folder',
    type: 'Application',
    terminal: false,
    chmod: true
  },
  windows: {
    name: 'My App Name',
    description: 'My App description',
    icon: 'C:\\path\\to\\file.ico',
    filePath: 'C:\\path\\to\\executable.exe',
    outputPath: 'C:\some\folder',
    arguments: '--my-argument',
    windowMode: 'normal',
    hotkey: 'ALT+CTRL+F'
  },
  osx: {} // todo
});
// returns true if everything worked correctly, or false if it could not create the icon or set its permissions
console.log(shortCutsCreated);
```


### Global Settings

Key             | Type    | Allowed         | Default | Description
:--             | :--     | :--             | :--     | :--
`onlyCurrentOS` | Boolean | `true`, `false` | `true`  | If true and you pass in objects for multiple OS's, this will only create a shortcut for the OS it was ran on.
`verbose`       | Boolean | `true`, `false` | `true`  | If true, consoles out helpful warnings and errors.


### Linux Settings

Key          | Type    | Allowed                                 | Default                  | Description
:--          | :--     | :--                                     | :--                      | :--
`name`       | String  | Any file system safe string             | Uses name from filePath  | The name of the shortcut file.
`comment`    | String  | Any string                              | Not used if not supplied | Metadata file property. Description of what the shortcut would open.
`icon`       | String  | Valid path to PNG or ICNS file          | Uses OS default icon     | The image shown on the shortcut icon. Preferably a 256x256 PNG.
`filePath`   | String  | Any valid path or URL                   | This is a required field | This is the target the shortcut points to. Must be a valid/existing folder if `type: 'Directory', or file if `type: 'Application'`.
`outputPath` | String  | Any valid path to a folder              | Current user's desktop   | Path where the shortcut will be placed.
`type`       | String  | `'Application', `'Link'`, `'Directory'` | `'Application'`          | Type of shortcut. Must be an exact match to this string.
`terminal`   | Boolean | `true`, `false`                         | `false`                  | If true, will run in a terminal.
`chmod`      | Boolean | `true`, `false`                         | `true`                   | If true, will apply a `chmod +x` (755) to the shortcut after creation to allow execution permission.


### Windows Settings

Key           | Type   | Allowed                                 | Default                  | Description
:--           | :--    | :--                                     | :--                      | :--
`name`        | String | Any file system safe string             | Uses name from filePath  | The name of the shortcut file.
`description` | String | Any string                              | Not used if not supplied | Metadata file property. Description of what the shortcut would open.
`icon`        | String | Valid path to ICO file                  | Uses OS default icon     | The image shown on the shortcut icon. Must be valid ICO file.
`filePath`    | String | Any valid path or URL                   | This is a required field | This is the target the shortcut points to.
`outputPath`  | String | Any valid path to a folder              | Current user's desktop   | Path where the shortcut will be placed.
`arguments`   | String | Any string                              | None                     | Additional arguments passed in to the end of your target `filePath`
`windowMode`  | String | `'normal'`, `'maximized'`, `'minimized' | `'normal'`               | How the window should be displayed by default
`hotkey`      | String | Any string                              | None                     | A global hotkey to associate to opening this shortcut, like `'CTRL+ALT+F'`


### OSX Settings

TODO
