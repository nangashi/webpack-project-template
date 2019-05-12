const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default;
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = env => {
  const isProduction = env && env.production;
  const isClean = env && env.clean;
  const isAnalyze = env && env.analyze;

  const htmlWebpackPluginMinifyConfig = isProduction
    ? {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeComments: true,
      }
    : undefined;

  return {
    devtool: isProduction ? false : 'inline-source-map',
    mode: isProduction ? 'production' : 'development',
    // watch: true,
    entry: {
      main: './src/js/main.js',
      sub: './src/js/sub.js',
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
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            name: 'vendor',
            chunks: 'initial',
            enforce: true,
          },
        },
      },
      minimizer: [
        new TerserWebpackPlugin({
          sourceMap: true,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
        new OptimizeCssAssetsWebpackPlugin({
          cssProcessorPluginOptions: {
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          },
        }),
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
            {
              loader: 'htmllint-loader',
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
                  require('postcss-purgecss')({
                    content: ['src/html/**/*'],
                  }),
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
      ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
      ...(isClean ? [new CleanWebpackPlugin({})] : []),
      ...(isProduction
        ? [
            new ImageminWebpackPlugin({
              test: /\.png$/,
              pngquant: {
                quality: '70-80',
              },
            }),
          ]
        : []),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/html/template.html',
        chunks: ['main', 'vendor'],
        minify: htmlWebpackPluginMinifyConfig,
      }),
      new HtmlWebpackPlugin({
        filename: 'index2.html',
        template: 'src/html/template2.html',
        chunks: ['sub', 'vendor'],
        minify: htmlWebpackPluginMinifyConfig,
      }),
      // new ScriptExtHtmlWebpackPlugin({
      //   defaultAttribute: 'defer',
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
