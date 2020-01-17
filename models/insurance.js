const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
    genericCode: {type: Number, required: true},
    insurance: {
        inTa: {
            code: {},
            name: {},
            isInsurance: {},
            isHospital: {},
            isPresence: {},
            isDossier: {},
            maxAge: {},
            maxPrescription: {},
            isWeb: {},
            isBarcode: {},
            isEvidence: {},
            type: {},
            maxPrice: {},
            percentOrganize: {},
            specialRel: [
                {
                    specialId: {},
                    name: {},
                    status: {},
                    statusDate: {},
                }
            ]
        },
        inMo: {
            code: {},
            name: {},
            brandName: {},
            isInsurance: {},
            isHospital: {},
            isMama: {},
            isPhysician: {},
            maxPrescription: {},
            maxPrice: {},
            isBarcode: {},
            isDrugStore: {},
            isHospitalOrganize: {},
            receiver: {},
            isConfirm: {},
            percentOrganize: {},
            influencedDate: {},
        },
        inSa: {
            code:{},
            name:{},
            isHospital:{},
            hospitalCondition:{},
            isDossier:{},
            isInternal:{},
            midwifery:{},
            age:{},
            maxPrescription:{},
            isBarcode:{},
            specialInGeneral:[{type: Number}],
            specialInHospital:[{type: Number}],
            percentOrganize:{},
        }
    }
});

module.exports = mongoose.model('insurances', priceSchema);