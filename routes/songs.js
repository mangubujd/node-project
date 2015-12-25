var express = require('express');
var router = express.Router();
var SongService = require('../services/songs');

router.get('/', function(req, res) {
    SongService.findAll()
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

module.exports = router;