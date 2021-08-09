/**
 * @file    Linting rules, plugins, and configurations
 * @author  TheJaredWilcurt
 */

module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2017,
    requireConfigFile: false
  },
  env: {
    es6: true,
    node: true,
    jest: true
  },
  extends: [
    'tjw-base',
    'tjw-jest',
    'tjw-jsdoc'
  ]
};
