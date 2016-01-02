var express = require('express');
var _ = require('lodash');
var router = express.Router();
var SongService = require('../services/songs');

router.get('/', function(req, res) {
    SongService.find(req.query || {})
        .then(function(songs) {
            res.status(200).send(songs);
        })
    ;
});

router.get('/:id', function(req, res) {
    SongService.findOneByQuery({_id: req.params.id})
        .then(function(song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + req.params.id});
                return;
            }
            res.status(200).send(song);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        })
    ;
});

var songBodyVerification = function(body) {
    var attributes = _.keys(body);
    var mandatoryAttributes = ['title', 'album', 'artist'];
    var missingAttributes = _.difference(mandatoryAttributes, attributes);
    if (!missingAttributes.length) {
        return;
    }
    return missingAttributes.toString();
};

router.post('/', function(req, res) {
    var missingAttributes = songBodyVerification(req.body);
    if (!missingAttributes) {
        SongService.create(req.body)
            .then(function(song) {
                res.status(201).send(song);
            })
            .catch(function(err) {
                res.status(500).send(err);
            })
        ;
    }
    else {
        res.status(400).send({err: missingAttributes});
    }
});

router.delete('/', function(req, res) {
    SongService.deleteAll()
        .then(function(songs) {
            res.status(200).send(songs);
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.put('/:id', function(req, res) {
    SongService.updateSongById(req.params.id, req.body)
        .then(function (song) {
            if (!song) {
                res.status(404).send({err: 'No song found with id' + req.params.id});
                return;
            }
            res.status(200).send(song);
        })
        .catch(function (err) {;
            res.status(500).send(err);
        })
    ;
});

router.delete('/:id', function(req, res) {
    SongService.removeAsync({_id: req.params.id})
        .then(function() {
            res.status(204);
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

module.exports = router;