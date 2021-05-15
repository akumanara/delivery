const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WebpackMonitor = require('webpack-monitor');

const { merge } = require('webpack-merge');

const config = require('./webpack.config');

module.exports = merge(config, {
  mode: 'production',
  plugins: [
    new WebpackMonitor({
      capture: true,
      launch: true,
    }),
  ],
  devtool: false,
  output: {
    path: path.join(__dirname, 'public'),
  },
});
