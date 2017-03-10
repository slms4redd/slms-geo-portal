// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

    'indent': [2, 2, { 'SwitchCase': 1, 'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3 } }],
    'no-extra-semi': 2,
    'object-curly-spacing': [2, 'always', { objectsInObjects: true }],
    'max-statements-per-line': ['error', { 'max': 1 }],
    'no-var': 2,
    'one-var': 0,
    'prefer-const': 2,
    'semi': [2, 'always', { 'omitLastInOneLineBlock': true }],
    'space-before-function-paren': [2, { 'anonymous': 'never', 'named': 'never' }]
  }
}
