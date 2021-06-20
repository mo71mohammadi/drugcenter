const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const genericSchema = new mongoose.Schema({
    group: {type: String},
    drug: {
        // category: {type: String},
        genericCode: {type: String, unique:true, required: false},
        // molecule: [
        //     {
        //         name: {type: String, required: false},
        //         salt: {type: String, required: false},
        //         casNum: {type: String, required: false},
        //         description: {type: String, required: false},
        //         structure: {type: String, required: false},
        //         weight: {type: String, required: false},
        //         chemicalFormula: {type: String, required: false},
        //         dose: {type: String, required: false},
        //     }
        // ],
        // enNewGeneric: {type: String, required: false},
        // faNewGeneric: {type: String, required: false},
        // enBehGeneric: {type: String, required: false},
        // faBehGeneric: {type: String, required: false},
        idl: {type: Number, required: false},
        idSet: {type: String, required: false},
        edl: {type: Boolean, required: false},
        atcCode: {type: String, required: false,},
        ddd:  {type: String, required: false,},
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
        //     DDD: {
        //         admRoute: {type: String, required: false},
        //         unit: {type: String, required: false},
        //         dose: {type: String, required: false},
        //     },
        // },
        enName: {type: String, required: false},
        faName: {type: String, required: false},
        strength: {type: String, required: false},
        measure: {type: String, required: false},
        volume: {type: String, required: false},
        dose: {type: String, required: false},
        enForm: {type: String, required: false},
        faForm: {type: String, required: false},
        enRoute: {type: String, required: false},
        faRoute: {type: String, required: false},
        uses: {
            adult: {type: String},
            pediatric: {type: String},
            geriatric: {type: String},
        },
        pregnancy: {type: String},
        adverseEffects: {type: String},
        warnings: {type: String},
        pharmacology: {
            mechanism: {type: String},
            pharmacokinetics: {type: String},
        },
        medScapeId: {type: Number, required: false},
        upToDateId: {type: Number, required: false},
    },
});

genericSchema.plugin(uniqueValidator);
module.exports = mongoose.model('generics', genericSchema);