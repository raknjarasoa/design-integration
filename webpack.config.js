const path = require('path');
const webpack = require('webpack');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEV = process.env.NODE_ENV === 'dev';

// config css
let cssLoaders = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      minimize: !DEV
    }
  }
];

let config = {
  entry: {
    // servira de nommage pour le css
    // par défaut main.css
    app: ['./app/styles/app.scss', './app/scripts/app.js']
  },

  output: {
    path: path.resolve('./dist'),
    // récupère le nom donné en entrée, par défaut bundle.js
    filename: DEV ? '[name].js' : '[name].[chunkhash].js',
    publicPath: 'dist/'
  },

  resolve: {
    alias: {
      '@css': path.resolve('./app/styles/'),
      '@js': path.resolve('./app/scripts/')
    }
  },

  // loaders
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['eslint-loader']
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        // loader de droite chargé en premier !!
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssLoaders
        })
      },
      {
        test: /\.scss$/,
        exclude: /(node_modules)/,
        // loader de droite chargé en premier !!
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [...cssLoaders, 'sass-loader']
        })
      },
      {
        test: /\.(woff2?|eot|ttf|otf|wav)(\?.*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash:7].[ext]',
              limit: 8192
            }
          },
          {
            loader: 'img-loader',
            options: {
              enabled: !DEV
            }
          }
        ]
      },
      {
        test: /\.pug$/,
        // include: path.join(__dirname, 'app'),
        use: ['pug-loader']
      }
    ]
  },

  // plugins
  plugins: [
    new ExtractTextPlugin({
      filename: DEV ? '[name].css' : '[name].[contenthash:8].css',
      disable: DEV
    }),
    new HtmlWebpackPlugin({
      inject   : true,
      template: './app/views/index.pug'
    }),
    new StyleLintPlugin()
  ],

  watch: DEV,

  devtool: DEV ? 'cheap-module-eval-source-map' : 'source-map',
  
  devServer: {
    // affiche les erreurs en overlay dans le navigateur
    overlay: true,
    contentBase: path.resolve('./dist')
  }

}

// prod : minification
if (!DEV) {
  config.plugins.push(...[
    new UglifyJSPlugin({
      // si l'on veut les source map en prod
      sourceMap: true
    }),
    new ManifestPlugin(),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve('./'),
      verbose: true,
      dry: false
    })
  ])

  cssLoaders.push({
    loader: 'postcss-loader',
    options: {
      plugins: (loader) => [
        require('autoprefixer')({
          // options telles que les navigateurs à supporter
        })
      ]
    }
  })
}
else {
  config.plugins.push(...[
    new webpack.HotModuleReplacementPlugin({
      // Options...
    })
  ])
}

module.exports = config
