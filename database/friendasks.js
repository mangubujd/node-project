'use strict'
var mongoose = require('mongoose');

var friendasksSchema = mongoose.Schema({
    id_asker: {type: String, required: true},
    id_receiver: {type: String, required: true},
    status: {type: Number, required: true},
});

module.exports = mongoose.model('friendask', friendasksSchema);