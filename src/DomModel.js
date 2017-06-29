"use strict";

import AmpersandModel from 'ampersand-model';
import dataTypeDefinition from './dataTypeDefinition';

export default AmpersandModel.extend(dataTypeDefinition, {

    initialize: function() {
        AmpersandModel.prototype.initialize.apply(this, arguments);
    }
});
