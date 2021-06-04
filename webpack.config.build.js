const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const WebpackMonitor = require('webpack-monitor');
const webpack = require('webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

const { merge } = require('webpack-merge');

const config = require('./webpack.config');

const mode = 'production';

module.exports = merge(config, {
  mode,
  // plugins: [
  //   new WebpackMonitor({
  //     capture: true,
  //     launch: true,
  //   }),
  // ],
  plugins: [
    new webpack.DefinePlugin({
      MODE: JSON.stringify(mode),
      VERSION: JSON.stringify(gitRevisionPlugin.version()),
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
    }),
  ],
  devtool: false,
  output: {
    path: path.join(__dirname, 'public'),
  },
});
