"use strict";

import Controller from '../Controller';
import DomModel from '../DomModel';
import Template from '../Template';

export default Controller.extend({
    tmpl: null,
    modelConstructor: DomModel.extend({
        session: {
            chunkName: {
                type: 'string',
                required: true
            }
        }
    }),

    initialize: function(options) {
        options.parentEl.append(new Template(this.tmpl).toFragment(options.optionalsAttributes || {}));
        this.el = options.parentEl.children[options.parentEl.children.length - 1];
        Controller.prototype.initialize.apply(this, arguments);
    }

});
