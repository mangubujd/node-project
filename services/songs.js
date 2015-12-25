'use strict'
var Promise = require('bluebird');
var Songs = Promise.promisifyAll(require('../database/songs'));

exports.findAll = function() {
    return Songs.findAsync();
};

exports.findOneByQuery = function(query) {
    return Songs.findOneAsync(query);
};