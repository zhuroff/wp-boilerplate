const PATH = require('path')
//const fs = require('fs')
const SrcManifest = require('./src/utils/SrcManifest')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const is_dev = process.env.NODE_ENV === 'development'
// const paths = {
// 	pug: PATH.resolve(__dirname, 'src/pug/pages/'),
// 	scss: PATH.resolve(__dirname, 'src/scss'),
// 	js: PATH.resolve(__dirname, 'src/js'),
// 	build: PATH.resolve(__dirname, 'dist')
// }

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
		// ...PUG_PAGES.map(page => new HTMLWebpackPlugin({
		// 	template: `${paths.pug}/${page}`,
		// 	filename: `./${page.replace(/\.pug/, '.html')}`,
		// 	minify: false
		// })),

		// ,

		// new LiveReloadPlugin({
		// 	appendScriptTag: true
		// }),

		// new CopyWebpackPlugin({
		// 	patterns: [
		// 		{
		// 			from: PATH.resolve(__dirname, 'src/static'),
		// 			to: PATH.resolve(__dirname, `${paths.dist}/static`)
		// 		}
		// 	]
		// }),

		new MiniCssExtractPlugin({
      filename: setFilename('css'),
      chunkFilename: 'chunk.[id].css',
		}),

    new SrcManifest()
	]

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
			//hmr: is_dev,
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

      // {
			// 	test: /\.pug$/,
			// 	loader: 'pug-loader',
			// 	rules: {
			// 		pretty: true
			// 	}
			// },

      {
				test: /\.(png|jpeg|jpg|svg|gif|webp)$/,
				loader: 'file-loader',
				options: {
					name: `${PATH.resolve(__dirname, 'dist')}/[path][name].[ext]`
				}
			},

			{
				test: /\.(ttf|woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: `${PATH.resolve(__dirname, 'dist')}/[path][name].[ext]`
				}
			}
    ]
  },

  //devtool: is_dev ? 'source-map' : '',

  // devServer: {
  //   port: 4200,
	// 	hot: is_dev
  // }
}