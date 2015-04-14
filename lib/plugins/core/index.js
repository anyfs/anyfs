'use strict';

var streamContent = require('stream-content');
var deleteIt = require('./delete');
var mkdir = require('./mkdir');
var move = require('./move');
var writeFile = require('./writeFile');

module.exports = Plugin;

/**
 * Core filesystem plugin
 */
function Plugin() {

}

function error(code, message) {
    var err = new Error(message);
    err.code = code;

    return err;
}

Plugin.prototype.register = function(fs) {

    /**
     * Experimental API, use metadata instead.
     * @param  {String}   p Path to file or directory
     * @param  {Function} cb
     */
    fs.stat = function(p, cb) {
        if (!cb) {
            return this._promise(this.stat);
        }

        this.metadata(p)
            .done(function(metadata) {
                var stats = new nodeFS.Stats();
                stats.size = metadata.size;
                stats.atime = stats.mtime = stats.ctime = new Date(metadata.time);
                stats.mode = metadata.is_dir?
                  16895 // 040777
                  :
                  33279; //0100777
                cb(null, stats);
            }, cb);
    };

    fs.metadata = function(p, cb) {
        if (!cb) {
            return this._promise(this.metadata, p);
        }

        p = this.resolve(p);

        this.adapter.metadata(p, cb);
    };

    fs.list = function(p, cb) {
        if (!cb) {
            return this._promise(this.list, p);
        }

        p = this.resolve(p);
        this.adapter.list(p, cb);
    }

    fs.delete = function(p, cb) {
        if (!cb) {
            return this._promise(this.delete, p);
        }

        p = this.resolve(p);

        if (p === '/') {
            return error('ELOGIC', 'Cannot delete root path');
        }

        if (this.adapter.features.DELETE_RECURSIVE) {
            return this.adapter.delete(p, cb);
        } 

        deleteIt(this, p, [this.adapter, this.adapter.delete], cb);
    };

    fs.mkdir = function(p, cb) {
        if (!cb) {
            return this._promise(this.mkdir, p);
        }

        p = this.resolve(p);

        if (p === '/') {
            return cb();
        }

        if (this.adapter.MKDIR_RECURSIVE) {
            return this.adapter.mkdir(p, cb);
        }

        mkdir(this, p, [this.adapter, this.adapter.mkdir], cb);
    }

    fs.move = function(a, b, cb) {
        if (!cb) {
            return this._promise(this.move, a, b);
        }

        a = this.resolve(a);
        b = this.resolve(b);

        if (a === b) {
            return cb(new Error('Cannot move to same the same path', 'ELOGIC'));
        }

        if (a === '/' || b === '/') {
            return cb(new Error('Cannot move root', 'ELOGIC'));
        }

        if (b.indexOf(a + '/') === 0) {
            return cb(new Error('Cannot move to child directory', 'ELOGIC'));
        }

        move(this, a, b, [this.adapter, this.adapter.move], cb);
    };

    fs.readFile = function(p, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = undefined;
        }

        if (!cb) {
            return this._promise(this.readFile, p, options);
        }

        options = options || {};

        var cb1 = cb;
        cb = function(err, data) {
            if (err) {
                return cb1(err);
            }

            if (options.encoding) {
                data = data.toString(options.encoding);
            }
            cb1(null, data);
        }

        p = this.resolve(p);

        if (this.adapter.readFile) {
            return this.adapter.readFile(p, cb);
        }

        try {
            var rs = streamhelper.fixReadStream([this.adapter, this.adapter.createReadStream], p);
            streamContent.readAll(rs, cb);
        }
        catch (e1) {
            cb(e1);
        }
    };

    fs.writeFile = function(p, data, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = undefined;
        }

        if (!cb) {
            return this._promise(this.writeFile, p, data, options);
        }

        options = options || {};
        p = this.resolve(p);

        // transform data to buffer
        if (typeof data === 'string') {
            data = new Buffer(data, options.encoding);
        }

        var writeMethod;
        if (this.adapter.writeFile) {
            writeMethod = [this.adapter, this.adapter.writeFile];
        } else {
            var ws = streamhelper.fixWriteStream([this.adapter, this.adapter.createWriteStream], p);
            writeMethod = function(p, data, cb) {
                streamContent.writeAll(ws, data, cb);
            }
        }
        
        writeFile(this, p, data, writeMethod, cb);
    };

    fs.createReadStream = function(p, options) {
        p = this.resolve(p);
        options = options || {};

        if (this.adapter.createReadStream) {
            return streamhelper.fixReadStream([this.adapter, this.adapter.createReadStream], p);
        }

        var self = this;
        return streamContent.createReadStreamFromCallback(function(cb) {
            self.adapter.readFile(p, cb);
        });
    };

    fs.createWriteStream = function(p, options) {
        p = this.resolve(p);
        options = options || {};

        if (this.adapter.createWriteStream) {
            return streamhelper.fixWriteStream([this.adapter, this.adapter.createWriteStream], p);
        }

        var self = this;
        return streamContent.createWriteStreamFromCallback(function(content, cb) {
            self.adapter.writeFile(p, content, cb);
        });
    };
};

Plugin.prototype.test = function(fs) {
    var test = require('./test');
    test(fs);
};