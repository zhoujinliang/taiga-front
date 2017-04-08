module.exports = {
    entry: './app/ts/app.ts',
    output: {
        filename: './dist/app.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/,
              exclude: /\.spec\.ts$/,
              loader: 'ts-loader' }
        ]
    }
}
