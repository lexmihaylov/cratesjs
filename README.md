<a name="module_cratesjs"></a>

## cratesjs
**License**: MITCratesJS is a shared store libriary that has the capabilities of creatinga polymer 1.0 style behavior that can leverege the two-way binding betweenthe store elements and the elements that he is used in. This library is a wayto efficiently communicate between different parts of the application withoutusing untracable pub-sub signals.  
**Example**  
### Creating a store component```html<link rel="import" href="../../polymer/polymer.html"><link rel="import" href="../crates.include.html"><dom-module id="todo-store">    <script>        (function() {            'use strict';            var TodoStoreBehavior = Polymer.Crates.createBehavior({                todos: {                    type: Array,                    value: function() {                        return [];                    }                }            });            Polymer({                is: "todo-store",                behaviors: [                    TodoStoreBehavior                ]            });        }());    </script></dom-module>```### Using the store component in other custom elements#### TODO input```html<link rel="import" href="../../polymer/polymer.html"><link rel="import" href="./todo-store.html"><dom-module id="todo-input">    <template>        <style>            :host {                display: inline-block;            }        </style>        <input type="text" on-change="addTodo">        <todo-store id="todoStore" todos="{{todos}}"></todo-store>    </template>    <script>        Polymer({            is: "todo-input",            properties: {                todos: Array            },            addTodo: function(e) {                this.push('todos', e.target.value);                this.$.todoStore.setStoreValue('todos', this.todos);                e.target.value = '';            },        });    </script></dom-module>```#### TODO list```html<link rel="import" href="../../polymer/polymer.html"><link rel="import" href="./todo-store.html"><dom-module id="todo-list">    <template>        <style>            :host {                display: inline-block;            }        </style>        <table>            <template is="dom-repeat" items="[[todos]]">                <tr>                    <td>                        [[item]]                    </td>                    <td>                        <button on-tap="deleteItem" id="[[index]]">X</button>                    </td>                </tr>            </template>        </table>        <todo-store id="todoStore" todos="{{todos}}"></todo-store>    </template>    <script>        Polymer({            is: "todo-list",            properties: {                todos: Array            },            deleteItem: function(e) {                var button = e.target;                var index = parseInt(button.id);                this.splice('todos', index, 1);                var todos = this.todos;                this.notifyPath('todos', []);                this.notifyPath('todos', todos);            }        });    </script></dom-module>```

* [cratesjs](#module_cratesjs)
    * [~@static](#module_cratesjs..@static)
        * [new @static()](#new_module_cratesjs..@static_new)
    * [~create(storage, properties)](#module_cratesjs..create) ⇒ <code>Object</code>
    * [~createStoreSetterAndGetter(behavior)](#module_cratesjs..createStoreSetterAndGetter)
    * [~createObserverMethod(propName, propType)](#module_cratesjs..createObserverMethod) ⇒ <code>Object</code>
    * [~createPropertieObservers(behavior, properties)](#module_cratesjs..createPropertieObservers)
    * [~createAttachedMethod(behavior, storage, properties)](#module_cratesjs..createAttachedMethod)
    * [~createDetachedMethod(behavior)](#module_cratesjs..createDetachedMethod)
    * [~create(payload)](#module_cratesjs..create) ⇒ <code>Crate</code>
    * [~createBehavior(properties)](#module_cratesjs..createBehavior) ⇒ <code>Object</code>
    * [~ObserverIdentity](#module_cratesjs..ObserverIdentity) : <code>Object</code>

<a name="module_cratesjs..@static"></a>

### cratesjs~@static
**Kind**: inner class of <code>[cratesjs](#module_cratesjs)</code>  
<a name="new_module_cratesjs..@static_new"></a>

#### new @static()
Behavior factory the creates a polymer style behavior that can beused inside store element in polymer ^1.0

<a name="module_cratesjs..create"></a>

### cratesjs~create(storage, properties) ⇒ <code>Object</code>
creates a behavior

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| storage | <code>Crate</code> | 
| properties | <code>Object</code> | 

<a name="module_cratesjs..createStoreSetterAndGetter"></a>

### cratesjs~createStoreSetterAndGetter(behavior)
Creates setter and getter proxy methods to the crate store instance

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| behavior | <code>Object</code> | 

<a name="module_cratesjs..createObserverMethod"></a>

### cratesjs~createObserverMethod(propName, propType) ⇒ <code>Object</code>
Constructs a observer method

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| propName | <code>String</code> | 
| propType | <code>function</code> | 

<a name="module_cratesjs..createPropertieObservers"></a>

### cratesjs~createPropertieObservers(behavior, properties)
Creates an observer for all the store properties

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| behavior | <code>Object</code> | 
| properties | <code>Object</code> | 

<a name="module_cratesjs..createAttachedMethod"></a>

### cratesjs~createAttachedMethod(behavior, storage, properties)
creates the attached lifecycle method used by polymer and createscrate observers that watch for changes inside the store

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| behavior | <code>Object</code> | 
| storage | <code>Crate</code> | 
| properties | <code>Object</code> | 

<a name="module_cratesjs..createDetachedMethod"></a>

### cratesjs~createDetachedMethod(behavior)
creates the detached lifecycle method used by polymer thatremoves all the observers created in attached

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| behavior | <code>Object</code> | 

<a name="module_cratesjs..create"></a>

### cratesjs~create(payload) ⇒ <code>Crate</code>
creates a Crate instance

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> | 

<a name="module_cratesjs..createBehavior"></a>

### cratesjs~createBehavior(properties) ⇒ <code>Object</code>
creates a polymer style behavior

**Kind**: inner method of <code>[cratesjs](#module_cratesjs)</code>  

| Param | Type |
| --- | --- |
| properties | <code>Object</code> | 

<a name="module_cratesjs..ObserverIdentity"></a>

### cratesjs~ObserverIdentity : <code>Object</code>
**Kind**: inner typedef of <code>[cratesjs](#module_cratesjs)</code>  
**Properties**

| Name | Type |
| --- | --- |
| path | <code>String</code> | 
| handler | <code>function</code> | 

