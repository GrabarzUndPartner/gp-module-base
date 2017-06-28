/**
 * Copy js source files to root from installed package, for use relative path with require.
 * require("gp-module[-ui]-name/relative/path");
 * @version 0.1.0
 */

"use strict";

var fs = require('fs');
var upath = require('upath');

function isDependencyPackage(cb) {
    fs.exists(upath.join(__dirname, '../../node_modules/' , upath.basename(__dirname)), function(exists) {
        if (exists) {
            cb();
        }
    });
}

/**
 * Clean package root and exclude src
 */
function preparePackage() {
    var ignoreFiles = ['package.json', 'README.md', 'LICENSE.md', '.gitignore', '.npmignore'];
    var ignoreCopyFiles = [];
    var copyRecursiveSync = function(src, dest) {
        var exists = fs.existsSync(src);
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();
        if (exists && isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach(function(filename) {
                copyRecursiveSync(upath.join(src, filename),
                    upath.join(dest, filename));
            });
        } else {
            if (ignoreCopyFiles.indexOf(upath.basename(src)) === -1) {
                fs.linkSync(src, dest);
            }
        }
    };
    var srcPkg = upath.join(process.cwd(), 'src');
    if (fs.existsSync(srcPkg)) {
        fs.readdirSync(process.cwd()).forEach(function(filename) {
            var curPath = upath.join(process.cwd(), filename);
            if (ignoreFiles.indexOf(upath.basename(curPath)) === -1 && fs.statSync(curPath).isFile()) {
                fs.unlinkSync(curPath);
            }
        });
        copyRecursiveSync(srcPkg, process.cwd());
    }
    deleteFolderRecursive(srcPkg);
    deleteFolderRecursive(upath.join(process.cwd(), 'test'));
    deleteFolderRecursive(upath.join(process.cwd(), 'env'));
}

/**
 * Delete directories recursive.
 */
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

isDependencyPackage(preparePackage);
