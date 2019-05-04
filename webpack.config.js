const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default;
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');

const htmlWebpackPluginMinifyConfig = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  removeComments: true,
};

module.exports = env => {
  const isProduction = env && env.production;

  return {
    devtool: isProduction ? false : 'inline-source-map',
    mode: 'development',
    // watch: true,
    entry: {
      main: './src/js/main.js',
      // sub: './src/js/sub.js'
    },
    output: {
      filename: 'js/[name].bundle.js',
      path: path.join(__dirname, 'dist'),
    },
    resolve: {
      alias: {
        images: path.resolve(__dirname, 'src/images/'),
        css: path.resolve(__dirname, 'src/css/'),
      },
    },
    optimization: {
      minimizer: [
        new TerserWebpackPlugin({
          sourceMap: true,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
        // new OptimizeCssAssetsWebpackPlugin({}),
      ],
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(js)$/,
          exclude: /node_modules/,
          loader: 'eslint-loader', // TODO:
        },
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: [
            {
              // 利用するローダー
              loader: 'babel-loader',
              // ローダーのオプション
              options: {
                presets: [['@babel/preset-env', { modules: false }]],
              },
            },
          ],
        },
        {
          test: /\.(html)$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('autoprefixer')({
                    grid: true,
                  }),
                  require('postcss-preset-env')(),
                ],
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                fallback: 'file-loader?outputPath=images',
                limit: 8192,
                name(file) {
                  let imgPath = file.replace(/([\\\/])[^\\\/]*?$/, '/').replace(/^.*images[\\\/]/, '');
                  return imgPath + '[name].[ext]';
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        dry: !isProduction,
      }),
      new ImageminWebpackPlugin({
        test: isProduction ? /\.png$/ : /.^/,
        pngquant: {
          quality: '70-80',
        },
      }),
      new ImageminWebpWebpackPlugin({
        config: [
          {
            test: isProduction ? /\.(jpe?g|png)$/ : /.^/,
            options: {
              quality: 60,
            },
          },
        ],
        overrideExtension: true,
        detailedLogs: false,
        strict: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/html/template.html',
        chunks: ['main'],
        minify: htmlWebpackPluginMinifyConfig,
      }),
      // new HtmlWebpackPlugin({
      //   filename: 'index2.html',
      //   template: 'src/html/template2.html',
      //   chunks: ['main', 'sub'],
      //   minify: htmlWebpackPluginMinifyConfig
      // }),
      new MiniCssExtractPlugin({
        filename: 'css/style.css',
      }),
      new CopyWebpackPlugin([{ from: 'assets', to: '' }]),
      new StylelintWebpackPlugin(),
    ],
    devServer: {
      open: true,
      openPage: '',
      contentBase: path.join(__dirname, 'dist'),
      watchContentBase: true,
      port: 3000,
    },
  };
};
