'use strict';

var path = require('path');
var util = require('util');

function error(code, message) {
    var err = new Error(message);
    err.code = code;

    return err;
}

function isDir(node) {
    return !Buffer.isBuffer(node);
}

function parseMetadata(name, node) {
    var metadata = {
        name: name
    };

    if (!isDir(node)) {
        metadata.is_dir = false;
        metadata.size = node.length;
        metadata.time = node.time;
    } else {
        metadata.is_dir = true;
    }

    return metadata;
}

function Adapter() {
    this.tree = {};
}

Adapter.prototype.features = {};

Adapter.prototype._getByPath = function(tree, p) {
    if (arguments.length === 1) {
        p = tree;
        tree = this.tree;
    }
    if (p === '') {
        return null;
    }

    if (p === '/') {
        return tree;
    }

    if (typeof p === 'string') {
        p = p.split('/');
    } else if (!util.isArray(p)) {
        return null;
    }

    if (p.length === 0) {
        return null;
    }

    var current = p.shift();
    if (current === '') {
        return this._getByPath(tree, p);
    }

    if (!tree.hasOwnProperty(current)) {
        return null;
    }

    // found
    if (p.length === 0) {
        return tree[current];
    } else {
        return this._getByPath(tree[current], p);
    }
};

Adapter.prototype.metadata = function(p, cb) {
    var node = this._getByPath(p);
    var name = path.basename(p);
    if (!node) {
        return cb(error('ENOENT'));
    }

    var metadata = parseMetadata(name, node);

    cb(null, metadata);
};

Adapter.prototype.list = function(p, cb) {
    var node = this._getByPath(p);
    if (!node) {
        return cb(error('ENOENT'));
    }

    if (!isDir(node)) {
        return cb(error('ENOTDIR'));
    }

    var list = [];
    for (var name in node) {
        var metadata = parseMetadata(name, node[name]);
        list.push(metadata);
    }

    cb(null, list);
};

Adapter.prototype.features.MKDIR_PASS_EXIST = true;

Adapter.prototype.mkdir = function(p, cb) {
    var parent = path.dirname(p);
    var name = path.basename(p);

    var parentNode = this._getByPath(parent);

    if (!isDir(parentNode)) {
        return cb(error('ELOGIC'));
    }

    // create directory on parent node
    if (!parentNode.hasOwnProperty(name)) {
        parentNode[name] = {};
        return cb();
    }

    var node = parentNode[name];

    if (isDir(node)) {
        return cb();
    }

    return cb(error('EEXIST'));
};

Adapter.prototype.delete = function(p, cb) {
    var parent = path.dirname(p);
    var name = path.basename(p);

    var parentNode = this._getByPath(parent);

    if (!isDir(parentNode)) {
        return cb(error('ENOENT', p));
    }

    if (!parentNode.hasOwnProperty(name)) {
        return cb(error('ENOENT', p));
    }

    if (isDir(parentNode[name])) {
        return cb(error('EISDIR', p));
    }

    delete parentNode[name];
    cb();
};

Adapter.prototype.features.DELETE_RECURSIVE = true;

Adapter.prototype.deleteDir = function(p, cb) {
    var parent = path.dirname(p);
    var name = path.basename(p);

    var parentNode = this._getByPath(parent);

    if (!isDir(parentNode)) {
        return cb(error('ENOENT'));
    }

    if (!parentNode.hasOwnProperty(name)) {
        return cb(error('ENOENT'));
    }

    if (!isDir(parentNode[name])) {
        return cb(error('ENOTDIR'));
    }

    delete parentNode[name];
    cb();
};

Adapter.prototype.move = function(a, b, cb) {
    var parentA = path.dirname(a);
    var parentB = path.dirname(b);
    var nameA = path.basename(a);
    var nameB = path.basename(b)

    var aNode = this._getByPath(a);
    if (!aNode) {
        return cb(error('ENOENT'));
    }

    var parentANode = this._getByPath(parentA);
    var parentBNode = this._getByPath(parentB);
    if (!parentBNode) {
        return cb(error('ENOENT'));
    }

    parentBNode[nameB] = parentANode[nameA];
    delete parentANode[nameA];

    cb();
};

Adapter.prototype.readFile = function(p, cb) {
    var node = this._getByPath(p);

    if (isDir(node)) {
        return cb(error('EISDIR', p));
    }

    cb(null, node);
};

Adapter.prototype.writeFile = function(p, data, cb) {
    var parent = path.dirname(p);
    var filename = path.basename(p);

    var parentNode = this._getByPath(parent);
    if (!parentNode) {
        return cb(error('ENOENT'));
    }

    var node = this._getByPath(p);
    if (!node || !isDir(node)) {
        data.time = new Date();
        parentNode[filename] = data;
        return cb();
    }

    cb(error('EISDIR', p));
};

module.exports = Adapter;