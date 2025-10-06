const config = require('./support/base.babel');

module.exports = {
  ...config,
  babelrcRoots: [
    '.',
    'packages/remirror__*',
    'packages/*'
  ],
  sourceType: 'unambiguous',
};
