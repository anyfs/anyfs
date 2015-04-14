'use strict';
var when = require('when');
var sequence = require('when/sequence');
var parallel = require('when/parallel');
var should = require('should');
var through = require('through2');

module.exports = function(fs) {
    var plugins = fs.getPlugins();
    for (var i = 0; i < plugins.length; i++) {
        if (plugins[i].test) {
            plugins[i].test(fs);
        }
    }
};