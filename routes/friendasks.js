var _ = require('lodash');
var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var FriendasksService = require('../services/friendasks');
var UserService = require('../services/users');


router.post('/', function(req, res) {
    var friendID = req.body.id_receiver;
    FriendasksService.create(req.body)
    // une petite validation du body serait pas mal...
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
                // Attention, 1. t'es en train de créer un friend request, donc status:201 et 2, pas de send donc timeout !!!
            }
        })
        .catch(function(err) {
            res.status(500).send(err);
        })
    ;
});

router.get('/:id', function(req, res) {
    // Ce dommage que cette URL n'est pas accessible depuis la vue... je sais pas exactement ce que tu voulais faire
    // les friendRequests sont bien crées et stockés en base, par contre elles ne sont pas affichées chez son destinataire
    // ni il y a un moyen pour les accepter ou refuser
    if (req.accepts('text/html') || req.accepts('application/json')) {
        FriendasksService.findOneByQuery({_id: req.params.id})
            .then(function(song) {
                if (!song) {
                    res.status(404).send({err: 'No song found with id' + req.params.id});
                    return;
                }
                if (req.accepts('text/html')) {
                    return res.render('song', {song: song});
                    // song ?? Normalement tu devrais l'afficher dans la page de l'user en session
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