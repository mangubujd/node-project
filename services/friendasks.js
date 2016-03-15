'use strict'
var Promise = require('bluebird');
var Friendasks = Promise.promisifyAll(require('../database/friendasks'));

exports.find = function(query) {
    return Friendasks.findAsync(query);
};

exports.findOneByQuery = function(query) {
    return Friendasks.findOneAsync(query);
};

exports.create = function(friendask) {
    return Friendasks.createAsync(friendask);
};

exports.deleteAll = function() {
    return Friendasks.removeAsync();
};

exports.updateSongByStatus = function(friendaskId, friendaskToUpdate) {// return Songs.updateAsync({_id: songId}, songToUpdate); // updates but doesn't return updated document
    return Friendasks.findOneAndUpdateAsync({id_asker: friendaskId}, {id_receiver: friendaskToUpdate } ,{name: {status: '1', last: '0'}}, {new: true}); // https://github.com/Automattic/mongoose/issues/2756
};

