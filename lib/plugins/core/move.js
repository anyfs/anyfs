var path = require('path');


module.exports = move;

// move file or directory - expensive way.
function move(fs, a, b, method, cb) {
    var parentA = path.dirname(a);
    var parentB = path.dirname(b);
    var nameA = path.basename(a);
    var nameB = path.basename(b)

    fs.metadata(a)
    .then(function(metadata) {
        return this.metadata(b)
            .then(function(metadata) {
                throw fs.error('EEXIST', 'Cannot move because target path already exist: ' + b);
            }, function(err) {
                if (err.code === 'ENOENT') {
                    return this.mkdir(parentB);
                } else {
                    throw err;
                }
            });
    })
    .then(function() {
        return this._promise(method, a, b);
    })
    .done(function() {
        cb();
    }, function(err) {
        cb(err);
    });
}