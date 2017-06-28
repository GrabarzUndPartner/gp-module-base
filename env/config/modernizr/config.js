"use strict";

module.exports = {
    'minify': true,
    'options': [
        'setClasses',
        'addTest',
        'prefixedCSS'
    ],
    'feature-detects': [
        'touchevents',
        'dom/passiveeventlisteners'
    ]
};
