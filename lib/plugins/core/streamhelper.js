'use strict';
var util = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var PassThrough = require('stream').PassThrough;

function fixReadStream() {
    var args = Array.prototype.slice.call(arguments);
    var pt = PassThrough();

    function cb(err, rs) {
        if (err) {
            pt.emit('error', err);
        } else {
            rs.pipe(pt);
        }
    }

    args.push(cb);

    var creator = args.shift();

    var context = null;
    if (util.isArray(creator)) {
        context = creator[0];
        creator = creator[1];
    }

    var result = creator.apply(context, args);
    if (result instanceof Readable) {
        return result;
    }

    return pt;
}

function fixWriteStream() {
    var args = Array.prototype.slice.call(arguments);
    args.push(cb);

    var creator = args.shift();

    var context = null;
    if (util.isArray(creator)) {
        context = creator[0];
        creator = creator[1];
    }

    var pt = PassThrough();

    var result = creator.apply(context, args);
    if (result instanceof Writable) {
        return result;
    }

    function cb(err, ws) {
        if (err) {
            pt.emit('error', err);
        } else {
            pt.pipe()
            ws.pipe(pt);
        }
    }

    return pt;
}

module.exports = {
    fixReadStream: fixReadStream,
    fixWriteStream: fixWriteStream,
};