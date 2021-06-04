const path = require('path');
const webpack = require('webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const mode = 'development';
const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
  mode,
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'app.js',
  },
  // plugins: [
  //   new BundleAnalyzerPlugin({
  //     generateStatsFile: true,
  //   }),
  // ],
  plugins: [
    new webpack.DefinePlugin({
      MODE: JSON.stringify(mode),
      VERSION: JSON.stringify(gitRevisionPlugin.version()),
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
    }),
    // new SentryWebpackPlugin({
    //   // sentry-cli configuration
    //   authToken:
    //     '79458b3f31114f14a40b202c31d3c9ffda043efd558e4617b75305fbe186a7c3',
    //   org: 'ants-bq',
    //   project: 'deliverygr',
    //   release: `delivery@${JSON.stringify(gitRevisionPlugin.version())}`,

    //   // webpack specific configuration
    //   include: '.',
    //   ignore: ['node_modules', 'webpack.config.js'],
    // }),
  ],
  devtool: mode === 'development' ? 'eval' : false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env']],
          },
        },
      },
    ],
  },
};
