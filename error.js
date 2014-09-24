'use strict';

var inherits = require('util').inherits;

function AnyFSError(message, code) {
    message = message || '';
    if (code in CODE_MESSAGES) {
        message = message?(': ' + message):'';
        message = code + ', ' + CODE_MESSAGES[code] + message;
    }
    this.name = 'AnyFSError';
    this.message = message;
    this.code = code;
}

AnyFSError.NotImplementedError = function(method) {
    this.name = 'AnyFS.NotImplementedError';
    this.message = 'AnyFS: ' + method + ' not implemented';
};

inherits(AnyFSError, Error);

inherits(AnyFSError.NotImplementedError, AnyFSError);

module.exports = AnyFSError;