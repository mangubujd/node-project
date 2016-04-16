var express = require('express');
var _ = require('lodash');
var router = express.Router();
var SongService = require('../services/songs');
var ScoreService = require('../services/scores');

//ADMIN VERIFICATION
var verifyIsAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.username === 'admin') {
        return next();
    }
    else {
        res.status(403).send({err: 'You can not access to this section' });
    }
}

router.get('/', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        var queryParams = {};
        if(Object.keys(req.query).length !== 0 && JSON.stringify(req.query) !== JSON.stringify({})){
            // En utilisant lodash t'aurais pu écrire cette validation comme ça
            // if (!_.isEmpty(req.query))
            queryParams[req.query.selection] = req.query.value;
        }
        SongService.find(queryParams || {})
            .then(function(songs) {
                if (req.accepts('text/html')) {
                    return res.render('songs', {songs: songs, nbSongs: songs.length});
                }
                if (req.accepts('application/json')) {
                    res.status(200).send(songs);
                }
            });
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/add', function(req, res) {
    var song = (req.session.song) ? req.session.song : {};
    var err = (req.session.err) ? req.session.err : null;
    if (req.accepts('text/html')) {
        req.session.song = null;
        req.session.err = null;
        return res.render('newSong', {song: song, err: err});
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/:id', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        var songID = req.params.id;
        SongService.findOneByQuery({_id: songID})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + songID});
                    return;
                }
                ScoreService.findOneByQuery({ id_scorer: req.user._id, id_song: song._id})
                    .then(function(score){
                        var isFavorite = false;
                        if(req.user.favoriteSongs.indexOf(songID) != -1){
                            // malheuresement dans la route où tu rajoute les favorites tu ne mets pas à jour
                            // req.user.favoritesSongs, donc la vue ne se mets pas à jour après la selection d'une chanson
                            // on est obligé de se deconnecter et reconnecter pour que le bouton change à RMV FAV
                            isFavorite = true
                        }
                        if (req.accepts('text/html')) {
                            return res.render('song', {song: song, score: score, isFavorite: isFavorite});
                        }
                        if (req.accepts('application/json')) {
                            var reponse = {
                                song: song,
                                score: score,
                                isFavorite : isFavorite
                            };
                            return res.send(200, reponse);
                        }
                        // good !
                    });
            })
            .catch(function(err) {
                console.log(err);
                res.status(500).send(err);
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.get('/artist/:artist', function(req, res) {
    SongService.find({artist: {$regex: req.params.artist, $options: 'i'}})
        .then(function(songs) {
            res.status(200).send(songs);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        })
    ;
});

var songBodyVerification = function(req, res, next) {
    var attributes = _.keys(req.body);
    var mandatoryAttributes = ['title', 'album', 'artist'];
    var missingAttributes = _.difference(mandatoryAttributes, attributes);
    if (missingAttributes.length) {
        res.status(400).send({err: missingAttributes.toString()});
    }
    else {
        if (req.body.title && req.body.album && req.body.artist) {
            next();
        }
        else {
            var error = mandatoryAttributes.toString() + ' are mandatory';
            if (req.accepts('text/html')) {
                req.session.err = error;
                req.session.song = req.body;
                res.redirect('/songs/add');
            }
            else {
                res.status(400).send({err: error});
            }
        }
    }
};

router.post('/', verifyIsAdmin, songBodyVerification, function(req, res) {
    SongService.create(req.body)
        .then(function(song) {
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song._id);
            }
            if (req.accepts('application/json')) {
                return res.status(201).send(song);
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.delete('/', verifyIsAdmin, function(req, res) {
    SongService.deleteAll()
        .then(function(songs) {
            res.status(200).send(songs);
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.get('/edit/:id', verifyIsAdmin, function(req, res) {
    var song = (req.session.song) ? req.session.song : {};
    var err = (req.session.err) ? req.session.err : null;
    if (req.accepts('text/html')) {
        SongService.findOneByQuery({_id: req.params.id})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + req.params.id});
                    return;
                }
                return res.render('editSong', {song: song, err: err});
            })
        ;
    }
    else {
        res.status(406).send({err: 'Not valid type for asked ressource'});
    }
});

router.put('/:id', verifyIsAdmin, function(req, res) {
    SongService.updateSongById(req.params.id, req.body)
        .then(function (song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + req.params.id});
                return;
            }
            if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song._id);
            }
            if (req.accepts('application/json')) {
                res.status(200).send(song);
            }
        })
        .catch(function (err) {
            res.status(500).send(err);
        })
    ;
});

router.delete('/:id', verifyIsAdmin, function(req, res) {
    SongService.removeAsync({_id: req.params.id})
        .then(function() {
            res.status(204);
            // Attention, t'as pas mis de send, du coup on tombe dans un timeout ici
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.post('/:id/score', function(req, res) {
    SongService.findOneByQuery({_id: req.params.id})
        .then(function(song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + req.params.id});
                return;
            }
            var newScore = {id_scorer: req.user._id, id_song: song._id};

            ScoreService.findOneByQuery(newScore)
                .then(function(score) {
                    if (score) {
                        res.status(403).send();
                        // Il manque un message plus clair dans le send pour indique c'est quoi exactement le problème
                        // et en plus, 403 n'est pas exactement le bon code à utiliser mais plutôt 409 Conflict
                        return;
                    }
                    newScore.score = req.body.score;
                    ScoreService.create(newScore)
                        .then(function() {
                            return res.redirect('/songs/' + song._id);
                        })
                        .catch(function(err) {
                            res.status(500).send(err);
                        });
                })
                .catch(function(err) {
                    res.status(500).send(err);
                });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
});

module.exports = router;
