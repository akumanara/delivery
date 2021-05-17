// const { EnvironmentPlugin } = require('webpack');

const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'app.js',
  },
  // plugins: [
  //   new BundleAnalyzerPlugin({
  //     generateStatsFile: true,
  //   }),
  // ],
  // plugins: [
  //   new EnvironmentPlugin({
  //     NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
  //     DEBUG: false,
  //   }),
  // ],
  // stats: 'verbose',
  devtool: 'eval',
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
