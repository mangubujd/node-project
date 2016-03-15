'use strict'
var Promise = require('bluebird');
var Users = Promise.promisifyAll(require('../database/users'));


exports.find = function(query) {
    return Users.findAsync(query);
};

exports.findOneByQuery = function(query) {
    return Users.findOneAsync(query);
};

exports.createUser = function(user) {
    return Users.createAsync(user);
};

exports.updateUserById = function(userId, userToUpdate) {
    // return Songs.updateAsync({_id: songId}, songToUpdate); // updates but doesn't return updated document
    return Users.findOneAndUpdateAsync({_id: userId}, userToUpdate, {new: true}); // https://github.com/Automattic/mongoose/issues/2756
};


exports.addSongToFavorites = function(user_id, song_id){
    return Users.findOneAndUpdateAsync({_id: user_id}, {$push: {favoriteSongs: song_id}}, {new: true}
    );
};

exports.removeSongToFavorites = function(user_id, song_id){
    return Users.findOneAndUpdateAsync({_id: user_id}, {$pop: {favoriteSongs: song_id}}, {new: true}
    );
};

exports.removeSongsToFavorites = function(user_id){
    return Users.findOneAndUpdateAsync({_id: user_id}, {favoriteSongs: []}
    );
};
