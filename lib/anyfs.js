var path = require('path');
var util = require('util');
var when = require('when');
var nodefn = require('when/node');
var CorePlugin = require('./plugins/core/');

module.exports = AnyFS;

function AnyFS(adapter, options) {
    this.options = options || {};
    this.options.cwd = this.options.cwd || '/';
    this.options.root = this.options.root || '/';

    if (this.options.cwd[0] !== '/') {
        throw new Error('cwd must be absolute(start with "/")');
    }

    if (this.options.root[0] !== '/') {
        throw new Error('root must be absolute(start with "/")');
    }

    if (this.options.root !== '/') {
        throw new Error('root is not supported yet');
    }

    this.adapter = adapter;

    this.adapter.features = this.adapter.features || {};

    this._plugins = [];

    // add global plugins
    for (var i = 0, length = AnyFS._plugins.length; i < length; i++) {
        this.addPlugin(AnyFS._plugins[i]);
    }
}

AnyFS._plugins = [];

/**
 * Add a global plugin
 * @param {Plugin} plugin
 */
AnyFS.addPlugin = function(plugin) {
    AnyFS._plugins.push(plugin);
}

/**
 * Add a plugin
 * @param {Plugin} plugin
 */
AnyFS.prototype.addPlugin = function(plugin) {
    this._plugins.push(plugin);
    plugin.register(this);
};

AnyFS.prototype.getPlugins = function() {
    return this._plugins;
};

/**
 * Resolve absolute path (considered root and cwd), path cleanup
 * @return {String}
 */
AnyFS.prototype.resolve = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.options.cwd);
    
    var p = path.resolve.apply(null, args);
    p = path.join(this.options.root, p);

    // fix windows
    p = p.replace(/[\\\/]+/g, '/');

    // remove ending slash
    if (p.length > 1 && p[p.length - 1] === '/') {
        p = p.substr(0, p.length - 1);
    }

    return p;
};

/**
 * Create standard error
 * @param  {String} code    Error code
 * @param  {String} message Error message
 * @return {Error}
 */
AnyFS.prototype.error = function(code, message) {
    var err = new Error(message);
    err.code = code;

    return err;
};

/**
 * Create promise
 * @return {Object}
 */
AnyFS.prototype._promise = function() {
    var args = Array.prototype.slice.call(arguments);
    var fn;
    var context = this;
    if (args.length === 0) {
        fn = function(cb) {cb()};
    } else {
        fn = args.shift();
        if (util.isArray(fn)) {
            if (fn.length !== 2) {
                throw new Error('Invalid callback');
            }
            context = fn[0];
            fn = fn[1];
        }
    }

    return nodefn.lift(fn).apply(context, args).with(this);
};

// always add core plugin
AnyFS.addPlugin(new CorePlugin());