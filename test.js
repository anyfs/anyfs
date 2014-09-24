'use strict';
var when = require('when');
var should = require('should');
var through = require('through2');

module.exports = function(fs) {
    function shouldFileExist(path, done) {
        fs.metadata(path, function(err, metadata) {
            should(err).not.be.ok;
            should(metadata.is_dir).be.false;
            done();
        });
    }

    function shouldDirectoryExist(path, done) {
        fs.metadata(path, function(err, metadata) {
            should(err).not.be.ok;
            should(metadata.is_dir).be.true;
            done();
        })
    }

    function shouldNotExist(path, done) {
        fs.stat(path, function(err, stats) {
            should(err).be.an.Error;
            should(err).have.property('code', 'ENOENT');
            should(stats).not.be.ok;
            done();
        });
    }

    before(function(done) {
        fs.mkdir('tmp', done);
    });

    describe('mkdir', function() {
        it('should mkdir ok', function(done) {
            fs.mkdir('tmp/mkdir', function(err) {
                should(err).not.be.ok;
                shouldDirectoryExist('tmp/mkdir', done);
            });
        });

        it('should mkdir fail on exist dir', function(done) {
            fs.mkdir('tmp', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'EEXIST');
                done();
            });
        });
    });

    describe('writeFile', function() {
        it('should writeFile ok', function(done) {
            fs.writeFile('tmp/writeFile', 'abc', function(err) {
                should(err).not.be.ok;
                shouldFileExist('tmp/writeFile', done);
            });
        });
    });

    describe('readFile', function() {
        before(function(done) {
            fs.writeFile('tmp/readFile', 'abc', done);
        });

        it('should readFile ok', function(done) {
            fs.readFile('tmp/readFile', function(err, data) {
                should(err).not.be.ok;
                should(data.toString()).be.exactly('abc');
                done();
            });
        });
    });

    describe('mkdirP', function() {
        it('should mkdirP ok', function(done) {
            fs.mkdirP('tmp/mkdirp/mkdirp', function(err, data) {
                should(err).not.be.ok;
                shouldDirectoryExist('tmp/mkdirp/mkdirp', done);
            });
        });
    });

    describe('rmdir', function() {
        before(function(done) {
            fs.mkdirP('tmp/rmdir/dir1')
            .then(function() {
                return fs.mkdirP('tmp/rmdir/dir2')
            })
            .done(done);
        });

        it('should remove none exist directory fail', function(done) {
            fs.rmdir('tmp/rmdir/none_exists', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                done();
            });
        });

        describe('remove none empty dir', function() {
            it('should remove none empty directory fail', function(done) {
                fs.rmdir('tmp/rmdir', function(err) {
                    should(err).be.an.Error;
                    should(err).have.property('code', 'ENOTEMPTY');
                    done();
                });
            });
        });

        describe('remove empty dir', function() {
            it('should rmdir ok', function(done) {
                fs.rmdir('tmp/rmdir/dir1', function(err) {
                    should(err).not.be.ok;
                    shouldNotExist('tmp/rmdir/dir1', done);
                });
            });
        });

    });

    describe('unlink', function() {
        before(function(done) {
            fs.mkdirP('tmp/unlink')
            .then(function() {
                return fs.writeFile('tmp/unlink/file', 'file')
            })
            .done(done);
        });

        it('should unlink directory fail', function(done) {
            fs.unlink('tmp/unlink', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'EISDIR');
                done();
            });
        });

        it('should unlink none exist file fail', function(done) {
            fs.unlink('tmp/unlink/none_exists', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                done();
            });
        });

        it('should unlink file ok', function(done) {
            fs.unlink('tmp/unlink/file', function(err) {
                should(err).not.be.ok;
                shouldNotExist('tmp/unlink/file', done);
            });
        });
    });

    describe('rename', function() {
        before(function(done) {
            fs.mkdirP('tmp/rename')
            .then(function() {
                return fs.mkdir('tmp/rename/dir');
            })
            .then(function() {
                return fs.mkdir('tmp/rename/dir1');
            })
            .then(function() {
                return fs.writeFile('tmp/rename/file', 'file');
            })
            .then(function() {
                return fs.writeFile('tmp/rename/file1', 'file1');
            })
            .done(done);
        });

        // it does not work: http://stackoverflow.com/questions/21219018/node-js-does-fs-rename-overwrite-file-if-already-exists
        it.skip('should new path not exist', function(done) {
            fs.rename('tmp/rename/file1', 'tmp/rename/file', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'EEXIST');
                done();
            });
        });
        
        it('should old path exist', function(done) {
            fs.rename('tmp/rename/none_exists', 'tmp/rename/none_exists1', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                done();
            });
        });

        it('should rename file ok', function(done) {
            fs.rename('tmp/rename/file1', 'tmp/rename/file2', function(err) {
                should(err).not.be.ok;
                shouldFileExist('tmp/rename/file2', done);
            });
        });

        it('should rename dir ok', function(done) {
            fs.rename('tmp/rename/dir1', 'tmp/rename/dir2', function(err) {
                should(err).not.be.ok;
                shouldDirectoryExist('tmp/rename/dir2', done);
            });
        });
    });

    describe('readdir', function() {
        before(function(done) {
            fs.mkdirP('tmp/readdir')
            .then(function() {
                return fs.mkdir('tmp/readdir/a');
            })
            .then(function() {
                return fs.mkdir('tmp/readdir/b');
            })
            .then(function() {
                return fs.mkdir('tmp/readdir/c');
            })
            .then(function() {
                return fs.writeFile('tmp/readdir/d', 'd');
            })
            .done(done);
        });

        it('should read file fail', function(done) {
            fs.readdir('tmp/readdir/d', function(err, files) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOTDIR');
                should(files).not.be.ok;
                done();
            });
        });

        it('should read none exist dir fail', function(done) {
            fs.readdir('none_exists', function(err, files) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                should(files).not.be.ok;
                done();
            });
        });

        it('should readdir ok', function(done) {
            fs.readdir('tmp/readdir', function(err, files) {
                should(err).not.be.ok;
                should(files).eql(['a', 'b', 'c', 'd']);
                done();
            });
        });
    });

    
    describe('glob', function() {
        before(function(done) {
            fs.mkdirP('tmp/glob')
            .then(function() {
                return fs.writeFile('tmp/glob/a.js', 'a.js');
            })
            .then(function() {
                return fs.writeFile('tmp/glob/b.js', 'b.js');
            })
            .then(function() {
                return fs.writeFile('tmp/glob/c.js', 'c.js');
            })
            .then(function() {
                return fs.writeFile('tmp/glob/d.css', 'd.css');
            })
            .then(function() {
                return fs.mkdirP('tmp/glob/test');
            })
            .then(function() {
                return fs.writeFile('tmp/glob/test/e.js', 'e.js');
            })
            .then(function() {
                return fs.writeFile('tmp/glob/test/f.png', 'f.png');
            })
            .done(done);
        });

        it('should glob ok', function(done) {
            fs.glob('tmp/glob/**/*.js', function(err, files) {
                should(err).not.be.ok;
                should(files).eql(['tmp/glob/a.js', 'tmp/glob/b.js', 
                    'tmp/glob/c.js', 'tmp/glob/test/e.js']);
                done();
            });
        });
    });

    describe('src/dest', function() {
        before(function(done) {
            fs.mkdirP('tmp/src')
            .then(function() {
                return fs.writeFile('tmp/src/a.js', 'a.js');
            })
            .then(function() {
                return fs.writeFile('tmp/src/b.js', 'b.js');
            })
            .then(function() {
                return fs.writeFile('tmp/src/c.js', 'c.js');
            })
            .then(function() {
                return fs.writeFile('tmp/src/d.css', 'd.css');
            })
            .then(function() {
                return fs.mkdirP('tmp/src/test');
            })
            .then(function() {
                return fs.writeFile('tmp/src/test/e.js', 'e.js');
            })
            .then(function() {
                return fs.writeFile('tmp/src/test/f.png', 'f.png');
            })
            .done(done);
        });

        it('should src => dest ok', function(done) {
            var destFiles = [];
            fs.src('tmp/src/**/*.js')
            .pipe(fs.dest('tmp/dest'))
            .pipe(through.obj(function(file, enc, cb) {
                destFiles.push(file.relative);
                cb();
            }, function() {
                should(destFiles.sort()).eql(['a.js', 'b.js', 'c.js', 'test/e.js'].sort());
                done();
            }));
        });
    });
};