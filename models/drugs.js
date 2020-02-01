const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const drugSchema = new mongoose.Schema({
    eRx: {type: String, required: true},
    packageCode: {type: String, required: true},
    packageCount: {type: Number},
    packageType: {type: String},
    genericCode: {type: Number, required: true},
    enBrandName: {type: String},
    faBrandName: {type: String},
    category: {type: String},
    atc: [{
        code: {type: String},
        ddd: {type: String}
    }],
    edl: {type: Boolean},
    gtn: [{type: String}],
    irc: [{type: String}],
    sPrice: {type: String},
    cPrice: {type: String},
    dPrice: {type: String},
    priceHistory: [
        {
            validityDate: {type: String},
            supplierPrice: {type: String},
            distributorPrice: {type: String},
            consumerPrice: {type: String},
        }
    ],
    nativeIRC: {type: String},
    licenseOwner: {type: String},
    brandOwner: {type: String},
    countryBrandOwner: {type: String},
    countryProducer: {type: String},
    producer: {type: String},
    conversationalName: {type: String},
    enName: {type: String},
    faName: {type: String},
    strength: {type: String},
    volume: {type: Number},
    enForm: {type: String},
    faForm: {type: String},
    enRoute: {type: String},
    faRoute: {type: String},
    medScapeId: {type: String},
    upToDateId: {type: String},
});

drugSchema.index({
    eRx: 1,
    packageCode: 1
}, {unique: true});

drugSchema.plugin(uniqueValidator);
module.exports = mongoose.model('drug', drugSchema);