const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CONFS = require('./webpack.config.json');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEV = process.env.NODE_ENV === 'dev';

const pugs = fs.readdirSync(path.resolve(CONFS.PUG_SRC)).map((p) => CONFS.PUG_SRC + path.sep + p );

let cssLoaders = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      minimize: !DEV
    }
  }
];

if (!DEV) {
  cssLoaders.push({
    loader: 'postcss-loader',
    options: {
      plugins: (loader) => [
        require('autoprefixer')({
          // options telles que les navigateurs à supporter
        })
      ]
    }
  });  
}

let config = {
  entry: {
    app: [
      CONFS.SCSS_SRC,
      CONFS.JS_SRC,
      ...pugs
    ]
  },

  output: {
    path: path.resolve(CONFS.BUILD_TARGET),
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

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['eslint-loader']
      },
      {
        enforce: "pre",
        test: /\.(pug|jade)$/,
        exclude: /node_modules/,
        loader: "pug-lint-loader",
        options: require('./.pug-lintrc.js')
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
        use: ['pug-loader']
      },
      {
        test: /\.pug$/,
        include: path.join(__dirname, 'app/views/pages'),
        use: ['file-loader?name=[path][name].html', 'pug-html-loader?pretty&exports=false']
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
      // To-do: Comment to serve index.html
      /*inject   : true,
      template: './app/views/index.pug'*/
    }),
    new StyleLintPlugin()
  ],

  watch: DEV,

  devtool: DEV ? 'cheap-module-eval-source-map' : 'source-map',
  
  devServer: {
    // contentBase: path.resolve('dist'),
    overlay: {
      warnings: false,
      errors: true
    },
    open: true,
    // https: true,
    port: 3000,
    hotOnly: true,
    watchContentBase: true, // File changes will trigger a full page reload.
    /*setup(app){
      app.get('/some/path', function(req, res) {
        res.json({ custom: 'response' });
      });
    }*/
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
    new CleanWebpackPlugin([CONFS.BUILD_TARGET], {
      root: path.resolve('./'),
      verbose: true,
      dry: false
    })
  ]);
}
else {
  config.plugins.push(...[
    new webpack.HotModuleReplacementPlugin({
      // Options...
    })
  ])
}

module.exports = config
