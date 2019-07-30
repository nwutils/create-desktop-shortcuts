
# create-desktop-shortcuts

[![Build Status](https://travis-ci.org/nwutils/create-desktop-shortcuts.svg?branch=master)](https://travis-ci.org/nwutils/create-desktop-shortcuts)

## Small, lightweight, dependency free, cross-platform!

Easy API to create desktop shortcuts with Node.

This is **not ready for use yet**. But the following is the planned API, it is subject to change.

Currently everything is **synchronous**.

### Examples

**Simple example:**

```js
const createDesktopShortcut = require('create-desktop-shortcuts');
const shortCutsCreated = createDesktopShortcut({
  linux: {
    filePath: '/home/path/to/executable'
  },
  windows: {
    filePath: 'C:\\path\\to\\executable.exe'
  },
  osx: {
    filePath: '/home/path/to/executable'
  }
});
// returns true if everything worked correctly, or false if it could not create the icon or set its permissions
console.log(shortCutsCreated);
```

**Advanced Example:**

Each OS handles the conscept of a shortcut icon slightly differently. So they each have a slightly different API, but I tried to keep them similar when they overlap.

```js
const createDesktopShortcut = require('create-desktop-shortcuts');
createDesktopShortcut({
  onlyCurrentOS: false,
  verbose: false,
  linux: {
    name: 'My App Name',
    description: 'My comment',
    icon: '/home/path/to/file.png',
    filePath: '/home/path/to/executable',
    outputPath: '/home/some/folder',
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
  osx: {
    name: 'My App Name',
    filePath: '/Applications/My App.app',
    outputPath: '/home/some/folder',
    overwrite: true
  }
});
// returns true if everything worked correctly, or false if it could not create the icon or set its permissions
console.log(shortCutsCreated);
```


## Documentation


### Global Settings

Key             | Type    | Allowed         | Default | Description
:--             | :--     | :--             | :--     | :--
`onlyCurrentOS` | Boolean | `true`, `false` | `true`  | If true and you pass in objects for multiple OS's, this will only create a shortcut for the OS it was ran on.
`verbose`       | Boolean | `true`, `false` | `true`  | If true, consoles out helpful warnings and errors.


### Linux Settings

Key           | Type    | Allowed                                  | Default                  | Description
:--           | :--     | :--                                      | :--                      | :--
`name`        | String  | Any file system safe string              | Uses name from filePath  | The name of the shortcut file.
`description` | String  | Any string                               | Not used if not supplied | Metadata file "comment" property. Description of what the shortcut would open.
`icon`        | String  | Valid path to PNG or ICNS file           | Uses OS default icon     | The image shown on the shortcut icon. Preferably a 256x256 PNG.
`filePath`    | String  | Any valid path or URL                    | This is a required field | This is the target the shortcut points to. Must be a valid/existing folder if `type: 'Directory'`, or file if `type: 'Application'`.
`outputPath`  | String  | Any valid path to a folder               | Current user's desktop   | Path where the shortcut will be placed.
`type`        | String  | `'Application'`, `'Link'`, `'Directory'` | `'Application'`          | Type of shortcut. Must be an exact match to this string.
`terminal`    | Boolean | `true`, `false`                          | `false`                  | If true, will run in a terminal.
`chmod`       | Boolean | `true`, `false`                          | `true`                   | If true, will apply a `chmod +x` (755) to the shortcut after creation to allow execution permission.


### Windows Settings

Key           | Type   | Allowed                                  | Default                  | Description
:--           | :--    | :--                                      | :--                      | :--
`name`        | String | Any file system safe string              | Uses name from filePath  | The name of the shortcut file.
`description` | String | Any string                               | Not used if not supplied | Metadata file property. Description of what the shortcut would open.
`icon`        | String | Valid path to ICO file                   | Uses OS default icon     | The image shown on the shortcut icon. Must be valid ICO file.
`filePath`    | String | Any valid path or URL                    | This is a required field | This is the target the shortcut points to.
`outputPath`  | String | Any valid path to a folder               | Current user's desktop   | Path where the shortcut will be placed.
`arguments`   | String | Any string                               | None                     | Additional arguments passed in to the end of your target `filePath`
`windowMode`  | String | `'normal'`, `'maximized'`, `'minimized'` | `'normal'`               | How the window should be displayed by default
`hotkey`      | String | Any string                               | None                     | A global hotkey to associate to opening this shortcut, like `'CTRL+ALT+F'`


### OSX Settings

OSX will automatically inherit the icon of the target you point to. It doesn't care if you point to a folder, file, or application.

If overwrite is set to false and a matching file already exists, a console log will occur to inform you of this, however `create-desktop-shortcuts` will still report successful. This console log can be hidden by setting verbose to false.

Key          | Type    | Allowed                     | Default                  | Description
:--          | :--     | :--                         | :--                      | :--
`name`       | String  | Any file system safe string | Uses name from filePath  | The name of the shortcut file.
`filePath`   | String  | Any valid path or URL       | This is a required field | This is the target the shortcut points to.
`outputPath` | String  | Any valid path to a folder  | Current user's desktop   | Path where the shortcut will be placed.
`overwrite`  | Boolean | `true`, `false`             | false                    | If true, will replace any existing file in the `outputPath` with matching `name`
