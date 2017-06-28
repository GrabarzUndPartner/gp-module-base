"use strict";

module.exports = [
    {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.js$/,
            enforce: 'pre',
            exclude: /node_modules/,
            loader: 'jshint-loader'
        }
    }, {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            ]
        }
    }, {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.hbs$/,
            use: [
                {
                    loader: 'handlebars-loader',
                    options: {
                        helperDirs: [

                        ],
                        runtime: 'handlebars/runtime',
                        partialDirs: [
                            process.cwd() + '/test/tmpl/partials'
                        ],
                        debug: false
                    }
                }
            ]
        }
    }, {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.(p)?css$/,
            use: [
                {
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: require('gp-boilerplate/env/config/postcss/config.js')
                }
            ]
        }
    }, {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.(png|jpg|gif|svg|ttf|woff|eot)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 100000
                    }
                }
            ]
        }
    }, {
        development: true,
        production: true,
        build: true,
        config: {
            test: /\.modernizr.js$/,
            use: [
                {
                    loader: 'imports-loader',
                    options: {
                        window: 'global'
                    }
                },{
                    loader: 'modernizr-loader'
                }
            ]
        }
    }
];
