var when = require('when');
var nodefn = require('when/node');

module.exports = deleteIt;

// delete directory(recursively) - expensive way.
function deleteIt(fs, p, method, cb) {
    fs.metadata(p)
    .then(function(metadata) {
        if (!metadata.is_dir) {
            throw fs.error('ENOTDIR');
        }

        return fs.list(p)
        .then(function(list) {
            return when.all(list.map(function(metadata) {
                if (metadata.is_dir) {
                    return resolveDelete(fs, p + '/' + metadata.name, method);
                } else {
                    return fs.delete(p + '/' + metadata.name);
                }
            }));
        })
        .then(function() {
            return fs._promise(method, p);
        });
    })
    .done(cb, cb);
}

var resolveDelete = nodefn.lift(deleteIt);