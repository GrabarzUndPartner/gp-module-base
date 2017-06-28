"use strict";

import Vector from './Vector';
import Bounds from './Bounds';
import AmpersandCollection from 'ampersand-collection';
import EnumItem from 'enum/dist/enumItem';

export default {
    dataTypes : {
        function : getDefinition('function', Function),
        enum: getDefinition('enum', EnumItem),
        Vector: getDefinition('Vector', Vector),
        Bounds: getDefinition('Bounds', Bounds),
        HTMLElement: getDefinition('HTMLElement', HTMLElement),
        AmpersandCollection: getDefinition('AmpersandCollection', AmpersandCollection)
    }
};


function getDefinition(type, constructor) {

    return {
        set : function(obj){
            if(obj instanceof constructor){
                return {
                    val : obj,
                    type : type
                };
            } else if(obj instanceof Object) {
                return {
                    val: new constructor(obj),
                    type: type
                };
            } else {
                return {
                    val : obj,
                    type : typeof obj
                };
            }
        },

        compare : function(currentObj, obj){
            return currentObj === obj;
        },

        default: function() {
            return new constructor();
        }
    };
}
