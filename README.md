# Crates.js

CratesJS is a shared store libriary that has the capabilities of creating
a polymer 1.0 style behavior that can leverege the two-way binding between
the store elements and the elements that he is used in. This library is a way
to efficiently communicate between different parts of the application without
using untracable pub-sub signals.
## Building
```bash
$ git clone https://github.com/lexmihaylov/cratesjs.git
$ npm install
$ gulp
```
## Install
```bash
$ bower install cratesjs
```
## Examples
### Creating a store component
```html
<link rel="import" href="../../polymer/polymer.html">
<link rel="import" href="../crates.include.html">

<dom-module id="todo-store">
    <script>
        (function() {
            'use strict';

            var TodoStoreBehavior = Polymer.Crates.createBehavior({
                todos: {
                    type: Array,
                    value: function() {
                        return [];
                    }
                }
            });

            Polymer({
                is: "todo-store",

                behaviors: [
                    TodoStoreBehavior
                ]
            });
        }());
    </script>
</dom-module>
```
### Using the store component in other custom elements
#### TODO input
```html
<link rel="import" href="../../polymer/polymer.html">
<link rel="import" href="./todo-store.html">
<dom-module id="todo-input">
    <template>
        <style>
            :host {
                display: inline-block;
            }
        </style>

        <input type="text" on-change="addTodo">

        <todo-store id="todoStore" todos=""></todo-store>
    </template>

    <script>
        Polymer({
            is: "todo-input",
            properties: {
                todos: Array
            },

            addTodo: function(e) {
                this.push('todos', e.target.value);
                this.$.todoStore.setStoreValue('todos', this.todos);
                e.target.value = '';
            },

        });
    </script>
</dom-module>
```

#### TODO list
```html
<link rel="import" href="../../polymer/polymer.html">
<link rel="import" href="./todo-store.html">
<dom-module id="todo-list">
    <template>
        <style>
            :host {
                display: inline-block;
            }
        </style>
        <table>
            <template is="dom-repeat" items="[[todos]]">
                <tr>
                    <td>
                        [[item]]
                    </td>
                    <td>
                        <button on-tap="deleteItem" id="[[index]]">X</button>
                    </td>
                </tr>
            </template>
        </table>

        <todo-store id="todoStore" todos=""></todo-store>
    </template>

    <script>
        Polymer({
            is: "todo-list",
            properties: {
                todos: Array
            },

            deleteItem: function(e) {
                var button = e.target;
                var index = parseInt(button.id);
                this.splice('todos', index, 1);
                var todos = this.todos;

                this.notifyPath('todos', []);
                this.notifyPath('todos', todos);
            }
        });
    </script>
</dom-module>

```

## API Docs

## Objects

<dl>
<dt><a href="#Crates">Crates</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ObserverIdentity">ObserverIdentity</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CrateBehavior">CrateBehavior</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Crates"></a>

## Crates : <code>object</code>
**Kind**: global namespace  

