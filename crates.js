
/**
 *
 * @author Alexander Mihaylov <lex.mihaylov@gmail.com>
 * @module Crates
 * @license MIT
 *
 * CratesJS is a shared store libriary that has the capabilities of creating
 * a polymer 1.0 style behavior that can leverege the two-way binding between
 * the store elements and the elements that he is used in. This library is a way
 * to efficiently communicate between different parts of the application without
 * using untracable pub-sub signals.
 */
(function(root, namespace, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else if('Polymer' in root) {
        root.Polymer[namespace] = factory();
    } else {
        root[namespace] = factory();
    }
})(this, 'Crates', function() {
    'use strict';

    if (typeof Object.assign != 'function') {
        Object.assign = function(target, varArgs) { // .length of function is 2
            if (target === null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource !== null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    /**
     * gets or set a value in a map
     * @param  {Object} context
     * @param  {String} path
     * @param  {mixed} value
     * @return {undefined|mixed}
     */
    var tracePath = function(context, path, value) {
        if(!value) {
            return context[path];
        }

        context[path] = value;
    };

    var Crate = (function() {
        /**
         * @typedef {Object} ObserverIdentity
         * @property {String} path
         * @property {Function} handler
         */

        /**
         * Creates a store that can be used to share information between different
         * components via events
         * @constructor
         * @param {Object} payload
         */
        var Crate = function(payload) {
            this._payload = payload;
            this._observers = {};
        };

        /**
         * set a store property and disptch an event to all the observers
         * listening for a change
         * @param {String} path
         * @param {Mixed} value
         * @param {[Boolean=true]} notify
         */
        Crate.prototype.set = function(path, value, notify) {
            if(notify === undefined || notify === null) {
                notify = true;
            }

            tracePath(
                this._payload,
                path,
                this.cloneComplexOrReturn(value)
            );

            if(notify) {
                this.dispatch(path, value);
            }
        };

        /**
         * get a property value from the store
         * @param  {String} path
         * @return {mixed}
         */
        Crate.prototype.get = function(path) {
            return tracePath(this._payload, path);
        };

        /**
         * creates new complex values (Object, Array)
         * @param  {mixed} value
         * @return {mixed}
         */
        Crate.prototype.cloneComplexOrReturn = function(value) {
            if(value instanceof Array) {
                value = [].concat(value);
            } else if(value instanceof Object) {
                value = Object.assign({}, value);
            }

            return value;
        };

        /**
         * call all observers listenting for a property
         * @param  {String} path
         * @param  {Mixed} value
         */
        Crate.prototype.dispatch = function(path, value) {
            try {
                this._observers[path].forEach(function(handler) {
                    handler.call(
                        null,
                        this.cloneComplexOrReturn(value),
                        path
                    );
                }.bind(this));
            } catch(ex) {
                console.warn(ex);
            }
        };

        /**
         * add an observer for a specific property
         * @param {String} path
         * @param {Function} handler
         *
         * @returns {ObserverIdentity}
         */
        Crate.prototype.addObserver = function(path, handler) {
            if(!(path in this._observers)) {
                this._observers[path] = [];
            }

            this._observers[path].push(handler);

            return {
                path: path,
                handler: handler
            };
        };

        /**
         * remove an observer for a property
         * @param  {ObserverIdentity} observerObject
         */
        Crate.prototype.removeObserver = function(observerObject) {
            try {

                this._observers[observerObject.path].splice(
                    this._observers.indexOf(observerObject.handler), 1
                );

                if(this._observers[observerObject.path].length === 0) {
                    delete this._observers[observerObject.path];
                }

            } catch (ex) {
                // Do nothing because the most probable cause for this to fail
                // is if the observer cant be found
            }
        };

        return Crate;
    }());

    /**
     * Behavior factory the creates a polymer style behavior that can be
     * used inside store element in polymer ^1.0
     * @class @static
     */
    var BehaviorCreator = (function() {
        return {

            /**
             * creates a behavior
             * @param  {Crate} storage
             * @param  {Object} properties
             * @return {Object}
             */
            create: function(storage, properties) {
                var behavior = {
                    observers: [],
                    properties: properties
                };

                this.createPropertieObservers(behavior, properties);
                this.createStoreSetterAndGetter(behavior);
                this.createAttachedMethod(behavior, storage, properties);
                this.createDetachedMethod(behavior);

                return behavior;
            },

            /**
             * Creates setter and getter proxy methods to the crate store instance
             * @param  {Object} behavior
             */
            createStoreSetterAndGetter: function(behavior) {
                behavior.setStoreValue = function(prop, value) {
                    this._notifyStore = false;
                    this._crateStore.set(prop, value);
                    this._notifyStore = true;
                };

                behavior.getStoreValue = function(prop) {
                    return this._crateStore.get(prop);
                };
            },

            /**
             * Constructs a observer method
             * @param  {String} propName
             * @param  {Function} propType
             * @return {Object}
             */
            createObserverMethod: function(propName, propType) {
                var observerMethodName = '_' + propName + '_observer';
                var observerPath = propName;

                // sub property observer fire the update with the number
                // of store instances so the code below will not work
                // as it should
                // TODO think of a way to get around this so we can leverage
                // two way binding with this
                //
                // observerPath += '.*';

                return {
                    name: observerMethodName,
                    path: observerPath
                };
            },

            /**
             * Creates an observer for all the store properties
             * @param  {Object} behavior
             * @param  {Object} properties
             */
            createPropertieObservers: function(behavior, properties) {
                behavior._parseObserverValue = function(value) {
                    if(
                        typeof(value) === 'object' &&
                        'base' in value
                    ) {
                        // this will be used whe we figure out how not to
                        // duplicate data between components
                        value = value.base;

                        if(value instanceof Array) {
                            return ([]).concat(value);
                        } else {
                            return Object.assign({}, value);
                        }
                    }

                    return value;
                };

                for(var key in properties) {
                    if(properties.hasOwnProperty(key)) {
                        (function(propName, propType) { // jshint ignore:line
                            var observer = this.createObserverMethod(propName, propType);

                            behavior.observers.push(observer.name + '(' + observer.path + ')');

                            behavior[observer.name] = function(value) {
                                if(!this._notifyObserver || !this._crateStore) {
                                    return;
                                }

                                this.setStoreValue(
                                    propName,
                                    this._parseObserverValue(value)
                                );
                            };
                        }.call(this, key, properties[key].type));
                    }
                }
            },

            /**
             * creates the attached lifecycle method used by polymer and creates
             * crate observers that watch for changes inside the store
             * @param  {Object} behavior
             * @param  {Crate} storage
             * @param  {Object} properties
             */
            createAttachedMethod: function(behavior, storage, properties) {
                behavior._setObseverValue = function(key, value) {
                    var privateSetter = '_set' + key.charAt(0).toUpperCase() + key.slice(1);

                    this._notifyObserver = false;
                    if(privateSetter in this) {
                        this[privateSetter](value);
                    } else {
                        this[key] = value;
                    }

                    this._notifyObserver = true;
                };

                behavior.attached = function() {
                    this._crateStore = storage;
                    this._crateStoreObservers = [];
                    this._notifyObserver = true;
                    this._notifyStore = true;

                    for(var key in properties) {
                        if(properties.hasOwnProperty(key)) {
                            (function(key) { // jshing ignore:line
                                var observer = this._crateStore.addObserver(key, function(value) { // jshint ignore:line
                                    if(!this._notifyStore) {
                                        return;
                                    }

                                    this._setObseverValue(key, value);

                                    this._crateStoreObservers.push(observer);
                                }.bind(this));
                            }.call(this, key));
                        }
                    }
                };
            },

            /**
             * creates the detached lifecycle method used by polymer that
             * removes all the observers created in attached
             * @param  {Object} behavior
             */
            createDetachedMethod: function(behavior) {
                behavior.detached = function() {
                    for(var i=0, length = this._crateStoreObservers.length; i < length; i++) {
                        this._crateStore.removeObserver(this._crateStoreObservers[i]);
                    }
                };
            }
        };
    }());

    /**
     * Converts the simplified property declaration to
     * complete property declaration
     * @param  {Objec|Function} property
     * @return {Object}
     */
    var normalizeProperty = function(property) {
        if(!('type' in property)) {
            property = {
                type: property
            };
        }

        if(!('notify' in property)) {
            property.notify = true;
        }

        return property;
    };

    return {
        Crate: Crate,

        /**
         * creates a Crate instance
         * @param  {Object} payload
         * @return {Crate}
         */
        create: function(payload) {
            return new Crate(payload);
        },

        /**
         * creates a polymer style behavior
         * @param  {Object} properties
         * @return {Object}
         */
        createBehavior: function(properties) {
            var storageMap = {};

            for(var key in properties) {
                if(properties.hasOwnProperty(key)) {
                    properties[key] = normalizeProperty(properties[key]);

                    storageMap[key] = (
                        typeof(properties[key].value) === 'function'?

                            properties[key].value():

                            properties[key].value ||
                            undefined
                    );
                }
            }

            var crateStorage = this.create(storageMap);

            var behavior = BehaviorCreator.create(crateStorage, properties);

            return behavior;
        }
    };
});