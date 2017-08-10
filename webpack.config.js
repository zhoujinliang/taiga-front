CopyWebpackPlugin = require('copy-webpack-plugin');
HtmlWebpackPlugin = require('html-webpack-plugin');
path = require("path");
var version = "v-" + Date.now();

module.exports = {
    entry: './app/main',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'app.' + version + '.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            moment: path.join(__dirname, "node_modules/moment/moment"),
            bluebird: path.join(__dirname, "node_modules/bluebird/js/release/bluebird")
        },
    },
    module: {
        loaders: [
            { test: /\.ts$/,
              exclude: /\.spec\.ts$/,
              loader: 'ts-loader' },
            { test: /\.(pug|jade)$/,
              loader: 'pug-loader' },
            { test: /\.css$/,
              loaders: [
                  { loader: "style-loader" },
                  { loader: "css-loader" }
              ]
            },
            { test: /\.scss$/,
              loaders: [
                  { loader: "style-loader" },
                  { loader: "css-loader" },
                  { loader: "sass-loader",
                    options: {includePaths: [
                      path.join(__dirname, "app", "styles"),
                      path.join(__dirname, "app", "styles", "extras"),
                      path.join(__dirname, "app", "themes", "taiga")
                    ]}}
              ]
            },
            {
              test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10000,
                    mimetype: 'application/font-woff'
                  }
                }
              ]
            },
            {
              test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: [
                { loader: 'file-loader' }
              ]
            },
            {
              test: /\.(png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: [
                { loader: 'file-loader' }
              ]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'app/assets/', to: version },
            { from: 'node_modules/jquery/dist/jquery.min.js', to: version + "/js" },
            { from: 'app/locales', to: version + "/locales" },
            { from: 'node_modules/moment/locale/', to: version + "/locales/moment-locales/" },
        ]),
        new HtmlWebpackPlugin({
          version: version,
          template: 'app/index.pug'
        })
    ],

    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9001
    }
}

