const mongoose = require("mongoose");

const insuranceSchema = new mongoose.Schema({
    generic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "generic",
        unique: true,
        null: true
    },

    insuranceType: {type: Number, required: true},
    // active: {type: Boolean, required: true},

    genericCode: {type: Number, required: true},
    genericName: {type: String},
    isInsurance: {type: Boolean},
    isHospital: {type: Boolean},
    maxPrescription: {type: String},
    isWeb: {type: Boolean},
    isBarcode: {type: Boolean},
    maxPrice: {type: Number},
    percentOrganize: {type: Number},

    special: [{type: Number}],

    // تامین اجتماعی
    isPresence: {type: Boolean},
    isDossier: {type: Boolean},
    isEvidence: {type: Boolean},
    maxAge: {type: Number},
    drugType: {type: String},

    // نیروهای مسلح
    isDrugstoreConfirm: {type: Boolean},
    recipient: {type: String},
    isHospitalSazman: {type: Boolean},
    serviceGroup: {
        base: {},
        complementary: {}
    }
});

module.exports = mongoose.model('insurance', insuranceSchema);