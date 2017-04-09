path = require("path")
module.exports = {
    entry: {
        app: './app/ts/app',
        loader: './app-loader/app-loader'
    },
    output: {
        filename: '[name].js'
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
              loader: 'ts-loader' }
        ]
    }
}
