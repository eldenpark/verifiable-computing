const r = require.resolve;

const isProd = process.env.NODE_ENV === 'production';

const babelRc = {
  plugins: [
    [
      r('babel-plugin-module-resolver'), {
        alias: {
          '@@src': './src',
        },
      },
    ],
    [
      r('@babel/plugin-proposal-class-properties'), {
        loose: false,
      },
    ],
  ],
  presets: [
    [r('@babel/preset-env'), {
      targets: {
        node: '8.11',
      },
    }],
    r('@babel/preset-typescript'),
  ],
};

module.exports = babelRc;
