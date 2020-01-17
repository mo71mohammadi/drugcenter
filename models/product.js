const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = new mongoose.Schema({
    eRx: {type: String, required: true},
    // generic: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'generics'
    // },
    packageCode: {type: String, required: true},
    bbCode: {type: String},
    enBrandName: {type: String},
    faBrandName: {type: String},
    enBrandGeneric: {type: String},
    faBrandGeneric: {type: String},
    indexName: {type: String},
    packageType: {type: String},
    packageCount: {type: Number},
    packageFlavor: {type: String},
    packageUrgent: {type: Boolean},
    gtn: [{type: Number}],
    irc: [{type: Number}],
    // price: [
    //     {
    //         ValidityDate: {type: String},
    //         supplierPrice: {type: String},
    //         distributerPrice: {type: String},
    //         consumerPrice: {type: String},
    //         status: {type: Boolean},
    //     }
    // ],
    atc: {
        enL1: {type: String, required: false},
        faL1: {type: String, required: false},
        enL2: {type: String, required: false},
        faL2: {type: String, required: false},
        enL3: {type: String, required: false},
        faL3: {type: String, required: false},
        enL4: {type: String, required: false},
        faL4: {type: String, required: false},
        enL5: {type: String, required: false},
        faL5: {type: String, required: false},
        DDD: {type: String, required: false},
        },
    nativeIRC: {type: String},
    // brandMolSimilarity: {type: String},
    licenseOwner: {type: String},
    brandOwner: {type: String},
    countryBrandOwner: {type: String},
    countryProducer: {type: String},
    producer: {type: String},
    trader: {type: String},
    conversationalName: {type: String},
    // enBrandPiece: {type: String},
    // faBrandPiece: {type: String},
    image: [{type: String}]
});

productSchema.index({
    "data.eRx": 1,
    "data.packageCode": 1
}, {unique: true});

productSchema.plugin(uniqueValidator);
module.exports = mongoose.model('products', productSchema);