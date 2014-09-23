'use strict';
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

AnyFSError.prototype = Error.prototype;

// refer to http://www.virtsync.com/c-error-codes-include-errno or "/usr/include/asm-generic/errno-base.h" and "/usr/include/asm-generic/errno.h"
// for details
var CODE_MESSAGES = {
    EPERM: 'operation not permitted',
    ENOENT: 'no such file or directory',
    ESRCH: 'no such process',
    EINTR: 'interrupted system call',
    EIO: 'I/O error',
    ENXIO: 'no such device or address',
    E2BIG: 'argument list too long',
    ENOEXEC: 'exec format error',
    EBADF: 'bad file number',
    ECHILD:   'no child processes',
    EAGAIN:   'try again',
    ENOMEM:   'out of memory',
    EACCES:   'permission denied',
    EFAULT:   'bad address',
    ENOTBLK:   'block device required',
    EBUSY:   'device or resource busy',
    EEXIST:   'file exists',
    EXDEV:   'cross-device link',
    ENODEV:   'no such device',
    ENOTDIR:   'not a directory',
    EISDIR:   'is a directory',
    EINVAL:   'invalid argument',
    ENFILE:   'file table overflow',
    EMFILE:   'too many open files',
    ENOTTY:   'not a typewriter',
    ETXTBSY:   'text file busy',
    EFBIG:   'file too large',
    ENOSPC:   'no space left on device',
    ESPIPE:   'illegal seek',
    EROFS:   'read-only file system',
    EMLINK:   'too many links',
    EPIPE:   'broken pipe',
    EDOM:   'math argument out of domain of func',
    ERANGE:   'math result not representable',

    ENOTEMPTY: 'directory not empty',
};

module.exports = AnyFSError;