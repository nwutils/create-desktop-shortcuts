declare module "create-desktop-shortcuts" {
	/**
	 * Creates OS based shortcuts for files, folders, and applications.
	 *
	 * @example
	 * createDesktopShortcut({
	 *   windows: { filePath: 'C:\\path\\to\\executable.exe' },
	 *   linux:   { filePath: '/home/path/to/executable'     },
	 *   osx:     { filePath: '/home/path/to/executable'     }
	 * });
	 */
	declare function createDesktopShortcut(options: {
    /**
     * Optional. If true and you pass in objects for multiple OS's, this will only create a shortcut for the OS it was ran on.
     */
    onlyCurrentOS?: boolean;
    /**
     * Optional. If true, consoles out helpful warnings and errors using `customLogger` or {console.error}.
     */
    verbose?: boolean;
    /**
     * Optional. You can pass in your own custom function to log errors/warnings to.
     * 
     * When called the function will receive a `message` string for the first argument and sometimes an `error` object for the second argument.
     * 
     * This is useful in NW.js to see the messages logged to the regular Chromium Developer Tools instead of the background page's developer tools.
     * 
     * But this can also be useful in other scenarios, like adding in custom wrappers or colors in a command line/terminal.
     * 
     * This function may be called multiple times before all synchronous tasks complete.
     */
    customLogger?: (
      /**
       * The human readable warning/error message.
       */
      message: string,
      /**
       * Sometimes an error or options object is passed
       */
      error: string
    ) => void;
	/**
	 * Optional. Windows shortcut settings.
	 */
    windows?: {
      /**
       * This is the target the shortcut points to.
       */
      filePath: string;
      /**
       * Optional. Path where the shortcut will be placed.
       * 
       * The default value is determined by using PowerShell to ask Windows specifically where the User's desktop is located.
       * 
       * If PowerShell is not available we default to `'%USERPROFILE%\\Desktop'`.
       * 
       * This means it supports One Drive accounts, and other oddball setups, too.
       */
      outputPath?: string;
      /**
       * Optional. The name of the shortcut file.
       */
      name?: string;
      /**
       * Optional. Metadata file `comment` property.
       * 
       * Description of what the shortcut would open.
       */
      comment?: string;
      /**
       * Optional. The image shown on the shortcut icon.
       * 
       * You can also pass in an index if file contains multiple icons, like `'C:\\file.exe,0'`
       */
      icon?: string;
      /**
       * Optional. Additional arguments passed in to the end of your target `filePath`
       */
      arguments?: string;
      /**
       * Optional. How the window should be displayed by default.
       */
      windowMode?: "maximized" | "minimized" | "normal";
      /**
       * Optional. A global hotkey to associate to opening this shortcut, like `'CTRL+ALT+F'`
       */
      hotkey?: string;
      /**
       * Optional. The working directory for the shortcut when it launches.
       */
      workingDirectory?: string;
      /**
       * Optional. This is an advanced option specifically for projects packaged with pkg.
       * 
       * You can create a copy of the windows.vbs file outside of your packaged executable and pass in the location of it.
       * 
       * If your vbs file differs in any way to the version shipped with this library, it will have bugs.
       * 
       * Ensure you are *programmatically* copying the shipped version, so if it changes in a future update, your code will still work.
       * 
       * If you are not using pkg, you should not include VBScriptPath in your Windows settings.
       */
      VBScriptPath?: string;
    };
	/**
	 * Optional. Linux shortcut settings.
	 */
    linux?: {
      /**
       * This is the target the shortcut points to. Must be a valid/existing folder if `type: 'Directory'`, or file if `type: 'Application'`.
       */
      filePath: string;
      /**
       * Optional. Path where the shortcut will be placed.
       */
      outputPath?: string;
      /**
       * Optional. The name of the shortcut file.
       */
      name?: string;
      /**
       * Optional. Metadata file `comment` property. Description of what the shortcut would open.
       */
      comment?: string;
      /**
       * Optional. The image shown on the shortcut icon. Preferably a 256x256 PNG.
       */
      icon?: string;
      /**
       * Optional. Type of shortcut.
       * 
       * Defaults to `'Link'` if `filePath` starts with `'http://'` or `'https://'`.\
       * Defaults to `'Directory'` if `filePath` exists and is a folder.\
       * Defaults to Application otherwise.
       */
      type?: "Application" | "Link" | "Directory";
      /**
       * Optional. If true, will run in a terminal.
       */
      terminal?: boolean;
      /**
       * Optional. If true, will apply a `chmod +x` (755) to the shortcut after creation to allow execution permission.
       */
      chmod?: boolean;
      /**
       * Optional. Additional arguments passed in to the end of your target `filePath`.
       */
      arguments?: string;
    };
	/**
	 * OSX shortcut settings.
	 */
    osx?: {
      /**
       * This is the target the shortcut points to.
       */
      filePath: string;
      /**
       * Optional. Path where the shortcut will be placed.
       */
      outputPath?: string;
      /**
       * Optional. The name of the shortcut file.
       */
      name?: string;
      /**
       * Optional. If `true`, will replace any existing file in the `outputPath` with matching `name`.
       * 
       * **NOTE:** If `overwrite` is set to `false` and a matching file already exists, a `console.error` will occur to inform you of this, however `create-desktop-shortcuts` will still report successful (return `true`). This `console.error` can be hidden by setting `verbose` to `false`, or using a `customLogger` to [intercept it](https://github.com/nwutils/create-desktop-shortcuts/blob/main/src/library.js#L260).
       */
      overwrite?: boolean;
    }
  }): boolean;
  
  export = createDesktopShortcut;
}
