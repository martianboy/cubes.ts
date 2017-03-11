module.exports = {
    entry: './lib/index.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'cubes.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    },

    resolve: {
        extensions: ['.js', '.ts']
    }
};