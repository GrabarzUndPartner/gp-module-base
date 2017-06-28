"use strict";


module.exports = [
    {
        development: true,
        production: false,
        config: {
            module: require('@danielbayerlein/hapi-webpack-middleware'),
            options: {
                webpack: Object.assign(require('gp-boilerplate/env/config/webpack/config')('app'), {
                    entry: {
                        app: ['./test/js/main','webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true']
                    },
                    output: {
                      path: '/dev/js',
                      filename: '[name].js',
                      publicPath: '/dev/js/',
                      library: ['[name]'],
                      chunkFilename: "app.[chunkhash].js"
                    }
                }),
                webpackDev: require('gp-boilerplate/env/config/hapi/server/dev'),
                webpackHot: require('gp-boilerplate/env/config/hapi/server/hot')
            }
        }
    }, {
        development: true,
        production: true,
        config: {
            module: require('gp-boilerplate-webserver/lib/hapi/route/static'),
            options: {
              config: {
                state: {
                  parse: false,
                  failAction: 'ignore'
                }
              }
            }
        }
    }, {
        development: true,
        production: false,
        config: {
            module: require('gp-boilerplate-webserver/lib/hapi/route/proxy'),
            options: {}
        }
    }
];
