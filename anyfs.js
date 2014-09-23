'use strict';

var inherits = require('util').inherits;
var AnyFSError = require('./error');

function notImplemented(method) {
    return new AnyFSError('Method not implemented: ' + method);
}

function AnyFS(options) {
    this.options = options || {};
}

AnyFS.prototype.resolve = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.options.cwd);
    return path.resolve.apply(null, args);
};

AnyFS.prototype._promise = function() {
    var deferred = when.defer();
    var args = Array.prototype.slice.call(arguments);
    var fn = args.shift();
    args.push(function(err, data) {
        if (err) {
            return deferred.reject(err);
        }

        return deferred.resolve(data);
    });

    fn.apply(this, args);

    return deferred.promise.with(this);
};

// File API implements
AnyFS.prototype._rename = function(oldPath, newPath, cb) {
    throw notImplemented('_rename');
};

AnyFS.prototype._metadata = function(p, cb) {
    throw notImplemented('_metadata');
};

AnyFS.prototype._unlink = function(p, cb) {
    throw notImplemented('_unlink')
};

AnyFS.prototype._rmdir = function(p, cb) {
    throw notImplemented('_rmdir');
};

AnyFS.prototype._mkdir = function(p, cb) {
    throw notImplemented('_mkdir');
};

AnyFS.prototype._readfile = function(p, options, cb) {
    throw notImplemented('_readfile');
};

AnyFS.prototype._writeFile = function(p, contents, cb) {
    throw notImplemented('_writeFile');
};

AnyFS.prototype._createWriteStream = function(p, options) {
    throw notImplemented('_createWriteStream');
};

AnyFS.prototype._createReadStream = function(p, options) {
    throw notImplemented('_createReadStream');
};

// File API

AnyFS.prototype.rename = function(oldPath, newPath, cb) {
    if (!cb) {
        return this._promise(this.rename, oldPath, newPath);
    }

    oldPath = this.resolve(oldPath);
    newPath = this.resolve(newPath);

    this._rename(oldPath, newPath, cb);
};

AnyFS.prototype.metadata = function(p, cb) {
    if (!cb) {
        return this._promise(this.metadata, p);
    }

    p = this.resolve(p);

    this._metadata(p, cb);
};

AnyFS.prototype.unlink = function(p, cb) {
    if (!cb) {
        return this._promise(this.unlink, p);
    }

    p = this.resolve(p);

    this._unlink(p, cb);
};

AnyFS.prototype.rmdir = function(p, cb) {
    if (!cb) {
        return this._promise(this.rmdir, p);
    }

    p = this.resolve(p);

    this._rmdir(p, cb);
};

AnyFS.prototype.mkdir = function(p, cb) {
    if (!cb) {
        return this._promise(this.mkdir, p);
    }

    p = this.resolve(p);

    this._mkdir(p, cb);
};

AnyFS.prototype.readFile = function(p, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }

    if (!cb) {
        return this._promise(this.readFile, p, options);
    }

    options = options || {};
    p = this.resolve(p);

    this._readfile(p, options, cb);
};

AnyFS.prototype.writeFile = function(p, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }

    if (!cb) {
        return this._promise(this.writeFile, p, options);
    }

    options = options || {};
    p = this.resolve(p);

    this._writeFile(p, options, cb);
};

AnyFS.prototype.createReadStream = function(p, options) {
    
};

AnyFS.prototype.createWriteStream = function(p, options) {

};

// Advanced API
AnyFS.prototype.glob = function() {
    
};

AnyFS.prototype.src = function() {
    
};

AnyFS.prototype.dest = function() {
    
};

// Global helpers
AnyFS.inherits = function(init) {
    function FS(options) {
        this.options = options || {};

        if (typeof this.options.mode === 'string') {
            this.options.mode = parseInt(this.options.mode, 8);
        }

        if (typeof init === 'function') {
            init.apply(this);
        }
    }

    inherits(FS, AnyFS);

    return FS;
}