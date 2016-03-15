'use strict'
var Promise = require('bluebird');
var Scores = Promise.promisifyAll(require('../database/score'));

exports.findOneByQuery = function(query) {
    return Scores.findOneAsync(query);
};

exports.create = function(score) {
    return Scores.createAsync(score);

};