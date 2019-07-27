module.exports = {
  'parserOptions': {
    'ecmaVersion': 2017
  },
  'env': {
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'brace-style':                 ['error', '1tbs', { 'allowSingleLine': true }],
    'comma-dangle':                ['error', 'never'],
    'comma-spacing':               ['error', { 'before': false, 'after': true }],
    'comma-style':                 ['error', 'last'],
    'curly':                       ['error'],
    'indent':                      ['error', 2, { 'SwitchCase': 1 }],
    'keyword-spacing':             ['error', { 'before': true, 'after': true }],
    'no-multi-spaces':             ['error'],
    'no-ternary':                  ['error'],
    'no-unused-vars':              ['error', { 'args': 'all' }],
    'one-var':                     ['error', 'never'],
    'quotes':                      ['error', 'single'],
    'semi':                        ['error', 'always'],
    'space-before-blocks':         ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'space-in-parens':             ['error', 'never'],
    'space-infix-ops':             ['error'],
    'spaced-comment':              ['error', 'always']
  }
};
