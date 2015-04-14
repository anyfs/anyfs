var path = require('path');

module.exports = writeFile;

// write file - expensive way.
function writeFile(fs, p, content, method, cb) {
    fs.metadata(p)
    .then(function(metadata) {
        if (metadata.is_dir) {
            throw fs.error('EISDIR');
        }
    }, function(e) {
        if (e.code === 'ENOENT') {
            var parent = path.dirname(p);
            return this.mkdir(parent);
        } else {
            throw e;
        }
    })
    .then(function() {
        return this._promise(method, p, content);
    })
    .done(cb, cb);
}