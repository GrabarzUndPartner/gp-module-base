"use strict";

var path = require('upath');
var devtool = {
    development: 'eval-source-map',
    production: 'source-map'
};

module.exports = function(dest) {
    return {
        devtool: devtool[process.env.NODE_ENV],
        plugins: require('gp-boilerplate/env/config/webpack/plugins')(dest).reduce(reduceList, []),
        module: {
            rules: require('./loaders').reduce(reduceList, [])
        },
        resolve: {
            modules: [
                path.resolve(process.cwd(), '/test/js'),
                'node_modules'
            ],
            alias: {
                'jquery': 'jquery/src/core.js',
                'modernizr$': process.cwd() + '/env/config/modernizr/config.js'
            }
        }
    };
};

function reduceList(result, item) {
    if(item[process.env.NODE_ENV]) {
        result.push(item.config);
    }
    return result;
}
