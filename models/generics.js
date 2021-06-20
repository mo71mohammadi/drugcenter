const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const genericSchema = new mongoose.Schema({
    genericCode: {type: Number},
    eRx: {type: Number},
    enGenericName: {type: String},
    oldGenericName: {type: String},
    faGenericName: {type: String},
    referenceId: {type: String},
    active: {type: Boolean},
    edl: {type: Boolean, required: false},
    idl: {type: Number, required: false},
    category: {type: String},
    molecule: [{type: String}],
    enName: {type: String},
    oldEnForm: {type: String},
    faName: {type: String},
    strength: {type: String},
    str: {type: String},
    enForm: {type: String},
    faForm: {type: String},
    enRoute: {type: String},
    faRoute: {type: String},
    measure: {type: String},
    volume: {type: String},
    atc: [{
        code: {type: String},
        ddd: {type: String}
    }],
    genericNames: [{
        enName: String,
        faName: String
    }],
    temperature: {type: String, required: false},
    medScapeId: {type: Number, required: false},
    upToDateId: {type: Number, required: false},
    properties: [{
        key: String,
        value: String
    }],
    update: [{
        date: Date,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
    }],
    delete: {type: Boolean},
    isHospital: {type: Boolean},
    otc: {type: Boolean},
});

// genericSchema.plugin(uniqueValidator);
module.exports = mongoose.model('generic', genericSchema);