'use strict'
var mongoose = require('mongoose');

var scoreSchema = mongoose.Schema({
    id_scorer: {type: String, required: true},
    id_song: {type: String, required: true},
    score: {type: Number, required: true}
});

module.exports = mongoose.model('score', scoreSchema);