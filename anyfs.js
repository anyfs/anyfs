'use strict';

var inherits = require('util').inherits;
var AnyFSError = require('./error');
var NotImplementedError = AnyFSError.NotImplementedError;
var streamContent = require('stream-content');

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
    throw new NotImplementedError('_rename');
};

AnyFS.prototype._metadata = function(p, options, cb) {
    throw new NotImplementedError('_metadata');
};

AnyFS.prototype._unlink = function(p, cb) {
    throw new NotImplementedError('_unlink')
};

AnyFS.prototype._rmdir = function(p, cb) {
    throw new NotImplementedError('_rmdir');
};

AnyFS.prototype._mkdir = function(p, cb) {
    throw new NotImplementedError('_mkdir');
};

AnyFS.prototype._readfile = function(p, options, cb) {
    throw new NotImplementedError('_readfile');
};

AnyFS.prototype._writeFile = function(p, contents, cb) {
    throw new NotImplementedError('_writeFile');
};

AnyFS.prototype._createWriteStream = function(p, options) {
    throw new NotImplementedError('_createWriteStream');
};

AnyFS.prototype._createReadStream = function(p, options) {
    throw new NotImplementedError('_createReadStream');
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

AnyFS.prototype.metadata = function(p, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }

    if (!cb) {
        return this._promise(this.metadata, p);
    }

    options = options || {};
    p = this.resolve(p);

    this._metadata(p, options, cb);
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

    try {
        this._readfile(p, options, cb);
    } catch (e) {
        if (e instanceof NotImplementedError) {
            var s = this._createReadStream(p, options);
            streamContent.readAll(s, options.encoding, cb);
        } else {
            throw e;
        }
    }
};

AnyFS.prototype.writeFile = function(p, data, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }

    if (!cb) {
        return this._promise(this.writeFile, p, data, options);
    }

    options = options || {};
    p = this.resolve(p);

    this._writeFile(p, data, options, cb);
};

AnyFS.prototype.createReadStream = function(p, options) {
    p = this.resolve(p);
    options = options || {};

    try {
        return this._createReadStream(p, options);
    } catch (e) {
        if (e instanceof NotImplementedError) {
            var self = this;
            return streamContent.createReadStreamFromCallback(function(cb) {
                self._readFile(p, options, cb);
            });
        } else {
            throw e;
        }
    }
};

AnyFS.prototype.createWriteStream = function(p, options) {
    p = this.resolve(p);
    options = options || {};

    try {
        return this._createWriteStream(p, options);
    } catch (e) {
        if (e instanceof NotImplementedError) {
            var self = this;
            return streamContent.createWriteStreamFromCallback(function(content, cb) {
                self._writeFile(p, content, options, cb);
            });
        } else {
            throw e;
        }
    }
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

        if (typeof init === 'function') {
            init.apply(this);
        }

        // default cwd
        if (!this.options.hasOwnProperty('cwd')) {
            this.options.cwd = '/';
        }
    }

    inherits(FS, AnyFS);

    return FS;
}