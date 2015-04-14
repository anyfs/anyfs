var AnyFS = require('./lib/anyfs');
AnyFS.MemoryAdapter = require('./lib/adapters/memory');
AnyFS.test = require('./lib/test');

module.exports = AnyFS;