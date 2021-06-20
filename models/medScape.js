const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const medScapeSchema = new mongoose.Schema({
    drugId: {type: Number, unique: true, required: true},
    eRx: [{type: String}],
    interactions: [{
        id: {type: Number, required: true},
        subject: {type: String, required: true},
        object: {type: String, required: true},
        text: {type: String, required: true},
        severityId: {type: Number},
        severity: {type: String, required: true}
    }],
});

medScapeSchema.plugin(uniqueValidator);
module.exports = mongoose.model('medscape', medScapeSchema);