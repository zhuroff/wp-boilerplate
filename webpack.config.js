const templating_mode = 'php' // variants: 'php', 'pug'
const PATH = require('path')
const fs = require('fs')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const SrcManifest = require('./src/utils/SrcManifest')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const pug_pages = fs.readdirSync(PATH.resolve(__dirname, 'src/pug/pages/')).filter(fileName => fileName.endsWith('.pug'))
const is_dev = process.env.NODE_ENV === 'development'

const setFilename = ext => `[name].[contenthash:7].${ext}`

const fileOptimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	}

	if (!is_dev) {
		config.minimizer = [
			new OptimizeCssAssetsWebpackPlugin(),
			new UglifyJsPlugin()
		]
	}

	return config
}

const addPlugins = () => {
  const plugins = [
    new CleanWebpackPlugin(),

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

	if (templating_mode === 'pug') {
		plugins.push(
			...pug_pages.map(page => new HTMLWebpackPlugin({
				template: `${PATH.resolve(__dirname, 'src/pug/pages/')}/${page}`,
				filename: `./${page.replace(/\.pug/, '.html')}`,
				minify: false
			}))
		)
	}

	if (is_dev) {
		plugins.push(
			new BrowserSyncPlugin({
				files: ['./src/', '*.php'],
				reloadDelay: 0,
				host: 'localhost',
				port: 8080,
				proxy: 'http://wp-boilerplate:8080/'
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

	if (is_dev) loaders.push('eslint-loader')

	return loaders
}

const cssLoaders = loader => {
  const loaders = [{
		loader: MiniCssExtractPlugin.loader,
		options: {
			publicPath: '../../../'
		}
	}, 'css-loader']

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
    path: PATH.resolve(__dirname, 'dist')
  },

	resolve: {
		alias: {
			'~': PATH.resolve(__dirname, 'src')
		}
	},

  optimization: fileOptimization(),

  mode: is_dev ? 'development' : 'production',

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
  },

  //devtool: is_dev ? 'source-map' : ''
}