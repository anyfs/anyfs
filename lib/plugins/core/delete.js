var when = require('when');
var nodefn = require('when/node');

module.exports = deleteIt;

// delete file or directory(recursively) - expensive way.
function deleteIt(fs, p, method, metadata, cb) {
    if (typeof metadata === 'function') {
        cb = metadata;
        metadata = undefined;
    }

    fs._promise()
    .then(function() {
        if (metadata) {
            return metadata;
        }

        return fs.metadata(p);
    })
    .then(function(metadata) {
        if (!metadata.is_dir) {
            return fs._promise(method, p, metadata);
        }

        // if it's directory, remove children and then remove itself.
        return fs.list(p)
        .then(function(list) {
            return when.all(list.map(function(metadata) {
                return resolveDelete(fs, p + '/' + metadata.name, method, metadata)
            }))
        })
        .then(function() {
            return fs._promise(method, p, metadata);
        });
    })
    .done(cb, cb);
}

var resolveDelete = nodefn.lift(deleteIt);