'use strict';

var path = require('path');
module.exports = mkdir;

// mkdirP - expensive way.
function mkdir(fs, p, method, cb) {
    fs.metadata(p)
    .then(function(metadata) {
        if (!metadata.is_dir) {
            throw new Error('File already exist at ' + p, 'ELOGIC');
        }
    }, function(e) {
        // try mkdir if not exist
        if (e.code === 'ENOENT') {
            var parent = path.dirname(p);

            return this.mkdir(parent)
                .then(function() {
                    return this._promise(method, p);
                });
        } else {
            throw e;
        }
    })
    .done(function() {
        cb();
    }, function(err) {
        cb(err);
    });
}