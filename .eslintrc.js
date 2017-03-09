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

    'space-before-function-paren': [1, { 'anonymous': 'never', 'named': 'never' }],
    'one-var': 0,
    'semi': [2, 'always', { 'omitLastInOneLineBlock': true }],
    'no-multiple-empty-lines': 0,
    'indent': [2, 2, { 'SwitchCase': 1, 'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3 } }],
    'no-var': 2,
    "no-extra-semi": 2
  }
}
