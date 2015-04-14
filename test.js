var AnyFS = require('./');
var test = AnyFS.test;
var adapter = new AnyFS.MemoryAdapter();

var fs = new AnyFS(adapter);
test(fs);