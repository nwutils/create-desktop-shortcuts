const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function isString (variable) {
  return (
    typeof(variable) === 'string' ||
    Object.prototype.toString.call(variable) === '[object String]'
  );
}

function makeSync (options) {
  if (fs.existsSync(options.filepath) === false) {
    return new Error('File "' + options.filepath + '" does not exist');
  }

  const vbsScript = path.join(__dirname, 'scripts', 'lnk.vbs');
  const rawName = path.parse(options.filepath).name;

  if (!isString(options.lnkName)) {
    options.lnkName = rawName;
  }
  if (!isString(options.lnkArgs)) {
    options.lnkArgs = '';
  }
  if (!isString(options.lnkDes)) {
    options.lnkDes = rawName;
  }
  if (!isString(options.lnkCwd)) {
    options.lnkCwd = '';
  }
  if (!isString(options.lnkIco)) {
    options.lnkIco = filepath;
  }
  if (!isString(options.lnkWin)) {
    options.lnkWin = 4;
  }
  if (!isString(options.lnkHtk)) {
    options.lnkHtk = '';
  }

  child_process.spawnSync(
    'wscript',
    [
      vbsScript,
      options.filepath,
      options.lnkName,
      options.lnkArgs,
      options.lnkDes,
      options.lnkCwd,
      options.lnkIco,
      options.lnkWin,
      options.lnkHtk
    ]
  )
};

module.exports = {
  makeSync: makeSync
}