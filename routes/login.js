'use strict'

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.accepts('text/html')) {
        res.render('login');
    }
    else {
        res.send(406, {err: 'Not valid type for asked ressource'});
    }
});

module.exports = router;