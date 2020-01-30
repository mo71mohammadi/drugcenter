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
    atcCode: {type: String, required: false,},
    ddd:  {type: String, required: false,},
    edl: {type: Boolean, required: false},
    // atc: {
    //     enL1: {type: String, required: false},
    //     faL1: {type: String, required: false},
    //     enL2: {type: String, required: false},
    //     faL2: {type: String, required: false},
    //     enL3: {type: String, required: false},
    //     faL3: {type: String, required: false},
    //     enL4: {type: String, required: false},
    //     faL4: {type: String, required: false},
    //     enL5: {type: String, required: false},
    //     faL5: {type: String, required: false},
    // },
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
    // trader: {type: String},
    conversationalName: {type: String},
    enName: {type: String, required: false},
    faName: {type: String, required: false},
    strength: {type: String, required: false},
    // measure: {type: String, required: false},
    volume: {type: Number, required: false},
    // dose: {type: String, required: false},
    enForm: {type: String, required: false},
    faForm: {type: String, required: false},
    enRoute: {type: String, required: false},
    faRoute: {type: String, required: false},
    medScapeId: {type: String, required: false},
    upToDateId: {type: String, required: false},
});

drugSchema.index({
    eRx: 1,
    packageCode: 1
}, {unique: true});

drugSchema.plugin(uniqueValidator);
module.exports = mongoose.model('drug', drugSchema);