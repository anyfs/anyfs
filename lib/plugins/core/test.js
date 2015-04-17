'use strict';

var when = require('when');
var sequence = require('when/sequence');
var parallel = require('when/parallel');
var should = require('should');

module.exports = function(fs, options) {
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

    describe('core', function() {
        before(function(done) {
            setTimeout(function() {
                fs.mkdir('tmp', done);
            }, options.delay?options.delay:0);
        });

        after(function(done) {
            fs.deleteDir('tmp', done);
        });


        describe('mkdir', function() {
            before(function(done) {
                fs.writeFile('tmp/mkdirfile', 'a', done);
            });

            it('should mkdir ok', function(done) {
                fs.mkdir('tmp/mkdir', function(err) {
                    should(err).not.be.ok;
                    shouldDirectoryExist('tmp/mkdir', done);
                });
            });

            it('should mkdir fail on exist file', function(done) {
                fs.mkdir('tmp/mkdirfile', function(err) {
                    should(err).be.an.Error;
                    should(err).have.property('code', 'EEXIST');
                    done();
                })
            });
        });

        describe('delete file', function() {
            before(function(done) {
                fs.writeFile('tmp/delete/file.txt', 'file.txt', done);
            });

            fs.adapter.features.DELETE_IGNORE_EMPTY || it('should delete none exist file fail', function(done) {
                fs.delete('tmp/delete/none_exists', function(err) {
                    should(err).be.an.Error;
                    should(err).have.property('code', 'ENOENT');
                    done();
                });
            });

            it('should delete file ok', function(done) {
                fs.delete('tmp/delete/file.txt', function(err) {
                    should(err).not.be.ok;
                    shouldNotExist('tmp/delete/file.txt', done);
                });
            });

        });

        describe('delete directory', function() {
            before(function(done) {
                fs.mkdir('tmp/deleteDir/dir1')
                .then(function() {
                    return fs.mkdir('tmp/deleteDir/dir2')
                })
                .done(function() {
                    done();
                }, done);
            });

            fs.adapter.features.DELETE_IGNORE_EMPTY || it('should delete none exist directory fail', function(done) {
                fs.delete('tmp/deleteDir/none_exists', function(err) {
                    should(err).be.an.Error;
                    should(err).have.property('code', 'ENOENT');
                    done();
                });
            });


            it('should delete directory OK', function(done) {
                fs.deleteDir('tmp/deleteDir/dir1', function(err) {
                    should(err).not.be.ok;
                    shouldNotExist('tmp/deleteDir/dir1', done);
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

            it('should new path not exist', function(done) {
                fs.move('tmp/move/file1', 'tmp/move/file', function(err) {
                    should(err).be.an.Error; 
                    should(err).have.property('code', 'EEXIST');
                    done();
                });
            });
            
            it('should old path exist', function(done) {
                fs.move('tmp/move/none_exists', 'tmp/move/none_exists1', function(err) {
                    should(err).be.an.Error;
                    should(err).have.property('code', 'ENOENT');
                    done();
                });
            });

            it('should move file ok', function(done) {
                fs.move('tmp/move/file2', 'tmp/move/file22', function(err) {
                    should(err).not.be.ok;
                    shouldFileExist('tmp/move/file22', done);
                });
            });

            it('should move dir ok', function(done) {
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
    });
}