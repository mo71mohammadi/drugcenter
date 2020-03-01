const mongoose = require("mongoose");

const insuranceSchema = new mongoose.Schema({
    insuranceType: { type: Number, required: true },
    active: {type: Boolean, required: true},
    genericCode: { type: Number, required: true },
    genericName: {},
    isInsurance: { type: Boolean },
    isHospital: { type: Boolean },
    maxPrescription: { type: String },
    isWeb: { type: Boolean },
    isBarcode: { type: Boolean },
    maxPrice: {},
    percentOrganize: {},
    special: [{ type: Number }],

    // تامین اجتماعی
    isPresence: { type: Boolean },
    isDossier: { type: Boolean },
    isEvidence: { type: Boolean },
    maxAge: { type: Number },
    type: {},

    // نیروهای مسلح
    isDrugstoreConfirm: { type: Boolean },
    recipient: { type: String },
    isHospitalSazman: { type: Boolean }

    // insurance: {
    //     inTa: {
    //         code: {},
    //         name: {},
    //         isInsurance: {},
    //         isHospital: {},
    //         isPresence: {},
    //         isDossier: {},
    //         maxAge: {},
    //         maxPrescription: {},
    //         isWeb: {},
    //         isBarcode: {},
    //         isEvidence: {},
    //         type: {},
    //         maxPrice: {},
    //         percentOrganize: {},
    //         specialRel: [{type: Number}]
    //     },
    //     inMo: {
    //         code: {},
    //         name: {},
    //         brandName: {},
    //         isInsurance: {},
    //         isHospital: {},
    //         isMama: {},
    //         isPhysician: {},
    //         maxPrescription: {},
    //         maxPrice: {},
    //         isBarcode: {},
    //         isDrugStore: {},
    //         isHospitalOrganize: {},
    //         receiver: {},
    //         isConfirm: {},
    //         percentOrganize: {},
    //         influencedDate: {},
    //     },
    //     inSa: {
    //         code:{},
    //         name:{},
    //         isHospital:{},
    //         hospitalCondition:{},
    //         isDossier:{},
    //         isInternal:{},
    //         midwifery:{},
    //         age:{},
    //         maxPrescription:{},
    //         isBarcode:{},
    //         specialInGeneral:[{type: Number}],
    //         specialInHospital:[{type: Number}],
    //         percentOrganize:{},
    //     }
    // }
});

module.exports = mongoose.model('insurance', insuranceSchema);