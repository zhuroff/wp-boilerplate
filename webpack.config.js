const THEME_NAME = 'boilerplate'
const PATH = require('path')
const fs = require('fs')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const SrcManifest = require('./src/utils/SrcManifest')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const pugPages = fs.readdirSync(PATH.resolve(__dirname, 'src/pug/pages/')).filter(fileName => fileName.endsWith('.pug'))
const isDev = process.env.NODE_ENV === 'frontend' || process.env.NODE_ENV === 'backend'

const browserSyncConfig = {
  frontend: {
    files: './src',
    port: 4200,
    server: { baseDir: './dist' }
  },

  backend: {
    files: '*.php',
    port: 8080,
    proxy: `http://${THEME_NAME}/`
  }
}

const setFilename = ext => `[name].[contenthash:7].${ext}`

const fileOptimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (!isDev) {
    config.minimizer = [
      new CssMinimizerPlugin(),
      new CssMinimizerPlugin(),
      new UglifyJsPlugin()
    ]
  }

  return config
}

const addPlugins = () => {
  const plugins = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: PATH.resolve(__dirname, 'src/static'),
          to: PATH.resolve(__dirname, 'dist/static')
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: setFilename('css'),
      chunkFilename: 'chunk.[id].css',
    }),

    new SrcManifest()
  ]

  if (process.env.NODE_ENV === 'frontend' || process.env.NODE_ENV === 'production') {
    plugins.push(
      ...pugPages.map(page => new HTMLWebpackPlugin({
        template: `${PATH.resolve(__dirname, 'src/pug/pages/')}/${page}`,
        filename: `./${page.replace(/\.pug/, '.html')}`,
        minify: false
      }))
    )
  }

  if (isDev) {
    plugins.push(
      new BrowserSyncPlugin({
        ...browserSyncConfig[process.env.NODE_ENV],
        reloadDelay: 0,
        host: 'localhost'
      })
    )
  }

  return plugins
}

const babelOptions = preset => {
  const options = {
    presets: [
      '@babel/preset-env'
    ],

    plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
  }

  if (preset) options.presets.push(preset)

  return options
}

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: babelOptions()
    }
  ]

  return loaders
}

const cssLoaders = loader => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader
    },
    
    {
      loader: 'css-loader',
      options: { url: false }
    }
  ]

  if (loader) loaders.push(loader)

  return loaders
}

module.exports = {
  context: PATH.resolve(__dirname, 'src'),

  entry: {
    main: './index.js'
  },

  output: {
    filename: setFilename('js'),
    path: PATH.resolve(__dirname, 'dist'),
    clean: true
  },

  resolve: {
    alias: {
      '~': PATH.resolve(__dirname, 'src'),
      '@': PATH.resolve(__dirname, 'dist')
    }
  },

  optimization: fileOptimization(),

  mode: isDev ? 'development' : 'production',

  plugins: addPlugins(),

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },

      {
        test: /\.css$/,
        use: cssLoaders()
      },

      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },

      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true
        }
      },

      {
        test: /\.(png|jpeg|jpg|svg|gif|webp)$/,
        loader: 'url-loader',
        options: {
          name: `${PATH.resolve(__dirname, 'dist')}/[path][name].[ext]`
        }
      },

      {
        test: /\.(ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          name: `${PATH.resolve(__dirname, 'dist')}/[path][name].[ext]`
        }
      }
    ]
  }
}