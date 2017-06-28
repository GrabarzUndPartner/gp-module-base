"use strict";

import Controller from '../Controller';
import DomModel from '../DomModel';
import Vector from '../Vector';
import viewport from 'gp-module-viewport';
import anime from 'animejs';

export default Controller.extend({

    startNodePosition: new Vector(),
    startNodeDimension: new Vector(),

    origin: new Vector(),

    startScale: new Vector(),
    endScale: new Vector(),

    startPosition: new Vector(),
    endPosition: new Vector(),

    modelConstructor: DomModel.extend({

        session: {
            transformStartDelay: {
                type: 'number',
                required: true,
                default: 0
            },
            transformEndDelay: {
                type: 'number',
                required: true,
                default: 0
            },

            lastNode: {
                type: 'object',
                required: false
            },
            lastNodeHelpers: {
                type: 'object',
                required: false
            },
            transformEasing: {
                type: 'string',
                required: true,
                default: 'linear'
            },

            transformDuration: {
                type: 'number',
                required: true,
                default: 1200
            },

            transformCreateHelper: {
                type: 'boolean',
                required: true,
                default: true
            },

            transformHelpers: {
                type: 'AmpersandCollection',
                required: true
            },

            transformHelperSelector: {
                type: 'string',
                required: true,
                default: function() {
                    return '[data-transform-helper-name]';
                }
            },
            triggerEvent: {
                type: 'string',
                required: true,
                default: function() {
                    return '.transform-helper';
                }
            },
            transformName: {
                type: 'string',
                required: false
            },
            transformRunning: {
                type: 'boolean',
                required: true
            },
            transformEnded: {
                type: 'boolean',
                required: true
            }
        },

        addHelper: function(node, name, global) {
            var helper = createHelper(this, node, name);
            helper.global = global || false;
            return this.transformHelpers.add(helper);
        },


        /**
         * Startet die Transformation oder transformiert zurück.
         * @param  {HTMLElement} node  Start Element zum Transformieren
         * @param  {Array} helpers Liste an Helper (Enthaltene Elemente aus dem "node")
         */
        startTransform: function(node, helpers) {
            this.trigger('Transform:start', node || this.lastNode, helpers || this.lastNodeHelpers);
        }

    }),

    bindings: {
        'model.transformRunning': {
            type: 'booleanClass',
            name: 'js-transform-running'
        },
        'model.transformEnded': {
            type: 'booleanClass',
            name: 'js-transform-ended'
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        this.model.transformHelpers.on('add', onAddTransformHelpers, this);
        this.model.on('Transform:start', onTransformStart, this);
        $(document).on('click', '[data-transform-target-name]', function(e) {
            if (e.currentTarget.getAttribute('data-transform-target-name') === this.model.transformName) {
                var helpers = [];
                e.currentTarget.querySelectorAll('[data-transform-helper]').forEach(function(helper) {
                    helpers.push(helper);
                });
                this.model.startTransform(e.currentTarget, helpers);
            }
        }.bind(this));

        this.setupHelpers();

        viewport
            .on(viewport.EVENT_TYPES.SCROLL, this.onViewportResize.bind(this))
            .on(viewport.EVENT_TYPES.RESIZE, this.onViewportResize.bind(this))
            .on(viewport.EVENT_TYPES.INIT, this.onViewportInit.bind(this));

    },

    setupHelpers: function() {
        this.el.querySelectorAll(this.model.transformHelperSelector).forEach(function(helper) {
            this.model.addHelper(helper, null, true);
        }.bind(this));
    },

    destroy: function() {
        Controller.prototype.destroy.apply(this, arguments);
        viewport.off(viewport.EVENT_TYPES.INIT, this.onViewportInit.bind(this)).off(viewport.EVENT_TYPES.RESIZE, this.onViewportResize.bind(this));
    },

    onViewportInit: function() {
        refresh(this);
    },
    onViewportResize: function() {
        if (!(this.model.transformEnded && !this.model.transformRunning)) {
            refresh(this);
        }
    },

    onTransformStart: function() {},
    onTransformEnded: function() {
        if (!this.model.transformEnded) {
            this.lastClientRect = null;
            refresh(this);
        }
    }

});

function delay(time) {
    return new Promise(function(resolve) {
        if (time >= 0) {
            global.animationFrame.add(function(value) {
                if (value >= 1) {
                    resolve();
                }
            }, time);
        } else {
            resolve();
        }
    });
}

/*
 * Events
 */

function onTransformStart(node, nodeHelpers) {
    if (!this.model.transformRunning) {
        this.model.transformRunning = true;

        delay(this.model.transformEnded ? this.model.transformEndDelay : this.model.transformStartDelay).then(function() {

            this.node = node || this.model.lastNode;
            this.nodeHelpers = nodeHelpers || this.model.lastNodeHelpers;

            getHelperPositions(this, this.node, this.nodeHelpers).then(function(data) {

                // @TODO kann weg
                // data.helpers.forEach(function(helper) {
                //     helper.el.classList.add('transform-helper-prepare');
                // });
                //
                // Tweens
                var tween = anime({
                    targets: data.targets,
                    translateX: function(el, index) {
                        return [data.translateX[index], data.translateX[index]];
                    },
                    translateY: function(el, index) {
                        return [data.translateY[index], data.translateY[index]];
                    },
                    scale: function(el, index) {
                        return data.translateScale[index];
                    },
                    opacity: 1,
                    easing: this.model.transformEasing,
                    direction: this.model.transformEnded ? 'reverse' : 'normal',
                    duration: this.model.transformDuration,
                    autoplay: false,
                    begin: function() {
                        this.onTransformStart();
                        if (!this.model.transformEnded) {
                            data.helpers.forEach(function(helper) {
                                setCSS(this, helper);
                                helper.el.classList.add('transform-helper', 'transform-helper-prepare');
                            }.bind(this));
                        }
                    }.bind(this),
                    complete: function() {
                        this.model.transformEnded = !this.model.transformEnded;

                        this.model.lastNodeHelpers = nodeHelpers;
                        this.model.transformRunning = false;
                        if (!this.model.transformEnded && this.model.lastNode) {
                            this.model.lastNode.style.cssText = '';
                        }
                        this.model.lastNode = this.node;
                        if (this.model.transformEnded) {
                            data.helpers.forEach(function(helper) {
                                if (helper.options.hideComplete) {
                                    helper.el.classList.remove('transform-helper-prepare');
                                    helper.el.style.cssText = '';
                                }
                            }.bind(this));
                        } else {
                            data.helpers.forEach(function(helper) {
                                helper.el.classList.remove('transform-helper', 'transform-helper-prepare');
                                helper.el.style.cssText = '';
                                this.model.lastNode = null;
                            }.bind(this));
                        }

                        this.onTransformEnded();
                    }.bind(this)
                });
                tween.play();
            }.bind(this));
        }.bind(this));
    }


}

function getHelperPositions(scope, node, nodeHelpers) {
    return getAbsoluteOffset(scope, node).then(function(absoluteOffset) {
        var clientRect = this.lastClientRect || node.getBoundingClientRect();
        if (this.lastClientRect) {
            this.lastClientRect = null;
        } else {
            this.lastClientRect = clientRect;
        }
        var targets = [],
            translateX = [],
            translateY = [],
            translateScale = [],
            helpers = [].concat(this.model.transformHelpers.models);
        if (nodeHelpers.length > 0) {
            nodeHelpers.forEach(function(nodeHelper) {
                helpers.push(createHelper(this.model, nodeHelper));
            }.bind(this));
        } else {
            helpers = this.model.transformHelpers;
        }

        helpers.forEach(function(helper) {
            var offset;
            if (helper.global) {
                offset = (new Vector()).resetValues(0, -viewport.scrollY);
            } else {
                offset = (new Vector()).reset(absoluteOffset);
            }
            calculatePosition(this, clientRect, helper, nodeHelpers, offset);

            targets.push(helper.el);
            translateX.push(this.endPosition.x * 100 + '%');
            translateY.push(this.endPosition.y * 100 + '%');
            translateScale.push([
                [this.startScale.x, this.startScale.y],
                [this.endScale.x, this.endScale.y]
            ]);
        }.bind(this));



        return {
            helpers: helpers,
            targets: targets,
            translateX: translateX,
            translateY: translateY,
            translateScale: translateScale
        };

    }.bind(scope));
}

function onAddTransformHelpers(helper) {
    var node = document.createElement('span');
    helper.el = node;
    node.classList.add('transform-helper', 'transform-helper-' + helper.name.toLowerCase().replace(/[^0-9a-z_-]/, ''), 'transform-helper-hidden');
    document.body.appendChild(node);
}

/*
 * Functions
 */

function getAbsoluteOffset(scope, node) {
    return new Promise(function(resolve) {
        requestAnimationFrame(function() {

            var rect = node.getBoundingClientRect();
            resolve(new Vector(rect.left, rect.top));
        });
    }).then(function(vector) {
        return vector;
    });
}


function calculatePosition(scope, clientRect, helper, nodeHelpers, absoluteOffset) {
    refresh(scope, helper);

    scope.startNodePosition.resetValues(clientRect.left, clientRect.top).divideLocal(viewport.dimension);
    scope.startNodeDimension.resetValues(clientRect.width, clientRect.height).divideLocal(viewport.dimension);


    absoluteOffset.divideLocal(viewport.dimension);

    scope.startNodePosition.subtractLocal(absoluteOffset);
    helper.endNodePosition.subtractLocal(absoluteOffset);

    // calculate positions
    scope.startPosition.reset(scope.startNodePosition).multiplyLocal(scope.startNodeDimension);

    scope.endPosition.reset(helper.endNodePosition).multiplyLocal(new Vector(1, 1).divideLocal(helper.endNodeDimension));


    // sets scales
    scope.startScale.reset(scope.startNodeDimension).divideLocal(helper.endNodeDimension);
    scope.endScale.resetValues(1, 1);


    var x = (scope.startNodePosition.x - helper.endNodePosition.x) / (helper.endNodeDimension.x - scope.startNodeDimension.x);
    var y = (scope.startNodePosition.y - helper.endNodePosition.y) / (helper.endNodeDimension.y - scope.startNodeDimension.y);

    helper.origin = new Vector(x, y);
}

function setCSS(scope, helper) {

    helper.el.style.cssText = [
        'width: ' + helper.endNodeDimension.x * viewport.dimension.x + 'px;', 'height: ' + helper.endNodeDimension.y * viewport.dimension.y + 'px;',
        'transform: translate(' + scope.endPosition.x * 100 + '%, ' + scope.endPosition.y * 100 + '%) scale(' + [scope.startScale.x, scope.endScale.x][scope.model.transformEnded ? 1 : 0] + ', ' + [scope.startScale.y, scope.endScale.y][scope.model.transformEnded ? 1 : 0] + ');',
        'transform-origin: ' + helper.origin.x * 100 + '% ' + helper.origin.y * 100 + '% ;'
    ].join(' ');
}

function refresh(scope, helper) {
    (helper ? [helper] : scope.model.transformHelpers).forEach(function(helper) {
        var clientRect = helper.endNode.getBoundingClientRect();
        helper.endNodePosition.resetValues(clientRect.left, clientRect.top).divideLocal(viewport.dimension);
        helper.endNodeDimension.resetValues(clientRect.width, clientRect.height).divideLocal(viewport.dimension);
    });

}

function createHelper(scope, node, name) {
    var endNode = node;
    if (node.getAttribute('data-transform-helper')) {
        endNode = scope.transformHelpers.models.find(function(helper) {
            if (helper.name === node.getAttribute('data-transform-helper')) {
                return true;
            }
        }).endNode;
    }
    return {
        el: node,
        endNode: endNode,
        name: name || node.getAttribute('data-transform-helper-name'),
        endNodePosition: new Vector(),
        endNodeDimension: new Vector(),
        options: {
            /**
             * Wenn gesetzt, bleibt der Helper auf seiner Position stehen, wenn die Transformation Komplett ist.
             */
            hideComplete: node.getAttribute('data-transform-hide-complete')
        }
    };
}
