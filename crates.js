
/**
 * @namespace Crates
 * @global
 * @license MIT
 *
 * CratesJS is a shared store libriary that has the capabilities of creating
 * a polymer 1.0 style behavior that can leverege the two-way binding between
 * the store elements and the elements that he is used in. This library is a way
 * to efficiently communicate between different parts of the application without
 * using untracable pub-sub signals.
 *
 * @example
 * ### Creating a store component
 * ```html
 * <link rel="import" href="../../polymer/polymer.html">
 * <link rel="import" href="../crates.include.html">
 *
 * <dom-module id="todo-store">
 *     <script>
 *         (function() {
 *             'use strict';
 *
 *             var TodoStoreBehavior = Polymer.Crates.createBehavior({
 *                 todos: {
 *                     type: Array,
 *                     value: function() {
 *                         return [];
 *                     }
 *                 }
 *             });
 *
 *             Polymer({
 *                 is: "todo-store",
 *
 *                 behaviors: [
 *                     TodoStoreBehavior
 *                 ]
 *             });
 *         }());
 *     </script>
 * </dom-module>
 * ```
 *
 * ### Using the store component in other custom elements
 * #### TODO input
 * ```html
 * <link rel="import" href="../../polymer/polymer.html">
 * <link rel="import" href="./todo-store.html">
 * <dom-module id="todo-input">
 *     <template>
 *         <style>
 *             :host {
 *                 display: inline-block;
 *             }
 *         </style>
 *
 *         <input type="text" on-change="addTodo">
 *
 *         <todo-store id="todoStore" todos="{{todos}}"></todo-store>
 *     </template>
 *
 *     <script>
 *         Polymer({
 *             is: "todo-input",
 *             properties: {
 *                 todos: Array
 *             },
 *
 *             addTodo: function(e) {
 *                 this.push('todos', e.target.value);
 *                 this.$.todoStore.setStoreValue('todos', this.todos);
 *                 e.target.value = '';
 *             },
 *
 *         });
 *     </script>
 * </dom-module>
 * ```
 *
 * #### TODO list
 * ```html
 * <link rel="import" href="../../polymer/polymer.html">
 * <link rel="import" href="./todo-store.html">
 * <dom-module id="todo-list">
 *     <template>
 *         <style>
 *             :host {
 *                 display: inline-block;
 *             }
 *         </style>
 *         <table>
 *             <template is="dom-repeat" items="[[todos]]">
 *                 <tr>
 *                     <td>
 *                         [[item]]
 *                     </td>
 *                     <td>
 *                         <button on-tap="deleteItem" id="[[index]]">X</button>
 *                     </td>
 *                 </tr>
 *             </template>
 *         </table>
 *
 *         <todo-store id="todoStore" todos="{{todos}}"></todo-store>
 *     </template>
 *
 *     <script>
 *         Polymer({
 *             is: "todo-list",
 *             properties: {
 *                 todos: Array
 *             },
 *
 *             deleteItem: function(e) {
 *                 var button = e.target;
 *                 var index = parseInt(button.id);
 *                 this.splice('todos', index, 1);
 *                 var todos = this.todos;
 *
 *                 this.notifyPath('todos', []);
 *                 this.notifyPath('todos', todos);
 *             }
 *         });
 *     </script>
 * </dom-module>
 *
 * ```
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
          * @memberof Crates
          * @class
          * @param {Object} payload
          */
        var Crate = function(payload) {
            this._payload = payload;
            this._observers = {};
        };

        /**
         * set a store property and disptch an event to all the observers
         * listening for a change
         * @memberof Crates
         * @param {String} path
         * @param {Mixed} value
         * @param {Boolean} [notify=true]
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
         * @memberof Crates
         * @param  {String} path
         * @return {mixed}
         */
        Crate.prototype.get = function(path) {
            return tracePath(this._payload, path);
        };

        /**
         * creates new complex values (Object, Array)
         * @memberof Crates
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
         * @memberof Crates
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
         * @memberof Crates
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
         * @memberof Crates
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
     * @inner
     */
    var BehaviorCreator = (function() {
        /**
         * @typedef {Object} CrateBehavior
         */

        return {

            /**
             * creates a behavior
             * @memberof BehaviorCreator
             * @param  {Crate} storage
             * @param  {Object} properties
             * @return {Object}
             */
            create: function(storage, properties) {
                var behavior = {
                    /**
                     * behavior observers
                     * @memberof CrateBehavior
                     * @type {Array}
                     */
                    observers: [],
                    /**
                     * polymer style property definitions that will be used
                     * as shared store variables
                     * @memberof CrateBehavior
                     * @type {Object}
                     */
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
             * @memberof BehaviorCreator
             * @param  {Object} behavior
             */
            createStoreSetterAndGetter: function(behavior) {
                /**
                 * sets a property of the store that will
                 * then propagate to other components that listen for changes
                 * @memberof CrateBehavior
                 * @function setStoreValue
                 * @param {String} prop
                 * @param {mixed} value
                 */
                behavior.setStoreValue = function(prop, value) {
                    this._notifyStore = false;
                    this._crateStore.set(prop, value);
                    this._notifyStore = true;
                };

                /**
                 * gets the value of a stored property directly from the store
                 * @memberof CrateBehavior
                 * @function getStoreValue
                 * @param  {String} prop
                 * @return {mixed}
                 */
                behavior.getStoreValue = function(prop) {
                    return this._crateStore.get(prop);
                };
            },

            /**
             * Constructs a observer method
             * @memberof BehaviorCreator
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
             * @memberof BehaviorCreator
             * @param  {Object} behavior
             * @param  {Object} properties
             */
            createPropertieObservers: function(behavior, properties) {
                /**
                 * Parses the observed value and returns a value that is
                 * ready to be assigned to a store property
                 * @memberof CrateBehavior
                 * @function _parseObserverValue
                 * @protected
                 * @param  {mixed} value [description]
                 * @return {mixed}
                 */
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
             * @memberof BehaviorCreator
             * @param  {Object} behavior
             * @param  {Crate} storage
             * @param  {Object} properties
             */
            createAttachedMethod: function(behavior, storage, properties) {
                /**
                 * Sets a variable from the store by either using
                 * the private setter or the setter for the polymer property
                 * @protected
                 * @memberof CrateBehavior
                 * @function _setObseverValue
                 * @param {String} key
                 * @param {mixed} value
                 */
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

                /**
                 * Sets reference to the crate instance being used
                 * and defines all the needed store observers
                 * @memberof CrateBehavior
                 * @function attached
                 */
                behavior.attached = function() {
                    /**
                     * Instance to the crate instace
                     * @memberof CrateBehavior
                     * @name _crateStore
                     * @type {Crates.Crate}
                     */
                    this._crateStore = storage;
                    /**
                     * list of all generated observers used for unlinking
                     * when the instance is detached
                     * @memberof CrateBehavior
                     * @name _crateStoreObservers
                     * @protected
                     * @type {Array<ObserverIdentity>}
                     */
                    this._crateStoreObservers = [];
                    /**
                     * Block observer notification for the current instance
                     * @memberof CrateBehavior
                     * @name _notifyObserver
                     * @type {Boolean}
                     */
                    this._notifyObserver = true;
                    /**
                     * Block store notification for the current instance
                     * @memberof CrateBehavior
                     * @name _notifyStore
                     * @type {Boolean}
                     */
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
             * @memberof BehaviorCreator
             * @param  {Object} behavior
             */
            createDetachedMethod: function(behavior) {
                /**
                 * Detached method on which we need to clear all autogenerated
                 * observers
                 * @memberof CrateBehavior
                 * @name detached
                 */
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
         * @memberof Crates
         * @param  {Object} payload
         * @return {Crate}
         */
        create: function(payload) {
            return new Crate(payload);
        },

        /**
         * creates a polymer style behavior
         * @memberof Crates
         * @param  {Object} properties
         * @return {CrateBehavior}
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
