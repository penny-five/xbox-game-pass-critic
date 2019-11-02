const path = require('path');

const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals()],
  stats: 'minimal',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.hbs$/,
        use: [
          {
            loader: 'handlebars-loader',
            options: {
              partialDirs: [path.join(__dirname, 'src/views/partials')],
              helperDirs: [path.join(__dirname, 'src/views/helpers')]
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader']
      }
    ]
  }
};
