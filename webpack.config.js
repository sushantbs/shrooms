var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackConfig;

if (process.env.NODE_ENV !== 'development') {
  webpackConfig = {
      entry: {
      	app: './react/app.jsx',
        vendor: ['react', 'material-ui']
      },
      output: {
        filename: './public/javascripts/script.js'
      },
      module: {
        loaders: [
          {
            //tell webpack to use jsx-loader for all *.jsx files
            test: /(\.jsx$)||(\.js$)/,
            exclude: /(node_modules)/,
            loaders: ['babel-loader?stage=0&optional[]=runtime']
          },
          {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!less')
          },
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css')
          },
          {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            loader: 'file-loader?limit=1000000&name=[name].[ext]'
          }
        ],
        noParse: [/\.(png|woff|woff2|eot|ttf|svg)$/]
      },
      plugins: [
      	new ExtractTextPlugin("./public/stylesheets/style.css", {allChunks: true}),
        new webpack.optimize.CommonsChunkPlugin('vendor', './public/javascripts/vendor.bundle.js')
      ],
      resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
          react: path.resolve('./node_modules/react'),
        }
      }
  };
}
else {

    webpackConfig = {
      entry: {
        app: ['webpack/hot/dev-server', './react/app.jsx']
      },
      output: {
        filename: './public/javascripts/script.js'
      },
      devtool: 'eval',
      module: {
        loaders: [
          {
            test: /(\.jsx$)||(\.js$)/,
            exclude: /(node_modules)/,
            loaders: ['react-hot', 'babel-loader?stage=0&optional[]=runtime']
          },
          {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!less')
          },
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css')
          },
          {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            loader: 'url-loader?limit=1000000'
          }
        ],
        noParse: [/\.(png|woff|woff2|eot|ttf|svg)$/]
      },
      plugins: [
      	new ExtractTextPlugin("./public/stylesheets/style.css", {allChunks: true})
      ],
      resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
          react: path.resolve('./node_modules/react'),
        }
      }
    };
}

module.exports = webpackConfig;
