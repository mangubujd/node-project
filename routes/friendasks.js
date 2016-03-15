var _ = require('lodash');
var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var FriendasksService = require('../services/friendasks');
var UserService = require('../services/users');


router.post('/', function(req, res) {
    var friendID = req.body.id_receiver;
    FriendasksService.create(req.body)
        .then(function(friendask) {
            if (req.accepts('text/html')) {
                UserService.findOneByQuery({_id: friendID})
                    .then(function (friend) {
                        if (!friend) {
                            res.status(404).send({err: 'No user found with id' + friendID});
                            return;
                        }
                        return res.render('friendask', {'friend': friend});
                    });
            }
            if (req.accepts('application/json')) {
                return res.status(200);
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.get('/:id', function(req, res) {
    if (req.accepts('text/html') || req.accepts('application/json')) {
        FriendasksService.findOneByQuery({_id: req.params.id})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + req.params.id});
                    return;
                }
                if (req.accepts('text/html')) {
                    return res.render('song', {song: song});
                }
                if (req.accepts('application/json')) {
                    return res.send(200, song);
                }
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

module.exports = router;