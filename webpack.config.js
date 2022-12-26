const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: './src/test/test.ts',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.shader$/,
                type: "asset/source",
            },
            {
                test: /\.(jpg|png|svg)/,
                type: 'asset/resource',
            },
        ],
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'sACN2VideoCore',
            template: 'src/test/test.html'
        })
    ],

    output: {
        filename: '[fullhash].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },

    devServer: {
        compress: true,
        port: 80,
    },
};