* [Crates](#Crates) : <code>object</code>
    * [.Crate](#Crates.Crate)
        * [new Crate(payload)](#new_Crates.Crate_new)
    * [.Crate#set(path, value, [notify])](#Crates.Crate+set)
    * [.Crate#get(path)](#Crates.Crate+get) ⇒ <code>mixed</code>
    * [.Crate#ensureImmutable(value)](#Crates.Crate+ensureImmutable) ⇒ <code>mixed</code>
    * [.Crate#dispatch(path, value)](#Crates.Crate+dispatch)
    * [.Crate#addObserver(path, handler)](#Crates.Crate+addObserver) ⇒ <code>[ObserverIdentity](#ObserverIdentity)</code>
    * [.Crate#removeObserver(observerObject)](#Crates.Crate+removeObserver)
    * [.create(payload)](#Crates.create) ⇒ <code>Crate</code>
    * [.createBehavior(properties)](#Crates.createBehavior) ⇒ <code>[CrateBehavior](#CrateBehavior)</code>

<a name="Crates.Crate"></a>

### Crates.Crate
**Kind**: static class of <code>[Crates](#Crates)</code>  
<a name="new_Crates.Crate_new"></a>

#### new Crate(payload)
Creates a store that can be used to share information between differentcomponents via events


| Param | Type |
| --- | --- |
| payload | <code>Object</code> | 

<a name="Crates.Crate+set"></a>

### Crates.Crate#set(path, value, [notify])
set a store property and disptch an event to all the observerslistening for a change

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type | Default |
| --- | --- | --- |
| path | <code>String</code> |  | 
| value | <code>Mixed</code> |  | 
| [notify] | <code>Boolean</code> | <code>true</code> | 

<a name="Crates.Crate+get"></a>

### Crates.Crate#get(path) ⇒ <code>mixed</code>
get a property value from the store

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 

<a name="Crates.Crate+ensureImmutable"></a>

### Crates.Crate#ensureImmutable(value) ⇒ <code>mixed</code>
creates new complex values (Object, Array)

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| value | <code>mixed</code> | 

<a name="Crates.Crate+dispatch"></a>

### Crates.Crate#dispatch(path, value)
call all observers listenting for a property

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 
| value | <code>Mixed</code> | 

<a name="Crates.Crate+addObserver"></a>

### Crates.Crate#addObserver(path, handler) ⇒ <code>[ObserverIdentity](#ObserverIdentity)</code>
add an observer for a specific property

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 
| handler | <code>function</code> | 

<a name="Crates.Crate+removeObserver"></a>

### Crates.Crate#removeObserver(observerObject)
remove an observer for a property

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| observerObject | <code>[ObserverIdentity](#ObserverIdentity)</code> | 

<a name="Crates.create"></a>

### Crates.create(payload) ⇒ <code>Crate</code>
creates a Crate instance

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> | 

<a name="Crates.createBehavior"></a>

### Crates.createBehavior(properties) ⇒ <code>[CrateBehavior](#CrateBehavior)</code>
creates a polymer style behavior

**Kind**: static method of <code>[Crates](#Crates)</code>  

| Param | Type |
| --- | --- |
| properties | <code>Object</code> | 

<a name="ObserverIdentity"></a>

## ObserverIdentity : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| path | <code>String</code> | 
| handler | <code>function</code> | 

<a name="CrateBehavior"></a>

## CrateBehavior : <code>Object</code>
**Kind**: global typedef  

* [CrateBehavior](#CrateBehavior) : <code>Object</code>
    * [.observers](#CrateBehavior.observers) : <code>Array</code>
    * [.properties](#CrateBehavior.properties) : <code>Object</code>
    * [._crateStore](#CrateBehavior._crateStore) : <code>[Crate](#Crates.Crate)</code>
    * [._crateStoreObservers](#CrateBehavior._crateStoreObservers) : <code>[Array.&lt;ObserverIdentity&gt;](#ObserverIdentity)</code>
    * [._notifyObserver](#CrateBehavior._notifyObserver) : <code>Boolean</code>
    * [._notifyStore](#CrateBehavior._notifyStore) : <code>Boolean</code>
    * [.setStoreValue(prop, value)](#CrateBehavior.setStoreValue)
    * [.getStoreValue(prop)](#CrateBehavior.getStoreValue) ⇒ <code>mixed</code>
    * [._parseObserverValue(value)](#CrateBehavior._parseObserverValue) ⇒ <code>mixed</code>
    * [._setObseverValue(key, value)](#CrateBehavior._setObseverValue)
    * [.attached()](#CrateBehavior.attached)
    * [.detached()](#CrateBehavior.detached)

<a name="CrateBehavior.observers"></a>

### CrateBehavior.observers : <code>Array</code>
behavior observers

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior.properties"></a>

### CrateBehavior.properties : <code>Object</code>
polymer style property definitions that will be usedas shared store variables

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior._crateStore"></a>

### CrateBehavior._crateStore : <code>[Crate](#Crates.Crate)</code>
Instance to the crate instace

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior._crateStoreObservers"></a>

### CrateBehavior._crateStoreObservers : <code>[Array.&lt;ObserverIdentity&gt;](#ObserverIdentity)</code>
list of all generated observers used for unlinkingwhen the instance is detached

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
**Access:** protected  
<a name="CrateBehavior._notifyObserver"></a>

### CrateBehavior._notifyObserver : <code>Boolean</code>
Block observer notification for the current instance

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior._notifyStore"></a>

### CrateBehavior._notifyStore : <code>Boolean</code>
Block store notification for the current instance

**Kind**: static property of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior.setStoreValue"></a>

### CrateBehavior.setStoreValue(prop, value)
sets a property of the store that willthen propagate to other components that listen for changes

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  

| Param | Type |
| --- | --- |
| prop | <code>String</code> | 
| value | <code>mixed</code> | 

<a name="CrateBehavior.getStoreValue"></a>

### CrateBehavior.getStoreValue(prop) ⇒ <code>mixed</code>
gets the value of a stored property directly from the store

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  

| Param | Type |
| --- | --- |
| prop | <code>String</code> | 

<a name="CrateBehavior._parseObserverValue"></a>

### CrateBehavior._parseObserverValue(value) ⇒ <code>mixed</code>
Parses the observed value and returns a value that isready to be assigned to a store property

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  
**Access:** protected  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>mixed</code> | [description] |

<a name="CrateBehavior._setObseverValue"></a>

### CrateBehavior._setObseverValue(key, value)
Sets a variable from the store by either usingthe private setter or the setter for the polymer property

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  
**Access:** protected  

| Param | Type |
| --- | --- |
| key | <code>String</code> | 
| value | <code>mixed</code> | 

<a name="CrateBehavior.attached"></a>

### CrateBehavior.attached()
Sets reference to the crate instance being usedand defines all the needed store observers

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  
<a name="CrateBehavior.detached"></a>

### CrateBehavior.detached()
Detached method on which we need to clear all autogeneratedobservers

**Kind**: static method of <code>[CrateBehavior](#CrateBehavior)</code>  

## License: [MIT](./LICENSE)

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

### Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a
   build.
2. Use JSDoc standarts to document your code
3. Update overview.hbs if needed
4. Build the project so the prod files and docs can be generated
```bash
$ npm install
$ gulp
```
5. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
6. You may merge the Pull Request in once you have the sign-off of two other developers, or if you
   do not have permission to do that, you may request the second reviewer to merge it for you.
