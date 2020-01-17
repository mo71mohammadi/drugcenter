const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const upToDateSchema = new mongoose.Schema({
    globalId: {type: String, unique: true, required: true},
    id: {type: Number, unique: true, required: true},
    name: {type: String, required: true},
    eRx: [{type: String}],
    generic: [{type: String}],
    gtn: [{type: String}],
    items: [{
        id: {type: Number, required: true},
        name: {type: String, required: true},
    }],
    interactions: [{type: String}],
    interactionHtmls: [{
        id: {type: String},
        riskRating: {type: String},
        text: {type: String},
    }],

});

upToDateSchema.plugin(uniqueValidator);
module.exports = mongoose.model('uptodate', upToDateSchema);