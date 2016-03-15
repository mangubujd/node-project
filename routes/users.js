var express = require('express');
var router = express.Router();
var UsersService = require('../services/users');
var SongService  = require('../services/songs');


var verifyIsAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.username === 'admin') {
        return next();
    }
    else {
        res.status(403).send({err: 'Current user can not access to this operation'});
    }
};

router.get('/:id', function (req, res, next) {
    var user_id = req.params.id;
    UsersService.findOneByQuery({_id: user_id})
        .then(function(user){
            if (!user) {
                res.status(404).send({err: 'No user found with id' + user_id});
                return;
            }
            SongService.find({_id: { $in: user.favoriteSongs}})
                .then(function(songs){
                    if (req.accepts('text/html')) {
                        return res.render('user', {profileUser: user, favoriteSongs: songs});
                    }
                    if (req.accepts('application/json')) {
                        var resp = {};
                        resp['user'] = user;
                        resp['songs'] = songs;
                        return res.status(200).send(resp);
                    }
                });
        });
});


router.get('/', function (req, res, next) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        var queryParams = {};
        if(Object.keys(req.query).length !== 0 && JSON.stringify(req.query) !== JSON.stringify({})){
            queryParams[req.query.selection] = req.query.value;
        }
        UsersService.find(queryParams || {})
            .then(function(users){
                if (req.accepts('text/html')) {
                    return res.render('users', {users: users, nbUsers: users.length});
                }
                if (req.accepts('application/json')) {
                    return res.status(200).send(users);
                }
            });
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.put('/songs/favorites', function (req, res) {
    var song_id = req.body.song_id;
    UsersService.addSongToFavorites(req.user._id, song_id)
        .then(function (song) {
            if (!song) {
                return res.status(404).send({err: 'No song found with id' + song_id});
            }
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song_id);
            }
            if (req.accepts('application/json')) {
                return res.status(200);
            }
        })
        .catch(function (err) {
            return res.status(500).send(err);
        })
    ;
});

router.delete('/song/favorites/remove', function (req, res) {
    var song_id = req.body.song_id;
    UsersService.removeSongToFavorites(req.user._id, song_id)
        .then(function (song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + song_id});
                return;
            }
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song_id);
            }
            if (req.accepts('application/json')) {
                return res.status(200);
            }
        })
        .catch(function (err) {
            return res.status(500).send(err);
        });
});



router.delete('/songs/favorites/remove', function (req, res) {

    UsersService.removeSongsToFavorites(req.user._id)
        .then(function () {
            if (req.accepts('text/html')) {
                return res.redirect('/users/' + req.user._id);
            }
            if (req.accepts('application/json')) {
                return res.status(200);
            }
        })
        .catch(function (err) {
            return res.status(500).send(err);
        });
});


module.exports = router;
