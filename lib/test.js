'use strict';
var when = require('when');
var sequence = require('when/sequence');
var parallel = require('when/parallel');
var should = require('should');
var through = require('through2');

module.exports = function(fs, options) {
    options = options || {};
    var disabled = options.disabled || [];
    function hasFeature(feature) {
        return disabled.indexOf(feature) == -1;
    }

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
        fs.metadata(path, function(err, metadata) {
            should(err).be.an.Error;
            should(err).have.property('code', 'ENOENT');
            done();
        });
    }

    after(function(done) {
        fs.delete('tmp', done);
    });

    describe('mkdir', function() {
        it('should mkdir ok', function(done) {
            fs.mkdir('tmp/mkdir', function(err) {
                should(err).not.be.ok;
                shouldDirectoryExist('tmp/mkdir', done);
            });
        });

        it('should mkdir fail on exist file', function(done) {
            // TODO
            done();
        });
    });

    describe('delete', function() {
        before(function(done) {
            fs.mkdir('tmp/delete/dir1')
            .then(function() {
                return fs.mkdir('tmp/delete/dir2')
            })
            .done(function() {
                done();
            }, done);
        });

        it('should delete none exist directory fail', function(done) {
            fs.delete('tmp/delete/none_exists', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                done();
            });
        });


        it('should delete OK', function() {
            it('should delete ok', function(done) {
                fs.delete('tmp/delete/dir1', function(err) {
                    should(err).not.be.ok;
                    shouldNotExist('tmp/delete/dir1', done);
                });
            });
        });

    });

    describe('move', function() {
        before(function(done) {
            fs.mkdir('tmp/move/dir1')
            .then(function() {
                return when.all([
                    fs.writeFile('tmp/move/file', 'file'),
                    fs.writeFile('tmp/move/file1', 'file1'),
                    fs.writeFile('tmp/move/file2', 'file2'),
                    fs.writeFile('tmp/move/file3', 'file3')
                ])
            })
            .done(function() {
                done();
            }, done);
        });

        hasFeature('move.a') && it('should new path not exist', function(done) {
            fs.move('tmp/move/file1', 'tmp/move/file', function(err) {
                should(err).be.an.Error; 
                should(err).have.property('code', 'EEXIST');
                done();
            });
        });
        
        hasFeature('move.b') && it('should old path exist', function(done) {
            fs.move('tmp/move/none_exists', 'tmp/move/none_exists1', function(err) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                done();
            });
        });

        hasFeature('move.c') && it('should move file ok', function(done) {
            fs.move('tmp/move/file2', 'tmp/move/file22', function(err) {
                should(err).not.be.ok;
                shouldFileExist('tmp/move/file22', done);
            });
        });

        hasFeature('move.d') && it('should move dir ok', function(done) {
            fs.move('tmp/move/dir1', 'tmp/move/dir11', function(err) {
                should(err).not.be.ok;
                shouldDirectoryExist('tmp/move/dir11', done);
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

    describe('stream', function() {
        before(function(done) {
            fs.writeFile('tmp/stream/a.js', 'a.js', done);
        });

        it('should pipe ok', function(done) {
            fs.createReadStream('tmp/stream/a.js')
            .pipe(fs.createWriteStream('tmp/stream/b.js'))
            .on('error', function(err) {
                done(err);
            })
            .on('finish', function() {
                fs.readFile('tmp/stream/b.js', function(err, data) {
                    should(err).not.be.ok;
                    should(data.toString()).be.exactly('a.js');
                    done();
                })
            });
        })
    });

    describe('metadata', function() {
        before(function(done) {
            fs.mkdir('tmp/metadata/a')
            .then(function() {
                return fs.mkdir('tmp/metadata/b');
            })
            .then(function() {
                return fs.mkdir('tmp/metadata/c');
            })
            .then(function() {
                return when.all([
                    fs.writeFile('tmp/metadata/d.js', 'd.js'),
                ]);
            })
            .done(function() {
                done();
            }, done);
        });

        it('should file metadata ok', function(done) {
            fs.metadata('tmp/metadata/d.js', function(err, metadata) {
                should(err).not.be.an.Error;
                should(metadata).have.property('name', 'd.js');
                should(metadata).have.property('is_dir', false);
                should(metadata).have.property('size', 4);
                should(metadata).have.property('time');
                should(metadata).be.an.Date;
                done();
            });
        });

        it('should metadata of none exist dir fail', function(done) {
            fs.metadata('none_exists', function(err, metadata) {
                should(err).be.an.Error;
                should(err).have.property('code', 'ENOENT');
                should(metadata).not.be.ok;
                done();
            });
        });
    });

    describe('list', function() {
        before(function(done) {
            fs.mkdir('tmp/list/a')
            .then(function() {
                return fs.mkdir('tmp/list/b');
            })
            .then(function() {
                return fs.mkdir('tmp/list/c');
            })
            .then(function() {
                return when.all([
                    fs.writeFile('tmp/list/d.js', 'd.js'),
                    fs.writeFile('tmp/list/c/e.js', 'e.js'),
                    fs.writeFile('tmp/list/c/f.js', 'f.js'),                
                ])
            })
            .done(function() {
                done();
            }, done);
        });

        it('should list ok', function(done) {
            fs.list('tmp/list', function(err, list) {
                should(err).not.be.ok;
                should(list).be.an.Array;
                should(list.map(function(info) {return info.name;})).eql(['a', 'b', 'c', 'd.js']);
                done();
            });
        });

        it('should deep list ok', function(done) {
            fs.list('tmp/list/c', function(err, list) {
                should(err).not.be.ok;
                should(list).be.an.Array;
                should(list.map(function(info) {return info.name;})).eql(['e.js', 'f.js']);
                done();
            });
        });
    });

    
    describe('glob', function() {
        before(function(done) {
            fs.mkdir('tmp/glob/test')
            .then(function() {
                return when.all([
                    fs.writeFile('tmp/glob/a.js', 'a.js'),
                    fs.writeFile('tmp/glob/b.js', 'b.js'),
                    fs.writeFile('tmp/glob/c.js', 'c.js'),
                    fs.writeFile('tmp/glob/d.css', 'd.css'),
                    fs.writeFile('tmp/glob/test/e.js', 'e.js'),
                    fs.writeFile('tmp/glob/test/f.png', 'f.png'),
                ]);
            })
            .done(function() {
                done();
            }, done);
        });

        it('should glob **/* ok', function(done) {
            fs.glob('tmp/glob/**/*.js', function(err, files) {
                should(err).not.be.ok;
                should(files).eql(['tmp/glob/a.js', 'tmp/glob/b.js', 
                    'tmp/glob/c.js', 'tmp/glob/test/e.js']);
                done();
            });
        });

        it('should glob * ok', function(done) {
            fs.glob('tmp/glob/test/*.js', function(err, files) {
                should(err).not.be.ok;
                should(files).eql(['tmp/glob/test/e.js']);
                done();
            });
        });
    });

    describe('src/dest', function() {
        before(function(done) {
            fs.mkdir('tmp/src/test')
            .then(function() {
                return when.all([
                    fs.writeFile('tmp/src/a.js', 'a.js'),
                    fs.writeFile('tmp/src/b.js', 'b.js'),
                    fs.writeFile('tmp/src/c.js', 'c.js'),
                    fs.writeFile('tmp/src/d.css', 'd.css'),
                    fs.writeFile('tmp/src/test/e.js', 'e.js'),
                    fs.writeFile('tmp/src/test/f.png', 'f.png'),
                ]);
            })
            .done(function() {
                done();
            }, done);
        });

        it('should have stat', function(done) {
            fs.src('tmp/src/a.js')
            .pipe(through.obj(function(file, enc, cb) {
                should(file.stat).have.property('size', 4);
                should(file.stat.isFile()).be.true;
                done();
            }));
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

        it('should src => dest ok', function(done) {
            var destFiles = [];
            fs.src('tmp/src/test/*.js')
            .pipe(fs.dest('tmp/dest'))
            .pipe(through.obj(function(file, enc, cb) {
                destFiles.push(file.relative);
                cb();
            }, function() {
                should(destFiles.sort()).eql(['e.js'].sort());
                done();
            }));
        })
    });
};