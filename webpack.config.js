const path = require('path');
const webpack = require('webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

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
