"use strict";

import handlebars from 'handlebars/runtime';
import layouts from 'handlebars-layouts';
handlebars.registerHelper(layouts(handlebars));

function Template(hbs) {
    this.hbs = hbs;
}

Template.prototype.toText = function(data) {
    return this.hbs(data).replace(/(---[^><]+---)/gi, '');
};

Template.prototype.toFragment = function(data) {
    return document.createRange().createContextualFragment(this.toText(data));
};

export default Template;
